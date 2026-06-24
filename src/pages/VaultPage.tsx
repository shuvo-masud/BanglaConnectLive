import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Lock, Globe, Search, FileText, Lightbulb, Briefcase, StickyNote } from 'lucide-react';
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
  }, [search, typeFilter, visibilityFilter]);

  const fetchItems = async () => {
    if (!profile) return;

    setLoading(true);
    let query = supabase
      .from('vault_items')
      .select('*, owner:profiles!owner_id(*)')
      .or(`visibility.eq.public,owner_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') {
      query = query.eq('item_type', typeFilter);
    }

    if (visibilityFilter !== 'all') {
      query = query.eq('visibility', visibilityFilter);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setItems(data as VaultItem[]);
    }
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      project: FileText,
      idea: Lightbulb,
      portfolio: Briefcase,
      note: StickyNote,
      other: Folder,
    };
    return icons[type] || Folder;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Vault</h1>
          <p className="text-slate-600 mt-1">Your personal workspace for projects, ideas, and more</p>
        </div>
        {profile && (
          <Link
            to="/vault/create"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vault..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="project">Projects</option>
            <option value="idea">Ideas</option>
            <option value="portfolio">Portfolio</option>
            <option value="note">Notes</option>
            <option value="other">Other</option>
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Vault Items Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Folder className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-2">No items in your vault yet</p>
          <p className="text-sm text-slate-500">Start by adding a project, idea, or portfolio item</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const TypeIcon = getTypeIcon(item.item_type);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.item_type === 'project' ? 'bg-blue-100 text-blue-600' :
                      item.item_type === 'idea' ? 'bg-amber-100 text-amber-600' :
                      item.item_type === 'portfolio' ? 'bg-emerald-100 text-emerald-600' :
                      item.item_type === 'note' ? 'bg-purple-100 text-purple-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      {item.item_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.visibility === 'private' ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                )}
                {item.file_urls && item.file_urls.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileText className="w-3 h-3" />
                    {item.file_urls.length} file{item.file_urls.length > 1 ? 's' : ''}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
