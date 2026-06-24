export const COUNTRIES = [
  'Bangladesh',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'UAE',
  'Saudi Arabia',
  'Sweden',
  'Netherlands',
  'Switzerland',
  'Norway',
  'Denmark',
  'Italy',
  'Spain',
  'Ireland',
  'New Zealand',
  'South Korea',
  'China',
  'India',
  'Malaysia',
  'Other',
];

export const PROFESSIONAL_FIELDS = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Design',
  'Consulting',
  'Research',
  'Law',
  'Architecture',
  'Engineering',
  'Business Development',
  'Other',
];

export const SKILLS_OPTIONS = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'Machine Learning',
  'Data Analysis',
  'Project Management',
  'Leadership',
  'Communication',
  'Public Speaking',
  'Research',
  'Writing',
  'Teaching',
  'Mentoring',
  'Networking',
  'Career Planning',
  'Interview Preparation',
  'Resume Writing',
  'Graduate School Applications',
  'Study Abroad Guidance',
  'Academic Writing',
];

export const MENTOR_SPECIALTIES = [
  'Admission Preparation',
  'Documents Check',
  'Embassy & Visa Preparation',
  'Guidance in Abroad',
];

export const PROFESSION_OPTIONS = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Financial Analyst',
  'Doctor',
  'Nurse',
  'Teacher',
  'Professor',
  'Marketing Manager',
  'Designer',
  'Consultant',
  'Researcher',
  'Lawyer',
  'Architect',
  'Civil Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Business Analyst',
  'Entrepreneur',
  'Manager',
  'Executive',
  'Other',
];

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
