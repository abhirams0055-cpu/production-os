import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, Clock, Calendar, Phone, Mail, User, Trash2, Pencil, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import ChatPanel from '../components/ChatPanel';

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'360px' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'800', marginBottom:'10px' }}>Confirm Delete</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginBottom:'24px', lineHeight:'1.6' }}>{message}</p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}><Trash2 size={13}/> Delete</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ booking, onClose, onSave }) {
  const [form, setForm] = useState({
    clientName: booking.clientName || '',
    contactName: booking.contactName || '',
    phone: booking.phone || '',
    email: booking.email || '',
    preferredDate: booking.preferredDate || '',
    shootDays: booking.shootDays || 1,
    notes: booking.notes || '',
  });

  const submit = () => { onSave(form); onClose(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'480px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:'800' }}>Edit Booking</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Client / Brand</label>
              <input className="input" value={form.clientName} onChange={e => setForm(p => ({...p, clientName: e.target.value}))} />
            </div>
            <div>
              <label className="label">Contact Name</label>
              <input className="input" value={form.contactName} onChange={e => setForm(p => ({...p, contactName: e.target.value}))} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Preferred Date</label>
              <input className="input" type="date" value={form.preferredDate} onChange={e => setForm(p => ({...p, preferredDate: e.target.value}))} />
            </div>
            <div>
              <label className="label">Shoot Days</label>
              <select className="input" value={form.shootDays} onChange={e => setForm(p => ({...p, shootDays: parseInt(e.target.value)}))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Internal Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Add notes for the team..." style={{ resize:'vertical', minHeight:'80px' }} />
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'4px' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { bookings, approveBooking, rejectBooking, deleteBooking, updateBooking, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [savingNote, setSavingNote] = useState({});
  const [noteText, setNoteText] = useState({});
  const [openChat, setOpenChat] = useState(null);

  const filtered = bookings.filter(b => filter === 'all' ? true : b.status === filter);
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const statusColor = { pending:'#ffa500', approved:'#6dc76d', rejected:'#ff6b6b' };
  const statusBg = { pending:'rgba(255,165,0,0.1)', approved:'rgba(100,200,100,0.1)', rejected:'rgba(255,60,60,0.1)' };

  const toggleNotes = (id, currentNote) => {
    setExpandedNotes(p => ({ ...p, [id]: !p[id] }));
    if (!noteText[id]) setNoteText(p => ({ ...p, [id]: currentNote || '' }));
  };

  const saveNote = async (id) => {
    setSavingNote(p => ({ ...p, [id]: true }));
    await updateBooking(id, { notes: noteText[id] });
    setSavingNote(p => ({ ...p, [id]: false }));
    setExpandedNotes(p => ({ ...p, [id]: false }));
  };

  return (
    <div className="page-bookings" style={{ padding:'28px', maxWidth:'1000px' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Client Bookings</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>Review and manage incoming booking requests</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'7px 16px', borderRadius:'8px', border:'1px solid',
            background: filter === f ? 'var(--accent)' : 'var(--surface2)',
            borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
            color: filter === f ? '#1a1008' : 'var(--text)',
            fontSize:'12px', fontWeight:'600', cursor:'pointer', textTransform:'capitalize',
            fontFamily:'Syne', transition:'all 0.1s'
          }}>
            {f} {f !== 'all' && <span style={{ marginLeft:'4px', opacity:0.7 }}>({bookings.filter(b => b.status === f).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
          <Clock size={36} style={{ margin:'0 auto 16px', opacity:0.3 }} />
          <p>No {filter !== 'all' ? filter : ''} bookings</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {filtered.map(b => (
            <div key={b.id} className="card" style={{ borderLeft:`3px solid ${b.projectName?.startsWith('[SPECIAL REQUEST]') ? '#ffa500' : statusColor[b.status]}` }}>

              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'2px' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:'700' }}>{b.clientName}</h3>
                    {b.projectName?.startsWith('[SPECIAL REQUEST]') && (
                      <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'800', fontFamily:'Syne', background:'rgba(255,165,0,0.15)', color:'#ffa500', border:'1px solid rgba(255,165,0,0.3)' }}>⚡ SPECIAL REQUEST</span>
                    )}
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--accent)', fontWeight:'600' }}>{b.projectName?.replace('[SPECIAL REQUEST] ','')}</p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', fontFamily:'Syne', background:statusBg[b.status], color:statusColor[b.status], textTransform:'capitalize' }}>{b.status}</span>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{fmt(b.submittedAt)} {fmtTime(b.submittedAt)}</span>
                  {isAdmin && (
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => setEditing(b)} title="Edit booking"
                        style={{ background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'6px', width:'28px', height:'28px', cursor:'pointer', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={() => setConfirm({ message:`Delete booking from "${b.clientName}"? This cannot be undone.`, onConfirm: () => deleteBooking(b.id) })}
                        title="Delete booking"
                        style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.15)', borderRadius:'6px', width:'28px', height:'28px', cursor:'pointer', color:'#ff6b6b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'10px', marginBottom:'14px' }}>
                {[
                  { icon: User, label: 'Contact', value: b.contactName },
                  { icon: Phone, label: 'Phone', value: b.phone },
                  { icon: Mail, label: 'Email', value: b.email },
                  { icon: Calendar, label: 'Preferred Date', value: fmt(b.preferredDate) },
                  { icon: Clock, label: 'Shoot Days', value: `${b.shootDays} day${b.shootDays > 1 ? 's' : ''}` },
                ].map(({ icon:Icon, label, value }) => (
                  <div key={label} style={{ display:'flex', gap:'8px', alignItems:'center', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                    <Icon size={13} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize:'10px', color:'var(--text-muted)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'Syne' }}>{label}</div>
                      <div style={{ fontSize:'12px', color:'var(--text)', marginTop:'1px' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes section */}
              {isAdmin && (
                <div style={{ marginBottom:'12px' }}>
                  {b.notes && !expandedNotes[b.id] && (
                    <div style={{ padding:'10px 12px', background:'rgba(201,169,110,0.06)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'8px', fontSize:'12px', color:'var(--text-muted)', marginBottom:'6px' }}>
                      <span style={{ color:'var(--accent)', fontWeight:'600', marginRight:'6px' }}>Note:</span>{b.notes}
                    </div>
                  )}
                  <button onClick={() => toggleNotes(b.id, b.notes)} style={{
                    background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)',
                    fontSize:'12px', display:'flex', alignItems:'center', gap:'5px', padding:'0',
                    fontFamily:'DM Sans'
                  }}>
                    <MessageSquare size={13}/>
                    {expandedNotes[b.id] ? 'Close notes' : (b.notes ? 'Edit note' : 'Add note')}
                    {expandedNotes[b.id] ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  </button>
                  {expandedNotes[b.id] && (
                    <div style={{ marginTop:'8px' }}>
                      <textarea className="input" rows={3}
                        value={noteText[b.id] ?? b.notes ?? ''}
                        onChange={e => setNoteText(p => ({ ...p, [b.id]: e.target.value }))}
                        placeholder="Add internal notes for the team..."
                        style={{ resize:'vertical', minHeight:'72px', marginBottom:'8px' }}
                      />
                      <button className="btn-primary" style={{ fontSize:'11px', padding:'6px 14px' }}
                        onClick={() => saveNote(b.id)} disabled={savingNote[b.id]}>
                        {savingNote[b.id] ? 'Saving...' : 'Save Note'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {isAdmin && b.status === 'pending' && (
                <div style={{ display:'flex', gap:'10px', marginTop:'4px', flexWrap:'wrap' }}>
                  <button className="btn-primary" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => approveBooking(b.id)}>
                    <Check size={13} /> Approve & Block Dates
                  </button>
                  <button className="btn-danger" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => rejectBooking(b.id)}>
                    <X size={13} /> Reject
                  </button>
                  <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${b.clientName}! 👋\n\nWe've received your shoot booking request for *${b.projectName}* on *${fmt(b.preferredDate)}*.\n\nOur team is reviewing it and will confirm shortly.\n\n— Team Aaram 🎬`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'8px 14px', background:'#25D366', border:'none', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none', cursor:'pointer' }}>
                    <span style={{ fontSize:'14px' }}>💬</span> WhatsApp — Received
                  </a>
                </div>
              )}

              {b.status === 'approved' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div style={{ padding:'10px 14px', background:'rgba(100,200,100,0.08)', border:'1px solid rgba(100,200,100,0.2)', borderRadius:'8px', fontSize:'12px', color:'#6dc76d' }}>
                    ✓ Booking approved. Dates blocked in calendar and shoot added.
                  </div>
                  {isAdmin && (
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${b.clientName}! 🎉\n\nYour shoot booking for *${b.projectName}* on *${fmt(b.preferredDate)}* has been *APPROVED* ✅\n\nPlease be ready. We'll be in touch with more details soon.\n\n— Team Aaram 🎬`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 14px', background:'#25D366', border:'none', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>
                        <span>💬</span> WhatsApp — Approved
                      </a>
                      <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${b.clientName}! 🎬\n\nJust a reminder — your shoot *${b.projectName}* is *TOMORROW* on *${fmt(b.preferredDate)}*!\n\nPlease be ready on time. Reach out if you have any questions.\n\n— Team Aaram`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 14px', background:'#128C7E', border:'none', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none' }}>
                        <span>⏰</span> WhatsApp — Reminder
                      </a>
                    </div>
                  )}
                </div>
              )}

              {b.status === 'rejected' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <div style={{ padding:'10px 14px', background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ff6b6b' }}>
                    ✗ Booking rejected.
                  </div>
                  {isAdmin && (
                    <a href={`https://wa.me/${b.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${b.clientName},\n\nUnfortunately, we're unable to confirm your shoot booking for *${b.projectName}* on *${fmt(b.preferredDate)}* at this time.\n\nPlease contact us to reschedule or for more information.\n\n— Team Aaram 🎬`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 14px', background:'#555', border:'none', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:'600', textDecoration:'none', width:'fit-content' }}>
                      <span>💬</span> WhatsApp — Rejected
                    </a>
                  )}
                </div>
              )}

              {/* Inline chat */}
              <div style={{ marginTop:'12px', borderTop:'1px solid var(--border)', paddingTop:'10px' }}>
                <button onClick={() => setOpenChat(openChat === b.id ? null : b.id)}
                  style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color: openChat === b.id ? 'var(--accent)' : 'var(--text-muted)', fontSize:'12px', fontFamily:'DM Sans', padding:'4px 0' }}>
                  <MessageSquare size={13}/> {openChat === b.id ? 'Hide Chat' : 'Chat about this booking'}
                </button>
                {openChat === b.id && (
                  <div style={{ marginTop:'10px', background:'var(--surface2)', borderRadius:'10px', border:'1px solid var(--border)', overflow:'hidden', maxHeight:'360px', display:'flex', flexDirection:'column' }}>
                    <ChatPanel roomType="booking" roomId={String(b.id)} roomLabel={`${b.clientName} — ${fmt(b.preferredDate)}`} currentUser={currentUser} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
      {editing && <EditModal booking={editing} onClose={() => setEditing(null)} onSave={(data) => updateBooking(editing.id, data)} />}
    </div>
  );
}
