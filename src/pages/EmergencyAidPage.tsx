import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';

type EmergencyRequest = {
  id: string;
  message: string;
  file_url?: string | null;
  priority?: string;
  created_at: string;
};

type EmergencyContact = {
  police: string;
  ambulance: string;
};

export function EmergencyAidPage() {
  const { profile } = useAuthContext();

  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  // =========================
  // PRIORITY STATE
  // =========================
  const [priority, setPriority] = useState<'critical' | 'urgent' | 'standard'>('standard');

  // =========================
  // CONTACT STATES (UNCHANGED FEATURE)
  // =========================
  const [contacts, setContacts] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [contact, setContact] = useState<EmergencyContact | null>(null);

  //*Effect*//
  useEffect(() => {
  if (!selectedCountry) {
    setCities([]);
    return;
  }

  const filteredCities = contacts
    .filter((c) => c.country === selectedCountry)
    .map((c) => c.city);

  const uniqueCities = [...new Set(filteredCities)];

  setCities(uniqueCities);
  setSelectedCity('');
}, [selectedCountry, contacts]);



  // =========================
  // FETCH EMERGENCIES
  // =========================
  const fetchEmergencies = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('emergency_requests')
      .select('*')
      .order('created_at', { ascending: false });

    setEmergencies(data || []);
    setLoading(false);
  };

  // =========================
  // LOAD CONTACTS
  // =========================
  const fetchContacts = async () => {
    const { data } = await supabase.from('emergency_contacts').select('*');

    setContacts(data || []);

    const uniqueCountries = [...new Set((data || []).map((c) => c.country))];
    setCountries(uniqueCountries);
  };

  useEffect(() => {
    fetchEmergencies();
    fetchContacts();
  }, []);

  // =========================
  // FILE UPLOAD
  // =========================
  const uploadFile = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('emergency-files')
      .upload(fileName, file);

    if (error) return null;

    const { data: urlData } = supabase.storage
      .from('emergency-files')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  // =========================
  // SEND EMERGENCY (UPDATED)
  // =========================
const sendEmergency = async () => {
  if (!message.trim() && !file) return;

  setUploading(true);
  setSuccess(false);

  let file_url = null;

  if (file) {
    file_url = await uploadFile(file);
  }

  const { error } = await supabase.from('emergency_requests').insert({
    message,
    file_url,
    priority,
    user_id: profile?.id,
    status: 'open',
  });

  if (!error) {
    setMessage('');
    setFile(null);
    setPriority('standard');

    setSuccess(true); // ✅ show success message
    fetchEmergencies();

    // auto hide after 3s
    setTimeout(() => setSuccess(false), 3000);
  }

  setUploading(false);
};
  // =========================
  // CONTACT SEARCH (UNCHANGED LOGIC)
  // =========================
  const findContact = () => {
    const match = contacts.find(
      (c) => c.country === selectedCountry && c.city === selectedCity
    );

    setContact(
      match ? { police: match.police, ambulance: match.ambulance } : null
    );
  };

  // =========================
  // PRIORITY COLOR FUNCTION
  // =========================
  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'critical':
        return 'text-red-600 font-bold';
      case 'urgent':
        return 'text-orange-500 font-semibold';
      default:
        return 'text-green-600';
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Emergency Aid
      </h1>

      {/* ================= EMERGENCY FORM ================= */}
      <div className="mb-4 border p-4 rounded">

        <textarea
          className="w-full border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe emergency..."
        />

        {/* PRIORITY SELECT (NEW) */}
        <select
          className="border p-2 mt-2 mr-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
        >
          <option value="critical">🔴 Critical / Life-threatening</option>
          <option value="urgent">🟠 Urgent</option>
          <option value="standard">🟢 Standard</option>
        </select>

        <input
          type="file"
          className="mt-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={sendEmergency}
          disabled={uploading}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        >
          {uploading ? 'Sending...' : 'Send Emergency'}
        </button>
        {success && (
          <p className="text-green-600 text-sm mt-2">
             ✅ Emergency sent successfully
          </p>
        )}
      </div>

      {/* ================= CONTACT SECTION ================= */}
      <div className="mb-6 border p-4 rounded bg-gray-50">

        <h2 className="font-bold mb-2">🌍 Emergency Contacts</h2>

        <select
          className="border p-2 mr-2"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">Country</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="border p-2 mr-2"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedCountry}
        >
          <option value="">City</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={findContact}
          className="bg-blue-500 text-white px-3 py-2 rounded"
        >
          Search
        </button>

        {contact && (
          <div className="mt-3">
            <p>🚓 Police: {contact.police}</p>
            <p>🚑 Ambulance: {contact.ambulance}</p>
          </div>
        )}
      </div>


    </div>
  );
}