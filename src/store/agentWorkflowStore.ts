import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface AgentApplication {
  id: string
  agentId?: string // Unique generated GFS-XXXXX Agent ID after approval
  fullName: string
  mobileNumber: string
  email: string
  gender: string
  dob: string
  city: string
  state: string
  address: string
  experience: string
  qualification: string
  resumeName: string
  documentName: string // Aadhaar or PAN filename
  profilePhotoName: string
  referralCode?: string
  status: 'Pending Verification' | 'Approved' | 'Rejected' | 'Hold'
  agentType: 'loan-agent' | 'insurance-agent' | 'investment-agent' | 'customer'
  submissionDate: string
  adminNotes?: string
  password?: string // Saved temporary or final password
  isActive: boolean
  performanceScore?: number // Mock analytics rating
  commissionRate?: number // e.g. 2.5%
}

export interface AuditLog {
  id: string
  timestamp: string
  actor: string
  action: string
  details: string
}

export interface NotificationSim {
  id: string
  timestamp: string
  type: 'Email' | 'SMS' | 'WhatsApp'
  recipient: string
  subject?: string
  body: string
}

export interface LeadRecord {
  id: string
  customerName: string
  phone: string
  serviceType: 'Loans' | 'Insurance' | 'Investments'
  amount?: string
  status: 'New' | 'Contacted' | 'In Progress' | 'Disbursed' | 'Approved' | 'Rejected'
  assignedDate: string
  lastNotes?: string
}

interface AgentWorkflowState {
  applications: AgentApplication[]
  auditLogs: AuditLog[]
  notifications: NotificationSim[]
  leads: LeadRecord[]
  activeAgentId: string | null

  // CRUD & Workflow Actions
  submitApplication: (app: Omit<AgentApplication, 'id' | 'status' | 'submissionDate' | 'isActive'>) => string
  approveApplication: (id: string, notes?: string) => void
  rejectApplication: (id: string, notes?: string) => void
  holdApplication: (id: string, notes?: string) => void
  suspendAgent: (id: string) => void
  activateAgent: (id: string) => void
  deleteAgent: (id: string) => void
  updateNotes: (id: string, notes: string) => void
  resetAgentPassword: (id: string, newPass: string) => void
  
  // Lead Actions
  assignLeadToAgent: (lead: Omit<LeadRecord, 'id' | 'assignedDate'>) => void
  updateLeadStatus: (leadId: string, status: LeadRecord['status'], notes?: string) => void

  // Notification Actions
  addNotification: (noti: Omit<NotificationSim, 'id' | 'timestamp'>) => void
  clearNotifications: () => void

  // Logging Action
  addAuditLog: (actor: string, action: string, details: string) => void
}

// Initial mock applications for the demo
const INITIAL_APPLICATIONS: AgentApplication[] = [
  {
    id: 'app-1',
    fullName: 'Rahul Sharma',
    mobileNumber: '9876543210',
    email: 'rahul.loans@gfs.com',
    gender: 'Male',
    dob: '1990-08-15',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Flat 402, Green Meadows, Jubilee Hills',
    experience: '3-5',
    qualification: 'MBA Finance',
    resumeName: 'rahul_sharma_resume.pdf',
    documentName: 'rahul_aadhaar_pan.pdf',
    profilePhotoName: 'rahul_avatar.jpg',
    referralCode: 'GFS500',
    status: 'Pending Verification',
    agentType: 'loan-agent',
    submissionDate: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    isActive: false,
    performanceScore: 85,
    commissionRate: 2.0
  },
  {
    id: 'app-2',
    fullName: 'Ananya Roy',
    mobileNumber: '9123456789',
    email: 'ananya.insure@gfs.com',
    gender: 'Female',
    dob: '1995-11-22',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'A-12, Sterling Apartments, Bandra West',
    experience: '1-2',
    qualification: 'Bachelor of Commerce',
    resumeName: 'ananya_cv_2026.pdf',
    documentName: 'ananya_pan.pdf',
    profilePhotoName: 'ananya_photo.png',
    status: 'Pending Verification',
    agentType: 'insurance-agent',
    submissionDate: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
    isActive: false,
    performanceScore: 78,
    commissionRate: 3.5
  },
  {
    id: 'app-3',
    fullName: 'Linga Prasad Goud',
    mobileNumber: '9121147777',
    email: 'linga.invest@gfs.com',
    gender: 'Male',
    dob: '1988-04-05',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'House 5-9/2, Gachibowli',
    experience: '5+',
    qualification: 'CFP (Certified Financial Planner)',
    resumeName: 'linga_prasad_resume.pdf',
    documentName: 'linga_aadhaar.pdf',
    profilePhotoName: 'linga_goud.jpg',
    status: 'Approved',
    agentId: 'GFS-20884',
    agentType: 'investment-agent',
    submissionDate: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    isActive: true,
    performanceScore: 95,
    commissionRate: 1.5,
    password: 'password123'
  }
]

