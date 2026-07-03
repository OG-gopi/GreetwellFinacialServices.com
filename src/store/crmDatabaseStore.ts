import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CustomerRecord {
  id: string
  fullName: string
  mobileNumber: string
  email: string
  gender: string
  city: string
  documentName: string
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Processing' | 'Need More Documents'
  createdDate: string
  assignedAgent?: string
  processingNotes?: string
}

export interface CRMTransaction {
  id: string
  customerName: string
  type: 'EMI' | 'Payout' | 'Deposit' | 'Refund'
  amount: number
  status: 'Completed' | 'Pending' | 'Failed'
  date: string
}

export interface SupportTicket {
  id: string
  customerName: string
  category: string
  subject: string
  description: string
  status: 'Open' | 'In Progress' | 'Resolved'
  date: string
}

export interface CRMModuleControl {
  loans: boolean
  insurance: boolean
  investments: boolean
  finance: boolean
  reports: boolean
}

interface CRMDatabaseState {
  customers: CustomerRecord[]
  transactions: CRMTransaction[]
  tickets: SupportTicket[]
  moduleControls: CRMModuleControl
  
  // Actions
  addCustomer: (cust: Omit<CustomerRecord, 'id' | 'createdDate' | 'status'>) => void
  updateCustomerStatus: (id: string, status: CustomerRecord['status'], notes?: string) => void
  deleteCustomer: (id: string) => void
  addTransaction: (tx: Omit<CRMTransaction, 'id' | 'date'>) => void
  addTicket: (t: Omit<SupportTicket, 'id' | 'date' | 'status'>) => void
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void
  toggleModule: (moduleName: keyof CRMModuleControl) => void
}

// Initial realistic financial data
const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    fullName: 'Rajesh Kumar',
    mobileNumber: '9876543201',
    email: 'rajesh@gmail.com',
    gender: 'Male',
    city: 'Hyderabad',
    documentName: 'rajesh_aadhaar_pan.pdf',
    status: 'Approved',
    createdDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    assignedAgent: 'Linga Prasad Goud',
    processingNotes: 'All KYC certificates verified and cleared by Processing Desk.'
  },
  {
    id: 'cust-2',
    fullName: 'Priya Sharma',
    mobileNumber: '9012345678',
    email: 'priya@gmail.com',
    gender: 'Female',
    city: 'Mumbai',
    documentName: 'priya_pan_card.jpg',
    status: 'Under Review',
    createdDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    assignedAgent: 'Linga Prasad Goud',
    processingNotes: 'Currently validating high-value property tax files.'
  },
  {
    id: 'cust-3',
    fullName: 'Siddharth Sen',
    mobileNumber: '9845011223',
    email: 'sid.sen@gmail.com',
    gender: 'Male',
    city: 'Bangalore',
    documentName: 'sid_resume_pan.pdf',
    status: 'Pending',
    createdDate: new Date().toISOString()
  }
]

const INITIAL_TRANSACTIONS: CRMTransaction[] = [
  { id: 'tx-1', customerName: 'Rajesh Kumar', type: 'EMI', amount: 15400, status: 'Completed', date: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'tx-2', customerName: 'Priya Sharma', type: 'Deposit', amount: 50000, status: 'Completed', date: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: 'tx-3', customerName: 'Siddharth Sen', type: 'Payout', amount: 12500, status: 'Pending', date: new Date().toISOString() }
]

const INITIAL_TICKETS: SupportTicket[] = [
  { id: 't-1', customerName: 'Rajesh Kumar', category: 'EMI Billing', subject: 'EMI autopay query', description: 'Request to shift the autopay date from 5th to 10th of every month.', status: 'In Progress', date: new Date().toISOString() }
]

export const useCRMDatabaseStore = create<CRMDatabaseState>()(
  persist(
    (set, get) => ({
      customers: INITIAL_CUSTOMERS,
      transactions: INITIAL_TRANSACTIONS,
      tickets: INITIAL_TICKETS,
      moduleControls: {
        loans: true,
        insurance: true,
        investments: true,
        finance: true,
        reports: true
      },

      addCustomer: (cust) => {
        const newCust: CustomerRecord = {
          ...cust,
          id: `cust-${Date.now()}`,
          createdDate: new Date().toISOString(),
          status: 'Pending'
        }
        set((state) => ({ customers: [newCust, ...state.customers] }))
      },

      updateCustomerStatus: (id, status, notes) => {
        set((state) => ({
          customers: state.customers.map((c) => 
            c.id === id ? { ...c, status, processingNotes: notes || c.processingNotes } : c
          )
        }))
      },

      deleteCustomer: (id) => {
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }))
      },

      addTransaction: (tx) => {
        const newTx: CRMTransaction = {
          ...tx,
          id: `tx-${Date.now()}`,
          date: new Date().toISOString()
        }
        set((state) => ({ transactions: [newTx, ...state.transactions] }))
      },

      addTicket: (t) => {
        const newT: SupportTicket = {
          ...t,
          id: `t-${Date.now()}`,
          status: 'Open',
          date: new Date().toISOString()
        }
        set((state) => ({ tickets: [newT, ...state.tickets] }))
      },

      updateTicketStatus: (id, status) => {
        set((state) => ({
          tickets: state.tickets.map((t) => t.id === id ? { ...t, status } : t)
        }))
      },

      toggleModule: (moduleName) => {
        set((state) => ({
          moduleControls: {
            ...state.moduleControls,
            [moduleName]: !state.moduleControls[moduleName]
          }
        }))
      }
    }),
    {
      name: 'gfs-crm-database-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
