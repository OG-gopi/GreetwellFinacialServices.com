import React, { useState, useEffect } from 'react';
import {
  FileText,
  User as UserIcon,
  Clock,
  CheckCircle2,
  X,
  Plus,
  Send,
  MessageSquare,
  Lock,
  Eye,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Layers,
  Calendar,
  Briefcase,
  DollarSign,
  Award,
  Upload,
  FileCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Application, DocumentItem, NoteItem, TaskItem } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ApplicationDetailsModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

// Helper: Check if value is present (not null, undefined, empty, or string "null" / "undefined" / "N/A")
const isValPresent = (val: any): boolean => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      !trimmed ||
      trimmed.toLowerCase() === 'null' ||
      trimmed.toLowerCase() === 'undefined' ||
      trimmed === 'N/A' ||
      trimmed === 'n/a'
    )
      return false;
  }
  return true;
};

// Helper: Format full name safely without printing "null"
const formatFullName = (firstName?: string | null, lastName?: string | null): string => {
  const parts: string[] = [];
  if (isValPresent(firstName)) parts.push(firstName!.trim());
  if (isValPresent(lastName)) parts.push(lastName!.trim());
  return parts.length > 0 ? parts.join(' ') : '';
};

// Helper: Format file size in KB / MB
const formatFileSize = (bytes?: number): string => {
  if (!bytes || isNaN(bytes)) return '102 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper: Render detail card if value exists (returns null if empty)
const renderDetailCard = (label: string, val: any, prefix: string = '', suffix: string = '') => {
  if (!isValPresent(val)) return null;
  const displayVal = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val);
  return (
    <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">{label}</span>
      <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
        {prefix}{displayVal}{suffix}
      </span>
    </div>
  );
};

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  applicationId: initialAppId,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeAppId, setActiveAppId] = useState<string | null>(initialAppId);
  const [app, setApp] = useState<Application | null>(null);
  const [customerApps, setCustomerApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CUSTOMER_DETAILS' | 'SCHEME_DETAILS' | 'DOCUMENTS' | 'REQUESTS' | 'HISTORY' | 'TASKS_NOTES'
  >('OVERVIEW');

  // Status transition state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Document Upload State
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // New Request state (Admin/Agent)
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [creatingRequest, setCreatingRequest] = useState(false);

  // Customer Reply state
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [customerReplyDocUrl, setCustomerReplyDocUrl] = useState('');
  const [replyingRequestId, setReplyingRequestId] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  // New Note state
  const [noteContent, setNoteContent] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // New Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  useEffect(() => {
    setActiveAppId(initialAppId);
  }, [initialAppId]);

  const fetchDetails = async (targetId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/${targetId}`);
      if (res.data.success) {
        const fetchedApp = res.data.data;
        setApp(fetchedApp);
        setNewStatus(fetchedApp.status);

        // Fetch customer's other applications for quick switcher sidebar
        if (fetchedApp.customer?.email) {
          try {
            const custRes = await api.get(`/applications?search=${encodeURIComponent(fetchedApp.customer.email)}`);
            if (custRes.data.success) {
              setCustomerApps(custRes.data.data || []);
            }
          } catch (e) {
            console.error('Failed to load customer applications:', e);
          }
        }
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeAppId) {
      fetchDetails(activeAppId);
    }
  }, [isOpen, activeAppId]);

  const handleUpdateStatus = async () => {
    if (!app || newStatus === app.status) return;
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/applications/${app.id}/status`, {
        status: newStatus,
        note: statusNote,
      });
      if (res.data.success) {
        showSuccess(`Application status updated to ${newStatus}.`);
        setStatusNote('');
        fetchDetails(app.id);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Status transition failed.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !uploadFile) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('applicationId', app.id);
      formData.append('title', uploadTitle.trim() || uploadFile.name);
      formData.append('file', uploadFile);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showSuccess(`Document '${uploadFile.name}' uploaded successfully!`);
        setUploadTitle('');
        setUploadFile(null);
        fetchDetails(app.id);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !requestTitle) return;
    setCreatingRequest(true);
    try {
      const res = await api.post(`/applications/${app.id}/requests`, {
        title: requestTitle,
        description: requestDesc,
      });
      if (res.data.success) {
        showSuccess('Information request created and sent to customer.');
        setRequestTitle('');
        setRequestDesc('');
        fetchDetails(app.id);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setCreatingRequest(false);
    }
  };

  const handleSubmitReply = async (requestId: string) => {
    setSubmittingReply(true);
    try {
      const res = await api.post(`/applications/requests/${requestId}/reply`, {
        customerReply: customerReplyText,
        replyDocUrl: customerReplyDocUrl,
      });
      if (res.data.success) {
        showSuccess('Reply submitted successfully.');
        setCustomerReplyText('');
        setCustomerReplyDocUrl('');
        setReplyingRequestId(null);
        fetchDetails(app!.id);
        if (onStatusUpdated) onStatusUpdated();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !noteContent) return;
    setSubmittingNote(true);
    try {
      const res = await api.post('/notes', {
        applicationId: app.id,
        content: noteContent,
        isCustomerVisible,
      });
      if (res.data.success) {
        showSuccess('Note recorded.');
        setNoteContent('');
        fetchDetails(app.id);
      }
    } catch (err: any) {
      showError('Failed to add note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !taskTitle) return;
    setSubmittingTask(true);
    try {
      const res = await api.post('/tasks', {
        applicationId: app.id,
        title: taskTitle,
        description: taskDesc,
        assignedToUserId: user?.id,
      });
      if (res.data.success) {
        showSuccess('Internal task added.');
        setTaskTitle('');
        setTaskDesc('');
        fetchDetails(app.id);
      }
    } catch (err: any) {
      showError('Failed to create task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleVerifyDoc = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Reason for rejection:') : null;
    if (status === 'REJECTED' && !reason) return;

    try {
      const res = await api.put(`/documents/${docId}/verify`, { status, rejectionReason: reason });
      if (res.data.success) {
        showSuccess(`Document marked as ${status}.`);
        fetchDetails(app!.id);
      }
    } catch (err: any) {
      showError('Failed to update document verification status.');
    }
  };

  const getStageIndex = (status: string) => {
    const map: Record<string, number> = {
      SUBMITTED: 1,
      DOCUMENTS_REQUIRED: 2,
      ASSIGNED: 3,
      UNDER_REVIEW: 4,
      INFORMATION_REQUIRED: 5,
      VERIFICATION: 6,
      APPROVED: 7,
      REJECTED: 7,
      COMPLETED: 8,
      DISBURSED: 8,
    };
    return map[status] || 1;
  };

  const parseFormData = () => {
    if (!app || !app.formData) return null;
    try {
      return typeof app.formData === 'string' ? JSON.parse(app.formData) : app.formData;
    } catch (e) {
      return null;
    }
  };

  if (!isOpen) return null;

  const parsedForm = parseFormData();
  const currentStage = app ? getStageIndex(app.status) : 1;

  const assignedAgentName = app?.assignedAgent
    ? formatFullName(app.assignedAgent.firstName, app.assignedAgent.lastName)
    : '';

  const customerFullName = app?.customer
    ? formatFullName(app.customer.firstName, app.customer.lastName)
    : 'Customer';

  const getServiceSpecificTabTitle = () => {
    if (app?.type === 'LOAN') return 'Loan Details';
    if (app?.type === 'INSURANCE') return 'Policy Details';
    if (app?.type === 'INVESTMENT') return 'Scheme Information';
    return 'Scheme Details';
  };

  const getFullFileUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Application Overview: ${app?.id || ''}`} maxWidth="max-w-6xl">
      {loading || !app ? (
        <div className="py-16 text-center text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-2" />
          Loading application record...
        </div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Breadcrumb Navigation Trail */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Applications</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{app.type.toLowerCase()} Applications</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-blue-700">{app.id}</span>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN: Customer Profile Card & Quick App Switcher (~35% width) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Customer Profile Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center border-2 border-blue-500 shadow-sm shrink-0">
                    {app.customer?.firstName ? app.customer.firstName[0].toUpperCase() : 'C'}
                    {app.customer?.lastName ? app.customer.lastName[0].toUpperCase() : ''}
                  </div>
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                      {app.customer?.customerIdCode || 'CUS-2026-000001'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-0.5 truncate">
                      {customerFullName}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-slate-700 font-medium">
                  {renderDetailCard('Email Address', app.customer?.email)}
                  {renderDetailCard('Mobile Phone', app.customer?.phone)}
                  {renderDetailCard('Education', app.customer?.education)}
                  {app.customer?.hasExperience !== undefined && renderDetailCard('Prior Experience', app.customer?.hasExperience)}
                  {renderDetailCard('Previous Employer', app.customer?.previousCompany)}
                  {renderDetailCard('Job Role', app.customer?.previousJobRole)}
                  {renderDetailCard('Years of Experience', app.customer?.yearsOfExperience)}
                </div>
              </div>

              {/* Customer's Applications Quick Switcher */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Customer Applications
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                    {customerApps.length} total
                  </span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {customerApps.map((cApp) => (
                    <button
                      key={cApp.id}
                      onClick={() => setActiveAppId(cApp.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        cApp.id === app.id
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-blue-700 text-xs">{cApp.id}</span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {cApp.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px] mt-0.5">
                          {cApp.purpose || cApp.type}
                        </p>
                      </div>
                      <StatusBadge status={cApp.status} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Application Header, Stepper, & Tab Content (~65% width) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Application Top Header Banner */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-black text-xs uppercase">
                      {app.type}
                    </span>
                    <span className="font-black text-lg text-blue-300">{app.id}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-slate-300 text-xs mt-1">
                    Submitted on: <strong>{new Date(app.createdAt).toLocaleString()}</strong> • Priority:{' '}
                    <span className="font-extrabold text-amber-400">{app.priority || 'MEDIUM'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Assigned Agent:</span>
                  <span className={`font-bold text-xs ${assignedAgentName ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {assignedAgentName || 'Awaiting Assignment'}
                  </span>
                </div>
              </div>

              {/* 8-Stage Processing Stepper */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                    Application Processing Lifecycle Stepper
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700">Stage {currentStage} of 8</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center text-[10px]">
                  {[
                    { idx: 1, name: 'Created' },
                    { idx: 2, name: 'Docs Submitted' },
                    { idx: 3, name: 'Assigned' },
                    { idx: 4, name: 'Under Review' },
                    { idx: 5, name: 'Info Required' },
                    { idx: 6, name: 'Verification' },
                    { idx: 7, name: 'Decision' },
                    { idx: 8, name: 'Completed' },
                  ].map((st) => (
                    <div
                      key={st.idx}
                      className={`p-1.5 rounded-lg font-bold border transition-all ${
                        currentStage === st.idx
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : currentStage > st.idx
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <p>{st.idx}. {st.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tab Navigation Bar */}
              <div className="flex border-b border-slate-200 gap-1.5 font-bold text-xs overflow-x-auto pb-0.5 scrollbar-none">
                {[
                  { id: 'OVERVIEW', label: 'Overview' },
                  { id: 'CUSTOMER_DETAILS', label: 'Customer Details' },
                  { id: 'SCHEME_DETAILS', label: getServiceSpecificTabTitle() },
                  { id: 'DOCUMENTS', label: `Documents (${app.documents?.length || 0})` },
                  { id: 'REQUESTS', label: `Comments & Requests (${app.requirements?.length || 0})` },
                  { id: 'TASKS_NOTES', label: `Tasks & Notes (${(app.tasks?.length || 0) + (app.notes?.length || 0)})`, agentOnly: true },
                  { id: 'HISTORY', label: 'App History' },
                ].map((t) => {
                  if (t.agentOnly && user?.role === 'CUSTOMER') return null;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`py-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
                        active
                          ? 'border-blue-600 text-blue-700 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: OVERVIEW & STATUS TRANSITION CONTROL */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b pb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" /> Application Summary
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {renderDetailCard('Application Category', app.type)}
                        {renderDetailCard('Goal / Purpose', app.purpose)}
                        {renderDetailCard('Requested Amount', app.amount, '₹ ')}
                        {renderDetailCard('Tenure / Horizon', app.term)}
                        {renderDetailCard('Priority Level', app.priority)}
                        {renderDetailCard('Submission Date', new Date(app.createdAt).toLocaleString())}
                        {renderDetailCard('Assigned Agent', assignedAgentName || 'Awaiting Assignment')}
                      </div>
                    </div>

                    {/* Status Transition Control for Agents & Super Admin */}
                    {user?.role !== 'CUSTOMER' && (
                      <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b border-blue-200 pb-2 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-blue-600" /> Update Application Status Workflow
                        </h4>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">New Permitted Status:</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full p-2.5 border rounded-xl bg-white font-bold text-xs"
                          >
                            <option value="DRAFT">DRAFT</option>
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="INFORMATION_REQUIRED">INFORMATION REQUIRED</option>
                            <option value="DOCUMENTS_REQUIRED">DOCUMENTS REQUIRED</option>
                            <option value="VERIFICATION">VERIFICATION</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Update Note (Customer Visible):</label>
                          <input
                            type="text"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            className="w-full p-2.5 border rounded-xl bg-white text-xs font-medium"
                            placeholder="Reason for status change..."
                          />
                        </div>

                        <button
                          onClick={handleUpdateStatus}
                          disabled={updatingStatus || newStatus === app.status}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow transition-all disabled:opacity-40"
                        >
                          {updatingStatus ? 'Updating Status...' : 'Commit Status Transition'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOMER DETAILS */}
              {activeTab === 'CUSTOMER_DETAILS' && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b pb-2 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-blue-600" /> Customer Information & Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {renderDetailCard('Full Name', customerFullName)}
                    {renderDetailCard('Customer ID Code', app.customer?.customerIdCode)}
                    {renderDetailCard('Email Address', app.customer?.email)}
                    {renderDetailCard('Mobile Phone', app.customer?.phone)}
                    {app.customer?.dob && renderDetailCard('Date of Birth', new Date(app.customer.dob).toLocaleDateString())}
                    {renderDetailCard('Education Qualification', app.customer?.education)}
                    {app.customer?.hasExperience !== undefined && renderDetailCard('Prior Professional Experience', app.customer?.hasExperience)}
                    {renderDetailCard('Previous Employer', app.customer?.previousCompany)}
                    {renderDetailCard('Previous Job Role', app.customer?.previousJobRole)}
                    {renderDetailCard('Years of Experience', app.customer?.yearsOfExperience)}
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICE SPECIFIC SCHEME DETAILS */}
              {activeTab === 'SCHEME_DETAILS' && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b pb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    {getServiceSpecificTabTitle()} Information ({parsedForm?.productType || app.type})
                  </h4>

                  {parsedForm ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(parsedForm)
                        .filter(([k, v]) => !['customerName', 'email', 'phone'].includes(k) && isValPresent(v))
                        .map(([key, val]) =>
                          renderDetailCard(
                            key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
                            val
                          )
                        )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500 italic">
                      No additional dynamic scheme form attributes recorded for this application.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DOCUMENTS & FILE UPLOAD */}
              {activeTab === 'DOCUMENTS' && (
                <div className="space-y-5">
                  {/* Upload New Document Form */}
                  <form onSubmit={handleUploadDocument} className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3 shadow-sm">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-blue-600" /> Upload New Document to Application
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Document Title (e.g. Income Proof, Aadhaar)"
                        className="p-2.5 border rounded-xl bg-white text-xs font-medium"
                      />
                      <input
                        type="file"
                        required
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        className="p-2 border rounded-xl bg-white text-xs font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploadingDoc || !uploadFile}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingDoc ? 'Uploading File...' : 'Upload Document'}</span>
                    </button>
                  </form>

                  {/* Uploaded Documents List */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" /> Attached Application Documents
                    </h4>

                    {app.documents?.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                        No documents uploaded yet. Use the upload box above to attach files.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {app.documents?.map((doc) => {
                          const fullUrl = getFullFileUrl(doc.fileUrl);
                          const uploaderName = doc.uploadedByUser
                            ? formatFullName(doc.uploadedByUser.firstName, doc.uploadedByUser.lastName)
                            : 'Customer';

                          return (
                            <div
                              key={doc.id}
                              className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-blue-200 transition-all"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-slate-900 text-xs truncate">
                                    {doc.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    File: <strong className="text-slate-700">{doc.fileName}</strong> ({formatFileSize(doc.fileSize)}) • Uploaded by: {uploaderName} • {new Date(doc.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                    doc.status === 'VERIFIED'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : doc.status === 'REJECTED'
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {doc.status}
                                </span>

                                {/* Preview Button */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1 font-bold text-[11px]"
                                  title="Preview Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>

                                {/* Download Button */}
                                <a
                                  href={fullUrl}
                                  download={doc.fileName}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all flex items-center gap-1 font-bold text-[11px] shadow-sm"
                                  title="Download File"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </a>

                                {/* Agent / Admin Verification Controls */}
                                {user?.role !== 'CUSTOMER' && doc.status === 'PENDING' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-sm"
                                    >
                                      Verify
                                    </button>
                                    <button
                                      onClick={() => handleVerifyDoc(doc.id, 'REJECTED')}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow-sm"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: COMMENTS & REQUESTS */}
              {activeTab === 'REQUESTS' && (
                <div className="space-y-5">
                  {user?.role !== 'CUSTOMER' && (
                    <form onSubmit={handleCreateRequest} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3 shadow-sm">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-600" /> Create Information / Document Request to Customer
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          placeholder="Request Title (e.g. Upload 3 Months Bank Statement)"
                          className="p-2.5 border rounded-xl bg-white text-xs font-medium"
                        />
                        <input
                          type="text"
                          value={requestDesc}
                          onChange={(e) => setRequestDesc(e.target.value)}
                          placeholder="Description / Instructions for Customer"
                          className="p-2.5 border rounded-xl bg-white text-xs font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={creatingRequest}
                        className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs shadow transition-all"
                      >
                        {creatingRequest ? 'Creating Request...' : 'Send Request & Notify Customer'}
                      </button>
                    </form>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase">Application Requirements & Requests</h4>
                    {app.requirements?.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs italic">
                        No open requests or comment threads for this application.
                      </div>
                    ) : (
                      app.requirements?.map((req) => (
                        <div key={req.id} className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3 shadow-sm">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="font-extrabold text-slate-900 text-xs">{req.title}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                req.status === 'CUSTOMER_REPLIED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : req.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          {req.description && <p className="text-slate-600 text-xs font-medium">{req.description}</p>}

                          {req.customerReply && (
                            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                              <p className="font-extrabold text-[10px] text-blue-700 uppercase">Customer Reply:</p>
                              <p className="text-xs font-medium">{req.customerReply}</p>
                              {req.replyDocUrl && (
                                <a
                                  href={getFullFileUrl(req.replyDocUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-700 font-bold underline text-[10px] inline-flex items-center gap-1 mt-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> View Uploaded Reply Document
                                </a>
                              )}
                            </div>
                          )}

                          {user?.role === 'CUSTOMER' && req.status !== 'COMPLETED' && (
                            <div className="pt-2">
                              {replyingRequestId === req.id ? (
                                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                                  <textarea
                                    value={customerReplyText}
                                    onChange={(e) => setCustomerReplyText(e.target.value)}
                                    placeholder="Type your reply or explanation..."
                                    className="w-full p-2.5 border rounded-xl bg-white text-xs font-medium"
                                    rows={2}
                                  />
                                  <input
                                    type="text"
                                    value={customerReplyDocUrl}
                                    onChange={(e) => setCustomerReplyDocUrl(e.target.value)}
                                    placeholder="Document URL (Optional)"
                                    className="w-full p-2.5 border rounded-xl bg-white text-xs font-medium"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleSubmitReply(req.id)}
                                      disabled={submittingReply}
                                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
                                    >
                                      Submit Reply
                                    </button>
                                    <button
                                      onClick={() => setReplyingRequestId(null)}
                                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setReplyingRequestId(req.id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow"
                                >
                                  Reply to this Request
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: TASKS & NOTES */}
              {activeTab === 'TASKS_NOTES' && user?.role !== 'CUSTOMER' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddTask} className="p-3 border rounded-2xl bg-slate-50 flex gap-2">
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="New internal task title..."
                      className="flex-1 p-2.5 border rounded-xl bg-white text-xs font-medium"
                    />
                    <button type="submit" disabled={submittingTask} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow">
                      Add Task
                    </button>
                  </form>

                  <form onSubmit={handleAddNote} className="p-3.5 border rounded-2xl bg-slate-50 space-y-2.5">
                    <textarea
                      required
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Type internal or customer note..."
                      className="w-full p-2.5 border rounded-xl bg-white text-xs font-medium"
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-slate-700 text-xs">
                        <input
                          type="checkbox"
                          checked={isCustomerVisible}
                          onChange={(e) => setIsCustomerVisible(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                        Make note visible to customer
                      </label>
                      <button type="submit" disabled={submittingNote} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow">
                        Post Note
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 7: APP HISTORY & AUDIT TRAIL */}
              {activeTab === 'HISTORY' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase border-b pb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Application History & Audit Trail
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3.5 border rounded-2xl bg-blue-50/60 border-blue-200 flex items-start gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">Application Created & Submitted</p>
                        <p className="text-[10px] text-slate-500">{new Date(app.createdAt).toLocaleString()}</p>
                        <p className="text-slate-700 text-xs mt-1 font-medium">
                          Initial category: <strong>{app.type}</strong> ({app.purpose || 'N/A'}) requested amount: ₹ {app.amount?.toLocaleString() || 'N/A'}.
                        </p>
                      </div>
                    </div>

                    {app.notes?.map((nt) => (
                      <div key={nt.id} className="p-3.5 border rounded-2xl bg-white flex items-start gap-3 shadow-sm">
                        <div className="p-2 bg-slate-100 text-slate-700 rounded-xl shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-extrabold text-slate-900 text-xs">
                              {formatFullName(nt.authorUser?.firstName, nt.authorUser?.lastName)} ({nt.authorUser?.role.replace(/_/g, ' ')})
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(nt.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-700 text-xs mt-1 font-medium">{nt.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL OVERLAY */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">{previewDoc.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{previewDoc.fileName} ({formatFileSize(previewDoc.fileSize)})</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-[360px] max-h-[500px] overflow-auto bg-slate-900 rounded-2xl flex items-center justify-center p-4">
              {previewDoc.mimeType?.startsWith('image/') || previewDoc.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={getFullFileUrl(previewDoc.fileUrl)}
                  alt={previewDoc.title}
                  className="max-h-[460px] object-contain rounded-xl shadow-lg"
                />
              ) : (
                <iframe
                  src={getFullFileUrl(previewDoc.fileUrl)}
                  title={previewDoc.title}
                  className="w-full h-[460px] rounded-xl bg-white"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Uploaded Date: {new Date(previewDoc.createdAt).toLocaleString()}
              </span>
              <a
                href={getFullFileUrl(previewDoc.fileUrl)}
                download={previewDoc.fileName}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
