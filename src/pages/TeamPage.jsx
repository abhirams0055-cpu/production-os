import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Shield, User, CheckSquare, Camera, Plus, X, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

const roleColors = { admin: 'var(--accent)', member: '#7aadff' };

function MemberModal({ member, onClose, onSave }) {
  const isEdit = !!member;
  const [form, setForm] = useState(member || {
    name: '', email: '', password: '', title: '', role: 'member'
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!isEdit && !form.password.trim()) e.password = 'Required';
    if (!form.title.trim()) e.title = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:'440px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'17px', fontWeight:'800' }}>{isEdit ? 'Edit Member' : 'Add Member'}</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18}/></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {/* Avatar preview */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'4px' }}>
            <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:`linear-gradient(135deg, ${roleColors[form.role] || '#7aadff'}, #c678dd)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:'800', fontSize:'22px', color:'var(--bg)' }}>
              {form.name ? form.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Rahul" style={{ borderColor: errors.name ? '#ff6b6b' : undefined }} />
              {errors.name && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="label">Job Title *</label>
              <input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Cinematographer" style={{ borderColor: errors.title ? '#ff6b6b' : undefined }} />
              {errors.title && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.title}</p>}
            </div>
          </div>

          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="name@teamaaram.com" style={{ borderColor: errors.email ? '#ff6b6b' : undefined }} />
            {errors.email && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.email}</p>}
          </div>

          <div>
            <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <div style={{ position:'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} value={form.password || ''} onChange={e => setForm(p => ({...p, password: e.target.value}))} placeholder={isEdit ? '••••••••' : 'Set password'} style={{ borderColor: errors.password ? '#ff6b6b' : undefined, paddingRight:'40px' }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {errors.password && <p style={{ color:'#ff6b6b', fontSize:'11px', marginTop:'3px' }}>{errors.password}</p>}
          </div>

          <div>
            <label className="label">Role</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {['member', 'admin'].map(r => (
                <button key={r} onClick={() => setForm(p => ({...p, role: r}))} style={{
                  flex:1, padding:'10px', borderRadius:'8px',
                  border: `1px solid ${form.role === r ? roleColors[r] : 'var(--border)'}`,
                  background: form.role === r ? `${roleColors[r]}15` : 'var(--surface2)',
                  color: form.role === r ? roleColors[r] : 'var(--text-muted)',
                  fontFamily:'Syne', fontWeight:'700', fontSize:'12px',
                  cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s'
                }}>{r}</button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'6px' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>{isEdit ? 'Save Changes' : 'Add Member'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function TeamPage() {
  const { team, tasks, currentUser, addMember, updateMember, deleteMember } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter(t => t.assignedTo === memberId);
    return {
      total: memberTasks.length,
      pending: memberTasks.filter(t => t.status === 'pending').length,
      inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
      completed: memberTasks.filter(t => t.status === 'completed').length,
    };
  };

  const handleDelete = (member) => {
    if (member.id === currentUser?.id) return; // can't delete self
    setConfirm({
      message: `Remove "${member.name}" from the team? They will no longer be able to log in.`,
      onConfirm: () => deleteMember(member.id)
    });
  };

  const admins = team.filter(m => m.role === 'admin');
  const members = team.filter(m => m.role === 'member');

  const MemberCard = ({ member }) => {
    const stats = getMemberStats(member.id);
    const isMe = member.id === currentUser?.id;
    const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
      <div className="card" style={{
        border: isMe ? '1px solid var(--accent)' : '1px solid var(--border)',
        position:'relative', overflow:'hidden'
      }}>
        {isMe && (
          <div style={{ position:'absolute', top:0, right:0, background:'var(--accent)', color:'#1a1008', fontSize:'9px', fontWeight:'800', padding:'3px 10px', fontFamily:'Syne', letterSpacing:'0.06em', borderBottomLeftRadius:'8px' }}>YOU</div>
        )}

        <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'14px' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`linear-gradient(135deg, ${roleColors[member.role]}, #c678dd)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:'800', fontSize:'19px', color:'var(--bg)', flexShrink:0 }}>
            {member.name.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <h3 style={{ fontSize:'14px', fontWeight:'700', color:'var(--text)' }}>{member.name}</h3>
              {isAdmin && (
                <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                  <button onClick={() => setEditing(member)} style={{ background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'6px', width:'26px', height:'26px', cursor:'pointer', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Pencil size={11}/>
                  </button>
                  {member.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(member)} style={{ background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.15)', borderRadius:'6px', width:'26px', height:'26px', cursor:'pointer', color:'#ff6b6b', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Trash2 size={11}/>
                    </button>
                  )}
                </div>
              )}
            </div>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'1px' }}>{member.title}</p>
            <span style={{ display:'inline-block', marginTop:'4px', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', fontFamily:'Syne', background:`${roleColors[member.role]}20`, color:roleColors[member.role], textTransform:'capitalize' }}>
              {member.role}
            </span>
          </div>
        </div>

        <a href={`mailto:${member.email}`} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--text-muted)', textDecoration:'none', padding:'6px 10px', background:'var(--surface2)', borderRadius:'6px', border:'1px solid var(--border)', marginBottom:'12px', justifyContent:'center' }}>
          <Mail size={11}/> {member.email}
        </a>

        <div style={{ marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Task completion</span>
            <span style={{ fontSize:'11px', fontWeight:'700', color:'var(--accent)' }}>{completionPct}%</span>
          </div>
          <div style={{ height:'4px', background:'var(--surface2)', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${completionPct}%`, background:'var(--accent)', borderRadius:'2px', transition:'width 0.4s' }} />
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
          {[
            { label:'Pending', value:stats.pending, color:'#ffa500' },
            { label:'Active', value:stats.inProgress, color:'#7aadff' },
            { label:'Done', value:stats.completed, color:'#6dc76d' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'8px 4px', background:'var(--surface2)', borderRadius:'8px' }}>
              <div style={{ fontSize:'16px', fontWeight:'800', fontFamily:"'Playfair Display', serif", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-team" style={{ padding:'28px', maxWidth:'960px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Team</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>
            {team.length} member{team.length !== 1 ? 's' : ''} · {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={14}/> Add Member
          </button>
        )}
      </div>

      {/* Admins */}
      {admins.length > 0 && (
        <div style={{ marginBottom:'28px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <Shield size={14} color="var(--accent)"/>
            <h2 style={{ fontSize:'13px', fontWeight:'700', color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Syne' }}>Admins</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
            {admins.map(m => <MemberCard key={m.id} member={m}/>)}
          </div>
        </div>
      )}

      {/* Members */}
      {members.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
            <User size={14} color="#7aadff"/>
            <h2 style={{ fontSize:'13px', fontWeight:'700', color:'#7aadff', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Syne' }}>Members</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
            {members.map(m => <MemberCard key={m.id} member={m}/>)}
          </div>
        </div>
      )}

      {showAdd && (
        <MemberModal
          member={null}
          onClose={() => setShowAdd(false)}
          onSave={(data) => addMember(data)}
        />
      )}
      {editing && (
        <MemberModal
          member={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => updateMember(editing.id, data)}
        />
      )}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
