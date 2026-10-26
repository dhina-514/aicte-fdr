// AICTE Suraksha-FDR Portal Data Definitions

export const INITIAL_FDR_RECORDS = [
  {
    id: "FDR-2026-CAN-0891",
    collegeName: "PSG College of Technology & Applied Research",
    aicteId: "1-9318281101",
    region: "Southern (Chennai)",
    state: "Tamil Nadu",
    purpose: "Establishment of New Course (B.Tech AI & Data Science)",
    bankName: "Canara Bank",
    branchName: "Peelamedu Branch, Coimbatore",
    ifscCode: "CNRB0001234",
    fdrNumber: "CNRB-FD-8921094",
    amount: 3500000, // ₹35 Lakhs
    depositDate: "2024-06-15",
    maturityDate: "2034-06-15", // 10 years lock-in
    tenureYears: 10,
    interestRate: "7.10%",
    jointHolders: [
      "Regional Officer, AICTE Southern Region",
      "Managing Trustee, PSG & Sons' Charities"
    ],
    status: "ACTIVE_VERIFIED", // ACTIVE_VERIFIED, BANK_PENDING, AICTE_PENDING, FLAGGED_FORGERY, EXPIRING_SOON, RELEASED
    verificationMethod: "TRIPARTITE_SFMS_API",
    riskScore: 3, // 0 to 100 (low is safe)
    ocrData: {
      extractedAmount: 3500000,
      extractedFdrNo: "CNRB-FD-8921094",
      extractedBank: "Canara Bank",
      extractedMaturity: "2034-06-15",
      ocrConfidence: "99.4%",
      tamperingDetected: false,
      tamperScore: "1.2% (Pristine)",
      stampAuthenticity: "VERIFIED_GENUINE"
    },
    bankConfirmation: {
      confirmedBy: "K. Ramanathan (Chief Manager)",
      bankToken: "SFMS-CAN-2024-TOKEN-9941A",
      timestamp: "2024-06-18 11:24:10 IST",
      earlyLiquidationLockActive: true
    },
    daysRemaining: 2790,
    certificateUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "FDR-2026-SBI-7732",
    collegeName: "Vellore Apex Institute of Advanced Technology",
    aicteId: "1-7749102931",
    region: "Southern (Chennai)",
    state: "Tamil Nadu",
    purpose: "Expansion of Intake Capacity (CSE 180 to 240)",
    bankName: "State Bank of India",
    branchName: "Main Branch, Katpadi",
    ifscCode: "SBIN0004567",
    fdrNumber: "SBI-FDR-2023-99120",
    amount: 2500000, // ₹25 Lakhs
    depositDate: "2023-11-10",
    maturityDate: "2026-11-20", // Expiring in ~27 days!
    tenureYears: 3,
    interestRate: "6.85%",
    jointHolders: [
      "Regional Officer, AICTE Southern Region",
      "Chairman, Apex Educational Trust"
    ],
    status: "EXPIRING_SOON",
    verificationMethod: "TRIPARTITE_SFMS_API",
    riskScore: 12,
    ocrData: {
      extractedAmount: 2500000,
      extractedFdrNo: "SBI-FDR-2023-99120",
      extractedBank: "State Bank of India",
      extractedMaturity: "2026-11-20",
      ocrConfidence: "98.1%",
      tamperingDetected: false,
      tamperScore: "2.1% (Pristine)",
      stampAuthenticity: "VERIFIED_GENUINE"
    },
    bankConfirmation: {
      confirmedBy: "S. Priya (Branch Manager)",
      bankToken: "SFMS-SBI-2023-TOKEN-8831B",
      timestamp: "2023-11-12 15:40:02 IST",
      earlyLiquidationLockActive: true
    },
    daysRemaining: 27, // Alert trigger!
    certificateUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "FDR-2026-PNB-4410",
    collegeName: "Shree Sharda Institute of Management & Science",
    aicteId: "1-4401928312",
    region: "Northern (Kanpur)",
    state: "Uttar Pradesh",
    purpose: "New Institution Establishment Approval (MBA & MCA)",
    bankName: "Punjab National Bank",
    branchName: "Civil Lines, Lucknow",
    ifscCode: "PUNB0192800",
    fdrNumber: "PNB-FD-901844",
    amount: 5000000, // Claimed ₹50 Lakhs on portal
    depositDate: "2026-09-01",
    maturityDate: "2036-09-01",
    tenureYears: 10,
    interestRate: "7.00%",
    jointHolders: [
      "Regional Officer, AICTE Northern Region",
      "Secretary, Sharda Seva Trust"
    ],
    status: "FLAGGED_FORGERY", // TAMPERED!
    verificationMethod: "AI_CV_FORENSIC_FLAG",
    riskScore: 94, // High risk!
    ocrData: {
      extractedAmount: 5000000,
      actualBankAmount: 50000, // Real deposit was only ₹50,000!
      extractedFdrNo: "PNB-FD-901844",
      extractedBank: "Punjab National Bank",
      extractedMaturity: "2036-09-01",
      ocrConfidence: "76.4%",
      tamperingDetected: true,
      tamperDetails: "Digital Font Inconsistency detected on amount string '50,00,000'. Pixel compression artifacts indicate Photoshop clone stamp near zeros. Bank SFMS amount returns ₹50,000.",
      tamperScore: "94.8% (CRITICAL FORGERY DETECTED)",
      stampAuthenticity: "TAMPERED_SEAL"
    },
    bankConfirmation: {
      confirmedBy: "REJECTED_BY_BANK_AUDIT",
      bankToken: "SFMS-REJECT-DISCREPANCY-001",
      timestamp: "2026-09-05 14:10:00 IST",
      earlyLiquidationLockActive: false
    },
    daysRemaining: 3600,
    certificateUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "FDR-2026-HDFC-1120",
    collegeName: "BMS College of Engineering & Technology",
    aicteId: "1-1192847291",
    region: "South-Western (Bangalore)",
    state: "Karnataka",
    purpose: "Addition of Integrated M.Tech Cyber Security",
    bankName: "HDFC Bank",
    branchName: "Basavanagudi, Bengaluru",
    ifscCode: "HDFC0000123",
    fdrNumber: "HDFC-FD-339182",
    amount: 3500000,
    depositDate: "2026-10-20",
    maturityDate: "2036-10-20",
    tenureYears: 10,
    interestRate: "7.25%",
    jointHolders: [
      "Regional Officer, AICTE South-Western Region",
      "Trustee, BMS Educational Trust"
    ],
    status: "BANK_PENDING", // Waiting for Branch Manager confirmation
    verificationMethod: "PENDING_BRANCH_CONFIRMATION",
    riskScore: 8,
    ocrData: {
      extractedAmount: 3500000,
      extractedFdrNo: "HDFC-FD-339182",
      extractedBank: "HDFC Bank",
      extractedMaturity: "2036-10-20",
      ocrConfidence: "99.1%",
      tamperingDetected: false,
      tamperScore: "0.8% (Clean)",
      stampAuthenticity: "VERIFIED_GENUINE"
    },
    bankConfirmation: null,
    daysRemaining: 3648,
    certificateUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "FDR-2026-BOB-9921",
    collegeName: "Sardar Vallabhbhai Patel Institute of Technology",
    aicteId: "1-8829104821",
    region: "Western (Mumbai)",
    state: "Gujarat",
    purpose: "10-Year Tenure Completed - Security Deposit Release Request",
    bankName: "Bank of Baroda",
    branchName: "Alkapuri Branch, Vadodara",
    ifscCode: "BARB0ALKAPU",
    fdrNumber: "BOB-FD-1092847",
    amount: 3500000,
    depositDate: "2016-10-01",
    maturityDate: "2026-10-01", // Matured!
    tenureYears: 10,
    interestRate: "7.50%",
    jointHolders: [
      "Regional Officer, AICTE Western Region",
      "President, SVIT Trust"
    ],
    status: "AICTE_PENDING_RELEASE", // Eligible for release
    verificationMethod: "TRIPARTITE_SFMS_API",
    riskScore: 2,
    ocrData: {
      extractedAmount: 3500000,
      extractedFdrNo: "BOB-FD-1092847",
      extractedBank: "Bank of Baroda",
      extractedMaturity: "2026-10-01",
      ocrConfidence: "99.7%",
      tamperingDetected: false,
      tamperScore: "0.4% (Clean)",
      stampAuthenticity: "VERIFIED_GENUINE"
    },
    bankConfirmation: {
      confirmedBy: "V. Mehta (Senior Manager)",
      bankToken: "SFMS-BOB-2016-TOKEN-1102A",
      timestamp: "2016-10-04 10:30:15 IST",
      earlyLiquidationLockActive: true
    },
    daysRemaining: -23, // Matured 23 days ago
    certificateUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "FDR-2026-UBI-5523",
    collegeName: "Kalinga Academy of Aeronautical & Space Technology",
    aicteId: "1-5519284711",
    region: "Eastern (Kolkata)",
    state: "Odisha",
    purpose: "Establishment of New Aeronautical Engineering Wing",
    bankName: "Union Bank of India",
    branchName: "Janpath, Bhubaneswar",
    ifscCode: "UBIN0543210",
    fdrNumber: "UBI-FD-667192",
    amount: 10000000, // ₹1 Crore
    depositDate: "2025-01-15",
    maturityDate: "2035-01-15",
    tenureYears: 10,
    interestRate: "7.15%",
    jointHolders: [
      "Regional Officer, AICTE Eastern Region",
      "Chairman, Kalinga Foundation"
    ],
    status: "ACTIVE_VERIFIED",
    verificationMethod: "TRIPARTITE_SFMS_API",
    riskScore: 4,
    ocrData: {
      extractedAmount: 10000000,
      extractedFdrNo: "UBI-FD-667192",
      extractedBank: "Union Bank of India",
      extractedMaturity: "2035-01-15",
      ocrConfidence: "98.9%",
      tamperingDetected: false,
      tamperScore: "1.1% (Clean)",
      stampAuthenticity: "VERIFIED_GENUINE"
    },
    bankConfirmation: {
      confirmedBy: "D. Mohapatra (AGM)",
      bankToken: "SFMS-UBI-2025-TOKEN-7714C",
      timestamp: "2025-01-18 16:20:00 IST",
      earlyLiquidationLockActive: true
    },
    daysRemaining: 3004,
    certificateUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60"
  }
];

