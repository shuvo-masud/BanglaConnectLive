import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Newspaper, Search, Plus, Clock, User, X, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

interface UnifiedPost {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  author_id: string | null;
  created_at: string;
  type: 'blog' | 'news';
  author?: {
    full_name: string;
    role: string;
  };
}

export function BlogsPage() {
  const { profile } = useAuthContext();
  const [posts, setPosts] = useState<UnifiedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'blog' | 'news'>('all');

  // Modal Creation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'blog' | 'news'>('blog');
  const [title, setTitle] = useState('');
  const [mainText, setMainText] = useState(''); // Serves as Content for blogs, Summary for news
  const [secondaryText, setSecondaryText] = useState(''); // Extra text field for News content (optional)
  const [coverUrl, setCoverUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState(''); // For news links
  const [submitting, setSubmitting] = useState(false);

  const isAuthorizedToPost = profile?.role === 'admin' || profile?.role === 'mentor';

  useEffect(() => {
    fetchData();
  }, [search, tab]);

  const fetchData = async () => {
    setLoading(true);
    let combinedData: UnifiedPost[] = [];

    // --- FETCH FROM BLOGS TABLE ---
    if (tab === 'all' || tab === 'blog') {
      let blogQuery = supabase
        .from('blogs')
        .select('id, title, content, cover_image_url, author_id, created_at, author:profiles!author_id(full_name, role)')
        .eq('published', true);

      if (search) {
        blogQuery = blogQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data: blogs } = await blogQuery;
      if (blogs) {
        const formattedBlogs: UnifiedPost[] = blogs.map((b) => ({
          ...b,
          type: 'blog',
          author: Array.isArray(b.author) ? b.author[0] : b.author,
        }));
        combinedData = [...combinedData, ...formattedBlogs];
      }
    }

    // --- FETCH FROM NEWS TABLE ---
    if (tab === 'all' || tab === 'news') {
      let newsQuery = supabase
        .from('news')
        .select('id, title, summary, content, cover_image_url, author_id, created_at, author:profiles!author_id(full_name, role)');

      if (search) {
        newsQuery = newsQuery.or(`title.ilike.%${search}%,summary.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data: news } = await newsQuery;
      if (news) {
        const formattedNews: UnifiedPost[] = news.map((n) => ({
          id: n.id,
          title: n.title,
          // Fall back to reading summary as the display text block in the list view cards
          content: n.summary || n.content || '', 
          cover_image_url: n.cover_image_url,
          author_id: n.author_id,
          created_at: n.created_at,
          type: 'news' as const,
          author: Array.isArray(n.author) ? n.author[0] : n.author,
        }));
        combinedData = [...combinedData, ...formattedNews];
      }
    }

    // Sort chronologically (Newest first)
    combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setPosts(combinedData);
    setLoading(false);
  };

  const handleOpenForm = (type: 'blog' | 'news') => {
    setFormType(type);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setTitle('');
    setMainText('');
    setSecondaryText('');
    setCoverUrl('');
    setExternalUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isAuthorizedToPost) return;

    setSubmitting(true);

    const targetTable = formType === 'blog' ? 'blogs' : 'news';
    
    // Exact schema column configurations mapped explicitly per table base rules
    const payload = formType === 'blog' 
      ? {
          title,
          content: mainText,
          excerpt: mainText.substring(0, 120) + '...',
          cover_image_url: coverUrl || null,
          author_id: profile.id,
          published: true,
        }
      : {
          title,
          summary: mainText, // Maps directly to required summary column
          content: secondaryText || null, // Sets custom breakdown details if input
          external_url: externalUrl || null,
          cover_image_url: coverUrl || null,
          author_id: profile.id,
        };

    const { error } = await supabase.from(targetTable).insert([payload]);
    setSubmitting(false);

    if (!error) {
      handleCloseForm();
      fetchData();
    } else {
      alert(`Error creating ${formType}: ` + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs & News</h1>
          <p className="text-slate-600 mt-1">Share knowledge and stay updated</p>
        </div>
        
        {profile && isAuthorizedToPost && (
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenForm('blog')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Write Blog
            </button>
            <button
              onClick={() => handleOpenForm('news')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Post News
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('all')}
          className={`pb-3 px-2 font-medium transition-colors ${
            tab === 'all' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Posts
        </button>
        <button
          onClick={() => setTab('blog')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${
            tab === 'blog' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Blogs
        </button>
        <button
          onClick={() => setTab('news')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${
            tab === 'news' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-600 hover:text-slate-900'
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
              key={`${post.type}-${post.id}`}
              to={`/${post.type === 'blog' ? 'blogs' : 'news'}/${post.id}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-teal-300 hover:shadow-md transition-all"
            >
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
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
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author?.full_name || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-3">
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

      {/* Creation Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="text-lg font-bold text-slate-900 capitalize">
                Create New {formType}
              </h2>
              <button 
                onClick={handleCloseForm} 
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder={`Enter ${formType} title...`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formType === 'blog' ? 'Content Text' : 'Summary (Required)'}
                </label>
                <textarea
                  required
                  rows={formType === 'blog' ? 5 : 3}
                  placeholder={formType === 'blog' ? "Write your blog content here..." : "Provide a brief summary snippet for the news feed..."}
                  value={mainText}
                  onChange={(e) => setMainText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                />
              </div>

              {/* Conditional Field: Show Full Body Text input ONLY for News records */}
              {formType === 'news' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full News Content (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide full article details here if necessary..."
                    value={secondaryText}
                    onChange={(e) => setSecondaryText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Image URL (Optional)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/image-link.jpg"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              {/* Conditional Field: External Redirect Links for News Posts */}
              {formType === 'news' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    External Source Article URL (Optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://bbc.com/news-story"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
                    formType === 'blog' 
                      ? 'bg-teal-600 hover:bg-teal-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {submitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}