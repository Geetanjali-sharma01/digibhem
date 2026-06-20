import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Avatar, StatusBadge } from './components';

function fmt(d) { return d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : ''; }

/* Doctor hover card component */
function DoctorHoverCard({ doctor, position }) {
  if (!doctor) return null;
  const rating = doctor.ratingCount ? (doctor.ratingSum / doctor.ratingCount).toFixed(1) : '—';
  
  return (
    <div style={{
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 1000,
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16,
      minWidth: 280,
      maxWidth: 320,
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Avatar name={doctor.name} size={50} photo={doctor.photo} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{doctor.name}</p>
          <p style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>{doctor.specialty}</p>
          <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{doctor.hospital}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 2 }}>Experience</p>
          <p style={{ fontSize: 13, fontWeight: 600 }}>{doctor.experience}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 2 }}>Fee</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>₹{doctor.fee}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 2 }}>Rating</p>
          <p style={{ fontSize: 13, fontWeight: 600 }}>⭐ {rating}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: 8 }}>
          <p style={{ fontSize: 10, color: 'var(--text-light)', marginBottom: 2 }}>Qualification</p>
          <p style={{ fontSize: 11, fontWeight: 600 }}>{doctor.qualification}</p>
        </div>
      </div>
      
      {doctor.available && (
        <div style={{ fontSize: 11, color: 'var(--success)', textAlign: 'center', padding: '6px 0', borderTop: '1px solid var(--border)' }}>
          ✓ Available for booking
        </div>
      )}
    </div>
  );
}

export default function HomePage({ setPage }) {
  const { user, myAppointments, doctors } = useApp();
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleDoctorHover = (doctorId, event) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.right + 10; // 10px to the right of the avatar
      const y = rect.top;
      
      // Adjust if card would go off-screen
      const adjustedX = x + 320 > window.innerWidth ? rect.left - 330 : x;
      const adjustedY = y + 300 > window.innerHeight ? window.innerHeight - 310 : y;
      
      setHoveredDoctor(doctor);
      setHoverPosition({ x: adjustedX, y: adjustedY });
    }
  };

  const handleDoctorLeave = () => {
    setHoveredDoctor(null);
  };

  const upcoming = myAppointments.filter(a=>['pending','accepted'].includes(a.status)).sort((a,b)=>a.date.localeCompare(b.date)||a.slot.localeCompare(b.slot));
  const recent   = [...myAppointments].sort((a,b)=>new Date(b.bookedAt)-new Date(a.bookedAt)).slice(0,3);

  const stats = [
    { label:'Total Booked',  val:myAppointments.length,                                      icon:'📋', color:'var(--teal)' },
    { label:'Upcoming',      val:upcoming.length,                                             icon:'📅', color:'var(--gold)' },
    { label:'Completed',     val:myAppointments.filter(a=>a.status==='completed').length,     icon:'✔',  color:'var(--success)' },
    { label:'Cancelled',     val:myAppointments.filter(a=>a.status==='cancelled').length,     icon:'✕',  color:'var(--danger)' },
  ];

  const hour = new Date().getHours();

  return (
    <div style={{ padding:'28px 32px', animation:'fadeIn 0.35s ease' }}>
      {/* Doctor hover card */}
      <DoctorHoverCard doctor={hoveredDoctor} position={hoverPosition} />

      <div style={{ marginBottom:28 }}>
        <p style={{ color:'var(--text-light)', fontSize:13 }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        <h1 style={{ fontSize:28 }}>{hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color:'var(--text-light)', marginTop:4 }}>Manage your healthcare appointments easily.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:28 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding:18, textAlign:'center' }}>
            <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:'var(--text-light)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:20 }}>
        {/* Upcoming */}
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontSize:16 }}>Upcoming</h3>
            <button onClick={()=>setPage('appointments')} style={{ background:'none', border:'none', color:'var(--teal)', fontSize:12, cursor:'pointer' }}>View all →</button>
          </div>
          {upcoming.length===0
            ? <p style={{ color:'var(--text-light)', fontSize:13 }}>No upcoming appointments.</p>
            : upcoming.slice(0,4).map(a => {
                const doctor = doctors.find(d => d.id === a.doctorId);
                return (
                  <div key={a.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ textAlign:'center', minWidth:40 }}>
                      <p style={{ fontSize:15, fontWeight:700, color:'var(--teal)' }}>{fmt(a.date)}</p>
                      <p style={{ fontSize:11, color:'var(--text-light)' }}>{a.slot}</p>
                    </div>
                    <div 
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onMouseEnter={(e) => handleDoctorHover(a.doctorId, e)}
                      onMouseLeave={handleDoctorLeave}
                    >
                      <Avatar name={a.doctorName} size={40} photo={doctor?.photo} />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:13 }}>{a.doctorName}</p>
                      <p style={{ fontSize:11, color:'var(--text-light)' }}>{a.doctorSpecialty}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })
          }
        </Card>

        {/* Quick actions */}
        <Card>
          <h3 style={{ fontSize:16, marginBottom:16 }}>Quick Actions</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <Btn onClick={()=>setPage('booking')} style={{ width:'100%', justifyContent:'center', padding:13 }}>📅 Book an Appointment</Btn>
            <Btn variant="outline" onClick={()=>setPage('appointments')} style={{ width:'100%', justifyContent:'center', padding:13 }}>📋 My Appointments</Btn>
            <Btn variant="ghost" onClick={()=>setPage('profile')} style={{ width:'100%', justifyContent:'center', padding:13 }}>👤 Edit Profile</Btn>
          </div>
          <div style={{ marginTop:16, padding:12, background:'rgba(0,180,166,0.07)', borderRadius:10, border:'1px solid rgba(0,180,166,0.18)' }}>
            <p style={{ fontSize:12, color:'var(--text-light)', lineHeight:1.6 }}>💡 <strong style={{ color:'var(--white)' }}>Tip:</strong> After your appointment is completed, you can rate your doctor and share your experience!</p>
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <Card>
          <h3 style={{ fontSize:16, marginBottom:14 }}>Recent Activity</h3>
          {recent.map(a => {
            const doctor = doctors.find(d => d.id === a.doctorId);
            return (
              <div key={a.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div 
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={(e) => handleDoctorHover(a.doctorId, e)}
                    onMouseLeave={handleDoctorLeave}
                  >
                    <Avatar name={a.doctorName} size={40} photo={doctor?.photo} />
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14 }}>{a.doctorName}</p>
                    <p style={{ fontSize:12, color:'var(--text-light)' }}>{a.doctorSpecialty} · {fmt(a.date)} {a.slot}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
