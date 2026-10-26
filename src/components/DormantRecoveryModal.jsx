import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  GraduationCap, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Users,
  Award,
  AlertCircle
} from 'lucide-react';

export default function DormantRecoveryModal({ onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sweepingId, setSweepingId] = useState(null);

  const fetchDormantData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dormant-recovery/summary');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dormant recovery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDormantData();
  }, []);

  const handleSweep = async (institutionId) => {
    setSweepingId(institutionId);
    try {
      const res = await fetch('/api/dormant-recovery/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: institutionId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to sweep funds');

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      alert(json.message);
      await fetchDormantData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Sweep Error: ' + err.message);
    } finally {
      setSweepingId(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', padding: '0', background: '#ffffff', color: '#0f172a', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          background: '#064e3b',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #10b981'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#10b981',
                color: '#064e3b',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <GraduationCap size={15} />
                <span>AICTE SWASTIK ENGINE</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Defunct Institutional Asset Repatriation & Pragati Scholarship Corpus
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#a7f3d0', marginTop: '3px' }}>
              Statutory Asset Recovery: Repatriating abandoned 10-year security deposits from closed institutions into the AICTE Pragati & Saksham Student Scholarship Corpus.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 700 }}>REPATRIATED TO SCHOLARSHIPS</span>
                <DollarSign size={18} color="#059669" />
              </div>
              <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', marginTop: '4px' }}>
                ₹{data?.stats?.totalSweptCrores || '1.01'} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Crores</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '2px' }}>
                Principal + 10-Year Accumulated Interest
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700 }}>STUDENT SCHOLARSHIPS FUNDED</span>
                <Users size={18} color="#2563eb" />
              </div>
              <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1d4ed8', marginTop: '4px' }}>
                {data?.stats?.scholarshipsFundedCount || 2014} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Scholars</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#1d4ed8', marginTop: '2px' }}>
                AICTE Pragati (Girls) & Saksham
              </div>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#854d0e', fontWeight: 700 }}>PENDING STATUTORY SWEEPS</span>
                <Clock size={18} color="#d97706" />
              </div>
              <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
                ₹{data?.stats?.totalPendingCrores || '0.92'} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Crores</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '2px' }}>
                {data?.stats?.pendingCount || 2} Abandoned Deposits Queued
              </div>
            </div>
          </div>

          {/* Social Impact Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#fde047" />
                <strong style={{ fontSize: '0.92rem' }}>
                  Statutory Educational Repatriation Mandate (CAG Compliance)
                </strong>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#d1fae5', marginTop: '3px' }}>
                Instead of allowing defunct private college deposits to sit idle in commercial bank branches, AICTE exercises Section 10 lien recovery to empower economically disadvantaged female engineering students.
              </p>
            </div>
          </div>

          {/* Zombie Institutions Table */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.82rem', color: '#0f2e5a' }}>
              Defunct & Closed Institutions with Dormant Matured Security Deposits
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 14px' }}>Institution & AICTE PID</th>
                    <th style={{ padding: '10px 14px' }}>Depository Bank & FDR</th>
                    <th style={{ padding: '10px 14px' }}>Tenure</th>
                    <th style={{ padding: '10px 14px' }}>Closure Ground</th>
                    <th style={{ padding: '10px 14px' }}>Repatriation Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.institutions?.map((inst) => {
                    const isSwept = inst.status === 'SWEPT_TO_SCHOLARSHIP';
                    const amountCrores = ((inst.swept_amount || inst.accumulated_yield || inst.amount) / 100000).toFixed(1);

                    return (
                      <tr key={inst.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f2e5a' }}>{inst.institution_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            PID: <span className="font-mono">{inst.aicte_pid}</span> • {inst.region}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div>{inst.bank_name}</div>
                          <div className="font-mono" style={{ fontSize: '0.72rem', color: '#0284c7' }}>
                            {inst.fdr_number}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <span className="font-mono" style={{ fontWeight: 600 }}>{inst.tenure_completed_years} Yrs</span>
                        </td>

                        <td style={{ padding: '12px 14px', maxWidth: '200px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {inst.closure_reason}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {isSwept ? (
                            <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} />
                              <span>Swept (₹{amountCrores}L)</span>
                            </span>
                          ) : (
                            <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              <span>Pending (₹{amountCrores}L)</span>
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          {isSwept ? (
                            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                              ✓ {inst.scholarships_generated} Scholars Funded
                            </span>
                          ) : (
                            <button
                              className="btn btn-emerald btn-sm"
                              disabled={sweepingId === inst.id}
                              onClick={() => handleSweep(inst.id)}
                              style={{ fontSize: '0.74rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                            >
                              <GraduationCap size={13} />
                              <span>{sweepingId === inst.id ? 'Sweeping...' : 'Execute Sweep'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
            AICTE Approval Process Handbook (APH) • Section 10 Statutory Asset Repatriation & Scholarship Corpus
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
