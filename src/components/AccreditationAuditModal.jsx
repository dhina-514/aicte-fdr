import React, { useState, useEffect } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  Download, 
  ShieldCheck, 
  Building2, 
  RefreshCw,
  ExternalLink,
  Clock,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function AccreditationAuditModal({ fdr, onClose, onRefresh }) {
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [issuingNotice, setIssuingNotice] = useState(false);
  const [selectedFdrId, setSelectedFdrId] = useState(fdr?.id || 'FDR-2024-CAN-0891');
  const [allFdrs, setAllFdrs] = useState([]);

  // Fetch list of FDRs for quick selector
  useEffect(() => {
    fetch('/api/fdr')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.records) setAllFdrs(d.records);
      })
      .catch(console.error);
  }, []);

  // Fetch live accreditation audit for target FDR
  const fetchAudit = async (targetId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accreditation/audit/${targetId}`);
      const data = await res.json();
      setAuditData(data);
    } catch (err) {
      console.error('Failed to fetch accreditation audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFdrId) {
      fetchAudit(selectedFdrId);
    }
  }, [selectedFdrId]);

  // Issue Statutory Demand Notice
  const handleIssueDemandNotice = async () => {
    if (!auditData) return;
    setIssuingNotice(true);
    try {
      const res = await fetch('/api/accreditation/demand-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fdr_id: auditData.fdr_id,
          institution_name: auditData.institution_name,
          deficit_amount: auditData.deficit_amount || 1500000,
          officer_name: 'Dr. R. Sundaresan (Regional Officer & Director)'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue notice.');

      alert(`✅ Official Statutory Demand Notice Issued!\n\nReference: ${data.demand_notice_ref}\nReplenishment Deadline: ${data.deadline_days} Calendar Days\n\nEvent recorded to Cryptographic CAG Audit Ledger.`);
      
      // Refresh local audit & parent
      await fetchAudit(selectedFdrId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error issuing demand notice: ' + err.message);
    } finally {
      setIssuingNotice(false);
    }
  };

  // Download Statutory Demand Notice Letter / Compliance Certificate
  const handleDownloadNotice = () => {
    if (!auditData) return;
    const isDeficit = auditData.verdict === 'CRITICAL_CONCESSION_BREACH_DEFICIT';
    const title = isDeficit 
      ? `AICTE Statutory Deficit Demand Notice — ${auditData.fdr_number}`
      : `AICTE Accreditation Concession Compliance Certificate — ${auditData.fdr_number}`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .header { text-align: center; border-bottom: 3px double #0f2e5a; padding-bottom: 20px; margin-bottom: 24px; }
    .emblem { font-size: 20px; font-weight: bold; color: #b45309; }
    .title { font-size: 22px; font-weight: 800; color: #0f2e5a; margin: 4px 0; }
    .sub { font-size: 13px; color: #475569; }
    .status-box { 
      background: ${isDeficit ? '#fef2f2' : '#f0fdf4'}; 
      border: 1px solid ${isDeficit ? '#fca5a5' : '#86efac'}; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 20px 0; 
      font-size: 13px;
      color: ${isDeficit ? '#991b1b' : '#166534'};
    }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; color: #1e293b; width: 38%; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    .seal { border: 2px dashed #0f2e5a; padding: 10px; display: inline-block; font-weight: bold; color: #0f2e5a; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="emblem">सत्यमेव जयते</div>
    <div class="title">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</div>
    <div class="sub">Statutory Body under Ministry of Education, Govt. of India • Regulation Bureau</div>
    <div class="sub" style="font-weight: 700; margin-top: 6px; color: #0f2e5a;">
      APPROVAL PROCESS HANDBOOK (APH) CHAPTER 2, CLAUSE 2.4 — STATUTORY DEPOSIT CONCESSION ORDER
    </div>
  </div>

  <div class="status-box">
    <strong>ORDER NATURE:</strong> ${isDeficit ? '🚨 STATUTORY DEFICIT RECOVERY DEMAND ORDER' : '✅ STATUTORY CONCESSION ENTITLEMENT CERTIFICATE'}
    <br/>
    Reference: <strong>${auditData.demand_notice_ref || 'AICTE/CONCESSION/VERIFIED/' + auditData.fdr_id}</strong> • Date of Audit: <strong>${new Date().toLocaleDateString('en-IN')}</strong>
  </div>

  <table>
    <tr><th>Institution Legal Name</th><td><strong>${auditData.institution_name}</strong></td></tr>
    <tr><th>Permanent AICTE PID</th><td><code>${auditData.aicte_pid}</code></td></tr>
    <tr><th>Fixed Deposit Receipt ID / Number</th><td><strong>${auditData.fdr_number}</strong> (${auditData.fdr_id})</td></tr>
    <tr><th>Standard Statutory Deposit (APH Norm)</th><td><strong>₹35,00,000</strong> (35.0 Lakhs)</td></tr>
    <tr><th>Claimed Accreditation Concession</th><td><strong>₹15,00,000</strong> (15.0 Lakhs Discount)</td></tr>
    <tr><th>Actual FDR Pledged in Joint Custody</th><td><strong>₹${(auditData.statutory_breakdown?.actual_fdr_deposited || 2000000).toLocaleString('en-IN')}</strong></td></tr>
    <tr><th>Live National Board of Accreditation (NBA) Status</th><td>
      <strong>${auditData.nba_registry_check?.status}</strong> — Tier Level: ${auditData.nba_registry_check?.tier_level}<br/>
      <small>Validity: ${auditData.nba_registry_check?.valid_upto} • File: ${auditData.nba_registry_check?.file_number}</small>
    </td></tr>
    <tr><th>Live NAAC Accreditation Status</th><td>
      <strong>${auditData.naac_registry_check?.status}</strong> — Grade: ${auditData.naac_registry_check?.grade} (CGPA: ${auditData.naac_registry_check?.cgpa})
    </td></tr>
    <tr><th>Statutory Concession Entitlement</th><td>
      <strong style="color: ${isDeficit ? '#dc2626' : '#059669'};">
        ${isDeficit ? 'REVOKED & INVALIDATED (ACCREDITATION LAPSED)' : 'VALID & AUTHORIZED (APH COMPLIANT)'}
      </strong>
    </td></tr>
    <tr><th>Net Recoverable Statutory Deficit</th><td>
      <strong style="font-size: 16px; color: ${isDeficit ? '#dc2626' : '#059669'};">
        ₹${(auditData.deficit_amount || 0).toLocaleString('en-IN')}
      </strong>
    </td></tr>
    <tr><th>Directive / Legal Ruling</th><td>
      ${isDeficit 
        ? 'Under APH Chapter 2.4.3, the institution is directed to replenish the ₹15,00,000 unearned concession by submitting a supplementary joint FDR within 15 calendar days, failing which approval processing for the subsequent academic year shall stand withheld.'
        : 'The institution is fully eligible for the ₹15,00,000 statutory deposit concession under APH Chapter 2.4. Deposit stands unencumbered and verified.'}
    </td></tr>
  </table>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div class="seal">
      AICTE REGULATION BUREAU<br/>
      ACCREDITATION AUDIT CELL<br/>
      NEW DELHI
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div><strong>Dr. R. Sundaresan</strong></div>
      <div>Regional Officer & Director, AICTE</div>
      <div style="color: #64748b; font-family: monospace; font-size: 10px;">${auditData.nba_registry_check?.cryptographic_seal}</div>
    </div>
  </div>

  <div class="footer">
    <span>National Accreditation Concession Cross-Validator • IT Act 2000 Electronic Record</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${isDeficit ? 'AICTE_Demand_Notice' : 'AICTE_Accreditation_Certificate'}_${auditData.fdr_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isDeficit = auditData?.verdict === 'CRITICAL_CONCESSION_BREACH_DEFICIT';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ background: '#091f3c', color: '#fff', borderBottom: '1px solid #1e3a8a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              background: 'rgba(2, 132, 199, 0.25)', 
              border: '1px solid #0284c7', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  NBA & NAAC Accreditation / Statutory Deposit Concession Cross-Validator
                </h3>
                <span className="badge" style={{ background: '#0284c7', color: '#fff', fontSize: '0.68rem', padding: '2px 8px' }}>
                  APH Chapter 2.4 & Appendix 8
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Automated cross-check between Security Deposit claims and live NBA e-NBA & NAAC National Registries.
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} style={{ color: '#fff' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
          
          {/* Quick Instrument Switcher Toolbar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="#0f2e5a" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f2e5a' }}>
                Select Institution FDR for Concession Audit:
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '500px' }}>
              <select 
                value={selectedFdrId} 
                onChange={(e) => setSelectedFdrId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  fontWeight: 600
                }}
              >
                {allFdrs.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.institution_name} — {r.fdr_number} ({r.status === 'FLAGGED_FORGERY' ? '⚠️ Flagged' : '✓ Active'})
                  </option>
                ))}
              </select>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => fetchAudit(selectedFdrId)}
                title="Re-run live API ping against NBA & NAAC registries"
                style={{ padding: '7px 10px', borderColor: '#cbd5e1' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <RefreshCw size={36} color="#0284c7" className="animate-spin" style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f2e5a' }}>
                Pinging National Accreditation Gateways...
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                Connecting to <strong>api.nbaind.org (Tier-1 Wash. Accord)</strong> and <strong>api.naac.gov.in (Cycle Registry)</strong>.
              </p>
            </div>
          ) : auditData ? (
            <>
              {/* Verdict Banner */}
              <div style={{
                background: isDeficit 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)' 
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
                border: `1.5px solid ${isDeficit ? '#f87171' : '#34d399'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: isDeficit ? '#fee2e2' : '#dcfce7',
                      color: isDeficit ? '#dc2626' : '#16a34a',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isDeficit ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          fontWeight: 800, 
                          color: isDeficit ? '#991b1b' : '#065f46' 
                        }}>
                          {isDeficit 
                            ? 'CRITICAL STATUTORY DEFICIT: ACCREDITATION CONCESSION LAPSED'
                            : 'STATUTORILY COMPLIANT: ACCREDITATION CONCESSION 100% VALID'}
                        </span>
                        <span className={`badge ${isDeficit ? 'badge-danger' : 'badge-verified'}`}>
                          {isDeficit ? '₹15.0L Recovery Required' : '0 Deficit (APH Compliant)'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: isDeficit ? '#b91c1c' : '#047857', marginTop: '6px', lineHeight: 1.5 }}>
                        {auditData.statutory_summary}
                      </p>
                    </div>
                  </div>

                  {auditData.demand_notice_served && (
                    <div style={{
                      background: '#fee2e2',
                      border: '1px solid #f87171',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#991b1b',
                      fontWeight: 700
                    }}>
                      Demand Order Served: <code>{auditData.demand_notice_ref}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Two Column Gateway Live Ping Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                
                {/* Node 1: NBA e-NBA Gateway */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>🏛️</span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f2e5a' }}>
                          National Board of Accreditation (NBA)
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>e-NBA Central Registry API</div>
                      </div>
                    </div>
                    <span className="badge" style={{ 
                      background: auditData.nba_registry_check?.status === 'ACTIVE_VALID' ? '#dcfce7' : '#fee2e2',
                      color: auditData.nba_registry_check?.status === 'ACTIVE_VALID' ? '#166534' : '#991b1b',
                      fontSize: '0.68rem'
                    }}>
                      {auditData.nba_registry_check?.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Target Program:</span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>
                        {auditData.nba_registry_check?.program_name}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Tier Classification:</span>
                      <strong style={{ color: '#0284c7' }}>
                        {auditData.nba_registry_check?.tier_level}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Accreditation Validity:</span>
                      <strong style={{ color: auditData.nba_registry_check?.status === 'ACTIVE_VALID' ? '#16a34a' : '#dc2626' }}>
                        {auditData.nba_registry_check?.valid_upto}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Evaluation Score:</span>
                      <span style={{ fontWeight: 600 }}>{auditData.nba_registry_check?.evaluation_score}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '2px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Registry File:</span>
                      <code style={{ fontSize: '0.72rem', color: '#475569' }}>{auditData.nba_registry_check?.file_number}</code>
                    </div>
                  </div>
                </div>

                {/* Node 2: NAAC Gateway */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>🎓</span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f2e5a' }}>
                          National Assessment & Accreditation (NAAC)
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Central Higher Education Portal</div>
                      </div>
                    </div>
                    <span className="badge" style={{ 
                      background: auditData.naac_registry_check?.status === 'ACTIVE_VALID' ? '#dcfce7' : '#fee2e2',
                      color: auditData.naac_registry_check?.status === 'ACTIVE_VALID' ? '#166534' : '#991b1b',
                      fontSize: '0.68rem'
                    }}>
                      {auditData.naac_registry_check?.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Institutional Cycle:</span>
                      <strong style={{ color: '#0f172a' }}>{auditData.naac_registry_check?.cycle}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>National Grade & CGPA:</span>
                      <strong style={{ color: auditData.naac_registry_check?.status === 'ACTIVE_VALID' ? '#059669' : '#b91c1c' }}>
                        Grade {auditData.naac_registry_check?.grade} ({auditData.naac_registry_check?.cgpa})
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Accreditation Validity:</span>
                      <strong style={{ color: auditData.naac_registry_check?.status === 'ACTIVE_VALID' ? '#16a34a' : '#dc2626' }}>
                        {auditData.naac_registry_check?.valid_upto}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>APH Concession Threshold:</span>
                      <span style={{ color: '#475569', fontSize: '0.76rem' }}>Requires A++ or A+ (CGPA ≥ 3.51)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '2px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Registry Ping:</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{auditData.naac_registry_check?.last_ping_timestamp}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Statutory Mathematical Scorecard (APH Clause 2.4) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', margin: 0 }}>
                    Statutory Security Deposit Reconciliation (AICTE APH Clause 2.4)
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Rule: Appendix 8 Technical Degree Divisions
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Standard Statutory Base</div>
                    <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ₹35,00,000
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>APH Norm without discount</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Claimed Concession</div>
                    <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                      - ₹15,00,000
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Under NBA Tier-1 clause</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>FDR Actually Deposited</div>
                    <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ₹{(auditData.statutory_breakdown?.actual_fdr_deposited || 2000000).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>Pledged to Regional Officer</div>
                  </div>

                  <div style={{ 
                    background: isDeficit ? '#fef2f2' : '#f0fdf4', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    border: `1.5px solid ${isDeficit ? '#fca5a5' : '#86efac'}` 
                  }}>
                    <div style={{ fontSize: '0.72rem', color: isDeficit ? '#991b1b' : '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                      Net Statutory Deficit
                    </div>
                    <div className="font-mono" style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 800, 
                      color: isDeficit ? '#dc2626' : '#16a34a', 
                      marginTop: '4px' 
                    }}>
                      ₹{(auditData.deficit_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDeficit ? '#b91c1c' : '#15803d', marginTop: '2px', fontWeight: 600 }}>
                      {isDeficit ? 'Top-Up Mandatory within 15 Days' : 'Fully Collateralized'}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '14px', 
                  fontSize: '0.74rem', 
                  color: '#475569', 
                  background: '#f1f5f9', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HelpCircle size={14} color="#0284c7" />
                  <span>
                    <strong>Regulatory Reference:</strong> {auditData.statutory_breakdown?.compliance_clause}
                  </span>
                </div>
              </div>

            </>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={handleDownloadNotice}
              disabled={!auditData}
              title="Download official document with Government Seal and QR Code"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>{isDeficit ? 'Download Demand Notice (PDF/HTML)' : 'Download Compliance Certificate'}</span>
            </button>

            {isDeficit && (
              <button 
                id="btn-issue-deficit-demand"
                className="btn btn-danger btn-sm"
                onClick={handleIssueDemandNotice}
                disabled={issuingNotice || auditData?.demand_notice_served}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                <Send size={14} />
                <span>
                  {auditData?.demand_notice_served 
                    ? 'Demand Notice Already Served (15 Days Clock Running)' 
                    : issuingNotice 
                    ? 'Dispatched to CAG Ledger...' 
                    : 'Issue Statutory Deficit Replenishment Notice (₹15L)'}
                </span>
              </button>
            )}

            {!isDeficit && (
              <button 
                className="btn btn-emerald btn-sm"
                onClick={() => alert('Institution accreditation concession is validated 100% compliant under APH Chapter 2.4. No regulatory action required.')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                <CheckCircle2 size={14} />
                <span>Endorse Concession Validated</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
