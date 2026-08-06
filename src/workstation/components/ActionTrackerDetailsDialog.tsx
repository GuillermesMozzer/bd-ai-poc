import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  FlagOutlined as FlagOutlinedIcon,
  ImageOutlined as ImageOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  MicNone as MicIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  PersonOutlineOutlined as PersonOutlineOutlinedIcon,
  PlaceOutlined as PlaceOutlinedIcon,
  PictureAsPdfOutlined as PictureAsPdfOutlinedIcon,
  ReplayOutlined as ReplayOutlinedIcon,
  SendRounded as SendRoundedIcon,
  TipsAndUpdatesOutlined as TipsAndUpdatesOutlinedIcon,
} from '@mui/icons-material';
import {
  actionTrackerPeople,
  clearDueDateExtensionRequestMetadata,
  type ActionCategory,
  type ActionTrackerAttachment,
  type ActionPriority,
  type ActionTrackerItem,
  type ActionType,
  useActionTrackerItems,
} from './actionTrackerStore';
import {addEscalationTagFromAction} from './escalationTagsStore';
import {readEscalationTargetsForSource} from '../allworkstation/connectionPathStore';
import {escalateWorkflowIssue, type WorkflowIssue} from './workflowIssueStore';
import {
  getActionTrackerAttachmentKind,
  getActionTrackerSourceDetails,
  isImplementedSolutionPresent,
} from '../../actionTracker/utils';
import {
  buildDueDateExtensionChange,
  buildReassignmentChange,
} from '../../actionTracker/workflow';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import {
  tokenBrand,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../theme';

import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';

type ActionTrackerDetailsDialogProps = {};

type TimelineEntryType = 'nc' | 'assistant' | 'created' | 'comment' | 'escalation';
type DetailPanelTab = 'activity' | 'comments';

type TimelineEntry = {
  id: string;
  type: TimelineEntryType;
  actor: string;
  title: string;
  detail?: string;
  timestamp: string;
  typing?: boolean;
};

type DetailState = {
  assistantExpanded: boolean;
  feed: TimelineEntry[];
  followed: boolean;
  supportLabel: string;
  usedSuggestions: string[];
  escalationTarget: string | null;
};

const detailStateStorageKey = 'workstation-action-tracker-detail-state-v3';
const detailButtonSx = {
  borderRadius: '8px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: 'none',
} as const;
const detailOutlinedButtonSx = {
  ...detailButtonSx,
  color: tokenBrand.main,
  borderColor: tokenBrand.main,
  '&:hover': {
    borderColor: tokenBrand.dark,
    bgcolor: tokenBrand.softBg,
    boxShadow: 'none',
  },
} as const;
const detailContainedButtonSx = {
  ...detailButtonSx,
  bgcolor: tokenBrand.main,
  color: tokenBrand.contrast,
  '&:hover': {
    bgcolor: tokenBrand.dark,
    boxShadow: 'none',
  },
} as const;
const detailPanelSx = {
  borderRadius: '12px',
  bgcolor: 'background.paper',
  border: `1px solid ${tokenDivider}`,
  p: 1.5,
  boxShadow: 'none',
} as const;
const detailLabelSx = {
  fontSize: 12,
  color: tokenText.secondary,
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
} as const;
const detailValueSx = {
  fontSize: 14,
  color: tokenText.primary,
  fontWeight: 500,
} as const;
const categoryOptions: ActionCategory[] = ['QUALITY', 'COST', 'PEOPLE', 'DELIVERY', 'SAFETY'];
const priorityOptions: ActionPriority[] = ['High', 'Medium', 'Low'];
const standardTypeOptions: ActionType[] = ['Corrective', 'Preventive'];
const safetyTypeOptions: ActionType[] = ['BBS', 'Near Miss', 'Condition Report'];

function getTypeOptions(category: ActionCategory | undefined) {
  return category === 'SAFETY' ? safetyTypeOptions : standardTypeOptions;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatCategoryLabel(category: ActionTrackerItem['category']) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function buildEntry(entry: TimelineEntry) {
  return entry;
}

function buildBaseFeed(item: ActionTrackerItem): TimelineEntry[] {
  const feed = [
    buildEntry({
      id: `${item.id}-created`,
      type: 'created',
      actor: item.createdBy,
      title: 'Created',
      timestamp: `${item.creationDate}, 07:32`,
    }),
    buildEntry({
      id: `${item.id}-assistant`,
      type: 'assistant',
      actor: 'My Ia Assistent',
      title: 'My Ia Assistent identified the NC risk and recommended owner assignment plus verification follow-up.',
      timestamp: `${item.creationDate}, 07:36`,
    }),
    buildEntry({
      id: `${item.id}-nc`,
      type: 'nc',
      actor: 'Final inspection',
      title: 'A nonconformance was identified during final inspection.',
      timestamp: `${item.creationDate}, 07:41`,
    }),
  ];

  return feed;
}

function buildInitialState(item: ActionTrackerItem): DetailState {
  return {
    assistantExpanded: true,
    feed: buildBaseFeed(item),
    followed: true,
    supportLabel: item.supportNeeded,
    usedSuggestions: [],
    escalationTarget: null,
  };
}

function readStoredState(item: ActionTrackerItem) {
  if (typeof window === 'undefined') return buildInitialState(item);

  try {
    const raw = window.localStorage.getItem(detailStateStorageKey);
    if (!raw) return buildInitialState(item);
    const parsed = JSON.parse(raw) as Record<string, DetailState | undefined>;
    const stored = parsed[item.id];
    if (!stored || !Array.isArray(stored.feed)) return buildInitialState(item);
    return {
      assistantExpanded: Boolean(stored.assistantExpanded),
      feed: stored.feed,
      followed: typeof stored.followed === 'boolean' ? stored.followed : true,
      supportLabel: typeof stored.supportLabel === 'string' ? stored.supportLabel : item.supportNeeded,
      usedSuggestions: Array.isArray(stored.usedSuggestions) ? stored.usedSuggestions.filter((value): value is string => typeof value === 'string') : [],
      escalationTarget: typeof stored.escalationTarget === 'string' ? stored.escalationTarget : null,
    } satisfies DetailState;
  } catch {
    return buildInitialState(item);
  }
}

function writeStoredState(itemId: string, state: DetailState) {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(detailStateStorageKey);
    const parsed = raw ? JSON.parse(raw) as Record<string, DetailState> : {};
    parsed[itemId] = state;
    window.localStorage.setItem(detailStateStorageKey, JSON.stringify(parsed));
  } catch {
    // Keep UI responsive even if local persistence fails.
  }
}

function getActivityTone(type: TimelineEntryType) {
  if (type === 'assistant') return {line: tokenBrand.main, iconBg: tokenBrand.softBg, iconColor: tokenBrand.main};
  if (type === 'comment') return {line: tokenText.secondary, iconBg: tokenNeutral.light, iconColor: tokenText.secondary};
  if (type === 'escalation') return {line: tokenWarning.main, iconBg: tokenWarning.softBg, iconColor: tokenWarning.main};
  if (type === 'created') return {line: tokenDivider, iconBg: 'background.paper', iconColor: tokenText.secondary};
  return {line: tokenSuccess.main, iconBg: tokenSuccess.softBg, iconColor: tokenSuccess.darker};
}

function getPriorityTone(priority: ActionTrackerItem['priority']) {
  if (priority === 'High') return {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider};
  if (priority === 'Medium') return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider};
  return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider};
}

