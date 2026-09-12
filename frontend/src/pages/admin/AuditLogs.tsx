import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldAlert, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { LazyLoadTrigger } from '../../components/common/LazyLoadTrigger';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLogs = async (pageToFetch = 1, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      let url = `/audit-logs?page=${pageToFetch}&limit=15&search=${encodeURIComponent(search)}`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (actionFilter) url += `&action=${actionFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        const fetchedList = res.data.data || [];
        if (isInitial) {
          setLogs(fetchedList);
        } else {
          setLogs((prev) => {
            const existingIds = new Set(prev.map((l) => l.id));
            const newUnique = fetchedList.filter((l: AuditLogItem) => !existingIds.has(l.id));
            return [...prev, ...newUnique];
          });
        }
        if (res.data.pagination) {
          setHasMore(pageToFetch < (res.data.pagination.totalPages || 1));
        } else {
          setHasMore(fetchedList.length === 15);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLogs(1, true);
  }, [search, roleFilter, actionFilter]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLogs(nextPage, false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Audit Trail Logs</h2>
          <p className="text-xs text-slate-500">Immutable security logs recording all system activities across all user roles</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search log descriptions, entity IDs, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">SUPER ADMIN</option>
            <option value="LOAN_AGENT">LOAN AGENT</option>
            <option value="INSURANCE_AGENT">INSURANCE AGENT</option>
            <option value="INVESTMENT_AGENT">INVESTMENT AGENT</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">No audit log entries matching filters.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                      </p>
                      <p className="text-[10px] text-slate-500">{log.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {log.userRole || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700 uppercase">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{log.entityType}</span>
                      {log.entityId && <span className="block text-[10px] font-mono text-slate-400">ID: {log.entityId}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <LazyLoadTrigger
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={loadingMore}
          totalItems={logs.length}
          endMessage="You're all caught up."
        />
      </div>
    </div>
  );
};
