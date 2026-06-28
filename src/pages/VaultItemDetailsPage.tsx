import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Lock, Globe, 
  ExternalLink, Trash2, FileText, Lightbulb, 
  Briefcase, StickyNote, Folder, ShieldAlert 
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

export function VaultItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    setLoading(true);
    const { data, error } = await supabase
      .from('vault_items')
      .select('*, owner:profiles!owner_id(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      navigate('/vault');
      return;
    }

    // Access Control: If item is private and user is not the owner
    if (data.visibility === 'private' && data.owner_id !== profile?.id) {
      setItem('private');
    } else {
      setItem(data);
    }
    setLoading(false);
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeleting(true);
    const { error } = await supabase.from('vault_items').delete().eq('id', id);
    if (!error) navigate('/vault');
    setDeleting(false);
  };

  const getTypeIcon = (type: string) => {
    const icons: any = { project: FileText, idea: Lightbulb, portfolio: Briefcase, note: StickyNote };
    return icons[type] || Folder;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-teal-600" /></div>;

  if (item === 'private') return (
    <div className="max-w-md mx-auto py-20 text-center">
      <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-900">Private Item</h2>
      <p className="text-slate-500 mt-2">You don't have permission to view this resource.</p>
      <button onClick={() => navigate('/vault')} className="mt-6 text-teal-600 font-bold">Back to Vault</button>
    </div>
  );

  const Icon = getTypeIcon(item.item_type);
  const isOwner = profile?.id === item.owner_id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/vault')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {isOwner && (
          <button 
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete Item'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.item_type}</span>
                {item.visibility === 'private' ? <Lock className="w-3 h-3 text-slate-400" /> : <Globe className="w-3 h-3 text-teal-500" />}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-10 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" /> Created by {isOwner ? 'You' : item.owner?.full_name}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="prose max-w-none mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {item.description || 'No description provided.'}
            </p>
          </div>

          {item.file_urls?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Attachments & Resources</h3>
              <div className="grid gap-3">
                {item.file_urls.map((url: string, index: number) => (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-300 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                      <span className="text-sm font-medium text-slate-700 truncate max-w-md">{url}</span>
                    </div>
                    <span className="text-xs text-teal-600 font-bold">Open Link</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}