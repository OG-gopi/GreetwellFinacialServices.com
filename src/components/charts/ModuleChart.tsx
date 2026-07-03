import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'
import type { MonthlyData } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModuleChartProps {
  data: MonthlyData[]
  height?: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BARS = [
  { key: 'loans',       label: 'Loans',       color: '#D4AF37' },  // gold
  { key: 'insurance',   label: 'Insurance',   color: '#3B82F6' },  // blue
  { key: 'investments', label: 'Investments', color: '#10B981' },  // green
] as const

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(21,29,53,0.98) 0%, rgba(15,22,41,0.99) 100%)',
        border: '1px solid rgba(212,175,55,0.22)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '160px',
      }}
    >
      <p
        style={{
          color: '#D4AF37',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </p>
      {payload.map((entry: any) => {
        const bar = BARS.find(b => b.key === entry.dataKey)
        return (
          <div
            key={entry.dataKey as string}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '4px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  background: bar?.color ?? entry.fill,
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#8899AA', fontSize: '11px' }}>{bar?.label ?? entry.name}</span>
            </span>
            <span style={{ color: '#E8D5A0', fontSize: '12px', fontWeight: 600 }}>
              {entry.value?.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

const CustomLegend: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px' }}>
    {BARS.map((bar: any) => (
      <span key={bar.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            background: bar.color,
            display: 'inline-block',
          }}
        />
        <span style={{ color: '#8899AA', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
          {bar.label}
        </span>
      </span>
    ))}
  </div>
)

// ─── ModuleChart ──────────────────────────────────────────────────────────────

const ModuleChart: React.FC<ModuleChartProps> = ({ data, height = 320 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    style={{ width: '100%', height }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        barCategoryGap="28%"
        barGap={3}
      >
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
          width={36}
          allowDecimals={false}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(30,45,74,0.25)' }}
        />

        {/* Legend */}
        <Legend content={<CustomLegend />} />

        {/* Bars */}
        {BARS.map(bar => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={bar.color}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
            fillOpacity={0.9}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
)

export default ModuleChart
