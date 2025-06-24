// app/components/Volume.jsx
'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip, // 1. ADDED: Import Tooltip component
} from 'recharts';

// --- DATA & STYLING CONFIGURATION ---

// 2. ADDED: 'date' field to show in the tooltip. Your original values are untouched.
const chartData = [
  { name: 'Mon', date: 'June 8',  mobile: 2800000, paybill: 3600000, bank: 4600000, card: 5400000 },
  { name: 'Tue', date: 'June 9',  mobile: 2850000, paybill: 3650000, bank: 4650000, card: 5450000 },
  { name: 'Wed', date: 'June 10', mobile: 2750000, paybill: 3700000, bank: 4700000, card: 5500000 },
  { name: 'Thu', date: 'June 11', mobile: 2900000, paybill: 3600000, bank: 4600000, card: 5400000 },
  { name: 'Fri', date: 'June 12', mobile: 2800000, paybill: 3650000, bank: 4650000, card: 5350000 },
  { name: 'Sat', date: 'June 13', mobile: 2750000, paybill: 3700000, bank: 4700000, card: 5400000 },
  { name: 'Sun', date: 'June 14', mobile: 2700000, paybill: 3600000, bank: 4600000, card: 5300000 },
];

// Stroke colors for the lines (UNCHANGED)
const STROKE_COLORS = {
  mobile: '#f8b4b4',
  paybill: '#8884d8',
  bank: '#82ca9d',
  card: '#f5c94c',
};

// Fill colors for the shaded areas (UNCHANGED)
const FILL_COLORS = {
  mobile: '#f8b4b433',
  paybill: '#8884d833',
  bank: '#82ca9d33',
  card: '#f5c94c33',
};

// --- 3. ADDED: Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Get data for the hovered point
    const nameMap = { mobile: 'Mobile money', paybill: 'Paybill', bank: 'Bank', card: 'Card'};

    // Sort payload to ensure consistent order in tooltip (Mobile, Paybill, Bank, Card)
    const sortedPayload = [...payload].reverse();

    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200/50">
        <p className="font-bold text-gray-800">{`${label}, ${data.date}`}</p>
        <div className="mt-3 space-y-3">
          {sortedPayload.map((item, index) => (
            <div key={index} className="flex justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{nameMap[item.dataKey]}</span>
              </div>
              <span className="font-bold text-sm text-gray-800">
                {(item.value / 1000000).toFixed(1)}M
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


// --- SUB-COMPONENTS ---

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex items-center">
      <div className={`w-3 h-1`} style={{ backgroundColor: color }} />
      <div className={`w-3 h-3 rounded-full -ml-1`} style={{ backgroundColor: color }} />
    </div>
    <span className="text-sm text-slate-500">{label}</span>
  </div>
);

// --- MAIN COMPONENT ---

const Volume = () => {
  return (
    <div className="bg-white py-4 pb-3 p-4 rounded-lg">
      <h2 className="text-[16px] font-semibold text-gray-800 mb-1">
        Volume overtime & channel analytics
      </h2>

      {/* Responsive Chart Container */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: -20, bottom: 10 }}
          >
            {/* defs are UNCHANGED */}
            <defs>
              <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STROKE_COLORS.card} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={STROKE_COLORS.card} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STROKE_COLORS.bank} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={STROKE_COLORS.bank} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPaybill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STROKE_COLORS.paybill} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={STROKE_COLORS.paybill} stopOpacity={0}/>
              </linearGradient>
               <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={STROKE_COLORS.mobile} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={STROKE_COLORS.mobile} stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => (value === 0 ? '0' : `${value / 1000000}M`)}
              domain={[0, 6000000]}
              ticks={[0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000]}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            
            {/* 4. ADDED: The Tooltip component itself */}
            <Tooltip
              cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '5 5' }}
              content={<CustomTooltip />}
              animationDuration={50}
            />

            {/* Chart Areas are UNCHANGED */}
            <Area type="monotone" dataKey="card" stroke={STROKE_COLORS.card} fill="url(#colorCard)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="bank" stroke={STROKE_COLORS.bank} fill="url(#colorBank)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="paybill" stroke={STROKE_COLORS.paybill} fill="url(#colorPaybill)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="mobile" stroke={STROKE_COLORS.mobile} fill="url(#colorMobile)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend is UNCHANGED */}
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-2">
        <LegendItem color={STROKE_COLORS.mobile} label="Mobile money" />
        <LegendItem color={STROKE_COLORS.paybill} label="Paybill" />
        <LegendItem color={STROKE_COLORS.bank} label="Bank" />
        <LegendItem color={STROKE_COLORS.card} label="Card" />
      </div>

      {/* Weighted Average Footer is UNCHANGED */}
      <div className="bg-slate-100 p-3 py-2 rounded-lg flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="font-semibold text-gray-800 text-sm">
            <span className="font-medium text-slate-600">Weighted Avg: </span>
            115.20 KES
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Based on volume distribution
        </div>
      </div>
    </div>
  );
};

export default Volume;