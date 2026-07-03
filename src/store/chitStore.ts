import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface ChitGroup {
  id: string
  name: string
  code: string
  chitAmount: number
  monthlyInstallment: number
  durationMonths: number
  totalMembers: number
  startDate: string
  endDate: string
  auctionDate: string // e.g. "Every 5th"
  status: 'Active' | 'Closed' | 'Upcoming'
  description?: string
}

export interface ChitCustomer {
  id: string // Customer ID (e.g., CUST-CH-1001)
  fullName: string
  fatherName: string
  gender: 'male' | 'female' | 'other'
  dateOfBirth: string
  age: number
  mobileNumber: string
  alternateMobile?: string
  email: string
  aadhaarNumber: string
  panNumber: string
  occupation: string
  monthlyIncome: number
  nomineeName: string
  nomineeRelationship: string
  address: string
  village?: string
  city: string
  district: string
  state: string
  pincode: string
  joiningDate: string
  status: 'Active' | 'Inactive' | 'Blocked' | 'Completed'
  
  // Chit Details
  assignedGroupId: string
  memberNumber: number
  positionNumber: number
  joiningAmount: number
  monthlyInstallment: number
  totalInstallments: number
  paidInstallments: number
  pendingInstallments: number
  remainingAmount: number
  currentBalance: number
  auctionEligibility: boolean
  auctionWon: boolean
  auctionMonth?: number
  auctionAmount?: number
  discount?: number
  dividend?: number
  netAmountReceived?: number
  
  // Documents
  photoUrl?: string
  aadhaarDoc?: string
  panDoc?: string
  agreementDoc?: string
}

export interface ChitPayment {
  id: string
  customerId: string
  customerName: string
  groupName: string
  paymentDate: string
  month: string // e.g. "June"
  year: number // e.g. 2026
  paidAmount: number
  balanceAmount: number
  penalty: number
  lateFee: number
  discount: number
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'
  transactionId?: string
  collectedBy: string
  receiptNumber: string
  remarks?: string
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue'
}

export interface ChitAuction {
  id: string
  groupId: string
  groupName: string
  auctionDate: string
  winnerName: string
  memberNumber: number
  winningBid: number // Bid amount foregone
  discountPercentage: number
  dividend: number // dividend distributed to each member
  netPayableAmount: number // ChitAmount - WinningBid
  paymentStatus: 'Paid' | 'Pending'
  auctionNotes?: string
}

export interface ChitNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder'
  createdAt: string
  isRead: boolean
}

interface ChitState {
  groups: ChitGroup[]
  customers: ChitCustomer[]
  payments: ChitPayment[]
  auctions: ChitAuction[]
  notifications: ChitNotification[]
  dbAvailable: {
    groups: boolean
    customers: boolean
    payments: boolean
    auctions: boolean
  }
  
  // Actions - Core
  syncWithSupabase: () => Promise<void>
  
