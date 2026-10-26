import React, { useState } from 'react';
import { 
  DollarSign, 
  Building2, 
  AlertTriangle, 
  Clock, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Send, 
  FileCheck2,
  RefreshCw,
  QrCode,
  ScanLine,
  Radar,
  GraduationCap,
  Award
} from 'lucide-react';

export default function AicteDashboard({ 
  fdrRecords, 
  stats,
  onViewDetails, 
  onApproveRelease,
  onSendNotice,
  onRefresh,
  onViewEvcDossier,
  onOpenMultiLienRadar,
  onOpenDormantRecovery,
  onOpenAccreditationAudit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('Southern');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filtered records
  const filteredRecords = fdrRecords.filter(item => {
    const matchSearch = 
      (item.institution_name || item.collegeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.aicte_pid || item.aicteId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fdr_number || item.fdrNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.bank_name || item.bankName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const region = item.region || '';
    const matchRegion = regionFilter === 'ALL' || region.includes(regionFilter);
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchSearch && matchRegion && matchStatus;
  });

  const totalCrores = stats ? stats.totalCrores : '2.80';
  const flaggedCount = stats ? stats.flaggedCount : fdrRecords.filter(r => r.status === 'FLAGGED_FORGERY').length;
  const expiringCount = stats ? stats.expiringCount : fdrRecords.filter(r => r.status === 'EXPIRING_SOON').length;
  const pendingReleaseCount = stats ? stats.pendingReleaseCount : fdrRecords.filter(r => r.status === 'AICTE_PENDING_RELEASE').length;

  // Export Management Report (CSV)
  const handleExportCSV = () => {
    const headers = ["ID", "Institution Name", "AICTE PID", "Region", "State", "Bank Name", "FDR Number", "Amount (INR)", "Deposit Date", "Maturity Date", "Tenure (Yrs)", "Tripartite Status", "Bank SFMS Token", "Risk Score (%)"];
    const rows = fdrRecords.map(r => [
      r.id,
      `"${r.institution_name || r.collegeName || ''}"`,
      r.aicte_pid || r.aicteId || '',
      `"${r.region || ''}"`,
      `"${r.state || ''}"`,
      `"${r.bank_name || r.bankName || ''}"`,
      r.fdr_number || r.fdrNumber || '',
      r.amount || 0,
      r.deposit_date || r.depositDate || '',
      r.maturity_date || r.maturityDate || '',
      r.tenure_years || r.tenureYears || 10,
      r.status,
      r.bank_token || 'PENDING',
      r.risk_score || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AICTE_Regulation_Bureau_FDR_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-content">
      {/* Official AICTE Console Title */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#091f3c', margin: 0, letterSpacing: '-0.02em' }}>
              AICTE SURAKSHA-FDR • National Regulatory Surveillance Console
            </h1>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }}>
              सुरक्षा-FDR
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Statutory Fixed Deposit Tripartite Escrow Monitoring & Multi-Lien Forensics under AICTE Approval Process Handbook (APH 2026-27).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            id="btn-export-fdr-csv"
            className="btn btn-primary btn-sm"
            onClick={handleExportCSV}
            title="Download automated regulatory management report in CSV / Excel format"
          >
            <span>Export Management Report (CSV)</span>
          </button>
          <button 
            id="btn-view-evc-dossier"
            className="btn btn-emerald btn-sm"
            onClick={() => {
              const target = fdrRecords.find(r => r.evc_status === 'PASSED_ENDORSED') || fdrRecords[0];
              if (target && onViewEvcDossier) onViewEvcDossier(target);
            }}
            title="Review on-site Expert Visit Committee (EVC) Physical Inspection Dossier & GPS Audit Log"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <FileCheck2 size={14} />
            <span>EVC Field Reports</span>
          </button>
          <button 
            id="btn-open-nesl-radar"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const target = (fdrRecords && fdrRecords.length > 0)
                ? (fdrRecords.find(r => r.status === 'FLAGGED_FORGERY') || fdrRecords[0])
                : { id: 'CNRB-FD-8921094', fdr_number: 'CNRB-FD-8921094', institution_name: 'PSG College of Technology & Applied Research', amount: 3500000 };
              if (onOpenMultiLienRadar) onOpenMultiLienRadar(target);
            }}
            title="Launch Pan-India NeSL Multi-Lien & Collateral Overdraft Radar Sweep"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, borderColor: '#0284c7', color: '#0284c7', cursor: 'pointer' }}
          >
            <Radar size={14} />
            <span>NeSL Collateral Radar</span>
          </button>
          <button 
            id="btn-open-dormant-sweeper"
            className="btn btn-outline btn-sm"
            onClick={() => onOpenDormantRecovery && onOpenDormantRecovery()}
            title="Review and Repatriate Unclaimed Deposits from Defunct Institutions into AICTE Student Scholarship Corpus"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, borderColor: '#10b981', color: '#047857', background: 'rgba(16, 185, 129, 0.08)', cursor: 'pointer' }}
          >
            <GraduationCap size={15} />
            <span>Dormant Deposit Recovery (₹1.01 Cr)</span>
          </button>
          <button 
            id="btn-open-accreditation-audit"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const target = (fdrRecords && fdrRecords.length > 0)
                ? (fdrRecords.find(r => r.status === 'FLAGGED_FORGERY') || fdrRecords[0])
                : { id: 'FDR-2024-CAN-0891', fdr_number: 'CNRB-FD-8921094' };
              if (onOpenAccreditationAudit) onOpenAccreditationAudit(target);
            }}
            title="Cross-validate NBA & NAAC Accreditation against Statutory Deposit Concession (APH Chapter 2.4)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, borderColor: '#f59e0b', color: '#b45309', background: 'rgba(245, 158, 11, 0.08)', cursor: 'pointer' }}
          >
            <Award size={15} />
            <span>NBA Concession Audit</span>
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={onRefresh}
            title="Refresh database records"
          >
            <RefreshCw size={14} />
            <span>Sync Registry</span>
          </button>
          <span className="badge badge-verified">
            <span className="pulse-dot"></span>
            11,420 Technical Institutions Enrolled
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {/* Total Funds Secured */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
          <div className="metric-header">
            <span className="metric-title">Total Security Deposits Secured</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.15)', color: 'var(--blue-light)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value font-mono">
            ₹{totalCrores} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Crores</span>
          </div>
          <div className="metric-sub">
            <span style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>100% Joint Lien</span>
            <span>with Regional Officers</span>
          </div>
        </div>

        {/* AI Tamper / Forgery Flags */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--rose-danger)' }}>
          <div className="metric-header">
            <span className="metric-title">Critical Forgery Flags</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--rose-light)' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="metric-value font-mono" style={{ color: 'var(--rose-light)' }}>
            {flaggedCount} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Under Vigilance</span>
          </div>
          <div className="metric-sub">
            <span>Pixel manipulation & CBS amount mismatches</span>
          </div>
        </div>

        {/* Expiring / Renewal Required */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--gold-accent)' }}>
          <div className="metric-header">
            <span className="metric-title">Expiring in &lt; 90 Days</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--gold-light)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="metric-value font-mono" style={{ color: 'var(--gold-light)' }}>
            {expiringCount} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Institutions</span>
          </div>
          <div className="metric-sub">
            <span>Mandatory renewal notices queued</span>
          </div>
        </div>

        {/* 10-Year Maturity Releases */}
        <div className="metric-card" style={{ borderLeft: '4px solid var(--emerald-success)' }}>
          <div className="metric-header">
            <span className="metric-title">10-Year Tenure Matured</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-light)' }}>
              <FileCheck2 size={20} />
            </div>
          </div>
          <div className="metric-value font-mono" style={{ color: 'var(--emerald-light)' }}>
            {pendingReleaseCount} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>NOC Eligible</span>
          </div>
          <div className="metric-sub">
            <span>APH compliance checks verified</span>
          </div>
        </div>
      </div>

      {/* National Collateral Sentinel & Scholarship Corpus Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 46, 90, 0.95) 0%, rgba(9, 31, 60, 0.98) 100%)',
        border: '1px solid #1e3a8a',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        color: '#ffffff',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.25)', border: '1px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Radar size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                Pan-India Collateral & NeSL Multi-Lien Surveillance Sentinel
              </span>
              <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.68rem', padding: '2px 6px' }}>
                NeSL Live Active
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '2px' }}>
              Automated de-duplication cross-checks 11,400+ institutional FDRs against Bank Commercial Overdrafts (OD-FD) and Inter-Council Regulatory Pledges (PCI, NMC, UGC).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const target = (fdrRecords && fdrRecords.length > 0)
                ? (fdrRecords.find(r => r.status === 'FLAGGED_FORGERY') || fdrRecords[0])
                : { id: 'CNRB-FD-8921094', fdr_number: 'CNRB-FD-8921094', institution_name: 'PSG College of Technology & Applied Research', amount: 3500000 };
              if (onOpenMultiLienRadar) onOpenMultiLienRadar(target);
            }}
            style={{ background: 'rgba(2, 132, 199, 0.2)', borderColor: '#0284c7', color: '#ffffff', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Radar size={13} />
            <span>Launch NeSL Radar</span>
          </button>
          <button
            className="btn btn-emerald btn-sm"
            onClick={() => onOpenDormantRecovery && onOpenDormantRecovery()}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <GraduationCap size={14} />
            <span>Dormant Asset Repatriation (₹1.01 Cr)</span>
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              const target = (fdrRecords && fdrRecords.length > 0)
                ? (fdrRecords.find(r => r.status === 'FLAGGED_FORGERY') || fdrRecords[0])
                : { id: 'FDR-2024-CAN-0891', fdr_number: 'CNRB-FD-8921094' };
              if (onOpenAccreditationAudit) onOpenAccreditationAudit(target);
            }}
            style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: '#f59e0b', color: '#fbbf24', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Award size={14} />
            <span>NBA Concession Audit</span>
          </button>
        </div>
      </div>

      {/* Critical Forgery Alert Banner */}
      {flaggedCount > 0 && (
        <div className="glass-panel" style={{ 
          marginBottom: '28px', 
          background: '#fff5f5',
          border: '1px solid #fecaca',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '50%', 
                background: '#fee2e2', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#991b1b' }}>
                    CRITICAL TAMPERING DETECTED: Shree Sharda Institute of Management & Science
                  </span>
                  <span className="badge badge-danger">Risk 94.8%</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#b91c1c', marginTop: '4px' }}>
                  Uploaded certificate claims <strong>₹50,00,000</strong>. AI Error Level Analysis flagged font cloning. Real-time Bank SFMS ping confirms actual deposit is only <strong>₹50,000</strong>.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                id="btn-inspect-fraud"
                className="btn btn-danger btn-sm"
                onClick={() => onViewDetails(fdrRecords.find(r => r.status === 'FLAGGED_FORGERY'))}
              >
                <Eye size={14} />
                <span>Inspect Forensic Dossier</span>
              </button>
              <button 
                id="btn-issue-show-cause"
                className="btn btn-outline btn-sm"
                onClick={() => onSendNotice('Shree Sharda Institute of Management & Science', 'SHOW_CAUSE_FORGERY')}
              >
                <Send size={14} />
                <span>Issue Show-Cause Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Records Table Panel */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              National Institutional Fixed Deposit Ledger
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Persistent records fetched directly from AICTE Regulatory Database (PostgreSQL / SQLite).
            </p>
          </div>
        </div>

        {/* Official Jurisdiction Scope Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Officer Scope:
          </span>
          <button
            type="button"
            className={`btn btn-sm ${regionFilter === 'Southern' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setRegionFilter('Southern')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            📍 Southern Regional Office (Chennai Jurisdiction)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${regionFilter === 'ALL' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setRegionFilter('ALL')}
            style={{ fontSize: '0.74rem', padding: '4px 10px' }}
          >
            🏛️ Central Headquarters (All-India Oversight)
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="toolbar-row">
          <div className="search-box">
            <Search size={16} color="var(--text-dim)" />
            <input 
              id="input-fdr-search"
              type="text" 
              placeholder="Search institution, PID, FDR #, or bank..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select 
              id="select-region-filter"
              className="filter-select"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <option value="ALL">All AICTE Regions</option>
              <option value="Southern">Southern (Chennai)</option>
              <option value="South-Western">South-Western (Bangalore)</option>
              <option value="South-Central">South-Central (Hyderabad)</option>
              <option value="Western">Western (Mumbai)</option>
              <option value="Northern">Northern (Kanpur)</option>
              <option value="North-Western">North-Western (Chandigarh/Delhi)</option>
              <option value="Eastern">Eastern (Kolkata)</option>
            </select>

            <select 
              id="select-status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Deposit Statuses</option>
              <option value="ACTIVE_VERIFIED">Active & Verified (Lien Engaged)</option>
              <option value="BANK_PENDING">Awaiting Bank SFMS Tripartite Lock</option>
              <option value="EXPIRING_SOON">Expiring in &lt; 90 Days</option>
              <option value="FLAGGED_FORGERY">AI Tamper Flagged (Fraud)</option>
              <option value="AICTE_PENDING_RELEASE">10-Year Maturity Release Pending</option>
              <option value="RELEASED_APPROVED">Released & Closed</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Institution & AICTE PID</th>
                <th>Bank & FDR Number</th>
                <th>Deposit Amount</th>
                <th>Lock Tenure & Maturity</th>
                <th>Tripartite Status</th>
                <th>Risk Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No security deposit records match the selected query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const instName = item.institution_name || item.collegeName;
                  const pid = item.aicte_pid || item.aicteId;
                  const bank = item.bank_name || item.bankName;
                  const fdrNo = item.fdr_number || item.fdrNumber;
                  const amount = Number(item.amount);
                  const formattedAmount = (amount / 100000).toLocaleString('en-IN') + ' Lakhs';
                  const matDate = item.maturity_date || item.maturityDate;
                  const tenure = item.tenure_years || item.tenureYears || 10;
                  const riskScore = item.risk_score !== undefined ? item.risk_score : (item.riskScore || 0);

                  let statusBadge = null;
                  if (item.status === 'ACTIVE_VERIFIED') {
                    statusBadge = (
                      <span className="badge badge-verified">
                        <CheckCircle2 size={12} />
                        Active & Verified
                      </span>
                    );
                  } else if (item.status === 'FLAGGED_FORGERY') {
                    statusBadge = (
                      <span className="badge badge-danger">
                        <AlertTriangle size={12} />
                        AI Tamper Flagged
                      </span>
                    );
                  } else if (item.status === 'EXPIRING_SOON') {
                    statusBadge = (
                      <span className="badge badge-warning">
                        <Clock size={12} />
                        Matures Soon
                      </span>
                    );
                  } else if (item.status === 'BANK_PENDING') {
                    statusBadge = (
                      <span className="badge badge-pending">
                        <span className="pulse-dot"></span>
                        Bank SFMS Pending
                      </span>
                    );
                  } else if (item.status === 'AICTE_PENDING_RELEASE') {
                    statusBadge = (
                      <span className="badge badge-purple">
                        <FileCheck2 size={12} />
                        10-Yr Release Eligible
                      </span>
                    );
                  } else if (item.status === 'RELEASED_APPROVED') {
                    statusBadge = (
                      <span className="badge badge-verified" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd' }}>
                        <CheckCircle2 size={12} />
                        Release Completed
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{instName}</span>
                          {item.evc_status === 'PASSED_ENDORSED' && (
                            <span className="badge badge-verified" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.66rem', padding: '1px 5px' }}>
                              ✓ EVC Endorsed
                            </span>
                          )}
                          {item.status === 'FLAGGED_FORGERY' ? (
                            <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.64rem', padding: '1px 5px', border: '1px solid #fde68a' }}>
                              ⚠️ NBA Lapsed (-₹15L)
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.64rem', padding: '1px 5px', border: '1px solid #a7f3d0' }}>
                              🏅 NBA Tier-1 Valid
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '8px' }}>
                          <span className="font-mono">{pid}</span>
                          <span>•</span>
                          <span>{item.region}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 500 }}>{bank}</div>
                        <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--blue-light)' }}>
                          {fdrNo}
                        </div>
                      </td>

                      <td>
                        <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          ₹{amount.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          ₹{formattedAmount} ({item.interest_rate || item.interestRate || '7.1%'})
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{matDate}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {tenure} Years Joint Lock
                        </div>
                      </td>

                      <td>{statusBadge}</td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="font-mono" style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            color: riskScore > 50 ? 'var(--rose-light)' : riskScore > 20 ? 'var(--gold-light)' : 'var(--emerald-light)'
                          }}>
                            {riskScore}%
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            title="Inspect FDR certificate, OCR confidence & Bank SFMS Token"
                            onClick={() => onViewDetails(item)}
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>

                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              color: item.status === 'FLAGGED_FORGERY' ? '#b45309' : '#047857', 
                              borderColor: item.status === 'FLAGGED_FORGERY' ? '#f59e0b' : '#cbd5e1',
                              background: item.status === 'FLAGGED_FORGERY' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                              cursor: 'pointer'
                            }}
                            title="Cross-validate NBA & NAAC Accreditation against Statutory Deposit Concession (APH Chapter 2.4)"
                            onClick={() => onOpenAccreditationAudit && onOpenAccreditationAudit(item)}
                          >
                            <Award size={12} color={item.status === 'FLAGGED_FORGERY' ? '#b45309' : '#059669'} />
                            <span>NBA Check</span>
                          </button>

                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              color: item.evc_status === 'PASSED_ENDORSED' ? '#047857' : '#0f2e5a', 
                              borderColor: item.evc_status === 'PASSED_ENDORSED' ? '#10b981' : '#cbd5e1',
                              background: item.evc_status === 'PASSED_ENDORSED' ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                            }}
                            title="Review on-site EVC inspection dossier, GPS coordinates, and Chairman sign-off"
                            onClick={() => onViewEvcDossier && onViewEvcDossier(item)}
                          >
                            <FileCheck2 size={12} color={item.evc_status === 'PASSED_ENDORSED' ? '#059669' : '#0284c7'} />
                            <span>{item.evc_status === 'PASSED_ENDORSED' ? 'EVC Dossier' : 'EVC Report'}</span>
                          </button>

                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '3px 8px', 
                              color: item.status === 'FLAGGED_FORGERY' ? '#dc2626' : '#0284c7', 
                              borderColor: item.status === 'FLAGGED_FORGERY' ? '#f87171' : '#cbd5e1',
                              background: item.status === 'FLAGGED_FORGERY' ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                            }}
                            title="Run Pan-India NeSL Collateral & Multi-Lien Overdraft Radar Sweep"
                            onClick={() => onOpenMultiLienRadar && onOpenMultiLienRadar(item)}
                          >
                            <Radar size={12} color={item.status === 'FLAGGED_FORGERY' ? '#dc2626' : '#0284c7'} />
                            <span>Radar</span>
                          </button>

                          {(item.status === 'AICTE_PENDING_RELEASE' || item.status === 'EXPIRING_SOON') && (
                            <button 
                              className="btn btn-emerald btn-sm"
                              title="Approve 10-year security deposit release under APH Chapter 1"
                              onClick={() => onApproveRelease(item.id)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Release NOC</span>
                            </button>
                          )}

                          {item.status === 'EXPIRING_SOON' && (
                            <button 
                              className="btn btn-gold btn-sm"
                              title="Dispatch auto-renewal notice to Principal & Bank Manager"
                              onClick={() => onSendNotice(instName, 'RENEWAL_ALERT')}
                            >
                              <Send size={13} />
                              <span>Notice</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
