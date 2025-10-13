"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LucideUserRound, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { IoLogOutOutline, IoSettingsOutline } from "react-icons/io5";

interface TopNavProps {
  user: {
    firstName: string;
    lastName: string;
  } | null;
}

const navItems = [
  {
    label: "Campaign Dashboard",
    href: "/campaign-manager/usage-tracking",
  },
  {
    label: "Influencer Performance",
    href: "/campaign-manager/influencer-attribution",
    subItems: [
      {
        label: "Influencer Metrics",
        href: "/campaign-manager/influencer-attribution",
      },
      {
        label: "Add Influencer",
        href: "/campaign-manager/influencer-attribution/add-influencer",
      },
      {
        label: "Influencer Profiles",
        href: "/campaign-manager/influencer-attribution/influencer-profiles",
      },
    ],
  },
  {
    label: "Create Campaign",
    href: "/campaign-manager/create-campaign",
  },
];

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

export default function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navDropdownRef = useRef<HTMLLIElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(event.target as Node) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative  to-[#163F8B] from-[#276EF1] text-white">
      <div className="flex justify-between items-center px-4 md:px-12 py-4">
        {/* Left - Logo & Mobile menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="md:hidden focus:outline-none text-white"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          <div
            className="cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <img
              src="/backoffice/tumalink.png"
              alt="Tuma Logo"
              className="h-7"
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 text-md text-white/80">
          {navItems.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              item.subItems?.some((sub) => pathname.startsWith(sub.href));

            if (item.subItems) {
              return (
                <li key={idx} ref={navDropdownRef} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === item.label ? null : item.label
                      )
                    }
                    className={`flex items-center gap-1 transition-colors ${
                      isActive ? "text-white" : "hover:text-white"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                    {/* underline for active parent */}
                    <span
                      className={`absolute bottom-[-6px] left-0 h-[2px] w-full transition-opacity duration-200 ${
                        isActive
                          ? "bg-white opacity-100"
                          : "bg-white opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-10 -left-4 w-56 bg-white text-gray-700 rounded-xl shadow-lg z-50"
                      >
                        {item.subItems.map((sub, subIdx) => (
                          <Link key={subIdx} href={sub.href}>
                            <div
                              onClick={() => setActiveDropdown(null)}
                              className={`px-4 py-2 hover:bg-blue-50 hover:text-blue-700 ${
                                pathname === sub.href
                                  ? "text-blue-600 font-medium"
                                  : ""
                              }`}
                            >
                              {sub.label}
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

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

        {/* Right side */}
        <div
          className="flex items-center gap-4 relative"
          ref={profileDropdownRef}
        >
          <Bell size={22} className="text-white cursor-pointer" />
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center font-semibold text-sm"
          >
            {user ? getInitials(user.firstName, user.lastName) : "?"}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-60 bg-white rounded-xl shadow-lg z-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <IoSettingsOutline className="w-5 h-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <LucideUserRound className="w-5 h-5" />
                <span>Account</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 hover:text-blue-600 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </div>
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  3
                </span>
              </div>
              <div
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-md p-2 cursor-pointer"
              >
                <IoLogOutOutline className="w-5 h-5" />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm bg-opacity-40 md:hidden"
          >
            <div className="absolute left-0 top-0 h-full w-64 bg-[#001F3F]  text-gray-100 p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <img
                  src="/backoffice/tumalink.png"
                  alt="Logo"
                  className="h-7"
                />
                <button onClick={toggleMenu}>
                  <X size={24} />
                </button>
              </div>

              <ul className="space-y-3">
                {navItems.map((item, idx) => (
                  <li key={idx}>
                    {item.subItems ? (
                      <div>
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === item.label ? null : item.label
                            )
                          }
                          className="flex justify-between items-center w-full text-left py-2"
                        >
                          <span
                            className={`${
                              pathname.startsWith(item.href)
                                ? "text-blue-600 font-semibold"
                                : ""
                            }`}
                          >
                            {item.label}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${
                              activeDropdown === item.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="ml-4 mt-2 space-y-2"
                            >
                              {item.subItems.map((sub, subIdx) => (
                                <Link key={subIdx} href={sub.href}>
                                  <div
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setActiveDropdown(null);
                                    }}
                                    className={`block py-1 pl-2 rounded ${
                                      pathname === sub.href
                                        ? "text-blue-600 font-medium"
                                        : "text-gray-100 hover:text-blue-600"
                                    }`}
                                  >
                                    {sub.label}
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <span
                          onClick={() => setIsMenuOpen(false)}
                          className={`block py-2 ${
                            pathname === item.href
                              ? "text-blue-600 font-semibold"
                              : "hover:text-blue-600"
                          }`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
