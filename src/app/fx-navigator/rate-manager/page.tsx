// app/page.jsx
'use client';

import SideNav from '../components/SideNav';
import Section from './components/Section';
import AuditTrail from './components/AuditTrail';
import Terrapay from './components/Terrapay'

export default function Home() {
  return (
    // h-screen and overflow-hidden create a full-page layout without double scrollbars.
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* This component handles being a top header on mobile and a sidebar on desktop */}
      <SideNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6 md:p-10">
          <div>
            <Section />
          </div>
          <div>
            <Terrapay />
          </div>
          <div className="mt-8">
            <AuditTrail />
          </div>
        </main>
      </div>
    </div>
  );
}