// app/components/Reconciliation.jsx
'use client';

import React from 'react';

const ProgressBar = ({ value, color }) => (
  <div className="bg-gray-200 rounded-full h-1.5 w-full mt-2">
    <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

const Reconciliation = () => {
  return (
    <div className="bg-white px-6 py-4 rounded-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Reconciliation snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Total Volume In/Out */}
        <div className='bg-[#F9FAFB] rounded-lg p-3'>
          <h3 className="text-sm font-medium mb-1 text-gray-500">Total volume in/out</h3>
      <div className="flex items-end gap-2">
  <p className="text-[23px] font-bold text-gray-900">£128,252</p>
  <p className="text-[14px] text-gray-400 -translate-y-1.5 relative">=KES 20.8M</p>
</div>


          <ProgressBar value={85} color="bg-blue-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>In: 85%</span>
            <span>Out: 15%</span>
          </div>
        </div>

        {/* Settlement Status */}
        <div className='bg-[#F9FAFB] rounded-lg p-3'>
          <h3 className="text-sm font-medium mb-1 text-gray-500">Settlement status</h3>
          <div className='flex items-end gap-2' >
               <p className="text-[23px] font-bold text-gray-900">92%</p>
                <span className="text-[14px] text-gray-400 -translate-y-1.5 relative">Complete</span>

          </div>
       
          <ProgressBar value={92} color="bg-green-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Complete: 315</span>
            <span>Pending: 27</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reconciliation;