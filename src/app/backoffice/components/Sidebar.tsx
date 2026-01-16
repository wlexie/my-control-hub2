"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMenu, HiX, HiChevronDown, HiChevronRight } from "react-icons/hi";
import User from "../../access-manager/components/User";

import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: string;
}

interface NavGroup {
  label: string;
  icon: string;
  match?: string;
  submenu?: NavItem[];
}

const navItems: (NavItem | NavGroup)[] = [
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

  // {
  //   href: "/backoffice/special-limits",
  //   label: "Special Limits",
  //   icon: "/backoffice/special.png",
  //   match: "/backoffice/special-limits",
  // },
  // {
  //   href: "/backoffice/reconciliation",
  //   label: "Reconciliation",
  //   icon: "/backoffice/recon.png",
  //   match: "/backoffice/reconciliation",
  // },
  {
    href: "/backoffice/user-accounts",
    label: "User & Accounts",
    icon: "/backoffice/users.png",
    match: "/backoffice/user-accounts",
  },
  {
    label: "Financials",
    icon: "/backoffice/reports.png",
    match: "/backoffice/financials",
    submenu: [
      {
        href: "/backoffice/financials/transactions",
        label: "Transactions",
        icon: "/backoffice/fees.png",
        match: "/backoffice/financials/transactions",
      },
      // You can add more financial submenu items here:
      // {
      //   href: "/backoffice/financials/revenue",
      //   label: "Revenue",
      //   icon: "/backoffice/revenue.png",
      //   match: "/backoffice/financials/revenue",
      // },
      // {
      //   href: "/backoffice/financials/expenses",
      //   label: "Expenses",
      //   icon: "/backoffice/expenses.png",
      //   match: "/backoffice/financials/expenses",
      // },
    ],
  },
  // {
  //   href: "/backoffice/fees",
  //   label: "Fees & Commissions",
  //   icon: "/backoffice/fees.png",
  //   match: "/backoffice/fees",
  // },
  // {
  //   href: "/backoffice/compliance-security",
  //   label: "Compliance & Security",
  //   icon: "/backoffice/compliance.png",
  //   match: "/backoffice/compliance-security",
  // },
  // {
  //   href: "/backoffice/reports",
  //   label: "Reports & Analytics",
  //   icon: "/backoffice/reports.png",
  //   match: "/backoffice/reports",
  // },
  // {
  //   href: "/backoffice/support",
  //   label: "Support & Disputes",
  //   icon: "/backoffice/support.png",
  //   match: "/backoffice/support",
  // },
  // {
  //   href: "/backoffice/permissions",
  //   label: "Settings & Permissions",
  //   icon: "/backoffice/settings.png",
  //   match: "/backoffice/permissions",
  // },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      financials: true, // Financials expanded by default
    }
  );

  const user = useSelector((state: RootState) => state.auth.user);

  // <-- MODIFIED: Updated link filtering logic -->
  const getVisibleNavLinks = () => {
    // 1. If user is not logged in, show no links
    if (!user) {
      return [];
    }

    // 2. If user has 'BACKOFFICE' role, show only specific links
    if (user.roles.includes("BACKOFFICE")) {
      return navItems.filter((item) => {
        if ("href" in item) {
          // Show Dashboard and regular Transactions
          return item.label === "Dashboard" || item.label === "Transactions";
        } else {
          // For NavGroup items, check if label should be shown
          return item.label === "Financials";
        }
      });
    }

    // 3. For any other logged-in user, show all links
    return navItems;
  };

  const visibleNav = getVisibleNavLinks();

  const isActive = (matchPath: string) => pathname.startsWith(matchPath);

  const goHome = () => router.push("/backoffice/dashboard");
  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel.toLowerCase()]: !prev[groupLabel.toLowerCase()],
    }));
  };

  const renderNavItem = (
    item: NavItem,
    level: number = 0,
    isSubmenu: boolean = false
  ) => {
    const isItemActive = isActive(item.match);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={close}
        className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-colors duration-200 ${
          level > 0 ? `ml-${level * 4}` : ""
        } ${
          isItemActive
            ? "bg-white text-blue-700 font-semibold"
            : "text-white hover:bg-white/20"
        }`}
      >
        <img
          src={item.icon}
          alt=""
          className={`w-6 h-6 ${isItemActive ? "filter-blue" : "filter-white"}`}
        />
        <span className={`${isSubmenu ? "text-sm" : ""}`}>{item.label}</span>
      </Link>
    );
  };

  const renderNavGroup = (group: NavGroup) => {
    const groupKey = group.label.toLowerCase();
    const isExpanded = expandedGroups[groupKey] || false;
    const hasActiveChild = group.submenu?.some((item) => isActive(item.match));
    const isGroupActive = group.match ? isActive(group.match) : hasActiveChild;

    return (
      <div key={group.label} className="flex flex-col">
        {/* Group header */}
        <button
          onClick={() => toggleGroup(group.label)}
          className={`flex items-center justify-between gap-4 px-4 py-2 rounded-lg transition-colors duration-200 ${
            isGroupActive
              ? "bg-white/10 text-white font-semibold"
              : "text-white hover:bg-white/20"
          }`}
        >
          <div className="flex items-center gap-4">
            <img
              src={group.icon}
              alt=""
              className={`w-6 h-6 ${
                isGroupActive ? "filter-blue" : "filter-white"
              }`}
            />
            <span>{group.label}</span>
          </div>
          {isExpanded ? (
            <HiChevronDown size={18} />
          ) : (
            <HiChevronRight size={18} />
          )}
        </button>

        {/* Submenu items */}
        <AnimatePresence>
          {isExpanded && group.submenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-2 pl-8">
                {group.submenu.map((item) => renderNavItem(item, 1, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
        {visibleNav.map((item) =>
          "href" in item ? renderNavItem(item) : renderNavGroup(item)
        )}
      </nav>

      {/* ─── User Section ─────────────────────────── */}
      <div className="mt-auto mb-2 shrink-0">
        {/* <-- MODIFIED: Only show User component if logged in --> */}
        {user && <User />}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible, pushed left */}
      <div className="hidden md:block fixed h-screen w-full md:w-80">
        {content}
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={toggle}
        className="fixed top-4 right-4 z-50  text-white rounded-lg md:hidden hover:bg-blue-600 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <HiX size={28} className="text-blue-600" />
        ) : (
          <HiMenu size={28} className="text-blue-600" />
        )}
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
