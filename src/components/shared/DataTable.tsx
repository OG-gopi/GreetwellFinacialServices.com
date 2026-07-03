import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { downloadCSV } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface FilterConfig {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  filters?: FilterConfig[]
  onFilter?: (key: string, value: string) => void
  pagination?: PaginationConfig
  onExportCSV?: () => void
  onExportPDF?: () => void
  actions?: (row: T) => React.ReactNode
  title?: string
  className?: string
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5 border-b border-navy-800/60">
        <div className="shimmer h-4 rounded-md" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
)

// ─── Sort Icon ────────────────────────────────────────────────────────────────

const SortIcon = ({
  direction,
}: {
  direction: 'asc' | 'desc' | null
}) => {
  if (direction === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-gold-400" />
  if (direction === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-gold-400" />
  return <ChevronsUpDown className="w-3.5 h-3.5 text-navy-500 group-hover:text-navy-300" />
}

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  searchable = false,
  searchPlaceholder = 'Search…',
  onSearch,
  filters,
  onFilter,
  pagination,
  onExportCSV,
  onExportPDF,
  actions,
  title,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // ── Search handler
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearchQuery(val)
      onSearch?.(val)
    },
    [onSearch]
  )

  // ── Filter handler
  const handleFilter = useCallback(
    (key: string, value: string) => {
      setActiveFilters(prev => ({ ...prev, [key]: value }))
      onFilter?.(key, value)
    },
    [onFilter]
  )

  // ── Sort handler
  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey]
  )

  // ── Client-side sort (if no server-side pagination)
  const sortedData = useMemo(() => {
    if (!sortKey || pagination) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDir, pagination])

  // ── Client-side search (if no external handler)
  const filteredData = useMemo(() => {
    if (onSearch || pagination) return sortedData
    if (!searchQuery.trim()) return sortedData
    const q = searchQuery.toLowerCase()
    return sortedData.filter(row =>
      columns.some(col => {
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }, [sortedData, searchQuery, columns, onSearch, pagination])

  // ── Pagination
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1

  const currentPage = pagination?.page ?? 1

  const pageNumbers = useMemo(() => {
    if (!pagination) return []
    const pages: (number | '...')[] = []
    const total = totalPages
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(total - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < total - 2) pages.push('...')
    pages.push(total)
    return pages
  }, [pagination, totalPages, currentPage])

  // ── Default CSV export (client-side)
  const handleExportCSV = useCallback(() => {
    if (onExportCSV) {
      onExportCSV()
      return
    }
    const exportData = filteredData.map(row => {
      const obj: Record<string, unknown> = {}
      columns.forEach(col => {
        obj[col.header] = row[col.key] ?? ''
      })
      return obj
    })
    downloadCSV(exportData, title ?? 'export')
  }, [onExportCSV, filteredData, columns, title])

  // ── PDF export via jspdf-autotable
  const handleExportPDF = useCallback(async () => {
    if (onExportPDF) {
      onExportPDF()
      return
    }
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' })
    doc.setFillColor(10, 14, 26)
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F')
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(16)
    doc.text(title ?? 'GFS Report', 40, 40)
    doc.setTextColor(180, 180, 180)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 58)

    const headers = columns.map(c => c.header)
    const rows = filteredData.map(row =>
      columns.map(col => {
        const val = row[col.key]
        return val != null ? String(val) : ''
      })
    )

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 70,
      theme: 'grid',
      styles: {
        fillColor: [15, 22, 41],
        textColor: [220, 220, 220],
        lineColor: [30, 45, 74],
        lineWidth: 0.5,
        fontSize: 9,
      },
      headStyles: {
        fillColor: [21, 29, 53],
        textColor: [212, 175, 55],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [12, 18, 35] },
    })

    doc.save(`${title ?? 'gfs-export'}.pdf`)
  }, [onExportPDF, filteredData, columns, title])

  const displayData = pagination ? data : filteredData
  const colSpan = columns.length + (actions ? 1 : 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('gfs-card overflow-hidden', className)}
    >
      {/* ── Header ── */}
      {(title || searchable || filters?.length || onExportCSV !== undefined || onExportPDF !== undefined) && (
        <div className="px-5 py-4 border-b border-navy-700/60">
          {/* Title row */}
          {title && (
            <h3 className="text-base font-semibold text-foreground mb-3">{title}</h3>
          )}

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            {searchable && (
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={searchPlaceholder}
                  className="gfs-input pl-9 py-2 text-sm"
                />
              </div>
            )}

            {/* Filters */}
            {filters?.map(filter => (
              <div key={filter.key} className="relative flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-navy-400" />
                <select
                  value={activeFilters[filter.key] ?? ''}
                  onChange={e => handleFilter(filter.key, e.target.value)}
                  className="gfs-input py-2 text-sm pr-8 appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              {(onExportCSV !== undefined || !onExportCSV) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportCSV}
                  className="btn-outline-gold flex items-center gap-1.5 text-xs px-3 py-2"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </motion.button>
              )}
              {(onExportPDF !== undefined || !onExportPDF) && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExportPDF}
                  className="btn-outline-gold flex items-center gap-1.5 text-xs px-3 py-2"
                  title="Export PDF"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="gfs-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'group select-none',
                    col.sortable && 'cursor-pointer hover:text-navy-200 transition-colors'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <SortIcon direction={sortKey === col.key ? sortDir : null} />
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="text-right pr-5">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} cols={colSpan} />
                  ))}
                </>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan={colSpan}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-16 gap-3"
                    >
                      <div className="w-14 h-14 rounded-full bg-navy-700/50 flex items-center justify-center">
                        <Inbox className="w-7 h-7 text-navy-400" />
                      </div>
                      <p className="text-navy-400 text-sm font-medium">No records found</p>
                      {searchQuery && (
                        <p className="text-navy-500 text-xs">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </motion.div>
                  </td>
                </tr>
              ) : (
                displayData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.025, duration: 0.2 }}
                    className="group transition-colors duration-150"
                  >
                    {columns.map(col => (
                      <td key={col.key} className="group-hover:bg-navy-800/40 transition-colors duration-150">
                        {col.render
                          ? col.render(row)
                          : (row[col.key] != null ? String(row[col.key]) : '—')}
                      </td>
                    ))}
                    {actions && (
                      <td className="text-right pr-5 group-hover:bg-navy-800/40 transition-colors duration-150">
                        {actions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && !isLoading && (
        <div className="px-5 py-3.5 border-t border-navy-700/60 flex flex-wrap items-center justify-between gap-3">
          {/* Info */}
          <p className="text-xs text-navy-400">
            Showing{' '}
            <span className="text-navy-200 font-medium">
              {Math.min((currentPage - 1) * pagination.pageSize + 1, pagination.total)}
              {' '}–{' '}
              {Math.min(currentPage * pagination.pageSize, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="text-navy-200 font-medium">{pagination.total}</span>{' '}
            records
          </p>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            {/* First */}
            <PageBtn
              onClick={() => pagination.onPageChange(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </PageBtn>
            {/* Prev */}
            <PageBtn
              onClick={() => pagination.onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </PageBtn>

            {/* Page numbers */}
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-navy-500 text-xs select-none">
                  …
                </span>
              ) : (
                <PageBtn
                  key={p}
                  onClick={() => pagination.onPageChange(p as number)}
                  active={p === currentPage}
                >
                  {p}
                </PageBtn>
              )
            )}

            {/* Next */}
            <PageBtn
              onClick={() => pagination.onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </PageBtn>
            {/* Last */}
            <PageBtn
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </PageBtn>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Page Button helper ───────────────────────────────────────────────────────

interface PageBtnProps {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  title?: string
  children: React.ReactNode
}

const PageBtn: React.FC<PageBtnProps> = ({ onClick, disabled, active, title, children }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.08 } : {}}
    whileTap={!disabled ? { scale: 0.92 } : {}}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150 select-none',
      active
        ? 'bg-gold-500 text-navy-900 shadow-md'
        : disabled
        ? 'text-navy-600 cursor-not-allowed'
        : 'text-navy-300 hover:bg-navy-700 hover:text-gold-400 cursor-pointer'
    )}
  >
    {children}
  </motion.button>
)

export default DataTable
