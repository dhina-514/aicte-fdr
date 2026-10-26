import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Radar, 
  ShieldCheck, 
  AlertTriangle, 
  Landmark, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Lock, 
  FileCheck2, 
  Download, 
  Search, 
  RefreshCw,
  Scale,
  ShieldAlert
} from 'lucide-react';

export default function MultiLienRadarModal({ fdr, onClose, onRefresh }) {
  const [radarStep, setRadarStep] = useState(1); // 1: Bank CBS, 2: Inter-Council, 3: NeSL, 4: Done
  const [isScanning, setIsScanning] = useState(true);
  const [radarData, setRadarData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFreezing, setIsFreezing] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState(false);

  const targetId = fdr?.id || fdr?.fdr_number || 'CNRB-FD-8921094';

  const runRadarSweep = async () => {
    setIsScanning(true);
    setRadarStep(1);
    setErrorMessage(null);
    setFreezeSuccess(false);

    try {
      // Step 1: Bank Loan / OD Switch
      await new Promise(r => setTimeout(r, 600));
      setRadarStep(2);

      // Step 2: Inter-Council Clearinghouse
      await new Promise(r => setTimeout(r, 600));
      setRadarStep(3);

      // Step 3: NeSL / CERSAI Repository
      const res = await fetch(`/api/collateral-radar/${encodeURIComponent(targetId)}`);
      const data = await res.json();

      await new Promise(r => setTimeout(r, 500));
      setRadarStep(4);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete NeSL collateral radar sweep.');
      }

      setRadarData(data);

      if (data.firstChargeVestedInAicte) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    runRadarSweep();
  }, [targetId]);

  const handleEnforceFreeze = async () => {
    if (!radarData?.deposit) return;
    setIsFreezing(true);

    try {
      const res = await fetch('/api/collateral-radar/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fdr_id: radarData.deposit.id,
          reason: 'CRITICAL_MULTI_LIEN_BREACH',
          officer_name: 'Regional Officer, AICTE Regulation Bureau'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enforce freeze.');

      setFreezeSuccess(true);
      if (onRefresh) onRefresh();
      alert('Statutory Injunction & Multi-Lien Freeze Dispatched to Bank Finacle Switch & Central Audit Ledger!');
    } catch (err) {
      alert('Freeze Error: ' + err.message);
    } finally {
      setIsFreezing(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!radarData) return;
    const isClean = radarData.firstChargeVestedInAicte;
    const certText = `AICTE REGULATION BUREAU — NATIONAL COLLATERAL & MULTI-LIEN AUDIT CERTIFICATE
Under National E-Governance Services Ltd (NeSL) & Section 10 of AICTE Act, 1987
------------------------------------------------------------------------------------------
Institution Name   : ${radarData.deposit.institution_name}
AICTE PID          : ${radarData.deposit.aicte_pid}
FDR Reference No.  : ${radarData.deposit.fdr_number}
Secured Deposit    : INR ${Number(radarData.deposit.amount).toLocaleString('en-IN')}
Depository Bank    : ${radarData.deposit.bank_name} (${radarData.deposit.branch_name})
Scan Audit Time    : ${radarData.scanTimestamp}

COLLATERAL RADAR FORENSIC FINDINGS:
------------------------------------------------------------------------------------------
Overall Verdict    : ${radarData.overallVerdict}
Charge Rank        : ${radarData.neslChargeRank}
First Charge Owner : ${isClean ? 'AICTE Regulation Bureau (Exclusive 100%)' : 'Punjab National Bank (Subordinated AICTE Claim)'}

1. BANK OVERDRAFT SWITCH:
   Facility Status : ${radarData.nodes.bankOverdraftSwitch.facilityType}
   Active Debt     : ${radarData.nodes.bankOverdraftSwitch.amountDrawn}
   Finding         : ${radarData.nodes.bankOverdraftSwitch.finding}

2. INTER-COUNCIL REGULATORY CLEARINGHOUSE:
   Pledge Duplication: ${radarData.nodes.interCouncilRegistry.duplicatePledgeDetected ? 'YES - REUSED ACROSS COUNCILS' : 'ZERO - EXCLUSIVE TO AICTE'}
   Finding         : ${radarData.nodes.interCouncilRegistry.finding}

3. NeSL & CERSAI COLLATERAL REGISTRY:
   CERSAI Asset ID : ${radarData.nodes.neslCersaiRegistry.cersaiAssetId}
   Legal Status    : ${radarData.nodes.neslCersaiRegistry.encumbranceStatus}
   Risk Assessment : ${radarData.nodes.neslCersaiRegistry.legalRiskNotice}
------------------------------------------------------------------------------------------
Issued by: AICTE National Collateral Risk Surveillance Unit, New Delhi`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeSL_Collateral_Clearance_${radarData.deposit.fdr_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', padding: '0', background: '#ffffff', color: '#0f172a', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Radar Modal Header */}
        <div style={{
          background: '#091f3c',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #0284c7'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#0284c7',
                color: '#ffffff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Radar size={14} className={isScanning ? 'spin-icon' : ''} />
                <span>NeSL COLLATERAL RADAR</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Pan-India Multi-Lien & Cross-Regulatory Collateral Radar
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
              Zero-Trust Collateral De-Duplication: Pings Bank CBS Loan Switches, Inter-Council Registry (PCI/NMC/UGC) & NeSL CERSAI Charge Repository.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Radar Scanning Sweep Banner */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#475569' }}>
              Target Security Deposit: <strong className="font-mono" style={{ color: '#0f2e5a' }}>{targetId}</strong>
            </span>
            {radarData?.deposit && (
              <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem' }}>
                ₹{Number(radarData.deposit.amount).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={runRadarSweep}
              disabled={isScanning}
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={isScanning ? 'spin-icon' : ''} />
              <span>{isScanning ? 'Sweeping National Nodes...' : 'Re-run Radar Sweep'}</span>
            </button>
            {radarData && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleDownloadCertificate}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={13} />
                <span>NeSL Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* 3-Node Scanning Animation Pipeline */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* Node 1: Bank CBS Loan / Overdraft Switch */}
            <div style={{
              background: radarStep >= 1 ? '#f0fdf4' : '#f8fafc',
              border: radarStep >= 1 ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Landmark size={24} color={radarStep >= 1 ? '#059669' : '#94a3b8'} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>NODE 1: BANK CBS SWITCH</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2e5a' }}>
                  Core Banking Loan & OD Check
                </div>
                <div style={{ fontSize: '0.7rem', color: radarStep >= 2 ? '#059669' : '#0284c7' }}>
                  {radarStep >= 2 ? '✓ Sweep Completed' : isScanning ? 'Pinging loan database...' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Node 2: Inter-Council Regulatory Registry */}
            <div style={{
              background: radarStep >= 2 ? '#f0fdf4' : '#f8fafc',
              border: radarStep >= 2 ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Building2 size={24} color={radarStep >= 2 ? '#059669' : '#94a3b8'} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>NODE 2: INTER-COUNCIL CLEARING</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2e5a' }}>
                  PCI / NMC / UGC Cross-Pledge
                </div>
                <div style={{ fontSize: '0.7rem', color: radarStep >= 3 ? '#059669' : '#0284c7' }}>
                  {radarStep >= 3 ? '✓ Hash Comparison Complete' : radarStep === 2 ? 'Cross-matching certificates...' : 'Pending'}
                </div>
              </div>
            </div>

            {/* Node 3: NeSL / CERSAI First Charge Repository */}
            <div style={{
              background: radarStep >= 3 ? '#f0fdf4' : '#f8fafc',
              border: radarStep >= 3 ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Layers size={24} color={radarStep >= 3 ? '#059669' : '#94a3b8'} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>NODE 3: NeSL CERSAI REPOSITORY</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2e5a' }}>
                  First Charge Encumbrance Proof
                </div>
                <div style={{ fontSize: '0.7rem', color: radarStep >= 4 ? '#059669' : '#0284c7' }}>
                  {radarStep >= 4 ? '✓ Charge Ranking Confirmed' : radarStep === 3 ? 'Validating security interest...' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={20} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* VERDICT CARD */}
          {radarData && (
            <div>
              {radarData.firstChargeVestedInAicte ? (
                /* CLEAN UNENCUMBERED CARD */
                <div style={{
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                        <ShieldCheck size={30} />
                      </div>
                      <div>
                        <span className="badge badge-verified" style={{ background: '#166534', color: '#ffffff', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                          ✓ 100% UNENCUMBERED SOLE FIRST CHARGE
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2e5a', marginTop: '3px' }}>
                          {radarData.deposit.institution_name}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#475569' }}>
                          NeSL Charge Ranking: <strong style={{ color: '#15803d' }}>RANK 1 (Sole Statutory Priority to AICTE)</strong> • CERSAI ID: <strong className="font-mono">{radarData.nodes.neslCersaiRegistry.cersaiAssetId}</strong>
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Verified Deposit Value</span>
                      <strong className="font-mono" style={{ fontSize: '1.5rem', color: '#059669', fontWeight: 900 }}>
                        ₹{Number(radarData.deposit.amount).toLocaleString('en-IN')}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Zero Secondary Liens Detected</div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    fontSize: '0.8rem',
                    color: '#1e3a8a',
                    lineHeight: 1.5
                  }}>
                    <strong>NeSL Statutory Clearance:</strong> The depository bank confirms that no commercial loans, overdrafts, or corporate credit facilities are drawn against this security deposit. Furthermore, inter-council hash matching confirms zero duplicate pledges with the Pharmacy Council of India, National Medical Commission, or any other authority.
                  </div>
                </div>
              ) : (
                /* CRITICAL MULTI-LIEN FRAUD ALERT CARD */
                <div style={{
                  background: '#fef2f2',
                  border: '2px solid #f87171',
                  borderRadius: '10px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                        <ShieldAlert size={30} />
                      </div>
                      <div>
                        <span className="badge badge-danger" style={{ background: '#b91c1c', color: '#ffffff', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                          🚨 CRITICAL MULTI-LIEN ENCUMBRANCE CONFLICT
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7f1d1d', marginTop: '3px' }}>
                          {radarData.deposit.institution_name}
                        </h3>
                        <p style={{ fontSize: '0.78rem', color: '#991b1b' }}>
                          NeSL Status: <strong style={{ color: '#dc2626' }}>AICTE First-Charge Compromised (Rank 2)</strong> • Unauthorized Secondary Liens Active!
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: '#991b1b', display: 'block' }}>Compromised Collateral</span>
                      <strong className="font-mono" style={{ fontSize: '1.5rem', color: '#b91c1c', fontWeight: 900 }}>
                        ₹{Number(radarData.deposit.amount).toLocaleString('en-IN')}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800 }}>Pledged as Commercial Overdraft!</div>
                    </div>
                  </div>

                  {/* Red Alert Action Banner */}
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 18px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #fca5a5',
                    fontSize: '0.8rem',
                    color: '#7f1d1d'
                  }}>
                    <strong style={{ display: 'block', fontSize: '0.86rem', color: '#991b1b', marginBottom: '4px' }}>
                      Forensic Discovery: Multiple Encumbrances Discovered Across Banking & Statutory Systems:
                    </strong>
                    <ul style={{ paddingLeft: '18px', margin: '4px 0', lineHeight: 1.6 }}>
                      <li>
                        <strong>Bank Overdraft Debt:</strong> Active ₹25,00,000 commercial overdraft facility drawn on Account <code className="font-mono">OD-90182441-SME</code> at depository branch.
                      </li>
                      <li>
                        <strong>Cross-Council Re-Use:</strong> Identical deposit certificate hash was submitted to the <strong>Pharmacy Council of India (PCI)</strong> for approval of a separate Pharmacy division!
                      </li>
                    </ul>

                    {!freezeSuccess ? (
                      <button
                        className="btn btn-danger"
                        disabled={isFreezing}
                        onClick={handleEnforceFreeze}
                        style={{ marginTop: '12px', padding: '10px 16px', fontWeight: 800, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Lock size={16} />
                        <span>{isFreezing ? 'Transmitting Injunction to Bank Switch...' : 'Enforce Statutory NeSL Freeze & Freeze Institutional Approvals'}</span>
                      </button>
                    ) : (
                      <div style={{ marginTop: '12px', background: '#dcfce7', color: '#166534', padding: '8px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.82rem' }}>
                        ✓ Statutory NeSL Injunction Recorded in CAG Ledger. Bank and Inter-Council Clearinghouse Frozen.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Forensic Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', fontSize: '0.8rem' }}>
                {/* Node 1 Breakdown */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                      1. Depository Bank Switch
                    </span>
                    <span className="badge" style={{ 
                      background: radarData.nodes.bankOverdraftSwitch.activeLoanDetected ? '#fee2e2' : '#dcfce7', 
                      color: radarData.nodes.bankOverdraftSwitch.activeLoanDetected ? '#991b1b' : '#166534',
                      fontSize: '0.68rem'
                    }}>
                      {radarData.nodes.bankOverdraftSwitch.activeLoanDetected ? 'Active Overdraft' : 'Clean'}
                    </span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Facility: <strong>{radarData.nodes.bankOverdraftSwitch.facilityType}</strong>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '6px' }}>
                    Debt Drawn: <strong>{radarData.nodes.bankOverdraftSwitch.amountDrawn}</strong>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    {radarData.nodes.bankOverdraftSwitch.finding}
                  </p>
                </div>

                {/* Node 2 Breakdown */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                      2. Inter-Council Clearinghouse
                    </span>
                    <span className="badge" style={{ 
                      background: radarData.nodes.interCouncilRegistry.duplicatePledgeDetected ? '#fee2e2' : '#dcfce7', 
                      color: radarData.nodes.interCouncilRegistry.duplicatePledgeDetected ? '#991b1b' : '#166534',
                      fontSize: '0.68rem'
                    }}>
                      {radarData.nodes.interCouncilRegistry.duplicatePledgeDetected ? 'Duplicate Pledge' : 'Zero Duplicates'}
                    </span>
                  </div>
                  {radarData.nodes.interCouncilRegistry.pledgedAuthority && (
                    <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '4px' }}>
                      Pledged To: <strong>{radarData.nodes.interCouncilRegistry.pledgedAuthority}</strong>
                    </div>
                  )}
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '6px' }}>
                    Match Status: <strong>{radarData.nodes.interCouncilRegistry.status}</strong>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    {radarData.nodes.interCouncilRegistry.finding}
                  </p>
                </div>

                {/* Node 3 Breakdown */}
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                      3. NeSL & CERSAI Registry
                    </span>
                    <span className="badge" style={{ 
                      background: radarData.firstChargeVestedInAicte ? '#dcfce7' : '#fee2e2', 
                      color: radarData.firstChargeVestedInAicte ? '#166534' : '#991b1b',
                      fontSize: '0.68rem'
                    }}>
                      {radarData.neslChargeRank}
                    </span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '4px' }}>
                    First Charge: <strong>{radarData.nodes.neslCersaiRegistry.firstChargeHolder}</strong>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '6px' }}>
                    AICTE Priority: <strong>{radarData.nodes.neslCersaiRegistry.aicteChargeStatus}</strong>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    {radarData.nodes.neslCersaiRegistry.legalRiskNotice}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div style={{
          background: '#f8fafc',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.76rem',
          color: '#64748b'
        }}>
          <div>
            AICTE Regulation Bureau • National E-Governance Services Ltd (NeSL) Financial Collateral Registry Protocol
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
}
