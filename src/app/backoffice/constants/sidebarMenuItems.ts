export const sidebarMenuItems = [
    { label: "Transactions", href: "/backoffice/transactions" },
    // { label: "Special Limits", href: "/backoffice/special-limits" },
    // { label: "Reconciliation", href: "/backoffice/reconciliation" },
    { label: "User & Accounts", href: "/backoffice/user-accounts" },
       { 
      label: "Financials", 
      submenu: [
        { 
          label: "Transactions", 
          href: "/backoffice/financials/transactions" 
        }
      
      ]
    }
    

    // { label: "Fees & Commissions", href: "/backoffice/fees" },
    // { label: "Compliance & Security", href: "/backoffice/compliance-security" },
    // { label: "Reports & Analytics", href: "/backoffice/reports" },
    // { label: "Support & Disputes", href: "/backoffice/support" },
    // { label: "Settings & Permissions", href: "/backoffice/permissions" },
  ];