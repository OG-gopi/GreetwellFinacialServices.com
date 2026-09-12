import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Send,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Clock,
  Share2,
  Image as ImageIcon,
  Eye,
  History,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Tablet,
  Smartphone,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  X,
  Filter,
  Tag,
  ZoomIn,
  Edit3,
  Search,
  Award,
  HeartHandshake,
  User,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface WebsiteManagementSubProps {
  subPage?: 'content' | 'contact' | 'social' | 'media' | 'preview' | 'history';
}

const SECTION_OPTIONS = [
  'ALL',
  'CSR Activities',
  'Recognition',
  'Hero Banner',
  'Company Logo',
  'About Us',
  'Loans',
  'Insurance',
  'Investments',
  'Contact Us',
  'Footer',
  'Custom Section'
];

export const WebsiteManagementSub: React.FC<WebsiteManagementSubProps> = ({ subPage = 'content' }) => {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'content' | 'contact' | 'social' | 'media' | 'preview' | 'history'>(subPage);

  // Unsaved changes tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<'content' | 'contact' | 'social' | 'media' | 'preview' | 'history' | null>(null);

  useEffect(() => {
    if (subPage && subPage !== activeTab) {
      if (isDirty) {
        setPendingTab(subPage);
        setShowUnsavedModal(true);
      } else {
        setActiveTab(subPage);
      }
    }
  }, [subPage]);

  const handleTabChange = (targetTab: 'content' | 'contact' | 'social' | 'media' | 'preview' | 'history') => {
    if (targetTab === activeTab) return;
    if (isDirty) {
      setPendingTab(targetTab);
      setShowUnsavedModal(true);
    } else {
      setActiveTab(targetTab);
    }
  };

  const confirmLeaveWithoutSaving = () => {
    setIsDirty(false);
    setShowUnsavedModal(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
    fetchData(); // Reload clean data
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const [hasUnpublishedDrafts, setHasUnpublishedDrafts] = useState(false);
  const [lastUpdatedInfo, setLastUpdatedInfo] = useState<any | null>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  // Media Tab Filters & Search
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);

  const [lightboxItem, setLightboxItem] = useState<any | null>(null);
  const [selectedMediaItem, setSelectedMediaItem] = useState<any | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadSection, setUploadSection] = useState('CSR Activities');
  const [uploadCategory, setUploadCategory] = useState('CSR ACTIVITIES');
  const [uploadDisplayType, setUploadDisplayType] = useState<'CARD' | 'BANNER'>('CARD');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('');
  const [uploadUrlInput, setUploadUrlInput] = useState<string>('');
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSection, setEditSection] = useState('CSR Activities');
  const [editCategory, setEditCategory] = useState('');
  const [editDisplayType, setEditDisplayType] = useState<'CARD' | 'BANNER'>('CARD');

  // Add Contact Form State
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactKey, setNewContactKey] = useState('');
  const [newContactVal, setNewContactVal] = useState('');

  // Add Social Form State
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Preview state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'draft' | 'published'>('draft');

  // Broken images tracker
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const validateIndianPhone = (phone: string): boolean => {
    if (!phone || phone.trim() === '') return true;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 12;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website/admin');
      if (res.data.success) {
        setHasUnpublishedDrafts(res.data.data.hasUnpublishedDrafts);
        setLastUpdatedInfo(res.data.data.lastUpdated || null);
        setContents(res.data.data.contents || []);
        setContacts(res.data.data.contacts || []);
        setSocials(res.data.data.socials || []);
        setMedia(res.data.data.media || []);
        setIsDirty(false);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Unable to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/website/admin/history');
      if (res.data.success) {
        setHistoryLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHistory();
  }, []);

  const getMediaUrl = (url?: string) => {
    if (!url || !url.trim()) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    if (url.startsWith('/')) {
      return `http://localhost:5000/uploads/media${url}`;
    }
    return `http://localhost:5000/uploads/media/${url}`;
  };

  // Form Field Handlers with dirty tracking
  const handleContentChange = (key: string, value: string) => {
    setIsDirty(true);
    setContents((prev) =>
      prev.map((c) => (c.key === key ? { ...c, draftValue: value } : c))
    );
  };

  const handleContactChange = (key: string, field: 'draftValue' | 'isActive', value: any) => {
    setIsDirty(true);
    setContacts((prev) =>
      prev.map((c) => (c.key === key ? { ...c, [field]: value } : c))
    );
  };

  const handleSocialChange = (id: string, field: 'draftUrl' | 'draftIsActive', value: any) => {
    setIsDirty(true);
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Section-Level Save Handlers
  const handleSaveContentSection = async () => {
    try {
      setSavingSection(true);
      const res = await api.post('/website/admin/draft', { contents });
      if (res.data.success) {
        showSuccess('Website Content saved successfully to database.');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Unable to save website content. Please try again.');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveContactSection = async () => {
    // Validate phone numbers
    for (const item of contacts) {
      if (item.key && (item.key.includes('phone') || item.key === 'toll_free' || item.key === 'whatsapp')) {
        if (item.draftValue && !validateIndianPhone(item.draftValue)) {
          showError(`Invalid Indian phone number for '${item.title || item.key}'. Must contain 10 to 12 numeric digits.`);
          return;
        }
      }
    }

    try {
      setSavingSection(true);
      const res = await api.post('/website/admin/draft', { contacts });
      if (res.data.success) {
        showSuccess('Contact Information saved successfully to database.');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Unable to save contact details. Please try again.');
    } finally {
      setSavingSection(false);
    }
  };

  const handleSaveSocialSection = async () => {
    // Validate social URLs
    for (const item of socials) {
      const url = item.draftUrl !== undefined ? item.draftUrl : item.url;
      if (url && url.trim() !== '' && !isValidUrl(url)) {
        showError(`Invalid URL format for ${item.platform}. Must start with http:// or https://`);
        return;
      }
    }

    try {
      setSavingSection(true);
      const res = await api.post('/website/admin/draft', { socials });
      if (res.data.success) {
        showSuccess('Social Media Accounts saved successfully to database.');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Unable to save social media links. Please try again.');
    } finally {
      setSavingSection(false);
    }
  };

  // Global Save All / Publish / Discard
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await api.post('/website/admin/draft', {
        contents,
        contacts,
        socials,
        media,
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Draft changes saved successfully.');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Unable to save draft changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const res = await api.post('/website/admin/publish');
      if (res.data.success) {
        showSuccess('Website content published live successfully!');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to publish changes to live website.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm('Are you sure you want to discard all draft changes and revert to the published live version?')) {
      return;
    }
    try {
      setDiscarding(true);
      const res = await api.post('/website/admin/discard');
      if (res.data.success) {
        showSuccess('Draft changes discarded. Reverted to live published content.');
        setIsDirty(false);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to discard draft changes.');
    } finally {
      setDiscarding(false);
    }
  };

  // Add Contact Detail Submission
  const handleAddContactSubmit = () => {
    if (!newContactTitle.trim()) {
      showError('Please enter a Contact Field Title.');
      return;
    }
    const key = newContactKey.trim() || newContactTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const isPhone = key.includes('phone') || key.includes('mobile') || key.includes('whatsapp') || key.includes('toll');

    if (isPhone && newContactVal && !validateIndianPhone(newContactVal)) {
      showError('Invalid Indian phone number. Must contain 10 to 12 numeric digits.');
      return;
    }

    const newItem = {
      key,
      title: newContactTitle.trim(),
      draftValue: newContactVal.trim(),
      publishedValue: '',
      isActive: true,
      displayOrder: contacts.length + 1
    };

    setContacts((prev) => [...prev, newItem]);
    setIsDirty(true);
    setShowAddContactModal(false);
    setNewContactTitle('');
    setNewContactKey('');
    setNewContactVal('');
    showSuccess(`Added new contact field '${newContactTitle}'. Click Save Contact Information to persist.`);
  };

  const handleRemoveContact = (key: string) => {
    if (!window.confirm('Are you sure you want to remove this contact detail?')) return;
    setContacts((prev) => prev.filter((c) => c.key !== key));
    setIsDirty(true);
    showSuccess('Contact detail removed. Click Save Contact Information to save changes.');
  };

  // Add Social Account Submission
  const handleAddSocialSubmit = () => {
    if (!newSocialPlatform.trim()) {
      showError('Please enter Platform Name.');
      return;
    }
    if (newSocialUrl && !isValidUrl(newSocialUrl)) {
      showError('Invalid URL format. Must start with http:// or https://');
      return;
    }

    const newItem = {
      id: `custom_${Date.now()}`,
      platform: newSocialPlatform.trim(),
      url: newSocialUrl.trim(),
      draftUrl: newSocialUrl.trim(),
      isActive: true,
      draftIsActive: true,
      displayOrder: socials.length + 1,
      icon: 'Share2'
    };

    setSocials((prev) => [...prev, newItem]);
    setIsDirty(true);
    setShowAddSocialModal(false);
    setNewSocialPlatform('');
    setNewSocialUrl('');
    showSuccess(`Added social media account '${newSocialPlatform}'. Click Save Social Media Accounts to persist.`);
  };

  const handleRemoveSocial = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this social media account?')) return;
    setSocials((prev) => prev.filter((s) => s.id !== id));
    setIsDirty(true);
    showSuccess('Social media account removed. Click Save Social Media Accounts to save changes.');
  };

  // Upload File Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size exceeds maximum limit of 5MB. Please select a smaller image file.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showError('Invalid file format. Only JPG, JPEG, PNG, and WEBP files are allowed.');
      return;
    }

    setUploadFile(file);
    const localUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(localUrl);
  };

  // Submit Upload Image Modal
  const handleCreateMediaSubmit = async (publishNow: boolean = false) => {
    if (!uploadTitle.trim()) {
      showError('Please provide an Image Title.');
      return;
    }
    if (!uploadFile && !uploadUrlInput.trim()) {
      showError('Please select an image file to upload or enter an image URL.');
      return;
    }

    try {
      setIsSubmittingMedia(true);
      let finalImageUrl = uploadUrlInput.trim();

      if (uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);

        const uploadRes = await api.post('/website/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          finalImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const res = await api.post('/website/admin/media', {
        title: uploadTitle,
        description: uploadDesc,
        section: uploadSection,
        category: uploadCategory || (uploadSection === 'CSR Activities' ? 'CSR ACTIVITIES' : uploadSection === 'Recognition' ? 'RECOGNITION' : 'GENERAL'),
        displayType: uploadDisplayType,
        imageUrl: finalImageUrl,
        publishNow,
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Image uploaded successfully.');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadDesc('');
        setUploadFile(null);
        setUploadPreviewUrl('');
        setUploadUrlInput('');
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || err.message || 'Failed to upload and save image.');
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  // Edit Modal Submission
  const handleOpenEditModal = (item: any) => {
    setSelectedMediaItem(item);
    setEditTitle(item.draftTitle || item.title || '');
    setEditDesc(item.draftDescription || item.description || '');
    setEditSection(item.section || 'CSR Activities');
    setEditCategory(item.draftCategory || item.category || '');
    setEditDisplayType(item.draftDisplayType || item.displayType || 'CARD');
    setShowEditModal(true);
  };

  const handleEditMediaSubmit = async (publishNow: boolean = false) => {
    if (!selectedMediaItem) return;
    try {
      setIsSubmittingMedia(true);
      const res = await api.put(`/website/admin/media/${selectedMediaItem.id}`, {
        title: editTitle,
        description: editDesc,
        section: editSection,
        category: editCategory,
        displayType: editDisplayType,
        publishNow,
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Image details updated successfully.');
        setShowEditModal(false);
        setSelectedMediaItem(null);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update image details.');
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  // Replace Image Submission
  const handleReplaceImageSubmit = async (publishNow: boolean = false) => {
    if (!selectedMediaItem) return;
    if (!uploadFile && !uploadUrlInput.trim()) {
      showError('Please select a new image file or enter a new Image URL.');
      return;
    }

    try {
      setIsSubmittingMedia(true);
      let newImageUrl = uploadUrlInput.trim();

      if (uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);

        const uploadRes = await api.post('/website/admin/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          newImageUrl = uploadRes.data.url;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const res = await api.put(`/website/admin/media/${selectedMediaItem.id}`, {
        imageUrl: newImageUrl,
        publishNow,
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Image replaced successfully.');
        setShowReplaceModal(false);
        setSelectedMediaItem(null);
        setUploadFile(null);
        setUploadPreviewUrl('');
        setUploadUrlInput('');
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to replace image file.');
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  // Delete Media Item
  const handleDeleteMediaConfirm = async () => {
    if (!selectedMediaItem) return;
    try {
      setIsSubmittingMedia(true);
      const res = await api.delete(`/website/admin/media/${selectedMediaItem.id}`);
      if (res.data.success) {
        showSuccess(res.data.message || 'Image removed successfully.');
        setShowDeleteModal(false);
        setSelectedMediaItem(null);
        fetchData();
        fetchHistory();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to remove media record.');
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  // Filtered media items
  const filteredMedia = media.filter((item) => {
    const matchesSection =
      selectedSectionFilter === 'ALL' || item.section === selectedSectionFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.section?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    return matchesSection && matchesSearch;
  });

  const heroContent = contents.filter((c) => c.section === 'HERO');
  const servicesContent = contents.filter((c) => c.section === 'SERVICES');
  const aboutContent = contents.filter((c) => c.section === 'ABOUT');
  const footerContent = contents.filter((c) => c.section === 'FOOTER');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website & Portal Management</h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                Upload, manage, and publish website content, contact details, social media links, and media assets.
              </p>
            </div>
          </div>

          {/* Status Indicator & Global Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {hasUnpublishedDrafts ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unpublished Draft Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Published & Live Up-to-Date
              </span>
            )}

            <button
              onClick={handleDiscard}
              disabled={discarding || !hasUnpublishedDrafts}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Discard Draft
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish Changes Live'}
            </button>
          </div>
        </div>

        {/* Last Updated Metadata Bar */}
        {lastUpdatedInfo && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium gap-2 bg-slate-50/60 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Last Updated:</strong> {new Date(lastUpdatedInfo.date).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>
                <strong>Last Updated By:</strong> {lastUpdatedInfo.by} ({lastUpdatedInfo.role || 'Super Admin'})
              </span>
            </div>
            {lastUpdatedInfo.section && (
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold text-[10px]">
                  {lastUpdatedInfo.section}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Submenu Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-4 pt-2 shadow-sm gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('content')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          Website Content
        </button>

        <button
          onClick={() => handleTabChange('contact')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          Contact Information
        </button>

        <button
          onClick={() => handleTabChange('social')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'social'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Social Media
        </button>

        <button
          onClick={() => handleTabChange('media')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'media'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Images & Media
        </button>

        <button
          onClick={() => handleTabChange('preview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview Changes
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Change History
        </button>
      </div>

      {/* TAB 1: WEBSITE CONTENT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Section Save Header Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Website Content Sections</h2>
              <p className="text-xs text-slate-500">Edit hero banner, services descriptions, about us text, and footer copyright.</p>
            </div>
            <button
              onClick={handleSaveContentSection}
              disabled={savingSection}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSection ? 'Saving Changes...' : 'Save Content Changes'}
            </button>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Hero Banner Section
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {heroContent.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    {item.label}
                  </label>
                  {item.key === 'hero_subtitle' ? (
                    <textarea
                      rows={2}
                      value={item.draftValue}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.draftValue}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Service Card Descriptions (Loans, Insurance, Investments)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {servicesContent.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    {item.label}
                  </label>
                  <textarea
                    rows={3}
                    value={item.draftValue}
                    onChange={(e) => handleContentChange(item.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              About Us, Mission & Vision
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {aboutContent.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    {item.label}
                  </label>
                  {item.key === 'about_body' ? (
                    <textarea
                      rows={4}
                      value={item.draftValue}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={item.draftValue}
                      onChange={(e) => handleContentChange(item.key, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              Footer Copyright & Legal Disclaimer
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {footerContent.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    {item.label}
                  </label>
                  <textarea
                    rows={2}
                    value={item.draftValue}
                    onChange={(e) => handleContentChange(item.key, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Changes Bar */}
          <div className="flex justify-end bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <button
              onClick={handleSaveContentSection}
              disabled={savingSection}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSection ? 'Saving...' : 'Save Content Changes'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: CONTACT INFORMATION */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contact Details & Business Operating Info</h2>
              <p className="text-xs text-slate-500 mt-1">
                Indian phone numbers require 10 to 12 numeric digits. Disabled or removed fields will disappear from the public website.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddContactModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Contact Detail
              </button>
              <button
                onClick={handleSaveContactSection}
                disabled={savingSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSection ? 'Saving...' : 'Save Contact Information'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contacts.map((item) => (
              <div key={item.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {item.title}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center cursor-pointer gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.isActive}
                        onChange={(e) => handleContactChange(item.key, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>{item.isActive ? 'Active' : 'Disabled'}</span>
                    </label>
                    <button
                      onClick={() => handleRemoveContact(item.key)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove contact field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {item.key === 'office_address' || item.key === 'business_hours' ? (
                  <textarea
                    rows={2}
                    value={item.draftValue}
                    onChange={(e) => handleContactChange(item.key, 'draftValue', e.target.value)}
                    placeholder={`Enter ${item.title}`}
                    className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={item.draftValue}
                    onChange={(e) => handleContactChange(item.key, 'draftValue', e.target.value)}
                    placeholder={`Enter ${item.title}`}
                    className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveContactSection}
              disabled={savingSection}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSection ? 'Saving...' : 'Save Contact Information'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL MEDIA */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Social Media Account Links</h2>
              <p className="text-xs text-slate-500 mt-1">
                Toggle platforms active or disabled. Disabled platforms or empty links will automatically disappear from the public website.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddSocialModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Social Account
              </button>
              <button
                onClick={handleSaveSocialSection}
                disabled={savingSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSection ? 'Saving...' : 'Save Social Media Accounts'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socials.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-extrabold text-slate-900">{item.platform}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center cursor-pointer gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.draftIsActive !== undefined ? item.draftIsActive : item.isActive}
                        onChange={(e) => handleSocialChange(item.id, 'draftIsActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>
                        {(item.draftIsActive !== undefined ? item.draftIsActive : item.isActive) ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                    <button
                      onClick={() => handleRemoveSocial(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <input
                  type="url"
                  value={item.draftUrl !== undefined ? item.draftUrl : item.url}
                  onChange={(e) => handleSocialChange(item.id, 'draftUrl', e.target.value)}
                  placeholder={`https://${item.platform.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/greetwell`}
                  className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveSocialSection}
              disabled={savingSection}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSection ? 'Saving...' : 'Save Social Media Accounts'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: IMAGES & MEDIA */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Website Images & Media Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload new photos, manage CSR Activities & Recognition cards, edit details, replace files, and remove images live.
              </p>
            </div>

            <button
              onClick={() => {
                setUploadTitle('');
                setUploadDesc('');
                setUploadSection('CSR Activities');
                setUploadCategory('CSR ACTIVITIES');
                setUploadFile(null);
                setUploadPreviewUrl('');
                setUploadUrlInput('');
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Upload New Image
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select
                value={selectedSectionFilter}
                onChange={(e) => setSelectedSectionFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                {SECTION_OPTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === 'ALL' ? 'All Website Sections' : sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search images by title, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Media Items Card Grid */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((item) => {
                const currentImgUrl = getMediaUrl(item.draftUrl || item.publishedUrl);
                const isDraft = item.status === 'DRAFT' || item.draftUrl !== item.publishedUrl;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                      {brokenImages[item.id] || !currentImgUrl ? (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-amber-400 space-y-1.5 bg-slate-900 w-full h-full">
                          <AlertCircle className="w-8 h-8 text-amber-400" />
                          <span className="text-xs font-black text-amber-300">Original Image File Missing</span>
                          <span className="text-[10px] text-slate-400 font-medium">Click Replace to Upload Original</span>
                        </div>
                      ) : (
                        <img
                          src={currentImgUrl}
                          alt={item.draftTitle || item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setBrokenImages((prev) => ({ ...prev, [item.id]: true }))}
                        />
                      )}

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {item.section}
                        </span>
                        {(item.draftCategory || item.category) && (
                          <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md text-white rounded-lg text-[10px] font-bold">
                            {item.draftCategory || item.category}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        {isDraft ? (
                          <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] shadow-sm">
                            DRAFT
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-500 text-white font-black rounded-lg text-[10px] shadow-sm">
                            PUBLISHED
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setLightboxItem(item)}
                        className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs"
                      >
                        <ZoomIn className="w-5 h-5" />
                        View Full Photo
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                          {item.draftTitle || item.title}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                          {item.draftDescription || item.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                            title="Edit Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMediaItem(item);
                              setUploadFile(null);
                              setUploadPreviewUrl('');
                              setUploadUrlInput('');
                              setShowReplaceModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all flex items-center gap-1"
                            title="Replace Image File"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Replace
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedMediaItem(item);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-600 font-bold text-sm">No images found for the selected section or search query.</p>
              <button
                onClick={() => {
                  setSelectedSectionFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PREVIEW CHANGES */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Live Website Preview Frame</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle view modes and responsive device dimensions to review draft changes before publishing live.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPreviewMode('draft')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    previewMode === 'draft' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Draft Version
                </button>
                <button
                  onClick={() => setPreviewMode('published')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    previewMode === 'published' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Published Live
                </button>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl text-slate-600">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-sm' : ''}`}
                  title="Desktop View"
                >
                  <Laptop className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'tablet' ? 'bg-white text-blue-600 shadow-sm' : ''}`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : ''}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center bg-slate-900 p-4 sm:p-8 rounded-2xl min-h-[500px]">
            <div
              className={`bg-white rounded-xl shadow-2xl overflow-y-auto transition-all duration-300 ${
                previewDevice === 'mobile'
                  ? 'w-[375px] h-[650px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] h-[700px]'
                  : 'w-full max-w-[1100px] min-h-[700px]'
              }`}
            >
              <div className="p-6 space-y-10 font-sans">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-900 text-white rounded-lg text-xs font-black">GFS</span>
                    <span className="font-extrabold text-slate-900 text-sm">Greetwell Financial Services</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold hidden sm:flex gap-4">
                    <span>Loans</span>
                    <span>Insurance</span>
                    <span>Investments</span>
                    <span>CSR Activities</span>
                    <span>Recognition</span>
                  </div>
                </div>

                <div className="text-center space-y-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {previewMode === 'draft'
                      ? contents.find((c) => c.key === 'hero_title')?.draftValue
                      : contents.find((c) => c.key === 'hero_title')?.publishedValue}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
                    {previewMode === 'draft'
                      ? contents.find((c) => c.key === 'hero_subtitle')?.draftValue
                      : contents.find((c) => c.key === 'hero_subtitle')?.publishedValue}
                  </p>
                  <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-extrabold shadow-md">
                    {previewMode === 'draft'
                      ? contents.find((c) => c.key === 'hero_cta')?.draftValue
                      : contents.find((c) => c.key === 'hero_cta')?.publishedValue}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-extrabold text-slate-900">CSR Activities & Social Initiatives</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {media
                      .filter((m) => m.section === 'CSR Activities')
                      .map((item) => {
                        const imgUrl = getMediaUrl(previewMode === 'draft' ? (item.draftUrl || item.publishedUrl) : item.publishedUrl);
                        return (
                          <div
                            key={item.id}
                            onClick={() => setLightboxItem(item)}
                            className="group cursor-pointer rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="h-36 bg-slate-100 overflow-hidden relative">
                              <img
                                src={imgUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = 'http://localhost:5000/uploads/media/logo.png';
                                }}
                              />
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-bold">
                                {item.draftCategory || item.category || 'CSR'}
                              </span>
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                                {previewMode === 'draft' ? (item.draftTitle || item.title) : item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {previewMode === 'draft' ? (item.draftDescription || item.description) : item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-extrabold text-slate-900">Awards & Recognition</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {media
                      .filter((m) => m.section === 'Recognition')
                      .map((item) => {
                        const imgUrl = getMediaUrl(previewMode === 'draft' ? (item.draftUrl || item.publishedUrl) : item.publishedUrl);
                        return (
                          <div
                            key={item.id}
                            onClick={() => setLightboxItem(item)}
                            className="group cursor-pointer rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="h-36 bg-slate-100 overflow-hidden relative">
                              <img
                                src={imgUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = 'http://localhost:5000/uploads/media/logo.png';
                                }}
                              />
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600 text-white rounded text-[9px] font-bold">
                                {item.draftCategory || item.category || 'AWARD'}
                              </span>
                            </div>
                            <div className="p-3">
                              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                                {previewMode === 'draft' ? (item.draftTitle || item.title) : item.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                {previewMode === 'draft' ? (item.draftDescription || item.description) : item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 text-xs">
                  <p className="font-semibold text-slate-300">
                    {previewMode === 'draft'
                      ? contents.find((c) => c.key === 'footer_copyright')?.draftValue
                      : contents.find((c) => c.key === 'footer_copyright')?.publishedValue}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {previewMode === 'draft'
                      ? contents.find((c) => c.key === 'footer_disclaimer')?.draftValue
                      : contents.find((c) => c.key === 'footer_disclaimer')?.publishedValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHANGE HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Audit History Log of Website Changes</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete record of all content edits, draft saves, live publications, and discarded changes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase bg-slate-50/50">
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Section / Field</th>
                  <th className="py-3 px-4">Previous Value</th>
                  <th className="py-3 px-4">New Value</th>
                  <th className="py-3 px-4">Modified By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                {historyLogs.length > 0 ? (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold ${
                            log.action === 'PUBLISH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'SAVE_DRAFT'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.section} / {log.fieldName}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-500" title={log.previousVal || '-'}>
                        {log.previousVal || '-'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-semibold text-slate-900" title={log.newVal || '-'}>
                        {log.newVal || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.actorName || log.actorEmail || 'Super Admin'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                      No change history logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: UNSAVED CHANGES WARNING MODAL */}
      {/* ========================================= */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Unsaved Changes</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You have unsaved changes in the current tab. Do you want to leave without saving?
            </p>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Stay on Page
              </button>
              <button
                onClick={confirmLeaveWithoutSaving}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shadow-md"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: ADD CONTACT DETAIL MODAL */}
      {/* ========================================= */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Add Contact Detail
              </h3>
              <button onClick={() => setShowAddContactModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium text-slate-800">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase mb-1">Field Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Helpline Phone"
                  value={newContactTitle}
                  onChange={(e) => setNewContactTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase mb-1">Contact Value *</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210 or help@greetwell.com"
                  value={newContactVal}
                  onChange={(e) => setNewContactVal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContactSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: ADD SOCIAL ACCOUNT MODAL */}
      {/* ========================================= */}
      {showAddSocialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Add Social Media Account
              </h3>
              <button onClick={() => setShowAddSocialModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium text-slate-800">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase mb-1">Platform Name *</label>
                <input
                  type="text"
                  placeholder="e.g. WhatsApp / Threads / Pinterest"
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase mb-1">Account URL *</label>
                <input
                  type="url"
                  placeholder="https://wa.me/919876543210"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddSocialModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSocialSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
              >
                Add Platform
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: UPLOAD NEW IMAGE MODAL */}
      {/* ========================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload New Website Image
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-800">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Image Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tree Plantation Drive 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                    Website Section *
                  </label>
                  <select
                    value={uploadSection}
                    onChange={(e) => {
                      const sec = e.target.value;
                      setUploadSection(sec);
                      if (sec === 'CSR Activities') setUploadCategory('CSR ACTIVITIES');
                      else if (sec === 'Recognition') setUploadCategory('RECOGNITION');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTION_OPTIONS.filter((s) => s !== 'ALL').map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSR ACTIVITIES"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed description or caption..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Upload Image File (JPG, PNG, WEBP max 5MB)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={uploadPreviewUrl}
                        alt="Preview"
                        className="h-32 mx-auto rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                      <p className="text-[11px] text-emerald-600 font-bold">File selected: {uploadFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-slate-600 font-bold text-xs">Click or drag image file here to upload</p>
                      <p className="text-slate-400 text-[10px]">JPG, JPEG, PNG or WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold text-[11px] mb-1">
                  Or provide Image URL:
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={uploadUrlInput}
                  onChange={(e) => setUploadUrlInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateMediaSubmit(false)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isSubmittingMedia ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleCreateMediaSubmit(true)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
              >
                {isSubmittingMedia ? 'Publishing...' : 'Publish Live Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: EDIT MEDIA DETAILS MODAL */}
      {/* ========================================= */}
      {showEditModal && selectedMediaItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Image Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-800">
              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Image Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                    Website Section *
                  </label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTION_OPTIONS.filter((s) => s !== 'ALL').map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditMediaSubmit(false)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleEditMediaSubmit(true)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
              >
                Publish Live Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: REPLACE IMAGE MODAL */}
      {/* ========================================= */}
      {showReplaceModal && selectedMediaItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Replace Image File
              </h3>
              <button
                onClick={() => setShowReplaceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-800">
              <p className="text-slate-600">
                Replacing image for: <strong className="text-slate-900">{selectedMediaItem.title}</strong>
              </p>

              <div className="h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                <img
                  src={getMediaUrl(selectedMediaItem.draftUrl || selectedMediaItem.publishedUrl)}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold uppercase tracking-wider mb-1">
                  Select New Image File
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={uploadPreviewUrl}
                        alt="New Replacement Preview"
                        className="h-28 mx-auto rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                      <p className="text-[11px] text-emerald-600 font-bold">New file ready: {uploadFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-slate-600 font-bold text-xs">Click or drag new replacement file here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowReplaceModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReplaceImageSubmit(false)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleReplaceImageSubmit(true)}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
              >
                Publish Live Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: DELETE / REMOVE CONFIRMATION MODAL */}
      {/* ========================================= */}
      {showDeleteModal && selectedMediaItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Remove Image Confirmation</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove the image <strong className="text-slate-900">"{selectedMediaItem.title}"</strong>? This will permanently delete the media record from the portal database.
            </p>

            <div className="h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
              <img
                src={getMediaUrl(selectedMediaItem.draftUrl || selectedMediaItem.publishedUrl)}
                alt="Delete Item Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMediaConfirm}
                disabled={isSubmittingMedia}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-600/20"
              >
                {isSubmittingMedia ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: FULL PHOTO LIGHTBOX MODAL */}
      {/* ========================================= */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 bg-slate-950 overflow-hidden flex items-center justify-center">
              <img
                src={getMediaUrl(lightboxItem.draftUrl || lightboxItem.publishedUrl)}
                alt={lightboxItem.title}
                className="max-h-[65vh] w-auto object-contain mx-auto"
              />
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase">
                  {lightboxItem.section}
                </span>
                {(lightboxItem.draftCategory || lightboxItem.category) && (
                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">
                    {lightboxItem.draftCategory || lightboxItem.category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white">{lightboxItem.draftTitle || lightboxItem.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-2xl">
                {lightboxItem.draftDescription || lightboxItem.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManagementSub;
