import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export type DashboardSection =
  | 'overview'
  | 'conversations'
  | 'crm'
  | 'calendar'
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
}

export interface ConversationThread {
  id: string;
  customerName: string;
  channel: 'WhatsApp' | 'Instagram' | 'SMS';
  status: 'active' | 'resolved' | 'needs_attention' | string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
  db_id?: string;
  lead_id?: string;
  lead?: any; // To store full lead info for CustomerProfile
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
  isLoading: boolean;
  subscriptionActive: boolean;

  // Actions
  setActiveSection: (section: DashboardSection) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectConversation: (id: string | null) => void;
  sendMessageToThread: (threadId: string, text: string, sender: 'user' | 'ai' | 'human') => void;
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

let realtimeSubscription: any = null;

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeSection: 'overview',
  conversations: [],
  selectedConversationId: null,
  activityFeed: [],
  smartNudges: INITIAL_NUDGES,
  isSidebarCollapsed: false,
  isLoading: false,
  subscriptionActive: false,

  setActiveSection: (section) => set({ activeSection: section }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  
  selectConversation: async (id) => {
    set({ selectedConversationId: id });
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

  sendMessageToThread: async (threadId, text, sender) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const timestamp = new Date().toISOString();
    
    // Insert into DB
    const { data: insertedMsg } = await supabase.from('messages').insert({
      conversation_id: threadId,
      direction: sender === 'user' ? 'inbound' : 'outbound',
      role: sender,
      content: text,
      status: 'sent',
      created_at: timestamp
    }).select().single();

    // The realtime subscription will pick this up and update the store, 
    // but we can optimistically update for snappiness
    if (insertedMsg) {
      const newMessage: Message = {
        id: insertedMsg.id,
        db_id: insertedMsg.id,
        sender: insertedMsg.role as any,
        text: insertedMsg.content,
        timestamp: formatTime(insertedMsg.created_at)
      };

      set((state) => {
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === threadId) {
            // Avoid duplicates if realtime fired first
            if (c.messages.some(m => m.id === newMessage.id)) return c;
            return {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessage: text,
              lastMessageAt: 'Just now',
              unread: sender === 'user' ? true : c.unread
            };
          }
          return c;
        });
        return { conversations: updatedConversations };
      });
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
      
      if (data) {
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
            customerName: dbConv.leads?.name || 'Unknown',
            channel: dbConv.channel as any,
            status: dbConv.status,
            unread: dbConv.unread_count > 0,
            lastMessage: lastMsg?.content || 'No messages yet',
            lastMessageAt: lastMsg ? formatTime(lastMsg.created_at) : '',
            messages: sortedMsgs.map((m: any) => ({
              id: m.id,
              db_id: m.id,
              sender: m.role,
              text: m.content,
              timestamp: formatTime(m.created_at)
            }))
          };
        });

        set({ conversations: mappedConvos });
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
          // Trigger a re-fetch to get the full joined data to be safe and simple
          // In a heavily loaded app, we'd manually merge the payload into the state.
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
      subscriptionActive: false
    });
  }
}));
