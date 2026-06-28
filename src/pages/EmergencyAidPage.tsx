import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  History, 
  Upload, 
  Activity, 
  X, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

export function EmergencyAidPage() {
  const { profile, loading: authLoading } = useAuthContext();
  
  // Data States
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Form States
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [priority, setPriority] = useState<'critical' | 'urgent' | 'standard'>('standard');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Search States
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [contactResult, setContactResult] = useState<any | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchEmergencies();
    fetchContacts();
  }, []);

  // 2. City Filter Logic
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      return;
    }
    const filtered = contacts
      .filter(c => c.country === selectedCountry)
      .map(c => c.city);
    setCities([...new Set(filtered)]);
    setSelectedCity(''); // Reset city when country changes
  }, [selectedCountry, contacts]);

  const fetchEmergencies = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setEmergencies(data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase.from('emergency_contacts').select('*');
    if (data) {
      setContacts(data);
      const uniqueCountries = [...new Set(data.map((c: any) => c.country))];
      setCountries(uniqueCountries as string[]);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('emergency-files')
        .upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('emergency-files').getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (e) {
      console.error("Upload error", e);
      return null;
    }
  };

  const sendEmergency = async () => {
    if (!message.trim() && !file) return;
    if (!profile) return alert("You must be logged in to send an SOS");

    setUploading(true);
    try {
      let file_url = null;
      if (file) file_url = await uploadFile(file);

      const { error } = await supabase.from('emergency_requests').insert({
        message,
        priority,
        file_url,
        user_id: profile.id,
        status: 'open',
      });

      if (error) throw error;

      setMessage('');
      setFile(null);
      setPriority('standard');
      setSuccess(true);
      fetchEmergencies();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to send emergency request");
    } finally {
      setUploading(false);
    }
  };

  // --- LOADING GUARD ---
  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Center</h1>
          <p className="text-slate-500 font-medium">Broadcast SOS or find local authorities.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold uppercase">System Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: SOS BROADCAST */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-red-100 shadow-xl shadow-red-900/5 overflow-hidden">
            <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
              <span className="font-bold uppercase tracking-widest text-xs">Immediate SOS Broadcast</span>
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="p-6 space-y-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your situation and location..."
                className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none text-slate-700 font-medium"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-red-500"
                  >
                    <option value="critical">🔴 Critical / Life-threatening</option>
                    <option value="urgent">🟠 Urgent Response</option>
                    <option value="standard">🔵 Standard / Non-urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Proof</label>
                  <label className={`flex items-center justify-center gap-2 p-3.5 border rounded-xl cursor-pointer transition-all ${file ? 'border-teal-500 bg-teal-50 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-bold truncate">{file ? file.name : 'Upload File'}</span>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <button
                onClick={sendEmergency}
                disabled={uploading || !message.trim()}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                {uploading ? 'Transmitting...' : 'Send SOS Signal'}
              </button>

              {success && (
                <div className="p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Your SOS signal has been broadcasted successfully.</span>
                </div>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              <History className="w-4 h-4" /> Signal Log
            </h2>
            <div className="grid gap-3">
              {loading ? <div className="h-20 bg-slate-100 animate-pulse rounded-2xl" /> : 
                emergencies.map((e) => (
                <div key={e.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-slate-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-10 rounded-full ${e.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <p className="text-sm text-slate-700 font-bold truncate max-w-[200px] md:max-w-sm">{e.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.file_url && <a href={e.file_url} target="_blank" className="p-2 text-slate-400 hover:text-teal-600"><FileText className="w-4 h-4" /></a>}
                    <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CONTACT FINDER */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><MapPin className="w-32 h-32" /></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <MapPin className="text-teal-500" /> Rescue Finder
              </h2>

              <div className="space-y-4">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none"
                >
                  <option value="" className="text-slate-900">Select Country</option>
                  {countries.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                </select>

                <select
                  disabled={!selectedCountry}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all appearance-none disabled:opacity-30"
                >
                  <option value="" className="text-slate-900">Select City</option>
                  {cities.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                </select>

                <button
                  onClick={() => {
                    const match = contacts.find(c => c.country === selectedCountry && c.city === selectedCity);
                    setContactResult(match ? { police: match.police, ambulance: match.ambulance } : null);
                  }}
                  disabled={!selectedCity}
                  className="w-full py-4 mt-2 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Search Emergency Numbers
                </button>
              </div>

              {contactResult && (
                <div className="mt-8 space-y-3 animate-in slide-in-from-bottom-6">
                  <a href={`tel:${contactResult.police}`} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-500 font-black">P</div>
                      <span className="font-bold text-slate-300">Police</span>
                    </div>
                    <span className="text-2xl font-black text-teal-500 tracking-tighter">{contactResult.police}</span>
                  </a>
                  <a href={`tel:${contactResult.ambulance}`} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 font-black">A</div>
                      <span className="font-bold text-slate-300">Ambulance</span>
                    </div>
                    <span className="text-2xl font-black text-red-500 tracking-tighter">{contactResult.ambulance}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-900 font-bold leading-relaxed uppercase tracking-tight">
              Emergency signals are broadcasted to all verified admins and mentors in your country. Unauthorized use of the SOS feature results in immediate account termination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}