import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, setPublicPage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    if (!ok) setError('Invalid email or password');
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            <div style={{ width:'36px', height:'36px', background:'var(--accent)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'var(--bg)', fontFamily:'Syne', fontWeight:'800', fontSize:'18px' }}>P</span>
            </div>
            <span style={{ fontFamily:'Syne', fontSize:'22px', fontWeight:'800', color:'var(--text)' }}>Production OS</span>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Sign in to your workspace</p>
        </div>

        <div className="card" style={{ padding:'28px' }}>
          <div style={{ marginBottom:'16px' }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@prodco.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p style={{ color:'#ff6b6b', fontSize:'12px', marginBottom:'12px' }}>{error}</p>}
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:'20px' }}>
          <button style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'12px', cursor:'pointer', textDecoration:'underline' }}
            onClick={() => setPublicPage(true)}>
            Open Client Booking Page →
          </button>
        </div>
      </div>
    </div>
  );
}
