const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'doctor-booking.db');
const db = new sqlite3.Database(dbPath);

// Specialty mapping keyed by doctor email (lowercase last-name prefix)
const DOCTOR_SPECIALTY_MAP = {
  'sharma@medibook.com':   'Cardiologist',
  'mehta@medibook.com':    'Neurologist',
  'kulkarni@medibook.com': 'Dermatologist',
  'patil@medibook.com':    'Orthopedic',
  'desai@medibook.com':    'Pediatrician',
  'joshi@medibook.com':    'General Physician',
  'nair@medibook.com':     'ENT Specialist',
  'reddy@medibook.com':    'Ophthalmologist',
  'gupta@medibook.com':    'Psychiatrist',
  'iyer@medibook.com':     'Gastroenterologist',
  'malhotra@medibook.com': 'Endocrinologist',
  'bose@medibook.com':     'Pulmonologist',
  'kapoor@medibook.com':   'Rheumatologist',
};
const FALLBACK_SPECIALTIES = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'General Physician', 'ENT Specialist', 'Ophthalmologist', 'Psychiatrist', 'Gastroenterologist', 'Endocrinologist', 'Pulmonologist', 'Rheumatologist'];

// Pre-seeded doctor accounts (always created on init so bookings work on fresh DBs)
const SEED_DOCTOR_ACCOUNTS = [
  { name: 'Dr. Priya Sharma',    email: 'sharma@medibook.com',   password: 'doctor123' },
  { name: 'Dr. Arjun Mehta',     email: 'mehta@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Sneha Kulkarni',  email: 'kulkarni@medibook.com', password: 'doctor123' },
  { name: 'Dr. Rohit Patil',     email: 'patil@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Anita Desai',     email: 'desai@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Vikram Joshi',    email: 'joshi@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Kavya Nair',      email: 'nair@medibook.com',     password: 'doctor123' },
  { name: 'Dr. Suresh Reddy',    email: 'reddy@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Neha Gupta',      email: 'gupta@medibook.com',    password: 'doctor123' },
  { name: 'Dr. Rajan Iyer',      email: 'iyer@medibook.com',     password: 'doctor123' },
  { name: 'Dr. Pooja Malhotra',  email: 'malhotra@medibook.com', password: 'doctor123' },
  { name: 'Dr. Arnab Bose',      email: 'bose@medibook.com',     password: 'doctor123' },
  { name: 'Dr. Simran Kapoor',   email: 'kapoor@medibook.com',   password: 'doctor123' },
];

// Pre-seeded admin account
const SEED_ADMIN_ACCOUNT = { name: 'Admin', email: 'admin@medibook.com', password: 'admin123' };

const DOCTORS_SQL = `
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    specialty TEXT,
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const PATIENTS_SQL = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    medical_info TEXT,
    phone TEXT,
    dob TEXT,
    gender TEXT,
    address TEXT,
    blood TEXT,
    allergies TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

const APPOINTMENTS_SQL = `
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reason TEXT,
    symptoms TEXT,
    patient_phone TEXT,
    booked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    doctor_code TEXT,
    doctor_note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )
`;

const REVIEWS_SQL = `
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
  )
