"use client";

import React from "react";
import { useInactivityLogout } from "../hooks/useInactivityLogout";
// 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  useInactivityLogout(INACTIVITY_TIMEOUT);

  return <>{children}</>;
};

export default ProtectedLayout;