  // Actions - Groups
  createGroup: (group: Omit<ChitGroup, 'id'>) => Promise<void>
  updateGroup: (id: string, updates: Partial<ChitGroup>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  
  // Actions - Customers
  addCustomer: (customer: Omit<ChitCustomer, 'id' | 'age'>) => Promise<void>
  updateCustomer: (id: string, updates: Partial<ChitCustomer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  
  // Actions - Payments
  addPayment: (payment: Omit<ChitPayment, 'id' | 'receiptNumber'>) => Promise<void>
  updatePayment: (id: string, updates: Partial<ChitPayment>) => Promise<void>
  deletePayment: (id: string) => Promise<void>
  
  // Actions - Auctions
  addAuction: (auction: Omit<ChitAuction, 'id'>) => Promise<void>
  updateAuction: (id: string, updates: Partial<ChitAuction>) => Promise<void>
  deleteAuction: (id: string) => Promise<void>

  // Actions - Notifications
  markAllNotificationsRead: () => void
  addNotification: (title: string, message: string, type: ChitNotification['type']) => void
}

const INITIAL_GROUPS: ChitGroup[] = [
  {
    id: 'grp-1',
    name: 'Gold Chit 5L',
    code: 'GC5L-20',
    chitAmount: 500000,
    monthlyInstallment: 25000,
    durationMonths: 20,
    totalMembers: 20,
    startDate: '2026-01-05',
    endDate: '2027-08-05',
    auctionDate: 'Every 5th',
    status: 'Active',
    description: 'Gold Chit scheme with 20 members and monthly auction on 5th of every month.'
  },
  {
    id: 'grp-2',
    name: 'Platinum Chit 10L',
    code: 'PC10L-25',
    chitAmount: 1000000,
    monthlyInstallment: 40000,
    durationMonths: 25,
    totalMembers: 25,
    startDate: '2026-03-10',
    endDate: '2028-04-10',
    auctionDate: 'Every 10th',
    status: 'Active',
    description: 'Premium Platinum Chit Fund for high-value savings. Auction on the 10th.'
  },
  {
    id: 'grp-3',
    name: 'Silver Chit 2L',
    code: 'SC2L-20',
    chitAmount: 200000,
    monthlyInstallment: 10000,
    durationMonths: 20,
    totalMembers: 20,
    startDate: '2026-07-01',
    endDate: '2028-02-01',
    auctionDate: 'Every 1st',
    status: 'Upcoming',
    description: 'Affordable Silver Chit Fund. Perfect for small business owners and household savings.'
  }
]

const INITIAL_CUSTOMERS: ChitCustomer[] = [
  {
    id: 'CUST-CH-1001',
    fullName: 'Ramesh Patel',
    fatherName: 'Harshad Patel',
    gender: 'male',
    dateOfBirth: '1985-04-12',
    age: 41,
    mobileNumber: '9121147777',
    email: 'customer@gfs.com',
    aadhaarNumber: '1234-5678-9012',
    panNumber: 'ABCDE1234F',
    occupation: 'Business Owner',
    monthlyIncome: 65000,
    nomineeName: 'Sarita Patel',
    nomineeRelationship: 'Spouse',
    address: 'Flat 402, Sai Residency, Madhapur',
    village: 'Madhapur',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    joiningDate: '2026-01-05',
    status: 'Active',
    assignedGroupId: 'grp-1',
    memberNumber: 5,
    positionNumber: 5,
    joiningAmount: 25000,
    monthlyInstallment: 25000,
    totalInstallments: 20,
    paidInstallments: 5,
    pendingInstallments: 0,
    remainingAmount: 375000,
    currentBalance: 0,
    auctionEligibility: true,
    auctionWon: false,
    photoUrl: 'ramesh.png',
    aadhaarDoc: 'ramesh_aadhaar.pdf',
    panDoc: 'ramesh_pan.pdf',
    agreementDoc: 'ramesh_agreement.pdf'
  },
  {
    id: 'CUST-CH-1002',
    fullName: 'Anitha Reddy',
    fatherName: 'Venkata Reddy',
    gender: 'female',
    dateOfBirth: '1990-08-20',
    age: 35,
    mobileNumber: '9848022338',
    email: 'anitha@gfs.com',
    aadhaarNumber: '9876-5432-1098',
    panNumber: 'WXYZR9876Q',
    occupation: 'Software Engineer',
    monthlyIncome: 120000,
    nomineeName: 'Kiran Reddy',
    nomineeRelationship: 'Brother',
    address: 'Plot 45, Shilpa Hills, Gachibowli',
    village: 'Gachibowli',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    joiningDate: '2026-01-05',
    status: 'Active',
    assignedGroupId: 'grp-1',
    memberNumber: 12,
    positionNumber: 12,
    joiningAmount: 25000,
    monthlyInstallment: 25000,
    totalInstallments: 20,
    paidInstallments: 4,
    pendingInstallments: 1,
    remainingAmount: 400000,
    currentBalance: 25000,
    auctionEligibility: false,
    auctionWon: true,
    auctionMonth: 3,
    auctionAmount: 420000,
    discount: 80000,
    dividend: 4000,
    netAmountReceived: 416000,
    photoUrl: 'anitha.png',
    aadhaarDoc: 'anitha_aadhaar.pdf',
    panDoc: 'anitha_pan.pdf',
    agreementDoc: 'anitha_agreement.pdf'
  },
  {
    id: 'CUST-CH-1003',
    fullName: 'Linga Prasad Goud',
    fatherName: 'Narayana Goud',
    gender: 'male',
    dateOfBirth: '1978-11-02',
    age: 47,
    mobileNumber: '9988776655',
    email: 'demo@gfs.com',
    aadhaarNumber: '4455-6677-8899',
    panNumber: 'LPGOU8829K',
    occupation: 'Financial Advisor',
    monthlyIncome: 85000,
    nomineeName: 'Sujatha Goud',
    nomineeRelationship: 'Spouse',
    address: 'Srinagar Colony, Hyderabad',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500073',
    joiningDate: '2026-03-10',
    status: 'Active',
    assignedGroupId: 'grp-2',
    memberNumber: 1,
    positionNumber: 1,
    joiningAmount: 40000,
    monthlyInstallment: 40000,
    totalInstallments: 25,
    paidInstallments: 3,
    pendingInstallments: 0,
    remainingAmount: 880000,
    currentBalance: 0,
    auctionEligibility: true,
    auctionWon: false,
    photoUrl: 'linga.png'
  }
]

const INITIAL_PAYMENTS: ChitPayment[] = [
  {
    id: 'pay-1',
    customerId: 'CUST-CH-1001',
    customerName: 'Ramesh Patel',
    groupName: 'Gold Chit 5L',
    paymentDate: '2026-05-04',
    month: 'May',
    year: 2026,
    paidAmount: 25000,
    balanceAmount: 0,
    penalty: 0,
    lateFee: 0,
    discount: 2200,
    paymentMode: 'UPI',
    transactionId: 'TXN889210082',
    collectedBy: 'Linga Prasad Goud',
    receiptNumber: 'REC-2026-0589',
    remarks: 'Payment cleared on time.',
    status: 'Paid'
  },
  {
    id: 'pay-2',
    customerId: 'CUST-CH-1001',
    customerName: 'Ramesh Patel',
    groupName: 'Gold Chit 5L',
    paymentDate: '2026-04-03',
    month: 'April',
    year: 2026,
    paidAmount: 25000,
    balanceAmount: 0,
    penalty: 0,
    lateFee: 0,
    discount: 1800,
    paymentMode: 'Bank Transfer',
    transactionId: 'IBF49021980',
    collectedBy: 'Linga Prasad Goud',
    receiptNumber: 'REC-2026-0412',
    status: 'Paid'
  },
  {
    id: 'pay-3',
    customerId: 'CUST-CH-1002',
    customerName: 'Anitha Reddy',
    groupName: 'Gold Chit 5L',
    paymentDate: '2026-05-06',
    month: 'May',
    year: 2026,
    paidAmount: 20000,
    balanceAmount: 5000,
    penalty: 0,
    lateFee: 150,
    discount: 2200,
    paymentMode: 'Cash',
    collectedBy: 'Linga Prasad Goud',
    receiptNumber: 'REC-2026-0599',
    remarks: 'Partial payment made due to salary delay.',
    status: 'Partial'
  }
]

const INITIAL_AUCTIONS: ChitAuction[] = [
  {
    id: 'auc-1',
    groupId: 'grp-1',
    groupName: 'Gold Chit 5L',
    auctionDate: '2026-01-05',
    winnerName: 'Suresh Kumar',
    memberNumber: 2,
    winningBid: 120000,
    discountPercentage: 24,
    dividend: 6000,
    netPayableAmount: 380000,
    paymentStatus: 'Paid',
    auctionNotes: 'First auction completed successfully. Bid closed at ₹1,20,000.'
  },
  {
    id: 'auc-2',
    groupId: 'grp-1',
    groupName: 'Gold Chit 5L',
    auctionDate: '2026-02-05',
    winnerName: 'Vinod Kumar',
    memberNumber: 15,
    winningBid: 100000,
    discountPercentage: 20,
    dividend: 5000,
    netPayableAmount: 400000,
    paymentStatus: 'Paid',
    auctionNotes: 'Aggressive bidding from member 15.'
  },
  {
    id: 'auc-3',
    groupId: 'grp-1',
    groupName: 'Gold Chit 5L',
    auctionDate: '2026-03-05',
    winnerName: 'Anitha Reddy',
    memberNumber: 12,
    winningBid: 80000,
    discountPercentage: 16,
    dividend: 4000,
    netPayableAmount: 420000,
    paymentStatus: 'Paid',
    auctionNotes: 'Winner Anitha Reddy opted for immediate payout for business expansion.'
  }
]

const INITIAL_NOTIFICATIONS: ChitNotification[] = [
  { id: 'not-1', title: 'Upcoming Due Reminder', message: 'Your Gold Chit 5L installment of ₹25,000 is due on July 5th, 2026.', type: 'reminder', createdAt: new Date().toISOString(), isRead: false },
  { id: 'not-2', title: 'Auction Winner Announced', message: 'Anitha Reddy won the Gold Chit 5L Auction for Month 3 with a bid of ₹80,000.', type: 'success', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), isRead: false },
  { id: 'not-3', title: 'Payment Received', message: 'Your payment of ₹25,000 for May Gold Chit installment was recorded successfully.', type: 'info', createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), isRead: true }
]