export const MOCK_BANKS = [
  { name: "Canara Bank", code: "CNRB", apiActive: true, latencyMs: 140 },
  { name: "State Bank of India", code: "SBIN", apiActive: true, latencyMs: 95 },
  { name: "Punjab National Bank", code: "PUNB", apiActive: true, latencyMs: 180 },
  { name: "HDFC Bank", code: "HDFC", apiActive: true, latencyMs: 80 },
  { name: "Bank of Baroda", code: "BARB", apiActive: true, latencyMs: 110 },
  { name: "Union Bank of India", code: "UBIN", apiActive: true, latencyMs: 160 }
];

export const MOCK_AUDIT_LEDGER = [
  {
    txnId: "TXN-99824-A1",
    timestamp: "2026-10-24 14:15:30",
    entity: "Canara Bank (Peelamedu)",
    action: "Tripartite Joint Lock Engaged",
    fdrId: "FDR-2026-CAN-0891",
    hash: "0x8f7d9a1c2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    previousHash: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    status: "IMMUTABLE_CONFIRMED"
  },
  {
    txnId: "TXN-99823-B2",
    timestamp: "2026-10-24 11:02:18",
    entity: "AICTE AI Forensic Engine",
    action: "Fraud Anomaly Flagged - Font Mismatch & Bank SFMS Reject",
    fdrId: "FDR-2026-PNB-4410",
    hash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    previousHash: "0x2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    status: "ALERT_DISPATCHED"
  },
  {
    txnId: "TXN-99822-C3",
    timestamp: "2026-10-23 16:45:10",
    entity: "HDFC Bank (Basavanagudi)",
    action: "Receipt Uploaded via College Portal - SFMS Ping Sent",
    fdrId: "FDR-2026-HDFC-1120",
    hash: "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    previousHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    status: "PENDING_VERIFICATION"
  },
  {
    txnId: "TXN-99821-D4",
    timestamp: "2026-10-22 09:30:00",
    entity: "AICTE Western Regional Office",
    action: "10-Year Maturity Verified - Release Eligible under APH Norms",
    fdrId: "FDR-2026-BOB-9921",
    hash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    previousHash: "0x0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    status: "PENDING_FINAL_DISBURSEMENT"
  }
];
