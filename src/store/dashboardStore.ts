import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from './authStore';

// Tracks in-flight message sends to prevent duplicate DB inserts on accidental double-submits/retries
const inFlightMessageSends = new Set<string>();

export type DashboardSection =
  | 'overview'
  | 'conversations'
  | 'crm'
  | 'calendar'
  | 'orders'
  | 'knowledge'
  | 'tasks'
  | 'team'
  | 'workflows'
  | 'playground'
  | 'analytics'
  | 'channels'
  | 'settings'
  | 'workflow_editor'
  | 'agents'
  | 'voice'
  | 'os';

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'human';
  text: string;
  timestamp: string;
  db_id?: string;
  conversation_id?: string;
  direction?: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  is_internal?: boolean;
}

export interface ConversationThread {
  id: string;
  customerName: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Email' | 'Web' | string;
  status: 'active' | 'resolved' | 'needs_attention' | string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
  db_id?: string;
  lead_id?: string;
  lead?: any; // To store full lead info for CustomerProfile
  assigned_to?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ActivityFeedEntry {
  id: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS' | 'Reviews' | 'Web' | 'Email';
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
  isLoading: boolean;
  subscriptionActive: boolean;
  isInternalMode: boolean;
  collisionWarning: { isCollision: boolean; activeViewers: string[] } | null;

  // Actions
  setActiveSection: (section: DashboardSection) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectConversation: (id: string | null) => void;
  setIsInternalMode: (mode: boolean) => void;
  toggleInternalMode: () => void;
  setCollisionWarning: (warning: { isCollision: boolean; activeViewers: string[] } | null) => void;
  setConversationPriority: (threadId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  setConversationAssignee: (threadId: string, assignedTo: string | null) => Promise<void>;
  sendMessageToThread: (threadId: string, text: string, sender: 'user' | 'ai' | 'human', isInternal?: boolean) => Promise<void>;
  toggleThreadStatus: (threadId: string, status: string) => void;
  markThreadRead: (threadId: string) => void;
  addActivityEntry: (entry: Omit<ActivityFeedEntry, 'id' | 'timestamp' | 'timeAgo'>) => void;
  dismissNudge: (id: string) => void;
  resetDashboardStore: () => void;
  
  // Realtime & DB
  fetchInboxData: () => Promise<void>;
  subscribeToInbox: () => void;
  unsubscribeFromInbox: () => void;
}

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

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

const SAMPLE_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-1',
    customerName: 'Sarah Jenkins',
    channel: 'WhatsApp',
    status: 'active',
    lastMessage: 'Perfect, I will take the 2:00 PM slot with therapist Sarah tomorrow!',
    lastMessageAt: '12:44',
    unread: true,
    priority: 'high',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'Hi! Do you have any slots for a deep tissue massage tomorrow afternoon?',
        timestamp: '12:42',
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'Hi Sarah! We have openings at 10:30 AM and 2:00 PM with therapist Sarah tomorrow. Would you like me to reserve the 2:00 PM slot for you?',
        timestamp: '12:43',
      },
      {
        id: 'm3',
        sender: 'user',
        text: 'Perfect, I will take the 2:00 PM slot with therapist Sarah tomorrow!',
        timestamp: '12:44',
      },
      {
        id: 'm4',
        sender: 'ai',
        text: 'Done! Your appointment is confirmed for tomorrow at 2:00 PM. A calendar invite has been sent to your email. See you tomorrow!',
        timestamp: '12:44',
      }
    ]
  },
  {
    id: 'conv-2',
    customerName: 'Marcus Vance',
    channel: 'Instagram',
    status: 'active',
    lastMessage: 'How much is the initial fitness consultation?',
    lastMessageAt: '11:15',
    unread: false,
    priority: 'medium',
    messages: [
      {
        id: 'm5',
        sender: 'user',
        text: 'Hey there! Saw your reel on mobility workouts. How much is an initial consultation?',
        timestamp: '11:12',
      },
      {
        id: 'm6',
        sender: 'ai',
        text: 'Hey Marcus! Our comprehensive 60-minute initial consultation is €65, which includes full postural assessment and custom training roadmap.',
        timestamp: '11:13',
      },
      {
        id: 'm7',
        sender: 'user',
        text: 'How much is the initial fitness consultation?',
        timestamp: '11:15',
      }
    ]
  },
  {
    id: 'conv-3',
    customerName: 'Elena Rostova',
    channel: 'SMS',
    status: 'resolved',
    lastMessage: 'Appointment confirmed: Sarah K., Deep Tissue, tomorrow at 2:00 PM.',
    lastMessageAt: 'Yesterday',
    unread: false,
    priority: 'low',
    messages: [
      {
        id: 'm8',
        sender: 'ai',
        text: 'Reminder: You have an upcoming session tomorrow at 2:00 PM. Reply YES to confirm or CANCEL to reschedule.',
        timestamp: 'Yesterday',
      },
      {
        id: 'm9',
        sender: 'user',
        text: 'YES',
        timestamp: 'Yesterday',
      },
      {
        id: 'm10',
        sender: 'ai',
        text: 'Thank you Elena! Your booking is locked.',
        timestamp: 'Yesterday',
      }
    ]
  },
  {
    id: 'conv-4',
    customerName: 'David Chen',
    channel: 'Web',
    status: 'needs_attention',
    lastMessage: 'Do you offer corporate wellness packages for teams of 20+?',
    lastMessageAt: '09:30',
    unread: true,
    priority: 'urgent',
    messages: [
      {
        id: 'm11',
        sender: 'user',
        text: 'Do you offer corporate wellness packages for teams of 20+?',
        timestamp: '09:30',
      }
    ]
  }
];

const SAMPLE_ACTIVITY_FEED: ActivityFeedEntry[] = [
  {
    id: 'act-1',
    channel: 'WhatsApp',
    type: 'success',
    message: 'New Appointment Booked: Sarah Jenkins booked Deep Tissue Massage for 2:00 PM tomorrow.',
    timestamp: '2 mins ago',
    timeAgo: '2m'
  },
  {
    id: 'act-2',
    channel: 'Instagram',
    type: 'info',
    message: 'Inbound Lead Qualified: Marcus Vance asked about consultation pricing via Instagram DM.',
    timestamp: '15 mins ago',
    timeAgo: '15m'
  },
  {
    id: 'act-3',
    channel: 'SMS',
    type: 'success',
    message: 'Automated 24h Reminder Dispatched: Elena Rostova confirmed booking for tomorrow at 2:00 PM.',
    timestamp: '1 hour ago',
    timeAgo: '1h'
  },
  {
    id: 'act-4',
    channel: 'Reviews',
    type: 'success',
    message: '5-Star Google Review Collected: James Thornton left a 5-star review: "Autonomous booking was so easy!"',
    timestamp: '3 hours ago',
    timeAgo: '3h'
  }
];

let realtimeSubscription: any = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeSection: 'overview',
  conversations: SAMPLE_CONVERSATIONS,
  selectedConversationId: 'conv-1',
  activityFeed: SAMPLE_ACTIVITY_FEED,
  smartNudges: INITIAL_NUDGES,
  isSidebarCollapsed: false,
  isLoading: false,
  subscriptionActive: false,
  isInternalMode: false,
  collisionWarning: null,

  setActiveSection: (section) => set({ activeSection: section }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setIsInternalMode: (mode) => set({ isInternalMode: mode }),
  toggleInternalMode: () => set((state) => ({ isInternalMode: !state.isInternalMode })),
  setCollisionWarning: (warning) => set({ collisionWarning: warning }),
  
  selectConversation: async (id) => {
    set({ selectedConversationId: id, collisionWarning: null, isInternalMode: false });
    if (id) {
      // Mark read in DB
      const user = useAuthStore.getState().user;
      if (user) {
        await supabase.from('conversations').update({ unread_count: 0 }).eq('id', id);
      }
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, unread: false } : c
        )
      }));
    }
  },

  setConversationPriority: async (threadId, priority) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, priority } : c
      )
    }));
    await supabase.from('conversations').update({ metadata: { priority } }).eq('id', threadId);
  },

  setConversationAssignee: async (threadId, assignedTo) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, assigned_to: assignedTo } : c
      )
    }));
    await supabase.from('conversations').update({ assigned_to: assignedTo }).eq('id', threadId);
  },

  sendMessageToThread: async (threadId, text, sender, isInternal = false) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const trimmed = text.trim();
    if (!trimmed) return;
    const dedupKey = `${threadId}:${sender}:${isInternal ? '1' : '0'}:${trimmed}`;
    if (inFlightMessageSends.has(dedupKey)) return;
    inFlightMessageSends.add(dedupKey);

    try {
      const timestamp = new Date().toISOString();

      // Insert into DB
      const { data: insertedMsg } = await supabase.from('messages').insert({
        conversation_id: threadId,
        direction: sender === 'user' ? 'inbound' : 'outbound',
        role: sender,
        content: trimmed,
        status: 'sent',
        is_internal: isInternal,
        created_at: timestamp
      }).select().single();

      let newMessage: Message;
      if (insertedMsg) {
        newMessage = {
          id: insertedMsg.id,
          db_id: insertedMsg.id,
          sender: insertedMsg.role as any,
          text: insertedMsg.content,
          timestamp: formatTime(insertedMsg.created_at),
          is_internal: isInternal,
        };
      } else {
        newMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender: sender,
          text: trimmed,
          timestamp: 'Just now',
          is_internal: isInternal,
        };
      }

      set((state) => {
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === threadId) {
            // Avoid duplicates if realtime fired first
            if (c.messages.some(m => m.id === newMessage.id)) return c;
            return {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: isInternal ? c.lastMessage : trimmed,
              lastMessageAt: isInternal ? c.lastMessageAt : 'Just now',
              unread: sender === 'user' ? true : c.unread
            };
          }
          return c;
        });
        return { conversations: updatedConversations };
      });
    } finally {
      inFlightMessageSends.delete(dedupKey);
    }
  },

  toggleThreadStatus: async (threadId, status) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Optimistic update
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, status } : c
      )
    }));

    // DB update
    await supabase.from('conversations').update({ status }).eq('id', threadId);
  },

  markThreadRead: async (threadId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === threadId ? { ...c, unread: false } : c
      )
    }));
    await supabase.from('conversations').update({ unread_count: 0 }).eq('id', threadId);
  },

  addActivityEntry: (entry) => {
    const newEntry: ActivityFeedEntry = {
      ...entry,
      id: `act-${Date.now()}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString()
    };
    set((state) => ({
      activityFeed: [newEntry, ...state.activityFeed].slice(0, 50)
    }));
  },

  dismissNudge: (id) => {
    set((state) => ({
      smartNudges: state.smartNudges.filter((n) => n.id !== id)
    }));
  },

  fetchInboxData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // If demo session or non-UUID, keep sample data without querying DB
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (!isUuid || !isSupabaseConfigured) {
      set({ conversations: get().conversations.length > 0 ? get().conversations : SAMPLE_CONVERSATIONS, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          leads (*),
          messages (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedConvos: ConversationThread[] = data.map((dbConv: any) => {
          // Sort messages chronologically
          const sortedMsgs = (dbConv.messages || []).sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          const lastMsg = sortedMsgs[sortedMsgs.length - 1];

          return {
            id: dbConv.id,
            db_id: dbConv.id,
            lead_id: dbConv.lead_id,
            lead: dbConv.leads,
            customerName: dbConv.leads?.name || dbConv.customer_name || 'Unknown',
            channel: dbConv.channel as any,
            status: dbConv.status,
            unread: dbConv.unread_count > 0,
            assigned_to: dbConv.assigned_to || null,
            priority: (dbConv.metadata?.priority || 'medium') as any,
            lastMessage: lastMsg?.content || 'No messages yet',
            lastMessageAt: lastMsg ? formatTime(lastMsg.created_at) : '',
            messages: sortedMsgs.map((m: any) => ({
              id: m.id,
              db_id: m.id,
              sender: m.role,
              text: m.content,
              timestamp: formatTime(m.created_at),
              is_internal: m.is_internal || false,
            }))
          };
        });

        set({ conversations: mappedConvos });
      } else {
        set({ conversations: isUuid ? [] : SAMPLE_CONVERSATIONS });
      }
    } catch (err) {
      console.error("Error fetching inbox data:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToInbox: () => {
    if (get().subscriptionActive) return;
    const user = useAuthStore.getState().user;
    if (!user) return;

    realtimeSubscription = supabase.channel('inbox_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          get().fetchInboxData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          get().fetchInboxData();
        }
      )
      .subscribe();

    set({ subscriptionActive: true });
  },

  unsubscribeFromInbox: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription);
      realtimeSubscription = null;
    }
    set({ subscriptionActive: false });
  },

  resetDashboardStore: () => {
    get().unsubscribeFromInbox();
    set({
      activeSection: 'overview',
      conversations: [],
      selectedConversationId: null,
      activityFeed: [],
      smartNudges: INITIAL_NUDGES,
      isSidebarCollapsed: false,
      subscriptionActive: false,
      isInternalMode: false,
      collisionWarning: null
    });
  }
}));

if (typeof window !== 'undefined') {
  (window as any).__starx_dashboard_store = useDashboardStore;
}
