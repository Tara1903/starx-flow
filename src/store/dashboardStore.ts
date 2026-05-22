import { create } from 'zustand';

export type DashboardSection =
  | 'overview'
  | 'conversations'
  | 'workflows'
  | 'playground'
  | 'analytics'
  | 'channels'
  | 'settings';

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'human';
  text: string;
  timestamp: string;
}

export interface ConversationThread {
  id: string;
  customerName: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS';
  status: 'active' | 'resolved' | 'needs_attention';
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
}

export interface ActivityFeedEntry {
  id: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Reviews' | 'Web';
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timeAgo: string;
  timestamp: string;
}

export interface SmartNudge {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  ctaText: string;
  ctaSection: DashboardSection;
}

interface DashboardState {
  activeSection: DashboardSection;
  conversations: ConversationThread[];
  selectedConversationId: string | null;
  activityFeed: ActivityFeedEntry[];
  smartNudges: SmartNudge[];
  isSidebarCollapsed: boolean;

  // Actions
  setActiveSection: (section: DashboardSection) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectConversation: (id: string | null) => void;
  sendMessageToThread: (threadId: string, text: string, sender: 'user' | 'ai' | 'human') => void;
  toggleThreadStatus: (threadId: string, status: ConversationThread['status']) => void;
  markThreadRead: (threadId: string) => void;
  addActivityEntry: (entry: Omit<ActivityFeedEntry, 'id' | 'timestamp' | 'timeAgo'>) => void;
  dismissNudge: (id: string) => void;
  resetDashboardStore: () => void;
}

const MOCK_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-1',
    customerName: 'Sarah Jenkins',
    channel: 'WhatsApp',
    status: 'active',
    lastMessage: 'Can I change my slot to 3 PM tomorrow instead?',
    lastMessageAt: '2 min ago',
    unread: true,
    messages: [
      { id: 'm-1', sender: 'user', text: 'Hey, I wanted to book a haircut appointment for tomorrow afternoon.', timestamp: '2:15 PM' },
      { id: 'm-2', sender: 'ai', text: 'Hi Sarah! I would be happy to help. We have openings tomorrow at 1:30 PM, 3:00 PM, and 4:30 PM. Which works best?', timestamp: '2:16 PM' },
      { id: 'm-3', sender: 'user', text: 'Let’s do 1:30 PM please.', timestamp: '2:18 PM' },
      { id: 'm-4', sender: 'ai', text: 'Great choice! I have booked you for tomorrow at 1:30 PM. See you then! ✨', timestamp: '2:18 PM' },
      { id: 'm-5', sender: 'user', text: 'Can I change my slot to 3 PM tomorrow instead?', timestamp: '3:40 PM' }
    ]
  },
  {
    id: 'conv-2',
    customerName: 'Alex Rodriguez',
    channel: 'Instagram',
    status: 'needs_attention',
    lastMessage: 'Wait, so do you have any promo discounts for new customers?',
    lastMessageAt: '12 min ago',
    unread: true,
    messages: [
      { id: 'm-6', sender: 'user', text: 'Hey guys, looking to check out your pricing catalog.', timestamp: '3:10 PM' },
      { id: 'm-7', sender: 'ai', text: 'Hello! Our haircut starts at $45, styling at $60, and color treatments at $90. You can see the full list on our website.', timestamp: '3:11 PM' },
      { id: 'm-8', sender: 'user', text: 'Wait, so do you have any promo discounts for new customers?', timestamp: '3:30 PM' }
    ]
  },
  {
    id: 'conv-3',
    customerName: '+1 (555) 389-2910',
    channel: 'SMS',
    status: 'resolved',
    lastMessage: 'Thanks, all set!',
    lastMessageAt: '1h ago',
    unread: false,
    messages: [
      { id: 'm-9', sender: 'user', text: 'Missed call recovery: Hey, tried calling you guys, wanted to check if you do walk-ins.', timestamp: '11:00 AM' },
      { id: 'm-10', sender: 'ai', text: 'Hi! Apologies for missing your call. We do accept walk-ins, but we highly recommend booking in advance to avoid waiting. Would you like me to find an open slot for today?', timestamp: '11:01 AM' },
      { id: 'm-11', sender: 'user', text: 'No worries, I booked a slot online already.', timestamp: '11:05 AM' },
      { id: 'm-12', sender: 'ai', text: 'Fantastic! We look forward to seeing you. Let me know if you need anything else.', timestamp: '11:06 AM' },
      { id: 'm-13', sender: 'user', text: 'Thanks, all set!', timestamp: '11:10 AM' }
    ]
  }
];

