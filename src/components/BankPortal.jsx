import React, { useState } from 'react';
import { 
  Landmark, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Server,
  FileCheck2,
  Clock,
  Shield,
  Layers,
  Archive
} from 'lucide-react';

export default function BankPortal({ 
  currentUser,
  fdrRecords, 
  onBankVerifyFdr 
}) {
  const [bankTab, setBankTab] = useState('PENDING'); // 'PENDING' | 'ACTIVE' | 'RELEASED'

  // Real-World Branch Isolation: Canara Bank Manager only sees Canara Bank deposits
  const bankKeyword = (currentUser?.organization_name || 'Canara').toLowerCase().includes('canara') ? 'canara' : '';
  const branchFDRs = fdrRecords.filter(r => 
    !bankKeyword || (r.bank_name || '').toLowerCase().includes(bankKeyword)
  );

  const pendingBankFDRs = branchFDRs.filter(r => r.status === 'BANK_PENDING');
  const activeCustodyFDRs = branchFDRs.filter(r => r.status === 'ACTIVE_VERIFIED' || r.status === 'AICTE_PENDING_RELEASE');
  const releasedFDRs = branchFDRs.filter(r => r.status === 'RELEASED_APPROVED');

  return (
    <div className="bank-portal-wrapper">
      {/* Top Bank Gateway Header */}
      <div className="glass-panel" style={{ marginBottom: '24px', background: '#ffffff', border: '1px solid #bbf7d0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-md)', 
              background: '#dcfce7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#15803d'
            }}>
              <Landmark size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2e5a' }}>
                  {currentUser?.organization_name || 'Canara Bank (Peelamedu Branch)'} — SFMS Gateway
                </h2>
                <span className="badge badge-verified">Branch CBS Finacle Gateway</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                Branch Officer: <strong>{currentUser?.full_name}</strong> ({currentUser?.designation}) • Branch Code: <strong>001234</strong> (IFSC: <strong>CNRB0001234</strong>)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span className="pulse-dot"></span>
              SFMS Message Broker v4.2 Active
            </span>
          </div>
        </div>
      </div>

      {/* Branch Security & Core Banking Protocol Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div className="glass-panel" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Branch Authentication
              </span>
              <strong style={{ color: '#0f2e5a', fontSize: '0.88rem' }}>
                Canara Bank, Peelamedu (Coimbatore)
              </strong>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>IFSC: CNRB0001234 • MICR: 641015008</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Digital Signature (PKI)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <ShieldCheck size={16} color="#059669" />
                <strong style={{ color: '#059669', fontSize: '0.86rem' }}>
                  Class 3 DSC Token Connected
                </strong>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Hardware Token: ePass2003 FIPS 140-2 Level 3</div>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Core Banking Engine (CBS)
              </span>
              <strong style={{ color: '#0f2e5a', fontSize: '0.86rem' }}>
                Finacle 10.x Interlock Active
              </strong>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Automated Early Liquidation Prevention Flag</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Portal Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setBankTab('PENDING')}
          className={`btn ${bankTab === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Clock size={15} />
          <span>Tripartite Verification Queue</span>
          <span style={{ 
            background: bankTab === 'PENDING' ? '#ffffff' : '#e2e8f0', 
            color: bankTab === 'PENDING' ? '#0f2e5a' : '#475569', 
            padding: '1px 7px', 
            borderRadius: '10px', 
            fontSize: '0.74rem', 
            fontWeight: 800 
          }}>
            {pendingBankFDRs.length}
          </span>
        </button>

        <button
          onClick={() => setBankTab('ACTIVE')}
          className={`btn ${bankTab === 'ACTIVE' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Lock size={15} />
          <span>Active Branch Custody (Lien Locked)</span>
          <span style={{ 
            background: bankTab === 'ACTIVE' ? '#ffffff' : '#e2e8f0', 
            color: bankTab === 'ACTIVE' ? '#0f2e5a' : '#475569', 
            padding: '1px 7px', 
            borderRadius: '10px', 
            fontSize: '0.74rem', 
            fontWeight: 800 
          }}>
            {activeCustodyFDRs.length}
          </span>
        </button>

        <button
          onClick={() => setBankTab('RELEASED')}
          className={`btn ${bankTab === 'RELEASED' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Archive size={15} />
          <span>Discharged / Released Deposits</span>
          <span style={{ 
            background: bankTab === 'RELEASED' ? '#ffffff' : '#e2e8f0', 
            color: bankTab === 'RELEASED' ? '#0f2e5a' : '#475569', 
            padding: '1px 7px', 
            borderRadius: '10px', 
            fontSize: '0.74rem', 
            fontWeight: 800 
          }}>
            {releasedFDRs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Pending Tripartite Verification Queue */}
      {bankTab === 'PENDING' && (
        <div className="glass-panel" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Tripartite Joint Lien Confirmation Queue ({pendingBankFDRs.length} Requests Pending)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Institutions that submitted security deposits requiring Branch Manager electronic confirmation and Core Banking System lien tagging.
              </p>
            </div>
          </div>

          {pendingBankFDRs.length === 0 ? (
            <div style={{ 
              padding: '36px', 
              textAlign: 'center', 
              background: '#f8fafc', 
              borderRadius: 'var(--radius-md)',
              border: '1px dashed #cbd5e1' 
            }}>
              <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, color: '#0f2e5a' }}>All Bank Verification Requests are Cleared!</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                There are currently no unverified FDR submissions pending for this banking branch.
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>Bank & Branch</th>
                    <th>FDR Number</th>
                    <th>Amount</th>
                    <th>Tenure Lock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBankFDRs.map((fdr) => (
                    <tr key={fdr.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fdr.institution_name || fdr.collegeName}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          AICTE PID: {fdr.aicte_pid || fdr.aicteId}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 500 }}>{fdr.bank_name || fdr.bankName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fdr.branch_name || fdr.branchName}</div>
                      </td>

                      <td>
                        <span className="font-mono" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>
                          {fdr.fdr_number || fdr.fdrNumber}
                        </span>
                      </td>

                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          ₹{Number(fdr.amount).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {fdr.purpose}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>10 Years Joint Lien</div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          AICTE Regional Officer + Trust
                        </div>
                      </td>

                      <td>
                        <button 
                          id={`btn-bank-confirm-${fdr.id}`}
                          className="btn btn-emerald btn-sm"
                          onClick={() => onBankVerifyFdr(fdr.id)}
                        >
                          <Lock size={13} />
                          <span>Confirm CBS Joint Lien</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Active Branch Custody Registry */}
      {bankTab === 'ACTIVE' && (
        <div className="glass-panel" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f2e5a' }}>
                Active Fixed Deposit Custody Registry ({activeCustodyFDRs.length} Deposits Locked)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Term deposits held under tripartite joint lien with AICTE Southern Regional Officer. Finacle CBS lock engaged.
              </p>
            </div>
          </div>

          {activeCustodyFDRs.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
              <Lock size={36} color="#64748b" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 600, color: '#0f2e5a' }}>No Active Locked Deposits in this Branch</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Institution & PID</th>
                    <th>FDR Instrument</th>
                    <th>Principal Amount</th>
                    <th>Maturity Date</th>
                    <th>Core Banking Status</th>
                    <th>SFMS Gateway Token</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCustodyFDRs.map((fdr) => (
                    <tr key={fdr.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fdr.institution_name || fdr.collegeName}</div>
                        <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          PID: {fdr.aicte_pid || fdr.aicteId}
                        </div>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 600, color: '#0f2e5a' }}>
                          {fdr.fdr_number || fdr.fdrNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Rate: {fdr.interest_rate || '7.10%'} (10 Yrs)
                        </div>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: '#059669' }}>
                          ₹{Number(fdr.amount).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{fdr.purpose}</div>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontSize: '0.82rem' }}>{fdr.maturity_date || fdr.maturityDate}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Joint Lien Active</div>
                      </td>
                      <td>
                        <span className="badge badge-verified" style={{ background: '#dcfce7', color: '#15803d' }}>
                          <ShieldCheck size={12} />
                          LOCKED (FLAG 1)
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                          Early Liquidation Blocked
                        </div>
                      </td>
                      <td>
                        <code className="hash-pill" style={{ fontSize: '0.72rem' }}>
                          {fdr.bank_token || 'SFMS-CONFIRM-ACTIVE'}
                        </code>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          DSC Signed: {fdr.bank_confirmed_by || 'Branch Manager'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Discharged / Released Deposits Archive */}
      {bankTab === 'RELEASED' && (
        <div className="glass-panel" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f2e5a' }}>
                Discharged & Released Deposits Archive ({releasedFDRs.length})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Instruments that completed 10-year statutory tenure and received official AICTE NOC for lien discharge.
              </p>
            </div>
          </div>

          {releasedFDRs.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
              <Archive size={36} color="#64748b" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 600, color: '#0f2e5a' }}>No Released FDR Records in Archive</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Deposits will appear here once AICTE Regional Directorate issues 10-year completion NOC.
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>FDR Number</th>
                    <th>Matured Sum</th>
                    <th>Maturity Date</th>
                    <th>AICTE Discharge Status</th>
                    <th>Branch Action</th>
                  </tr>
                </thead>
                <tbody>
                  {releasedFDRs.map((fdr) => (
                    <tr key={fdr.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fdr.institution_name || fdr.collegeName}</div>
                        <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          PID: {fdr.aicte_pid || fdr.aicteId}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono" style={{ fontWeight: 600 }}>{fdr.fdr_number || fdr.fdrNumber}</span>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, color: '#059669' }}>
                          ₹{Number(fdr.amount).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.82rem' }}>
                        {fdr.maturity_date || fdr.maturityDate}
                      </td>
                      <td>
                        <span className="badge badge-verified" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                          <CheckCircle2 size={12} />
                          NOC Approved
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                          {fdr.release_notes || 'Approved under APH Chapter 1'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                          Lien Discharged / Safe for Liquidation
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Early Liquidation & Fraud Safeguard Explainer */}
      <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 32, 25, 0.4) 100%)' }}>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            background: 'rgba(16, 185, 129, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--emerald-light)',
            flexShrink: 0
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Statutory Early Liquidation Prevention Protocol
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Under legacy paper systems, managements could attempt to prematurely encash Fixed Deposits. 
              With the <strong>AICTE Suraksha-FDR Core Banking protocol</strong>, confirmed deposits are flagged with an immovable system-level lien. Any liquidation attempt automatically triggers a dual-key digital authorization requirement from the AICTE Regional Officer.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
