import {
  Box,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Switch,
  Chip,
  Typography,
} from '@mui/material';
import {Close as CloseIcon, DragIndicator as DragIndicatorIcon} from '@mui/icons-material';
import {getLaneComponentDefinitions} from '../laneComponents';
import type {TierMeetingLaneComponentId, TierMeetingLaneSettings, TierMeetingPillar} from '../types';
import TierMeetingLaneGraphicCards from './TierMeetingLaneGraphicCards';

type TierMeetingLaneSettingsDialogProps = {
  open: boolean;
  pillar: TierMeetingPillar;
  settings: TierMeetingLaneSettings;
  onClose: () => void;
  onChange: (settings: TierMeetingLaneSettings) => void;
};

export default function TierMeetingLaneSettingsDialog({
  open,
  pillar,
  settings,
  onClose,
  onChange,
}: TierMeetingLaneSettingsDialogProps) {
  const stopDialogDragPropagation = (event: React.DragEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const componentDefinitionMap = new Map(
    getLaneComponentDefinitions(pillar).map((component) => [component.id, component]),
  );
  const hasKpiCardsSection = settings.componentOrder.includes('kpis');
  const orderedGraphicCards = (settings.graphicCardOrder ?? [])
    .map((cardId) => pillar.graphicCards?.find((card) => card.id === cardId))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const orderedKpis = settings.kpiOrder
    .map((kpiId) => pillar.kpis.find((kpi) => kpi.id === kpiId))
    .filter((kpi): kpi is NonNullable<typeof kpi> => Boolean(kpi));
  const orderedComponentDefinitions = settings.componentOrder
    .map((componentId) => componentDefinitionMap.get(componentId))
    .filter((component): component is NonNullable<typeof component> => Boolean(component));
  const isCustomLane = pillar.id === 'custom';

  const toggleVisibleKpi = (kpiId: string) => {
    const visibleKpiIds = settings.visibleKpiIds.includes(kpiId)
      ? settings.visibleKpiIds.filter((id) => id !== kpiId)
      : [...settings.visibleKpiIds, kpiId];
    onChange({...settings, visibleKpiIds});
  };

  const toggleVisibleGraphicCard = (cardId: string) => {
    const visibleGraphicCardIds = settings.visibleGraphicCardIds.includes(cardId)
      ? settings.visibleGraphicCardIds.filter((id) => id !== cardId)
      : [...settings.visibleGraphicCardIds, cardId];
    onChange({...settings, visibleGraphicCardIds});
  };

  const toggleVisibleComponent = (componentId: TierMeetingLaneComponentId) => {
    const visibleComponentIds = settings.visibleComponentIds.includes(componentId)
      ? settings.visibleComponentIds.filter((id) => id !== componentId)
      : [...settings.visibleComponentIds, componentId];
    onChange({...settings, visibleComponentIds});
  };

  const reorderList = <T,>(items: T[], sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return items;
    const nextItems = [...items];
    const [moved] = nextItems.splice(sourceIndex, 1);
    nextItems.splice(targetIndex, 0, moved);
    return nextItems;
  };

  const customKpiGroups = [
    {title: 'Safety', ids: ['fatality']},
    {title: 'Quality', ids: ['ncs']},
    {title: 'Delivery', ids: ['last-changeover']},
    {title: 'Cost', ids: ['total-scrap-produced']},
    {title: 'People', ids: ['absenteeism']},
  ];

  const customSectionGroups = [
    {title: 'Safety', ids: ['dailyTracker', 'additionalCards'] as TierMeetingLaneComponentId[]},
    {title: 'Quality', ids: ['dailyTracker', 'additionalCards'] as TierMeetingLaneComponentId[]},
    {title: 'Delivery', ids: ['productInfo', 'oeeCard', 'graphsCharts'] as TierMeetingLaneComponentId[]},
    {title: 'Cost', ids: ['graphsCharts'] as TierMeetingLaneComponentId[]},
    {title: 'People', ids: ['recognition', 'communications', 'startMeeting'] as TierMeetingLaneComponentId[]},
    {title: 'Shared', ids: ['laneGraphics', 'kpis', 'aiInsights', 'focusAreas', 'actionSummary'] as TierMeetingLaneComponentId[]},
  ];

  const groupedOrderedKpis = isCustomLane
    ? customKpiGroups
      .map((group) => ({
        ...group,
        items: orderedKpis.filter((kpi) => group.ids.includes(kpi.id)),
      }))
      .filter((group) => group.items.length > 0)
    : [];

  const groupedOrderedComponents = isCustomLane
    ? customSectionGroups
      .map((group) => ({
        ...group,
        items: orderedComponentDefinitions.filter((component) => group.ids.includes(component.id)),
      }))
      .filter((group) => group.items.length > 0)
    : [];

  const visibleOrderedGraphicCards = orderedGraphicCards.filter((card) => settings.visibleGraphicCardIds.includes(card.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{p: 2.2, position: 'relative'}}>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            border: '1px solid #DBDDDF',
            bgcolor: '#FFFFFF',
            color: '#475569',
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            '&:hover': {
              bgcolor: '#F8FAFC',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{fontWeight: 800, mb: 1}}>
          Customize {pillar.title}
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
          {pillar.graphicCards?.length ? (
            <>
              <Typography variant="caption" sx={{fontWeight: 800, color: '#626465'}}>
                LANE GRAPHICS
              </Typography>
              {visibleOrderedGraphicCards.length ? (
                <TierMeetingLaneGraphicCards cards={visibleOrderedGraphicCards} variant="dialog" />
              ) : (
                <Typography variant="body2" sx={{color: '#6F7787'}}>
                  All lane graphics are hidden.
                </Typography>
              )}
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                {orderedGraphicCards.map((card, index) => (
                  <Box
                    key={card.id}
                    draggable
                    onDragStart={(event) => {
                      stopDialogDragPropagation(event);
                      event.dataTransfer.setData('text/tier-graphic-card-index', index.toString());
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(event) => {
                      stopDialogDragPropagation(event);
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      stopDialogDragPropagation(event);
                      event.preventDefault();
                      const sourceIndex = Number(event.dataTransfer.getData('text/tier-graphic-card-index'));
                      if (Number.isNaN(sourceIndex)) return;
                      onChange({...settings, graphicCardOrder: reorderList(settings.graphicCardOrder, sourceIndex, index)});
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                      <Typography variant="body2" sx={{fontWeight: 700}}>
                        {card.label}
                      </Typography>
                    </Box>
                    <Switch checked={settings.visibleGraphicCardIds.includes(card.id)} onChange={() => toggleVisibleGraphicCard(card.id)} />
                  </Box>
                ))}
              </Box>
            </>
          ) : null}

          {hasKpiCardsSection ? (
            <>
              <Typography variant="caption" sx={{fontWeight: 800, color: '#626465'}}>
                KPIS
              </Typography>
              {isCustomLane ? (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  {groupedOrderedKpis.map((group, groupIndex) => (
                    <Box key={group.title} sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                      {groupIndex > 0 ? <Divider flexItem sx={{borderColor: '#E5E7EB'}} /> : null}
                      <Chip
                        label={group.title}
                        size="small"
                        sx={{alignSelf: 'flex-start', fontWeight: 800, bgcolor: '#F4F7FC', color: '#1F2366'}}
                      />
                      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                        {group.items.map((kpi) => {
                          const index = settings.kpiOrder.indexOf(kpi.id);
                          return (
                            <Box
                              key={kpi.id}
                              draggable
                              onDragStart={(event) => {
                                stopDialogDragPropagation(event);
                                event.dataTransfer.setData('text/tier-kpi-index', index.toString());
                                event.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(event) => {
                                stopDialogDragPropagation(event);
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(event) => {
                                stopDialogDragPropagation(event);
                                event.preventDefault();
                                const sourceIndex = Number(event.dataTransfer.getData('text/tier-kpi-index'));
                                if (Number.isNaN(sourceIndex)) return;
                                onChange({...settings, kpiOrder: reorderList(settings.kpiOrder, sourceIndex, index)});
                              }}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                              }}
                            >
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                                <Typography variant="body2" sx={{fontWeight: 700}}>
                                  {kpi.label}
                                </Typography>
                              </Box>
                              <Switch checked={settings.visibleKpiIds.includes(kpi.id)} onChange={() => toggleVisibleKpi(kpi.id)} />
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                  {orderedKpis.map((kpi, index) => (
                    <Box
                      key={kpi.id}
                      draggable
                      onDragStart={(event) => {
                        stopDialogDragPropagation(event);
                        event.dataTransfer.setData('text/tier-kpi-index', index.toString());
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(event) => {
                        stopDialogDragPropagation(event);
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(event) => {
                        stopDialogDragPropagation(event);
                        event.preventDefault();
                        const sourceIndex = Number(event.dataTransfer.getData('text/tier-kpi-index'));
                        if (Number.isNaN(sourceIndex)) return;
                        onChange({...settings, kpiOrder: reorderList(settings.kpiOrder, sourceIndex, index)});
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                        <Typography variant="body2" sx={{fontWeight: 700}}>
                          {kpi.label}
                        </Typography>
                      </Box>
                      <Switch checked={settings.visibleKpiIds.includes(kpi.id)} onChange={() => toggleVisibleKpi(kpi.id)} />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          ) : null}

          <Typography variant="caption" sx={{fontWeight: 800, color: '#626465', mt: hasKpiCardsSection ? 0.8 : 0}}>
            SECTIONS
          </Typography>
          {isCustomLane ? (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
              {groupedOrderedComponents.map((group, groupIndex) => (
                <Box key={group.title} sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                  {groupIndex > 0 ? <Divider flexItem sx={{borderColor: '#E5E7EB'}} /> : null}
                  <Chip
                    label={group.title}
                    size="small"
                    sx={{alignSelf: 'flex-start', fontWeight: 800, bgcolor: '#F4F7FC', color: '#1F2366'}}
                  />
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
                    {group.items.map((component) => {
                      const index = settings.componentOrder.indexOf(component.id);
                      return (
                        <Box
                          key={component.id}
                          draggable
                          onDragStart={(event) => {
                            stopDialogDragPropagation(event);
                            event.dataTransfer.setData('text/tier-component-index', index.toString());
                            event.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(event) => {
                            stopDialogDragPropagation(event);
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(event) => {
                            stopDialogDragPropagation(event);
                            event.preventDefault();
                            const sourceIndex = Number(event.dataTransfer.getData('text/tier-component-index'));
                            if (Number.isNaN(sourceIndex)) return;
                            onChange({...settings, componentOrder: reorderList(settings.componentOrder, sourceIndex, index)});
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                            <Typography variant="body2" sx={{fontWeight: 700}}>
                              {component.label}
                            </Typography>
                          </Box>
                          <Switch checked={settings.visibleComponentIds.includes(component.id)} onChange={() => toggleVisibleComponent(component.id)} />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
              {orderedComponentDefinitions.map((component, index) => (
                <Box
                  key={component.id}
                  draggable
                  onDragStart={(event) => {
                    stopDialogDragPropagation(event);
                    event.dataTransfer.setData('text/tier-component-index', index.toString());
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(event) => {
                    stopDialogDragPropagation(event);
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    stopDialogDragPropagation(event);
                    event.preventDefault();
                    const sourceIndex = Number(event.dataTransfer.getData('text/tier-component-index'));
                    if (Number.isNaN(sourceIndex)) return;
                    onChange({...settings, componentOrder: reorderList(settings.componentOrder, sourceIndex, index)});
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <DragIndicatorIcon sx={{fontSize: 18, color: '#6F7787', cursor: 'grab'}} />
                    <Typography variant="body2" sx={{fontWeight: 700}}>
                      {component.label}
                    </Typography>
                  </Box>
                  <Switch checked={settings.visibleComponentIds.includes(component.id)} onChange={() => toggleVisibleComponent(component.id)} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
