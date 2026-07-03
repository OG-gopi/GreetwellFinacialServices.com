import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'
import type { MonthlyData } from '@/types'
import { formatCurrency } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueChartProps {
  data: MonthlyData[]
  height?: number
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(21,29,53,0.98) 0%, rgba(15,22,41,0.99) 100%)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.05)',
        minWidth: '150px',
      }}
    >
      <p
        style={{
          color: '#D4AF37',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '6px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span style={{ color: '#8899AA', fontSize: '11px' }}>Revenue</span>
          <span style={{ color: '#E8D5A0', fontSize: '13px', fontWeight: 600 }}>
            {formatCurrency(entry.value as number)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── RevenueChart ─────────────────────────────────────────────────────────────

const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 320 }) => {
  const gradientId = useMemo(() => `revenue-gradient-${Math.random().toString(36).slice(2, 8)}`, [])

  const chartData = useMemo(
    () =>
      data.map(d => ({
        ...d,
        revenue: typeof d.revenue === 'number' ? d.revenue : 0,
      })),
    [data]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ width: '100%', height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        >
          {/* Gold gradient fill */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
              <stop offset="45%" stopColor="#D4AF37" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(30,45,74,0.7)"
            vertical={false}
          />

          {/* X Axis */}
          <XAxis
            dataKey="month"
            tick={{ fill: '#5A7090', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: 'rgba(30,45,74,0.6)' }}
            tickLine={false}
            dy={6}
          />

          {/* Y Axis */}
          <YAxis
            tick={{ fill: '#5A7090', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => formatCurrency(v)}
            width={70}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1, strokeDasharray: '4 2' }} />

          {/* Area */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#D4AF37"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 5,
              fill: '#D4AF37',
              stroke: '#0F1629',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default RevenueChart
