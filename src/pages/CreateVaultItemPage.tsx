import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Loader2, Lock, Globe, 
  Link as LinkIcon, Plus, X, Info 
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

const ITEM_TYPES = ['project', 'idea', 'portfolio', 'note', 'other'];

export function CreateVaultItemPage() {
  const { profile } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    item_type: 'project',
    visibility: 'private',
  });

  const [fileUrls, setFileUrls] = useState<string[]>(['']);

  const handleAddUrlField = () => setFileUrls([...fileUrls, '']);
  const handleRemoveUrlField = (index: number) => {
    const newUrls = fileUrls.filter((_, i) => i !== index);
    setFileUrls(newUrls.length ? newUrls : ['']);
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...fileUrls];
    newUrls[index] = value;
    setFileUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError(null);

    // Filter out empty URLs
    const cleanUrls = fileUrls.filter(url => url.trim() !== '');

    try {
      const { error: insertError } = await supabase
        .from('vault_items')
        .insert([{
          ...formData,
          file_urls: cleanUrls,
          owner_id: profile.id
        }]);

      if (insertError) throw insertError;
      navigate('/vault');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Vault
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">Add to Vault</h1>
          <p className="text-slate-600 text-sm">Save your work, documentation, or creative ideas.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Type</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-xl capitalize focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.item_type}
                onChange={e => setFormData({...formData, item_type: e.target.value})}
              >
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, visibility: 'private'})}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.visibility === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  <Lock className="w-4 h-4" /> Private
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, visibility: 'public'})}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.visibility === 'public' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <Globe className="w-4 h-4" /> Public
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Links & Resources</label>
            <div className="space-y-3">
              {fileUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                      value={url}
                      onChange={e => handleUrlChange(index, e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUrlField(index)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddUrlField}
                className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 mt-2"
              >
                <Plus className="w-4 h-4" /> Add another link
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save to Vault</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}