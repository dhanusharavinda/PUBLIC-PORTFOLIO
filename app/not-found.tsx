import Link from 'next/link';
import { Database, ArrowRight, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E0F2F1] font-sans">
      {/* Header */}
      <header className="w-full border-b border-white/50 bg-white/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-[#FF9AA2]">
              <Database className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-700">buildfol.io</h1>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-8 text-sm font-medium text-slate-600">
            <Link href="/explore" className="hover:text-[#FF9AA2] transition-colors">Explore</Link>
            <Link href="/" className="text-slate-800 font-semibold hover:text-[#FF9AA2] transition-colors">Create</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* 404 Illustration */}
          <div className="relative w-full max-w-md aspect-square mb-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#B5EAD7]/60 rounded-full blur-3xl transform scale-110"></div>
            <div className="absolute inset-0 bg-[#FF9AA2]/30 rounded-full blur-3xl transform -translate-x-8 translate-y-8"></div>
            <div className="relative z-10 w-full bg-white rounded-2xl border-4 border-white p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm ring-1 ring-slate-100">
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-red-300"></div>
                    <div className="size-3 rounded-full bg-yellow-300"></div>
                    <div className="size-3 rounded-full bg-green-300"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">query_error.log</span>
                </div>
                <div className="space-y-3 font-mono text-left text-sm">
                  <p className="text-slate-500"><span className="text-[#FF9AA2] font-bold">SELECT</span> * <span className="text-[#FF9AA2] font-bold">FROM</span> portfolios</p>
                  <p className="text-slate-500"><span className="text-[#FF9AA2] font-bold">WHERE</span> user_handle = <span className="text-[#B5EAD7] font-bold bg-green-50 px-1 rounded">&apos;unknown&apos;</span>;</p>
                  <div className="pt-4 flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-[#FF9AA2]">⚠</span>
                    <p className="text-[#FF9AA2] text-xs sm:text-sm font-semibold">Row count: 0 (NULL_POINTER_EXCEPTION)</p>
                  </div>
                </div>
                <div className="h-32 w-full bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100">
                  <div className="w-full h-full bg-gradient-to-br from-[#B5EAD7]/30 to-transparent flex items-center justify-center">
                    <Database className="w-12 h-12 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-2 rounded-2xl shadow-lg rotate-6 border border-slate-100">
              <div className="bg-[#B5EAD7] text-slate-700 px-6 py-3 rounded-xl">
                <span className="text-3xl font-extrabold tracking-tighter">404</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-800">
            404: Data Point Not Found
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-lg leading-relaxed">
            This portfolio doesn&apos;t exist yet. It&apos;s like a null value in a perfect dataset—unexpected, but easily fixed!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="bg-[#FF9AA2] text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-[#FF858F] transition-all shadow-xl shadow-[#FF9AA2]/20 transform hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Create yours in 2 minutes
            </Link>
            <Link
              href="/explore"
              className="bg-white text-slate-600 px-8 py-4 rounded-xl text-base font-bold hover:bg-slate-50 hover:text-[#FF9AA2] transition-all shadow-md shadow-slate-200/50 border border-slate-100 inline-flex items-center gap-2"
            >
              Explore Portfolios
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Featured Portfolios */}
      <section className="max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-200/60">
        <h3 className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest mb-12">
          Or explore existing analysts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Alex Rivers', role: 'Data Scientist @ Fintech', skills: ['Python', 'Tableau'] },
            { name: 'Jordan Smith', role: 'Product Analyst @ SaaS', skills: ['SQL', 'Product'] },
            { name: 'Casey Chen', role: 'ML Engineer @ HealthTech', skills: ['PyTorch', 'R'] },
            { name: 'Sam Taylor', role: 'BI Lead @ Retail', skills: ['PowerBI', 'Snowflake'] },
          ].map((person, i) => (
            <Link
              key={i}
              href="/explore"
              className="group bg-white p-4 rounded-2xl border border-slate-100 hover:border-[#FF9AA2]/50 hover:shadow-xl hover:shadow-[#FF9AA2]/5 transition-all cursor-pointer"
            >
              <div className="aspect-square rounded-xl mb-4 bg-slate-50 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#FF9AA2]/5 group-hover:bg-transparent transition-colors z-10"></div>
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="font-bold text-lg text-slate-700">{person.name}</p>
              <p className="text-slate-400 text-sm mb-3">{person.role}</p>
              <div className="flex gap-2">
                {person.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-[#B5EAD7]/30 text-teal-700 text-[10px] font-bold uppercase rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 py-8 bg-white/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Database className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-bold text-slate-600">buildfol.io &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#FF9AA2] transition-colors">Create</Link>
            <Link href="/explore" className="hover:text-[#FF9AA2] transition-colors">Explore</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