function getStatusTone(status: ActionTrackerItem['status']) {
  if (status === 'Completed') return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider};
  if (status === 'Reopened') return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider};
  if (status === 'Under Approval') return {bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenDivider};
  if (status === 'Canceled') return {bg: tokenNeutral.light, color: tokenText.secondary, border: tokenDivider};
  if (status === 'Overdue') return {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider};
  return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider};
}

function getTypeIcon(type: TimelineEntryType) {
  if (type === 'assistant') return <AutoAwesomeIcon sx={{fontSize: 14}} />;
  if (type === 'comment') return <PersonOutlineOutlinedIcon sx={{fontSize: 14}} />;
  if (type === 'escalation') return <FlagOutlinedIcon sx={{fontSize: 14}} />;
  if (type === 'nc') return <TipsAndUpdatesOutlinedIcon sx={{fontSize: 14}} />;
  return <CheckCircleOutlineIcon sx={{fontSize: 14}} />;
}

function isTmsSource(source: ActionTrackerItem['source']) {
  return source === 'TMS 1' || source === 'TMS 2' || source === 'TMS 3' || source === 'Tier';
}

function normalizeTierTitle(value: string) {
  const match = value.match(/tier\s*([123])/i) || value.match(/tms\s*([123])/i);
  return match ? `Tier ${match[1]}` : value;
}

function formatDateLabel(value: Date) {
  return value.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateInputValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function resolveCreatedByValue(item: ActionTrackerItem) {
  return item.createdBy.trim() || item.assignedTo.trim() || 'John Smith';
}

function resolveDetailTitle(item: ActionTrackerItem) {
  const trimmedTitle = item.title.trim();
  const trimmedProblem = item.problem.trim();
  if (!trimmedProblem) return trimmedTitle;
  if (trimmedTitle.endsWith('...')) return trimmedProblem;
  return trimmedTitle || trimmedProblem;
}

function buildVoiceCommentDraft(item: ActionTrackerItem) {
  const leadSentence = item.problem
    .split('.')
    .map((part) => part.trim())
    .find(Boolean);

  if (!leadSentence) {
    return `Please review ${item.id} and confirm the next owner follow-up.`;
  }

  return `${leadSentence}. Please confirm containment and next owner follow-up.`;
}

function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function readAttachmentFile(file: File): Promise<ActionTrackerAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read attachment.'));
        return;
      }

      resolve({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read attachment.'));
    reader.readAsDataURL(file);
  });
}

