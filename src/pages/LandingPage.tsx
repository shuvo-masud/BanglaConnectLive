import { Link } from 'react-router-dom';
import {
  Globe,
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Star,
  FileText,
  Newspaper,
  Briefcase as JobsIcon,
  Calendar,
  MessageCircle,
  Folder,
  HeadphonesIcon,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Mentorship Network',
      description: 'Connect with verified mentors for guidance on admissions, visas, careers, and life abroad.',
    },
    {
      icon: Briefcase,
      title: 'Jobs Board',
      description: 'Discover job opportunities worldwide and connect with employers in your field.',
    },
    {
      icon: Calendar,
      title: 'Events & Live Sessions',
      description: 'Join community events, webinars, and live streaming sessions.',
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Message mentors and peers directly to build meaningful connections.',
    },
    {
      icon: Folder,
      title: 'Personal Vault',
      description: 'Showcase your projects, ideas, and creative work in your own digital workspace.',
    },
    {
      icon: HeadphonesIcon,
      title: 'Support Center',
      description: 'Get help when you need it with our dedicated support ticket system.',
    },
  ];

  const widgets = [
    {
      icon: FileText,
      title: 'Blogs',
      description: 'Share knowledge & insights',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      link: '/blogs',
    },
    {
      icon: Newspaper,
      title: 'News',
      description: 'Stay updated with latest',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      link: '/blogs?tab=news',
    },
    {
      icon: JobsIcon,
      title: 'Jobs',
      description: 'Find opportunities worldwide',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/jobs',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Join community events',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      link: '/events',
    },
  ];

  const partners = [
    {
      name: 'Ministry of Education Bangladesh',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/National_Emblem_of_Bangladesh.svg/120px-National_Emblem_of_Bangladesh.svg.png',
      abbr: 'MOE',
    },
    {
      name: 'University of Dhaka',
      logo: 'https://images.seeklogo.com/logo-png/23/1/university-of-dhaka-logo-png_seeklogo-237637.png',
    },
    {
      name: 'BUET',
      logo: 'https://www.buet.ac.bd/assets/images/logo.png',
    },
    {
      name: 'Daffodil International University',
      logo: 'https://images.seeklogo.com/logo-png/36/2/daffodil-international-university-logo-png_seeklogo-361757.png',
    },
    {
      name: 'Bank Asia Ltd',
      logo: 'https://images.seeklogo.com/logo-png/16/9/bank-asia-limited-logo-png_seeklogo-169156.png',
    },
    {
      name: 'Eastern Bank Ltd',
      logo: 'https://images.seeklogo.com/logo-png/24/5/eastern-bank-limited-logo-png_seeklogo-244811.png',
    },
    {
      name: 'Prothom Alo',
      logo: 'https://images.seeklogo.com/logo-png/35/8/prothom-alo-logo-png_seeklogo-357794.png',
    },
  ];

  const testimonials = [
    {
      name: 'Fatima Rahman',
      role: 'Graduate Student, MIT',
      quote: 'BanglaConnect helped me find a mentor who guided me through the PhD application process. The connections here are invaluable.',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?w=150&h=150&fit=crop',
    },
    {
      name: 'Abdullah Al Masud',
      role: 'Computer Science Graduate, Stuttgart, Germany',
      quote: 'As a mentor, I love giving back to the community. The platform makes it easy to connect with ambitious students.',
      avatar: 'https://xllvsvdcmntwgpnxiyvz.supabase.co/storage/v1/object/sign/Images/Photo_Masud.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTgxODhiYS1jZDM4LTQ5MDQtYmZhNi03OTg0NDk3MDg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvUGhvdG9fTWFzdWQuanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE2ODUwNjEsImV4cCI6MTgxMjc4OTA2MX0.F2lw51p78b6sBz0Yg7A2cJLw2jktq7emEaGM0zWI38k',
    },
    {
      name: 'Nadia Islam',
      role: 'Pre-med Student, NYC',
      quote: 'My mentor helped me understand the US healthcare system and prepare for medical school interviews. Forever grateful!',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150&h=150&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col -gap-1">
                <span className="font-semibold text-lg text-slate-800 leading-tight">BanglaConnect</span>
                <span className="text-[10px] text-teal-600 italic leading-tight">When people connect, opportunities multiply.</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Top Widgets Section */}
      <section className="pt-20 pb-4 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {widgets.map((widget) => (
              <Link
                key={widget.title}
                to={widget.link}
                className={`${widget.bgColor} rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${widget.color} flex items-center justify-center shadow-sm`}>
                    <widget.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{widget.title}</h3>
                    <p className="text-xs text-slate-500">{widget.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
              When People Connect,
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                {' '}Opportunities Multiply{' '}
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Connect with mentors, discover jobs, share knowledge, and build your personal workspace. Your trusted Bangladeshi global community platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 flex items-center justify-center gap-2"
              >
                Join the Community
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/mentors"
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:text-teal-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Browse Mentors
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span>500+ mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <span>30+ countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              A comprehensive platform designed for the Bangladeshi global community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create your profile',
                description: 'Sign up as a student seeking guidance or a mentor ready to help.',
              },
              {
                step: '02',
                title: 'Find your match',
                description: 'Browse mentors by country, field, or skills. Save favorites and reach out.',
              },
              {
                step: '03',
                title: 'Start growing',
                description: 'Connect with mentors, get advice, and build your professional network.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-teal-600/20 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Success stories
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Hear from students and mentors in our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to connect with your community?
          </h2>
          <p className="text-lg text-teal-100 mb-8">
            Join thousands of Bangladeshi students and professionals building meaningful connections worldwide.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-teal-600 bg-white rounded-xl hover:bg-teal-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-12 lg:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Our Partners</h2>
            <p className="mt-2 text-slate-600">
              Trusted by leading institutions and organizations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-14 h-14 flex items-center justify-center mb-2">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs hidden"
                    style={{ display: 'none' }}
                  >
                    {partner.abbr || partner.name.substring(0, 3).toUpperCase()}
                  </div>
                </div>
                <p className="text-xs text-center text-slate-600 font-medium leading-tight">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">BanglaConnect</span>
            </div>
            <p className="text-slate-400 text-sm">
              Building bridges for the Bangladeshi global community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
