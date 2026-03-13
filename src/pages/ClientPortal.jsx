import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, ChevronLeft, ChevronRight, Clock, LogOut, AlertTriangle, Send } from 'lucide-react';
import ChatPanel from '../components/ChatPanel';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHLY_LIMIT = 2;

export default function ClientPortal({ clientUser, onLogout }) {
  const { dateMarks, shoots, submitBooking, bookings } = useApp();
  const [tab, setTab] = useState('book');
  const [calDate, setCalDate] = useState(new Date());
  const [submitted, setSubmitted] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [shootDays, setShootDays] = useState(1);
  const [errors, setErrors] = useState({});
  const [isRequest, setIsRequest] = useState(false); // true = over-limit request mode
  const [requestNote, setRequestNote] = useState('');

  const myBookings = bookings.filter(b =>
    (b.clientUserId != null && String(b.clientUserId) === String(clientUser.id)) ||
    (b.phone === clientUser.phone && b.clientName?.toLowerCase() === clientUser.companyName?.toLowerCase())
  );

  const today = new Date(); today.setHours(0,0,0,0);
  const year = calDate.getFullYear(), month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  // Count total shoot DAYS (not bookings) for the currently viewed month
  const bookingsThisMonth = myBookings.filter(b => {
    if (b.status === 'rejected') return false;
    const d = new Date(b.preferredDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const daysUsedThisMonth = bookingsThisMonth.reduce((sum, b) => sum + (b.shootDays || 1), 0);
  const overLimit = daysUsedThisMonth >= MONTHLY_LIMIT;
  const remaining = Math.max(0, MONTHLY_LIMIT - daysUsedThisMonth);
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
  }
  while (cells.length < 42) cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false, date: null });

  const isBusy = (date) => {
    if (!date) return true;
    if (new Date(date + 'T12:00:00') < today) return true;
    const mark = dateMarks.find(m => m.date === date);
    if (mark && mark.status !== 'available') return true;
    if (shoots.find(s => s.date === date)) return true;
    if (bookings.find(b => (b.status === 'pending' || b.status === 'approved') && b.preferredDate === date)) return true;
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
    // If selecting more days than remaining quota, switch to special request mode
    if (!isRequest && n > remaining) {
      setIsRequest(true);
    }
    setShootDays(n);
    setSelectedDates(p => p.slice(0, n));
  };

  const handleSubmit = () => {
    const e = {};
    if (selectedDates.length < shootDays) e.dates = `Please select ${shootDays} date${shootDays > 1 ? 's' : ''}`;
    if (isRequest && !requestNote.trim()) e.note = 'Please explain why you need an extra booking this month';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    submitBooking({
      clientName: clientUser.companyName,
      projectName: isRequest
        ? `[SPECIAL REQUEST] ${clientUser.companyName} - ${shootDays} Day Shoot`
        : `${clientUser.companyName} - ${shootDays} Day Shoot`,
      contactName: clientUser.name,
      phone: clientUser.phone,
      email: clientUser.email || '',
      preferredDate: selectedDates[0],
      selectedDates,
      shootDays,
      clientUserId: clientUser.id,
      notes: isRequest ? `Special request (over monthly limit): ${requestNote}` : '',
    });
    setSubmitted(true);
  };

  // When month changes, reset request mode
  const changeMonth = (delta) => {
    setCalDate(new Date(year, month + delta, 1));
    setSelectedDates([]);
    setIsRequest(false);
    setRequestNote('');
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtShort = d => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
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
        {[['book','Book a Shoot'],['history','My Bookings'],['chat','Chat with Team']].map(([id, label]) => (
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
          <div>
            {/* Monthly limit banner */}
            <div style={{
              marginBottom:'20px', padding:'12px 16px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'12px',
              background: overLimit ? 'rgba(255,165,0,0.08)' : 'rgba(109,199,109,0.06)',
              border: `1px solid ${overLimit ? 'rgba(255,165,0,0.25)' : 'rgba(109,199,109,0.2)'}`,
            }}>
              {overLimit
                ? <AlertTriangle size={18} color="#ffa500" style={{ flexShrink:0 }} />
                : <CheckCircle size={18} color="#6dc76d" style={{ flexShrink:0 }} />
              }
              <div>
                <div style={{ fontSize:'13px', fontWeight:'700', color: overLimit ? '#ffa500' : '#6dc76d' }}>
                  {overLimit
                    ? `Monthly limit reached for ${MONTHS[month]}`
                    : `${remaining} shoot day${remaining !== 1 ? 's' : ''} remaining for ${MONTHS[month]}`
                  }
                </div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'2px' }}>
                  {overLimit
                    ? `You've used your ${MONTHLY_LIMIT} shoot days this month. You can still send a special request below — our team will review it.`
                    : `Standard clients get ${MONTHLY_LIMIT} shoot days per month. You've used ${daysUsedThisMonth}.`
                  }
                </div>
              </div>
              {!overLimit && (
                <div style={{ marginLeft:'auto', background:'rgba(109,199,109,0.15)', borderRadius:'20px', padding:'3px 10px', fontSize:'11px', fontWeight:'800', color:'#6dc76d', fontFamily:'Syne', flexShrink:0 }}>
                  {daysUsedThisMonth}/{MONTHLY_LIMIT}
                </div>
              )}
            </div>

            {/* Over-limit: show request form instead of normal booking */}
            {overLimit && !isRequest && (
              <div className="card" style={{ textAlign:'center', padding:'48px 32px', borderColor:'rgba(255,165,0,0.2)' }}>
                <div style={{ width:'56px', height:'56px', background:'rgba(255,165,0,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <AlertTriangle size={26} color="#ffa500" />
                </div>
                <h2 style={{ fontSize:'18px', fontWeight:'800', marginBottom:'8px' }}>Monthly Limit Reached</h2>
                <p style={{ color:'var(--text-muted)', fontSize:'13px', lineHeight:'1.6', marginBottom:'24px', maxWidth:'360px', margin:'0 auto 24px' }}>
                  You've already used {daysUsedThisMonth} shoot day{daysUsedThisMonth !== 1 ? 's' : ''} in {MONTHS[month]}. Standard accounts are limited to {MONTHLY_LIMIT} shoot days per month.<br/><br/>
                  Need more? Send a special request and our team will review it.
                </p>
                <button className="btn-primary" style={{ gap:'8px' }} onClick={() => setIsRequest(true)}>
                  <Send size={14}/> Send Special Request
                </button>
              </div>
            )}

            {/* Special Request form */}
            {overLimit && isRequest && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>
                {/* Calendar */}
                <div className="card" style={{ borderColor:'rgba(255,165,0,0.2)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <AlertTriangle size={16} color="#ffa500" />
                    <h2 style={{ fontSize:'15px', fontWeight:'800' }}>Pick Your Dates</h2>
                  </div>
                  <p style={{ fontSize:'12px', color:'#ffa500', marginBottom:'16px', background:'rgba(255,165,0,0.08)', padding:'8px 10px', borderRadius:'6px', border:'1px solid rgba(255,165,0,0.2)' }}>
                    Special request — team approval required
                  </p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => changeMonth(-1)}><ChevronLeft size={14}/></button>
                    <span style={{ fontFamily:'Syne', fontSize:'14px', fontWeight:'700' }}>{MONTHS[month]} {year}</span>
                    <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => changeMonth(1)}><ChevronRight size={14}/></button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px', marginBottom:'3px' }}>
                    {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'10px', fontWeight:'600', color:'var(--text-muted)', padding:'3px 0', fontFamily:'Syne' }}>{d}</div>)}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px' }}>
                    {cells.map((cell, i) => {
                      if (!cell.current) return <div key={i} style={{ aspectRatio:'1' }} />;
                      const busy = isBusy(cell.date);
                      const selected = selectedDates.includes(cell.date);
                      return (
                        <div key={i} onClick={() => handleDateClick(cell.date)} style={{
                          aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'12px', fontWeight:'600', cursor: busy ? 'not-allowed' : 'pointer',
                          background: selected ? '#ffa500' : busy ? 'rgba(255,60,60,0.06)' : 'var(--surface2)',
                          color: selected ? '#1a1008' : busy ? 'var(--text-dim)' : 'var(--text)',
                          border: selected ? '2px solid #ffa500' : '1px solid transparent',
                          transition:'all 0.1s'
                        }}>{cell.day}</div>
                      );
                    })}
                  </div>
                  {errors.dates && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'6px' }}>{errors.dates}</p>}
                  <div style={{ marginTop:'16px' }}>
                    <label className="label">Shoot Days</label>
                    <div style={{ display:'flex', gap:'8px' }}>
                      {[1,2].map(n => (
                        <button key={n} onClick={() => handleShootDaysChange(n)} style={{
                          flex:1, padding:'10px', borderRadius:'8px', border:'1px solid',
                          background: shootDays === n ? '#ffa500' : 'var(--surface2)',
                          borderColor: shootDays === n ? '#ffa500' : 'var(--border)',
                          color: shootDays === n ? '#1a1008' : 'var(--text)',
                          fontSize:'14px', fontWeight:'700', cursor:'pointer', fontFamily:'Syne'
                        }}>{n}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Request details */}
                <div className="card" style={{ borderColor:'rgba(255,165,0,0.2)' }}>
                  <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Special Request</h2>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'20px' }}>Tell the team why you need an extra booking</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
                    {[
                      ['Company', clientUser.companyName],
                      ['Contact', clientUser.name],
                      ['Shoot Days', `${shootDays} day${shootDays > 1 ? 's' : ''}`],
                      ['Dates', selectedDates.length > 0 ? selectedDates.map(fmtShort).join(', ') : 'Not selected yet'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                        <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{k}</span>
                        <span style={{ fontSize:'12px', color:'var(--text)', fontWeight:'600', textAlign:'right', maxWidth:'60%' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:'16px' }}>
                    <label className="label">Reason for Extra Booking <span style={{ color:'#ff6b6b' }}>*</span></label>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="e.g. Urgent product launch, rescheduled shoot from last month..."
                      value={requestNote}
                      onChange={e => setRequestNote(e.target.value)}
                      style={{ resize:'vertical', minHeight:'90px', borderColor: errors.note ? '#ff6b6b' : undefined }}
                    />
                    {errors.note && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'4px' }}>{errors.note}</p>}
                  </div>
                  <button
                    style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'14px', background:'#ffa500', border:'none', borderRadius:'10px', color:'#1a1008', fontWeight:'700', cursor:'pointer', fontFamily:'DM Sans', display:'flex', alignItems:'center', gap:'8px' }}
                    onClick={handleSubmit}
                  >
                    <Send size={15}/> Submit Special Request
                  </button>
                  <button onClick={() => setIsRequest(false)} style={{ width:'100%', marginTop:'10px', padding:'10px', background:'transparent', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text-muted)', fontSize:'12px', cursor:'pointer', fontFamily:'DM Sans' }}>
                    Cancel
                  </button>
                  <p style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center', marginTop:'8px' }}>Our team will review your request manually</p>
                </div>
              </div>
            )}

            {/* Normal booking (under limit) */}
            {!overLimit && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>
                {/* Calendar */}
                <div className="card">
                  <h2 style={{ fontSize:'15px', fontWeight:'800', marginBottom:'4px' }}>Pick Your Dates</h2>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'16px' }}>
                    Select <strong style={{ color:'var(--accent)' }}>{shootDays} date{shootDays > 1 ? 's' : ''}</strong> — grey dates unavailable
                  </p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => changeMonth(-1)}><ChevronLeft size={14}/></button>
                    <span style={{ fontFamily:'Syne', fontSize:'14px', fontWeight:'700' }}>{MONTHS[month]} {year}</span>
                    <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => changeMonth(1)}><ChevronRight size={14}/></button>
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
                      {[1,2].map(n => {
                        const wouldExceed = n > remaining;
                        return (
                          <button key={n} onClick={() => handleShootDaysChange(n)} title={wouldExceed ? 'Exceeds your remaining days — will be sent as special request' : ''} style={{
                            flex:1, padding:'10px', borderRadius:'8px', border:'1px solid',
                            background: shootDays === n ? 'var(--accent)' : 'var(--surface2)',
                            borderColor: shootDays === n ? 'var(--accent)' : wouldExceed ? 'rgba(255,165,0,0.4)' : 'var(--border)',
                            color: shootDays === n ? '#1a1008' : wouldExceed ? '#ffa500' : 'var(--text)',
                            fontSize:'14px', fontWeight:'700', cursor:'pointer', fontFamily:'Syne',
                            position:'relative'
                          }}>
                            {n}
                            {wouldExceed && <span style={{ fontSize:'8px', display:'block', color:'#ffa500', fontWeight:'600' }}>request</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Summary */}
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
          </div>
        )}

        {/* SUBMITTED */}
        {tab === 'book' && submitted && (
          <div style={{ textAlign:'center', maxWidth:'480px', margin:'60px auto' }}>
            <div style={{ width:'64px', height:'64px', background: isRequest ? 'rgba(255,165,0,0.15)' : 'rgba(201,169,110,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              {isRequest ? <Send size={28} color="#ffa500" /> : <CheckCircle size={32} color="#c9a96e" />}
            </div>
            <h1 style={{ fontSize:'22px', fontWeight:'800', marginBottom:'12px' }}>
              {isRequest ? 'Special Request Sent!' : 'Booking Sent!'}
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
              {isRequest
                ? 'Your special request has been received. Our team will review it and get back to you soon.'
                : 'Your request has been received. We\'ll confirm within 24 hours.'
              }
            </p>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setSelectedDates([]); setIsRequest(false); setRequestNote(''); setTab('history'); }}>
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
                {myBookings.map(b => {
                  const isSpecial = b.projectName?.startsWith('[SPECIAL REQUEST]');
                  return (
                    <div key={b.id} className="card" style={{ borderLeft:`3px solid ${isSpecial ? '#ffa500' : statusColor[b.status]}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                            <h3 style={{ fontSize:'15px', fontWeight:'700' }}>{b.projectName?.replace('[SPECIAL REQUEST] ','')}</h3>
                            {isSpecial && <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', fontFamily:'Syne', background:'rgba(255,165,0,0.12)', color:'#ffa500' }}>Special Request</span>}
                          </div>
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
                      {b.notes && <div style={{ marginTop:'8px', padding:'8px 12px', background:'rgba(255,165,0,0.06)', border:'1px solid rgba(255,165,0,0.15)', borderRadius:'8px', fontSize:'12px', color:'rgba(240,237,232,0.7)' }}>📝 {b.notes}</div>}
                      {b.status === 'approved' && <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(100,200,100,0.08)', border:'1px solid rgba(100,200,100,0.2)', borderRadius:'8px', fontSize:'12px', color:'#6dc76d' }}>✓ Your booking is confirmed!</div>}
                      {b.status === 'rejected' && <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ff6b6b' }}>✗ This booking was not approved. Please contact us for more info.</div>}
                      {b.status === 'pending' && <div style={{ marginTop:'10px', padding:'10px 14px', background:'rgba(255,165,0,0.08)', border:'1px solid rgba(255,165,0,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ffa500' }}>⏳ {isSpecial ? 'Your special request is being reviewed.' : 'Awaiting confirmation from our team.'}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {tab === 'chat' && (
          <div style={{ maxWidth:'700px' }}>
            <h2 style={{ fontSize:'18px', fontWeight:'800', marginBottom:'20px' }}>Chat with Team Aaram</h2>
            <div className="card" style={{ padding:0, overflow:'hidden', height:'500px', display:'flex', flexDirection:'column' }}>
              <ChatPanel
                roomType="direct"
                roomId={`direct_client_${clientUser.id}`}
                roomLabel="Team Aaram"
                clientUser={clientUser}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
