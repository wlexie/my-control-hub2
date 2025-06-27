 "use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// --- FIX 1: 'FC' has been removed from this import ---
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
// --- FIX 3: Import the 'close' icon ---
import { HiMenu, HiX } from "react-icons/hi";
import User from "../../access-manager/components/User";

const nav = [
  {
    href: "/backoffice/dashboard",
    label: "Dashboard",
    icon: "/backoffice/dashboard.png",
    match: "/backoffice/dashboard",
  },
  {
    href: "/backoffice/transactions",
    label: "Transactions",
    icon: "/backoffice/transactions.png",
    match: "/backoffice/transactions",
  },
  {
    href: "/backoffice/special-limits",
    label: "Special Limits",
    icon: "/backoffice/special.png",
    match: "/backoffice/special-limits",
  },
  {
    href: "/backoffice/reconciliation",
    label: "Reconciliation",
    icon: "/backoffice/recon.png",
    match: "/backoffice/reconciliation",
  },
  {
    href: "/backoffice/user-accounts",
    label: "User & Accounts",
    icon: "/backoffice/users.png",
    match: "/backoffice/user-accounts",
  },
  {
    href: "/backoffice/fees",
    label: "Fees & Commissions",
    icon: "/backoffice/fees.png",
    match: "/backoffice/fees",
  },
  {
    href: "/backoffice/compliance",
    label: "Compliance & Security",
    icon: "/backoffice/compliance.png",
    match: "/backoffice/compliance",
  },
  {
    href: "/backoffice/reports",
    label: "Reports & Analytics",
    icon: "/backoffice/reports.png",
    match: "/backoffice/reports",
  },
  {
    href: "/backoffice/support",
    label: "Support & Disputes",
    icon: "/backoffice/support.png",
    match: "/backoffice/support",
  },
  {
    href: "/backoffice/permissions",
    label: "Settings & Permissions",
    icon: "/backoffice/settings.png",
    match: "/backoffice/permissions",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (matchPath: string) => pathname.startsWith(matchPath);

  const goHome = () => router.push("/backoffice/dashboard");
  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  const content = (
    <div className="h-full md:w-80 w-full bg-blue-700 flex flex-col text-white">
      {/* ─── Logo ─────────────────────────────────── */}
      <div
        onClick={goHome}
        className="flex shrink-0 items-center justify-center py-10 cursor-pointer"
      >
        <img
          src="/backoffice/tuma.png"
          alt="Tuma logo"
          className="w-14 h-10 px-2 -ml-24"
        />
        <span className="font-extrabold text-2xl">Back Office</span>
      </div>

      {/* ─── Nav Links ────────────────────────────── */}
      <nav className="flex-grow flex flex-col gap-4 px-4 overflow-y-auto">
        {nav.map(({ href, label, icon, match }) => (
          <Link
            key={href}
            href={href}
            onClick={close}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isActive(match)
                ? "bg-white text-blue-700 font-semibold"
                : "text-white hover:bg-white/20"
            }`}
          >
            <img
              src={icon}
              alt=""
              className={`w-6 h-6 ${
                isActive(match) ? "filter-blue" : "filter-white"
              }`}
            />
            {label}
          </Link>
        ))}
      </nav>

      {/* ─── User Section ─────────────────────────── */}
      <div className="mt-auto mb-2 shrink-0">
        <User />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible, pushed left */}
      <div className="hidden md:block fixed h-screen w-full md:w-80">{content}</div>

      {/* Mobile: hamburger button */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50  text-white rounded-lg md:hidden hover:bg-blue-600 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <HiX size={28} className="text-blue-600"/> : <HiMenu size={28} className="text-blue-600" />}
      </button>

      {/* Mobile: slide-in panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex"
          >
            {/* Panel itself */}
            <div className="w-full sm:w-3/5 h-screen bg-blue-700 flex flex-col">
              {content}
            </div>
            {/* Click-away area */}
            <div
              className="flex-1 bg-black/50 w backdrop-blur-sm"
              onClick={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;