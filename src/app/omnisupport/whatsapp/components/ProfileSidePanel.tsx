"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Loader2, Copy, Check, FileText, CreditCard, Shield, User, Activity, ArrowUpRight } from 'lucide-react';

// Define specific interfaces for your data structure
interface TransactionTotals {
  successfulTransactions: number;
  failedTransactions: number;
}

interface TransactionData {
  lastTransactionDate: string | null;
  totalTransactions: TransactionTotals;
  totalTransactionsValue: number;
}

interface RiskScores {
  countryScore: number;
  transactionsScore: number;
  transactionsValueScore: number;
  accountStatusScore: number;
}

interface RiskScore {
  riskLevel: string;
  totalScore: number;
  scores: RiskScores;
}

interface TumaDocument {
  id: number;
  type: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  issuingCountry: string;
  placeOfBirth: string;
  onfidoId: string;
}

interface ProfileData {
  userId: number;
  accountKey: string;
  onfidoApplicantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  step: string;
  kycStatus: string;
  accountStatus: string;
  createdAt: string;
  cards: string[];
  transaction: TransactionData;
  riskScore: RiskScore;
  documents: TumaDocument[];
}

interface ProfileSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProfileData | null;
  loading: boolean;
}

const ProfileSidePanel = ({ isOpen, onClose, data, loading }: ProfileSidePanelProps) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string | number | undefined | null, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text.toString());
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Fixed 'any' in InfoRow types
  const InfoRow = ({ label, value, copyValue }: { 
    label: string; 
    value: string | number | null | undefined; 
    copyValue?: string | number | null;
  }) => (
    <div className="group py-3 border-b border-gray-50 last:border-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800 break-all">
          {value ?? <span className="text-gray-300 italic font-normal">null</span>}
        </p>
        {value && (
          <button 
            onClick={() => handleCopy(copyValue ?? value, label)} 
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            {copiedText === label ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  const tabs = ['Overview', 'Risk', 'Transactions', 'Documents'];
  const initials = `${data?.firstName?.[0] ?? ''}${data?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b bg-white">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              {/* No <img> tag here prevents the LCP warning */}
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold border-2 border-white shadow-sm">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {data?.firstName ?? 'Unknown'} {data?.lastName ?? 'User'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 text-xs font-medium">ID: #{data?.userId ?? 'null'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${data?.accountStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {data?.accountStatus ?? 'null'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-2.5 bg-[#4F46E5] text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all">
              SEND MESSAGE
            </button>
            <button className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-50 transition-all">
              ACTION REQUIRED
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-4 bg-white sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-4 text-xs font-black transition-all relative tracking-widest uppercase ${
                activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-sm font-medium">Loading user profile...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {activeTab === 'Overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <Shield size={14} className="text-indigo-500" />
                      <span className="text-[11px] font-black text-gray-600 uppercase">System Identifiers</span>
                    </div>
                    <div className="p-4">
                      <InfoRow label="Account Key" value={data.accountKey} />
                      <InfoRow label="Onfido Applicant ID" value={data.onfidoApplicantId} />
                      <InfoRow label="Internal User ID" value={data.userId} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <User size={14} className="text-indigo-500" />
                      <span className="text-[11px] font-black text-gray-600 uppercase">Personal Information</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InfoRow label="First Name" value={data.firstName} />
                        <InfoRow label="Last Name" value={data.lastName} />
                      </div>
                      <InfoRow label="Email Address" value={data.email} />
                      <InfoRow label="Phone Number" value={data.phone} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Risk' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4">
                      <Shield size={32} className="text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{data.riskScore?.totalScore ?? 0}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Risk Score</p>
                  </div>
                </div>
              )}

              {activeTab === 'Transactions' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase">Total Value</p>
                      <p className="text-xl font-black text-gray-900 mt-1">£{data.transaction?.totalTransactionsValue?.toFixed(2) ?? '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-green-50 p-5">
                        <div className="text-sm font-medium text-green-700 uppercase tracking-wide">Successful</div>
                        <div className="mt-2 text-3xl font-bold text-green-900">{data.transaction?.totalTransactions?.successfulTransactions ?? 0}</div>
                        <div className="absolute right-4 top-4 text-green-300">✓</div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-100 to-red-50 p-5">
                        <div className="text-sm font-medium text-red-700 uppercase tracking-wide">Failed</div>
                        <div className="mt-2 text-3xl font-bold text-red-900">{data.transaction?.totalTransactions?.failedTransactions ?? 0}</div>
                        <div className="absolute right-4 top-4 text-red-300">✕</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link 
                      href={`/backoffice/transactions?userId=${data.userId}`}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                    >
                      View Detailed Transactions
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'Documents' && (
                <div className="space-y-4 animate-in fade-in">
                  {data.documents?.map((doc: TumaDocument, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border shadow-sm">
                      <div className="flex items-center gap-3 mb-4 border-b pb-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-gray-900">{doc.type}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{doc.issuingCountry}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <InfoRow label="Document Number" value={doc.documentNumber} />
                        <InfoRow label="Full Name" value={`${doc.firstName} ${doc.lastName}`} />
                        <InfoRow label="Expiry Date" value={doc.dateOfExpiry} />
                        <InfoRow label="Place of Birth" value={doc.placeOfBirth} />
                      </div>
                    </div>
                  )) ?? <p className="text-center text-gray-400 py-10 font-bold uppercase text-xs">No documents found</p>}
                </div>
              )}

            </div>
          ) : null}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-xs font-black text-gray-500 hover:text-gray-800 uppercase tracking-widest transition-colors">
            Close Panel
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileSidePanel;