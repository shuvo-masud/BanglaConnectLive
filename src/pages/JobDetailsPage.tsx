import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';
import { ChevronLeft, Briefcase, MapPin, Calendar } from 'lucide-react';

export function JobDetailsPage() {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      const { data, error } = await supabase
        .from('jobs') // Replace with your table name
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        navigate('/jobs'); // Redirect back if not found
      } else {
        setJob(data);
      }
      setLoading(false);
    }

    fetchJob();
  }, [id, navigate]);

  if (loading) return <div className="p-10 text-center">Loading job details...</div>;
  if (!job) return <div className="p-10 text-center">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-teal-600 mb-6 hover:underline"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-xl text-teal-600 font-medium mt-2">{job.company_name}</p>
          </div>
          <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Apply Now
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" /> {job.job_type}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Posted {new Date(job.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="prose max-w-none">
          <h3 className="text-lg font-bold mb-3">Description</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
          
          {job.requirements && (
            <>
              <h3 className="text-lg font-bold mt-6 mb-3">Requirements</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{job.requirements}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}