// src/components/MessageStatus.js
import React from "react";
import { Check, CheckCheck } from "lucide-react";

// Renders a readable message status with color-coded label + icon
const MessageStatus = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let label = "";
  let icon = null;
  let labelColor = "";

  switch (normalized) {
    case "pending":
      label = "Pending";
      icon = <Check className="w-4 h-4 text-amber-400 ml-1" />;
      labelColor = "text-amber-500";
      break;

    case "sent":
      label = "Sent";
      icon = <Check className="w-4 h-4 text-gray-400 ml-1" />;
      labelColor = "text-gray-500";
      break;

    case "delivered":
      label = "Delivered";
      icon = <CheckCheck className="w-4 h-4 text-green-500 ml-1" />;
      labelColor = "text-green-600";
      break;

    case "read":
      label = "Read";
      icon = <CheckCheck className="w-4 h-4 text-blue-500 ml-1" />;
      labelColor = "text-blue-600";
      break;

    default:
      label = status.charAt(0).toUpperCase() + status.slice(1);
      icon = <Check className="w-4 h-4 text-gray-400 ml-1" />;
      labelColor = "text-gray-500";
  }

  return (
    <div className="flex items-center text-xs">
      <span className={`${labelColor} font-medium`}>{label}</span>
      {icon}
    </div>
  );
};

export default MessageStatus;
