"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FC, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMenu } from "react-icons/hi"; // +++ ADD THIS +++
// import { Menu } from "lucide-react"; // --- REMOVE THIS ---
import User from "../../access-manager/components/User";

// The interface is defined but the props aren't used. This is fine, but for clarity,
// you could change the signature to: const Sidebar: FC = () => {
interface SidebarProps {}

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

const Sidebar: FC<SidebarProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Pro-Tip: A startsWith check is often more robust for nested routes
  // e.g., /user-accounts/add should still highlight "User & Accounts"
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
        <span className="font-extrabold text-2xl">Back Office</span>
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
        className="fixed top-4 right-4 z-50 text-white rounded-md md:hidden hover:bg-blue-600 transition-colors"
        aria-label="Open menu"
      >
        {/* Using the new HiMenu icon with a better size for touch */}
        <HiMenu size={28} className="text-blue-600" />
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
            <div className="md:w-4/5 w-full sm:w-3/5 h-screen bg-blue-700 flex flex-col">
              {/* Note: I'm not re-using `content` here to avoid layout issues with scroll.
                  Instead, I've created a dedicated scrollable nav. */}
              {content}
            </div>
            {/* Click-away area */}
            <div
              className="flex-1 bg-black/50 backdrop-blur-sm"
              onClick={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;