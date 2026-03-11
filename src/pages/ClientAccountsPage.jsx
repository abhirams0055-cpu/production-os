import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Pencil, Trash2, Eye, EyeOff, Building2, Phone, Mail, User } from 'lucide-react';

function ClientAccountModal({ account, onClose, onSave }) {
  const isEdit = !!account;
  const [form, setForm] = useState(account || { companyName:'', name:'', phone:'', email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => { if (!validate()) return; onSave(form); onClose(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'440px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:'800' }}>{isEdit ? 'Edit Client Account' : 'Add Client Account'}</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
          <div>
            <label className="label">Company / Brand Name *</label>
            <input className="input" value={form.companyName} onChange={e => setForm(p=>({...p, companyName:e.target.value}))} style={{ borderColor: errors.companyName ? '#ff6b6b' : undefined }} />
            {errors.companyName && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.companyName}</p>}
          </div>
          <div>
            <label className="label">Contact Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(p=>({...p, name:e.target.value}))} style={{ borderColor: errors.name ? '#ff6b6b' : undefined }} />
            {errors.name && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.name}</p>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Phone *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(p=>({...p, phone:e.target.value}))} style={{ borderColor: errors.phone ? '#ff6b6b' : undefined }} />
              {errors.phone && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(p=>({...p, email:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="label">{isEdit ? 'New Password (blank = keep)' : 'Password *'}</label>
            <div style={{ position:'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm(p=>({...p, password:e.target.value}))} style={{ paddingRight:'40px', borderColor: errors.password ? '#ff6b6b' : undefined }} />
              <button onClick={() => setShowPw(p=>!p)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {errors.password && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.password}</p>}
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'4px' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>{isEdit ? 'Save Changes' : 'Add Client'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:'360px' }}>
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

export default function ClientAccountsPage() {
  const { clientAccounts, addClientAccount, updateClientAccount, deleteClientAccount, bookings } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showPw, setShowPw] = useState({});

  const getBookingCount = (account) =>
    bookings.filter(b => b.clientName?.toLowerCase() === account.companyName?.toLowerCase() || b.phone === account.phone).length;

  return (
    <div style={{ padding:'28px', maxWidth:'900px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Client Accounts</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>Manage client login credentials for the booking portal</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14}/> Add Client</button>
      </div>

      {clientAccounts.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
          <Building2 size={36} style={{ margin:'0 auto 16px', opacity:0.3 }} />
          <p style={{ marginBottom:'16px' }}>No client accounts yet.</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14}/> Add First Client</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {clientAccounts.map(acc => (
            <div key={acc.id} className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg, #083f3e, var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:'800', fontSize:'18px', color:'#f0ede8', flexShrink:0 }}>
                    {acc.companyName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'var(--text)' }}>{acc.companyName}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{acc.name} · {acc.phone}</div>
                    {acc.email && <div style={{ fontSize:'11px', color:'var(--text-dim)', marginTop:'1px' }}>{acc.email}</div>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px', background:'var(--surface2)', borderRadius:'8px', border:'1px solid var(--border)' }}>
                    <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Password:</span>
                    <span style={{ fontSize:'12px', color:'var(--text)', fontFamily:'monospace', letterSpacing: showPw[acc.id] ? '0' : '2px' }}>
                      {showPw[acc.id] ? acc.password : '••••••••'}
                    </span>
                    <button onClick={() => setShowPw(p => ({...p, [acc.id]: !p[acc.id]}))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'0 2px' }}>
                      {showPw[acc.id] ? <EyeOff size={12}/> : <Eye size={12}/>}
                    </button>
                  </div>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)', background:'var(--surface2)', padding:'4px 10px', borderRadius:'8px', border:'1px solid var(--border)' }}>
                    {getBookingCount(acc)} booking{getBookingCount(acc) !== 1 ? 's' : ''}
                  </span>
                  <button onClick={() => setEditing(acc)} style={{ background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'6px', width:'30px', height:'30px', cursor:'pointer', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Pencil size={13}/>
                  </button>
                  <button onClick={() => setConfirm({ message:`Delete client account for "${acc.companyName}"?`, onConfirm: () => deleteClientAccount(acc.id) })} style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.15)', borderRadius:'6px', width:'30px', height:'30px', cursor:'pointer', color:'#ff6b6b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <ClientAccountModal account={null} onClose={() => setShowAdd(false)} onSave={addClientAccount} />}
      {editing && <ClientAccountModal account={editing} onClose={() => setEditing(null)} onSave={(data) => updateClientAccount(editing.id, data)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
