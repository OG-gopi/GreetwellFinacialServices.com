import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentWorkflowStore, NotificationSim } from '@/store/agentWorkflowStore'
import { Bell, X, Mail, MessageSquare, Smartphone, Trash2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function NotificationSimulator() {
  const { notifications, clearNotifications } = useAgentWorkflowStore()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNoti, setSelectedNoti] = useState<NotificationSim | null>(null)

  const getIcon = (type: string) => {
    if (type === 'Email') return <Mail className="w-4 h-4 text-cyan-400" />
    if (type === 'WhatsApp') return <MessageSquare className="w-4 h-4 text-emerald-400" />
    return <Smartphone className="w-4 h-4 text-amber-400" />
  }

  const handleClear = () => {
    clearNotifications()
    toast.success('Simulation notification queue cleared.')
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[99] w-14 h-14 rounded-full bg-slate-950 text-white hover:bg-slate-900 border border-white/10 hover:border-cyan-500/50 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 transform hover:scale-105 group"
      >
        <Bell className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border border-slate-950 animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Sliding Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex justify-end"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border-l border-white/5 h-full shadow-2xl flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-br-full pointer-events-none" />

              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <div>
                  <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
                    GFS Dispatch Simulator
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Real-time SMS, Email, & WhatsApp verification tracker</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Notifications list queue */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4 relative z-10">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 space-y-2">
                    <Mail className="w-12 h-12 mx-auto text-slate-700" />
                    <p className="font-bold text-sm">Dispatcher Queue Empty</p>
                    <p className="text-xs max-w-[200px] mx-auto">Register new agents or update approval logs to dispatch live notifications.</p>
                  </div>
                ) : (
                  notifications.map((noti) => (
                    <div
                      key={noti.id}
                      onClick={() => setSelectedNoti(noti)}
                      className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-cyan-500/20 cursor-pointer transition-colors space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
                          {getIcon(noti.type)}
                          <span>{noti.type}</span>
                        </div>
                        <span className="text-slate-600 text-[10px]">{new Date(noti.timestamp).toLocaleTimeString()}</span>
                      </div>
                      
                      <div>
                        <span className="block text-slate-300 font-semibold truncate">To: {noti.recipient}</span>
                        {noti.subject && <span className="block text-cyan-400 font-medium truncate mt-0.5">{noti.subject}</span>}
                      </div>

                      <p className="text-slate-400 line-clamp-2 leading-relaxed bg-slate-950 p-2 rounded-lg border border-white/5 text-[11px] font-mono">
                        {noti.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Panel */}
              {notifications.length > 0 && (
                <div className="p-6 border-t border-white/5 bg-slate-950/30 flex gap-2 relative z-10">
                  <button
                    onClick={handleClear}
                    className="w-full py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Queue
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Modal view for custom email details */}
      <AnimatePresence>
        {selectedNoti && (
          <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] max-w-lg w-full text-left shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedNoti(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-white/5 pb-4 mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-white/5 flex items-center gap-1.5 w-max">
                  {getIcon(selectedNoti.type)} {selectedNoti.type} Dispatch
                </span>
                <h4 className="text-lg font-bold text-white mt-2">Recipient: {selectedNoti.recipient}</h4>
                {selectedNoti.subject && <p className="text-cyan-400 text-xs font-semibold mt-1">Subject: {selectedNoti.subject}</p>}
              </div>

              {/* simulated email templates frame styling */}
              <div className="flex-grow overflow-y-auto bg-white rounded-xl p-6 text-slate-800 text-sm font-sans relative border border-white/10 shadow-inner">
                {selectedNoti.type === 'Email' ? (
                  <div className="space-y-4">
                    {/* Simulated email header with GFS logo */}
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center p-1 border">
                        <img src="/logo.png" alt="GFS Logo" className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <strong className="text-slate-900 block text-xs">Greetwell Financial Services</strong>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Official Notification Board</span>
                      </div>
                    </div>

                    {/* Email body parsing */}
                    <div className="whitespace-pre-line leading-relaxed text-xs text-slate-700">
                      {selectedNoti.body}
                    </div>

                    {/* Email footer */}
                    <div className="border-t border-slate-100 pt-4 mt-6 text-center text-[10px] text-slate-400">
                      <p>© 2026 Greetwell Financial Services Ltd.</p>
                      <p className="mt-0.5">Jubilee Hills, Hyderabad, Telangana, India.</p>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line font-mono text-xs bg-slate-50 p-4 rounded-lg border leading-relaxed text-slate-700">
                    {selectedNoti.body}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
