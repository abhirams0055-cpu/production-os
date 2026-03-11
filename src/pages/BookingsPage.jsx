import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, X, Clock, Calendar, Phone, Mail, User, Trash2 } from 'lucide-react';

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

export default function BookingsPage() {
  const { bookings, approveBooking, rejectBooking, deleteBooking, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null);

  const filtered = bookings.filter(b => filter === 'all' ? true : b.status === filter);

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  const statusColor = { pending:'#ffa500', approved:'#6dc76d', rejected:'#ff6b6b' };
  const statusBg = { pending:'rgba(255,165,0,0.1)', approved:'rgba(100,200,100,0.1)', rejected:'rgba(255,60,60,0.1)' };

  return (
    <div style={{ padding:'28px', maxWidth:'1000px' }}>
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
            color: filter === f ? 'var(--bg)' : 'var(--text)',
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
            <div key={b.id} className="card" style={{ borderLeft:`3px solid ${statusColor[b.status]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
                <div>
                  <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'2px' }}>{b.clientName}</h3>
                  <p style={{ fontSize:'13px', color:'var(--accent)', fontWeight:'600' }}>{b.projectName}</p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', fontFamily:'Syne', background:statusBg[b.status], color:statusColor[b.status], textTransform:'capitalize' }}>{b.status}</span>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{fmt(b.submittedAt)} {fmtTime(b.submittedAt)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setConfirm({ message:`Delete booking from "${b.clientName}"? This cannot be undone.`, onConfirm: () => deleteBooking(b.id) })}
                      style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.15)', borderRadius:'6px', width:'28px', height:'28px', cursor:'pointer', color:'#ff6b6b', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                      title="Delete booking"
                    >
                      <Trash2 size={13}/>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'10px', marginBottom:'16px' }}>
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

              {isAdmin && b.status === 'pending' && (
                <div style={{ display:'flex', gap:'10px' }}>
                  <button className="btn-primary" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => approveBooking(b.id)}>
                    <Check size={13} /> Approve & Block Dates
                  </button>
                  <button className="btn-danger" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => rejectBooking(b.id)}>
                    <X size={13} /> Reject
                  </button>
                </div>
              )}

              {b.status === 'approved' && (
                <div style={{ padding:'10px 14px', background:'rgba(100,200,100,0.08)', border:'1px solid rgba(100,200,100,0.2)', borderRadius:'8px', fontSize:'12px', color:'#6dc76d' }}>
                  ✓ Booking approved. Dates blocked in calendar and shoot added.
                </div>
              )}
              {b.status === 'rejected' && (
                <div style={{ padding:'10px 14px', background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ff6b6b' }}>
                  ✗ Booking rejected.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}

export default function BookingsPage() {
  const { bookings, approveBooking, rejectBooking, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [filter, setFilter] = useState('all');

  const filtered = bookings.filter(b => filter === 'all' ? true : b.status === filter);

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  const statusColor = { pending:'#ffa500', approved:'#6dc76d', rejected:'#ff6b6b' };
  const statusBg = { pending:'rgba(255,165,0,0.1)', approved:'rgba(100,200,100,0.1)', rejected:'rgba(255,60,60,0.1)' };

  return (
    <div style={{ padding:'28px', maxWidth:'1000px' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Client Bookings</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>Review and manage incoming booking requests</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'7px 16px', borderRadius:'8px', border:'1px solid',
            background: filter === f ? 'var(--accent)' : 'var(--surface2)',
            borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
            color: filter === f ? 'var(--bg)' : 'var(--text)',
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
            <div key={b.id} className="card" style={{ borderLeft:`3px solid ${statusColor[b.status]}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px', flexWrap:'wrap', gap:'10px' }}>
                <div>
                  <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'2px' }}>{b.clientName}</h3>
                  <p style={{ fontSize:'13px', color:'var(--accent)', fontWeight:'600' }}>{b.projectName}</p>
                </div>
                <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                  <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', fontFamily:'Syne', background:statusBg[b.status], color:statusColor[b.status], textTransform:'capitalize' }}>{b.status}</span>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{fmt(b.submittedAt)} {fmtTime(b.submittedAt)}</span>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'10px', marginBottom:'16px' }}>
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

              {isAdmin && b.status === 'pending' && (
                <div style={{ display:'flex', gap:'10px' }}>
                  <button className="btn-primary" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => approveBooking(b.id)}>
                    <Check size={13} /> Approve & Block Dates
                  </button>
                  <button className="btn-danger" style={{ fontSize:'12px', padding:'8px 16px' }} onClick={() => rejectBooking(b.id)}>
                    <X size={13} /> Reject
                  </button>
                </div>
              )}

              {b.status === 'approved' && (
                <div style={{ padding:'10px 14px', background:'rgba(100,200,100,0.08)', border:'1px solid rgba(100,200,100,0.2)', borderRadius:'8px', fontSize:'12px', color:'#6dc76d' }}>
                  ✓ Booking approved. Dates blocked in calendar and shoot added.
                </div>
              )}
              {b.status === 'rejected' && (
                <div style={{ padding:'10px 14px', background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.2)', borderRadius:'8px', fontSize:'12px', color:'#ff6b6b' }}>
                  ✗ Booking rejected.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
