import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  X,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { useMentors, useSavedMentors } from '../hooks/useMentors';
import { useAuthContext } from '../context/AuthContext';
import { COUNTRIES, PROFESSIONAL_FIELDS, SKILLS_OPTIONS, getInitials } from '../utils/helpers';

export function MentorsPage() {
  const { profile } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);

  const { mentors, loading, error } = useMentors({
    country: countryFilter || undefined,
    field: fieldFilter || undefined,
  });

  const { saveMentor, unsaveMentor, isSaved, saving } = useSavedMentors(profile?.id || '');

  const filteredMentors = useMemo(() => {
    let result = mentors;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          m.professional_field?.toLowerCase().includes(query) ||
          m.job_title?.toLowerCase().includes(query) ||
          m.bio?.toLowerCase().includes(query) ||
          m.skills?.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (skillsFilter.length > 0) {
      result = result.filter((m) =>
        skillsFilter.some((skill) =>
          m.skills?.some((s) => s.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    return result;
  }, [mentors, searchQuery, skillsFilter]);

  const handleToggleSkill = (skill: string) => {
    setSkillsFilter((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleToggleSave = async (mentorId: string) => {
    if (isSaved(mentorId)) {
      await unsaveMentor(mentorId);
    } else {
      await saveMentor(mentorId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Find Mentors</h1>
        <p className="text-slate-600 mt-1">
          Browse our network of experienced Bangladeshi professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, field, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">All Fields</option>
              {PROFESSIONAL_FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {(countryFilter || fieldFilter || skillsFilter.length > 0) && (
            <button
              onClick={() => {
                setCountryFilter('');
                setFieldFilter('');
                setSkillsFilter([]);
              }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Skills filter */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Filter by skills</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS_OPTIONS.slice(0, 12).map((skill) => (
              <button
                key={skill}
                onClick={() => handleToggleSkill(skill)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  skillsFilter.includes(skill)
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {loading ? 'Loading...' : `${filteredMentors.length} mentors found`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link
                to={`/mentors/${mentor.id}`}
                className="block p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {getInitials(mentor.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {mentor.full_name}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">
                      {mentor.job_title || mentor.professional_field || 'Professional'}
                    </p>
                    {mentor.country_of_residence && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {mentor.country_of_residence}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleSave(mentor.id);
                    }}
                    disabled={saving}
                    className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                  >
                    {isSaved(mentor.id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {mentor.bio && (
                  <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                    {mentor.bio}
                  </p>
                )}

                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {mentor.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 4 && (
                      <span className="px-2 py-0.5 text-slate-400 text-xs">
                        +{mentor.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No mentors found</h3>
          <p className="text-slate-600">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
}