const INITIAL_LEADS: LeadRecord[] = [
  {
    id: 'lead-1',
    customerName: 'Karan Malhotra',
    phone: '9988776655',
    serviceType: 'Loans',
    amount: '₹45,00,000',
    status: 'New',
    assignedDate: new Date().toISOString(),
    lastNotes: 'Requested Home Loan quote. High profile customer.'
  },
  {
    id: 'lead-2',
    customerName: 'Priya Sen',
    phone: '9000112233',
    serviceType: 'Insurance',
    amount: '₹15,00,000',
    status: 'Contacted',
    assignedDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastNotes: 'Interested in HDFC Life Insurance Term Plan.'
  },
  {
    id: 'lead-3',
    customerName: 'Venkatesh Rao',
    phone: '9848022338',
    serviceType: 'Investments',
    amount: '₹2,50,000',
    status: 'In Progress',
    assignedDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastNotes: 'Discussing Multi-cap Mutual Fund SIP allocation.'
  }
]

export const useAgentWorkflowStore = create<AgentWorkflowState>()(
  persist(
    (set, get) => ({
      applications: INITIAL_APPLICATIONS,
      auditLogs: [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: 'DB Initialize',
          details: 'Offline GFS workflow databases configured successfully.'
        }
      ],
      notifications: [
        {
          id: 'noti-1',
          timestamp: new Date().toISOString(),
          type: 'Email',
          recipient: 'rahul.loans@gfs.com',
          subject: 'Application under verification',
          body: 'Hi Rahul Sharma, GFS is verifying your business documentation.'
        }
      ],
      leads: INITIAL_LEADS,
      activeAgentId: null,

      addAuditLog: (actor, action, details) => {
        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor,
          action,
          details
        }
        set((state) => ({ auditLogs: [newLog, ...state.auditLogs] }))
      },

      addNotification: (noti) => {
        const newNoti: NotificationSim = {
          id: `noti-${Date.now()}`,
          timestamp: new Date().toISOString(),
          ...noti
        }
        set((state) => ({ notifications: [newNoti, ...state.notifications] }))
      },

      clearNotifications: () => set({ notifications: [] }),

      submitApplication: (app) => {
        const id = `app-${Date.now()}`
        const submissionDate = new Date().toISOString()
        const newApp: AgentApplication = {
          ...app,
          id,
          status: 'Pending Verification',
          submissionDate,
          isActive: false,
          performanceScore: 70, // Default baseline performance rating
          commissionRate: app.agentType === 'insurance-agent' ? 3.5 : app.agentType === 'loan-agent' ? 2.0 : 1.5
        }

        set((state) => ({
          applications: [newApp, ...state.applications]
        }))

        get().addAuditLog(app.fullName, 'Registration Requested', `Partner application submitted for type: ${app.agentType}`)
        
        get().addNotification({
          type: 'Email',
          recipient: app.email,
          subject: 'Application Received — Greetwell Financial Services',
          body: `Dear ${app.fullName},\n\nYour GFS application has been submitted successfully.\nStatus: Pending Verification.\nOur backend team will contact you shortly on ${app.mobileNumber}.\n\nBest regards,\nGreetwell Financial Team`
        })

        get().addNotification({
          type: 'SMS',
          recipient: app.mobileNumber,
          body: `GFS Alerts: Thank you ${app.fullName}. Your partner application is under verification. GFS team will reach out shortly.`
        })

        return id
      },

      approveApplication: (id, notes) => {
        const tempPassword = `GFS@${Math.floor(1000 + Math.random() * 9000)}`
        const generatedAgentId = `GFS-${Math.floor(10000 + Math.random() * 90000)}`

        set((state) => {
          const updated = state.applications.map((app) => {
            if (app.id === id) {
              return {
                ...app,
                status: 'Approved' as const,
                agentId: generatedAgentId,
                password: app.password || tempPassword,
                isActive: true,
                adminNotes: notes || app.adminNotes
              }
            }
            return app
          })
          return { applications: updated }
        })

        const approvedAgent = get().applications.find((a) => a.id === id)
        if (approvedAgent) {
          get().addAuditLog('Super Admin', 'Approved Agent', `Application ID: ${id} approved. Generated Agent ID: ${generatedAgentId}`)
          
          const roleLabel = approvedAgent.agentType === 'loan-agent' ? 'Loan Agent' : approvedAgent.agentType === 'insurance-agent' ? 'Insurance Agent' : 'Investment Agent'
          
          // Trigger Premium Welcome Email
          get().addNotification({
            type: 'Email',
            recipient: approvedAgent.email,
            subject: 'Congratulations! Your GFS Agent Partner Account is Approved',
            body: `Dear ${approvedAgent.fullName},\n\nCongratulations! Your application has been approved by our Super Admin board. You are now officially a certified ${roleLabel} Partner at Greetwell Financial Services.\n\nHere are your secure credentials:\n- Agent ID: ${generatedAgentId}\n- Login Email: ${approvedAgent.email}\n- Temporary Password: ${approvedAgent.password || tempPassword}\n- Portal Login Link: http://localhost:3000/login\n\nSecurity Guidelines:\n1. Change your password immediately upon your first login.\n2. Do not share your credentials or Agent ID with anyone.\n\nWelcome to GFS!\n\nBest regards,\nGreetwell Financial Board`
          })

          // Trigger SMS Notification
          get().addNotification({
            type: 'SMS',
            recipient: approvedAgent.mobileNumber,
            body: `GFS Alerts: Congratulations! Your partner account is approved. Agent ID: ${generatedAgentId}. Check email: ${approvedAgent.email} for temporary password.`
          })

          // Trigger WhatsApp notification
          get().addNotification({
            type: 'WhatsApp',
            recipient: approvedAgent.mobileNumber,
            body: `Welcome to GFS! 🤝 Hello ${approvedAgent.fullName}, we are absolutely thrilled to welcome you as a ${roleLabel} partner. GFS ID: ${generatedAgentId}. Let's grow together!`
          })
        }
      },

      rejectApplication: (id, notes) => {
        set((state) => {
          const updated = state.applications.map((app) => {
            if (app.id === id) {
              return {
                ...app,
                status: 'Rejected' as const,
                isActive: false,
                adminNotes: notes || app.adminNotes
              }
            }
            return app
          })
          return { applications: updated }
        })

        const agent = get().applications.find((a) => a.id === id)
        if (agent) {
          get().addAuditLog('Super Admin', 'Rejected Application', `Application ID: ${id} rejected. Reason: ${notes || 'Not specified'}`)
          
          get().addNotification({
            type: 'Email',
            recipient: agent.email,
            subject: 'Update Regarding Your GFS Partner Application',
            body: `Dear ${agent.fullName},\n\nThank you for your interest in joining Greetwell Financial Services.\n\nWe have reviewed your application and qualifications carefully. Currently, we regret to inform you that your application could not be approved. We encourage you to gain further industry exposure and reapply after 6 months.\n\nBest regards,\nGreetwell Financial Recruitment Board`
          })
        }
      },

      holdApplication: (id, notes) => {
        set((state) => {
          const updated = state.applications.map((app) => {
            if (app.id === id) {
              return {
                ...app,
                status: 'Hold' as const,
                isActive: false,
                adminNotes: notes || app.adminNotes
              }
            }
            return app
          })
          return { applications: updated }
        })

        const agent = get().applications.find((a) => a.id === id)
        if (agent) {
          get().addAuditLog('Super Admin', 'Put On Hold', `Application ID: ${id} placed on hold. Notes: ${notes || 'Awaiting additional documents'}`)
          
          get().addNotification({
            type: 'Email',
            recipient: agent.email,
            subject: 'Action Required: GFS Partner Application on Hold',
            body: `Dear ${agent.fullName},\n\nWe are currently reviewing your GFS Partner application. Our verification desk has placed your request on Hold pending document clarification.\n\nInstructions: Please contact our support line at support@gfs.com to upload clear scans.\n\nBest regards,\nGFS Verification Desk`
          })
        }
      },

      suspendAgent: (id) => {
        set((state) => ({
          applications: state.applications.map((a) => a.id === id ? { ...a, isActive: false } : a)
        }))
        const agent = get().applications.find((a) => a.id === id)
        if (agent) {
          get().addAuditLog('Super Admin', 'Suspended Agent', `Agent ID: ${agent.agentId || id} suspended.`)
        }
      },

      activateAgent: (id) => {
        set((state) => ({
          applications: state.applications.map((a) => a.id === id ? { ...a, isActive: true } : a)
        }))
        const agent = get().applications.find((a) => a.id === id)
        if (agent) {
          get().addAuditLog('Super Admin', 'Activated Agent', `Agent ID: ${agent.agentId || id} activated.`)
        }
      },

      deleteAgent: (id) => {
        const agent = get().applications.find((a) => a.id === id)
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id)
        }))
        if (agent) {
          get().addAuditLog('Super Admin', 'Deleted Agent Record', `Agent profile ${agent.fullName} deleted permanently.`)
        }
      },

      updateNotes: (id, notes) => {
        set((state) => ({
          applications: state.applications.map((a) => a.id === id ? { ...a, adminNotes: notes } : a)
        }))
      },

      resetAgentPassword: (id, newPass) => {
        set((state) => ({
          applications: state.applications.map((a) => a.id === id ? { ...a, password: newPass } : a)
        }))
        const agent = get().applications.find((a) => a.id === id)
        if (agent) {
          get().addAuditLog('Super Admin', 'Reset Password', `Agent ID ${agent.agentId || id} password reset successfully.`)
          get().addNotification({
            type: 'Email',
            recipient: agent.email,
            subject: 'Security Alert: Password Reset Success',
            body: `Dear ${agent.fullName},\n\nYour GFS Agent login password has been reset successfully. If you did not trigger this request, contact cyber-ops immediately.\n\nBest regards,\nGFS Security Center`
          })
        }
      },

      assignLeadToAgent: (lead) => {
        const newLead: LeadRecord = {
          id: `lead-${Date.now()}`,
          assignedDate: new Date().toISOString(),
          ...lead
        }
        set((state) => ({ leads: [newLead, ...state.leads] }))
      },

      updateLeadStatus: (leadId, status, notes) => {
        set((state) => ({
          leads: state.leads.map((l) => l.id === leadId ? { ...l, status, lastNotes: notes || l.lastNotes } : l)
        }))
      }
    }),
    {
      name: 'gfs-agent-workflow-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        applications: state.applications,
        auditLogs: state.auditLogs,
        notifications: state.notifications,
        leads: state.leads
      })
    }
  )
)