export const useChitStore = create<ChitState>()(
  persist(
    (set, get) => ({
      groups: INITIAL_GROUPS,
      customers: INITIAL_CUSTOMERS,
      payments: INITIAL_PAYMENTS,
      auctions: INITIAL_AUCTIONS,
      notifications: INITIAL_NOTIFICATIONS,
      dbAvailable: {
        groups: false,
        customers: false,
        payments: false,
        auctions: false
      },

      syncWithSupabase: async () => {
        // Transparent Offline Demo mode check
        if ((supabase as any).supabaseUrl.includes('placeholder-project.supabase.co')) {
          console.log('[GFS Chits] Running in offline demo mode.')
          return
        }

        try {
          // 1. Groups Sync
          const groupsResult = await supabase.from('chit_groups' as any).select('*')
          if (!groupsResult.error && groupsResult.data) {
            set({ groups: groupsResult.data as any, dbAvailable: { ...get().dbAvailable, groups: true } })
          } else {
            console.warn('[GFS Chits] Using offline fallback for groups:', groupsResult.error?.message)
          }

          // 2. Customers Sync
          const custResult = await supabase.from('chit_customers' as any).select('*')
          if (!custResult.error && custResult.data) {
            set({ customers: custResult.data as any, dbAvailable: { ...get().dbAvailable, customers: true } })
          } else {
            console.warn('[GFS Chits] Using offline fallback for customers:', custResult.error?.message)
          }

          // 3. Payments Sync
          const payResult = await supabase.from('chit_payments' as any).select('*')
          if (!payResult.error && payResult.data) {
            set({ payments: payResult.data as any, dbAvailable: { ...get().dbAvailable, payments: true } })
          } else {
            console.warn('[GFS Chits] Using offline fallback for payments:', payResult.error?.message)
          }

          // 4. Auctions Sync
          const aucResult = await supabase.from('chit_auctions' as any).select('*')
          if (!aucResult.error && aucResult.data) {
            set({ auctions: aucResult.data as any, dbAvailable: { ...get().dbAvailable, auctions: true } })
          } else {
            console.warn('[GFS Chits] Using offline fallback for auctions:', aucResult.error?.message)
          }

        } catch (err) {
          console.error('[GFS Chits] Supabase synchronization failed, running on offline storage:', err)
        }
      },
      
      // Groups CRUD
      createGroup: async (group) => {
        const id = `grp-${Date.now()}`
        const newGroup: ChitGroup = { ...group, id }

        if (get().dbAvailable.groups) {
          try {
            const { data, error } = await supabase.from('chit_groups' as any).insert({ ...group, id }).select().single()
            if (!error && data) {
              set((state) => ({ groups: [...state.groups, data as any] }))
              return
            }
            console.error('[GFS Chits] Create group DB error:', error)
          } catch (err) {
            console.error(err)
          }
        }
        
        // Fallback
        set((state) => ({ groups: [...state.groups, newGroup] }))
      },
      
      updateGroup: async (id, updates) => {
        if (get().dbAvailable.groups) {
          try {
            const { data, error } = await supabase.from('chit_groups' as any).update(updates).eq('id', id).select().single()
            if (!error && data) {
              set((state) => ({
                groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g)
              }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          groups: state.groups.map(g => g.id === id ? { ...g, ...updates } : g)
        }))
      },
      
      deleteGroup: async (id) => {
        if (get().dbAvailable.groups) {
          try {
            const { error } = await supabase.from('chit_groups' as any).delete().eq('id', id)
            if (!error) {
              set((state) => ({ groups: state.groups.filter(g => g.id !== id) }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          groups: state.groups.filter(g => g.id !== id)
        }))
      },
      
      // Customers CRUD
      addCustomer: async (customer) => {
        const birthDate = new Date(customer.dateOfBirth)
        const ageDifMs = Date.now() - birthDate.getTime()
        const ageDate = new Date(ageDifMs)
        const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970)
        const id = `CUST-CH-${Date.now().toString().slice(-4)}`

        const newCust: ChitCustomer = {
          ...customer,
          id,
          age: calculatedAge
        }

        if (get().dbAvailable.customers) {
          try {
            const { data, error } = await supabase.from('chit_customers' as any).insert({ ...customer, id, age: calculatedAge }).select().single()
            if (!error && data) {
              set((state) => ({ customers: [...state.customers, data as any] }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }
        
        set((state) => ({ customers: [...state.customers, newCust] }))
      },
      
      updateCustomer: async (id, updates) => {
        if (get().dbAvailable.customers) {
          try {
            const { data, error } = await supabase.from('chit_customers' as any).update(updates).eq('id', id).select().single()
            if (!error && data) {
              set((state) => ({
                customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
              }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          customers: state.customers.map(c => {
            if (c.id === id) {
              let updated = { ...c, ...updates };
              if (updates.dateOfBirth) {
                const birthDate = new Date(updates.dateOfBirth)
                const ageDifMs = Date.now() - birthDate.getTime()
                const ageDate = new Date(ageDifMs)
                updated.age = Math.abs(ageDate.getUTCFullYear() - 1970)
              }
              return updated
            }
            return c
          })
        }))
      },
      
      deleteCustomer: async (id) => {
        if (get().dbAvailable.customers) {
          try {
            const { error } = await supabase.from('chit_customers' as any).delete().eq('id', id)
            if (!error) {
              set((state) => ({ customers: state.customers.filter(c => c.id !== id) }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          customers: state.customers.filter(c => c.id !== id)
        }))
      },
      
      // Payments CRUD
      addPayment: async (payment) => {
        const receiptNumber = `REC-2026-${Date.now().toString().slice(-4)}`
        const id = `pay-${Date.now()}`
        const newPayment: ChitPayment = {
          ...payment,
          id,
          receiptNumber
        }

        if (get().dbAvailable.payments) {
          try {
            const { data, error } = await supabase.from('chit_payments' as any).insert({ ...payment, id, receipt_number: receiptNumber }).select().single()
            if (!error && data) {
              set((state) => ({ payments: [data as any, ...state.payments] }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }
        
        set((state) => ({ payments: [newPayment, ...state.payments] }))
        
        // Auto update customer installments
        const customer = get().customers.find(c => c.id === payment.customerId)
        if (customer) {
          const paidInstallments = customer.paidInstallments + 1
          const pendingInstallments = Math.max(0, customer.totalInstallments - paidInstallments)
          const remainingAmount = Math.max(0, customer.joiningAmount - (paidInstallments * customer.monthlyInstallment))
          
          await get().updateCustomer(customer.id, {
            paidInstallments,
            pendingInstallments,
            remainingAmount,
            currentBalance: payment.status === 'Partial' ? payment.balanceAmount : 0
          })
        }
      },
      
      updatePayment: async (id, updates) => {
        if (get().dbAvailable.payments) {
          try {
            const { data, error } = await supabase.from('chit_payments' as any).update(updates).eq('id', id).select().single()
            if (!error && data) {
              set((state) => ({
                payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
              }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          payments: state.payments.map(p => p.id === id ? { ...p, ...updates } : p)
        }))
      },
      
      deletePayment: async (id) => {
        if (get().dbAvailable.payments) {
          try {
            const { error } = await supabase.from('chit_payments' as any).delete().eq('id', id)
            if (!error) {
              set((state) => ({ payments: state.payments.filter(p => p.id !== id) }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          payments: state.payments.filter(p => p.id !== id)
        }))
      },
      
      // Auctions CRUD
      addAuction: async (auction) => {
        const id = `auc-${Date.now()}`
        const newAuction: ChitAuction = { ...auction, id }

        if (get().dbAvailable.auctions) {
          try {
            const { data, error } = await supabase.from('chit_auctions' as any).insert({ ...auction, id }).select().single()
            if (!error && data) {
              set((state) => ({ auctions: [data as any, ...state.auctions] }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }
        
        set((state) => ({ auctions: [newAuction, ...state.auctions] }))
      },
      
      updateAuction: async (id, updates) => {
        if (get().dbAvailable.auctions) {
          try {
            const { data, error } = await supabase.from('chit_auctions' as any).update(updates).eq('id', id).select().single()
            if (!error && data) {
              set((state) => ({
                auctions: state.auctions.map(a => a.id === id ? { ...a, ...updates } : a)
              }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          auctions: state.auctions.map(a => a.id === id ? { ...a, ...updates } : a)
        }))
      },
      
      deleteAuction: async (id) => {
        if (get().dbAvailable.auctions) {
          try {
            const { error } = await supabase.from('chit_auctions' as any).delete().eq('id', id)
            if (!error) {
              set((state) => ({ auctions: state.auctions.filter(a => a.id !== id) }))
              return
            }
          } catch (err) {
            console.error(err)
          }
        }

        set((state) => ({
          auctions: state.auctions.filter(a => a.id !== id)
        }))
      },

      // Notifications
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true }))
        }))
      },

      addNotification: (title, message, type) => {
        const newNot: ChitNotification = {
          id: `not-${Date.now()}`,
          title,
          message,
          type,
          createdAt: new Date().toISOString(),
          isRead: false
        }
        set((state) => ({ notifications: [newNot, ...state.notifications] }))
      }
    }),
    {
      name: 'gfs-chit-fund-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        groups: state.groups,
        customers: state.customers,
        payments: state.payments,
        auctions: state.auctions,
        notifications: state.notifications
      })
    }
  )
)
