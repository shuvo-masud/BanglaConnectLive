import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Send, Search, User, Phone, Video,
  Paperclip, Mic, Image, Smile, MoreVertical, Check, CheckCheck,
  Loader2
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
  const [typing, setTyping] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

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
          other_participant: conv.participant1_id === profile.id
            ? conv.participant2
            : conv.participant1,
        }));

        // Fetch last message for each conversation
        const convsWithMessages = await Promise.all(
          processed.map(async (conv) => {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            return { ...conv, last_message: lastMsg };
          })
        );

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

    if (!error && data) {
      setMessages(data as Message[]);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...(payload.new as Message), sender: sender || undefined },
          ]);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setTyping(Object.keys(state).length > 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!profile || !selectedConversation || !newMessage.trim() || sending)
    return;

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

    if (error) {
      console.error('Send message error:', error);
      return;
    }

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selectedConversation.id);

  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    setSending(false);
    inputRef.current?.focus();
  }
};

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile?.id)
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);
      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
    }
    setSearchingUsers(false);
  };

  const startNewConversation = async (otherProfile: Profile) => {
    if (!profile) return;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant1_id.eq.${profile.id},participant2_id.eq.${otherProfile.id}),and(participant1_id.eq.${otherProfile.id},participant2_id.eq.${profile.id})`)
      .maybeSingle();

    if (existing) {
      setSelectedConversation({
        ...existing,
        other_participant: otherProfile,
      } as Conversation);
      setShowNewChat(false);
      setNewChatSearch('');
      setSearchResults([]);
      return;
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant1_id: profile.id,
        participant2_id: otherProfile.id,
      })
      .select()
      .single();

    if (!error && newConv) {
      setSelectedConversation({
        ...newConv,
        other_participant: otherProfile,
      } as Conversation);
      setShowNewChat(false);
      setNewChatSearch('');
      setSearchResults([]);
      fetchConversations();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.other_participant?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-900">Messages</h2>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"
                  title="New conversation"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No conversations yet</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-2 text-sm text-teal-600 hover:underline"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-teal-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {conv.other_participant?.avatar_url ? (
                          <img
                            src={conv.other_participant.avatar_url}
                            alt=""
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      {conv.other_participant?.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 truncate">
                          {conv.other_participant?.full_name}
                        </p>
                        {conv.last_message && (
                          <p className="text-xs text-slate-400">
                            {formatTime(conv.last_message.created_at)}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {conv.last_message?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-slate-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {selectedConversation.other_participant?.avatar_url ? (
                        <img
                          src={selectedConversation.other_participant.avatar_url}
                          alt=""
                          className="w-10 h-10 object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    {selectedConversation.other_participant?.is_online && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {selectedConversation.other_participant?.full_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {typing ? 'Typing...' : selectedConversation.other_participant?.is_online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Voice call">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Video call">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="More options">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === profile?.id;
                    const prevMsg = messages[idx - 1];
                    const showDate = !prevMsg || formatDate(msg.created_at) !== formatDate(prevMsg.created_at);

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="px-3 py-1 bg-white rounded-full text-xs text-slate-500">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                          {!isMine && (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                              {msg.sender?.avatar_url ? (
                                <img src={msg.sender.avatar_url} alt="" className="w-6 h-6 object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-slate-500" />
                              )}
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isMine
                                ? 'bg-teal-600 text-white rounded-br-md'
                                : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-teal-200' : 'text-slate-400'}`}>
                              <span className="text-xs">{formatTime(msg.created_at)}</span>
                              {isMine && (
                                msg.read_at ? (
                                  <CheckCheck className="w-3 h-3" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200">
                  <div className="flex items-end gap-2">
                    <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                      <Image className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:bg-slate-200 rounded">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Select a conversation to start messaging</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="text-teal-600 hover:underline"
                  >
                    Or start a new conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">New Conversation</h3>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setNewChatSearch('');
                    setSearchResults([]);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => {
                    setNewChatSearch(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search by name or username..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                {searchingUsers && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  {newChatSearch.length >= 2 ? 'No users found' : 'Type at least 2 characters to search'}
                </div>
              ) : (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewConversation(user)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <span className="text-teal-600 font-medium">
                          {user.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-sm text-slate-500">@{user.username || user.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
