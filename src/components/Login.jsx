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
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', padding:'20px',
      backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(8,63,62,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.08) 0%, transparent 50%)'
    }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>

        {/* Logo - centered */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'36px' }}>
          <img
            src="/logo.png"
            alt="Team Aaram"
            style={{ width:'200px', objectFit:'contain', marginBottom:'12px' }}
          />
          <p style={{ color:'var(--text-muted)', fontSize:'13px', textAlign:'center' }}>
            Production Management System
          </p>
        </div>

        {/* Sign in card */}
        <div className="card" style={{ padding:'28px', borderColor:'rgba(201,169,110,0.15)', background:'rgba(53,53,53,0.9)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'20px', color:'var(--text)' }}>Sign In</h2>
          <div style={{ marginBottom:'16px' }}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@teamaaram.com"
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
          <button
            className="btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'15px' }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        {/* Client Booking Button */}
        <button
          onClick={() => setPublicPage(true)}
          style={{
            width:'100%', marginTop:'16px', padding:'13px',
            background:'transparent',
            border:'1px solid rgba(201,169,110,0.4)',
            borderRadius:'10px',
            color:'#c9a96e',
            fontSize:'14px', fontWeight:'600',
            cursor:'pointer', fontFamily:'Syne, sans-serif',
            transition:'all 0.15s ease',
            letterSpacing:'0.02em'
          }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(201,169,110,0.08)'; e.currentTarget.style.borderColor='rgba(201,169,110,0.7)'; }}
          onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(201,169,110,0.4)'; }}
        >
          Open Client Booking Page →
        </button>

        <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'11px', marginTop:'24px' }}>
          Make It Happen. · Team Aaram
        </p>
      </div>
    </div>
  );
}
