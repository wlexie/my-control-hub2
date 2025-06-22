'use client';

import SideNav from '../components/SideNav';
import Section from './components/Section';
import AuditTrail from './components/AuditTrail';

export default function Home() {
  return (
    <div className="mx-auto">
      <div className="flex bg-gray-100 mx-auto">
        {/* Sidebar */}
        <SideNav />

        {/* Main Content */}
        <div className="flex flex-col w-full px-10 py-6">
          <div>
            <div className="max-h-[100vh] gap-6">
              <Section />
            </div>

            <div className="mt-8">
              <AuditTrail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
