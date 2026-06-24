import { useState, useEffect, useCallback } from 'react';
import {
  Heart, MessageCircle, Share2, Send, Image, Video,
  MoreHorizontal, Globe, Users, Lock, Loader2
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Post, Profile, PostComment } from '../types';

export function FeedPage() {
  const { profile } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile]);

  const fetchPosts = useCallback(async () => {
    if (!profile) return;

    try {
      // Fetch posts with author info
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(*)
        `)
        .eq('is_published', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Check which posts are liked by current user
        const postIds = data.map(p => p.id);
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', profile.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

        setPosts(data.map(p => ({ ...p, liked_by_me: likedPostIds.has(p.id) })) as Post[]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
    setLoading(false);
  }, [profile]);

  const fetchComments = async (postId: string) => {
    if (comments[postId]) return;

    const { data } = await supabase
      .from('post_comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(prev => ({ ...prev, [postId]: data as PostComment[] }));
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newPostContent.trim() || posting) return;

    setPosting(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: '',
          content: newPostContent.trim(),
          author_id: profile.id,
          type: 'news',
          post_type: 'text',
          visibility: 'public',
          is_published: true,
        })
        .select('*, author:profiles(*)')
        .single();

      if (!error && data) {
        setPosts(prev => [{ ...data, liked_by_me: false }, ...prev] as Post[]);
        setNewPostContent('');
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }

    setPosting(false);
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!profile) return;

    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: profile.id });

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: Math.max((p.likes_count || 0) - 1, 0), liked_by_me: false }
          : p
      ));
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: profile.id });

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: (p.likes_count || 0) + 1, liked_by_me: true }
          : p
      ));
    }
  };

  const addComment = async (postId: string) => {
    if (!profile || !commentInput[postId]?.trim()) return;

    const content = commentInput[postId].trim();

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: profile.id,
        content,
      })
      .select('*, author:profiles(*)')
      .single();

    if (!error && data) {
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data as PostComment],
      }));
      setCommentInput(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments_count: (p.comments_count || 0) + 1 }
          : p
      ));
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const getVisibilityIcon = (visibility?: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-3 h-3" />;
      case 'connections':
        return <Users className="w-3 h-3" />;
      case 'group':
        return <Users className="w-3 h-3" />;
      default:
        return <Lock className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={createPost}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-10 h-10 object-cover" />
              ) : (
                <span className="text-teal-600 font-medium">
                  {profile?.full_name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="w-full resize-none border-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                <div className="flex gap-2">
                  <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Image className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPostContent.trim() || posting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No posts yet</p>
            <p className="text-sm text-slate-500 mt-1">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => {
            const author = post.author as Profile;
            const isExpanded = expandedPost === post.id;

            return (
              <div key={post.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <span className="text-teal-600 font-medium">
                          {author?.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{author?.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatTime(post.created_at)}</span>
                        <span className="flex items-center gap-1">
                          {getVisibilityIcon(post.visibility)}
                          {post.visibility || 'Public'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-slate-900 whitespace-pre-wrap">{post.content}</p>

                  {/* Show media if any */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {post.media_urls.slice(0, 4).map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt=""
                          className="w-full rounded-lg object-cover max-h-96"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleLike(post.id, post.liked_by_me || false)}
                      className={`flex items-center gap-1.5 ${
                        post.liked_by_me ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.liked_by_me ? 'fill-red-500' : ''}`} />
                      <span className="text-sm">{post.likes_count || 0}</span>
                    </button>
                    <button
                      onClick={() => {
                        setExpandedPost(isExpanded ? null : post.id);
                        fetchComments(post.id);
                      }}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{post.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-teal-600">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {/* Comment Input */}
                    <div className="p-4 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-8 h-8 object-cover" />
                        ) : (
                          <span className="text-teal-600 text-sm font-medium">
                            {profile?.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentInput[post.id] || ''}
                          onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addComment(post.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          disabled={!commentInput[post.id]?.trim()}
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-full disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="px-4 py-2 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {comment.author?.avatar_url ? (
                            <img src={comment.author.avatar_url} alt="" className="w-8 h-8 object-cover" />
                          ) : (
                            <span className="text-slate-500 text-sm">
                              {comment.author?.full_name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-slate-100 rounded-xl px-3 py-2">
                            <p className="font-medium text-sm text-slate-900">{comment.author?.full_name}</p>
                            <p className="text-sm text-slate-700">{comment.content}</p>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {formatTime(comment.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
