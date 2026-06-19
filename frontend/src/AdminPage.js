import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Input, Divider, StatusBadge, StarRating, Avatar, Modal, Toast } from './components';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'appointments', label: 'Appointments', icon: '📋' },
  { id: 'doctors', label: 'Doctors', icon: '🩺' },
  { id: 'patients', label: 'Patients', icon: '🏥' },
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
  const colors = { pending: '#f5c542', accepted: 'var(--success)', completed: '#4ab3f4', rejected: 'var(--danger)', cancelled: '#888' };

  return (
    <Card style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px' }}>
      <h3 style={{ fontSize: 16, marginBottom: 14 }}>Appointment Status Distribution</h3>
      <div style={{ display: 'flex', height: 32, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        {Object.entries(counts).filter(([, v]) => v > 0).map(([key, val]) => (
          <div key={key} title={`${key}: ${val}`} style={{ width: `${(val / total) * 100}%`, background: colors[key], transition: 'width 0.4s', minWidth: val > 0 ? 8 : 0, cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-light)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[key], flexShrink: 0 }} />
            {key.charAt(0).toUpperCase() + key.slice(1)}: <strong style={{ color: 'var(--white)' }}>{val}</strong>
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

  // Specialty demand
  const specialtyDemand = {};
  doctors.forEach(d => {
    const count = appointments.filter(a => a.doctorId === d.id || a.doctor_code === d.id).length;
    specialtyDemand[d.specialty] = (specialtyDemand[d.specialty] || 0) + count;
  });
  const topSpecialties = Object.entries(specialtyDemand).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Patients" value={patients.length} icon="👥" />
        <StatCard label="Total Doctors" value={doctors.length} icon="🩺" />
        <StatCard label="Total Appointments" value={appointments.length} icon="📋" />
        <StatCard label="Today's Appointments" value={todayAppointments.length} icon="📅" />
        <StatCard label="Pending Requests" value={pendingCount} icon="⏳" />
        <StatCard label="Completed" value={completedCount} icon="✔" />
      </div>

      {/* Status Distribution + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <StatusBar appointments={appointments} />
        <RecentActivity appointments={appointments} />
      </div>

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
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px 13px', background: 'var(--surface)', border: '1.5px solid var(--surface-border)', borderRadius: 9, color: 'var(--white)', fontSize: 14 }}>
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
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} style={{ width: '100%', padding: '10px 13px', background: 'var(--surface)', border: '1.5px solid var(--surface-border)', borderRadius: 9, color: 'var(--white)', fontSize: 14 }}>
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

      {/* Appointments List */}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map(appt => (
          <Card key={appt.id} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{appt.patientName || 'Unknown Patient'}</span>
                  <StatusBadge status={appt.status} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-light)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 16px' }}>
                  <span>Doctor: <strong style={{ color: 'var(--white)' }}>{appt.doctorName || '—'}</strong></span>
                  <span>Specialty: <strong style={{ color: 'var(--white)' }}>{appt.doctorSpecialty || '—'}</strong></span>
                  <span>Date: <strong style={{ color: 'var(--white)' }}>{appt.date || '—'}</strong></span>
                  <span>Time: <strong style={{ color: 'var(--white)' }}>{appt.slot || '—'}</strong></span>
                  <span>Phone: <strong style={{ color: 'var(--white)' }}>{appt.patientPhone || '—'}</strong></span>
                  <span>Booked: <strong style={{ color: 'var(--white)' }}>{appt.bookedAt ? new Date(appt.bookedAt).toLocaleDateString() : '—'}</strong></span>
                  {appt.reason && <span style={{ gridColumn: '1/-1' }}>Reason: <strong style={{ color: 'var(--white)' }}>{appt.reason}</strong></span>}
                  {appt.symptoms && <span style={{ gridColumn: '1/-1' }}>Symptoms: <strong style={{ color: 'var(--white)' }}>{appt.symptoms}</strong></span>}
                  {appt.doctorNote && <span style={{ gridColumn: '1/-1' }}>Doctor Note: <strong style={{ color: 'var(--white)' }}>{appt.doctorNote}</strong></span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {appt.status === 'pending' && (
                  <>
                    <Btn small variant="success" onClick={() => setConfirmModal({ appt, action: { status: 'accepted' }, label: 'Accept' })}>✓ Accept</Btn>
                    <Btn small variant="danger" onClick={() => setConfirmModal({ appt, action: { status: 'rejected' }, label: 'Reject' })}>✕ Reject</Btn>
                  </>
                )}
                {(appt.status === 'pending' || appt.status === 'accepted') && (
                  <Btn small variant="ghost" onClick={() => setConfirmModal({ appt, action: { status: 'cancelled' }, label: 'Cancel' })}>Cancel</Btn>
                )}
                {appt.status === 'accepted' && (
                  <Btn small variant="primary" onClick={() => setConfirmModal({ appt, action: { status: 'completed' }, label: 'Complete' })}>✔ Complete</Btn>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!filtered.length && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>No appointments match your filters.</div>
        )}
      </div>

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {doctorData.map(doc => (
          <Card key={doc.id} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '20px', cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Avatar name={doc.name} size={50} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 16, marginBottom: 2 }}>{doc.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 500, marginBottom: 6 }}>{doc.specialty}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: 12, color: 'var(--text-light)' }}>
                  {doc.qualification && <span>🎓 {doc.qualification}</span>}
                  {doc.hospital && <span>🏥 {doc.hospital}</span>}
                  {doc.experience && <span>⏱ {doc.experience} exp</span>}
                  {doc.fee && <span>💰 ₹{doc.fee}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{doc.totalAppts}</div>
                <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Bookings</div>
              </div>
            </div>
            {/* Mini status bar */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14, fontSize: 12, color: 'var(--text-light)' }}>
              <span>⏳ {doc.pending}</span>
              <span>✓ {doc.accepted}</span>
              <span>✔ {doc.completed}</span>
              <span>✕ {doc.rejected}</span>
              <span style={{ marginLeft: 'auto' }}>⭐ {doc.avgRating}</span>
            </div>
          </Card>
        ))}
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {filtered.map(p => (
          <Card key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', padding: '18px', cursor: 'pointer' }} onClick={() => setSelectedPatient(p)}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Avatar name={p.name} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 15, marginBottom: 4 }}>{p.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: 12, color: 'var(--text-light)' }}>
                  {p.email && <span>📧 {p.email}</span>}
                  {p.phone && <span>📞 {p.phone}</span>}
                  {p.blood && <span>🩸 {p.blood}</span>}
                  {p.gender && <span>👤 {p.gender}</span>}
                  {p.dob && <span>🎂 {p.dob}</span>}
                  <span>📋 {p.appointmentCount} appointment{p.appointmentCount !== 1 ? 's' : ''}</span>
                </div>
                {p.allergies && p.allergies !== '' && (
                  <div style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)', background: 'rgba(224,92,92,0.1)', padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
                    ⚠ Allergies: {p.allergies}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!filtered.length && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>No patients found.</div>
        )}
      </div>

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
    </div>
  );
}

