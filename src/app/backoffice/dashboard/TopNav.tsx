"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // added
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/backoffice/dashboard" },
  {
    label: "Financial Metrics & Revenue Performance",
    href: "/backoffice/financial-metrics",
  },
  { label: "Customer Analytics", href: "/backoffice/customer-analytics" },
  {
    label: "Compliance & Risk Management",
    href: "/backoffice/compliance-risk",
  },
  {
    label: "Operational Efficiency",
    href: "/backoffice/operational-efficiency",
  },
];

function TopNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleLogoClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center px-4 md:px-12 pt-4">
        {/* Left - Logo + Mobile Menu */}
        <div className="flex items-center space-x-3">
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={24} className="text-white" />
            )}
          </button>
          <div onClick={handleLogoClick} className="cursor-pointer">
            <img
              src="/backoffice/tumalink.png"
              alt="Tuma Logo"
              className="h-7"
            />
          </div>
        </div>

        {/* Center - Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-6 text-md text-white/80 text-sm">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <li key={idx}>
                <Link href={item.href}>
                  <span
                    className={`group relative inline-block transition-colors ${
                      isActive ? "text-white" : "hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-[-6px] left-0 h-[2px] w-full transition-opacity duration-200 ${
                        isActive
                          ? "bg-white opacity-100"
                          : "bg-white opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right - Icons */}
        <div className="flex items-center space-x-4">
          <Bell size={24} className="text-white" />
          <img
            src="https://i.pravatar.cc/40?img=4"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>

      {/* Mobile Drawer with Animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-3/4 max-w-sm h-full bg-[#1a5cd6] shadow-lg z-50 p-6 space-y-6 rounded-tr-md rounded-br-md"
          >
            {/* Close inside too */}
            <button onClick={toggleMenu} className="mb-4">
              <X size={28} className="text-white" />
            </button>

            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                <p
                  className={`text-white text-lg ${
                    pathname === item.href ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TopNav;
