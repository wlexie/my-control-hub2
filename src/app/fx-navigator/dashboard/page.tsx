// app/page.jsx
'use client';

import SideNav from '../components/SideNav';
import Volume from './components/Volume';
import TopNav from './components/TopNav';
import Total from './components/Total';
import Reconciliation from './components/Reconciliation';
import Margin from './components/Margin';
import InterbankRateCard from './components/Interbank';
import CostRateCard from './components/Cost';
import CustomerRateCard from './components/Customer';

export default function Home() {
  return (
    // This is the key change: flex-col on mobile, md:flex-row on desktop
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* This single component handles both the mobile header and the desktop sidebar */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Scrollable Main Dashboard */}
        {/* No TopNav is needed here */}
         <div className="sticky top-0 z-10 bg-white hidden md:block">
          <TopNav />
        </div>
        <main className="flex-1 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Left Column */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <Volume />
                <Reconciliation />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <Total />
                <Margin />
              </div>
            </div>
            {/* Rate cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <InterbankRateCard />
              <CostRateCard />
              <CustomerRateCard />
            </div>
        </main>
      </div>
    </div>
  );
}



