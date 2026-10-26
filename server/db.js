import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    -- Users Table (Role-based authentication)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- 'AICTE_OFFICER', 'COLLEGE_ADMIN', 'BANK_OFFICER'
      full_name TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      aicte_pid TEXT,
      region TEXT,
      designation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- FDR Security Deposits Table
    CREATE TABLE IF NOT EXISTS fdr_deposits (
      id TEXT PRIMARY KEY,
      aicte_pid TEXT NOT NULL,
      institution_name TEXT NOT NULL,
      region TEXT NOT NULL,
      state TEXT NOT NULL,
      purpose TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      fdr_number TEXT UNIQUE NOT NULL,
      amount INTEGER NOT NULL,
      deposit_date TEXT NOT NULL,
      maturity_date TEXT NOT NULL,
      tenure_years INTEGER NOT NULL,
      interest_rate TEXT NOT NULL,
      joint_holder_aicte TEXT NOT NULL,
      joint_holder_trust TEXT NOT NULL,
      status TEXT NOT NULL, -- 'ACTIVE_VERIFIED', 'BANK_PENDING', 'EXPIRING_SOON', 'FLAGGED_FORGERY', 'RELEASED_APPROVED'
      verification_method TEXT NOT NULL,
      risk_score INTEGER NOT NULL,
      bank_token TEXT,
      bank_confirmed_by TEXT,
      bank_confirmed_at TEXT,
      early_liquidation_lock INTEGER DEFAULT 0,
      tamper_score TEXT,
      tamper_details TEXT,
      bank_verified_amount INTEGER,
      replacement_of_id TEXT,
      scrutiny_observations TEXT,
      release_request_status TEXT, -- 'NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'REJECTED'
      release_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Audit Ledger Table (Cryptographic trail)
    CREATE TABLE IF NOT EXISTS audit_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      txn_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      entity TEXT NOT NULL,
      action TEXT NOT NULL,
      fdr_id TEXT NOT NULL,
      block_hash TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      status TEXT NOT NULL
    );

    -- Official Regulatory Notices Table
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fdr_id TEXT,
      institution_name TEXT NOT NULL,
      notice_type TEXT NOT NULL, -- 'SHOW_CAUSE_FORGERY', 'RENEWAL_ALERT', 'RELEASE_NOC'
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      issued_by TEXT NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'DISPATCHED'
    );

    -- AICTE Approved Institutions Directory
    CREATE TABLE IF NOT EXISTS institutions (
      aicte_pid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      state TEXT NOT NULL,
      city TEXT NOT NULL,
      institution_type TEXT NOT NULL,
      established_year INTEGER,
      principal_name TEXT,
      trust_name TEXT,
      email TEXT
    );
  `);

  // Ensure extra columns exist if table was already created
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN bank_verified_amount INTEGER'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN replacement_of_id TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN scrutiny_observations TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN release_request_status TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN release_notes TEXT'); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN evc_status TEXT DEFAULT 'PENDING_ON_SITE_VISIT'"); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN evc_verified_at TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN evc_verified_by TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN evc_gps_coords TEXT'); } catch(e) {}
  try { db.exec('ALTER TABLE fdr_deposits ADD COLUMN evc_committee_remarks TEXT'); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN accreditation_type TEXT DEFAULT 'NBA_TIER_1'"); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN accreditation_status TEXT DEFAULT 'ACTIVE_COMPLIANT'"); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN statutory_deficit INTEGER DEFAULT 0"); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN demand_notice_issued_at TEXT"); } catch(e) {}
  try { db.exec("ALTER TABLE fdr_deposits ADD COLUMN demand_notice_ref TEXT"); } catch(e) {}

  // Seed default users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('Seeding initial production users...');
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password, role, full_name, organization_name, aicte_pid, region, designation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. AICTE Central Officer
    insertUser.run(
      'USR-AICTE-01',
      'officer.southern@aicte.gov.in',
      'aicte@2026',
      'AICTE_OFFICER',
      'Dr. R. Sundaresan',
      'AICTE Southern Regional Office (Chennai)',
      null,
      'Southern (Chennai)',
      'Regional Officer & Director'
    );

    // 2. College Admin (PSG College)
    insertUser.run(
      'USR-CLG-01',
      'principal@psgtech.edu',
      'psg@2026',
      'COLLEGE_ADMIN',
      'Dr. K. Prakasan',
      'PSG College of Technology & Applied Research',
      '1-9318281101',
      'Southern (Chennai)',
      'Principal & Authorized Trust Representative'
    );

    // 3. Bank Officer (Canara Bank)
    insertUser.run(
      'USR-BANK-01',
      'mgr.peelamedu@canarabank.com',
      'bank@2026',
      'BANK_OFFICER',
      'K. Ramanathan',
      'Canara Bank (Peelamedu Branch)',
      null,
      'Southern (Chennai)',
      'Chief Manager & SFMS Authorizer'
    );
  }

  // Seed default FDR deposits if empty
  const fdrCount = db.prepare('SELECT COUNT(*) as count FROM fdr_deposits').get().count;
  if (fdrCount === 0) {
    console.log('Seeding initial institutional FDR records...');
    const insertFdr = db.prepare(`
      INSERT INTO fdr_deposits (
        id, aicte_pid, institution_name, region, state, purpose,
        bank_name, branch_name, ifsc_code, fdr_number, amount,
        deposit_date, maturity_date, tenure_years, interest_rate,
        joint_holder_aicte, joint_holder_trust, status,
        verification_method, risk_score, bank_token,
        bank_confirmed_by, bank_confirmed_at, early_liquidation_lock,
        tamper_score, tamper_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertFdr.run(
      'FDR-2024-CAN-0891',
      '1-9318281101',
      'PSG College of Technology & Applied Research',
      'Southern (Chennai)',
      'Tamil Nadu',
      'Establishment of New Course (B.Tech AI & Data Science)',
      'Canara Bank',
      'Peelamedu Branch, Coimbatore',
      'CNRB0001234',
      'CNRB-FD-8921094',
      3500000,
      '2024-06-15',
      '2034-06-15',
      10,
      '7.10%',
      'Regional Officer, AICTE Southern Region',
      'Managing Trustee, PSG & Sons\' Charities',
      'ACTIVE_VERIFIED',
      'TRIPARTITE_SFMS_API',
      3,
      'SFMS-CAN-2024-TOKEN-9941A',
      'K. Ramanathan (Chief Manager)',
      '2024-06-18 11:24:10 IST',
      1,
      '1.2% (Pristine)',
      'Verified authentic certificate matching bank Core Banking System (CBS).'
    );

    insertFdr.run(
      'FDR-2023-SBI-7732',
      '1-7749102931',
      'Vellore Apex Institute of Advanced Technology',
      'Southern (Chennai)',
      'Tamil Nadu',
      'Expansion of Intake Capacity (CSE 180 to 240)',
      'State Bank of India',
      'Main Branch, Katpadi',
      'SBIN0004567',
      'SBI-FDR-2023-99120',
      2500000,
      '2023-11-10',
      '2026-11-20',
      3,
      '6.85%',
      'Regional Officer, AICTE Southern Region',
      'Chairman, Apex Educational Trust',
      'EXPIRING_SOON',
      'TRIPARTITE_SFMS_API',
      12,
      'SFMS-SBI-2023-TOKEN-8831B',
      'S. Priya (Branch Manager)',
      '2023-11-12 15:40:02 IST',
      1,
      '2.1% (Pristine)',
      'Nearing maturity. Mandatory 90-day renewal cycle pending.'
    );

    insertFdr.run(
      'FDR-2026-PNB-4410',
      '1-4401928312',
      'Shree Sharda Institute of Management & Science',
      'Northern (Kanpur)',
      'Uttar Pradesh',
      'New Institution Establishment Approval (MBA & MCA)',
      'Punjab National Bank',
      'Civil Lines, Lucknow',
      'PUNB0192800',
      'PNB-FD-901844',
      5000000,
      '2026-09-01',
      '2036-09-01',
      10,
      '7.00%',
      'Regional Officer, AICTE Northern Region',
      'Secretary, Sharda Seva Trust',
      'FLAGGED_FORGERY',
      'AI_CV_FORENSIC_FLAG',
      94,
      'SFMS-REJECT-DISCREPANCY-001',
      'REJECTED_BY_BANK_AUDIT',
      '2026-09-05 14:10:00 IST',
      0,
      '94.8% (CRITICAL FORGERY DETECTED)',
      'Uploaded receipt claims ₹50,00,000. AI Computer Vision flagged digital font alteration near zeroes. Real-time Bank SFMS ping returns actual deposit of only ₹50,000.'
    );

    insertFdr.run(
      'FDR-2026-HDFC-1120',
      '1-1192847291',
      'BMS College of Engineering & Technology',
      'South-Western (Bangalore)',
      'Karnataka',
      'Addition of Integrated M.Tech Cyber Security',
      'HDFC Bank',
      'Basavanagudi, Bengaluru',
      'HDFC0000123',
      'HDFC-FD-339182',
      3500000,
      '2026-10-20',
      '2036-10-20',
      10,
      '7.25%',
      'Regional Officer, AICTE South-Western Region',
      'Trustee, BMS Educational Trust',
      'BANK_PENDING',
      'PENDING_BRANCH_CONFIRMATION',
      8,
      null,
      null,
      null,
      0,
      '0.8% (Clean)',
      'Awaiting Branch Manager confirmation in the Bank Gateway portal.'
    );

    insertFdr.run(
      'FDR-2016-BOB-9921',
      '1-8829104821',
      'Sardar Vallabhbhai Patel Institute of Technology',
      'Western (Mumbai)',
      'Gujarat',
      '10-Year Tenure Completed - Security Deposit Release Request',
      'Bank of Baroda',
      'Alkapuri Branch, Vadodara',
      'BARB0ALKAPU',
      'BOB-FD-1092847',
      3500000,
      '2016-10-01',
      '2026-10-01',
      10,
      '7.50%',
      'Regional Officer, AICTE Western Region',
      'President, SVIT Trust',
      'AICTE_PENDING_RELEASE',
      'TRIPARTITE_SFMS_API',
      2,
      'SFMS-BOB-2016-TOKEN-1102A',
      'V. Mehta (Senior Manager)',
      '2016-10-04 10:30:15 IST',
      1,
      '0.4% (Clean)',
      '10 years successfully served. APH Chapter 1 release eligibility verified.'
    );

    insertFdr.run(
      'FDR-2025-UBI-5523',
      '1-5519284711',
      'Kalinga Academy of Aeronautical & Space Technology',
      'Eastern (Kolkata)',
      'Odisha',
      'Establishment of New Aeronautical Engineering Wing',
      'Union Bank of India',
      'Janpath, Bhubaneswar',
      'UBIN0543210',
      'UBI-FD-667192',
      10000000,
      '2025-01-15',
      '2035-01-15',
      10,
      '7.15%',
      'Regional Officer, AICTE Eastern Region',
      'Chairman, Kalinga Foundation',
      'ACTIVE_VERIFIED',
      'TRIPARTITE_SFMS_API',
      4,
      'SFMS-UBI-2025-TOKEN-7714C',
      'D. Mohapatra (AGM)',
      '2025-01-18 16:20:00 IST',
      1,
      '1.1% (Clean)',
      'Verified ₹1.00 Crore security deposit with Union Bank of India.'
    );
  }

  // Seed default audit trail if empty
  const auditCount = db.prepare('SELECT COUNT(*) as count FROM audit_ledger').get().count;
  if (auditCount === 0) {
    const insertAudit = db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      'TXN-99824-A1',
      '2026-10-24 14:15:30',
      'Canara Bank (Peelamedu)',
      'Tripartite Joint Lock Engaged',
      'FDR-2024-CAN-0891',
      '0x8f7d9a1c2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
      'IMMUTABLE_CONFIRMED'
    );

    insertAudit.run(
      'TXN-99823-B2',
      '2026-10-24 11:02:18',
      'AICTE AI Forensic Engine',
      'Fraud Anomaly Flagged - Font Mismatch & Bank SFMS Reject',
      'FDR-2026-PNB-4410',
      '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      '0x2b3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
      'ALERT_DISPATCHED'
    );
  }

  // Seed AICTE Approved Institutions Directory if empty
  const instCount = db.prepare('SELECT COUNT(*) as count FROM institutions').get().count;
  if (instCount === 0) {
    console.log('Seeding AICTE approved institutions directory...');
    const insertInst = db.prepare(`
      INSERT INTO institutions (aicte_pid, name, region, state, city, institution_type, established_year, principal_name, trust_name, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleInstitutions = [
      ['1-9318281101', 'PSG College of Technology & Applied Research', 'Southern (Chennai)', 'Tamil Nadu', 'Coimbatore', 'Autonomous Engineering College', 1951, 'Dr. K. Prakasan', 'PSG & Sons Charities', 'principal@psgtech.edu'],
      ['1-426189911', 'College of Engineering Guindy (Anna University)', 'Southern (Chennai)', 'Tamil Nadu', 'Chennai', 'University Department', 1794, 'Dr. L. Suganthi', 'Anna University', 'dean@ceg.annauniv.edu'],
      ['1-281900122', 'Thiagarajar College of Engineering', 'Southern (Chennai)', 'Tamil Nadu', 'Madurai', 'Government Aided Autonomous', 1957, 'Dr. M. Palaninatha Raja', 'Thiagarajar College Trust', 'principal@tce.edu'],
      ['1-739182001', 'R.V. College of Engineering', 'South-Western (Bangalore)', 'Karnataka', 'Bengaluru', 'Autonomous Engineering College', 1963, 'Dr. K. N. Subramanya', 'Rashtreeya Sikshana Samithi Trust', 'principal@rvce.edu.in'],
      ['1-1192847291', 'BMS College of Engineering & Technology', 'South-Western (Bangalore)', 'Karnataka', 'Bengaluru', 'Autonomous Engineering College', 1946, 'Dr. S. Muralidhara', 'BMS Educational Trust', 'principal@bmsce.ac.in'],
      ['1-628190223', 'College of Engineering Pune (COEP Tech University)', 'Western (Mumbai)', 'Maharashtra', 'Pune', 'Unitary State University', 1854, 'Dr. D. N. Sonawane', 'COEP Board of Governors', 'director@coeptech.ac.in'],
      ['1-391829101', 'Veermata Jijabai Technological Institute (VJTI)', 'Western (Mumbai)', 'Maharashtra', 'Mumbai', 'Autonomous Central Govt Aided', 1887, 'Dr. Sachin Kore', 'VJTI Society', 'director@vjti.ac.in'],
      ['1-891028312', 'Chaitanya Bharathi Institute of Technology (CBIT)', 'South-Central (Hyderabad)', 'Telangana', 'Hyderabad', 'Autonomous Engineering College', 1979, 'Dr. C. V. Narasimhulu', 'CBIT Educational Society', 'principal@cbit.ac.in'],
      ['1-512938471', 'Maharaja Agrasen Institute of Technology', 'North-Western (Chandigarh)', 'Delhi', 'New Delhi', 'Private Self-Financing', 1999, 'Dr. Neelam Sharma', 'Maharaja Agrasen Technical Education Society', 'director@mait.ac.in'],
      ['1-4401928312', 'Shree Sharda Institute of Management & Science', 'Northern (Kanpur)', 'Uttar Pradesh', 'Lucknow', 'Private Self-Financing', 2014, 'Dr. R. K. Srivastava', 'Sharda Seva Trust', 'admin@shardainstitute.org'],
      ['1-8829104821', 'Sardar Vallabhbhai Patel Institute of Technology', 'Western (Mumbai)', 'Gujarat', 'Vadodara', 'Self-Financing Technical Institute', 1997, 'Dr. S. D. Patel', 'SVIT Trust', 'principal@svit.ac.in'],
      ['1-5519284711', 'Kalinga Academy of Aeronautical & Space Technology', 'Eastern (Kolkata)', 'Odisha', 'Bhubaneswar', 'Technical Institute', 2008, 'Dr. P. C. Senapati', 'Kalinga Foundation', 'registrar@kalinga.edu']
    ];

    for (const inst of sampleInstitutions) {
      insertInst.run(...inst);
    }
  }

  // Seed additional realistic institutional FDR records across Indian regions
  const insertExtraFdr = db.prepare(`
    INSERT OR IGNORE INTO fdr_deposits (
      id, aicte_pid, institution_name, region, state, purpose,
      bank_name, branch_name, ifsc_code, fdr_number, amount,
      deposit_date, maturity_date, tenure_years, interest_rate,
      joint_holder_aicte, joint_holder_trust, status,
      verification_method, risk_score, bank_token,
      bank_confirmed_by, bank_confirmed_at, early_liquidation_lock,
      tamper_score, tamper_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExtraFdr.run(
    'FDR-2024-SBI-3321',
    '1-426189911',
    'College of Engineering Guindy (Anna University)',
    'Southern (Chennai)',
    'Tamil Nadu',
    'New Course Addition (M.Tech Robotics & Automation) - ₹35 Lakhs',
    'State Bank of India',
    'Anna University Campus Branch, Chennai',
    'SBIN0001053',
    'SBI-FD-2024-77192',
    3500000,
    '2024-03-10',
    '2034-03-10',
    10,
    '7.20%',
    'Regional Officer, AICTE Southern Region',
    'Registrar, Anna University Chennai',
    'ACTIVE_VERIFIED',
    'TRIPARTITE_SFMS_API',
    2,
    'SFMS-SBI-2024-TOKEN-4491C',
    'R. Meenakshi (Chief Manager)',
    '2024-03-14 11:10:00 IST',
    1,
    '0.5% (Pristine)',
    'Fully locked joint security deposit in SBI Anna University campus branch.'
  );

  insertExtraFdr.run(
    'FDR-2025-CAN-6610',
    '1-739182001',
    'R.V. College of Engineering',
    'South-Western (Bangalore)',
    'Karnataka',
    'Intake Expansion (CSE from 180 to 240 seats) - ₹25 Lakhs',
    'Canara Bank',
    'R.V. Road Branch, Bengaluru',
    'CNRB0001234',
    'CNRB-FD-2025-88319',
    2500000,
    '2025-05-18',
    '2035-05-18',
    10,
    '7.10%',
    'Regional Officer, AICTE South-Western Region',
    'Trustee, Rashtreeya Sikshana Samithi Trust',
    'ACTIVE_VERIFIED',
    'TRIPARTITE_SFMS_API',
    3,
    'SFMS-CAN-2025-TOKEN-6632B',
    'A. K. Sharma (Branch Head)',
    '2025-05-22 14:05:00 IST',
    1,
    '0.7% (Pristine)',
    'Lien marked under APH guidelines for intake expansion.'
  );

  insertExtraFdr.run(
    'FDR-2026-BOB-4419',
    '1-628190223',
    'College of Engineering Pune (COEP Tech University)',
    'Western (Mumbai)',
    'Maharashtra',
    'Establishment of New Technical Center of Excellence - ₹1.00 Crore',
    'Bank of Baroda',
    'Shivajinagar Branch, Pune',
    'BARB0VJCOIM',
    'BOB-FD-2026-90412',
    10000000,
    '2026-08-12',
    '2036-08-12',
    10,
    '7.35%',
    'Regional Officer, AICTE Western Region',
    'Director, COEP Technological University',
    'BANK_PENDING',
    'PENDING_BRANCH_CONFIRMATION',
    7,
    null,
    null,
    null,
    0,
    '0.9% (Clean)',
    'Awaiting Bank Officer confirmation in the Bank Gateway.'
  );

  console.log('Database initialized successfully.');
}

export default db;
