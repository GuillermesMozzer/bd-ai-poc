import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../../theme';
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  MenuItem,
  Select,
} from '@mui/material';
import {
  EditOutlined as EditIcon,
  AutoGraph as AutoLayoutIcon,
  ZoomInOutlined as ZoomInIcon,
  ZoomOutOutlined as ZoomOutIcon,
  InfoOutlined as InfoIcon,
  DevicesOutlined as WorkstationIcon,
  DeleteOutline as DeleteIcon,
  SaveOutlined as SaveIcon,
  CancelOutlined as CancelIcon,
  DragIndicatorOutlined as DragIcon,
  AccountTreeOutlined as ConnectIcon,
} from '@mui/icons-material';
import {
  buildAutoLayoutScope,
  connectionPathUpdatedEvent,
  readConnectionPathScope,
  type StoredConnectionEdge,
  type StoredConnectionNode,
  writeConnectionPathScope,
} from '../connectionPathStore';
import {ALL_WORKSTATIONS_NODE_ID, useAllWorkstationsData} from '../hooks/useAllWorkstationsData';
import {
  getWorkstationTypeMeta,
  workstationTypeOrder,
  type WorkstationType,
} from '../../workstationTypes';
import {readPublishedWorkstations, writePublishedWorkstations} from '../../publishedWorkstations';

type ConnectionPathCanvasProps = {
  nodeId: string | null;
};

const NODE_WIDTH = 190;
const NODE_HEIGHT = 76;
const EDGE_HANDLE_PADDING = 12;
const CANVAS_MIN_WIDTH = 1600;
const STORAGE_X_MIN = 12;
const STORAGE_X_MAX = 92;
const DISPLAY_X_MIN = 24;
const DISPLAY_X_MAX = 90;
const DRAG_START_THRESHOLD = 6;
const MAX_LANE_COLUMNS = 4;

type ConnectionPathFilter = 'all' | WorkstationType;

