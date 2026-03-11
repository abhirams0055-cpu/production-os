import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Calendar, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function PublicBooking() {
  const { dateMarks, shoots, submitBooking, setPublicPage } = useApp();
  const [calDate, setCalDate] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    clientName:'', projectName:'', contactName:'', phone:'', email:'',
    preferredDate:'', shootDays:1
  });
  const [errors, setErrors] = useState({});

  const today = new Date();
  today.setHours(0,0,0,0);
  const year = calDate.getFullYear();
  const month = calDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day: d, current: true, date: dateStr });
  }
  while (cells.length < 42) { cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false, date: null }); }

  const isBusy = (date) => {
    if (!date) return true;
    const dt = new Date(date);
    if (dt < today) return true;
    const mark = dateMarks.find(m => m.date === date);
    if (mark && (mark.status === 'busy' || mark.status === 'tentative')) return true;
    if (shoots.find(s => s.date === date)) return true;
    return false;
  };

  const isAvailable = (date) => {
    if (!date) return false;
    const mark = dateMarks.find(m => m.date === date);
    return mark?.status === 'available';
  };

  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = 'Required';
    if (!form.projectName.trim()) e.projectName = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.preferredDate) e.preferredDate = 'Please select a date from calendar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    submitBooking({ ...form, shootDays: parseInt(form.shootDays) });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="public-page">
        <div style={{ textAlign:'center', maxWidth:'480px' }}>
          <div style={{ width:'64px', height:'64px', background:'rgba(100,200,100,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={32} color="#6dc76d" />
          </div>
          <h1 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'12px' }}>Booking Request Sent!</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
            Thanks <strong style={{ color:'var(--text)' }}>{form.contactName}</strong>! Your booking request for <strong style={{ color:'var(--accent)' }}>{form.projectName}</strong> has been received.
            Our team will review and confirm within 24 hours.
          </p>
          <div style={{ padding:'16px 20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'24px', textAlign:'left' }}>
            <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'8px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne' }}>Booking Summary</div>
            {[
              ['Client', form.clientName],
              ['Project', form.projectName],
              ['Date', new Date(form.preferredDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })],
              ['Shoot Days', `${form.shootDays} day${form.shootDays > 1 ? 's' : ''}`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'13px' }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ color:'var(--text)', fontWeight:'500' }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="btn-secondary" onClick={() => setPublicPage(false)}>← Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'36px' }}>
        <div style={{ width:'32px', height:'32px', background:'var(--accent)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Zap size={15} color="var(--bg)" fill="var(--bg)" />
        </div>
        <span style={{ fontFamily:'Syne', fontSize:'18px', fontWeight:'800' }}>Production OS</span>
        <span style={{ color:'var(--text-muted)', fontSize:'13px', marginLeft:'8px' }}>· Client Booking</span>
      </div>

      <div style={{ width:'100%', maxWidth:'900px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>
        {/* Calendar */}
        <div className="card">
          <h2 style={{ fontSize:'16px', fontWeight:'800', marginBottom:'4px' }}>Pick a Date</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px' }}>Green dates are available. Grey dates are unavailable.</p>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setCalDate(new Date(year, month-1, 1))}><ChevronLeft size={14}/></button>
            <span style={{ fontFamily:'Syne', fontSize:'14px', fontWeight:'700' }}>{MONTHS[month]} {year}</span>
            <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={() => setCalDate(new Date(year, month+1, 1))}><ChevronRight size={14}/></button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px', marginBottom:'3px' }}>
            {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'10px', fontWeight:'600', color:'var(--text-muted)', padding:'3px 0', fontFamily:'Syne' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px' }}>
            {cells.map((cell, i) => {
              if (!cell.current) return <div key={i} style={{ aspectRatio:'1', borderRadius:'6px' }} />;
              const busy = isBusy(cell.date);
              const available = isAvailable(cell.date);
              const selected = form.preferredDate === cell.date;
              return (
                <div key={i} onClick={() => !busy && setForm(p => ({ ...p, preferredDate: cell.date }))} style={{
                  aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:'500', cursor: busy ? 'not-allowed' : 'pointer',
                  background: selected ? 'var(--accent)' : available ? 'rgba(100,200,100,0.15)' : busy ? 'rgba(255,60,60,0.06)' : 'var(--surface2)',
                  color: selected ? 'var(--bg)' : busy ? 'var(--text-dim)' : available ? '#6dc76d' : 'var(--text)',
                  border: selected ? '1px solid var(--accent)' : available ? '1px solid rgba(100,200,100,0.3)' : '1px solid transparent',
                  transition:'all 0.1s',
                }}>
                  {cell.day}
                </div>
              );
            })}
          </div>

          {form.preferredDate && (
            <div style={{ marginTop:'12px', padding:'10px 12px', background:'rgba(232,255,71,0.06)', border:'1px solid rgba(232,255,71,0.2)', borderRadius:'8px', fontSize:'12px', color:'var(--accent)' }}>
              ✓ Selected: {new Date(form.preferredDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
            </div>
          )}
          {errors.preferredDate && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'6px' }}>{errors.preferredDate}</p>}

          <div style={{ marginTop:'12px' }}>
            <label className="label">Number of Shoot Days</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {[1,2,3].map(n => (
                <button key={n} onClick={() => setForm(p => ({ ...p, shootDays: n }))} style={{
                  flex:1, padding:'10px', borderRadius:'8px', border:'1px solid',
                  background: form.shootDays === n ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: form.shootDays === n ? 'var(--accent)' : 'var(--border)',
                  color: form.shootDays === n ? 'var(--bg)' : 'var(--text)',
                  fontSize:'14px', fontWeight:'700', cursor:'pointer', fontFamily:'Syne'
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <h2 style={{ fontSize:'16px', fontWeight:'800', marginBottom:'4px' }}>Your Details</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>Fill in your project information</p>

          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { key:'clientName', label:'Company / Brand Name', placeholder:'e.g. PADMA' },
              { key:'projectName', label:'Project Name', placeholder:'e.g. Summer Collection Reel' },
              { key:'contactName', label:'Your Name', placeholder:'Full name' },
              { key:'phone', label:'Phone Number', placeholder:'+91 98765 43210', type:'tel' },
              { key:'email', label:'Email Address', placeholder:'you@company.com', type:'email' },
            ].map(field => (
              <div key={field.key}>
                <label className="label">{field.label}</label>
                <input
                  className="input"
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  style={{ borderColor: errors[field.key] ? '#ff6b6b' : undefined }}
                />
                {errors[field.key] && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors[field.key]}</p>}
              </div>
            ))}

            <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:'14px', marginTop:'6px' }} onClick={handleSubmit}>
              Submit Booking Request
            </button>

            <p style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center' }}>
              Our team will confirm within 24 hours
            </p>
          </div>
        </div>
      </div>

      <button style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'12px', cursor:'pointer', marginTop:'24px', textDecoration:'underline' }}
        onClick={() => setPublicPage(false)}>
        ← Team Login
      </button>
    </div>
  );
}
