import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Users, FileText, CheckCircle2 } from 'lucide-react'

export default function GenericDashboardContent() {
  const { user } = useAuthStore()
  
  return (
    <div className="flex flex-col flex-1 h-full animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-[2rem] p-8 mb-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-50 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-[#0a1f44] font-serif mb-3">Welcome to your workspace, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-base max-w-2xl">
            You are currently logged into the <span className="font-bold text-[#0a1f44] capitalize">{user?.module}</span> portal as a <span className="font-bold text-[#0a1f44] capitalize">{user?.role}</span>. Use the sidebar to navigate through your customized tools and reports.
          </p>
        </div>
      </div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Activity', value: '1,248', icon: <BarChart3 className="text-emerald-500" />, color: 'emerald' },
          { label: 'Active Profiles', value: '84', icon: <Users className="text-blue-500" />, color: 'blue' },
          { label: 'Pending Docs', value: '12', icon: <FileText className="text-amber-500" />, color: 'amber' },
          { label: 'Approvals', value: '312', icon: <CheckCircle2 className="text-purple-500" />, color: 'purple' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-[#0a1f44]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <FileText size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-[#0a1f44] mb-2">No recent activity found</h3>
        <p className="text-slate-500 max-w-sm mb-6">Your recent transactions, applications, and updates will appear here once you start using the platform.</p>
        <button className="inline-flex items-center gap-2 bg-[#00b4d8] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0096c7] transition-colors shadow-sm">
          Explore Dashboard <ArrowRight size={18} />
        </button>
      </div>

    </div>
  )
}
