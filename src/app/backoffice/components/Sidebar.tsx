"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import User from "../../access-manager/components/User";

interface SidebarProps {
  onClose?: () => void; // Add this prop type
}

const nav = [
  {
    href: "/backoffice/dashboard",
    label: "Dashboard",
    icon: "/backoffice/dashboard.png",
    match: "/dashboard",
  },
  {
    href: "/backoffice/transactions",
    label: "Transactions",
    icon: "/backoffice/transactions.png",
    match: "/transactions",
  },
  {
    href: "/backoffice/special-limits",
    label: "Special Limits",
    icon: "/backoffice/special.png",
    match: "/special-limits",
  },
  {
    href: "/backoffice/reconciliation",
    label: "Reconciliation",
    icon: "/backoffice/recon.png",
    match: "/reconciliation",
  },
  {
    href: "/backoffice/user-accounts",
    label: "User & Accounts",
    icon: "/backoffice/users.png",
    match: "/user-accounts",
  },
  {
    href: "/backoffice/fees",
    label: "Fees & Commissions",
    icon: "/backoffice/fees.png",
    match: "/fees",
  },
  {
    href: "/backoffice/compliance",
    label: "Compliance & Security",
    icon: "/backoffice/compliance.png",
    match: "/compliance",
  },
  {
    href: "/backoffice/reports",
    label: "Reports & Analytics",
    icon: "/backoffice/reports.png",
    match: "/reports",
  },
  {
    href: "/backoffice/support",
    label: "Support & Disputes",
    icon: "/backoffice/support.png",
    match: "/support",
  },
  {
    href: "/backoffice/permissions",
    label: "Settings & Permissions",
    icon: "/backoffice/settings.png",
    match: "/permissions",
  },
];

const Sidebar: FC <SidebarProps> = ({ }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const goHome = () => router.push("/dashboard");
  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  const content = (
    <div className="h-full w-80 bg-blue-700 flex flex-col text-white">
      {/* ─── Logo ─────────────────────────────────── */}
      <div
        onClick={goHome}
        className="flex items-center justify-center py-10 cursor-pointer"
      >
        <img
          src="/backoffice/tuma.png"
          alt="Tuma logo"
          className="w-14 h-10 px-2 -ml-24"
        />
        <span className="font-extrabold text-2xl">Back&nbsp;Office</span>
      </div>

      {/* ─── Nav Links ────────────────────────────── */}
      <nav className="flex flex-col gap-4 px-4">
        {nav.map(({ href, label, icon, match }) => (
          <Link
            key={href}
            href={href}
            onClick={close}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg ${
              pathname === match
                ? "bg-white text-blue-700"
                : "text-white hover:bg-gray-100 hover:text-blue-700"
            }`}
          >
            <img
              src={icon}
              alt=""
              className={`w-6 h-6 ${
                pathname === match ? "filter-blue" : "filter-white"
              }`}
            />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto mb-2">
        <User />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible, pushed left */}
      <div className="hidden md:block fixed h-screen w-80">{content}</div>

      {/* Mobile: hamburger */}
      <button
        onClick={toggle}
        className="fixed top-1 right-2 z-50 p-2 bg-blue-700 text-white rounded-md md:hidden"
      >
        <Menu size={14} />
      </button>

      {/* Mobile: slide-in panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex"
          >
            {/* Panel itself */}
            <div className="w-4/5 sm:w-3/5 md:w-80 h-svh bg-blue-700 overflow-y-auto flex flex-col">
              {content}
            </div>
            {/* Click-away area */}
            <div
              className="flex-1 bg-black/30 backdrop-blur-sm"
              onClick={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
