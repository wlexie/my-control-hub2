// app/page.jsx
'use client';

import SideNav from '../components/SideNav';
import TopNav from './components/TopNav';
import Volume from './components/Volume';
import Total from './components/Total';
import Reconciliation from './components/Reconciliation';
import Margin from './components/Margin';
import InterbankRateCard from './components/Interbank';
import CostRateCard from './components/Cost';
import CustomerRateCard from './components/Customer';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Top Navigation */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <TopNav />
        </div>

        {/* Scrollable Main Dashboard */}
        <main className="flex-1 overflow-y-auto p-4 px-4">
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
             {/* --- NEW: Grid for the three rate cards --- */}
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
