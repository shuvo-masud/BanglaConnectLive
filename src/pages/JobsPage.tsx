import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Search, Plus, Building2, X, DollarSign } from 'lucide-react';
import { supabase } from '../integrations/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Job } from '../types';

export function JobsPage() {
  const { profile } = useAuthContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal Creation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('full-time');
  const [category, setCategory] = useState(''); 
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [skillsString, setSkillsString] = useState(''); 
  const [submitting, setSubmitting] = useState(false);

  // Security Check
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchJobs();
  }, [search, typeFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setJobs(data as Job[]);
    }
    setLoading(false);
  };

  const handleOpenForm = () => setIsModalOpen(true);
  
  const handleCloseForm = () => {
    setIsModalOpen(false);
    setTitle('');
    setCompany('');
    setLocation('');
    setType('full-time');
    setCategory('');
    setDescription('');
    setRequirements('');
    setSalaryRange('');
    setSkillsString('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !isAdmin) return;

    setSubmitting(true);

    // Convert comma-separated string into a clean array of strings safely
    const skillsArray = skillsString
      ? skillsString.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const { error } = await supabase.from('jobs').insert([
      {
        title,
        company,
        location,
        type,
        category, 
        description,
        requirements: requirements || null,
        salary_range: salaryRange || null,
        skills: skillsArray,
        employer_id: profile.id,
        is_active: true,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      handleCloseForm();
      fetchJobs();
    } else {
      alert('Error posting job: ' + error.message);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-emerald-100 text-emerald-700',
      'part-time': 'bg-blue-100 text-blue-700',
      'contract': 'bg-amber-100 text-amber-700',
      'internship': 'bg-purple-100 text-purple-700',
      'remote': 'bg-teal-100 text-teal-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs Board</h1>
          <p className="text-slate-600 mt-1">Find opportunities worldwide</p>
        </div>
        
        {profile && isAdmin && (
          <button
            onClick={handleOpenForm}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
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
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-teal-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-600">
                        {job.company} {job.category ? `• ${job.category}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type ? job.type.replace('-', ' ') : ''}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-0.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">
                        <DollarSign className="w-3 h-3" />
                        {job.salary_range}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Admin Post Job Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" /> Post New Job Opening
              </h2>
              <button 
                onClick={handleCloseForm} 
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text" required placeholder="Software Engineer" value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text" required placeholder="Acme Corp" value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text" required placeholder="New York, NY" value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category (Required)</label>
                  <input
                    type="text" required placeholder="Engineering" value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range (Optional)</label>
                  <input
                    type="text" placeholder="e.g. $80k - $100k" value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma Separated)</label>
                  <input
                    type="text" placeholder="React, TypeScript, Node.js" value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  required rows={3} placeholder="Detail the day-to-day responsibilities..." value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Requirements (Optional)</label>
                <textarea
                  rows={2} placeholder="List out specific qualifications..." value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button" onClick={handleCloseForm}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}