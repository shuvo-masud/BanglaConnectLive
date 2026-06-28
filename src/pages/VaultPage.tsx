import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, Plus, Lock, Globe, Search, FileText, 
  Lightbulb, Briefcase, StickyNote, ChevronRight,
  ExternalLink, Paperclip
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { VaultItem } from '../types';

export function VaultPage() {
  const { profile } = useAuthContext();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchItems();
  }, [search, typeFilter, visibilityFilter, profile?.id]);

  const fetchItems = async () => {
    if (!profile) return;

    setLoading(true);
    // Fetching items: Your own items (any visibility) + Public items from others
    let query = supabase
      .from('vault_items')
      .select(`
        *,
        owner:profiles!owner_id (
          full_name,
          avatar_url
        )
      `)
      .or(`visibility.eq.public,owner_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') {
      query = query.eq('item_type', typeFilter);
    }

    if (visibilityFilter !== 'all') {
      query = query.eq('visibility', visibilityFilter);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data as any[]);
    }
    setLoading(false);
  };

  const getTypeStyles = (type: string) => {
    const styles: Record<string, { icon: any, color: string, bg: string }> = {
      project: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
      idea: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
      portfolio: { icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      note: { icon: StickyNote, color: 'text-purple-600', bg: 'bg-purple-50' },
      other: { icon: Folder, color: 'text-slate-600', bg: 'bg-slate-50' },
    };
    return styles[type] || styles.other;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">The Vault</h1>
          <p className="text-slate-600 mt-1">Showcase projects, store ideas, and share resources.</p>
        </div>
        {profile && (
          <Link
            to="/vault/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </Link>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 focus:ring-0 text-slate-900"
            />
          </div>
          <div className="h-10 w-px bg-slate-200 hidden md:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-transparent border-0 focus:ring-0 text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="project">Projects</option>
            <option value="idea">Ideas</option>
            <option value="portfolio">Portfolios</option>
            <option value="note">Notes</option>
            <option value="other">Other</option>
          </select>
          <div className="h-10 w-px bg-slate-200 hidden md:block" />
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-transparent border-0 focus:ring-0 text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">Any Visibility</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No items found</h3>
          <p className="text-slate-500 mb-6">Start documenting your journey by adding your first item.</p>
          <Link to="/vault/create" className="text-teal-600 font-bold hover:underline">
            + Create Item
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const { icon: Icon, color, bg } = getTypeStyles(item.item_type || 'other');
            const isOwner = item.owner_id === profile?.id;

            return (
              <Link
                key={item.id}
                to={`/vault/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-teal-400 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${bg} ${color} transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {item.visibility === 'private' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                  {item.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    {item.file_urls && item.file_urls.length > 0 && (
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                        <Paperclip className="w-3 h-3" />
                        {item.file_urls.length}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400">
                    {isOwner ? 'Your item' : `By ${(item as any).owner?.full_name}`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}