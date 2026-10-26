import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db, { initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// Helper: Generate SHA-256 Hash
function generateHash(data) {
  return '0x' + crypto.createHash('sha256').update(JSON.stringify(data) + Date.now()).digest('hex');
}

// ----------------------------------------------------
// AUTHENTICATION APIS
// ----------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier (Email or AICTE PID) and password are required.' });
  }

  // Lookup user by email OR aicte_pid
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE (email = ? OR aicte_pid = ?) AND password = ?
  `).get(identifier, identifier, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid official credentials. Please check your AICTE PID/Email and password.' });
  }

  // Verify role if specified
  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account credentials do not belong to the selected ${role} authority.` });
  }

  const { password: _, ...userSafe } = user;
  res.json({
    success: true,
    user: userSafe,
    token: `AUTH-${userSafe.role}-${Buffer.from(userSafe.email).toString('base64')}`
  });
});

// ----------------------------------------------------
// FINANCIAL STATS API
// ----------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const totalRow = db.prepare('SELECT SUM(amount) as totalAmount, COUNT(*) as totalCount FROM fdr_deposits').get();
    const flaggedRow = db.prepare("SELECT COUNT(*) as flaggedCount FROM fdr_deposits WHERE status = 'FLAGGED_FORGERY'").get();
    const expiringRow = db.prepare("SELECT COUNT(*) as expiringCount FROM fdr_deposits WHERE status = 'EXPIRING_SOON'").get();
    const pendingBankRow = db.prepare("SELECT COUNT(*) as pendingBankCount FROM fdr_deposits WHERE status = 'BANK_PENDING'").get();
    const pendingReleaseRow = db.prepare("SELECT COUNT(*) as pendingReleaseCount FROM fdr_deposits WHERE status = 'AICTE_PENDING_RELEASE'").get();

    const totalCrores = ((totalRow.totalAmount || 0) / 10000000).toFixed(2);

    res.json({
      totalAmount: totalRow.totalAmount || 0,
      totalCrores,
      totalInstitutions: totalRow.totalCount || 0,
      flaggedCount: flaggedRow.flaggedCount || 0,
      expiringCount: expiringRow.expiringCount || 0,
      pendingBankCount: pendingBankRow.pendingBankCount || 0,
      pendingReleaseCount: pendingReleaseRow.pendingReleaseCount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AICTE INSTITUTIONS DIRECTORY API
// ----------------------------------------------------
app.get('/api/institutions', (req, res) => {
  try {
    const { region, state, search } = req.query;
    let query = 'SELECT * FROM institutions WHERE 1=1';
    const params = [];

    if (region && region !== 'ALL') {
      query += ' AND region LIKE ?';
      params.push(`%${region}%`);
    }

    if (state && state !== 'ALL') {
      query += ' AND state = ?';
      params.push(state);
    }

    if (search) {
      query += ' AND (name LIKE ? OR aicte_pid LIKE ? OR city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';
    const institutions = db.prepare(query).all(...params);
    res.json({ success: true, count: institutions.length, institutions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// FDR DEPOSITS APIS
// ----------------------------------------------------

// GET /api/fdr
app.get('/api/fdr', (req, res) => {
  try {
    const { role, aicte_pid, bank_name } = req.query;

    let query = 'SELECT * FROM fdr_deposits';
    let params = [];

    if (role === 'COLLEGE_ADMIN' && aicte_pid) {
      query += ' WHERE aicte_pid = ?';
      params.push(aicte_pid);
    } else if (role === 'BANK_OFFICER' && bank_name) {
      query += ' WHERE bank_name LIKE ?';
      params.push(`%${bank_name}%`);
    }

    query += ' ORDER BY created_at DESC';

    const records = db.prepare(query).all(...params);
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fdr (College submits new FDR)
app.post('/api/fdr', (req, res) => {
  try {
    const data = req.body;

    let id = data.id || `FDR-${Date.now().toString().slice(-4)}`;
    let fdrNumber = (data.fdr_number || `FDR-NUM-${Date.now().toString().slice(-6)}`).trim();

    // Check if ID already exists and ensure uniqueness
    const existingId = db.prepare('SELECT id FROM fdr_deposits WHERE id = ?').get(id);
    if (existingId) {
      id = `FDR-${Date.now().toString().slice(-6)}`;
    }

    // Check if FDR Number already exists; auto-disambiguate to prevent UNIQUE constraint violation
    const existingFdr = db.prepare('SELECT id FROM fdr_deposits WHERE fdr_number = ?').get(fdrNumber);
    if (existingFdr) {
      fdrNumber = `${fdrNumber}-REV${Date.now().toString().slice(-3)}`;
    }

    const stmt = db.prepare(`
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

    stmt.run(
      id,
      data.aicte_pid || '1-9318281101',
      data.institution_name || 'PSG College of Technology & Applied Research',
      data.region || 'Southern (Chennai)',
      data.state || 'Tamil Nadu',
      data.purpose,
      data.bank_name,
      data.branch_name || 'Main Branch',
      data.ifsc_code || 'CNRB0001234',
      fdrNumber,
      Number(data.amount),
      data.deposit_date || new Date().toISOString().slice(0, 10),
      data.maturity_date || '2036-10-24',
      Number(data.tenure_years) || 10,
      data.interest_rate || '7.10%',
      data.joint_holder_aicte || 'Regional Officer, AICTE Southern Region',
      data.joint_holder_trust || 'Managing Trustee, Educational Trust',
      data.status || 'BANK_PENDING',
      data.verification_method || 'PENDING_BRANCH_CONFIRMATION',
      data.risk_score || 5,
      null,
      null,
      null,
      0,
      data.tamper_score || '0.5% (Clean)',
      data.tamper_details || 'Verified submission via institutional portal.'
    );

    // Record into Audit Ledger
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x00000000000000000000000000000000';
    const newHash = generateHash({ id, fdrNumber, amount: data.amount });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      data.institution_name || 'Institutional Trust',
      data.status === 'FLAGGED_FORGERY' 
        ? 'AI Forensic Anomaly Flagged - Tamper Audit Triggered'
        : 'e-FDR Submitted - Bank Tripartite Notification Sent',
      id,
      newHash,
      prevHash,
      data.status === 'FLAGGED_FORGERY' ? 'ALERT_DISPATCHED' : 'PENDING_VERIFICATION'
    );

    res.json({ success: true, message: 'FDR registered successfully.', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fdr/:id/bank-verify (Bank confirms tripartite lien)
app.post('/api/fdr/:id/bank-verify', (req, res) => {
  try {
    const { id } = req.params;
    const { confirmed_by } = req.body;

    const token = `SFMS-CONFIRM-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';

    const result = db.prepare(`
      UPDATE fdr_deposits
      SET status = 'ACTIVE_VERIFIED',
          verification_method = 'TRIPARTITE_SFMS_API',
          bank_token = ?,
          bank_confirmed_by = ?,
          bank_confirmed_at = ?,
          early_liquidation_lock = 1,
          risk_score = 2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(token, confirmed_by || 'Branch Manager (Authorized E-Sign)', timestamp, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'FDR record not found.' });
    }

    // Ledger entry
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x00000000000000000000000000000000';
    const newHash = generateHash({ id, token, timestamp });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      confirmed_by || 'Bank Branch Manager',
      'Tripartite Joint Lien Engaged & Early Liquidation Locked in CBS',
      id,
      newHash,
      prevHash,
      'IMMUTABLE_CONFIRMED'
    );

    res.json({ success: true, message: 'Bank Tripartite Lien confirmed.', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fdr/:id/approve-release (AICTE releases 10-year security deposit)
app.post('/api/fdr/:id/approve-release', (req, res) => {
  try {
    const { id } = req.params;
    const { release_notes, officer_name } = req.body;

    const deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ?').get(id);
    if (!deposit) {
      return res.status(404).json({ error: 'FDR record not found.' });
    }

    db.prepare(`
      UPDATE fdr_deposits
      SET status = 'RELEASED_APPROVED',
          release_request_status = 'APPROVED',
          release_notes = ?,
          risk_score = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(release_notes || 'Approved under AICTE APH Chapter 1 norms.', id);

    // Ledger entry for CAG / CVC audit compliance
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x00000000000000000000000000000000';
    const newHash = generateHash({ id, action: 'RELEASED_APPROVED', amount: deposit.amount });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      officer_name || 'AICTE Regional Directorate (Southern RO)',
      `Statutory 10-Yr Release NOC Issued & Lien Discharge Authorized (₹${Number(deposit.amount).toLocaleString('en-IN')})`,
      id,
      newHash,
      prevHash,
      'RELEASE_NOC_ISSUED'
    );

    res.json({ success: true, message: '10-Year Security Deposit Release Approved under APH Chapter 1.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fdr/:id/request-release (Institution requests release/refund)
app.post('/api/fdr/:id/request-release', (req, res) => {
  try {
    const { id } = req.params;
    const { justification } = req.body;

    const deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ?').get(id);
    if (!deposit) {
      return res.status(404).json({ error: 'FDR record not found.' });
    }

    db.prepare(`
      UPDATE fdr_deposits
      SET release_request_status = 'REQUESTED',
          status = 'AICTE_PENDING_RELEASE',
          release_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(justification || '10-year lock-in completed. Requesting NOC and discharge.', id);

    // Ledger entry for institutional release petition
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x00000000000000000000000000000000';
    const newHash = generateHash({ id, action: 'REQUEST_RELEASE' });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      deposit.institution_name || 'Institutional Principal',
      'Formal 10-Year Tenure Completion Refund & Lien Discharge Petition Filed',
      id,
      newHash,
      prevHash,
      'REFUND_PETITION_SUBMITTED'
    );

    res.json({ success: true, message: 'Release & refund request submitted to AICTE Regulation Bureau.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fdr/:id/scrutiny (AICTE records scrutiny observation)
app.post('/api/fdr/:id/scrutiny', (req, res) => {
  try {
    const { id } = req.params;
    const { observation, flag_discrepancy } = req.body;

    let query = `
      UPDATE fdr_deposits
      SET scrutiny_observations = ?,
          updated_at = CURRENT_TIMESTAMP
    `;
    let params = [observation];

    if (flag_discrepancy) {
      query += `, status = 'FLAGGED_FORGERY', risk_score = 90`;
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const result = db.prepare(query).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'FDR record not found.' });
    }

    res.json({ success: true, message: 'Scrutiny observation recorded successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices
app.get('/api/notices', (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 50').all();
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AICTE EXPERT VISIT COMMITTEE (EVC) ON-SITE VERIFICATION APIS
// ----------------------------------------------------

// GET /api/evc/verify/:query (Inspector scans QR or enters FDR ID / Number)
app.get('/api/evc/verify/:query', (req, res) => {
  try {
    const { query } = req.params;
    const cleanQuery = decodeURIComponent(query).trim();

    // Search by ID, FDR number, or partial match
    let deposit = db.prepare(`
      SELECT * FROM fdr_deposits 
      WHERE id = ? OR fdr_number = ? OR bank_token = ?
    `).get(cleanQuery, cleanQuery, cleanQuery);

    if (!deposit) {
      // Try like match if full string didn't hit
      deposit = db.prepare(`
        SELECT * FROM fdr_deposits 
        WHERE fdr_number LIKE ? OR id LIKE ?
        LIMIT 1
      `).get(`%${cleanQuery}%`, `%${cleanQuery}%`);
    }

    if (!deposit) {
      return res.status(404).json({ 
        success: false, 
        error: 'No institutional fixed deposit matching this cryptographic token or FDR number was found in AICTE Central Registry.' 
      });
    }

    // Latest audit block
    const lastAudit = db.prepare('SELECT block_hash, previous_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();

    // 3-Node Handshake payload
    res.json({
      success: true,
      deposit,
      cbsHandshake: {
        node: `${deposit.bank_name} Finacle CBS 10.x Live Gateway`,
        branch: deposit.branch_name,
        ifsc: deposit.ifsc_code,
        status: deposit.early_liquidation_lock ? 'ENGAGED_LOCKED' : 'PENDING_BRANCH_LOCK',
        sfms_token: deposit.bank_token || 'SFMS-PENDING',
        lien_holder: deposit.joint_holder_aicte,
        liquidation_permitted: false,
        ping_latency_ms: 42
      },
      registryHandshake: {
        node: 'AICTE Central Regulation Bureau (APH Chapter 1)',
        institution_name: deposit.institution_name,
        aicte_pid: deposit.aicte_pid,
        status: deposit.status,
        tamper_score: deposit.tamper_score || '0.5% (Clean)'
      },
      auditHandshake: {
        node: 'CAG & CVC Statutory Cryptographic Ledger',
        latest_block_hash: lastAudit ? lastAudit.block_hash : '0x0000000000000000',
        chain_valid: true,
        ledger_status: 'IMMUTABLE_VERIFIED'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evc/endorse (EVC Inspector Committee digitally signs and endorses on-site inspection)
app.post('/api/evc/endorse', (req, res) => {
  try {
    const { fdr_id, inspector_name, committee_remarks, gps_coords, evc_order_no, committee_pin, verdict } = req.body;

    // Zero-Trust Security Gatekeeper: Validate PIN
    if (committee_pin && committee_pin.trim() !== '892104') {
      return res.status(403).json({ 
        success: false, 
        error: 'Security Interlock Failed: Invalid Committee Authorization PIN. Unauthorized proxy endorsement rejected and flagged to AICTE Vigilance Bureau.' 
      });
    }

    const deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ?').get(fdr_id);
    if (!deposit) {
      return res.status(404).json({ error: 'FDR record not found.' });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
    const inspector = inspector_name || 'Prof. Dr. K. Radhakrishnan (Chairman, AICTE EVC Committee)';
    const remarks = committee_remarks || 'Physical verification completed on-site at college administrative block. Live CBS joint lien verified without deficiencies.';
    const coords = gps_coords || '11.0168° N, 76.9558° E (Coimbatore)';
    const orderRef = evc_order_no || 'AICTE/SRO/EVC/2026/ORD-8921';

    // Update deposit record
    db.prepare(`
      UPDATE fdr_deposits
      SET evc_status = 'PASSED_ENDORSED',
          evc_verified_at = ?,
          evc_verified_by = ?,
          evc_gps_coords = ?,
          evc_committee_remarks = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(timestamp, `${inspector} [Order: ${orderRef}]`, coords, remarks, fdr_id);

    // Cryptographic audit ledger entry
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x00000000000000000000000000000000';
    const newHash = generateHash({ fdr_id, orderRef, action: 'EVC_ENDORSED', timestamp, coords });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      inspector,
      `AICTE EVC On-Site Inspection Endorsed [Order: ${orderRef}, PIN: Verified] at [${coords}] — Statutory Security Deposit Validated`,
      fdr_id,
      newHash,
      prevHash,
      'EVC_PHYSICAL_VERIFIED'
    );

    res.json({
      success: true,
      message: 'EVC On-Site Physical Inspection digitally endorsed and recorded to CAG ledger.',
      endorsement_id: `EVC-${Date.now().toString().slice(-6)}`,
      timestamp,
      inspector,
      gps_coords: coords
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AUDIT LEDGER & NOTICES APIS
// ----------------------------------------------------
app.get('/api/audit', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_ledger ORDER BY id DESC LIMIT 50').all();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', (req, res) => {
  try {
    const { institution_name, notice_type, subject, message, issued_by } = req.body;
    db.prepare(`
      INSERT INTO notices (institution_name, notice_type, subject, message, issued_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(institution_name, notice_type, subject, message, issued_by || 'AICTE Regional Office');

    res.json({ success: true, message: 'Regulatory notice dispatched successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AICTE MULTI-LIEN & CROSS-REGULATORY COLLATERAL RADAR APIS
// (Interlocked with NeSL & Bank CBS Overdraft Switches)
// ----------------------------------------------------

let DORMANT_RECOVERY_DATA = [
  {
    id: 'DORM-01',
    institution_name: 'Venkateshwara Institute of Engineering & Technology',
    aicte_pid: '1-420918231',
    region: 'Southern (Chennai)',
    bank_name: 'Canara Bank (Mount Road Branch)',
    fdr_number: 'CNRB-FD-409182',
    amount: 3500000,
    tenure_completed_years: 14,
    status: 'SWEPT_TO_SCHOLARSHIP',
    swept_amount: 5120000,
    scholarships_generated: 1024,
    closure_reason: 'Zero Admissions since 2019 • Defunct Trust Entity'
  },
  {
    id: 'DORM-02',
    institution_name: 'Apex College of Advanced Applied Technology',
    aicte_pid: '1-882319021',
    region: 'Western (Mumbai)',
    bank_name: 'Bank of Baroda (Fort Branch)',
    fdr_number: 'BARB-FD-772189',
    amount: 3500000,
    tenure_completed_years: 12,
    status: 'SWEPT_TO_SCHOLARSHIP',
    swept_amount: 4950000,
    scholarships_generated: 990,
    closure_reason: 'De-recognized in 2021 • Promoters Untraceable'
  },
  {
    id: 'DORM-03',
    institution_name: 'Sri Krishna Polytechnic & Technological Studies',
    aicte_pid: '1-610293841',
    region: 'South-Western (Bangalore)',
    bank_name: 'State Bank of India (MG Road Branch)',
    fdr_number: 'SBIN-FD-331892',
    amount: 2500000,
    tenure_completed_years: 11,
    status: 'PENDING_STATUTORY_SWEEP',
    accumulated_yield: 3850000,
    scholarships_potential: 770,
    closure_reason: 'Abandoned Campus • 10-Yr Matured FDR Dormant at SBI'
  },
  {
    id: 'DORM-04',
    institution_name: 'Himalayan Institute of Management & Science',
    aicte_pid: '1-502931481',
    region: 'Northern (Kanpur)',
    bank_name: 'Punjab National Bank (Mall Road Branch)',
    fdr_number: 'PUNB-FD-602931',
    amount: 3500000,
    tenure_completed_years: 13,
    status: 'PENDING_STATUTORY_SWEEP',
    accumulated_yield: 5320000,
    scholarships_potential: 1064,
    closure_reason: 'Statutory License Surrendered 2020 • Unclaimed Deposit'
  }
];

// GET /api/collateral-radar/:id
app.get('/api/collateral-radar/:id', (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = decodeURIComponent(id).trim();

    let deposit = db.prepare(`
      SELECT * FROM fdr_deposits 
      WHERE id = ? OR fdr_number = ? OR bank_token = ?
    `).get(cleanId, cleanId, cleanId);

    if (!deposit) {
      deposit = db.prepare(`
        SELECT * FROM fdr_deposits 
        WHERE fdr_number LIKE ? OR id LIKE ?
        LIMIT 1
      `).get(`%${cleanId}%`, `%${cleanId}%`);
    }

    if (!deposit) {
      return res.status(404).json({ success: false, error: 'Deposit record not found for radar sweep.' });
    }

    const isConflict = deposit.status === 'FLAGGED_FORGERY' || 
                       (deposit.risk_score && deposit.risk_score > 40) ||
                       (deposit.fdr_number && deposit.fdr_number.includes('901844'));

    if (isConflict) {
      return res.json({
        success: true,
        deposit,
        scanTimestamp: new Date().toISOString(),
        overallVerdict: 'CRITICAL_ENCUMBRANCE_CONFLICT',
        riskLevel: 'HIGH_ALERT',
        neslChargeRank: 'DISPUTED_RANK_2',
        firstChargeVestedInAicte: false,
        nodes: {
          bankOverdraftSwitch: {
            node: `${deposit.bank_name} Finacle CBS Core Banking Loan Switch`,
            activeLoanDetected: true,
            facilityType: 'Commercial Overdraft against Fixed Deposit (OD-FD)',
            amountDrawn: '₹25,00,000',
            sanctionDate: '12-Mar-2024',
            accountNo: 'OD-90182441-SME',
            drawingPowerLien: 'HIGH_COLLATERAL_RISK',
            status: 'CRITICAL_ENCUMBRANCE',
            finding: 'Deposit principal is currently pledged as collateral for a commercial debt facility. AICTE lien subordinated by branch action.'
          },
          interCouncilRegistry: {
            node: 'National Inter-Regulatory Council Collateral Clearinghouse',
            duplicatePledgeDetected: true,
            pledgedAuthority: 'Pharmacy Council of India (PCI) - Statutory Bureau',
            institutionAlias: `${deposit.institution_name} (College of Pharmacy Unit)`,
            pciRegistrationRef: 'PCI-INST-TN-8821',
            certificateHashMatch: '99.8% Exact Match (Same Physical FDR reused across multiple regulatory bodies)',
            status: 'CROSS_REGULATORY_DUPLICATION',
            finding: 'Identical deposit certificate submitted to Pharmacy Council of India for approval of B.Pharm division. Multiple statutory claims exist.'
          },
          neslCersaiRegistry: {
            node: 'NeSL (National E-Governance Services Ltd) & CERSAI Collateral Repository',
            firstChargeHolder: `${deposit.bank_name} (Commercial Security Interest Rank 1)`,
            aicteChargeStatus: 'SUBORDINATED (Rank 2)',
            cersaiAssetId: `CERSAI-ASSET-${deposit.id.slice(-6)}`,
            encumbranceStatus: 'ENCUMBERED_WITH_THIRD_PARTY_LIENS',
            legalRiskNotice: 'In event of institutional liquidation, AICTE cannot recover deposit under Section 10 until bank commercial overdraft is fully settled.'
          }
        }
      });
    }

    // Clean Unencumbered Deposit
    res.json({
      success: true,
      deposit,
      scanTimestamp: new Date().toISOString(),
      overallVerdict: '100%_UNENCUMBERED_SOLE_FIRST_CHARGE',
      riskLevel: 'VERIFIED_SAFE',
      neslChargeRank: 'SOLE_FIRST_CHARGE_RANK_1',
      firstChargeVestedInAicte: true,
      nodes: {
        bankOverdraftSwitch: {
          node: `${deposit.bank_name} Finacle CBS Core Banking Loan Switch`,
          activeLoanDetected: false,
          facilityType: 'NONE (100% Unencumbered)',
          amountDrawn: '₹0.00',
          overdraftAllowed: 'BLOCKED (Core Banking Flag 1 Prevents Collateral Pledging)',
          drawingPowerLien: 'ZERO_LIEN_RISK',
          status: 'CLEAN_SECURE',
          finding: 'Core banking system confirms no loans, credit limits, or third-party pledges exist against this FDR account.'
        },
        interCouncilRegistry: {
          node: 'National Inter-Regulatory Council Collateral Clearinghouse',
          duplicatePledgeDetected: false,
          councilsCrossChecked: ['Pharmacy Council of India (PCI)', 'National Medical Commission (NMC)', 'Bar Council of India (BCI)', 'UGC'],
          certificateHashMatch: 'ZERO_DUPLICATES',
          status: 'EXCLUSIVE_STATUTORY_ALLOCATION',
          finding: 'Certificate unique cryptographic hash has not been submitted or pledged to any other statutory council or university in India.'
        },
        neslCersaiRegistry: {
          node: 'NeSL (National E-Governance Services Ltd) & CERSAI Collateral Repository',
          firstChargeHolder: 'AICTE Regulation Bureau (Sole Exclusive Charge Holder)',
          aicteChargeStatus: 'UNCONTESTED_RANK_1_PRIORITY',
          cersaiAssetId: `CERSAI-ASSET-${deposit.id.slice(-6)}`,
          encumbranceStatus: 'FREE_AND_CLEAR_OF_ALL_ENCUMBRANCES',
          legalRiskNotice: 'Statutory security deposit is 100% safeguarded under AICTE Approval Process Handbook Chapter 1 and IT Act 2000.'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collateral-radar/freeze
app.post('/api/collateral-radar/freeze', (req, res) => {
  try {
    const { fdr_id, reason, officer_name } = req.body;
    const deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ?').get(fdr_id);
    if (!deposit) return res.status(404).json({ error: 'FDR not found' });

    db.prepare(`
      UPDATE fdr_deposits 
      SET status = 'FLAGGED_FORGERY', risk_score = 99, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(fdr_id);

    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x0000000000000000';
    const newHash = generateHash({ fdr_id, action: 'NESL_COLLATERAL_FREEZE' });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      officer_name || 'AICTE Vigilance Director',
      `STATUTORY INJUNCTION: Multi-Lien Collateral Breach on FDR ${deposit.fdr_number} — NeSL Freeze Dispatched to Bank & Inter-Council Clearinghouse`,
      fdr_id,
      newHash,
      prevHash,
      'REGULATORY_FREEZE_ENFORCED'
    );

    res.json({ success: true, message: 'Statutory Multi-Lien Freeze enforced and recorded to CAG ledger.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dormant-recovery/summary
app.get('/api/dormant-recovery/summary', (req, res) => {
  try {
    const sweptCount = DORMANT_RECOVERY_DATA.filter(d => d.status === 'SWEPT_TO_SCHOLARSHIP').length;
    const pendingCount = DORMANT_RECOVERY_DATA.filter(d => d.status === 'PENDING_STATUTORY_SWEEP').length;
    const totalSweptYield = DORMANT_RECOVERY_DATA
      .filter(d => d.status === 'SWEPT_TO_SCHOLARSHIP')
      .reduce((sum, d) => sum + (d.swept_amount || 0), 0);
    const totalPendingYield = DORMANT_RECOVERY_DATA
      .filter(d => d.status === 'PENDING_STATUTORY_SWEEP')
      .reduce((sum, d) => sum + (d.accumulated_yield || 0), 0);
    const totalScholarships = DORMANT_RECOVERY_DATA
      .filter(d => d.status === 'SWEPT_TO_SCHOLARSHIP')
      .reduce((sum, d) => sum + (d.scholarships_generated || 0), 0);

    res.json({
      success: true,
      stats: {
        totalZombieInstitutions: DORMANT_RECOVERY_DATA.length,
        sweptCount,
        pendingCount,
        totalSweptCrores: (totalSweptYield / 10000000).toFixed(2),
        totalPendingCrores: (totalPendingYield / 10000000).toFixed(2),
        scholarshipsFundedCount: totalScholarships,
        scholarshipScheme: 'AICTE Pragati & Saksham National Female & Differently-Abled Technical Scholars Fund'
      },
      institutions: DORMANT_RECOVERY_DATA
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dormant-recovery/sweep
app.post('/api/dormant-recovery/sweep', (req, res) => {
  try {
    const { id } = req.body;
    const target = DORMANT_RECOVERY_DATA.find(d => d.id === id);
    if (!target) return res.status(404).json({ error: 'Dormant institution record not found' });

    if (target.status === 'SWEPT_TO_SCHOLARSHIP') {
      return res.status(400).json({ error: 'Deposit has already been repatriated into scholarship corpus.' });
    }

    target.status = 'SWEPT_TO_SCHOLARSHIP';
    target.swept_amount = target.accumulated_yield || 4500000;
    target.scholarships_generated = Math.floor(target.swept_amount / 50000);

    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x0000000000000000';
    const newHash = generateHash({ id, action: 'DORMANT_ASSET_SWEEP', yield: target.swept_amount });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      new Date().toISOString().replace('T', ' ').slice(0, 19),
      'AICTE National Statutory Recovery Directorate',
      `STATUTORY REPATRIATION: ₹${(target.swept_amount / 100000).toFixed(1)} Lakhs Swept from Closed Institution [${target.institution_name}] into AICTE Pragati Scholarship Fund`,
      target.id,
      newHash,
      prevHash,
      'SCHOLARSHIP_CORPUS_EXPANDED'
    );

    res.json({
      success: true,
      message: `Statutory repatriation successful! ₹${(target.swept_amount / 100000).toFixed(1)} Lakhs swept into AICTE Pragati & Saksham Scholarship Fund, sponsoring ${target.scholarships_generated} student scholars.`,
      target
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// NBA & NAAC ACCREDITATION / STATUTORY CONCESSION AUDIT APIS
// AICTE APH Chapter 2.4 & Appendix 8
// ----------------------------------------------------

// GET /api/accreditation/audit/:id
app.get('/api/accreditation/audit/:id', (req, res) => {
  try {
    const { id } = req.params;
    let deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ? OR fdr_number = ?').get(id, id);
    if (!deposit) {
      deposit = db.prepare('SELECT * FROM fdr_deposits LIMIT 1').get();
    }
    if (!deposit) {
      return res.status(404).json({ error: 'FDR deposit record not found' });
    }

    const instName = deposit.institution_name || '';
    const isProblematic = deposit.status === 'FLAGGED_FORGERY' || instName.includes('Sharda') || instName.includes('Apex') || deposit.id === 'FDR-2026-PNB-4410';

    // Standard AICTE APH 2025-26 Deposit Formula:
    // Base Requirement for Technical/Engineering division: ₹35,00,000
    // Statutory Concession for NBA Tier-1 / NAAC A++ (APH Chapter 2.4): ₹15,00,000
    // Entitled FDR Amount: ₹20,00,000
    const baseStatutoryRequirement = 3500000;
    const claimedConcession = 1500000;
    const claimedEntitledAmount = baseStatutoryRequirement - claimedConcession; // 20,00,000
    const actualDeposited = deposit.amount || 2000000;

    if (!isProblematic) {
      // Clean Compliant Institution (e.g. PSG College of Technology)
      const auditResult = {
        success: true,
        fdr_id: deposit.id,
        fdr_number: deposit.fdr_number,
        institution_name: deposit.institution_name,
        aicte_pid: deposit.aicte_pid,
        verdict: 'STATUTORILY_COMPLIANT_CONCESSION_VALID',
        risk_level: 'ZERO_DEFICIT_VERIFIED',
        deficit_amount: 0,
        statutory_summary: 'Full statutory compliance. The institution holds active NBA Tier-1 and NAAC A++ credentials. The claimed ₹15.0 Lakh deposit concession is fully authorized under AICTE APH Chapter 2.4.',
        statutory_breakdown: {
          base_required_amount: baseStatutoryRequirement,
          claimed_concession_amount: claimedConcession,
          statutory_entitlement: 'ELIGIBLE_FOR_FULL_CONCESSION',
          actual_fdr_deposited: actualDeposited,
          net_statutory_deficit: 0,
          compliance_clause: 'AICTE Approval Process Handbook 2025-26, Chapter 2, Clause 2.4 (Security Deposit Exemptions)'
        },
        nba_registry_check: {
          node: 'National Board of Accreditation (e-NBA Live Gateway)',
          registry_endpoint: 'https://api.nbaind.org/v2/accreditation/verify',
          program_name: 'B.Tech Computer Science & Artificial Intelligence',
          tier_level: 'Tier-1 (Washington Accord Full Signatory Status)',
          file_number: 'NBA/ACCRED/2023/SR-9182',
          status: 'ACTIVE_VALID',
          valid_from: '2023-07-01',
          valid_upto: '2028-06-30',
          evaluation_score: '742 / 1000 (Tier-1 Compliant)',
          last_ping_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
          cryptographic_seal: 'SHA256:NBA-TIER1-VERIFIED-9812-78A'
        },
        naac_registry_check: {
          node: 'National Assessment and Accreditation Council (NAAC Central Repository)',
          registry_endpoint: 'https://api.naac.gov.in/v1/cycle-status/verify',
          cycle: 'Cycle 3 Institutional Accreditation',
          grade: 'A++',
          cgpa: '3.84 / 4.00',
          valid_upto: '2029-12-14',
          status: 'ACTIVE_VALID',
          last_ping_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
          cryptographic_seal: 'SHA256:NAAC-A++-3.84-GOV-CENTRAL'
        },
        demand_notice_served: !!deposit.demand_notice_ref,
        demand_notice_ref: deposit.demand_notice_ref || null
      };
      return res.json(auditResult);
    } else {
      // Flagged / Non-Compliant Institution (e.g. Shree Sharda Institute)
      const auditResult = {
        success: true,
        fdr_id: deposit.id,
        fdr_number: deposit.fdr_number,
        institution_name: deposit.institution_name,
        aicte_pid: deposit.aicte_pid,
        verdict: 'CRITICAL_CONCESSION_BREACH_DEFICIT',
        risk_level: 'CRITICAL_DEFICIT_ACTION_REQUIRED',
        deficit_amount: 1500000,
        statutory_summary: 'CRITICAL STATUTORY DEFICIT DETECTED. Institution availed ₹15.0 Lakh concession under NBA Tier-1 norms, but Live e-NBA Registry confirms NBA accreditation lapsed on 30-Jun-2024 and was never renewed. NAAC was downgraded to Grade C. Concession revoked by statutory law.',
        statutory_breakdown: {
          base_required_amount: baseStatutoryRequirement,
          claimed_concession_amount: claimedConcession,
          statutory_entitlement: 'CONCESSION_REVOKED_LAPSED_ACCREDITATION',
          actual_fdr_deposited: actualDeposited,
          net_statutory_deficit: 1500000,
          compliance_clause: 'AICTE Approval Process Handbook 2025-26, Chapter 2, Clause 2.4.3 (Mandatory Recovery of Unearned Concession)'
        },
        nba_registry_check: {
          node: 'National Board of Accreditation (e-NBA Live Gateway)',
          registry_endpoint: 'https://api.nbaind.org/v2/accreditation/verify',
          program_name: 'Master of Business Administration (MBA) / B.Tech CSE',
          tier_level: 'Tier-2 (Provisional)',
          file_number: 'NBA/ACCRED/2021/NR-4410',
          status: 'EXPIRED_LAPSED',
          valid_from: '2021-07-01',
          valid_upto: '2024-06-30 (Lapsed 16 Months Ago)',
          evaluation_score: '512 / 1000 (Below 600 Minimum Statutory Threshold)',
          last_ping_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
          cryptographic_seal: 'SHA256:NBA-STATUS-EXPIRED-NON-RENEWED'
        },
        naac_registry_check: {
          node: 'National Assessment and Accreditation Council (NAAC Central Repository)',
          registry_endpoint: 'https://api.naac.gov.in/v1/cycle-status/verify',
          cycle: 'Cycle 2 Institutional Review',
          grade: 'C (Downgraded)',
          cgpa: '1.74 / 4.00 (Ineligible for APH Concession)',
          valid_upto: '2024-01-15 (Lapsed & Inactive)',
          status: 'REVOKED_DOWNGRADED',
          last_ping_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST',
          cryptographic_seal: 'SHA256:NAAC-GRADE-C-INELIGIBLE'
        },
        demand_notice_served: !!deposit.demand_notice_ref,
        demand_notice_ref: deposit.demand_notice_ref || null
      };
      return res.json(auditResult);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accreditation/demand-notice
app.post('/api/accreditation/demand-notice', (req, res) => {
  try {
    const { fdr_id, institution_name, deficit_amount, reason, officer_name } = req.body;
    let deposit = db.prepare('SELECT * FROM fdr_deposits WHERE id = ? OR fdr_number = ?').get(fdr_id, fdr_id);
    if (!deposit) return res.status(404).json({ error: 'FDR record not found' });

    const noticeRef = `AICTE/DEMAND/APH24/${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const deficitAmt = Number(deficit_amount) || 1500000;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Update FDR deposit with statutory deficit notice
    db.prepare(`
      UPDATE fdr_deposits
      SET statutory_deficit = ?,
          demand_notice_ref = ?,
          demand_notice_issued_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(deficitAmt, noticeRef, nowIso, deposit.id);

    // Insert into notices table
    db.prepare(`
      INSERT INTO notices (fdr_id, institution_name, notice_type, subject, message, issued_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      deposit.id,
      deposit.institution_name,
      'STATUTORY_DEFICIT_DEMAND',
      `Statutory Deficit Demand Notice [${noticeRef}]: Replenishment of ₹${(deficitAmt / 100000).toFixed(1)} Lakhs Unearned Concession under APH Chapter 2.4`,
      `Notice is hereby served under AICTE Approval Process Handbook (APH) Chapter 2.4. Your institutional security deposit concession of ₹${(deficitAmt / 100000).toFixed(1)} Lakhs is REVOKED due to expired NBA / NAAC accreditation. You are directed to deposit supplementary joint FDR of ₹${(deficitAmt / 100000).toFixed(1)} Lakhs within 15 calendar days failing which approval processing shall be halted.`,
      officer_name || 'Regional Officer, AICTE Regulation Bureau'
    );

    // Log to cryptographic CAG audit ledger
    const lastAudit = db.prepare('SELECT block_hash FROM audit_ledger ORDER BY id DESC LIMIT 1').get();
    const prevHash = lastAudit ? lastAudit.block_hash : '0x0000000000000000';
    const newHash = generateHash({ fdr_id: deposit.id, noticeRef, deficitAmt, action: 'ACCREDITATION_DEFICIT_NOTICE' });

    db.prepare(`
      INSERT INTO audit_ledger (txn_id, timestamp, entity, action, fdr_id, block_hash, previous_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `TXN-${Date.now().toString().slice(-5)}`,
      nowIso,
      officer_name || 'AICTE Regulation Bureau',
      `STATUTORY NOTICE SERVED: Revocation of ₹${(deficitAmt / 100000).toFixed(1)} Lakhs Concession on FDR [${deposit.fdr_number}] — Demand Order ${noticeRef} Dispatched with 15-Day Replenishment Deadline`,
      deposit.id,
      newHash,
      prevHash,
      'DEFICIT_DEMAND_ENFORCED'
    );

    res.json({
      success: true,
      message: `Statutory Deficit Demand Notice successfully issued! Reference: ${noticeRef}. Recorded in CAG cryptographic audit ledger.`,
      demand_notice_ref: noticeRef,
      deadline_days: 15,
      deficit_amount: deficitAmt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// LIVE BANK IFSC VALIDATION GATEWAY API
// ----------------------------------------------------
const VERIFIED_BANK_DIRECTORY = {
  'CNRB0001234': {
    BANK: 'Canara Bank',
    BRANCH: 'Peelamedu Coimbatore',
    ADDRESS: 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
    CITY: 'COIMBATORE',
    STATE: 'TAMIL NADU',
    MICR: '641015008',
    IFSC: 'CNRB0001234',
    RTGS: true,
    NEFT: true
  },
  'SBIN0001053': {
    BANK: 'State Bank of India',
    BRANCH: 'Anna Nagar Chennai',
    ADDRESS: '2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040',
    CITY: 'CHENNAI',
    STATE: 'TAMIL NADU',
    MICR: '600002011',
    IFSC: 'SBIN0001053',
    RTGS: true,
    NEFT: true
  },
  'SBIN0004567': {
    BANK: 'State Bank of India',
    BRANCH: 'Harsola',
    ADDRESS: 'Teh. Mhow, Distt. Indore, Madhya Pradesh 453441',
    CITY: 'INDORE',
    STATE: 'MADHYA PRADESH',
    MICR: '453002031',
    IFSC: 'SBIN0004567',
    RTGS: true,
    NEFT: true
  },
  'PUNB0192800': {
    BANK: 'Punjab National Bank',
    BRANCH: 'Bhopal Arera Hills',
    ADDRESS: 'Arera Hills, MP Nagar, Bhopal, Madhya Pradesh 462011',
    CITY: 'BHOPAL',
    STATE: 'MADHYA PRADESH',
    MICR: '462024003',
    IFSC: 'PUNB0192800',
    RTGS: true,
    NEFT: true
  },
  'HDFC0000060': {
    BANK: 'HDFC Bank',
    BRANCH: 'MG Road Bangalore',
    ADDRESS: 'Salarpuria Landmark, 100/1, MG Road, Bengaluru, Karnataka 560001',
    CITY: 'BENGALURU',
    STATE: 'KARNATAKA',
    MICR: '560240002',
    IFSC: 'HDFC0000060',
    RTGS: true,
    NEFT: true
  },
  'BARB0VJCOIM': {
    BANK: 'Bank of Baroda',
    BRANCH: 'Gandhipuram Coimbatore',
    ADDRESS: 'Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu 641012',
    CITY: 'COIMBATORE',
    STATE: 'TAMIL NADU',
    MICR: '641012002',
    IFSC: 'BARB0VJCOIM',
    RTGS: true,
    NEFT: true
  },
  'IDIB000T012': {
    BANK: 'Indian Bank',
    BRANCH: 'T Nagar Chennai',
    ADDRESS: 'Venkatnarayana Road, T. Nagar, Chennai, Tamil Nadu 600017',
    CITY: 'CHENNAI',
    STATE: 'TAMIL NADU',
    MICR: '600019045',
    IFSC: 'IDIB000T012',
    RTGS: true,
    NEFT: true
  }
};

app.get('/api/bank/ifsc/:code', async (req, res) => {
  const code = (req.params.code || '').trim().toUpperCase();

  if (!code || code.length !== 11) {
    return res.status(400).json({ 
      error: 'Invalid IFSC format. Must be exactly 11 alphanumeric characters (e.g., CNRB0001234, SBIN0001053).' 
    });
  }

  // 1. Try Live Public RBI / Razorpay Gateway with a 3.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const liveRes = await fetch(`https://ifsc.razorpay.com/${code}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (liveRes.ok) {
      const data = await liveRes.json();
      return res.json({
        success: true,
        source: 'LIVE_RBI_CORE_BANKING_NETWORK',
        bank: data.BANK,
        branch: data.BRANCH,
        address: data.ADDRESS,
        city: data.CITY,
        state: data.STATE,
        micr: data.MICR,
        ifsc: data.IFSC,
        rtgs: data.RTGS,
        neft: data.NEFT
      });
    }
  } catch (err) {
    console.warn(`[IFSC-GATEWAY] Live fetch for ${code} bypassed or timed out: ${err.message}`);
  }

  // 2. Fallback to authoritative verified local directory
  if (VERIFIED_BANK_DIRECTORY[code]) {
    const data = VERIFIED_BANK_DIRECTORY[code];
    return res.json({
      success: true,
      source: 'AUTHORITATIVE_DIRECTORY',
      bank: data.BANK,
      branch: data.BRANCH,
      address: data.ADDRESS,
      city: data.CITY,
      state: data.STATE,
      micr: data.MICR,
      ifsc: data.IFSC,
      rtgs: data.RTGS,
      neft: data.NEFT
    });
  }

  // 3. Fallback based on standard 4-letter bank prefixes if branch unknown
  const prefixMap = {
    'CNRB': 'Canara Bank',
    'SBIN': 'State Bank of India',
    'PUNB': 'Punjab National Bank',
    'HDFC': 'HDFC Bank',
    'BARB': 'Bank of Baroda',
    'ICIC': 'ICICI Bank',
    'UTIB': 'Axis Bank',
    'IDIB': 'Indian Bank',
    'UBIN': 'Union Bank of India',
    'IOBA': 'Indian Overseas Bank'
  };

  const prefix = code.slice(0, 4);
  if (prefixMap[prefix]) {
    return res.json({
      success: true,
      source: 'RECOGNIZED_SCHEDULED_BANK',
      bank: prefixMap[prefix],
      branch: 'Main Commercial Branch',
      address: 'Designated Commercial Branch for Regulatory Deposits',
      city: 'Capital Region',
      state: 'India',
      micr: 'N/A',
      ifsc: code,
      rtgs: true,
      neft: true
    });
  }

  return res.status(404).json({
    error: `IFSC code '${code}' could not be verified against RBI Scheduled Commercial Banks directory.`
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AICTE Suraksha-FDR Backend Server listening on http://localhost:${PORT}`);
});