`;

const initDb = (onReady) => {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    // Create the users table (the authoritative table – never dropped)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'patient')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check for stale FK references (e.g. "users_old" from a previous
    // ALTER TABLE RENAME).  If found, drop and recreate the affected tables.
    db.get(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='doctors'",
      [],
      (err, row) => {
        const needsRebuild = row && row.sql && row.sql.includes('users_old');

        if (needsRebuild) {
          console.log('Detected stale FK references (users_old) — rebuilding tables...');
          db.run('DROP TABLE IF EXISTS reviews');
          db.run('DROP TABLE IF EXISTS appointments');
          db.run('DROP TABLE IF EXISTS doctors');
          db.run('DROP TABLE IF EXISTS patients');
        }

        // Create all dependent tables (IF NOT EXISTS preserves existing data)
        db.run(DOCTORS_SQL);
        db.run(PATIENTS_SQL);
        db.run(APPOINTMENTS_SQL);
        db.run(REVIEWS_SQL, [], (createErr) => {
          if (createErr) {
            console.error('Error creating tables:', createErr);
            if (onReady) onReady(createErr);
            return;
          }
          // Seed doctor/admin user accounts first, then create doctors/patients rows
          ensureSeedUsers(() => {
            seedDoctorsAndPatients(() => {
              // Run migration to add any missing doctors to persistent DBs
              console.log('[migration] Starting migration to ensure all 13 doctors exist...');
              migrateNewDoctors(() => {
                // Verify final count
                db.get('SELECT COUNT(*) as count FROM doctors', [], (countErr, countRow) => {
                  if (!countErr) {
                    console.log(`[migration] Total doctors in database: ${countRow.count}`);
                  }
                  if (onReady) onReady(null);
                });
              });
            });
          });
        });
      }
    );
  });
};

// One-time migration: insert any SEED_DOCTOR_ACCOUNTS missing from the live DB.
// Safe to run on every startup — uses INSERT OR IGNORE / checks before inserting.
function migrateNewDoctors(done) {
  let remaining = SEED_DOCTOR_ACCOUNTS.length;
  if (remaining === 0) return done();
  const finish = () => { if (--remaining <= 0) done(); };

  SEED_DOCTOR_ACCOUNTS.forEach(acct => {
    db.get('SELECT id FROM users WHERE email = ?', [acct.email], (err, userRow) => {
      if (err) { console.error('migrateNewDoctors lookup error:', err); return finish(); }

      const insertDoctorRow = (userId) => {
        const specialty = DOCTOR_SPECIALTY_MAP[acct.email] || 'General Physician';
        db.run(
          'INSERT OR IGNORE INTO doctors (user_id, specialty) VALUES (?, ?)',
          [userId, specialty],
          (dErr) => {
            if (!dErr) console.log(`[migration] Ensured doctor row: ${acct.email} → ${specialty}`);
            finish();
          }
        );
      };

      if (userRow) {
        // User already exists — just ensure doctor row
        insertDoctorRow(userRow.id);
      } else {
        // New doctor — insert user then doctor row
        const hash = bcrypt.hashSync(acct.password, 10);
        db.run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [acct.name, acct.email, hash, 'doctor'],
          function (insErr) {
            if (insErr) { console.error('[migration] insert user error:', insErr); return finish(); }
            console.log(`[migration] Added new doctor user: ${acct.email}`);
            insertDoctorRow(this.lastID);
          }
        );
      }
    });
  });
}

// Ensure all pre-seeded user accounts (doctors + admin) exist.
// Uses INSERT OR IGNORE so existing rows are not duplicated.
function ensureSeedUsers(done) {
  const allAccounts = [
    ...SEED_DOCTOR_ACCOUNTS.map(a => ({ ...a, role: 'doctor' })),
    { ...SEED_ADMIN_ACCOUNT, role: 'admin' },
  ];

  let remaining = allAccounts.length;
  const finish = () => { if (--remaining <= 0) done(); };

  allAccounts.forEach(acct => {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [acct.email], (err, row) => {
      if (err) { console.error('ensureSeedUsers check error:', err); return finish(); }
      if (row) {
        // User exists — still ensure doctor row exists (handles upgrades where user exists but doctor row missing)
        if (acct.role === 'doctor') {
          const specialty = DOCTOR_SPECIALTY_MAP[acct.email] || 'General Physician';
          db.run(
            'INSERT OR IGNORE INTO doctors (user_id, specialty) VALUES (?, ?)',
            [row.id, specialty],
            (dErr) => {
              if (!dErr) console.log(`Ensured doctor row for existing user: ${acct.email} → ${specialty}`);
              finish();
            }
          );
        } else {
          return finish();
        }
        return;
      }

      const hash = bcrypt.hashSync(acct.password, 10);
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [acct.name, acct.email, hash, acct.role],
        function (insErr) {
          if (insErr) { console.error('ensureSeedUsers insert error:', insErr); return finish(); }
          console.log(`Seeded user account: ${acct.email} (${acct.role})`);
          // Also create doctor row immediately
          if (acct.role === 'doctor') {
            const specialty = DOCTOR_SPECIALTY_MAP[acct.email] || 'General Physician';
            db.run(
              'INSERT OR IGNORE INTO doctors (user_id, specialty) VALUES (?, ?)',
              [this.lastID, specialty],
              () => finish()
            );
          } else {
            finish();
          }
        }
      );
    });
  });
}

function seedDoctorsAndPatients(done) {
  let pending = 2; // two async seed groups
  const finish = () => { if (--pending <= 0) done(); };

  // ── Seed doctors ──
  db.all("SELECT id, name, email FROM users WHERE role = 'doctor'", [], (err, doctors) => {
    if (err) {
      console.error('Error fetching doctor users:', err);
      return finish();
    }
    if (!doctors || doctors.length === 0) {
      console.log('No doctor users found to seed.');
      return finish();
    }

    let remaining = doctors.length;
    const docFinish = () => { if (--remaining <= 0) finish(); };

    doctors.forEach((doc, idx) => {
      db.get('SELECT id FROM doctors WHERE user_id = ?', [doc.id], (checkErr, existing) => {
        if (checkErr) {
          console.error('Error checking doctor entry:', checkErr);
          return docFinish();
        }
        if (existing) return docFinish();

        // Determine specialty: prefer email-based map, fall back to round-robin
        const specialty = DOCTOR_SPECIALTY_MAP[doc.email] || FALLBACK_SPECIALTIES[idx % FALLBACK_SPECIALTIES.length];
        db.run(
          'INSERT INTO doctors (user_id, specialty) VALUES (?, ?)',
          [doc.id, specialty],
          (insertErr) => {
            if (insertErr) console.error('Error seeding doctor:', insertErr);
            else console.log(`Seeded doctor entry for user ${doc.id} (${doc.name}) → ${specialty}`);
            docFinish();
          }
        );
      });
    });
  });

  // ── Seed patients ──
  db.all("SELECT id, name FROM users WHERE role = 'patient'", [], (err, patients) => {
    if (err) {
      console.error('Error fetching patient users:', err);
      return finish();
    }
    if (!patients || patients.length === 0) {
      console.log('No patient users found to seed.');
      return finish();
    }

    let remaining = patients.length;
    const ptFinish = () => { if (--remaining <= 0) finish(); };

    patients.forEach(pt => {
      db.get('SELECT id FROM patients WHERE user_id = ?', [pt.id], (checkErr, existing) => {
        if (checkErr) {
          console.error('Error checking patient entry:', checkErr);
          return ptFinish();
        }
        if (existing) return ptFinish();

        db.run(
          'INSERT INTO patients (user_id, phone, dob, gender, address, blood, allergies, medical_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [pt.id, '', '', '', '', '', '', ''],
          (insertErr) => {
            if (insertErr) console.error('Error seeding patient:', insertErr);
            else console.log(`Seeded patient entry for user ${pt.id} (${pt.name})`);
            ptFinish();
          }
        );
      });
    });
  });
}

/**
 * Ensure a patient row exists for a given users.id.
 * Creates one on-the-fly if missing (auto-seed).
 * Returns the patients.id via callback(err, patientRowId).
 */
function ensurePatientRow(userId, cb) {
  db.get('SELECT id FROM patients WHERE user_id = ?', [userId], (err, row) => {
    if (err) return cb(err);
    if (row) return cb(null, row.id);
    // Auto-create
    db.run(
      'INSERT INTO patients (user_id, phone, dob, gender, address, blood, allergies, medical_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, '', '', '', '', '', '', ''],
      function (insertErr) {
        if (insertErr) return cb(insertErr);
        console.log(`Auto-created patient row for user ${userId} → patients.id ${this.lastID}`);
        cb(null, this.lastID);
      }
    );
  });
}

/**
 * Ensure a doctor row exists for a given users.id.
 * Creates one on-the-fly if missing (auto-seed).
 * Returns the doctors.id via callback(err, doctorRowId).
 */
function ensureDoctorRow(userId, email, cb) {
  db.get('SELECT id FROM doctors WHERE user_id = ?', [userId], (err, row) => {
    if (err) return cb(err);
    if (row) return cb(null, row.id);
    const specialty = DOCTOR_SPECIALTY_MAP[email] || 'General Physician';
    db.run(
      'INSERT INTO doctors (user_id, specialty) VALUES (?, ?)',
      [userId, specialty],
      function (insertErr) {
        if (insertErr) return cb(insertErr);
        console.log(`Auto-created doctor row for user ${userId} → doctors.id ${this.lastID}`);
        cb(null, this.lastID);
      }
    );
  });
}

module.exports = { db, initDb, ensurePatientRow, ensureDoctorRow };
