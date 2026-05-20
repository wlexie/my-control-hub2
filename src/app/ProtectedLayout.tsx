"use client";

import React from "react";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
// 24 hours in milliseconds
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000;

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  useInactivityLogout(INACTIVITY_TIMEOUT);

  return <>{children}</>;
};

export default ProtectedLayout;
