import React, { createContext, useContext, ReactNode, useState, useRef } from 'react';
import { useAiChat } from '../hooks/useAiChat';
import { AiMessage } from '../types';
import { staffingSignals } from '../data';
import { tierMeetingCards, shiftLogItems, actionTrackerItems } from '../../data/mockData';
import { getUrgentAiTasks } from '../data';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

interface AiContextType {
  aiInput: string;
  setAiInput: (val: string) => void;
  homeChatInput: string;
  setHomeChatInput: (val: string) => void;
  aiMessages: AiMessage[];
  setAiMessages: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  handleAiSend: (message: string, options?: { openDrawer?: boolean }) => void;
  handleStartNewChat: () => void;
  handleShareChat: (mode: 'copy' | 'team' | 'export') => void;
  openMainAiForDocument: (fileName: string) => void;
  openMainAiForWorkflow: (context: string) => void;
  workflowRecommendations: any[];
  chatShareNotice: string;
  setChatShareNotice: (val: string) => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export const AiProvider = ({ 
  children,
  currentUserName,
  setSelectedArtifact,
}: { 
  children: ReactNode;
  currentUserName: string;
  setSelectedArtifact: (artifact: any) => void;
}) => {
  const { setCurrentScreen, setIsAiDrawerOpen } = useWorkstationContext();
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [homeChatInput, setHomeChatInput] = useState('');

  const aiChatActions = useAiChat({
    setCurrentScreen,
    setIsAiDrawerOpen,
    setSelectedArtifact,
    currentUserName,
    aiMessages,
    setAiMessages,
    homeChatInput,
    setHomeChatInput,
  });

  const urgentAiTasks = getUrgentAiTasks(setCurrentScreen);

  const workflowRecommendations = [
    {
      title: 'Cover Maria on Line 10',
      workflow: 'Shift Logbook',
      detail: `${staffingSignals[0].operator} is ${staffingSignals[0].status.toLowerCase()} in ${staffingSignals[0].area}, and ${staffingSignals[0].nextNeed.toLowerCase()}. BD Atlas AI recommends starting a shift swap and notifying ${staffingSignals[0].backup}.`,
      accent: '#38bdf8',
      actionLabel: 'Open Shift Coverage',
      action: () => setCurrentScreen('shift_logbook'),
    },
    {
      title: urgentAiTasks[0].title,
      workflow: 'Work Order Hub',
      detail: `${urgentAiTasks[0].detail} for ${urgentAiTasks[0].owner}. This is already in the urgent queue, so the fastest next step is the maintenance workflow with a draft note ready to send.`,
      accent: urgentAiTasks[0].color,
      actionLabel: 'Open Work Order Hub',
      action: () => setCurrentScreen('work_order_hub'),
    },
    {
      title: actionTrackerItems[1].title,
      workflow: 'Smart Search',
      detail: `${actionTrackerItems[1].status} in Action Tracker and connected to the document flow. BD Atlas AI can take you into Smart Search to narrow the approval queue immediately.`,
      accent: '#FF6E00',
      actionLabel: 'Open Smart Search',
      action: () => setCurrentScreen('smart_search'),
    },
    {
      title: shiftLogItems[1].title,
      workflow: 'Tier Meeting',
      detail: `${shiftLogItems[1].detail} This should be called out in the next tier review alongside ${tierMeetingCards[1].value.toLowerCase()} on ${tierMeetingCards[1].label.toLowerCase()}.`,
      accent: '#9199D8',
      actionLabel: 'Open Tier Meeting',
      action: () => setCurrentScreen('tier_meeting'),
    },
  ];

  return (
    <AiContext.Provider value={{ ...aiChatActions, workflowRecommendations }}>
      {children}
    </AiContext.Provider>
  );
};

export const useAiContext = () => {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error('useAiContext must be used within an AiProvider');
  }
  return context;
};
