"use client";

import SideNav from "./components/SideNav";
import Roles from './components/Roles'; // Adjust the import path as needed


export default function OTPPage() {
  return (
    <div className="md:flex h-screen">
      {/* Sidebar - 1/5 width (20%) */}
      <div className="md:w-1/5 w-full">
        <SideNav />
      </div>

      {/* Main Content - 4/5 width (80%) */}
      <div className="md:w-4/5 w-full  overflow-auto">
            <Roles />

      </div>
    </div>
  );
}