import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Input, Divider, StatusBadge, StarRating, Avatar, Modal, Toast } from './components';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'appointments', label: 'Appointments', icon: '📋' },
  { id: 'doctors', label: 'Doctors', icon: '🩺' },
  { id: 'patients', label: 'Patients', icon: '🏥' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
];

/* ─── Stat Card ─── */
function StatCard({ label, value, icon, color }) {
  return (
    <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
        </div>
        {icon && <div style={{ fontSize: 28, opacity: 0.7 }}>{icon}</div>}
      </div>
    </Card>
  );
}

/* ─── Status Bar ─── */
function StatusBar({ appointments }) {
  const total = appointments.length || 1;
  const counts = { pending: 0, accepted: 0, completed: 0, rejected: 0, cancelled: 0 };
  appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  const colors = { pending: 'var(--gold)', accepted: 'var(--success)', completed: 'var(--teal)', rejected: 'var(--danger)', cancelled: 'var(--text-light)' };

  return (
    <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Appointment Status Distribution</h3>
      <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
        {Object.entries(counts).filter(([, v]) => v > 0).map(([key, val]) => (
          <div key={key} title={`${key}: ${val} (${((val / total) * 100).toFixed(1)}%)`} style={{ width: `${(val / total) * 100}%`, background: colors[key], transition: 'width 0.4s', minWidth: val > 0 ? 8 : 0, cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-light)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[key], flexShrink: 0 }} />
            {key.charAt(0).toUpperCase() + key.slice(1)}: <strong style={{ color: 'var(--text-primary)' }}>{val}</strong>
            <span style={{ fontSize: 11 }}>({((val / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── Recent Activity ─── */
function RecentActivity({ appointments }) {
  const recent = [...appointments].sort((a, b) => (b.bookedAt || b.booked_at || '').localeCompare(a.bookedAt || a.booked_at || '')).slice(0, 6);
  return (
    <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Recent Activity</h3>
      {!recent.length && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No appointments yet.</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {recent.map(appt => (
          <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {appt.patientName || 'Patient'} → {appt.doctorName || 'Doctor'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                {appt.date || '—'} at {appt.slot || '—'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <StatusBadge status={appt.status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ appointments, doctors, patients, todaysDate }) {
  const todayAppointments = appointments.filter(a => a.date === todaysDate);
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const cancellationRate = appointments.length > 0 ? ((cancelledCount / appointments.length) * 100).toFixed(1) : '0.0';

  // Specialty demand - use doctorId which is normalized from doctor_code
  const specialtyDemand = {};
  doctors.forEach(d => {
    const count = appointments.filter(a => a.doctorId === d.id).length;
    specialtyDemand[d.specialty] = (specialtyDemand[d.specialty] || 0) + count;
  });
  const topSpecialties = Object.entries(specialtyDemand).sort((a, b) => b[1] - a[1]);

  // Busiest doctors
  const doctorAppointmentCounts = doctors.map(d => ({
    ...d,
    appointmentCount: appointments.filter(a => a.doctorId === d.id).length,
  })).sort((a, b) => b.appointmentCount - a.appointmentCount).slice(0, 5);

  // Booking trends (last 7 days)
  const trends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const count = appointments.filter(a => a.date === dateStr).length;
    trends.push({ date: dateStr, label: dayLabel, count });
  }
  const maxTrend = Math.max(...trends.map(t => t.count), 1);

  return (
    <div>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Patients" value={patients.length} icon="👥" />
        <StatCard label="Total Doctors" value={doctors.length} icon="🩺" />
        <StatCard label="Total Appointments" value={appointments.length} icon="📋" />
        <StatCard label="Today's Appointments" value={todayAppointments.length} icon="📅" />
        <StatCard label="Pending Requests" value={pendingCount} icon="⏳" />
        <StatCard label="Completed" value={completedCount} icon="✔" />
        <StatCard label="Cancelled" value={cancelledCount} icon="✕" />
        <StatCard label="Cancellation Rate" value={`${cancellationRate}%`} icon="📊" />
      </div>

      {/* Status Distribution + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <StatusBar appointments={appointments} />
        <RecentActivity appointments={appointments} />
      </div>

      {/* Booking Trends Chart */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Booking Trends (Last 7 Days)</h3>
        {!appointments.length && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No booking data yet.</div>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 16 }}>
          {trends.map((t, idx) => (
            <div key={t.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {t.count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)' }}>{t.count}</span>
              )}
              <div style={{ 
                width: '100%', 
                height: `${Math.max((t.count / maxTrend) * 100, t.count > 0 ? 8 : 2)}%`, 
                background: t.date === todaysDate ? 'var(--teal)' : 'rgba(14,165,233,0.5)', 
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.4s ease',
                minHeight: t.count > 0 ? 8 : 2,
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: t.date === todaysDate ? 700 : 400 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Busiest Doctors + Specialty Demand */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Busiest Doctors */}
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>🏆 Busiest Doctors</h3>
          {!doctorAppointmentCounts.length && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No data yet.</div>}
          <div style={{ display: 'grid', gap: 10 }}>
            {doctorAppointmentCounts.map((doc, idx) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: idx === 0 ? 'var(--color-warning)' : idx === 1 ? 'var(--color-text-muted)' : idx === 2 ? 'var(--color-accent)' : 'var(--color-text-muted)', minWidth: 24 }}>
                  #{idx + 1}
                </span>
                <Avatar name={doc.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{doc.specialty}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{doc.appointmentCount}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Specialty Demand */}
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Specialty Demand</h3>
          {!topSpecialties.length && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No booking data yet.</div>}
          <div style={{ display: 'grid', gap: 12 }}>
            {topSpecialties.map(([specialty, count]) => {
              const maxCount = topSpecialties[0]?.[1] || 1;
              return (
                <div key={specialty}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{specialty}</span>
                    <strong>{count} booking{count !== 1 ? 's' : ''}</strong>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: 'var(--teal)', borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── Appointments Tab ─── */
function AppointmentsTab({ appointments, doctors, onStatusChange }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const filtered = appointments.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterDoctor !== 'all' && (a.doctorId || a.doctor_code) !== filterDoctor) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = (a.patientName || '').toLowerCase().includes(term)
        || (a.doctorName || '').toLowerCase().includes(term)
        || (a.reason || '').toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => (b.bookedAt || b.booked_at || '').localeCompare(a.bookedAt || a.booked_at || ''));

  const handleAction = async (apptId, action) => {
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`${BACKEND_URL}/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(action),
      });
      if (resp.ok) {
        setToast({ message: `Appointment ${action.status}`, type: 'success' });
        if (onStatusChange) onStatusChange();
      } else {
        setToast({ message: 'Action failed', type: 'error' });
      }
    } catch (e) {
      setToast({ message: 'Network error', type: 'error' });
    }
    setConfirmModal(null);
  };

  return (
    <div>
      {/* Filters */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input label="Search" placeholder="Patient, doctor, or reason..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={{ minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Doctor</label>
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="input-field">
              <option value="all">All Doctors</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
        Showing {filtered.length} of {appointments.length} appointments
      </div>

      {/* Appointments Table */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt, idx) => (
                <tr key={appt.id}>
                  <td>{appt.patientName || 'Unknown'}</td>
                  <td>{appt.doctorName || '—'}</td>
                  <td className="text-primary-color">{appt.doctorSpecialty || '—'}</td>
                  <td>{appt.date || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{appt.slot || '—'}</td>
                  <td><StatusBadge status={appt.status} /></td>
                  <td>{appt.patientPhone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {appt.status === 'pending' && (
                        <>
                          <Btn tiny variant="success" onClick={() => setConfirmModal({ appt, action: { status: 'accepted' }, label: 'Accept' })}>✓</Btn>
                          <Btn tiny variant="danger" onClick={() => setConfirmModal({ appt, action: { status: 'rejected' }, label: 'Reject' })}>✕</Btn>
                        </>
                      )}
                      {(appt.status === 'pending' || appt.status === 'accepted') && (
                        <Btn tiny variant="ghost" onClick={() => setConfirmModal({ appt, action: { status: 'cancelled' }, label: 'Cancel' })}>Cancel</Btn>
                      )}
                      {appt.status === 'accepted' && (
                        <Btn tiny variant="primary" onClick={() => setConfirmModal({ appt, action: { status: 'completed' }, label: 'Complete' })}>✔</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>No appointments match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm Modal */}
      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Action">
        {confirmModal && (
          <div>
            <p style={{ marginBottom: 20, fontSize: 14 }}>
              Are you sure you want to <strong>{confirmModal.label.toLowerCase()}</strong> the appointment for <strong>{confirmModal.appt.patientName}</strong> with <strong>{confirmModal.appt.doctorName}</strong> on {confirmModal.appt.date}?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Btn>
              <Btn variant={confirmModal.action.status === 'accepted' || confirmModal.action.status === 'completed' ? 'success' : confirmModal.action.status === 'rejected' ? 'danger' : 'primary'} onClick={() => handleAction(confirmModal.appt.id, confirmModal.action)}>
                {confirmModal.label}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ─── Doctors Tab ─── */
function DoctorsTab({ doctors, appointments }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const doctorData = doctors.map(d => {
    const docAppts = appointments.filter(a => a.doctorId === d.id || a.doctor_code === d.id);
    const pending = docAppts.filter(a => a.status === 'pending').length;
    const accepted = docAppts.filter(a => a.status === 'accepted').length;
    const completed = docAppts.filter(a => a.status === 'completed').length;
    const rejected = docAppts.filter(a => a.status === 'rejected').length;
    const avgRating = d.ratingCount ? (d.ratingSum / d.ratingCount).toFixed(1) : 'N/A';
    return { ...d, totalAppts: docAppts.length, pending, accepted, completed, rejected, avgRating, appts: docAppts };
  });

  return (
    <div>
      {/* Doctors Table */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialty</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qualification</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hospital</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctorData.map((doc, idx) => (
                <tr key={doc.id} className="clickable-row" onClick={() => setSelectedDoc(doc)}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={doc.name} size={36} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{doc.experience} exp</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--teal)', fontWeight: 500 }}>{doc.specialty}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>{doc.qualification || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>{doc.hospital || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>₹{doc.fee || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{doc.totalAppts}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ background: doc.pending > 0 ? 'rgba(251,191,36,0.15)' : 'transparent', padding: '4px 10px', borderRadius: 12, color: doc.pending > 0 ? 'var(--gold)' : 'var(--text-light)', fontWeight: 600 }}>
                      {doc.pending}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ background: doc.completed > 0 ? 'rgba(16,185,129,0.15)' : 'transparent', padding: '4px 10px', borderRadius: 12, color: doc.completed > 0 ? 'var(--success)' : 'var(--text-light)', fontWeight: 600 }}>
                      {doc.completed}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <span style={{ color: 'var(--gold)' }}>⭐</span>
                      <strong>{doc.avgRating}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Btn tiny variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}>View</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Doctor Detail Modal */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={selectedDoc?.name || ''} wide>
        {selectedDoc && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Specialty</div>
                <div style={{ fontWeight: 600 }}>{selectedDoc.specialty}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Qualification</div>
                <div style={{ fontWeight: 600 }}>{selectedDoc.qualification || '—'}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Hospital</div>
                <div style={{ fontWeight: 600 }}>{selectedDoc.hospital || '—'}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Experience</div>
                <div style={{ fontWeight: 600 }}>{selectedDoc.experience || '—'}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Consultation Fee</div>
                <div style={{ fontWeight: 600 }}>₹{selectedDoc.fee || '—'}</div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>{selectedDoc.avgRating}</strong>
                  <StarRating value={selectedDoc.ratingCount ? Math.round(selectedDoc.ratingSum / selectedDoc.ratingCount) : 0} size={16} />
                </div>
              </div>
            </div>

            <Divider label="Appointment History" />
            <div style={{ display: 'grid', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {selectedDoc.appts.length === 0 && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No appointments yet.</div>}
              {selectedDoc.appts.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{a.patientName || 'Patient'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 8 }}>{a.date} at {a.slot}</span>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── Patients Tab ─── */
function PatientsTab({ patients, appointments }) {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const enriched = patients.map(p => {
    const pAppts = appointments.filter(a => String(a.patient_id || a.patientId) === String(p.id) || String(a.patientId) === String(p.user_id));
    return { ...p, appointmentCount: pAppts.length, appts: pAppts };
  });

  const filtered = enriched.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(term)
      || (p.email || '').toLowerCase().includes(term)
      || (p.phone || '').includes(term)
      || (p.blood || '').toLowerCase().includes(term);
  });

  return (
    <div>
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '16px 20px', marginBottom: 16 }}>
        <Input label="Search patients" placeholder="Name, email, phone, or blood group..." value={search} onChange={e => setSearch(e.target.value)} />
      </Card>

      <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
        {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Patients Table */}
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blood</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DOB</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Appointments</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allergies</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} className="clickable-row" onClick={() => setSelectedPatient(p)}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={p.name} size={36} />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>{p.email || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>{p.phone || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{p.gender || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {p.blood ? (
                      <span style={{ background: 'rgba(224,92,92,0.1)', padding: '4px 10px', borderRadius: 12, color: 'var(--danger)', fontWeight: 600, fontSize: 12 }}>
                        🩸 {p.blood}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12 }}>{p.dob || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ background: 'rgba(14,165,233,0.1)', padding: '4px 10px', borderRadius: 12, color: 'var(--teal)', fontWeight: 700 }}>
                      {p.appointmentCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {p.allergies && p.allergies !== '' ? (
                      <span style={{ background: 'rgba(224,92,92,0.1)', padding: '4px 10px', borderRadius: 12, color: 'var(--danger)', fontSize: 11, fontWeight: 600 }}>
                        ⚠ Yes
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: 12 }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <Btn tiny variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedPatient(p); }}>View</Btn>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="9" style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient Detail Modal */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title={selectedPatient?.name || ''} wide>
        {selectedPatient && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                ['Email', selectedPatient.email],
                ['Phone', selectedPatient.phone],
                ['Date of Birth', selectedPatient.dob],
                ['Gender', selectedPatient.gender],
                ['Blood Group', selectedPatient.blood],
                ['Address', selectedPatient.address],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{value || '—'}</div>
                </div>
              ))}
              {selectedPatient.allergies && (
                <div style={{ gridColumn: '1/-1', padding: '12px 16px', background: 'rgba(224,92,92,0.08)', borderRadius: 10, border: '1px solid rgba(224,92,92,0.3)' }}>
                  <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 4 }}>Allergies</div>
                  <div style={{ fontWeight: 600, color: 'var(--danger)' }}>{selectedPatient.allergies}</div>
                </div>
              )}
              {selectedPatient.medical_info && selectedPatient.medical_info !== '' && (
                <div style={{ gridColumn: '1/-1', padding: '12px 16px', background: 'var(--card-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Medical History</div>
                  <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.5 }}>{selectedPatient.medical_info}</div>
                </div>
              )}
            </div>

            <Divider label="Appointment History" />
            <div style={{ display: 'grid', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
              {selectedPatient.appts.length === 0 && <div style={{ color: 'var(--text-light)', fontSize: 13 }}>No appointments yet.</div>}
              {selectedPatient.appts.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{a.doctorName || 'Doctor'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 8 }}>{a.date} at {a.slot}</span>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ─── Reviews Tab ─── */
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch reviews:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>Loading reviews...</div>;

  return (
    <div>
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>All Patient Reviews</h3>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''} found</p>
      </Card>

      {reviews.length === 0 && (
        <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p style={{ color: 'var(--text-light)' }}>No reviews yet.</p>
        </Card>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {reviews.map(review => (
          <Card key={review.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Avatar name={review.patient_name} size={40} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{review.patient_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Reviewed: {review.doctor_name} ({review.doctor_specialty})</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StarRating value={review.rating} size={20} />
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{new Date(review.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            
            {review.comment && (
              <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)' }}>{review.comment}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-light)' }}>
              <span>📅 Appointment: {review.appointment_date} at {review.appointment_time}</span>
              <StatusBadge status={review.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Notifications Tab ─── */
function NotificationsTab({ doctors, patients }) {
  const [notifyType, setNotifyType] = useState('doctor');
  const [selectedUser, setSelectedUser] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  const users = notifyType === 'doctor' ? doctors : patients;

  const handleSend = async () => {
    if (!selectedUser || !title || !message) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          userType: notifyType,
          title,
          message,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Notification sent successfully!', type: 'success' });
        setSelectedUser('');
        setTitle('');
        setMessage('');
      } else {
        setToast({ message: data.error || 'Failed to send notification', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Failed to send notification', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>🔔 Send Notification</h3>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>Notify doctors or patients about important updates</p>
      </Card>

      <Card style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', padding: '24px' }}>
        {/* Type Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
            Notify Type
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setNotifyType('doctor'); setSelectedUser(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)',
                background: notifyType === 'doctor' ? 'var(--teal)' : 'var(--surface)',
                color: notifyType === 'doctor' ? 'var(--navy)' : 'var(--text-primary)',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🩺 Doctor
            </button>
            <button
              onClick={() => { setNotifyType('patient'); setSelectedUser(''); }}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 9, border: '1px solid var(--border)',
                background: notifyType === 'patient' ? 'var(--teal)' : 'var(--surface)',
                color: notifyType === 'patient' ? 'var(--navy)' : 'var(--text-primary)',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🏥 Patient
            </button>
          </div>
        </div>

        {/* User Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
            Select {notifyType === 'doctor' ? 'Doctor' : 'Patient'}
          </label>
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1.5px solid var(--surface-border)',
              borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, outline: 'none'
            }}
          >
            <option value="">Choose a {notifyType}...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email || u.specialty || 'No email'})</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <Input
            label="Notification Title"
            placeholder="e.g. Appointment Reminder, System Update..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
            Message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={5}
            style={{
              width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1.5px solid var(--surface-border)',
              borderRadius: 9, color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', outline: 'none'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--teal)'}
            onBlur={e => e.target.style.borderColor = 'var(--surface-border)'}
          />
        </div>

        {/* Send Button */}
        <Btn
          variant="primary"
          onClick={handleSend}
          disabled={sending || !selectedUser || !title || !message}
          style={{ width: '100%' }}
        >
          {sending ? '📤 Sending...' : '📤 Send Notification'}
        </Btn>
      </Card>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function AdminPage() {
  const { doctors, appointments, patients, fetchAppointments } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [, setRefreshKey] = useState(0);

  const todaysDate = new Date().toISOString().split('T')[0];

  const handleDataChange = () => {
    setRefreshKey(k => k + 1);
    // Re-fetch appointments from backend
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) fetchAppointments(user);
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.35s ease', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Manage patients, review doctor demand, and monitor appointments.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', padding: 4, borderRadius: 12, border: '1px solid var(--surface-border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === tab.id ? 'var(--teal)' : 'transparent',
              color: activeTab === tab.id ? 'var(--navy)' : 'var(--text-light)',
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab appointments={appointments} doctors={doctors} patients={patients} todaysDate={todaysDate} />}
      {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} doctors={doctors} onStatusChange={handleDataChange} />}
      {activeTab === 'doctors' && <DoctorsTab doctors={doctors} appointments={appointments} />}
      {activeTab === 'patients' && <PatientsTab patients={patients} appointments={appointments} />}
      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'notifications' && <NotificationsTab doctors={doctors} patients={patients} />}
    </div>
  );
}

