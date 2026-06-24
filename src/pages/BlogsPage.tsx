import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Newspaper, Search, Plus, Clock, User, Eye } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Post } from '../types';

export function BlogsPage() {
  const { profile } = useAuthContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'blog' | 'news'>('all');

  useEffect(() => {
    fetchPosts();
  }, [search, tab]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, author:profiles!author_id(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (tab !== 'all') {
      query = query.eq('type', tab);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setPosts(data as Post[]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs & News</h1>
          <p className="text-slate-600 mt-1">Share knowledge and stay updated</p>
        </div>
        {profile && (
          <Link
            to="/blogs/create"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Post
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('all')}
          className={`pb-3 px-2 font-medium transition-colors ${
            tab === 'all'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setTab('blog')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${
            tab === 'blog'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Blogs
        </button>
        <button
          onClick={() => setTab('news')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${
            tab === 'news'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          News
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No posts found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blogs/${post.id}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all"
            >
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className={`w-full h-40 flex items-center justify-center ${
                  post.type === 'blog' ? 'bg-blue-100' : 'bg-rose-100'
                }`}>
                  {post.type === 'blog' ? (
                    <FileText className="w-12 h-12 text-blue-400" />
                  ) : (
                    <Newspaper className="w-12 h-12 text-rose-400" />
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    post.type === 'blog' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {post.type}
                  </span>
                  {post.category && (
                    <span className="text-xs text-slate-500">{post.category}</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author?.full_name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