export default function ConnectionPathCanvas({nodeId}: ConnectionPathCanvasProps) {
  const contextNodeId = nodeId ?? ALL_WORKSTATIONS_NODE_ID;
  const canvasRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);
  const dragStartRef = useRef<{nodeId: string; clientX: number; clientY: number} | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(null);
  const [pendingFromId, setPendingFromId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [workstationTypeFilter, setWorkstationTypeFilter] = useState<ConnectionPathFilter>('all');
  const [version, setVersion] = useState(0);
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});
  const rafRef = useRef<number | null>(null);
  const {filteredRows: scopeRows} = useAllWorkstationsData(nodeId);

  useEffect(() => {
    const refresh = () => setVersion((current) => current + 1);
    window.addEventListener(connectionPathUpdatedEvent, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(connectionPathUpdatedEvent, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const updateCanvasSize = useCallback(() => {
    const element = canvasRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const nextWidth = Math.round(Math.max(rect.width, element.clientWidth, element.offsetWidth));
    const nextHeight = Math.round(Math.max(rect.height, element.clientHeight, element.offsetHeight));

    setCanvasSize((current) => {
      if (!nextWidth || !nextHeight) {
        return current;
      }
      if (current.width === nextWidth && current.height === nextHeight) {
        return current;
      }
      return {
        width: nextWidth,
        height: nextHeight,
      };
    });
  }, []);

  const scheduleCanvasSizeUpdate = useCallback((frameCount = 3) => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }

    let remainingFrames = Math.max(0, frameCount - 1);
    const runMeasure = () => {
      updateCanvasSize();
      if (remainingFrames > 0) {
        remainingFrames -= 1;
        rafRef.current = window.requestAnimationFrame(runMeasure);
        return;
      }
      rafRef.current = null;
    };

    rafRef.current = window.requestAnimationFrame(runMeasure);
  }, [updateCanvasSize]);

  useEffect(() => {
    const scheduleFromEvent = () => scheduleCanvasSizeUpdate();
    scheduleCanvasSizeUpdate(5);
    const delayedRefreshId = window.setTimeout(() => scheduleCanvasSizeUpdate(5), 120);
    const observer = typeof ResizeObserver !== 'undefined' && canvasRef.current
      ? new ResizeObserver(() => scheduleCanvasSizeUpdate(4))
      : null;
    if (observer && canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduleCanvasSizeUpdate(5);
      }
    };

    window.addEventListener('resize', scheduleFromEvent);
    document.addEventListener('fullscreenchange', scheduleFromEvent);
    window.addEventListener('orientationchange', scheduleFromEvent);
    window.visualViewport?.addEventListener('resize', scheduleFromEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    void document.fonts?.ready.then(() => scheduleCanvasSizeUpdate(5));

    return () => {
      window.clearTimeout(delayedRefreshId);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      observer?.disconnect();
      window.removeEventListener('resize', scheduleFromEvent);
      document.removeEventListener('fullscreenchange', scheduleFromEvent);
      window.removeEventListener('orientationchange', scheduleFromEvent);
      window.visualViewport?.removeEventListener('resize', scheduleFromEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [scheduleCanvasSizeUpdate]);

  const savedScope = useMemo(() => {
    void version;
    return readConnectionPathScope(contextNodeId, scopeRows);
  }, [contextNodeId, scopeRows, version]);

  const [draftNodes, setDraftNodes] = useState<StoredConnectionNode[]>(savedScope.nodes);
  const [draftEdges, setDraftEdges] = useState<StoredConnectionEdge[]>(savedScope.connections);

  useEffect(() => {
    if (!isEditing) {
      setDraftNodes(savedScope.nodes);
      setDraftEdges(savedScope.connections);
    }
  }, [isEditing, savedScope]);

  const displayTypes = useMemo(() => {
    if (workstationTypeFilter !== 'all') return [workstationTypeFilter];
    return workstationTypeOrder;
  }, [workstationTypeFilter]);
  const laneDescriptors = useMemo(
    () => buildLaneDescriptors(draftNodes, displayTypes, isEditing),
    [displayTypes, draftNodes, isEditing],
  );
  const visibleNodes = useMemo(() => (
    workstationTypeFilter === 'all'
      ? draftNodes
      : draftNodes.filter((node) => node.workstationType === workstationTypeFilter)
  ), [draftNodes, workstationTypeFilter]);
  const renderedNodes = useMemo(
    () => buildRenderedNodes(visibleNodes, laneDescriptors, draggedNodeId),
    [draggedNodeId, laneDescriptors, visibleNodes],
  );
  const renderedNodeLookup = useMemo(
    () => new Map(renderedNodes.map((node) => [node.id, node])),
    [renderedNodes],
  );
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((node) => node.id)), [visibleNodes]);
  const visibleEdges = useMemo(() => (
    draftEdges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to))
  ), [draftEdges, visibleNodeIds]);

  useEffect(() => {
    setSelectedNodeId((current) => {
      if (current && visibleNodes.some((node) => node.id === current)) return current;
      return visibleNodes[0]?.id ?? null;
    });
  }, [visibleNodes]);

  const selectedNode = visibleNodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedEdge = selectedEdgeKey
    ? draftEdges.find((edge) => getEdgeKey(edge) === selectedEdgeKey) ?? null
    : null;
  const activeLaneCount = laneDescriptors.filter((lane) => lane.count > 0).length;
  const emptyLaneCount = laneDescriptors.length - activeLaneCount;
  const totalLaneRows = laneDescriptors.reduce((sum, lane) => sum + lane.rowCount, 0);
  const canvasHeight = isEditing
    ? Math.max(920, 180 + (totalLaneRows * 138) + (laneDescriptors.length * 22))
    : Math.max(920, 180 + (totalLaneRows * 128) + (laneDescriptors.length * 22));

  useLayoutEffect(() => {
    scheduleCanvasSizeUpdate(4);
  }, [
    canvasHeight,
    contextNodeId,
    isEditing,
    renderedNodes.length,
    scheduleCanvasSizeUpdate,
    visibleEdges.length,
    workstationTypeFilter,
    zoom,
  ]);

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedNodeId || !dragStartRef.current || !canvasRef.current) return;
    const offsetX = event.clientX - dragStartRef.current.clientX;
    const offsetY = event.clientY - dragStartRef.current.clientY;
    if (Math.hypot(offsetX, offsetY) < DRAG_START_THRESHOLD) {
      return;
    }

    didDragRef.current = true;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const zoomScale = zoom / 100;
    const x = ((event.clientX - rect.left) / (rect.width * zoomScale)) * 100;
    const y = ((event.clientY - rect.top) / (rect.height * zoomScale)) * 100;

    setDraftNodes((current) => current.map((node) => (
      node.id === draggedNodeId
        ? {
            ...node,
            x: mapDisplayPercentToStorageX(clamp(x, DISPLAY_X_MIN, DISPLAY_X_MAX)),
            y: clamp(y, 10, 94),
          }
        : node
    )));
  };

  const stopDragging = () => {
    dragStartRef.current = null;
    if (draggedNodeId) {
      const shouldCommitDrag = didDragRef.current;
      didDragRef.current = false;
      if (!shouldCommitDrag) {
        setDraggedNodeId(null);
        return;
      }
      setDraftNodes((current) => {
        const draggedNode = current.find((node) => node.id === draggedNodeId);
        if (!draggedNode) return current;

        const targetLane = getLaneForY(draggedNode.y, laneDescriptors);
        if (!targetLane) return current;

        return current.map((node) => (
          node.id === draggedNodeId
            ? {
                ...node,
                laneRow: resolveLaneRowIndex(draggedNode.y, targetLane),
                workstationType: targetLane.type,
                y: clamp(draggedNode.y, targetLane.top + 1, targetLane.top + targetLane.height - 1),
              }
            : node
        ));
      });
    } else {
      didDragRef.current = false;
    }
    setDraggedNodeId(null);
  };

  const handleNodeClick = (nodeIdValue: string) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    setSelectedNodeId(nodeIdValue);
    setSelectedEdgeKey(null);

    if (!isEditing) return;

    if (!pendingFromId) {
      setPendingFromId(nodeIdValue);
      return;
    }

    if (pendingFromId === nodeIdValue) {
      setPendingFromId(null);
      return;
    }

    setDraftEdges((current) => {
      const candidate = {from: pendingFromId, to: nodeIdValue};
      const exists = current.some((edge) => edge.from === candidate.from && edge.to === candidate.to);
      return exists ? current : [...current, candidate];
    });
    setPendingFromId(null);
  };

  const handleSave = () => {
    const currentPublishedWorkstations = readPublishedWorkstations();
    const draftNodeTypeById = new Map(draftNodes.map((node) => [node.id, node.workstationType]));
    const nextPublishedWorkstations = currentPublishedWorkstations.map((workstation) => {
      const nextType = draftNodeTypeById.get(workstation.id);
      if (!nextType || workstation.workstationType === nextType) {
        return workstation;
      }

      return {
        ...workstation,
        workstationType: nextType,
      };
    });
    if (JSON.stringify(nextPublishedWorkstations) !== JSON.stringify(currentPublishedWorkstations)) {
      writePublishedWorkstations(nextPublishedWorkstations);
    }

    writeConnectionPathScope({
      contextNodeId,
      nodes: draftNodes,
      connections: draftEdges,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
    setPendingFromId(null);
    setSelectedEdgeKey(null);
  };

  const handleCancel = () => {
    setDraftNodes(savedScope.nodes);
    setDraftEdges(savedScope.connections);
    setIsEditing(false);
    setPendingFromId(null);
    setSelectedEdgeKey(null);
  };

  const handleAutoLayout = () => {
    const nextScope = buildAutoLayoutScope(contextNodeId, scopeRows);
    setDraftNodes(nextScope.nodes);
    setDraftEdges(nextScope.connections);
    setSelectedEdgeKey(null);
    setPendingFromId(null);

    if (!isEditing) {
      writeConnectionPathScope(nextScope);
    }
  };

  const handleRemoveEdge = () => {
    if (!selectedEdgeKey) return;
    setDraftEdges((current) => current.filter((edge) => getEdgeKey(edge) !== selectedEdgeKey));
    setSelectedEdgeKey(null);
  };

  if (!scopeRows.length) {
    return (
      <Paper elevation={0} sx={{p: 4, borderRadius: 4, border: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenCommon.white}}>
        <Typography sx={{fontSize: 16, fontWeight: 800, color: workstationVisuals.textPrimary, mb: 1}}>Connection Path Map</Typography>
        <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, lineHeight: 1.6}}>
          No workstation is available in this context yet. Workstations published anywhere inside this plant, area, unit, line, or zone will appear here for path editing.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      <Paper
        elevation={0}
        sx={{
          p: {xs: 2, md: 2.25},
          borderRadius: 4,
          border: `1px solid ${tokenNeutral.dark}`,
          bgcolor: tokenCommon.white,
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: {xs: 'column', xl: 'row'}, gap: 2, alignItems: {xs: 'stretch', xl: 'center'}, justifyContent: 'space-between'}}>
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 15, fontWeight: 900, color: workstationVisuals.textPrimary, display: 'flex', alignItems: 'center', gap: 1}}>
              Workstream (Category) <InfoIcon sx={{fontSize: 17, color: workstationVisuals.textMuted}} />
            </Typography>
            <Typography sx={{fontSize: 12.5, color: workstationVisuals.textSecondary, mt: 0.5}}>
              Filter the connection path by workstation type or keep all lanes visible while editing.
            </Typography>
          </Box>

          <Box sx={{display: 'flex', flexDirection: {xs: 'column', lg: 'row'}, gap: 1.2, minWidth: 0, flex: 1, justifyContent: 'flex-end'}}>
            <Select
              size="small"
              value={workstationTypeFilter}
              onChange={(event) => setWorkstationTypeFilter(event.target.value as ConnectionPathFilter)}
              sx={{
                minWidth: {xs: '100%', sm: 220},
                maxWidth: {xs: '100%', lg: 220},
                borderRadius: 2.5,
                bgcolor: tokenCommon.white,
                '& .MuiSelect-select': {
                  py: 1,
                  fontSize: 13,
                  fontWeight: 700,
                },
              }}
            >
              <MenuItem value="all">All Workstreams</MenuItem>
              {workstationTypeOrder.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>

            <Box sx={{display: 'flex', gap: 1, flexWrap: {xs: 'nowrap', lg: 'wrap'}, overflowX: 'auto', pb: {xs: 0.5, lg: 0}}}>
              <Chip
                label="All"
                clickable
                onClick={() => setWorkstationTypeFilter('all')}
                sx={getFilterChipSx(workstationTypeFilter === 'all', tokenBrand.main, tokenNeutral.main, tokenInfo.lightest)}
              />
              {workstationTypeOrder.map((type) => {
                const meta = getWorkstationTypeMeta(type);
                return (
                  <Chip
                    key={type}
                    label={type}
                    clickable
                    onClick={() => setWorkstationTypeFilter(type)}
                    sx={getFilterChipSx(workstationTypeFilter === type, meta.accent, meta.tint, meta.border)}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{display: 'flex', flexDirection: {xs: 'column', xl: 'row'}, justifyContent: 'space-between', alignItems: {xs: 'stretch', xl: 'center'}, gap: 2}}>
        <Box>
          <Typography sx={{fontSize: 16, fontWeight: 800, color: workstationVisuals.textPrimary, display: 'flex', alignItems: 'center', gap: 1}}>
            Connection Path Map <InfoIcon sx={{fontSize: 18, color: workstationVisuals.textMuted}} />
          </Typography>
          <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, fontWeight: 500}}>
            {isEditing
              ? 'Click one card and then another to create an arrow. Use Remove Path to delete a selected connection.'
              : 'Drag cards across lanes to reposition them. Dropping into another lane updates that workstation type.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', justifyContent: {xs: 'flex-start', xl: 'flex-end'}}}>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{textTransform: 'none', borderRadius: 2, height: 36, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{textTransform: 'none', borderRadius: 2, height: 36, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}
              >
                Cancel
              </Button>
              {selectedEdge ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemoveEdge}
                  sx={{textTransform: 'none', borderRadius: 2, height: 36}}
                >
                  Remove Path
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{textTransform: 'none', borderRadius: 2, height: 36, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}
            >
              Edit Paths
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<AutoLayoutIcon />}
            onClick={handleAutoLayout}
            sx={{textTransform: 'none', borderRadius: 2, height: 36, borderColor: workstationVisuals.tierBorder, color: workstationVisuals.tierTextLabel}}
          >
            Auto Layout
          </Button>
          <Divider orientation="vertical" flexItem sx={{mx: 1}} />
          <IconButton size="small" onClick={() => setZoom((value) => Math.max(70, value - 10))}><ZoomOutIcon sx={{fontSize: 20}} /></IconButton>
          <Typography sx={{alignSelf: 'center', fontSize: 13, fontWeight: 700, color: workstationVisuals.tierTextLabel, minWidth: 40, textAlign: 'center'}}>{zoom}%</Typography>
          <IconButton size="small" onClick={() => setZoom((value) => Math.min(140, value + 10))}><ZoomInIcon sx={{fontSize: 20}} /></IconButton>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        sx={{
          minHeight: canvasHeight,
          borderRadius: 4,
          border: `1px solid ${isEditing ? tokenInfo.lightest : workstationVisuals.tierBorder}`,
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%',
          bgcolor: workstationVisuals.slateSurface,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.18) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      >
        <Box
          ref={canvasRef}
          sx={{
            position: 'relative',
            width: {xs: CANVAS_MIN_WIDTH, xl: '100%'},
            minWidth: CANVAS_MIN_WIDTH,
            height: canvasHeight,
          }}
        >
        <Box sx={{position: 'absolute', inset: 0, transform: `scale(${zoom / 100})`, transformOrigin: 'top left'}}>
          {laneDescriptors.map((lane) => {
            const showLaneDescription = lane.count > 0;

            return (
              <Box
                key={lane.type}
                sx={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  top: `${lane.top}%`,
                  height: `${lane.height}%`,
                  borderRadius: 3.5,
                  border: `1px solid ${lane.meta.border}`,
                  bgcolor: lane.meta.laneBackground,
                  opacity: workstationTypeFilter === 'all' || workstationTypeFilter === lane.type ? 1 : 0.32,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 10,
                    top: 10,
                    width: showLaneDescription ? 176 : 'fit-content',
                    minWidth: showLaneDescription ? 176 : 122,
                    maxWidth: 'calc(100% - 20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.7,
                    px: isEditing && !showLaneDescription ? 1.1 : 1.2,
                    py: isEditing && !showLaneDescription ? 0.75 : 0.95,
                    borderRadius: 2.2,
                    bgcolor: tokenCommon.white,
                    borderLeft: `3px solid ${lane.meta.accent}`,
                    borderTop: `1px solid ${lane.meta.border}`,
                    borderRight: `1px solid ${lane.meta.border}`,
                    borderBottom: `1px solid ${lane.meta.border}`,
                    boxShadow: isEditing && !showLaneDescription ? '0 4px 10px rgba(15, 23, 42, 0.04)' : '0 8px 18px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                    <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: lane.meta.accent}} />
                    <Typography sx={{fontSize: 10.5, fontWeight: 900, color: lane.meta.accent, textTransform: 'uppercase'}}>
                      {lane.type}
                    </Typography>
                    <Typography sx={{fontSize: 10.5, fontWeight: 700, color: workstationVisuals.textSecondary}}>
                      {lane.count}
                    </Typography>
                  </Box>
                  {showLaneDescription ? (
                    <Typography sx={{fontSize: 11.5, color: workstationVisuals.tierTextLabel, lineHeight: 1.45}}>
                      {lane.meta.description}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            );
          })}

          <svg
            width={canvasSize.width}
            height={canvasSize.height}
            viewBox={`0 0 ${canvasSize.width || 1} ${canvasSize.height || 1}`}
            style={{position: 'absolute', inset: 0, overflow: 'visible'}}
          >
            <defs>
              <marker id="path-arrow-blue" markerWidth="9" markerHeight="7" refX="8.2" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill={tokenBrand.main} />
              </marker>
              <marker id="path-arrow-orange" markerWidth="9" markerHeight="7" refX="8.2" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill={tokenWarning.dark} />
              </marker>
            </defs>

            {visibleEdges.map((edge) => {
              const fromNode = renderedNodeLookup.get(edge.from);
              const toNode = renderedNodeLookup.get(edge.to);
              if (!fromNode || !toNode) return null;

              const path = buildEdgePath(fromNode, toNode, canvasSize.width, canvasSize.height);
              const edgeKey = getEdgeKey(edge);
              const isSelected = edgeKey === selectedEdgeKey;
              const isAlert = fromNode.status === 'Alert' || toNode.status === 'Alert';
              const stroke = isAlert ? tokenWarning.dark : tokenBrand.main;

              return (
                <g key={edgeKey}>
                  <path
                    d={path}
                    stroke={isSelected ? workstationVisuals.textPrimary : stroke}
                    strokeWidth={isSelected ? 2.6 : 2}
                    fill="none"
                    strokeDasharray={isSelected ? '0' : '7 6'}
                    markerEnd={`url(#${isAlert ? 'path-arrow-orange' : 'path-arrow-blue'})`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.92}
                    style={{pointerEvents: 'none'}}
                  />
                  <path
                    d={path}
                    stroke="transparent"
                    strokeWidth={18}
                    fill="none"
                    style={{pointerEvents: isEditing ? 'stroke' : 'none', cursor: isEditing ? 'pointer' : 'default'}}
                    onClick={() => {
                      if (!isEditing) return;
                      setSelectedEdgeKey(edgeKey);
                      setPendingFromId(null);
                    }}
                  />
                </g>
              );
            })}
          </svg>

          <Box sx={{width: '100%', height: '100%'}}>
          {renderedNodes.map((node) => {
            const sourceNode = visibleNodes.find((item) => item.id === node.id) ?? node;
            const isSelected = selectedNode?.id === node.id;
            const isPendingSource = pendingFromId === node.id;
            const typeMeta = getWorkstationTypeMeta(sourceNode.workstationType);

            return (
              <Paper
                key={node.id}
                elevation={0}
                onMouseDown={(event) => {
                  if (isEditing) return;
                  didDragRef.current = false;
                  setDraggedNodeId(node.id);
                  dragStartRef.current = {
                    nodeId: node.id,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  };
                }}
                onClick={() => handleNodeClick(node.id)}
                sx={{
                  position: 'absolute',
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: NODE_WIDTH,
                  minHeight: NODE_HEIGHT,
                  p: 1.35,
                  borderRadius: 2.6,
                  border: `1px solid ${isPendingSource ? tokenBrand.main : isSelected ? tokenBrand.lightest : tokenNeutral.dark}`,
                  boxShadow: isPendingSource
                    ? '0 6px 14px rgba(37,99,235,0.10), 0 0 0 1px rgba(191,219,254,0.85)'
                    : isSelected
                      ? '0 4px 10px rgba(59,130,246,0.08), 0 0 0 1px rgba(191,219,254,0.9)'
                      : '0 2px 5px rgba(148,163,184,0.10), 0 0 0 1px rgba(226,232,240,0.95)',
                  bgcolor: tokenCommon.white,
                  cursor: isEditing ? 'pointer' : draggedNodeId === node.id ? 'grabbing' : 'grab',
                  zIndex: isPendingSource || isSelected ? 2 : 1,
                  transition: draggedNodeId === node.id ? 'none' : 'all 0.2s ease',
                  '&:hover': {borderColor: tokenBrand.lightest},
                }}
              >
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <WorkstationIcon sx={{fontSize: 18, color: typeMeta.accent}} />
                    <Box>
                      <Typography sx={{fontSize: 13, fontWeight: 800, color: workstationVisuals.textPrimary, lineHeight: 1.25}}>
                        {sourceNode.title}
                      </Typography>
                      <Typography sx={{fontSize: 10.5, fontWeight: 700, color: workstationVisuals.textMuted, lineHeight: 1.2}}>
                        {sourceNode.level}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
                    {!isEditing ? <DragIcon sx={{fontSize: 16, color: workstationVisuals.textMuted}} /> : null}
                    <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: sourceNode.status === 'Alert' ? tokenWarning.dark : sourceNode.status === 'Inactive' ? workstationVisuals.textMuted : tokenSuccess.main}} />
                  </Box>
                </Box>

                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Chip
                    label={sourceNode.workstationType}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 10,
                      fontWeight: 900,
                      bgcolor: typeMeta.tint,
                      color: typeMeta.accent,
                      border: `1px solid ${typeMeta.border}`,
                      borderRadius: 1.2,
                    }}
                  />
                  {isEditing ? (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, color: isPendingSource ? tokenBrand.main : workstationVisuals.textMuted}}>
                      <ConnectIcon sx={{fontSize: 15}} />
                      <Typography sx={{fontSize: 10, fontWeight: 800}}>
                        {isPendingSource ? 'Source' : 'Connect'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, color: workstationVisuals.textMuted}}>
                      <DragIcon sx={{fontSize: 15}} />
                      <Typography sx={{fontSize: 10, fontWeight: 800}}>
                        Move
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })}
          {!visibleNodes.length ? (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                px: 2.5,
                py: 1.8,
                borderRadius: 3,
                border: `1px solid ${workstationVisuals.tierBorder}`,
                bgcolor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 16px 34px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Typography sx={{fontSize: 13, fontWeight: 800, color: workstationVisuals.textPrimary, textAlign: 'center'}}>
                No workstations match this type filter yet.
              </Typography>
            </Box>
          ) : null}
          </Box>
        </Box>
        </Box>
      </Paper>

      {selectedNode ? (
        <Paper elevation={0} sx={{p: 3, borderRadius: 4, border: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenCommon.white}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
            <Box>
              <Typography sx={{fontSize: 12, fontWeight: 900, color: workstationVisuals.textSecondary, mb: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase'}}>Workstation Details</Typography>
              <Typography sx={{fontSize: 20, fontWeight: 900, color: workstationVisuals.textPrimary, letterSpacing: '-0.01em'}}>{selectedNode.title}</Typography>
            </Box>
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
              <Chip
                label={selectedNode.workstationType}
                sx={{
                  bgcolor: getWorkstationTypeMeta(selectedNode.workstationType).tint,
                  color: getWorkstationTypeMeta(selectedNode.workstationType).accent,
                  border: `1px solid ${getWorkstationTypeMeta(selectedNode.workstationType).border}`,
                  fontWeight: 800,
                  borderRadius: 1.5,
                }}
                size="small"
              />
              <Chip label={selectedNode.level} sx={{bgcolor: tokenNeutral.lighter, color: tokenBrand.main, fontWeight: 800, borderRadius: 1.5}} size="small" />
            </Box>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 3}}>
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 900, color: workstationVisuals.textMuted, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Outputs To</Typography>
              <Stack direction="column" spacing={1.2}>
                {draftEdges.filter((edge) => edge.from === selectedNode.id).map((edge) => {
                  const target = draftNodes.find((node) => node.id === edge.to);
                  if (!target) return null;
                  return (
                    <ConnectedCard key={getEdgeKey(edge)} node={target} label="DOWNSTREAM" />
                  );
                })}
                {!draftEdges.some((edge) => edge.from === selectedNode.id) ? <Typography sx={{fontSize: 12, color: workstationVisuals.textMuted}}>No downstream connection yet.</Typography> : null}
              </Stack>
            </Box>

            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 900, color: workstationVisuals.textMuted, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Inputs From</Typography>
              <Stack direction="column" spacing={1.2}>
                {draftEdges.filter((edge) => edge.to === selectedNode.id).map((edge) => {
                  const source = draftNodes.find((node) => node.id === edge.from);
                  if (!source) return null;
                  return (
                    <ConnectedCard key={getEdgeKey(edge)} node={source} label="UPSTREAM" />
                  );
                })}
                {!draftEdges.some((edge) => edge.to === selectedNode.id) ? <Typography sx={{fontSize: 12, color: workstationVisuals.textMuted}}>No upstream connection yet.</Typography> : null}
              </Stack>
            </Box>
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}

function ConnectedCard({label, node}: {label: string; node: StoredConnectionNode}) {
  const typeMeta = getWorkstationTypeMeta(node.workstationType);

  return (
    <Box sx={{p: 1.25, borderRadius: 2.5, border: `1px solid ${workstationVisuals.slateSurface}`, bgcolor: workstationVisuals.slateSurface, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
        <Box sx={{width: 32, height: 32, borderRadius: 1.5, bgcolor: 'white', border: `1px solid ${workstationVisuals.tierBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <WorkstationIcon sx={{fontSize: 16, color: typeMeta.accent}} />
        </Box>
        <Box>
          <Typography sx={{fontSize: 11, fontWeight: 800, color: workstationVisuals.textMuted}}>{label}</Typography>
          <Typography sx={{fontSize: 13, fontWeight: 800, color: workstationVisuals.textPrimary}}>{node.title}</Typography>
          <Typography sx={{fontSize: 10.5, fontWeight: 700, color: workstationVisuals.textMuted}}>{node.level}</Typography>
        </Box>
      </Box>
      <Chip
        label={node.workstationType}
        size="small"
        sx={{
          fontWeight: 800,
          borderRadius: 1.5,
          bgcolor: typeMeta.tint,
          color: typeMeta.accent,
          border: `1px solid ${typeMeta.border}`,
        }}
      />
    </Box>
  );
}

function buildLaneDescriptors(
  nodes: StoredConnectionNode[],
  displayTypes: readonly WorkstationType[],
  isEditing: boolean,
) {
  const laneTop = 12;
  const laneBottom = 8;
  const laneGap = isEditing ? 2.2 : 1.9;
  const laneNodesByType = new Map(
    displayTypes.map((type) => [type, nodes.filter((node) => node.workstationType === type)]),
  );
  const laneWeights = displayTypes.map((type) => {
    const laneNodes = laneNodesByType.get(type) ?? [];
    const count = laneNodes.length;
    const rowCount = getLaneRowCount(laneNodes);
    if (!isEditing) return count > 0 ? 1.12 + (rowCount * 1.04) : 0.92;
    return count > 0 ? 1.18 + (rowCount * 1.12) : 0.88;
  });
  const totalWeight = laneWeights.reduce((sum, weight) => sum + weight, 0) || 1;
  const usableHeight = 100 - laneTop - laneBottom - (Math.max(displayTypes.length - 1, 0) * laneGap);
  let nextTop = laneTop;

  return displayTypes.map((type, laneIndex) => {
    const laneNodes = laneNodesByType.get(type) ?? [];
    const rowCount = getLaneRowCount(laneNodes);
    const height = (usableHeight * laneWeights[laneIndex]) / totalWeight;
    const descriptor = {
      type,
      count: laneNodes.length,
      rowCount,
      top: nextTop,
      height,
      meta: getWorkstationTypeMeta(type),
    };
    nextTop += height + laneGap;
    return descriptor;
  });
}

function getLaneForY(y: number, lanes: ReturnType<typeof buildLaneDescriptors>) {
  return lanes.find((lane) => y >= lane.top && y <= lane.top + lane.height)
    ?? lanes.reduce((closest, lane) => {
      const laneCenter = lane.top + (lane.height / 2);
      const closestCenter = closest.top + (closest.height / 2);
      return Math.abs(laneCenter - y) < Math.abs(closestCenter - y) ? lane : closest;
    }, lanes[0]);
}

function getLaneRowCount(nodes: StoredConnectionNode[]) {
  if (!nodes.length) return 1;
  const highestStoredRow = nodes.reduce((max, node) => Math.max(max, node.laneRow), 0) + 1;
  return Math.max(highestStoredRow, Math.ceil(nodes.length / MAX_LANE_COLUMNS), 1);
}

function getLaneRowGeometry(lane: ReturnType<typeof buildLaneDescriptors>[number]) {
  const innerPadding = Math.min(4.8, Math.max(2.6, lane.height * 0.12));
  const usableHeight = Math.max(lane.height - (innerPadding * 2), lane.rowCount * 6);
  const rowHeight = usableHeight / lane.rowCount;
  return {innerPadding, rowHeight};
}

function resolveLaneRowIndex(y: number, lane: ReturnType<typeof buildLaneDescriptors>[number]) {
  const {innerPadding, rowHeight} = getLaneRowGeometry(lane);
  const normalizedY = clamp(y, lane.top + innerPadding, lane.top + lane.height - innerPadding);
  const rowIndex = Math.floor((normalizedY - lane.top - innerPadding) / rowHeight);
  return clamp(rowIndex, 0, lane.rowCount - 1);
}

function getLaneRowCenter(lane: ReturnType<typeof buildLaneDescriptors>[number], rowIndex: number) {
  const {innerPadding, rowHeight} = getLaneRowGeometry(lane);
  return lane.top + innerPadding + (rowHeight * (clamp(rowIndex, 0, lane.rowCount - 1) + 0.5));
}

function getFilterChipSx(active: boolean, accent: string, tint: string, border: string) {
  return {
    height: 34,
    borderRadius: 2.2,
    px: 0.75,
    fontSize: 12,
    fontWeight: 800,
    bgcolor: active ? tint : tokenCommon.white,
    color: active ? accent : workstationVisuals.tierTextLabel,
    border: `1px solid ${active ? border : workstationVisuals.tierBorder}`,
    boxShadow: active ? `0 8px 20px color-mix(in srgb, ${accent} 8%, transparent)` : 'none',
    '&:hover': {
      bgcolor: tint,
      color: accent,
      borderColor: border,
    },
  };
}

function buildRenderedNodes(
  nodes: StoredConnectionNode[],
  lanes: ReturnType<typeof buildLaneDescriptors>,
  draggedNodeId: string | null,
) {
  const laneByType = new Map(
    lanes.map((lane) => [lane.type, lane]),
  );

  return nodes.map((node) => ({
    ...node,
    x: mapStorageXToDisplayPercent(node.x),
    y: draggedNodeId === node.id
      ? node.y
      : getLaneRowCenter(laneByType.get(node.workstationType) ?? lanes[0], node.laneRow),
  }));
}

function mapStorageXToDisplayPercent(value: number) {
  const normalized = (value - STORAGE_X_MIN) / (STORAGE_X_MAX - STORAGE_X_MIN);
  return clamp(DISPLAY_X_MIN + (normalized * (DISPLAY_X_MAX - DISPLAY_X_MIN)), DISPLAY_X_MIN, DISPLAY_X_MAX);
}

function mapDisplayPercentToStorageX(value: number) {
  const normalized = (value - DISPLAY_X_MIN) / (DISPLAY_X_MAX - DISPLAY_X_MIN);
  return clamp(STORAGE_X_MIN + (normalized * (STORAGE_X_MAX - STORAGE_X_MIN)), STORAGE_X_MIN, STORAGE_X_MAX);
}

function buildEdgePath(fromNode: StoredConnectionNode, toNode: StoredConnectionNode, canvasWidth: number, canvasHeight: number) {
  const fromRect = getNodeRect(fromNode, canvasWidth, canvasHeight);
  const toRect = getNodeRect(toNode, canvasWidth, canvasHeight);
  const dx = toRect.cx - fromRect.cx;
  const dy = toRect.cy - fromRect.cy;
  const isHorizontal = Math.abs(dx) >= Math.abs(dy);

  const start = isHorizontal
    ? {
        x: dx >= 0 ? fromRect.right + EDGE_HANDLE_PADDING : fromRect.left - EDGE_HANDLE_PADDING,
        y: fromRect.cy,
      }
    : {
        x: fromRect.cx,
        y: dy >= 0 ? fromRect.bottom + EDGE_HANDLE_PADDING : fromRect.top - EDGE_HANDLE_PADDING,
      };
  const end = isHorizontal
    ? {
        x: dx >= 0 ? toRect.left - EDGE_HANDLE_PADDING : toRect.right + EDGE_HANDLE_PADDING,
        y: toRect.cy,
      }
    : {
        x: toRect.cx,
        y: dy >= 0 ? toRect.top - EDGE_HANDLE_PADDING : toRect.bottom + EDGE_HANDLE_PADDING,
      };
  const controlDistance = isHorizontal
    ? Math.max(42, Math.abs(end.x - start.x) * 0.4)
    : Math.max(42, Math.abs(end.y - start.y) * 0.4);
  const controlOne = isHorizontal
    ? {x: start.x + (dx >= 0 ? controlDistance : -controlDistance), y: start.y}
    : {x: start.x, y: start.y + (dy >= 0 ? controlDistance : -controlDistance)};
  const controlTwo = isHorizontal
    ? {x: end.x - (dx >= 0 ? controlDistance : -controlDistance), y: end.y}
    : {x: end.x, y: end.y - (dy >= 0 ? controlDistance : -controlDistance)};

  return `M ${start.x} ${start.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${end.x} ${end.y}`;
}

function getNodeRect(node: StoredConnectionNode, canvasWidth: number, canvasHeight: number) {
  const cx = (node.x / 100) * canvasWidth;
  const cy = (node.y / 100) * canvasHeight;
  const halfWidth = NODE_WIDTH / 2;
  const halfHeight = NODE_HEIGHT / 2;

  return {
    cx,
    cy,
    left: cx - halfWidth,
    right: cx + halfWidth,
    top: cy - halfHeight,
    bottom: cy + halfHeight,
  };
}

function getEdgeKey(edge: StoredConnectionEdge) {
  return `${edge.from}->${edge.to}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
