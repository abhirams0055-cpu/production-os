import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function PublicBooking() {
  const { dateMarks, shoots, submitBooking, setPublicPage } = useApp();
  const [calDate, setCalDate] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [form, setForm] = useState({ clientName:'', phone:'', shootDays: 1 });
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
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false, date: null });

  const isBusy = (date) => {
    if (!date) return true;
    const dt = new Date(date);
    if (dt < today) return true;
    const mark = dateMarks.find(m => m.date === date);
    if (mark && (mark.status === 'busy' || mark.status === 'tentative')) return true;
    if (shoots.find(s => s.date === date && s.status !== 'rejected')) return true;
    return false;
  };

  const isAvailable = (date) => {
    if (!date) return false;
    const mark = dateMarks.find(m => m.date === date);
    return mark?.status === 'available';
  };

  const handleDateClick = (date) => {
    if (!date || isBusy(date)) return;
    if (selectedDates.includes(date)) {
      setSelectedDates(p => p.filter(d => d !== date));
    } else {
      if (selectedDates.length < form.shootDays) {
        setSelectedDates(p => [...p, date].sort());
      } else {
        setSelectedDates(p => [...p.slice(1), date].sort());
      }
    }
  };

  const handleShootDaysChange = (n) => {
    setForm(p => ({ ...p, shootDays: n }));
    setSelectedDates(prev => prev.slice(0, n));
  };

  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (selectedDates.length < form.shootDays) e.dates = `Please select ${form.shootDays} date${form.shootDays > 1 ? 's' : ''}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    submitBooking({
      clientName: form.clientName,
      projectName: `${form.clientName} - ${form.shootDays} Day Shoot`,
      contactName: form.clientName,
      phone: form.phone,
      email: '',
      preferredDate: selectedDates[0],
      selectedDates,
      shootDays: form.shootDays
    });
    setSubmitted(true);
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });

  if (submitted) {
    return (
      <div className="public-page">
        <div style={{ textAlign:'center', maxWidth:'480px' }}>
          <div style={{ width:'64px', height:'64px', background:'rgba(201,169,110,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={32} color="#c9a96e" />
          </div>
          <h1 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'12px' }}>Booking Request Sent!</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
            Thanks <strong style={{ color:'var(--text)' }}>{form.clientName}</strong>! Your booking request has been received.
            Our team will confirm within 24 hours.
          </p>
          <div style={{ padding:'16px 20px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'24px', textAlign:'left' }}>
            <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'8px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne' }}>Booking Summary</div>
            {[
              ['Company', form.clientName],
              ['Phone', form.phone],
              ['Selected Dates', selectedDates.map(fmtDate).join(', ')],
              ['Shoot Days', `${form.shootDays} day${form.shootDays > 1 ? 's' : ''}`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'13px' }}>
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ color:'var(--text)', fontWeight:'500' }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="btn-secondary" onClick={() => setPublicPage(false)}>← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      {/* Header — logo centered */}
      <div style={{ marginBottom:'36px', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <img src="/logo.png" alt="Team Aaram" style={{ width:'140px', objectFit:'contain', marginBottom:'12px' }} />
        <h1 style={{ fontFamily:"'DM Sans', sans-serif", fontSize:'22px', fontWeight:'800', color:'var(--text)' }}>Client Booking</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'4px' }}>Select your shoot dates and fill in your details</p>
      </div>

      <div style={{ width:'100%', maxWidth:'960px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>

        {/* Calendar */}
        <div className="card">
          <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Pick Your Dates</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px' }}>
            Select <strong style={{ color:'var(--accent)' }}>{form.shootDays} date{form.shootDays > 1 ? 's' : ''}</strong> — grey dates are unavailable
          </p>

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
              const selected = selectedDates.includes(cell.date);
              const selIndex = selectedDates.indexOf(cell.date);
              return (
                <div key={i} onClick={() => handleDateClick(cell.date)} style={{
                  aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:'600', cursor: busy ? 'not-allowed' : 'pointer',
                  background: selected ? 'var(--accent)' : available ? 'rgba(201,169,110,0.1)' : busy ? 'rgba(255,60,60,0.06)' : 'var(--surface2)',
                  color: selected ? '#1a1008' : busy ? 'var(--text-dim)' : available ? '#c9a96e' : 'var(--text)',
                  border: selected ? '2px solid var(--accent)' : available ? '1px solid rgba(201,169,110,0.3)' : '1px solid transparent',
                  transition:'all 0.1s', position:'relative'
                }}>
                  {cell.day}
                  {selected && form.shootDays > 1 && (
                    <span style={{ position:'absolute', top:'-4px', right:'-4px', width:'14px', height:'14px', background:'#083f3e', borderRadius:'50%', fontSize:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800' }}>
                      {selIndex + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected dates display */}
          {selectedDates.length > 0 && (
            <div style={{ marginTop:'12px', padding:'10px 12px', background:'rgba(201,169,110,0.06)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'8px' }}>
              <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne' }}>Selected Dates</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {selectedDates.map((d, i) => (
                  <div key={d} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'var(--accent)', fontWeight:'600' }}>Day {i+1}: {fmtDate(d)}</span>
                    <button onClick={() => setSelectedDates(p => p.filter(x => x !== d))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'2px' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {errors.dates && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'6px' }}>{errors.dates}</p>}

          {/* Shoot days — only 1 or 2 */}
          <div style={{ marginTop:'16px' }}>
            <label className="label">Number of Shoot Days</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {[1, 2].map(n => (
                <button key={n} onClick={() => handleShootDaysChange(n)} style={{
                  flex:1, padding:'10px', borderRadius:'8px', border:'1px solid',
                  background: form.shootDays === n ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: form.shootDays === n ? 'var(--accent)' : 'var(--border)',
                  color: form.shootDays === n ? '#1a1008' : 'var(--text)',
                  fontSize:'14px', fontWeight:'700', cursor:'pointer', fontFamily:'Syne'
                }}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Form — company + phone only */}
        <div className="card">
          <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Your Details</h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>Fill in your information</p>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label className="label">Company / Brand Name</label>
              <input className="input" type="text" value={form.clientName}
                onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                style={{ borderColor: errors.clientName ? '#ff6b6b' : undefined }} />
              {errors.clientName && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.clientName}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input className="input" type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={{ borderColor: errors.phone ? '#ff6b6b' : undefined }} />
              {errors.phone && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.phone}</p>}
            </div>

            <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'14px', marginTop:'8px' }} onClick={handleSubmit}>
              Submit Booking Request
            </button>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center' }}>Our team will confirm within 24 hours</p>
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
