import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus, X, ExternalLink, Trash2, MapPin, Users, FileText } from 'lucide-react';

const SHOOT_TYPES = ['Reel', 'Advertisement', 'YouTube Video', 'Brand Film'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function ShootModal({ shoot, onClose, onDelete, team, isAdmin }) {
  if (!shoot) return null;
  const crewNames = shoot.crew?.map(id => team.find(t => t.id === id)?.name).filter(Boolean);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'480px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontSize:'18px', fontWeight:'800' }}>{shoot.projectName}</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>{shoot.clientName}</p>
          </div>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <span className="badge badge-confirmed">{shoot.shootType}</span>
            <span className="badge badge-confirmed" style={{ background:'rgba(100,200,100,0.1)', color:'#6dc76d' }}>
              {new Date(shoot.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}
            </span>
          </div>

          <div style={{ display:'flex', gap:'8px', alignItems:'flex-start', padding:'12px', background:'var(--surface2)', borderRadius:'8px' }}>
            <MapPin size={14} color="var(--text-muted)" style={{ marginTop:'2px', flexShrink:0 }} />
            <span style={{ fontSize:'13px', color:'var(--text)' }}>{shoot.location || 'TBD'}</span>
          </div>

          {crewNames?.length > 0 && (
            <div style={{ display:'flex', gap:'8px', alignItems:'flex-start', padding:'12px', background:'var(--surface2)', borderRadius:'8px' }}>
              <Users size={14} color="var(--text-muted)" style={{ marginTop:'2px', flexShrink:0 }} />
              <span style={{ fontSize:'13px', color:'var(--text)' }}>{crewNames.join(', ')}</span>
            </div>
          )}

          {shoot.notes && (
            <div style={{ padding:'12px', background:'var(--surface2)', borderRadius:'8px' }}>
              <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em' }}>Notes</div>
              <div style={{ fontSize:'13px', color:'var(--text)' }}>{shoot.notes}</div>
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
            {shoot.docsLink && (
              <a href={shoot.docsLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ flex:1, justifyContent:'center', textDecoration:'none' }}>
                <FileText size={14} /> Open Brief
              </a>
            )}
            {isAdmin && (
              <button className="btn-danger" onClick={() => { onDelete(shoot.id); onClose(); }}>
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddShootModal({ onClose, onAdd, team, defaultDate }) {
  const [form, setForm] = useState({
    clientName:'', projectName:'', shootType:'Reel', date: defaultDate || '',
    location:'', crew:[], notes:'', docsLink:''
  });
  const [err, setErr] = useState('');

  const toggleCrew = id => setForm(p => ({
    ...p, crew: p.crew.includes(id) ? p.crew.filter(c=>c!==id) : [...p.crew, id]
  }));

  const submit = () => {
    if (!form.clientName || !form.projectName || !form.date) { setErr('Please fill required fields'); return; }
    onAdd(form); onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'800' }}>Add Shoot</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div><label className="label">Client Name *</label><input className="input" value={form.clientName} onChange={e=>setForm(p=>({...p,clientName:e.target.value}))} placeholder="e.g. PADMA" /></div>
            <div><label className="label">Project Name *</label><input className="input" value={form.projectName} onChange={e=>setForm(p=>({...p,projectName:e.target.value}))} placeholder="e.g. Summer Reel" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div><label className="label">Shoot Type</label>
              <select className="input" value={form.shootType} onChange={e=>setForm(p=>({...p,shootType:e.target.value}))}>
                {SHOOT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Date *</label><input className="input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} /></div>
          </div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} placeholder="Studio A, Andheri West" /></div>
          <div>
            <label className="label">Crew Members</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px' }}>
              {team.map(m => (
                <button key={m.id} onClick={() => toggleCrew(m.id)} style={{
                  padding:'5px 12px', borderRadius:'20px', border:'1px solid',
                  background: form.crew.includes(m.id) ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: form.crew.includes(m.id) ? 'var(--accent)' : 'var(--border)',
                  color: form.crew.includes(m.id) ? 'var(--bg)' : 'var(--text)',
                  fontSize:'12px', cursor:'pointer', fontWeight:'500', transition:'all 0.1s'
                }}>{m.name.split(' ')[0]}</button>
              ))}
            </div>
          </div>
          <div><label className="label">Google Docs Brief Link</label><input className="input" value={form.docsLink} onChange={e=>setForm(p=>({...p,docsLink:e.target.value}))} placeholder="https://docs.google.com/..." /></div>
          <div><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any special instructions..." style={{ resize:'vertical' }} /></div>
          {err && <p style={{ color:'#ff6b6b', fontSize:'12px' }}>{err}</p>}
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Add Shoot</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { shoots, addShoot, deleteShoot, dateMarks, setDateMark, removeDateMark, team, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const today = new Date();

  const [calDate, setCalDate] = useState(new Date());
  const [selectedShoot, setSelectedShoot] = useState(null);
  const [showAddShoot, setShowAddShoot] = useState(false);
  const [addShootDate, setAddShootDate] = useState('');
  const [markDate, setMarkDate] = useState(null);

  const year = calDate.getFullYear();
  const month = calDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCalDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalDate(new Date(year, month + 1, 1));

  const cells = [];
  // prev month padding
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, currentMonth: false, date: null });
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day: d, currentMonth: true, date: dateStr });
  }
  // next month padding
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, currentMonth: false, date: null });

  const getShootsForDate = date => shoots.filter(s => s.date === date);
  const getMarkForDate = date => dateMarks.find(m => m.date === date);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const handleDayClick = (date) => {
    if (!date || !isAdmin) return;
    setAddShootDate(date);
    setMarkDate(date);
  };

  return (
    <div className="page-calendar" style={{ padding:'28px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Shoot Calendar</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>Manage shoots and availability</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setAddShootDate(''); setShowAddShoot(true); }}>
            <Plus size={14} /> Add Shoot
          </button>
        )}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:'16px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[
          { label:'Shoot', cls:'cal-event-shoot' },
          { label:'Busy', cls:'cal-event-busy' },
          { label:'Tentative', cls:'cal-event-tentative' },
          { label:'Available', cls:'cal-event-available' },
          { label:'Booking', cls:'cal-event-booking' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
            <div className={`cal-event ${l.cls}`} style={{ padding:'2px 8px', margin:0 }}>{l.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={prevMonth}><ChevronLeft size={16} /></button>
          <h2 style={{ fontSize:'16px', fontWeight:'700' }}>{MONTHS[month]} {year}</h2>
          <button style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'4px' }}>
          {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'11px', fontWeight:'600', color:'var(--text-muted)', padding:'4px 0', fontFamily:'Syne', letterSpacing:'0.06em' }}>{d}</div>)}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
          {cells.map((cell, i) => {
            if (!cell.currentMonth) return <div key={i} style={{ minHeight:'80px', borderRadius:'8px', opacity:'0.15', background:'var(--surface)' }} />;
            const dayShoot = getShootsForDate(cell.date);
            const mark = getMarkForDate(cell.date);
            const isToday = cell.date === todayStr;

            return (
              <div
                key={i}
                className={`cal-day ${isToday ? 'today' : ''} ${dayShoot.length > 0 || mark ? 'has-event' : ''}`}
                onClick={() => handleDayClick(cell.date)}
              >
                <div style={{ fontSize:'11px', fontWeight: isToday ? '800' : '500', color: isToday ? 'var(--accent)' : 'var(--text)', marginBottom:'3px' }}>{cell.day}</div>
                {mark && <div className={`cal-event cal-event-${mark.status}`} style={{ cursor: isAdmin ? 'pointer' : 'default' }} onClick={e => { e.stopPropagation(); if(isAdmin) removeDateMark(cell.date); }}>{mark.status}</div>}
                {dayShoot.map(s => (
                  <div key={s.id} className="cal-event cal-event-shoot" onClick={e => { e.stopPropagation(); setSelectedShoot(s); }}>
                    {s.clientName}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark date panel for admin */}
      {isAdmin && markDate && !showAddShoot && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'14px', padding:'16px', zIndex:50, minWidth:'240px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
            <span style={{ fontSize:'13px', fontWeight:'700' }}>{new Date(markDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
            <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={() => setMarkDate(null)}><X size={14} /></button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {['busy','available','tentative'].map(s => (
              <button key={s} className="btn-secondary" style={{ justifyContent:'flex-start', textTransform:'capitalize', fontSize:'12px', padding:'7px 12px' }}
                onClick={() => { setDateMark(markDate, s); setMarkDate(null); }}>
                Mark as {s}
              </button>
            ))}
            <button className="btn-primary" style={{ fontSize:'12px', padding:'7px 12px' }}
              onClick={() => { setShowAddShoot(true); setMarkDate(null); }}>
              <Plus size={12} /> Add Shoot Here
            </button>
          </div>
        </div>
      )}

      {/* Shoot detail modal */}
      {selectedShoot && (
        <ShootModal
          shoot={selectedShoot}
          onClose={() => setSelectedShoot(null)}
          onDelete={deleteShoot}
          team={team}
          isAdmin={isAdmin}
        />
      )}

      {/* Add shoot modal */}
      {showAddShoot && (
        <AddShootModal
          onClose={() => setShowAddShoot(false)}
          onAdd={addShoot}
          team={team}
          defaultDate={addShootDate}
        />
      )}
    </div>
  );
}