const MOCK_ACTIVITY: ActivityFeedEntry[] = [
  {
    id: 'act-1',
    channel: 'WhatsApp',
    type: 'success',
    message: 'Booking confirmed for Sarah Jenkins — Haircut tomorrow at 1:30 PM.',
    timeAgo: '2m ago',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: 'act-2',
    channel: 'SMS',
    type: 'info',
    message: 'Missed call recovery SMS sent to +1 (555) 389-2910.',
    timeAgo: '1h ago',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 'act-3',
    channel: 'Reviews',
    type: 'success',
    message: 'New 5-star Google review auto-response sent to James L.',
    timeAgo: '2h ago',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'act-4',
    channel: 'Instagram',
    type: 'warning',
    message: 'Instagram DM from @alex_rod requires human review (promo enquiry).',
    timeAgo: '12m ago',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString()
  }
];

const INITIAL_NUDGES: SmartNudge[] = [
  {
    id: 'ndg-1',
    type: 'warning',
    message: 'Your Instagram channel is not connected yet. Connecting it will unlock automated customer acquisition via direct messages.',
    ctaText: 'Connect Instagram',
    ctaSection: 'channels'
  },
  {
    id: 'ndg-2',
    type: 'info',
    message: 'Your AI model has a 98.2% accuracy rate, but adding 2-3 more FAQs in AI settings could boost it even higher.',
    ctaText: 'Train Assistant',
    ctaSection: 'playground'
  }
];

export const useDashboardStore = create<DashboardState>((set) => ({
  activeSection: 'overview',
  conversations: MOCK_CONVERSATIONS,
  selectedConversationId: null,
  activityFeed: MOCK_ACTIVITY,
  smartNudges: INITIAL_NUDGES,
  isSidebarCollapsed: false,

  setActiveSection: (section) => {
    set({ activeSection: section });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
  },

  selectConversation: (id) => {
    set({ selectedConversationId: id });
    if (id) {
      // Mark read automatically
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, unread: false } : c
        )
      }));
    }
  },

  sendMessageToThread: (threadId, text, sender) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender,
      text,
      timestamp
    };

    set((state) => {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === threadId) {
          const updatedMessages = [...c.messages, newMessage];
          return {
            ...c,
            messages: updatedMessages,
            lastMessage: text,
            lastMessageAt: 'Just now',
            unread: sender === 'user' ? true : c.unread
          };
        }
        return c;
      });

      return {
        conversations: updatedConversations
      };
    });
  },

  toggleThreadStatus: (threadId, status) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, status } : c
      )
    }));
  },

  markThreadRead: (threadId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, unread: false } : c
      )
    }));
  },

  addActivityEntry: (entry) => {
    const newEntry: ActivityFeedEntry = {
      ...entry,
      id: `act-${Date.now()}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString()
    };
    set((state) => ({
      activityFeed: [newEntry, ...state.activityFeed].slice(0, 50) // keep last 50
    }));
  },

  dismissNudge: (id) => {
    set((state) => ({
      smartNudges: state.smartNudges.filter((n) => n.id !== id)
    }));
  },

  resetDashboardStore: () => {
    set({
      activeSection: 'overview',
      conversations: MOCK_CONVERSATIONS,
      selectedConversationId: null,
      activityFeed: MOCK_ACTIVITY,
      smartNudges: INITIAL_NUDGES,
      isSidebarCollapsed: false
    });
  }
}));
