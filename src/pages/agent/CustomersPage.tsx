import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, PlusCircle, Eye, Edit3, Phone, Mail, Folder } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { formatDate, generateInitials } from '@/lib/utils'

export default function CustomersPage() {
  const { user } = useAuthStore()
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setIsLoading(true)
    try {
      if (!user?.user_id) return
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('agent_id', user.user_id)
        .eq('is_deleted', false)
        .order('full_name', { ascending: true })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = customers.filter(c =>
    !search || 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  )

  return (
    <AppShell pageTitle="My Customers">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">My Customers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{customers.length} registered profiles in your directory</p>
        </div>
        <a
          href="/agent/customers/new"
          className="btn-gold flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" /> Add New Customer
        </a>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="gfs-input pl-9 w-full"
          placeholder="Search customers by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="gfs-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="gfs-table w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Occupation</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="shimmer h-4 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((cust, idx) => (
                <motion.tr
                  key={cust.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-bold shrink-0">
                        {generateInitials(cust.full_name)}
                      </div>
                      <span className="font-semibold text-slate-800">{cust.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-slate-600 font-medium">{cust.phone}</span>
                  </td>
                  <td className="text-slate-500 text-sm">{cust.email || '—'}</td>
                  <td>{cust.occupation || '—'}</td>
                  <td className="text-slate-500 text-xs">{formatDate(cust.date_of_birth)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/agent/customers/${cust.id}`}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                        title="View Profile Timeline"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No customers found matching directory filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
