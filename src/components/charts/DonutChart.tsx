import React, { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonutDataItem {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutDataItem[]
  height?: number
  /** Optional label to show below the total number in the center */
  centerLabel?: string
  /** Format the total value (default: locale string) */
  formatTotal?: (total: number) => string
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(21,29,53,0.98) 0%, rgba(15,22,41,0.99) 100%)',
        border: '1px solid rgba(212,175,55,0.22)',
        borderRadius: '10px',
        padding: '9px 13px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '140px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: item.payload?.color ?? item.fill,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#D4AF37', fontSize: '12px', fontWeight: 600 }}>
          {item.name}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <span style={{ color: '#8899AA', fontSize: '11px' }}>Value</span>
        <span style={{ color: '#E8D5A0', fontSize: '12px', fontWeight: 600 }}>
          {(item.value as number).toLocaleString()}
        </span>
      </div>
      {typeof item.payload?.percent === 'number' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '2px' }}>
          <span style={{ color: '#8899AA', fontSize: '11px' }}>Share</span>
          <span style={{ color: '#B0C4D8', fontSize: '12px', fontWeight: 500 }}>
            {(item.payload.percent * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Center Label (custom label via foreignObject trick) ──────────────────────

interface CenterLabelProps {
  cx: number
  cy: number
  total: string
  sub: string
}

const CenterLabel: React.FC<CenterLabelProps> = ({ cx, cy, total, sub }) => (
  <>
    <text
      x={cx}
      y={cy - 8}
      textAnchor="middle"
      dominantBaseline="middle"
      style={{
        fill: '#E8D5A0',
        fontSize: '22px',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {total}
    </text>
    <text
      x={cx}
      y={cy + 18}
      textAnchor="middle"
      dominantBaseline="middle"
      style={{
        fill: '#5A7090',
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {sub}
    </text>
  </>
)

// ─── Legend row ───────────────────────────────────────────────────────────────

const LegendRow: React.FC<{ item: DonutDataItem; percent: number }> = ({ item, percent }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: item.color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ color: '#8899AA', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
        {item.name}
      </span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ color: '#E8D5A0', fontSize: '12px', fontWeight: 600 }}>
        {item.value.toLocaleString()}
      </span>
      <span
        style={{
          color: '#5A7090',
          fontSize: '11px',
          minWidth: '36px',
          textAlign: 'right',
        }}
      >
        {percent.toFixed(1)}%
      </span>
    </span>
  </div>
)

// ─── DonutChart ───────────────────────────────────────────────────────────────

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 260,
  centerLabel = 'Total',
  formatTotal,
}) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])
  const formattedTotal = formatTotal ? formatTotal(total) : total.toLocaleString()

  // Enrich data with percent for recharts
  const enrichedData = useMemo(
    () => data.map(d => ({ ...d, percent: total > 0 ? d.value / total : 0 })),
    [data, total]
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      {/* Donut */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={700}
              animationEasing="ease-out"
              labelLine={false}
              label={({ cx, cy }: { cx: number; cy: number }) => (
                <CenterLabel cx={cx} cy={cy} total={formattedTotal} sub={centerLabel} />
              )}
            >
              {enrichedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                  strokeWidth={0}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.4))' }}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ padding: '0 8px 8px' }}>
        {enrichedData.map(item => (
          <LegendRow key={item.name} item={item} percent={item.percent * 100} />
        ))}
      </div>
    </motion.div>
  )
}

export default DonutChart
