import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Search, User, Phone, Video,
  Paperclip, Mic, Image, Smile, MoreVertical, Check, CheckCheck,
  Loader2, ChevronLeft, Plus, UserPlus
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Conversation, Message, Profile } from '../types';

export function ChatPage() {
  const { profile } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Fetch Conversations
  useEffect(() => {
    if (profile) fetchConversations();
  }, [profile]);

  // 2. Selection Change: Fetch Messages & Start Subscription
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const subscription = subscribeToMessages();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedConversation]);

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(*),
          participant2:profiles!conversations_participant2_id_fkey(*)
        `)
        .or(`participant1_id.eq.${profile.id},participant2_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const processed = (data as any[]).map((conv) => ({
          ...conv,
          other_participant: conv.participant1_id === profile.id ? conv.participant2 : conv.participant1,
        }));

        const convsWithMessages = await Promise.all(processed.map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          return { ...conv, last_message: lastMsg };
        }));
        setConversations(convsWithMessages as Conversation[]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
    setLoading(false);
  }, [profile]);

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(*)')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (!error && data) setMessages(data as Message[]);
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    return supabase
      .channel(`chat:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${selectedConversation.id}` 
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage = { ...payload.new, sender } as Message;
          setMessages((prev) => {
            // Prevent duplicate messages from local optimistic update
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedConversation || !newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { data: newMsg, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: profile.id,
          content,
        })
        .select('*, sender:profiles(*)')
        .single();

      if (error) throw error;
      
      // Update local UI immediately
      setMessages((prev) => [...prev, newMsg]);
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /**
   * FIXED: Search restricted to ACCEPTED connections only
   */
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      // 1. Get accepted connection IDs
      const { data: connections } = await supabase
        .from('mentorship_requests')
        .select('student_id, mentor_id')
        .eq('status', 'accepted')
        .or(`student_id.eq.${profile?.id},mentor_id.eq.${profile?.id}`);

      if (!connections || connections.length === 0) {
        setSearchResults([]);
        return;
      }

      const connectedIds = connections.map(c => 
        c.student_id === profile?.id ? c.mentor_id : c.student_id
      );

      // 2. Search profiles among those IDs
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('id', connectedIds)
        .ilike('full_name', `%${query}%`)
        .limit(5);

      setSearchResults(users || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const startNewConversation = async (other: Profile) => {
    if (!profile) return;
    
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1_id.eq.${profile.id},participant2_id.eq.${other.id}),and(participant1_id.eq.${other.id},participant2_id.eq.${profile.id})`)
      .maybeSingle();

    if (existing) {
      setSelectedConversation({ ...existing, other_participant: other } as Conversation);
    } else {
      const { data: newC, error } = await supabase
        .from('conversations')
        .insert({ participant1_id: profile.id, participant2_id: other.id })
        .select()
        .single();
      
      if (!error && newC) {
        setSelectedConversation({ ...newC, other_participant: other } as Conversation);
        fetchConversations();
      }
    }
    setShowNewChat(false);
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-1 shadow-xl shadow-slate-200/50">
        
        {/* SIDEBAR: CONVERSATIONS */}
        <div className={`w-full md:w-80 flex flex-col border-r border-slate-100 bg-slate-50/30 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inbox</h2>
              <button 
                onClick={() => setShowNewChat(true)}
                className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
            {conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-slate-400">No conversations yet.</p>
              </div>
            ) : (
              conversations
                .filter(c => c.other_participant?.full_name?.toLowerCase().includes(search.toLowerCase()))
                .map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 flex items-center gap-3 rounded-2xl transition-all ${
                    selectedConversation?.id === conv.id 
                    ? 'bg-white shadow-md border border-slate-100' 
                    : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center overflow-hidden font-bold text-teal-700">
                      {conv.other_participant?.avatar_url ? (
                        <img src={conv.other_participant.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : conv.other_participant?.full_name?.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold text-slate-900 text-sm truncate">{conv.other_participant?.full_name}</p>
                      <span className="text-[10px] font-bold text-slate-400">
                        {conv.last_message ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.last_message?.content || 'Say hello! 👋'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT WINDOW */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-4">
                <button onClick={() => setSelectedConversation(null)} className="md:hidden p-2 -ml-2 text-slate-400"><ChevronLeft /></button>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                  {selectedConversation.other_participant?.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{selectedConversation.other_participant?.full_name}</h3>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Active Chat</p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messages.map((msg, idx) => {
                  const isMine = msg.sender_id === profile?.id;
                  const showTime = idx === messages.length - 1 || messages[idx+1]?.sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                          isMine ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                        </div>
                        {showTime && (
                          <div className="flex items-center gap-1 mt-1 px-1">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && <CheckCheck className={`w-3 h-3 ${msg.read_at ? 'text-teal-500' : 'text-slate-300'}`} />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white">
                <form onSubmit={sendMessage} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                  <button type="button" className="p-2 text-slate-400 hover:text-teal-600"><Paperclip className="w-5 h-5" /></button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 text-slate-900"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 shadow-lg shadow-teal-600/20"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
              <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-teal-600/10">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Private Messages</h3>
              <p className="text-slate-500 max-w-xs">Select a conversation or find a connection to start chatting.</p>
              <button 
                onClick={() => setShowNewChat(true)}
                className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-teal-600 hover:border-teal-500 hover:bg-teal-50 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {showNewChat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Search Connections</h3>
                <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a connection's name..."
                  value={newChatSearch}
                  onChange={(e) => { setNewChatSearch(e.target.value); searchUsers(e.target.value); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <button 
                    key={user.id} 
                    onClick={() => startNewConversation(user)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-teal-50 rounded-2xl transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.full_name}</p>
                      <p className="text-xs text-slate-500">@{user.username || 'Member'}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    {newChatSearch.length > 0 ? "No connections found matching that name." : "You can only chat with people you are connected to."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}