export default function ActionTrackerDetailsDialog({}: ActionTrackerDetailsDialogProps) {
  const {
    selectedActionTrackerItem: item,
    closeActionTrackerDetails: onClose,
    currentUserName,
  } = useActionTrackerContext();
  const { setCurrentScreen } = useWorkstationContext();
  const open = Boolean(item);
  const {items, updateAction} = useActionTrackerItems();
  const currentItem = useMemo(
    () => (item ? items.find((candidate) => candidate.id === item.id) ?? item : null),
    [item, items],
  );
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [isCommentVoiceCapturing, setIsCommentVoiceCapturing] = useState(false);
  const [escalateAnchor, setEscalateAnchor] = useState<HTMLElement | null>(null);
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [reassignAssignee, setReassignAssignee] = useState('');
  const [reassignJustification, setReassignJustification] = useState('');
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendDueDate, setExtendDueDate] = useState('');
  const [extendJustification, setExtendJustification] = useState('');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [completeImplementedSolution, setCompleteImplementedSolution] = useState('');
  const [completeImplementationAttachments, setCompleteImplementationAttachments] = useState<ActionTrackerAttachment[]>([]);
  const [cancelJustification, setCancelJustification] = useState('');
  const [detailPanelTab, setDetailPanelTab] = useState<DetailPanelTab>('activity');
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>('owner-follow-up');
  const [implementedSolutionError, setImplementedSolutionError] = useState(false);
  const [isReadingImplementationAttachments, setIsReadingImplementationAttachments] = useState(false);
  const pendingTimersRef = useRef<number[]>([]);
  const implementationAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const suggestedAssignee = useMemo(
    () => actionTrackerPeople.find((person) => person !== currentItem?.assignedTo) ?? actionTrackerPeople[0],
    [currentItem],
  );
  const workflowPermissionConfig = useMemo(() => ({
    allowedUsers: [currentUserName],
    requireJustification: true,
    captureJustification: true,
  }), [currentUserName]);
  const isReassignJustificationRequired = workflowPermissionConfig.requireJustification !== false;
  const isExtendJustificationRequired = workflowPermissionConfig.requireJustification !== false;
  const currentItemId = currentItem?.id;

  useEffect(() => {
    if (!currentItem || !open) return;
    setDetailState(readStoredState(currentItem));
    setCommentDraft('');
    setReassignAssignee(suggestedAssignee);
    setReassignJustification('');
    setExtendDueDate(formatDateInputValue(currentItem.dueDate));
    setExtendJustification('');
    setIsCompleteDialogOpen(false);
    setIsCancelDialogOpen(false);
    setCompleteImplementedSolution(currentItem.implementedSolution ?? '');
    setCompleteImplementationAttachments(currentItem.implementationAttachments ?? []);
    setCancelJustification('');
    setExpandedSuggestionId('owner-follow-up');
    setIsCommentVoiceCapturing(false);
    setImplementedSolutionError(false);
  }, [currentItemId, open]);

  useEffect(() => {
    if (!currentItem || !detailState) return;
    writeStoredState(currentItem.id, detailState);
  }, [currentItem, detailState]);

  useEffect(() => () => {
    pendingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    pendingTimersRef.current = [];
  }, []);

  const updateState = (updater: (current: DetailState) => DetailState) => {
    setDetailState((current) => (current ? updater(current) : current));
  };

  const updateItem = <K extends keyof ActionTrackerItem>(field: K, value: ActionTrackerItem[K]) => {
    if (!currentItem) return;
    updateAction(currentItem.id, {[field]: value} as Partial<ActionTrackerItem>);
  };

  const prependFeed = (entry: TimelineEntry) => {
    updateState((current) => ({...current, feed: [entry, ...current.feed]}));
  };

  const replaceFeedEntry = (entryId: string, nextEntry: TimelineEntry) => {
    updateState((current) => ({
      ...current,
      feed: current.feed.map((entry) => (entry.id === entryId ? nextEntry : entry)),
    }));
  };

  const markSuggestionUsed = (suggestionId: string) => {
    updateState((current) => (
      current.usedSuggestions.includes(suggestionId)
        ? current
        : {...current, usedSuggestions: [...current.usedSuggestions, suggestionId]}
    ));
  };

  const queueTypingEntry = (target: string, pendingId: string, suggestionId?: string) => {
    if (!currentItem) return;
    if (suggestionId) markSuggestionUsed(suggestionId);

    prependFeed({
      id: pendingId,
      type: 'assistant',
      actor: 'My Ia Assistent',
      title: `Escalating to ${target}`,
      detail: 'typing',
      timestamp: 'typing...',
      typing: true,
    });

    const timer = window.setTimeout(() => {
      const completedTimestamp = 'May 06, 2026, 18:56';
      const escalationDetail = `The escalation was sent with the NC context, current owner, and validation status.`;
      replaceFeedEntry(pendingId, {
        id: `${pendingId}-done`,
        type: 'escalation',
        actor: 'My Ia Assistent',
        title: `Escalated to ${target}`,
        detail: escalationDetail,
        timestamp: completedTimestamp,
      });
      addEscalationTagFromAction({
        action: currentItem,
        actor: 'My Ia Assistent',
        detail: `${currentItem.id} escalated to ${target}. ${escalationDetail}`,
        target,
        timestamp: completedTimestamp,
      });
      updateState((current) => ({
        ...current,
        escalationTarget: target,
        supportLabel: `${target} support requested`,
      }));
    }, 1100);

    pendingTimersRef.current.push(timer);
  };

  const escalationTargets = useMemo(() => {
    if (!currentItem) return [] as string[];
    const sourceTitle = normalizeTierTitle(currentItem.source);
    const targets = readEscalationTargetsForSource(sourceTitle);
    return targets.length ? targets : ['Tier 2'];
  }, [currentItem]);

  const handleEscalate = (target: string, suggestionId?: string) => {
    if (!currentItem || !isTmsSource(currentItem.source)) {
      setEscalateAnchor(null);
      return;
    }
    setEscalateAnchor(null);
    const workflowIssue: WorkflowIssue = {
      id: currentItem.id,
      category: currentItem.category,
      createdAt: currentItem.creationDate,
      creator: currentItem.createdBy,
      detail: currentItem.problem,
      highlight: 'solid',
      location: currentItem.location,
      priority: currentItem.priority,
      sourceWorkstationTitle: normalizeTierTitle(currentItem.source),
      state: 'Open',
      targetWorkstationTitle: normalizeTierTitle(currentItem.source),
      title: currentItem.title,
    };
    escalateWorkflowIssue(workflowIssue, target);
    queueTypingEntry(target, `pending-${Date.now()}`, suggestionId);
  };

  const handleSendComment = () => {
    const nextComment = commentDraft.trim();
    if (!nextComment) return;

    prependFeed({
      id: `comment-${Date.now()}`,
      type: 'comment',
      actor: 'John Smith',
      title: nextComment,
      timestamp: 'May 06, 2026, 18:58',
    });
    setCommentDraft('');
  };

  const handleStartCommentVoiceCapture = () => {
    if (!currentItem || isCommentVoiceCapturing) return;

    setIsCommentVoiceCapturing(true);
    const timer = window.setTimeout(() => {
      const generatedDraft = buildVoiceCommentDraft(currentItem);
      setCommentDraft((current) => current.trim() ? `${current.trim()} ${generatedDraft}` : generatedDraft);
      setIsCommentVoiceCapturing(false);
    }, 850);

    pendingTimersRef.current.push(timer);
  };

  const handleMarkComplete = () => {
    if (!currentItem || currentItem.status === 'Completed') return;
    setCompleteImplementedSolution(currentItem.implementedSolution ?? '');
    setCompleteImplementationAttachments(currentItem.implementationAttachments ?? []);
    setImplementedSolutionError(false);
    setIsCompleteDialogOpen(true);
  };

  const handleStartAction = () => {
    if (!currentItem || currentItem.status !== 'Open') return;
    updateAction(currentItem.id, {status: 'In Progress'});
    prependFeed({
      id: `start-${Date.now()}`,
      type: 'created',
      actor: currentUserName,
      title: 'Action started',
      detail: 'Status changed from Open to In Progress.',
      timestamp: formatDateLabel(new Date()),
    });
  };

  const handleSubmitComplete = () => {
    if (!currentItem || currentItem.status === 'Completed') return;
    if (!isImplementedSolutionPresent(completeImplementedSolution)) {
      setImplementedSolutionError(true);
      return;
    }
    updateAction(currentItem.id, {
      status: 'Completed',
      implementedSolution: completeImplementedSolution.trim(),
      implementationAttachments: completeImplementationAttachments,
    });
    prependFeed({
      id: `complete-${Date.now()}`,
      type: 'created',
      actor: 'John Smith',
      title: 'Marked as complete',
      timestamp: 'May 06, 2026, 19:02',
    });
    setImplementedSolutionError(false);
    setIsCompleteDialogOpen(false);
  };

  const handleOpenCancelDialog = () => {
    if (!currentItem || currentItem.status === 'Completed' || currentItem.status === 'Canceled') return;
    setCancelJustification(currentItem.cancellationJustification ?? '');
    setIsCancelDialogOpen(true);
  };

  const handleSubmitCancelAction = () => {
    if (!currentItem || !cancelJustification.trim()) return;
    updateAction(currentItem.id, {
      status: 'Canceled',
      cancellationJustification: cancelJustification.trim(),
    });
    prependFeed({
      id: `cancel-${Date.now()}`,
      type: 'created',
      actor: currentUserName,
      title: 'Action canceled',
      detail: `Justification: ${cancelJustification.trim()}`,
      timestamp: formatDateLabel(new Date()),
    });
    setIsCancelDialogOpen(false);
  };

  const handleImplementationAttachmentSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsReadingImplementationAttachments(true);
    try {
      const nextAttachments = await Promise.all(Array.from(files).map((file) => readAttachmentFile(file)));
      setCompleteImplementationAttachments((current) => [...current, ...nextAttachments]);
    } finally {
      setIsReadingImplementationAttachments(false);
      if (implementationAttachmentInputRef.current) {
        implementationAttachmentInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImplementationAttachment = (attachmentId: string) => {
    setCompleteImplementationAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleReopenAction = () => {
    if (!currentItem || (currentItem.status !== 'Completed' && currentItem.status !== 'Canceled')) return;
    updateAction(currentItem.id, {status: 'Reopened'});
    prependFeed({
      id: `reopen-${Date.now()}`,
      type: 'created',
      actor: 'John Smith',
      title: 'Action reopened',
      detail: 'Additional work was requested before final closure.',
      timestamp: formatDateLabel(new Date()),
    });
  };

  const handleOpenReassignDialog = () => {
    setReassignAssignee(suggestedAssignee);
    setReassignJustification('');
    setIsReassignDialogOpen(true);
  };

  const handleSubmitReassign = () => {
    if (!currentItem) return;
    const result = buildReassignmentChange(
      currentItem,
      currentUserName,
      reassignAssignee,
      reassignJustification,
      workflowPermissionConfig,
    );
    if (!result.ok) return;
    updateAction(currentItem.id, result.updates);
    prependFeed({
      id: result.historyEntry.id,
      type: 'created',
      actor: result.historyEntry.changedBy,
      title: `Reassigned from ${result.historyEntry.previousOwner} to ${result.historyEntry.newOwner}`,
      detail: result.historyEntry.justification ? `Justification: ${result.historyEntry.justification}` : undefined,
      timestamp: result.historyEntry.timestamp,
    });
    setIsReassignDialogOpen(false);
  };

  const handleOpenExtendDialog = () => {
    if (!currentItem) return;
    setExtendDueDate(formatDateInputValue(currentItem.dueDate));
    setExtendJustification('');
    setIsExtendDialogOpen(true);
  };

  const handleSubmitExtend = () => {
    if (!currentItem || !extendDueDate) return;
    const nextDueDate = new Date(`${extendDueDate}T00:00:00`);
    if (Number.isNaN(nextDueDate.getTime())) return;
    const result = buildDueDateExtensionChange(
      currentItem,
      currentUserName,
      formatDateLabel(nextDueDate),
      extendJustification,
      workflowPermissionConfig,
    );
    if (!result.ok) return;
    updateAction(currentItem.id, {
      ...result.updates,
      suggestedActions: clearDueDateExtensionRequestMetadata(currentItem.suggestedActions),
    });
    prependFeed({
      id: result.historyEntry.id,
      type: 'created',
      actor: result.historyEntry.changedBy,
      title: `Due date updated from ${result.historyEntry.originalDueDate} to ${result.historyEntry.newDueDate}`,
      detail: result.historyEntry.justification ? `Justification: ${result.historyEntry.justification}` : undefined,
      timestamp: result.historyEntry.timestamp,
    });
    setIsExtendDialogOpen(false);
  };

  const priorityTone = currentItem ? getPriorityTone(currentItem.priority) : null;
  const statusTone = currentItem ? getStatusTone(currentItem.status) : null;
  const canEscalate = currentItem ? isTmsSource(currentItem.source) : false;
  const safeFeed = detailState?.feed ?? [];
  const createdByValue = currentItem ? resolveCreatedByValue(currentItem) : 'John Smith';
  const sourceDetails = currentItem ? getActionTrackerSourceDetails(currentItem) : getActionTrackerSourceDetails({});
  const handleOpenOriginRecord = () => {
    if (!currentItem?.originScreen) return;
    onClose();
    setCurrentScreen(currentItem.originScreen as any);
  };
  const detailTitle = currentItem ? resolveDetailTitle(currentItem) : '';
  const commentsCount = safeFeed.filter((entry) => entry.type === 'comment').length;
  const attachmentItems = currentItem?.attachments ?? [];
  const implementationAttachmentItems = currentItem?.implementationAttachments ?? [];
  const visibleFeed = detailPanelTab === 'comments'
    ? safeFeed.filter((entry) => entry.type === 'comment')
    : safeFeed.filter((entry) => entry.type !== 'comment');

  const suggestionCards = useMemo(() => {
    if (!currentItem || !detailState) return [];
    const tier3Used = detailState.escalationTarget === 'Tier 3' || detailState.usedSuggestions.includes('tier-3');
    const followUpUsed = detailState.usedSuggestions.includes('owner-follow-up');
    const summaryUsed = detailState.usedSuggestions.includes('summary');

    return [
      {
        id: 'owner-follow-up',
        title: 'Draft follow-up with owner',
        detail: `Create a message to ${currentItem.assignedTo} summarizing the action and next verification.`,
        used: followUpUsed,
        onClick: () => {
          markSuggestionUsed('owner-follow-up');
          prependFeed({
            id: `owner-follow-up-${Date.now()}`,
            type: 'assistant',
            actor: 'My Ia Assistent',
            title: `Follow-up drafted for ${currentItem.assignedTo}`,
            detail: 'Draft ready asking for containment confirmation and next validation timing.',
            timestamp: 'May 06, 2026, 18:57',
          });
        },
      },
      {
        id: 'tier-3',
        title: 'Suggest escalation due to high priority',
        detail: canEscalate
          ? `Recommend escalation to Tier 3 if containment is delayed on ${currentItem.location}.`
          : 'Escalation is only available for actions whose source is TMS 1, TMS 2, or TMS 3.',
        used: tier3Used || !canEscalate,
        onClick: () => handleEscalate('Tier 3', 'tier-3'),
      },
      {
        id: 'summary',
        title: 'Summarize recent comments',
        detail: 'Generate a quick summary of the latest activity and feedback.',
        used: summaryUsed,
        onClick: () => {
          markSuggestionUsed('summary');
          prependFeed({
            id: `summary-${Date.now()}`,
            type: 'assistant',
            actor: 'My Ia Assistent',
            title: 'Comment summary generated',
            detail: 'The NC was created, owner is assigned, and escalation remains the main next decision.',
            timestamp: 'May 06, 2026, 18:59',
          });
        },
      },
    ];
  }, [canEscalate, currentItem, detailState]);

  const aiInsightCards = useMemo(() => {
    if (!currentItem) return [];
    return [
      {
        id: 'due-pressure',
        icon: <CalendarMonthOutlinedIcon sx={{fontSize: 16}} />,
        label: 'Due Date Pressure',
        value: currentItem.dueDate,
        tone: currentItem.priority === 'High' ? {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider} : currentItem.priority === 'Medium' ? {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider} : {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider},
      },
      {
        id: 'escalation-risk',
        icon: <FlagOutlinedIcon sx={{fontSize: 16}} />,
        label: 'Escalation Risk',
        value: canEscalate ? 'Escalation available' : 'Monitor only',
        tone: canEscalate ? {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider} : {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider},
      },
      {
        id: 'ai-recommendation',
        icon: <AutoAwesomeIcon sx={{fontSize: 16}} />,
        label: 'AI Recommendation',
        value: canEscalate ? 'Confirm containment or escalate' : 'Follow suggested actions',
        tone: {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider},
      },
    ];
  }, [canEscalate, currentItem]);

  if (!currentItem || !detailState || !priorityTone || !statusTone) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'min(1260px, calc(100vw - 24px))',
          maxWidth: 'none',
          height: 'min(780px, calc(100vh - 24px))',
          maxHeight: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
          bgcolor: 'background.default',
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 4px 10px rgba(0,31,155,0.12)',
        },
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, px: 2, py: 1.6, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`}}>
          <Box sx={{minWidth: 0, flex: 1, pr: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
              <Typography sx={detailLabelSx}>
                ACTION DETAILS
              </Typography>
              <Chip label={`#${currentItem.id}`} sx={{height: 26, bgcolor: tokenNeutral.light, color: tokenText.primary, border: 'none', fontWeight: 400, borderRadius: '999px'}} />
              <Chip
                label={currentItem.status}
                sx={{
                  height: 26,
                  bgcolor: statusTone.bg,
                  border: `1px solid ${statusTone.border}`,
                  color: statusTone.color,
                  fontWeight: 400,
                  borderRadius: '999px',
                }}
              />
            </Box>
            <TextField
              fullWidth
              variant="standard"
              multiline
              minRows={1}
              value={detailTitle}
              onChange={(event) => updateItem('title', event.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  mt: 0.35,
                  alignItems: 'flex-start',
                  fontSize: 24,
                  fontWeight: 700,
                  color: tokenText.primary,
                  lineHeight: 1.334,
                  '& textarea': {
                    p: 0,
                    lineHeight: 1.334,
                    overflow: 'hidden !important',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    resize: 'none',
                  },
                },
              }}
            />
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1, mt: 0.5, flexWrap: 'wrap'}}>
              <Typography sx={{fontSize: 13, color: tokenText.secondary}}>Owner: <Box component="span" sx={{color: tokenText.primary, fontWeight: 500}}>{currentItem.assignedTo}</Box></Typography>
              <Typography sx={{fontSize: 13, color: tokenText.secondary}}>Due date: <Box component="span" sx={{color: tokenText.primary, fontWeight: 500}}>{currentItem.dueDate}</Box></Typography>
              <Typography sx={{fontSize: 13, color: tokenText.secondary}}>Source: <Box component="span" sx={{color: tokenText.primary, fontWeight: 500}}>{sourceDetails.source || '—'}</Box></Typography>
              <Chip
                label={currentItem.priority}
                sx={{height: 24, bgcolor: priorityTone.bg, color: priorityTone.color, border: `1px solid ${priorityTone.border}`, fontWeight: 400, borderRadius: '999px'}}
              />
            </Box>
          </Box>
          <Tooltip title="Close">
            <IconButton onClick={onClose} sx={{mt: 0.1, color: tokenText.secondary}}>
              <CloseIcon sx={{fontSize: 19}} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{px: 2, py: 1.15, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`}}>
          <Box sx={{display: 'flex', gap: 0.85, flexWrap: 'wrap'}}>
            {currentItem.status === 'Open' ? (
              <Button variant="outlined" onClick={handleStartAction} sx={{...detailOutlinedButtonSx, height: 38}}>
                Start Action
              </Button>
            ) : null}
            <Button variant="outlined" color="error" onClick={handleOpenCancelDialog} disabled={currentItem.status === 'Completed' || currentItem.status === 'Canceled'} sx={{...detailButtonSx, height: 38}}>
              Cancel Action
            </Button>
            <Button variant="outlined" onClick={handleOpenExtendDialog} sx={{...detailOutlinedButtonSx, height: 38}}>
              Extend Due Date
            </Button>
            <Button variant="outlined" onClick={handleOpenReassignDialog} sx={{...detailOutlinedButtonSx, height: 38}}>
              Reassign
            </Button>
            {canEscalate ? (
              <Button variant="outlined" onClick={(event) => setEscalateAnchor(event.currentTarget)} sx={{...detailOutlinedButtonSx, height: 38}}>
                Escalate
              </Button>
            ) : null}
            {(currentItem.status === 'Completed' || currentItem.status === 'Canceled') ? (
              <Button variant="outlined" onClick={handleReopenAction} sx={{...detailOutlinedButtonSx, height: 38}}>
                Reopen Action
              </Button>
            ) : null}
            <Button variant="contained" onClick={handleMarkComplete} disabled={currentItem.status === 'Completed'} sx={{...detailContainedButtonSx, height: 38}}>
              Mark as Complete
            </Button>
          </Box>
        </Box>

        <Box sx={{px: 1.5, pt: 1.5, pb: 0}}>
          <Paper elevation={0} sx={{...detailPanelSx, bgcolor: '#F8FAFC'}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{...detailLabelSx, display: 'flex', alignItems: 'center', gap: 0.6}}>
                  <AutoAwesomeIcon sx={{fontSize: 14, color: tokenBrand.main}} />
                  AI Insight
                </Typography>
                <Typography sx={{mt: 0.3, fontSize: 14, color: tokenText.primary, fontWeight: 500, lineHeight: 1.57}}>
                  {canEscalate
                    ? 'Escalation is recommended if containment is not confirmed within 24 hours.'
                    : 'This action is being monitored and AI suggestions remain available for next steps.'}
                </Typography>
                <Typography sx={{mt: 0.35, fontSize: 12, color: tokenText.secondary, lineHeight: 1.3}}>
                  BLU.AI correlated owner, due date pressure, source, and latest activity to recommend the next operational step.
                </Typography>
              </Box>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 0.9, mt: 1.15}}>
              {aiInsightCards.map((card) => (
                <Box key={card.id} sx={{display: 'flex', alignItems: 'flex-start', gap: 0.8, p: 1, borderRadius: '6px', bgcolor: 'rgba(0,0,0,0.03)', border: `1px solid ${tokenDivider}`}}>
                  <Box sx={{color: card.tone.color, display: 'grid', placeItems: 'center', flexShrink: 0, mt: 0.2}}>
                    {card.icon}
                  </Box>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, fontWeight: 700, lineHeight: 1.3, letterSpacing: '1px', textTransform: 'uppercase'}}>
                      {card.label}
                    </Typography>
                    <Typography sx={{fontSize: 13, color: tokenText.primary, fontWeight: 500, lineHeight: 1.35, mt: 0.2}}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1.9fr) 380px'}, gap: 1.5, alignItems: 'start'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2, minHeight: 0}}>
            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={detailLabelSx}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                variant="standard"
                value={currentItem.problem}
                onChange={(event) => updateItem('problem', event.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    mt: 0.45,
                    fontSize: 14,
                    color: tokenText.primary,
                    lineHeight: 1.6,
                    '& textarea': {p: 0},
                  },
                }}
              />
            </Paper>

            {(isImplementedSolutionPresent(currentItem.implementedSolution) || implementationAttachmentItems.length > 0) ? (
              <Paper elevation={0} sx={detailPanelSx}>
                <Typography sx={detailLabelSx}>
                  Implemented Solution
                </Typography>
                {isImplementedSolutionPresent(currentItem.implementedSolution) ? (
                  <Typography sx={{mt: 0.65, fontSize: 14, color: tokenText.primary, lineHeight: 1.6, whiteSpace: 'pre-wrap'}}>
                    {currentItem.implementedSolution}
                  </Typography>
                ) : null}
                {implementationAttachmentItems.length ? (
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.1, mt: isImplementedSolutionPresent(currentItem.implementedSolution) ? 1.1 : 0.75}}>
                    {implementationAttachmentItems.map((attachment) => {
                      const kind = getActionTrackerAttachmentKind(attachment);
                      return (
                        <Paper key={attachment.id} elevation={0} sx={{p: 1.1, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper'}}>
                          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.85}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
                              <Box sx={{width: 28, height: 28, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                                {kind === 'image'
                                  ? <ImageOutlinedIcon sx={{fontSize: 17}} />
                                  : kind === 'pdf'
                                    ? <PictureAsPdfOutlinedIcon sx={{fontSize: 17}} />
                                    : <DownloadOutlinedIcon sx={{fontSize: 17}} />}
                              </Box>
                              <Box sx={{minWidth: 0}}>
                                <Typography sx={{fontSize: 12.5, color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                  {attachment.name}
                                </Typography>
                                <Typography sx={{fontSize: 11, color: tokenText.secondary}}>
                                  {formatAttachmentSize(attachment.size)}
                                </Typography>
                              </Box>
                            </Box>
                            <Button component="a" href={attachment.dataUrl} download={attachment.name} variant="outlined" startIcon={<DownloadOutlinedIcon sx={{fontSize: 15}} />} sx={{...detailOutlinedButtonSx, height: 28, flexShrink: 0}}>
                              Download
                            </Button>
                          </Box>

                          {kind === 'image' ? (
                            <Box component="img" src={attachment.dataUrl} alt={attachment.name} sx={{width: '100%', height: 220, objectFit: 'cover', borderRadius: 1.2, border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper'}} />
                          ) : kind === 'pdf' ? (
                            <Box component="iframe" src={attachment.dataUrl} title={attachment.name} sx={{width: '100%', height: 220, border: `1px solid ${tokenDivider}`, borderRadius: 1.2, bgcolor: 'background.paper'}} />
                          ) : null}
                        </Paper>
                      );
                    })}
                  </Box>
                ) : null}
              </Paper>
            ) : null}

            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={{...detailLabelSx, mb: 1.1}}>
                Attachments
              </Typography>
              {attachmentItems.length ? (
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 1.1}}>
                  {attachmentItems.map((attachment) => {
                    const kind = getActionTrackerAttachmentKind(attachment);
                    return (
                      <Paper key={attachment.id} elevation={0} sx={{p: 1.1, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.85}}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
                            <Box sx={{width: 28, height: 28, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                              {kind === 'image'
                                ? <ImageOutlinedIcon sx={{fontSize: 17}} />
                                : kind === 'pdf'
                                  ? <PictureAsPdfOutlinedIcon sx={{fontSize: 17}} />
                                  : <DownloadOutlinedIcon sx={{fontSize: 17}} />}
                            </Box>
                            <Box sx={{minWidth: 0}}>
                              <Typography sx={{fontSize: 12.5, color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                {attachment.name}
                              </Typography>
                              <Typography sx={{fontSize: 11, color: tokenText.secondary}}>
                                {formatAttachmentSize(attachment.size)}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            component="a"
                            href={attachment.dataUrl}
                            download={attachment.name}
                            variant="outlined"
                            startIcon={<DownloadOutlinedIcon sx={{fontSize: 15}} />}
                            sx={{...detailOutlinedButtonSx, height: 28, flexShrink: 0}}
                          >
                            Download
                          </Button>
                        </Box>

                        {kind === 'image' ? (
                          <Box
                            component="img"
                            src={attachment.dataUrl}
                            alt={attachment.name}
                            sx={{
                              width: '100%',
                              height: 220,
                              objectFit: 'cover',
                              borderRadius: 1.2,
                              border: `1px solid ${tokenDivider}`,
                              bgcolor: 'background.paper',
                            }}
                          />
                        ) : null}

                        {kind === 'pdf' ? (
                          <Box
                            component="iframe"
                            src={attachment.dataUrl}
                            title={attachment.name}
                            sx={{
                              width: '100%',
                              height: 240,
                              border: `1px solid ${tokenDivider}`,
                              borderRadius: '8px',
                              bgcolor: 'background.paper',
                            }}
                          />
                        ) : null}

                        {kind === 'download' ? (
                          <Typography sx={{fontSize: 12, color: tokenText.secondary, lineHeight: 1.5}}>
                            Preview is not available for this file type. Download the file to inspect it.
                          </Typography>
                        ) : null}
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Typography sx={{fontSize: 12.5, color: tokenText.secondary}}>
                  No attachments were added to this action.
                </Typography>
              )}
            </Paper>

            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={{...detailLabelSx, mb: 1.1}}>
                Classification
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2}}>
                <Box>
                  <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Category</Typography>
                  <Select value={currentItem.category} onChange={(event) => updateItem('category', event.target.value as ActionCategory)} variant="standard" disableUnderline sx={{...detailValueSx, '& .MuiSelect-select': {p: 0}}}>
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>{formatCategoryLabel(option)}</MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Type</Typography>
                  <Select value={currentItem.type} onChange={(event) => updateItem('type', event.target.value as ActionType)} variant="standard" disableUnderline sx={{...detailValueSx, '& .MuiSelect-select': {p: 0}}}>
                    {getTypeOptions(currentItem.category).map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Priority</Typography>
                  <Chip label={currentItem.priority} sx={{height: 26, bgcolor: priorityTone.bg, color: priorityTone.color, border: `1px solid ${priorityTone.border}`, fontWeight: 400, borderRadius: '999px'}} />
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={{...detailLabelSx, mb: 1.1}}>
                Operational Context
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2}}>
                {[
                  {label: 'Plant', value: currentItem.plant || '—'},
                  {label: 'Area', value: currentItem.area || '—'},
                  {label: 'Unit', value: currentItem.unit || '—'},
                  {label: 'Line', value: currentItem.line || '—'},
                  {label: 'Zone', value: currentItem.zone || '—'},
                  {label: 'Machine', value: currentItem.machine || '—'},
                ].map((field) => (
                  <Box key={field.label}>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>{field.label}</Typography>
                    <Typography sx={detailValueSx}>{field.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={{...detailLabelSx, mb: 1.1}}>
                Ownership
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2}}>
                {[
                  {label: 'Owner', value: currentItem.assignedTo, field: 'assignedTo' as const, tone: tokenNeutral.light},
                  {label: 'Created By', value: createdByValue, field: 'createdBy' as const, tone: tokenNeutral.light},
                  {label: 'Approver', value: currentItem.approver, field: 'approver' as const, tone: tokenNeutral.light},
                ].map((field) => (
                  <Box key={field.label} sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                    <Avatar sx={{width: 30, height: 30, bgcolor: field.tone, color: tokenText.primary, fontSize: 11, fontWeight: 400}}>
                      {getInitials(field.value)}
                    </Avatar>
                    <Box sx={{minWidth: 0, flex: 1}}>
                      <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.2}}>{field.label}</Typography>
                      <Select value={field.value} onChange={(event) => updateItem(field.field, event.target.value)} variant="standard" disableUnderline sx={{...detailValueSx, width: '100%', '& .MuiSelect-select': {p: 0}}}>
                        {actionTrackerPeople.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            {sourceDetails.hasAdditionalDetails ? (
            <Paper elevation={0} sx={detailPanelSx}>
              <Typography sx={{...detailLabelSx, mb: 1.1}}>
                Source Details
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2}}>
                {sourceDetails.reference ? (
                  <Box>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Reference</Typography>
                    <Typography sx={detailValueSx}>{sourceDetails.reference}</Typography>
                  </Box>
                ) : null}
                {sourceDetails.meetingDate ? (
                  <Box>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Meeting Date</Typography>
                    <Typography sx={detailValueSx}>{sourceDetails.meetingDate}</Typography>
                  </Box>
                ) : null}
                {sourceDetails.showTierLevel && sourceDetails.tierLevel ? (
                  <Box>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.35}}>Tier Level</Typography>
                    <Typography sx={detailValueSx}>{sourceDetails.tierLevel}</Typography>
                  </Box>
                ) : null}
                {sourceDetails.showBackReference ? (
                  <Box sx={{gridColumn: {xs: '1 / -1', md: 'span 2'}}}>
                    <Typography sx={{fontSize: 12, color: tokenText.secondary, mb: 0.5}}>Back Reference</Typography>
                    <Button
                      onClick={handleOpenOriginRecord}
                      variant="outlined"
                      sx={{...detailOutlinedButtonSx, height: 32}}
                    >
                      {currentItem.originRecordId ? `Open source record ${currentItem.originRecordId}` : 'Open source record'}
                    </Button>
                  </Box>
                ) : null}
              </Box>
            </Paper>
            ) : null}

            <Paper elevation={0} sx={{...detailPanelSx, bgcolor: '#F8FAFC'}}>
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{...detailLabelSx, display: 'flex', alignItems: 'center', gap: 0.6}}>
                    <AutoAwesomeIcon sx={{fontSize: 14, color: tokenBrand.main}} />
                    AI Suggested Actions
                  </Typography>
                  <Typography sx={{mt: 0.35, fontSize: 14, color: tokenText.primary, fontWeight: 500, lineHeight: 1.5}}>
                    {canEscalate
                      ? 'Escalation is recommended if containment is not confirmed within 24 hours.'
                      : 'This action is being monitored and AI suggestions remain available for next steps.'}
                  </Typography>
                  <Typography sx={{mt: 0.45, fontSize: 12.5, color: tokenText.secondary, lineHeight: 1.5}}>
                    Expand to review the suggested actions, the written recommendation, and the next step BLU.AI wants the team to take.
                  </Typography>
                </Box>
                <Button
                  onClick={() => updateState((current) => ({...current, assistantExpanded: !current.assistantExpanded}))}
                  size="small"
                  sx={{
                    color: tokenText.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    minWidth: 0,
                    px: 0.5,
                    py: 0,
                    flexShrink: 0,
                    '&:hover': {bgcolor: 'transparent', color: tokenText.primary},
                  }}
                >
                  {detailState.assistantExpanded ? 'Collapse' : 'Expand'}
                </Button>
              </Box>
              {detailState.assistantExpanded ? (
                <>
                  <Divider sx={{my: 1.2}} />
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>
                    {suggestionCards.map((card) => (
                      <Box key={card.id} sx={{p: 1.05, bgcolor: 'background.paper', borderRadius: '8px', border: `1px solid ${tokenDivider}`}}>
                        <Button
                          onClick={() => setExpandedSuggestionId((current) => (current === card.id ? null : card.id))}
                          endIcon={<KeyboardArrowDownIcon sx={{fontSize: 18, transform: expandedSuggestionId === card.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease'}} />}
                          sx={{width: '100%', px: 0, py: 0, justifyContent: 'space-between', alignItems: 'flex-start', color: 'inherit', textTransform: 'none'}}
                        >
                          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.7, textAlign: 'left'}}>
                            <Box sx={{color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0, mt: 0.15}}>
                              <AutoAwesomeIcon sx={{fontSize: 14}} />
                            </Box>
                            <Box sx={{minWidth: 0}}>
                              <Typography sx={{fontSize: 13.5, color: tokenText.primary, fontWeight: 500, lineHeight: 1.35}}>
                                {card.title}
                              </Typography>
                              <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.25, lineHeight: 1.4}}>
                                {expandedSuggestionId === card.id ? 'Hide suggested action' : 'Show suggested action'}
                              </Typography>
                            </Box>
                          </Box>
                        </Button>
                        {expandedSuggestionId === card.id ? (
                          <Box sx={{mt: 0.95, pl: 3.6}}>
                            <Typography sx={detailLabelSx}>
                              Suggested Action
                            </Typography>
                            <Typography sx={{fontSize: 12.5, color: tokenText.primary, mt: 0.35, lineHeight: 1.55, whiteSpace: 'normal', wordBreak: 'break-word'}}>
                              {card.detail}
                            </Typography>
                            <Button onClick={card.used ? undefined : card.onClick} disabled={card.used} variant="outlined" sx={{...detailOutlinedButtonSx, mt: 0.85, height: 30}}>
                              {card.used ? 'Applied' : 'Use Suggestion'}
                            </Button>
                          </Box>
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                </>
              ) : null}
            </Paper>
          </Box>

          <Paper elevation={0} sx={{display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, overflow: 'hidden', boxShadow: 'none'}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1.3, py: 1.1, borderBottom: `1px solid ${tokenDivider}`}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                <Button onClick={() => setDetailPanelTab('activity')} sx={{minWidth: 0, px: 0, pb: 0.6, borderRadius: 0, borderBottom: detailPanelTab === 'activity' ? `2px solid ${tokenBrand.main}` : '2px solid transparent', color: detailPanelTab === 'activity' ? tokenText.primary : tokenText.secondary, fontWeight: detailPanelTab === 'activity' ? 700 : 500, textTransform: 'none', '&:hover': {bgcolor: 'transparent', color: tokenBrand.main}}}>
                  Activity
                </Button>
                <Button onClick={() => setDetailPanelTab('comments')} sx={{minWidth: 0, px: 0, pb: 0.6, borderRadius: 0, borderBottom: detailPanelTab === 'comments' ? `2px solid ${tokenBrand.main}` : '2px solid transparent', color: detailPanelTab === 'comments' ? tokenText.primary : tokenText.secondary, fontWeight: detailPanelTab === 'comments' ? 700 : 500, textTransform: 'none', '&:hover': {bgcolor: 'transparent', color: tokenBrand.main}}}>
                  Comments ({commentsCount})
                </Button>
              </Box>
              <Tooltip title={detailState.followed ? 'Notifications enabled for this action' : 'Get notified of updates for this action'}>
                <Button
                  onClick={() => updateState((current) => ({...current, followed: !current.followed}))}
                  startIcon={<NotificationsOutlinedIcon sx={{fontSize: 17}} />}
                  sx={{
                    minWidth: 0,
                    borderRadius: '8px',
                    px: 1,
                    color: detailState.followed ? tokenBrand.main : tokenText.secondary,
                    bgcolor: detailState.followed ? tokenBrand.softBg : 'transparent',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {bgcolor: tokenBrand.softBg, color: tokenBrand.main},
                  }}
                >
                  Get notifications
                </Button>
              </Tooltip>
            </Box>

            <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', px: 1.2, py: 1.1}}>
              {visibleFeed.map((entry, index) => {
                const tone = getActivityTone(entry.type);
                const hasLine = index < visibleFeed.length - 1;

                return (
                  <Box key={entry.id} sx={{display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr)', gap: 0.75, mb: 1}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <Box sx={{width: 24, height: 24, borderRadius: '50%', bgcolor: tone.iconBg, color: tone.iconColor, display: 'grid', placeItems: 'center'}}>
                        {getTypeIcon(entry.type)}
                      </Box>
                      {hasLine ? <Box sx={{width: 1, flex: 1, minHeight: 20, bgcolor: tokenDivider, mt: 0.35}} /> : null}
                    </Box>
                    <Box sx={{py: 0.15}}>
                      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 13.5, color: tokenText.primary, fontWeight: 500, lineHeight: 1.35}}>
                            {entry.title}
                          </Typography>
                          <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.1}}>
                            by {entry.actor}
                          </Typography>
                        </Box>
                        <Typography sx={{fontSize: 11, color: tokenText.secondary, whiteSpace: 'nowrap'}}>
                          {entry.timestamp}
                        </Typography>
                      </Box>
                      {entry.detail && !entry.typing ? (
                        <Typography sx={{fontSize: 12.5, color: tokenText.primary, lineHeight: 1.55, mt: 0.45}}>
                          {entry.detail}
                        </Typography>
                      ) : null}
                      {entry.typing ? (
                        <Typography sx={{fontSize: 12.5, color: tokenText.primary, lineHeight: 1.55, mt: 0.45}}>
                          Sending escalation...
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                );
              })}
              {!visibleFeed.length ? (
                <Typography sx={{py: 2.5, textAlign: 'center', color: tokenText.secondary, fontSize: 13}}>
                  No {detailPanelTab} yet.
                </Typography>
              ) : null}
            </Box>

            <Box sx={{px: 1.2, py: 1.1, borderTop: `1px solid ${tokenDivider}`}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                <Avatar sx={{width: 31, height: 31, bgcolor: tokenNeutral.light, color: tokenText.primary, fontSize: 11, fontWeight: 500}}>
                  JS
                </Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Leave a comment..."
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendComment();
                    }
                  }}
                  sx={{'& .MuiOutlinedInput-root': {borderRadius: '8px'}}}
                />
                <IconButton
                  onClick={handleStartCommentVoiceCapture}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: tokenBrand.softBg,
                    color: isCommentVoiceCapturing ? tokenError.main : tokenBrand.main,
                    borderRadius: '8px',
                    boxShadow: isCommentVoiceCapturing ? '0 0 0 4px rgba(220,38,38,0.12)' : 'none',
                    '&:hover': {
                      bgcolor: tokenBrand.softBg,
                    },
                  }}
                >
                  <MicIcon sx={{fontSize: 18}} />
                </IconButton>
                <IconButton onClick={handleSendComment} disabled={!commentDraft.trim()} sx={{width: 34, height: 34, bgcolor: tokenBrand.softBg, color: tokenBrand.main, borderRadius: '8px', '&.Mui-disabled': {bgcolor: tokenNeutral.light, color: tokenText.disabled}}}>
                  <SendRoundedIcon sx={{fontSize: 18}} />
                </IconButton>
              </Box>
              {isCommentVoiceCapturing ? (
                <Typography sx={{fontSize: 11.5, color: tokenText.secondary, mt: 0.65, ml: 4.8}}>
                  Converting voice note into comment...
                </Typography>
              ) : null}
            </Box>
          </Paper>
        </Box>
        </Box>
      </Box>

      <Menu anchorEl={escalateAnchor} open={Boolean(escalateAnchor)} onClose={() => setEscalateAnchor(null)}>
        {escalationTargets.map((target) => (
          <MenuItem key={target} onClick={() => handleEscalate(target)}>
            {target}
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={isReassignDialogOpen} onClose={() => setIsReassignDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{p: 2}}>
          <Typography sx={{fontSize: 20, fontWeight: 700, color: tokenText.primary, mb: 1.5}}>Reassign Action</Typography>
          <Typography sx={{fontSize: 12.5, color: tokenText.secondary, mb: 1}}>
            BLU.AI suggests <Box component="span" sx={{fontWeight: 500, color: tokenText.primary}}>{suggestedAssignee}</Box> for this action.
          </Typography>
          <FormControl fullWidth size="small" sx={{mb: 1.2}}>
            <InputLabel>Assignee</InputLabel>
            <Select value={reassignAssignee} label="Assignee" onChange={(event) => setReassignAssignee(event.target.value)}>
              {actionTrackerPeople.map((person) => (
                <MenuItem key={person} value={person}>{person}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Justification"
            value={reassignJustification}
            onChange={(event) => setReassignJustification(event.target.value)}
            required={isReassignJustificationRequired}
          />
          <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 1}}>
            Owner is updated directly and the reassignment history is recorded automatically.
          </Typography>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2}}>
            <Button onClick={() => setIsReassignDialogOpen(false)} sx={detailButtonSx}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitReassign} disabled={!reassignAssignee.trim() || (isReassignJustificationRequired && !reassignJustification.trim())} sx={detailContainedButtonSx}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={isExtendDialogOpen} onClose={() => setIsExtendDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{p: 2}}>
          <Typography sx={{fontSize: 20, fontWeight: 700, color: tokenText.primary, mb: 1.5}}>Extend Due Date</Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="New due date"
            value={extendDueDate}
            onChange={(event) => setExtendDueDate(event.target.value)}
            InputLabelProps={{shrink: true}}
            sx={{mb: 1.2}}
            required
          />
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={3}
            label="Justification"
            value={extendJustification}
            onChange={(event) => setExtendJustification(event.target.value)}
            required={isExtendJustificationRequired}
          />
          <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 1}}>
            Due date is updated directly and the extension history is recorded automatically.
          </Typography>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2}}>
            <Button onClick={() => setIsExtendDialogOpen(false)} sx={detailButtonSx}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitExtend} disabled={!extendDueDate || (isExtendJustificationRequired && !extendJustification.trim())} sx={detailContainedButtonSx}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={isCompleteDialogOpen} onClose={() => setIsCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{p: 2}}>
          <Typography sx={{fontSize: 20, fontWeight: 700, color: tokenText.primary, mb: 1.5}}>Mark Action as Complete</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Implemented Solution"
            placeholder="Describe the implemented solution before completing this action."
            value={completeImplementedSolution}
            onChange={(event) => {
              setImplementedSolutionError(false);
              setCompleteImplementedSolution(event.target.value);
            }}
            error={implementedSolutionError}
            helperText={implementedSolutionError ? 'Implemented Solution is required before marking this action as completed.' : 'This will be shown in the main action details after completion.'}
            required
          />
          <Box sx={{mt: 1.6}}>
            <Typography sx={{fontSize: 13, fontWeight: 700, color: tokenText.secondary, mb: 0.8}}>
              Add media
            </Typography>
            <Paper
              elevation={0}
              onClick={() => implementationAttachmentInputRef.current?.click()}
              sx={{p: 1.6, borderRadius: 1.6, border: `1px dashed ${tokenDivider}`, bgcolor: tokenNeutral.lightest, textAlign: 'center', cursor: 'pointer'}}
            >
              <CloudUploadOutlinedIcon sx={{fontSize: 28, color: tokenBrand.main, mb: 0.5}} />
              <Typography sx={{fontSize: 13, color: tokenText.primary, fontWeight: 600}}>
                {isReadingImplementationAttachments ? 'Uploading media...' : 'Click to add implementation media'}
              </Typography>
              <Typography sx={{fontSize: 11.5, color: tokenText.secondary, mt: 0.25}}>
                Images, PDF and supporting files for the implemented solution
              </Typography>
            </Paper>
            <input
              ref={implementationAttachmentInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv"
              onChange={(event) => {
                void handleImplementationAttachmentSelect(event.target.files);
              }}
              style={{display: 'none'}}
            />
            {completeImplementationAttachments.length ? (
              <Box sx={{display: 'grid', gap: 0.75, mt: 0.9}}>
                {completeImplementationAttachments.map((attachment) => {
                  const kind = getActionTrackerAttachmentKind(attachment);
                  return (
                    <Paper key={attachment.id} elevation={0} sx={{p: 0.95, borderRadius: 1.2, border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
                        <Box sx={{width: 30, height: 30, borderRadius: 1, bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                          {kind === 'image'
                            ? <ImageOutlinedIcon sx={{fontSize: 17}} />
                            : kind === 'pdf'
                              ? <PictureAsPdfOutlinedIcon sx={{fontSize: 17}} />
                              : <DownloadOutlinedIcon sx={{fontSize: 17}} />}
                        </Box>
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 12.5, color: tokenText.primary, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {attachment.name}
                          </Typography>
                          <Typography sx={{fontSize: 11, color: tokenText.secondary}}>
                            {formatAttachmentSize(attachment.size)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveImplementationAttachment(attachment.id)} sx={{color: tokenError.main, flexShrink: 0}}>
                        <DeleteOutlineIcon sx={{fontSize: 17}} />
                      </IconButton>
                    </Paper>
                  );
                })}
              </Box>
            ) : null}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2}}>
            <Button onClick={() => setIsCompleteDialogOpen(false)} sx={detailButtonSx}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitComplete} disabled={!completeImplementedSolution.trim()} sx={detailContainedButtonSx}>
              Complete Action
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{p: 2}}>
          <Typography sx={{fontSize: 20, fontWeight: 700, color: tokenText.primary, mb: 1.5}}>Cancel Action</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Cancellation Justification"
            placeholder="Describe why this action is being canceled."
            value={cancelJustification}
            onChange={(event) => setCancelJustification(event.target.value)}
            helperText="This justification will remain in the action history."
            required
          />
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2}}>
            <Button onClick={() => setIsCancelDialogOpen(false)} sx={detailButtonSx}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleSubmitCancelAction} disabled={!cancelJustification.trim()} sx={{...detailContainedButtonSx, bgcolor: tokenError.main, '&:hover': {bgcolor: tokenError.darker, boxShadow: 'none'}}}>
              Confirm Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>

    </Dialog>
  );
}
