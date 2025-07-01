// constants.ts
export const pastelColors = [
    "bg-pink-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-orange-200",
    "bg-teal-200",
    "bg-indigo-200",
    "bg-rose-200",
    "bg-lime-200",
  ];
  
  export const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  
  export const getPastelColor = (name: string) => {
    const index =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      pastelColors.length;
    return pastelColors[index];
  };
  
  export const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
    Lead: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      dot: "bg-yellow-500",
    },
    Basic: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
    Active: {
      bg: "bg-green-100",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    Dormant: {
      bg: "bg-red-200",
      text: "text-red-600",
      dot: "bg-red-500",
    },
    Dropped: {
      bg: "bg-gray-300",
      text: "text-gray-600",
      dot: "bg-gray-700",
    },
    "Basic Pending": {
    bg: "bg-orange-100",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  "Temporary Blocked": {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  "Temporary_Blocked": {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  
  };
  