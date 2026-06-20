import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { Btn, Input } from './components';

function Panel({ children }) {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === 'dark';
  return (
    <div className={`auth-layout ${isDark ? 'auth-layout--dark' : 'auth-layout--light'}`}>
      <div className={`auth-theme-bar ${isDark ? 'auth-theme-bar--dark' : 'auth-theme-bar--light'}`}>
        <span className="text-sm" style={{ color: 'var(--color-text)' }}>{isDark ? '🌙' : '☀️'}</span>
        <label className="theme-switch">
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <span className="theme-switch__track" />
          <span className="theme-switch__thumb" />
        </label>
      </div>
      <div className={`auth-left ${isDark ? 'auth-left--dark' : 'auth-left--light'}`}>
        <div style={{ maxWidth: 380 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <div className="navbar__logo" style={{ width: 50, height: 50, borderRadius: 14, fontSize: 24 }}>🩺</div>
            <div>
              <div className="text-serif" style={{ fontSize: 30, color: 'var(--color-text)' }}>MediBook</div>
              <div className="text-sm text-muted">Smart Healthcare Booking</div>
            </div>
          </div>
          {[['🏥','Top Specialists','Access cardiologists, neurologists & more'],
            ['📅','Easy Scheduling','Book, reschedule, cancel in seconds'],
            ['⭐','Verified Doctors','Real ratings from real patients'],
            ['🔒','Secure & Private','Your health data is encrypted']].map(([icon, t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div><p style={{ fontWeight: 600, marginBottom: 2, color: 'var(--color-text)' }}>{t}</p><p className="text-sm text-muted">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-form-panel">
        <div className={`auth-form-card ${isDark ? 'auth-form-card--dark' : 'auth-form-card--light'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ onSwitch }) {
  const { login } = useApp();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setF(p => ({ ...p, password: value }));
    setPasswordError(validatePassword(value));
    setErr('');
  };

  const handleEmailChange = (e) => {
    setF(p => ({ ...p, email: e.target.value }));
    setErr('');
  };

  const go = (e) => {
    e.preventDefault();
    
    // Validate email
    if (!f.email.trim()) {
      setErr('Email is required');
      return;
    }
    if (!f.email.includes('@')) {
      setErr('Please enter a valid email address');
      return;
    }

    // Validate password
    const pwdError = validatePassword(f.password);
    if (pwdError) {
      setErr(pwdError);
      return;
    }

    setLoading(true);
    (async () => {
      const r = await login(f.email, f.password);
      if (!r.success) setErr(r.error);
      setLoading(false);
    })();
  };

  return (
    <Panel>
      <h2 style={{ fontSize: 26, marginBottom: 4 }}>Welcome back</h2>
      <p style={{ color: 'var(--text-light)', fontSize: 13, marginBottom: 26 }}>Sign in to your MediBook account</p>
      {err && <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 9, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--danger)' }}>⚠️ {err}</div>}
      <form onSubmit={go}>
        <Input label="Email" type="email" placeholder="you@email.com" value={f.email} onChange={handleEmailChange} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-light)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••" 
              value={f.password} 
              onChange={handlePasswordChange}
              style={{ 
                width: '100%', 
                padding: '10px 40px 10px 13px', 
                background: 'var(--surface)',
                border: `1.5px solid ${passwordError ? 'var(--danger)' : 'var(--surface-border)'}`,
                borderRadius: 9, 
                color: 'var(--color-text)', 
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = passwordError ? 'var(--danger)' : 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = passwordError ? 'var(--danger)' : 'var(--surface-border)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                padding: '4px',
                opacity: 0.7
              }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && f.password && (
            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>⚠️ {passwordError}</p>
          )}
          {f.password && !passwordError && (
            <p style={{ color: 'var(--success)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>✓ Valid</p>
          )}
        </div>
        <Btn type="submit" disabled={loading || !f.email || !f.password || passwordError} style={{ width:'100%', padding:'12px', marginTop:4, justifyContent:'center' }}>{loading ? 'Signing in…' : 'Sign In'}</Btn>
      </form>
      <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-light)' }}>No account? <span onClick={onSwitch} style={{ color:'var(--teal)', cursor:'pointer', fontWeight:600 }}>Register here</span></p>
    </Panel>
  );
}

export function RegisterPage({ onSwitch }) {
  const { register } = useApp();
  const [f, setF] = useState({ name:'', email:'', phone:'', dob:'', gender:'', address:'', blood:'', allergies:'', medical_info:'', password:'', confirm:'' });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('registerDraft');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setF(prev => ({ ...prev, ...parsed }));
    } catch (e) {
      console.warn('Unable to load registration draft', e);
    }
  }, []);

  useEffect(() => {
    const draft = {
      name: f.name,
      email: f.email,
      phone: f.phone,
      dob: f.dob,
      gender: f.gender,
      address: f.address,
      blood: f.blood,
      allergies: f.allergies,
      medical_info: f.medical_info,
    };
    localStorage.setItem('registerDraft', JSON.stringify(draft));
  }, [f.name, f.email, f.phone, f.dob, f.gender, f.address, f.blood, f.allergies, f.medical_info]);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 1, label: 'Weak', color: 'var(--danger)' };
    if (score <= 4) return { strength: 2, label: 'Medium', color: 'var(--color-warning)' };
    return { strength: 3, label: 'Strong', color: 'var(--success)' };
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.email.includes('@')) e.email = 'Valid email required';
    const phoneDigits = f.phone.replace(/\D/g, '');
    if (!/^(?:91)?[6-9]\d{9}$/.test(phoneDigits)) {
      e.phone = 'Valid Indian phone required';
    }
    if (f.password.length < 6) e.password = 'Min 6 characters';
    if (f.password.length > 50) e.password = 'Max 50 characters';
    if (f.password !== f.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const go = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrs(v); return; }
    setLoading(true);
    (async () => {
      const payload = { ...f, role: 'patient' };
      const r = await register(payload);
      if (!r.success) {
        setErrs({ email: r.error });
      } else {
        localStorage.removeItem('registerDraft');
      }
      setLoading(false);
    })();
  };

  const fld = k => ({ value: f[k], onChange: e => { setF(p=>({...p,[k]:e.target.value})); setErrs(p=>({...p,[k]:''})); }, error: errs[k] });

  const passwordStrength = getPasswordStrength(f.password);

  return (
    <Panel>
      <h2 style={{ fontSize: 26, marginBottom: 4 }}>Create account</h2>
      <p style={{ color:'var(--text-light)', fontSize:13, marginBottom:22 }}>Join MediBook as a patient</p>
      <form onSubmit={go}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <Input label="Full Name" placeholder="Rahul Sharma" {...fld('name')} />
          <Input label="Phone" type="tel" placeholder="9876543210" {...fld('phone')} />
        </div>
        <Input label="Email" type="email" placeholder="rahul@email.com" {...fld('email')} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <Input label="Date of Birth" type="date" {...fld('dob')} />
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text-light)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>Gender</label>
            <select value={f.gender} onChange={e=>setF(p=>({...p,gender:e.target.value}))} style={{ width:'100%', padding:'10px 13px', background:'var(--surface)', border:'1.5px solid var(--surface-border)', borderRadius:9, color:'var(--surface-text)', fontSize:14, appearance:'none', WebkitAppearance:'none', MozAppearance:'none' }}>
              <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
        </div>
        <Input label="Address" placeholder="123 Main street" value={f.address} onChange={e => setF(p => ({ ...p, address: e.target.value }))} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, color:'var(--text-light)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>Blood Group</label>
            <select value={f.blood} onChange={e => setF(p => ({ ...p, blood: e.target.value }))} style={{ width:'100%', padding:'10px 13px', background:'var(--surface)', border:'1.5px solid var(--surface-border)', borderRadius:9, color:'var(--surface-text)', fontSize:14, appearance:'none', WebkitAppearance:'none', MozAppearance:'none' }}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <Input label="Known Allergies" value={f.allergies} onChange={e => setF(p => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin" />
        </div>
        <Input label="Medical History" textarea value={f.medical_info} onChange={e => setF(p => ({ ...p, medical_info: e.target.value }))} placeholder="e.g. Asthma, surgeries, etc." />
        
        {/* Password Fields with Strength Indicator */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display:'block', fontSize:12, color:'var(--text-light)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Min. 6 chars" 
              value={f.password}
              onChange={e => { setF(p => ({ ...p, password: e.target.value })); setErrs(p => ({ ...p, password: '' })); }}
              style={{ 
                width: '100%', 
                padding: '10px 40px 10px 13px', 
                background: 'var(--surface)',
                border: `1.5px solid ${errs.password ? 'var(--danger)' : 'var(--surface-border)'}`,
                borderRadius: 9, 
                color: 'var(--color-text)', 
                fontSize: 14,
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = errs.password ? 'var(--danger)' : 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = errs.password ? 'var(--danger)' : 'var(--surface-border)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                padding: '4px',
                opacity: 0.7
              }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errs.password && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>⚠️ {errs.password}</p>}
          {f.password && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1, 2, 3].map(level => (
                  <div key={level} style={{ 
                    flex: 1, 
                    height: 4, 
                    borderRadius: 2, 
                    background: passwordStrength.strength >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s'
                  }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: passwordStrength.color, marginBottom: 0, fontWeight: 500 }}>
                Password strength: {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display:'block', fontSize:12, color:'var(--text-light)', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              type={showConfirmPassword ? 'text' : 'password'} 
              placeholder="Repeat password" 
              value={f.confirm}
              onChange={e => { setF(p => ({ ...p, confirm: e.target.value })); setErrs(p => ({ ...p, confirm: '' })); }}
              style={{ 
                width: '100%', 
                padding: '10px 40px 10px 13px', 
                background: 'var(--surface)',
                border: `1.5px solid ${errs.confirm ? 'var(--danger)' : f.confirm && f.confirm === f.password ? 'var(--success)' : 'var(--surface-border)'}`,
                borderRadius: 9, 
                color: 'var(--color-text)', 
                fontSize: 14,
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = errs.confirm ? 'var(--danger)' : 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = errs.confirm ? 'var(--danger)' : 'var(--surface-border)'}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                padding: '4px',
                opacity: 0.7
              }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.7}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errs.confirm && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>⚠️ {errs.confirm}</p>}
          {f.confirm && !errs.confirm && f.confirm === f.password && (
            <p style={{ color: 'var(--success)', fontSize: 12, marginTop: 4, marginBottom: 0 }}>✓ Passwords match</p>
          )}
        </div>

        <Btn type="submit" disabled={loading} style={{ width:'100%', padding:'12px', marginTop:4, justifyContent:'center' }}>{loading ? 'Creating…' : 'Create Account'}</Btn>
      </form>
      <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text-light)' }}>Have an account? <span onClick={onSwitch} style={{ color:'var(--teal)', cursor:'pointer', fontWeight:600 }}>Sign in</span></p>
    </Panel>
  );
}
