import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Calendar, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, clientLogin, setPublicPage } = useApp();
  const [mode, setMode] = useState(null); // null=home | 'team' | 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTeamLogin = async () => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 400));
    const ok = await login(email, password);
    if (!ok) setError('Invalid email or password');
    setLoading(false);
  };

  const handleClientLogin = async () => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 400));
    const ok = await clientLogin(email, password);
    if (!ok) setError('Invalid credentials. Contact Team Aaram to get your login.');
    setLoading(false);
  };

  const bg = {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'var(--bg)', padding:'20px',
    backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(8,63,62,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.08) 0%, transparent 50%)'
  };

  // HOME
  if (!mode) return (
    <div style={bg}>
      <div style={{ width:'100%', maxWidth:'520px' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'48px' }}>
          <img src="/logo.png" alt="Team Aaram" style={{ width:'200px', objectFit:'contain', marginBottom:'10px' }} />
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Production Management System</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <button onClick={() => setMode('team')} style={{
            background:'#083f3e', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'16px',
            padding:'32px 24px', cursor:'pointer', textAlign:'center',
            transition:'all 0.2s ease', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px',
          }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(201,169,110,0.5)'; }}
          onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(201,169,110,0.2)'; }}>
            <div style={{ width:'52px', height:'52px', background:'rgba(201,169,110,0.15)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Users size={24} color="#c9a96e" />
            </div>
            <div>
              <div style={{ fontFamily:'Syne', fontSize:'16px', fontWeight:'800', color:'#f0ede8', marginBottom:'6px' }}>Team Login</div>
              <div style={{ fontSize:'12px', color:'rgba(240,237,232,0.5)', lineHeight:'1.5' }}>For crew members and admins</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#c9a96e', fontSize:'12px', fontWeight:'600', fontFamily:'Syne' }}>
              Sign In <ArrowRight size={14}/>
            </div>
          </button>

          <button onClick={() => setMode('client')} style={{
            background:'var(--surface)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'16px',
            padding:'32px 24px', cursor:'pointer', textAlign:'center',
            transition:'all 0.2s ease', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px',
          }}
          onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='rgba(201,169,110,0.5)'; e.currentTarget.style.background='#083f3e'; }}
          onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(201,169,110,0.2)'; e.currentTarget.style.background='var(--surface)'; }}>
            <div style={{ width:'52px', height:'52px', background:'rgba(201,169,110,0.15)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Calendar size={24} color="#c9a96e" />
            </div>
            <div>
              <div style={{ fontFamily:'Syne', fontSize:'16px', fontWeight:'800', color:'#f0ede8', marginBottom:'6px' }}>Client Portal</div>
              <div style={{ fontSize:'12px', color:'rgba(240,237,232,0.5)', lineHeight:'1.5' }}>Book shoots & view history</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#c9a96e', fontSize:'12px', fontWeight:'600', fontFamily:'Syne' }}>
              Sign In <ArrowRight size={14}/>
            </div>
          </button>
        </div>
        <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'11px', marginTop:'32px' }}>Make It Happen. · Team Aaram</p>
      </div>
    </div>
  );

  // TEAM LOGIN
  if (mode === 'team') return (
    <div style={bg}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'32px' }}>
          <img src="/logo.png" alt="Team Aaram" style={{ width:'180px', objectFit:'contain', marginBottom:'10px' }} />
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Team Login</p>
        </div>
        <div className="card" style={{ padding:'28px', borderColor:'rgba(201,169,110,0.15)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'20px' }}>Sign In</h2>
          <div style={{ marginBottom:'16px' }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@teamaaram.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleTeamLogin()} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleTeamLogin()} />
          </div>
          {error && <p style={{ color:'#ff6b6b', fontSize:'12px', marginBottom:'12px' }}>{error}</p>}
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:'14px' }} onClick={handleTeamLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <button onClick={() => { setMode(null); setError(''); setEmail(''); setPassword(''); }} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', marginTop:'14px', padding:'11px', background:'transparent', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text-muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans' }}>
          ← Back
        </button>
        <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'11px', marginTop:'20px' }}>Make It Happen. · Team Aaram</p>
      </div>
    </div>
  );

  // CLIENT LOGIN
  return (
    <div style={bg}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'32px' }}>
          <img src="/logo.png" alt="Team Aaram" style={{ width:'180px', objectFit:'contain', marginBottom:'10px' }} />
          <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>Client Portal</p>
        </div>
        <div className="card" style={{ padding:'28px', borderColor:'rgba(201,169,110,0.15)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'6px' }}>Client Sign In</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>Use the credentials provided by Team Aaram</p>
          <div style={{ marginBottom:'16px' }}>
            <label className="label">Email or Phone</label>
            <input className="input" type="text" placeholder="your email or phone" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handleClientLogin()} />
          </div>
          <div style={{ marginBottom:'20px' }}>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && handleClientLogin()} />
          </div>
          {error && <p style={{ color:'#ff6b6b', fontSize:'12px', marginBottom:'12px' }}>{error}</p>}
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:'14px' }} onClick={handleClientLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <button onClick={() => { setMode(null); setError(''); setEmail(''); setPassword(''); }} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', marginTop:'14px', padding:'11px', background:'transparent', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text-muted)', fontSize:'13px', cursor:'pointer', fontFamily:'DM Sans' }}>
          ← Back
        </button>
        <p style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'11px', marginTop:'20px' }}>Make It Happen. · Team Aaram</p>
      </div>
    </div>
  );
}
