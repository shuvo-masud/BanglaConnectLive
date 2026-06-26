import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../integrations/supabase';

export function MyConnectionsPage() {
  const { profile } = useAuthContext();

  // =========================
  // MAIN DATA
  // =========================
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // SEARCH STATE
  // =========================
  const [search, setSearch] = useState('');
  const [searchCountry, setSearchCountry] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // =========================
  // FETCH CONNECTIONS (WITH JOIN)
  // =========================
  const fetchConnections = async () => {
    if (!profile) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        from_profile:profiles!connections_from_profile_id_fkey(
          id, full_name, country_of_residence
        ),
        to_profile:profiles!connections_to_profile_id_fkey(
          id, full_name, country_of_residence
        )
      `)
      .or(
        `from_profile_id.eq.${profile.id},to_profile_id.eq.${profile.id}`
      )
      .order('created_at', { ascending: false });

    if (error) console.error('FETCH ERROR:', error);

    setConnections(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchConnections();
  }, [profile]);

  // =========================
  // LOAD COUNTRIES
  // =========================
  useEffect(() => {
    const loadCountries = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('country_of_residence');

      setCountries([
        ...new Set(
          data?.map((c) => c.country_of_residence).filter(Boolean)
        ),
      ]);
    };

    loadCountries();
  }, []);

  // =========================
  // SEARCH USERS
  // =========================
  const handleSearch = async () => {
    let query = supabase.from('profiles').select('*');

    if (search.trim()) {
      query = query.ilike('full_name', `%${search}%`);
    }

    if (searchCountry) {
      query = query.eq('country_of_residence', searchCountry);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('SEARCH ERROR:', error);
      return;
    }

    setSearchResults(data || []);
  };

  // =========================
  // SEND REQUEST (UNCHANGED)
  // =========================
  const sendRequest = async (toId: string) => {
    if (!profile) return;

    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .eq('from_profile_id', profile.id)
      .eq('to_profile_id', toId)
      .maybeSingle();

    if (existing) {
      alert('Already sent request');
      return;
    }

    const { error } = await supabase.from('connections').insert({
      from_profile_id: profile.id,
      to_profile_id: toId,
      status: 'pending',
    });

    if (error) {
      console.error('SEND ERROR:', error);
      return;
    }

    fetchConnections();
  };

  // =========================
  // DELETE (SENDER)
  // =========================
  const deleteRequest = async (id: string) => {
    const { error } = await supabase
      .from('connections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE ERROR:', error);
      return;
    }

    setConnections((prev) =>
      prev.filter((c) => c.id !== id)
    );
  };

  // =========================
  // ACCEPT / REJECT (RECEIVER)
  // =========================
  const updateRequest = async (
    id: string,
    status: 'accepted' | 'declined'
  ) => {
    if (!profile) return;

    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('UPDATE ERROR:', error);
      return;
    }

    // IMPORTANT: instant UI sync (no breaking previous logic)
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status } : c
      )
    );
  };

  // =========================
  // HELPERS
  // =========================
  const getUser = (c: any) =>
    c.from_profile_id === profile?.id
      ? c.to_profile
      : c.from_profile;

  // =========================
  // FILTERS (YOUR ORIGINAL STRUCTURE KEPT)
  // =========================
  const pendingRequests = connections.filter(
    (c) =>
      c.to_profile_id === profile?.id &&
      c.status === 'pending'
  );

  const myConnections = connections.filter(
    (c) => c.status === 'accepted'
  );

  return (
    <div className="p-4 space-y-6">

      {/* =========================
          SEARCH SECTION (UNCHANGED)
      ========================= */}
      <div className="border p-4 rounded space-y-3">

        <div className="flex gap-2">

          <input
            className="border p-2 flex-1 rounded"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={searchCountry}
            onChange={(e) =>
              setSearchCountry(e.target.value)
            }
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>

        {/* SEARCH RESULTS */}
        {searchResults.map((u) => (
          <div
            key={u.id}
            className="flex justify-between border-b py-2"
          >
            <div>
              <p className="font-medium">{u.full_name}</p>
              <p className="text-sm text-gray-500">
                {u.country_of_residence}
              </p>
            </div>

            <button
              onClick={() => sendRequest(u.id)}
              className="bg-teal-600 text-white px-3 py-1 rounded"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* =========================
          PENDING REQUESTS (RECEIVED)
      ========================= */}
      <div>
        <h2 className="font-bold text-lg mb-2">
          Pending Requests
        </h2>

        {pendingRequests.length === 0 && (
          <p className="text-gray-500">
            No pending requests
          </p>
        )}

        {pendingRequests.map((c) => {
          const user = c.from_profile;

          return (
            <div
              key={c.id}
              className="border p-3 rounded flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {user?.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  wants to connect
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    updateRequest(c.id, 'accepted')
                  }
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateRequest(c.id, 'declined')
                  }
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* =========================
          MY CONNECTIONS
      ========================= */}
      <div>
        <h2 className="font-bold text-lg mb-2">
          My Connections
        </h2>

        {myConnections.length === 0 && (
          <p className="text-gray-500">
            No connections yet
          </p>
        )}

        {myConnections.map((c) => {
          const user = getUser(c);

          return (
            <div
              key={c.id}
              className="border p-3 rounded flex justify-between"
            >
              <div>
                <p className="font-medium">
                  {user?.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  Connected
                </p>
              </div>

              {/* ONLY SENDER CAN DELETE */}
              {c.from_profile_id === profile?.id && (
                <button
                  onClick={() =>
                    deleteRequest(c.id)
                  }
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}