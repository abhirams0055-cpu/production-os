import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ChevronLeft, ChevronRight, Clock, Calendar, LogOut } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ClientPortal({ clientUser, onLogout }) {
  const { dateMarks, shoots, submitBooking, bookings } = useApp();
  const [tab, setTab] = useState('book'); // 'book' | 'history'
  const [calDate, setCalDate] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [shootDays, setShootDays] = useState(1);
  const [errors, setErrors] = useState({});

  // Match bookings by clientUser id stored at submit time, or fall back to phone/name
  const myBookings = bookings.filter(b =>
    b.clientUserId === clientUser.id ||
    (b.phone === clientUser.phone && b.clientName?.toLowerCase() === clientUser.companyName?.toLowerCase())
  );

  const today = new Date(); today.setHours(0,0,0,0);
  const year = calDate.getFullYear(), month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
  }
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false, date: null });

  const isBusy = (date) => {
    if (!date) return true;
    if (new Date(date) < today) return true;
    const mark = dateMarks.find(m => m.date === date);
    if (mark && (mark.status === 'busy' || mark.status === 'tentative')) return true;
    // Only block if there's an approved shoot on that date
    if (shoots.find(s => s.date === date && s.status !== 'rejected')) return true;
    return false;
  };

  const isAvailable = (date) => dateMarks.find(m => m.date === date)?.status === 'available';

  const handleDateClick = (date) => {
    if (!date || isBusy(date)) return;
    if (selectedDates.includes(date)) {
      setSelectedDates(p => p.filter(d => d !== date));
    } else if (selectedDates.length < shootDays) {
      setSelectedDates(p => [...p, date].sort());
    } else {
      setSelectedDates(p => [...p.slice(1), date].sort());
    }
  };

  const handleShootDaysChange = (n) => {
    setShootDays(n);
    setSelectedDates(p => p.slice(0, n));
  };

  const handleSubmit = () => {
    const e = {};
    if (selectedDates.length < shootDays) e.dates = `Please select ${shootDays} date${shootDays > 1 ? 's' : ''}`;
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    submitBooking({
      clientName: clientUser.companyName,
      projectName: `${clientUser.companyName} - ${shootDays} Day Shoot`,
      contactName: clientUser.name,
      phone: clientUser.phone,
      email: clientUser.email || '',
      preferredDate: selectedDates[0],
      selectedDates,
      shootDays,
      clientUserId: clientUser.id,
    });
    setSubmitted(true);
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtShort = d => new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  const statusColor = { pending:'#ffa500', approved:'#6dc76d', rejected:'#ff6b6b' };
  const statusBg = { pending:'rgba(255,165,0,0.1)', approved:'rgba(100,200,100,0.1)', rejected:'rgba(255,60,60,0.1)' };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(8,63,62,0.3) 0%, transparent 60%)' }}>
      {/* Top bar */}
      <div style={{ background:'#083f3e', borderBottom:'1px solid rgba(201,169,110,0.2)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <img src="/logo.png" alt="Team Aaram" style={{ width:'80px', objectFit:'contain' }} />
          <div style={{ width:'1px', height:'28px', background:'rgba(201,169,110,0.2)' }} />
          <span style={{ fontSize:'13px', color:'rgba(240,237,232,0.7)' }}>Client Portal</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)' }}>{clientUser.companyName}</div>
            <div style={{ fontSize:'11px', color:'rgba(201,169,110,0.7)' }}>{clientUser.name}</div>
          </div>
          <button onClick={onLogout} style={{ background:'rgba(255,100,100,0.1)', border:'1px solid rgba(255,100,100,0.2)', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', color:'#ff6b6b', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px', fontFamily:'DM Sans' }}>
            <LogOut size={13}/> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--border)', padding:'0 24px', display:'flex', gap:'0' }}>
        {[['book','Book a Shoot'],['history','My Bookings']].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setSubmitted(false); }} style={{
            padding:'14px 20px', background:'none', border:'none', cursor:'pointer',
            fontSize:'13px', fontWeight:'600', fontFamily:'DM Sans',
            color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
            transition:'all 0.15s'
          }}>{label} {id === 'history' && myBookings.length > 0 && <span style={{ marginLeft:'4px', background:'rgba(201,169,110,0.15)', color:'var(--accent)', borderRadius:'10px', padding:'1px 6px', fontSize:'10px' }}>{myBookings.length}</span>}</button>
        ))}
      </div>

      <div style={{ padding:'32px 24px', maxWidth:'980px', margin:'0 auto' }}>

        {/* BOOK TAB */}
        {tab === 'book' && !submitted && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>
            {/* Calendar */}
            <div className="card">
              <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Pick Your Dates</h2>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px' }}>
                Select <strong style={{ color:'var(--accent)' }}>{shootDays} date{shootDays > 1 ? 's' : ''}</strong> — grey dates unavailable
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
                  if (!cell.current) return <div key={i} style={{ aspectRatio:'1' }} />;
                  const busy = isBusy(cell.date);
                  const available = isAvailable(cell.date);
                  const selected = selectedDates.includes(cell.date);
                  const selIdx = selectedDates.indexOf(cell.date);
                  return (
                    <div key={i} onClick={() => handleDateClick(cell.date)} style={{
                      aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'12px', fontWeight:'600', cursor: busy ? 'not-allowed' : 'pointer', position:'relative',
                      background: selected ? 'var(--accent)' : available ? 'rgba(201,169,110,0.1)' : busy ? 'rgba(255,60,60,0.06)' : 'var(--surface2)',
                      color: selected ? '#1a1008' : busy ? 'var(--text-dim)' : available ? '#c9a96e' : 'var(--text)',
                      border: selected ? '2px solid var(--accent)' : '1px solid transparent',
                      transition:'all 0.1s'
                    }}>
                      {cell.day}
                      {selected && shootDays > 1 && <span style={{ position:'absolute', top:'-4px', right:'-4px', width:'14px', height:'14px', background:'#083f3e', borderRadius:'50%', fontSize:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800' }}>{selIdx+1}</span>}
                    </div>
                  );
                })}
              </div>
              {selectedDates.length > 0 && (
                <div style={{ marginTop:'12px', padding:'10px 12px', background:'rgba(201,169,110,0.06)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'8px' }}>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne' }}>Selected</div>
                  {selectedDates.map((d, i) => (
                    <div key={d} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'12px', color:'var(--accent)', fontWeight:'600' }}>Day {i+1}: {fmtShort(d)}</span>
                      <button onClick={() => setSelectedDates(p => p.filter(x => x !== d))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
              {errors.dates && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'6px' }}>{errors.dates}</p>}
              <div style={{ marginTop:'16px' }}>
                <label className="label">Shoot Days</label>
                <div style={{ display:'flex', gap:'8px' }}>
                  {[1,2].map(n => (
                    <button key={n} onClick={() => handleShootDaysChange(n)} style={{
                      flex:1, padding:'10px', borderRadius:'8px', border:'1px solid',
                      background: shootDays === n ? 'var(--accent)' : 'var(--surface2)',
                      borderColor: shootDays === n ? 'var(--accent)' : 'var(--border)',
                      color: shootDays === n ? '#1a1008' : 'var(--text)',
                      fontSize:'14px', fontWeight:'700', cursor:'pointer', fontFamily:'Syne'
                    }}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary + Submit */}
            <div className="card">
              <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Booking Summary</h2>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>Review and confirm your booking</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                {[
                  ['Company', clientUser.companyName],
                  ['Contact', clientUser.name],
                  ['Phone', clientUser.phone],
                  ['Shoot Days', `${shootDays} day${shootDays > 1 ? 's' : ''}`],
                  ['Dates', selectedDates.length > 0 ? selectedDates.map(fmtShort).join(', ') : 'Not selected yet'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                    <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontSize:'12px', color: k === 'Dates' && selectedDates.length === 0 ? 'var(--text-dim)' : 'var(--text)', fontWeight:'600', textAlign:'right', maxWidth:'60%' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'14px' }} onClick={handleSubmit}>
                Submit Booking Request
              </button>
              <p style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center', marginTop:'10px' }}>Our team will confirm within 24 hours</p>
            </div>
          </div>
        )}

        {/* SUBMITTED */}
        {tab === 'book' && submitted && (
          <div style={{ textAlign:'center', maxWidth:'480px', margin:'60px auto' }}>
            <div style={{ width:'64px', height:'64px', background:'rgba(201,169,110,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle size={32} color="#c9a96e" />
            </div>
            <h1 style={{ fontSize:'22px', fontWeight:'800', marginBottom:'12px' }}>Booking Sent!</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
              Your request has been received. We'll confirm within 24 hours.
            </p>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setSelectedDates([]); setTab('history'); }}>
              View My Bookings
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'800', marginBottom:'20px' }}>My Bookings</h2>
            {myBookings.length === 0 ? (
              <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                <Clock size={36} style={{ margin:'0 auto 16px', opacity:0.3 }} />
                <p>No bookings yet. Book your first shoot!</p>
                <button className="btn-primary" style={{ marginTop:'16px' }} onClick={() => setTab('book')}>Book Now</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {myBookings.map(b => (
                  <div key={b.id} className="card" style={{ borderLeft:`3px solid ${statusColor[b.status]}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                      <div>
                        <h3 style={{ fontSize:'15px', fontWeight:'700' }}>{b.projectName}</h3>
                        <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>Submitted {fmt(b.submittedAt)}</p>
                      </div>
                      <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', fontFamily:'Syne', background:statusBg[b.status], color:statusColor[b.status], textTransform:'capitalize' }}>{b.status}</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'8px' }}>
                      {[
                        { label:'Preferred Date', value: fmt(b.preferredDate), icon:'📅' },
                        { label:'Shoot Days', value:`${b.shootDays} day${b.shootDays>1?'s':''}`, icon:'🎬' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} style={{ padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                          <div style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne', marginBottom:'4px' }}>{icon} {label}</div>
                          <div style={{ fontSize:'13px', color:'var(--text)', fontWeight:'600' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {b.status === 'approved' && (
                      <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(100,200,100,0.08)', border:'1px solid rgba(100,200,100,0.2)', borderRadius:'8px', fontSize:'12px', color:'#6dc76d' }}>
                        ✓ Your booking is confirmed!
                      </div>
                    )}
                    {b.status === 'rejected' && (
                      <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ff6b6b' }}>
                        ✗ This booking was not approved. Please contact us for more info.
                      </div>
                    )}
                    {b.status === 'pending' && (
                      <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(255,165,0,0.08)', border:'1px solid rgba(255,165,0,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ffa500' }}>
                        ⏳ Awaiting confirmation from our team.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
