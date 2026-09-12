import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { TaskItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AgentTasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      alert('Task status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Task Management</h2>
        <p className="text-xs text-slate-500">Track and complete application review tasks and customer follow-ups</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <th className="py-3.5 px-4">Task Title & Details</th>
                <th className="py-3.5 px-4">Related App</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Loading tasks...</td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">No assigned tasks found.</td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{task.title}</p>
                      <p className="text-[11px] text-slate-500">{task.description || 'No description'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {task.applicationId || 'General'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{task.priority}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {task.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
