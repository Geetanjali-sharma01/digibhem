import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Avatar, Input, Modal, StatusBadge, StarRating, Toast, EmptyState, LoadingSpinner } from './components';

const SPECIALTIES = ['All','Cardiologist','Neurologist','Dermatologist','Orthopedic','Pediatrician','General Physician'];
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

function fmt(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

export default function BookingPage({ setPage }) {
  const { doctors, bookAppointment } = useApp();

  // Step 1 – pick doctor
  const [specialty, setSpecialty] = useState('All');
  const [search, setSearch]       = useState('');
  const [selDoc, setSelDoc]       = useState(null);

  // Step 2 – pick date
  const [selDate, setSelDate]     = useState('');

  // Step 3 – pick slot
  const [selSlot, setSelSlot]     = useState('');

  // Step 4 – fill details
  const [reason, setReason]       = useState('');
  const [symptoms, setSymptoms]   = useState('');

  // Step 5 – done
  const [booked, setBooked]       = useState(null);
  const [step, setStep]           = useState(1);
  const [toast, setToast]         = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Booked slots fetched from backend (pending/accepted appointments)
  const [bookedSlots, setBookedSlots] = useState({}); // { date: [slot1, slot2, ...] }
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Handle "Book Again" from appointments page
  useEffect(() => {
    if (window._bookAgainDoctor) {
      setSelDoc(window._bookAgainDoctor);
      setStep(2); // Automatically go to step 2 (date/slot selection)
      delete window._bookAgainDoctor;
    }
    if (window._viewDoctorProfile) {
      setSelDoc(window._viewDoctorProfile);
      setStep(1); // Show doctor selection with pre-selected doctor
      delete window._viewDoctorProfile;
    }
  }, []);

  // Fetch booked slots when a doctor is selected
  useEffect(() => {
    if (!selDoc) { setBookedSlots({}); return; }
    setLoadingSlots(true);
    fetch(`${BACKEND_URL}/api/appointments?doctor_code=${selDoc.id}`)
      .then(r => r.json())
      .then(data => {
        const taken = {};
        (Array.isArray(data) ? data : []).forEach(a => {
          if (a.status === 'pending' || a.status === 'accepted') {
            const d = a.appointment_date || a.date;
            const s = a.appointment_time || a.slot;
            if (d && s) {
              if (!taken[d]) taken[d] = [];
              taken[d].push(s);
            }
          }
        });
        setBookedSlots(taken);
      })
      .catch(() => setBookedSlots({}))
      .finally(() => setLoadingSlots(false));
  }, [selDoc?.id]);

  const filtered = useMemo(() => doctors.filter(d =>
    d.available &&
    (specialty === 'All' || d.specialty === specialty) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()))
  ), [doctors, specialty, search]);

  const isSlotBooked = (date, slot) => (bookedSlots[date] || []).includes(slot);
  const availDates = selDoc ? Object.keys(selDoc.slots).filter(d => {
    const allSlots = selDoc.slots[d] || [];
    const remaining = allSlots.filter(s => !isSlotBooked(d, s));
    return remaining.length > 0;
  }).sort() : [];
  const availSlots = selDoc && selDate ? (selDoc.slots[selDate] || []) : [];
  const allSlotsForDate = selDoc && selDate ? (selDoc.slots[selDate] || []) : [];

  const goBack = () => { if (step > 1) setStep(s=>s-1); };

  const handleBook = async () => {
    setLoadingBooking(true);
    try {
      const appt = await bookAppointment({ doctorId: selDoc.id, date: selDate, slot: selSlot, reason, symptoms });
      setBooked(appt);
      setStep(5);
      setToast({ msg: 'Appointment request sent!', type: 'success' });
    } catch (err) {
      setToast({ msg: err.message || 'Booking failed', type: 'error' });
    } finally {
      setLoadingBooking(false);
    }
  };

  const reset = () => { setSelDoc(null); setSelDate(''); setSelSlot(''); setReason(''); setSymptoms(''); setBooked(null); setBookedSlots({}); setStep(1); };

  /* ─── progress bar ─── */
  const steps = ['Doctor','Date & Time','Details','Confirm','Done'];

  return (
    <div style={{ padding:'28px 32px', animation:'fadeIn 0.35s ease', maxWidth:900, margin:'0 auto' }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <h1 style={{ fontSize:27, marginBottom:4 }}>📅 Book Appointment</h1>
      <p style={{ color:'var(--text-light)', marginBottom:26 }}>Follow the steps below to schedule your visit</p>

      {/* Progress */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
        {steps.map((s,i) => (
          <React.Fragment key={s}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700,
                background: step > i+1 ? 'var(--success)' : step === i+1 ? 'var(--teal)' : 'var(--surface)',
                color: step > i+1 ? 'var(--color-text-on-primary)' : step === i+1 ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                border: step === i+1 ? 'none' : '1.5px solid var(--surface-border)',
                transition:'all 0.3s',
              }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontSize:11, color: step===i+1 ? 'var(--teal)' : 'var(--text-light)', fontWeight: step===i+1?600:400, whiteSpace:'nowrap' }}>{s}</span>
            </div>
            {i < steps.length-1 && <div style={{ flex:1, height:2, background: step > i+1 ? 'var(--success)' : 'var(--surface-border)', margin:'0 4px 20px', transition:'all 0.3s' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Choose Doctor ── */}
      {step === 1 && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:200 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16 }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} onFocus={() => filtered.length > 0 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Search name or specialty…"
                style={{ width:'100%', padding:'10px 14px 10px 38px', background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text-primary)', fontSize:14 }} />
              {/* Autocomplete suggestions */}
              {search && filtered.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 9,
                  maxHeight: 250,
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {filtered.slice(0, 5).map(doc => (
                    <div
                      key={doc.id}
                      onMouseDown={() => {
                        setSelDoc(doc);
                        setSearch('');
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Avatar name={doc.name} size={36} photo={doc.photo} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{doc.specialty} · {doc.hospital}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>₹{doc.fee}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {SPECIALTIES.map(s => (
                <button key={s} onClick={()=>setSpecialty(s)} style={{
                  padding:'8px 14px', borderRadius:9, fontSize:12, cursor:'pointer', fontWeight: specialty===s?600:400,
                  background: specialty===s ? 'var(--teal)' : 'var(--card-bg)',
                  color: specialty===s ? 'var(--navy)' : 'var(--text-light)',
                  border: `1px solid ${specialty===s ? 'var(--teal)' : 'var(--border)'}`,
                }}>{s}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 && <EmptyState icon="🔍" title="No doctors found" sub="Try adjusting your search or specialty filter" />}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
            {filtered.map(doc => {
              const rating = doc.ratingCount ? (doc.ratingSum/doc.ratingCount).toFixed(1) : '—';
              return (
                <Card key={doc.id} style={{ cursor:'pointer', transition:'transform 0.2s,box-shadow 0.2s', border:`1px solid ${selDoc?.id===doc.id ? 'var(--teal)' : 'var(--border)'}` }}
                  onClick={() => setSelDoc(doc)}>
                  <div style={{ display:'flex', gap:14, marginBottom:14 }}>
                    <Avatar name={doc.name} size={50} photo={doc.photo} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:15 }}>{doc.name}</p>
                      <p style={{ fontSize:12, color:'var(--teal)', fontWeight:500 }}>{doc.specialty}</p>
                      <p style={{ fontSize:12, color:'var(--text-light)' }}>{doc.hospital}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontSize:13, color:'var(--text-light)' }}>⭐ {rating} · {doc.experience}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--gold)' }}>₹{doc.fee}</span>
                  </div>
                  <Btn style={{ width:'100%', justifyContent:'center' }}
                    variant={selDoc?.id===doc.id ? 'success' : 'primary'}>
                    {selDoc?.id===doc.id ? '✓ Selected' : 'Select Doctor'}
                  </Btn>
                </Card>
              );
            })}
          </div>

          {selDoc && (
            <div style={{ marginTop:22, display:'flex', justifyContent:'flex-end' }}>
              <Btn onClick={() => setStep(2)} style={{ padding:'12px 32px' }}>Next: Choose Date →</Btn>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Date & Time ── */}
      {step === 2 && selDoc && (
        <div>
          {/* Doctor Details Card */}
          <Card style={{ marginBottom:24, padding:24, background:'linear-gradient(135deg, var(--card-bg) 0%, rgba(14,165,233,0.05) 100%)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:16 }}>
              <Avatar name={selDoc.name} size={80} photo={selDoc.photo} />
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:22, marginBottom:4 }}>{selDoc.name}</h2>
                <p style={{ fontSize:15, color:'var(--teal)', fontWeight:600, marginBottom:8 }}>{selDoc.specialty}</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 16px', fontSize:13, color:'var(--text-light)' }}>
                  <span>🎓 {selDoc.qualification}</span>
                  <span>🏥 {selDoc.hospital}</span>
                  <span>⏱ {selDoc.experience} experience</span>
                  <span style={{ fontSize:16, fontWeight:700, color:'var(--gold)' }}>💰 ₹{selDoc.fee} / visit</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:13 }}>
              <span style={{ padding:'6px 12px', background:'rgba(14,165,233,0.1)', borderRadius:8, color:'var(--teal)' }}>
                ⭐ {(selDoc.ratingCount ? (selDoc.ratingSum/selDoc.ratingCount).toFixed(1) : '—')} rating
              </span>
              <span style={{ padding:'6px 12px', background:'rgba(16,185,129,0.1)', borderRadius:8, color:'var(--success)' }}>
                ✓ {selDoc.ratingCount || 0} reviews
              </span>
              <span style={{ padding:'6px 12px', background:'rgba(251,191,36,0.1)', borderRadius:8, color:'var(--gold)' }}>
                📅 10 slots/day
              </span>
            </div>
          </Card>

          <h3 style={{ fontSize:18, marginBottom:16, fontWeight:700 }}>📅 Select Appointment Date</h3>
          {loadingSlots
            ? <LoadingSpinner text="Loading availability..." />
            : availDates.length === 0
            ? <EmptyState icon="📭" title="No available dates" sub="This doctor has no open slots currently." />
            : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:28 }}>
                {availDates.map(d => {
                  const dt = new Date(d + 'T00:00:00');
                  const isSelected = selDate === d;
                  const totalSlots = (selDoc.slots[d] || []).length;
                  const bookedCount = (bookedSlots[d] || []).length;
                  const freeCount = totalSlots - bookedCount;
                  return (
                    <button key={d} onClick={() => { setSelDate(d); setSelSlot(''); }} style={{
                      padding:'12px 18px', borderRadius:11, cursor:'pointer', textAlign:'center', minWidth:100,
                      background: isSelected ? 'var(--teal)' : 'var(--card-bg)',
                      color: isSelected ? 'var(--color-text-inverse)' : 'var(--color-text)',
                      border: `1.5px solid ${isSelected ? 'var(--teal)' : 'var(--border)'}`,
                      fontWeight: isSelected ? 700 : 400, transition:'all 0.2s',
                    }}>
                      <div style={{ fontSize:12, marginBottom:2 }}>{dt.toLocaleDateString('en-IN',{weekday:'short'})}</div>
                      <div style={{ fontSize:18, fontWeight:700 }}>{dt.getDate()}</div>
                      <div style={{ fontSize:11 }}>{dt.toLocaleDateString('en-IN',{month:'short'})}</div>
                      <div style={{ fontSize:10, marginTop:3, color: isSelected ? 'var(--navy)' : 'var(--text-light)' }}>{freeCount} slots</div>
                    </button>
                  );
                })}
              </div>
            )
          }

          {selDate && (
            <>
              <h3 style={{ fontSize:16, marginBottom:14 }}>Select a Time Slot</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:9, marginBottom:24 }}>
                {allSlotsForDate.map(s => {
                  const taken = isSlotBooked(selDate, s);
                  const isSelected = selSlot === s;
                  return (
                    <button key={s}
                      onClick={() => { if (!taken) setSelSlot(s); }}
                      disabled={taken}
                      style={{
                        padding:'10px 20px', borderRadius:9, fontSize:14,
                        fontWeight: isSelected ? 700 : taken ? 400 : 400,
                        background: taken ? 'var(--surface)' : isSelected ? 'var(--teal)' : 'var(--card-bg)',
                        color: taken ? 'var(--text-light)' : isSelected ? 'var(--navy)' : 'var(--text-primary)',
                        border: `1.5px solid ${taken ? 'var(--surface-border)' : isSelected ? 'var(--teal)' : 'var(--border)'}`,
                        cursor: taken ? 'not-allowed' : 'pointer',
                        opacity: taken ? 0.5 : 1,
                        textDecoration: taken ? 'line-through' : 'none',
                        position: 'relative',
                      }}>
                      🕐 {s}
                      {taken && <span style={{ display:'block', fontSize:9, color:'var(--danger)', marginTop:2, textDecoration:'none' }}>Unavailable</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={goBack}>← Back</Btn>
            <Btn disabled={!selDate||!selSlot} onClick={() => setStep(3)}>Next: Fill Details →</Btn>
          </div>
        </div>
      )}

      {/* ── STEP 3: Details ── */}
      {step === 3 && (
        <div>
          <Card style={{ marginBottom:20 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <Avatar name={selDoc.name} size={44} photo={selDoc.photo} />
              <div>
                <p style={{ fontWeight:700 }}>{selDoc.name} · {selDoc.specialty}</p>
                <p style={{ fontSize:13, color:'var(--teal)' }}>📅 {fmt(selDate)} &nbsp;🕐 {selSlot}</p>
              </div>
            </div>
          </Card>
          <Input label="Reason for Visit" placeholder="e.g. Regular checkup, follow-up, new issue" value={reason} onChange={e=>setReason(e.target.value)} />
          <Input label="Current Symptoms (optional)" textarea placeholder="Describe any symptoms, duration, severity…" value={symptoms} onChange={e=>setSymptoms(e.target.value)} />
          <div style={{ display:'flex', gap:10, justifyContent:'space-between', marginTop:8 }}>
            <Btn variant="ghost" onClick={goBack}>← Back</Btn>
            <Btn disabled={!reason.trim()} onClick={() => setStep(4)}>Review Booking →</Btn>
          </div>
        </div>
      )}

      {/* ── STEP 4: Confirm ── */}
      {step === 4 && (
        <div>
          <h3 style={{ fontSize:17, marginBottom:18 }}>Confirm your appointment</h3>
          <Card style={{ marginBottom:18 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              {[
                ['Doctor',    selDoc.name],
                ['Specialty', selDoc.specialty],
                ['Hospital',  selDoc.hospital],
                ['Date',      fmt(selDate)],
                ['Time',      selSlot],
                ['Fee',       `₹${selDoc.fee}`],
                ['Reason',    reason],
                ['Symptoms',  symptoms || '—'],
              ].map(([k,v]) => (
                <tr key={k} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 8px', fontSize:13, color:'var(--text-light)', width:'35%', verticalAlign:'top' }}>{k}</td>
                  <td style={{ padding:'10px 8px', fontSize:14, fontWeight:500, verticalAlign:'top' }}>{v}</td>
                </tr>
              ))}
            </table>
          </Card>
          <p style={{ fontSize:13, color:'var(--text-light)', marginBottom:20 }}>⚠️ Your request will be sent to the doctor for confirmation.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
            <Btn variant="ghost" onClick={goBack}>← Back</Btn>
            <Btn variant="success" onClick={handleBook} disabled={loadingBooking} style={{ padding:'12px 32px' }}>
              {loadingBooking ? '⏳ Booking...' : '✓ Confirm Booking'}
            </Btn>
          </div>
        </div>
      )}

      {/* ── STEP 5: Done ── */}
      {step === 5 && booked && (
        <div style={{ textAlign:'center', padding:'20px 0' }}>
          <div style={{ fontSize:70, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontSize:26, marginBottom:8 }}>Booking Request Sent!</h2>
          <p className="text-muted" style={{ marginBottom: 24, fontSize: 15 }}>Waiting for <strong style={{ color: 'var(--color-text)' }}>{booked.doctorName}</strong> to confirm your appointment.</p>
          <Card style={{ maxWidth:400, margin:'0 auto 28px', textAlign:'left' }}>
            {[['Date', fmt(booked.date)], ['Time', booked.slot], ['Status', '⏳ Pending confirmation']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:13, color:'var(--text-light)' }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn onClick={reset}>Book Another</Btn>
            <Btn variant="ghost" onClick={() => setPage('appointments')}>View My Appointments</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
