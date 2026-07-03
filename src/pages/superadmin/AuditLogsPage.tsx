import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, Search, Filter, Download } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { formatDateTime, generateInitials, downloadCSV } from '@/lib/utils'
import type { ActivityLog } from '@/types'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, user:profiles(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (!error) setLogs(data as ActivityLog[])
    setIsLoading(false)
  }

  const filtered = logs.filter(l =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase())
  )

  const ACTION_COLORS: Record<string, string> = {
    CREATE: 'text-green-400 bg-green-500/10',
    UPDATE: 'text-blue-400 bg-blue-500/10',
    DELETE: 'text-red-400 bg-red-500/10',
    LOGIN: 'text-gold-400 bg-gold-500/10',
    APPROVE: 'text-emerald-400 bg-emerald-500/10',
    REJECT: 'text-red-400 bg-red-500/10',
  }

  return (
    <AppShell pageTitle="Audit Logs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Audit Logs</h1>
          <p className="text-navy-400 text-sm mt-0.5">Complete security audit trail</p>
        </div>
        <button
          onClick={() => downloadCSV(logs as any, 'gfs-audit-logs')}
          className="btn-outline-gold flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input className="gfs-input pl-9" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="gfs-card overflow-hidden">
        <table className="gfs-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="shimmer h-4 rounded w-24" /></td>)}</tr>
              ))
            ) : filtered.map((log, i) => (
              <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs text-gold-400 font-bold">
                      {generateInitials((log.user as any)?.full_name || 'U')}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{(log.user as any)?.full_name || '—'}</p>
                      <p className="text-xs text-navy-400">{(log.user as any)?.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${ACTION_COLORS[log.action] || 'text-navy-300 bg-navy-700'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="text-navy-300 text-sm">{log.entity_type}</td>
                <td className="text-navy-400 text-xs font-mono">{log.ip_address || '—'}</td>
                <td className="text-navy-400 text-xs">{formatDateTime(log.created_at)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-navy-400">
            <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No audit logs found</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
