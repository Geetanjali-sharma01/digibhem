import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Avatar, StatusBadge, Modal, StarRating, Toast, EmptyState } from './components';
import { calculateAge, copyToClipboard, formatAppointmentDetails, downloadICS, downloadAppointmentPDF } from './utils';

function fmt(d) { return d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}) : ''; }

export default function AppointmentsPage({ setPage }) {
  const { myAppointments, cancelAppointment, rescheduleAppointment, rateAppointment, doctors } = useApp();
  const [filter, setFilter] = useState('all');
  const [reschedModal, setReschedModal] = useState(null);
  const [rateModal, setRateModal]       = useState(null);
  const [detailModal, setDetailModal]   = useState(null);
  const [newDate, setNewDate]   = useState('');
  const [newSlot, setNewSlot]   = useState('');
  const [ratingVal, setRatingVal] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [toast, setToast] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const tabs = [
    { id:'all',       label:'All' },
    { id:'pending',   label:'Pending' },
    { id:'accepted',  label:'Accepted' },
    { id:'completed', label:'Completed' },
    { id:'cancelled', label:'Cancelled' },
  ];

  const list = filter === 'all' ? myAppointments : myAppointments.filter(a => a.status === filter);
  const sorted = [...list].sort((a,b) => new Date(b.bookedAt) - new Date(a.bookedAt));
  
  // Debug: Log cancelled appointments
  if (filter === 'cancelled') {
    console.log('Cancelled filter active');
    console.log('Total appointments:', myAppointments.length);
    console.log('Cancelled appointments:', myAppointments.filter(a => a.status === 'cancelled'));
    console.log('List to display:', list);
  }

  const getDoc = id => doctors.find(d => d.id === id);

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      setLoadingAction(id);
      await cancelAppointment(id);
      setToast({ msg:'Appointment cancelled', type:'error' });
      setLoadingAction(null);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newSlot) return;
    setLoadingAction(reschedModal.id);
    await rescheduleAppointment(reschedModal.id, newDate, newSlot);
    setReschedModal(null); setNewDate(''); setNewSlot('');
    setToast({ msg:'Appointment rescheduled', type:'success' });
    setLoadingAction(null);
  };

  const handleRate = () => {
    if (!ratingVal) return;
    rateAppointment(rateModal.id, ratingVal, reviewText);
    setRateModal(null); setRatingVal(0); setReviewText('');
    setToast({ msg:'Thank you for your rating!', type:'success' });
  };

  const reschedDoc = reschedModal && getDoc(reschedModal.doctorId);
  const reschedDates = reschedDoc ? Object.keys(reschedDoc.slots).filter(d => reschedDoc.slots[d].length > 0).sort() : [];
  const reschedSlots = reschedDoc && newDate ? (reschedDoc.slots[newDate] || []) : [];

  return (
    <div style={{ padding:'28px 32px', animation:'fadeIn 0.35s ease' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <h1 style={{ fontSize:27 }}>📋 My Appointments</h1>
        <Btn onClick={() => setPage('booking')}>+ Book New</Btn>
      </div>
      <p style={{ color:'var(--text-light)', marginBottom:24 }}>Track and manage all your appointments</p>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {tabs.map(t => {
          const cnt = t.id==='all' ? myAppointments.length : myAppointments.filter(a=>a.status===t.id).length;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding:'8px 16px', borderRadius:9, fontSize:13, cursor:'pointer', fontWeight: filter===t.id?600:400,
              background: filter===t.id ? 'var(--teal)' : 'var(--card-bg)',
              color: filter===t.id ? 'var(--navy)' : 'var(--text-light)',
              border: `1px solid ${filter===t.id ? 'var(--teal)' : 'var(--border)'}`,
            }}>{t.label} {cnt > 0 && <span style={{ marginLeft:4, background: filter===t.id?'rgba(0,0,0,0.15)':'var(--surface)', padding:'1px 7px', borderRadius:20, fontSize:11 }}>{cnt}</span>}</button>
          );
        })}
      </div>

      {sorted.length === 0
        ? <EmptyState icon="📭" title="No appointments" sub="You have no appointments in this category." action={<Btn onClick={()=>setPage('booking')}>Book Your First Appointment</Btn>} />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sorted.map(appt => {
              const doc = getDoc(appt.doctorId);
              const canCancel    = ['pending','accepted'].includes(appt.status);
              const canResched   = ['pending','accepted'].includes(appt.status);
              const canRate      = appt.status === 'completed' && !appt.rating;
              const alreadyRated = appt.status === 'completed' && appt.rating;

              return (
                <Card key={appt.id} style={{ 
                  transition:'box-shadow 0.2s',
                  border: appt.status === 'completed' ? '1px solid rgba(46,184,126,0.3)' : 
                          appt.status === 'cancelled' ? '1px solid rgba(224,92,92,0.3)' : undefined,
                  background: appt.status === 'completed' ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(46,184,126,0.05) 100%)' :
                              appt.status === 'cancelled' ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(224,92,92,0.05) 100%)' : undefined,
                  opacity: appt.status === 'cancelled' ? 0.85 : 1,
                }}>
                  <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                    <Avatar name={appt.doctorName} size={48} />
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:6 }}>
                        <div>
                          <p style={{ fontWeight:700, fontSize:15 }}>{appt.doctorName}</p>
                          <p style={{ fontSize:13, color:'var(--teal)' }}>{appt.doctorSpecialty}</p>
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>
                      <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:10 }}>
                        <span style={{ fontSize:13, color:'var(--text-light)' }}>📅 {fmt(appt.date)}</span>
                        <span style={{ fontSize:13, color:'var(--text-light)' }}>🕐 {appt.slot}</span>
                        <span style={{ fontSize:13, color:'var(--gold)' }}>₹{appt.doctorFee !== undefined && appt.doctorFee !== null ? appt.doctorFee : 'N/A'}</span>
                      </div>
                      {appt.reason && <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:6 }}>📝 {appt.reason}</p>}
                      {appt.doctorNote && <p style={{ fontSize:12, color:'var(--teal)', background:'rgba(14,165,233,0.08)', padding:'6px 10px', borderRadius:7, marginBottom:8 }}>👨‍⚕️ Doctor's note: {appt.doctorNote}</p>}
                      {alreadyRated && (
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, padding:'8px 12px', background:'rgba(255,204,0,0.08)', borderRadius:7 }}>
                          <span style={{ fontSize:12 }}>⭐</span>
                          <StarRating value={appt.rating} size={16} />
                          <span style={{ fontSize:12, color:'var(--text-light)' }}>{appt.review || 'No review'}</span>
                        </div>
                      )}
                      {appt.status === 'completed' && !alreadyRated && (
                        <div style={{ fontSize:12, color:'var(--gold)', background:'rgba(255,204,0,0.08)', padding:'6px 10px', borderRadius:7, marginBottom:8 }}>
                          ⭐ Don't forget to rate your experience!
                        </div>
                      )}
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                        <Btn small variant="ghost" onClick={() => setDetailModal(appt)}>View Details</Btn>
                        {canResched && <Btn small variant="outline" onClick={() => { setReschedModal(appt); setNewDate(''); setNewSlot(''); }} disabled={loadingAction===appt.id}>Reschedule</Btn>}
                        {canCancel  && <Btn small variant="danger" onClick={() => handleCancel(appt.id)} disabled={loadingAction===appt.id}>{loadingAction===appt.id ? 'Cancelling...' : 'Cancel'}</Btn>}
                        {canRate    && <Btn small variant="gold"   onClick={() => { setRateModal(appt); setRatingVal(0); setReviewText(''); }}>⭐ Rate</Btn>}
                        
                        {/* Action buttons based on appointment status */}
                        {appt.status === 'completed' ? (
                          // Completed appointment actions
                          <>
                            <Btn small variant="primary" onClick={() => {
                              const doc = doctors.find(d => d.id === appt.doctorId);
                              if (doc) {
                                window._bookAgainDoctor = doc;
                                setPage('booking');
                              }
                            }}>🔄 Book Again</Btn>
                            <Btn small variant="ghost" onClick={() => downloadAppointmentPDF(appt)}>📄 Download Summary</Btn>
                            {doc && <Btn small variant="ghost" onClick={() => {
                              window._viewDoctorProfile = doc;
                              setPage('booking');
                            }}>👨‍⚕️ View Doctor</Btn>}
                          </>
                        ) : (
                          // Non-completed appointment actions
                          <>
                            <Btn small variant="ghost" onClick={async () => {
                              const success = await copyToClipboard(formatAppointmentDetails(appt));
                              setToast({ msg: success ? 'Details copied!' : 'Failed to copy', type: success ? 'success' : 'error' });
                            }}>📋 Copy</Btn>
                            <Btn small variant="ghost" onClick={() => downloadICS(appt)}>📅 Add to Calendar</Btn>
                            <Btn small variant="ghost" onClick={() => downloadAppointmentPDF(appt)}>📄 Export</Btn>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title="Appointment Details">
        {detailModal && (
          <div>
            {[['Doctor',    detailModal.doctorName],
              ['Specialty', detailModal.doctorSpecialty],
              ['Date',      fmt(detailModal.date)],
              ['Time',      detailModal.slot],
              ['Fee',       `₹${detailModal.doctorFee !== undefined && detailModal.doctorFee !== null ? detailModal.doctorFee : 'N/A'}`],
              ['Status',    detailModal.status],
              ['Reason',    detailModal.reason],
              ['Symptoms',  detailModal.symptoms || '—'],
              ['Booked on', new Date(detailModal.bookedAt).toLocaleString('en-IN')],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ width:110, fontSize:13, color:'var(--text-light)', flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:500 }}>{v}</span>
              </div>
            ))}
            {detailModal.doctorNote && <p style={{ marginTop:14, fontSize:13, color:'var(--teal)', background:'rgba(14,165,233,0.08)', padding:'10px', borderRadius:8 }}>👨‍⚕️ {detailModal.doctorNote}</p>}
            {detailModal.rating && (
              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:6 }}>Your rating:</p>
                <StarRating value={detailModal.rating} size={20} />
                {detailModal.review && <p style={{ fontSize:13, marginTop:6, fontStyle:'italic' }}>"{detailModal.review}"</p>}
              </div>
            )}
            
            {/* Status-specific actions in detail modal */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
              {detailModal.status === 'completed' ? (
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Btn onClick={() => {
                    const doc = doctors.find(d => d.id === detailModal.doctorId);
                    if (doc) {
                      window._bookAgainDoctor = doc;
                      setDetailModal(null);
                      setPage('booking');
                    }
                  }}>🔄 Book Again with {detailModal.doctorName}</Btn>
                  <Btn variant="ghost" onClick={() => downloadAppointmentPDF(detailModal)}>📄 Download Summary</Btn>
                </div>
              ) : (
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Btn variant="ghost" onClick={async () => {
                    const success = await copyToClipboard(formatAppointmentDetails(detailModal));
                    setToast({ msg: success ? 'Details copied!' : 'Failed to copy', type: success ? 'success' : 'error' });
                  }}>📋 Copy Details</Btn>
                  {['pending', 'accepted'].includes(detailModal.status) && (
                    <Btn variant="ghost" onClick={() => downloadICS(detailModal)}>📅 Add to Calendar</Btn>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={!!reschedModal} onClose={() => setReschedModal(null)} title="Reschedule Appointment">
        {reschedModal && reschedDoc && (
          <div>
            <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:18 }}>Current: {fmt(reschedModal.date)} at {reschedModal.slot}</p>
            <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Choose new date:</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
              {reschedDates.map(d => (
                <button key={d} onClick={() => { setNewDate(d); setNewSlot(''); }} style={{
                  padding:'8px 14px', borderRadius:9, fontSize:13, cursor:'pointer',
                  background: newDate===d ? 'var(--teal)' : 'var(--card-bg)',
                  color: newDate===d ? 'var(--navy)' : 'var(--text-primary)',
                  border: `1px solid ${newDate===d ? 'var(--teal)' : 'var(--border)'}`,
                  fontWeight: newDate===d?700:400,
                }}>{fmt(d)}</button>
              ))}
              {reschedDates.length===0 && <p style={{ color:'var(--text-light)', fontSize:13 }}>No available dates.</p>}
            </div>
            {newDate && (
              <>
                <p style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Choose new time:</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                  {reschedSlots.map(s => (
                    <button key={s} onClick={() => setNewSlot(s)} style={{
                      padding:'8px 16px', borderRadius:9, fontSize:13, cursor:'pointer',
                      background: newSlot===s ? 'var(--teal)' : 'var(--card-bg)',
                      color: newSlot===s ? 'var(--navy)' : 'var(--text-primary)',
                      border: `1px solid ${newSlot===s ? 'var(--teal)' : 'var(--border)'}`,
                      fontWeight: newSlot===s?700:400,
                    }}>{s}</button>
                  ))}
                </div>
              </>
            )}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <Btn variant="ghost" onClick={() => setReschedModal(null)}>Cancel</Btn>
              <Btn disabled={!newDate||!newSlot} onClick={handleReschedule}>Confirm Reschedule</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Rate Modal */}
      <Modal isOpen={!!rateModal} onClose={() => setRateModal(null)} title="Rate Your Appointment">
        {rateModal && (
          <div>
            <p style={{ fontSize:14, marginBottom:6 }}>How was your experience with <strong>{rateModal.doctorName}</strong>?</p>
            <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:22 }}>{fmt(rateModal.date)} at {rateModal.slot}</p>
            <div style={{ marginBottom:20, textAlign:'center' }}>
              <StarRating value={ratingVal} onChange={setRatingVal} size={38} />
              <p style={{ fontSize:13, color:'var(--text-light)', marginTop:8 }}>
                {ratingVal === 1 ? 'Poor' : ratingVal === 2 ? 'Fair' : ratingVal === 3 ? 'Good' : ratingVal === 4 ? 'Very Good' : ratingVal === 5 ? 'Excellent!' : 'Tap to rate'}
              </p>
            </div>
            <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Write a short review (optional)…"
              rows={3} style={{ 
                width:'100%', 
                padding:'10px 13px', 
                background:'var(--surface)', 
                border:'1.5px solid var(--surface-border)', 
                borderRadius:9, 
                color:'var(--text-primary)', 
                fontSize:14, 
                resize:'vertical', 
                marginBottom:16,
                outline:'none'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--surface-border)'}
            />
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <Btn variant="ghost" onClick={() => setRateModal(null)}>Skip</Btn>
              <Btn variant="gold" disabled={!ratingVal} onClick={handleRate}>Submit Rating</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
