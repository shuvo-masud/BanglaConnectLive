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
  PlayCircle,
} from 'lucide-react';

export function LandingPage() {
  const features = [
    { icon: Users, title: 'Mentorship Network', description: 'Connect with verified mentors for guidance on admissions, visas, careers, and life abroad.' },
    { icon: Briefcase, title: 'Jobs Board', description: 'Discover job opportunities worldwide and connect with employers in your field.' },
    { icon: Calendar, title: 'Events & Live Sessions', description: 'Join community events, webinars, and live streaming sessions.' },
    { icon: MessageCircle, title: 'Real-time Chat', description: 'Message mentors and peers directly to build meaningful connections.' },
    { icon: Folder, title: 'Personal Vault', description: 'Showcase your projects, ideas, and creative work in your own digital workspace.' },
    { icon: HeadphonesIcon, title: 'Support Center', description: 'Get help when you need it with our dedicated support ticket system.' },
  ];

  const widgets = [
    { icon: FileText, title: 'Blogs', description: 'Share knowledge & insights', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', link: '/blogs' },
    { icon: Newspaper, title: 'News', description: 'Stay updated with latest', color: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-50', link: '/blogs?tab=news' },
    { icon: JobsIcon, title: 'Jobs', description: 'Find opportunities worldwide', color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', link: '/jobs' },
    { icon: Calendar, title: 'Events', description: 'Join community events', color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', link: '/events' },
  ];

  const partners = [
    { name: 'Ministry of Education Bangladesh', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/National_Emblem_of_Bangladesh.svg/120px-National_Emblem_of_Bangladesh.svg.png', abbr: 'MOE' },
    { name: 'University of Dhaka', logo: 'https://images.seeklogo.com/logo-png/23/1/university-of-dhaka-logo-png_seeklogo-237637.png' },
    { name: 'BUET', logo: 'https://www.buet.ac.bd/assets/images/logo.png' },
    { name: 'Daffodil International University', logo: 'https://images.seeklogo.com/logo-png/36/2/daffodil-international-university-logo-png_seeklogo-361757.png' },
    { name: 'Bank Asia Ltd', logo: 'https://images.seeklogo.com/logo-png/16/9/bank-asia-limited-logo-png_seeklogo-169156.png' },
    { name: 'Eastern Bank Ltd', logo: 'https://images.seeklogo.com/logo-png/24/5/eastern-bank-limited-logo-png_seeklogo-244811.png' },
    { name: 'Prothom Alo', logo: 'https://images.seeklogo.com/logo-png/35/8/prothom-alo-logo-png_seeklogo-357794.png' },
  ];

  const testimonials = [
    { name: 'Fatima Rahman', role: 'Graduate Student, MIT', quote: 'BanglaConnect helped me find a mentor who guided me through the PhD application process. The connections here are invaluable.', avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?w=150&h=150&fit=crop' },
    { name: 'Abdullah Al Masud', role: 'Computer Science Graduate, Stuttgart, Germany', quote: 'As a mentor, I love giving back to the community. The platform makes it easy to connect with ambitious students.', avatar: 'https://xllvsvdcmntwgpnxiyvz.supabase.co/storage/v1/object/sign/Images/Photo_Masud.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNTgxODhiYS1jZDM4LTQ5MDQtYmZhNi03OTg0NDk3MDg5NTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJJbWFnZXMvUGhvdG9fTWFzdWQuanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE2ODUwNjEsImV4cCI6MTgxMjc4OTA2MX0.F2lw51p78b6sBz0Yg7A2cJLw2jktq7emEaGM0zWI38k' },
    { name: 'Nadia Islam', role: 'Pre-med Student, NYC', quote: 'My mentor helped me understand the US healthcare system and prepare for medical school interviews. Forever grateful!', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150&h=150&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">BanglaConnect</span>
                <span className="text-[10px] text-teal-600 font-bold tracking-widest uppercase mt-1">Global Network</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Sign In</Link>
              <Link to="/signup" className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-full hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all active:scale-95">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            When People Connect,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
              Opportunities Multiply
            </span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Connect with mentors, discover jobs, share knowledge, and build your personal workspace. Your trusted Bangladeshi global community platform.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group px-10 py-4 bg-teal-600 text-white rounded-full font-bold text-lg hover:bg-teal-700 transition-all flex items-center gap-3 shadow-2xl shadow-teal-600/20"
            >
              Join the Community
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/mentors"
              className="px-10 py-4 text-slate-600 font-bold hover:text-teal-600 transition-colors flex items-center gap-2"
            >
              <PlayCircle className="w-6 h-6 text-teal-600" />
              Browse Mentors
            </Link>
          </div>

          {/* Featured Visual (Using provided image) */}
          <div className="mt-20 relative max-w-5xl mx-auto">
             <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2.5rem] blur opacity-10" />
             <div className="relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl">
                <img 
                    src="/BC_landing.png" 
                    alt="Connectivity Map" 
                    className="w-full h-auto object-cover"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Widgets Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <Link
                key={widget.title}
                to={widget.link}
                className={`${widget.bgColor} rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group border border-transparent hover:border-slate-100`}
              >
                <div className="flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${widget.color} flex items-center justify-center shadow-lg`}>
                    <widget.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{widget.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{widget.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              A comprehensive platform designed for the Bangladeshi global community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 bg-white rounded-3xl border border-slate-100 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-600/5 transition-all group"
              >
                <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-teal-600/20">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create your profile', description: 'Sign up as a student seeking guidance or a mentor ready to help.' },
              { step: '02', title: 'Find your match', description: 'Browse mentors by country, field, or skills. Save favorites and reach out.' },
              { step: '03', title: 'Start growing', description: 'Connect with mentors, get advice, and build your professional network.' },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="text-7xl font-black text-slate-100 absolute -top-8 left-1/2 -translate-x-1/2 group-hover:text-teal-50 transition-colors">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-24 overflow-hidden relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <img src="/BC_landing.png" alt="" className="w-full h-full object-cover" />
         </div>
         <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Success stories</h2>
            <p className="mt-4 text-lg text-slate-400">Hear from students and mentors in our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-8 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-2xl object-cover" />
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">Trusted Partners & Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
            {partners.map((p) => (
              <img key={p.name} src={p.logo} alt={p.name} className="h-10 w-auto object-contain" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">
            Ready to connect with your community?
          </h2>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Join thousands of Bangladeshi students and professionals building meaningful connections worldwide.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">BanglaConnect</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Support</a>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            © {new Date().getFullYear()} BanglaConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}