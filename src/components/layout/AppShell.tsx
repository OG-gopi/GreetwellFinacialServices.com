import { motion } from 'framer-motion'

interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
}

const pageVariants = {
  hidden:  { opacity: 0, y: 8  },
  visible: { opacity: 1, y: 0  },
}

// ─── DEPRECATED: Now acts as a pass-through since DashboardLayout handles the shell ───
export default function AppShell({ children }: AppShellProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
