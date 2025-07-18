// types.ts
export type KYCStep = "KYC_IN_PROGRESS" | "KYC_COMPLETED" | "KYC_FAILED";
export interface User {
  // From API
  userId: number;
  accountKey: string;
  onfidoApplicantId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  step: KYCStep | string; 
  kycStatus: string ;
  accountStatus: string;
  createdAt: string;
  country: string ;
  documents?: Document[];
  transaction?: Transaction;
  riskScore?:RiskScore;
  cards?:CardDetails[];
}

export interface Document {
  id: number;
  onfidoId: string;
  firstName: string;
  lastName: string;
  type: string;
  documentNumber: string;
  side: string;
  issuingCountry: string;
  href: string;
  downloadHref: string;
  gender: string;
  issuingAuthority: string | null;
  issuingDate: string;
  dateOfBirth: string;
  dateOfExpiry: string | null;
  nationality: string | null;
  personalNumber: string;
  placeOfBirth: string | null;
  createdAt: string;
}

export interface Transaction {
  
  lastTransactionDate: string | null;
  totalTransactions: {
    successfulTransactions: number;
    failedTransactions: number;
  };
  totalTransactionsValue: number;
}

export interface RiskScore {
  riskLevel: "Low" | "Medium" | "High";
  totalScore: number;
  scores: {
    countryScore: number;
    transactionsScore: number;
    transactionsValueScore: number;
    accountStatusScore: number;
  };
}

export interface CardDetails {
  issuer: string;
  type: string;
  bin: string; // First 6 digits
  lastFour: string; // Last 4 digits
  fullMaskedNumber: string; // Full masked number from API (e.g., 535666######9217)
}