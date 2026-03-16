import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, ChevronRight, FileText, ExternalLink, Users, Calendar, FolderOpen, Trash2 } from 'lucide-react';

function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name:'', contact:'', phone:'', email:'' });
  const submit = () => { if (!form.name) return; onAdd(form); onClose(); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:'420px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'800' }}>Add Client</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div><label className="label">Company Name *</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. PADMA" /></div>
          <div><label className="label">Contact Person</label><input className="input" value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))} placeholder="Name" /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" /></div>
          <div><label className="label">Email</label><input className="input" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="contact@client.com" /></div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'6px' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Add Client</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProjectModal({ clientId, onClose, onAdd, shoots, team }) {
  const [form, setForm] = useState({ name:'', status:'planned', shootId:'', docsLink:'', team:[] });
  const toggleMember = id => setForm(p => ({ ...p, team: p.team.includes(id) ? p.team.filter(m=>m!==id) : [...p.team, id] }));
  const submit = () => {
    if (!form.name) return;
    onAdd(clientId, { ...form, shootId: form.shootId ? parseInt(form.shootId) : null, team: form.team });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'800' }}>Add Project</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div><label className="label">Project Name *</label><input className="input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Summer Reel" /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {['planned','active','completed','on-hold'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Link to Shoot</label>
              <select className="input" value={form.shootId} onChange={e=>setForm(p=>({...p,shootId:e.target.value}))}>
                <option value="">None</option>
                {shoots.map(s=><option key={s.id} value={s.id}>{s.projectName} ({new Date(s.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})})</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Google Docs Link</label><input className="input" value={form.docsLink} onChange={e=>setForm(p=>({...p,docsLink:e.target.value}))} placeholder="https://docs.google.com/..." /></div>
          <div>
            <label className="label">Team Members</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'4px' }}>
              {team.map(m => (
                <button key={m.id} onClick={() => toggleMember(m.id)} style={{
                  padding:'4px 12px', borderRadius:'20px', border:'1px solid',
                  background: form.team.includes(m.id) ? 'var(--accent)' : 'var(--surface2)',
                  borderColor: form.team.includes(m.id) ? 'var(--accent)' : 'var(--border)',
                  color: form.team.includes(m.id) ? '#1a1008' : 'var(--text)',
                  fontSize:'11px', cursor:'pointer'
                }}>{m.name.split(' ')[0]}</button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Add Project</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:'380px' }}>
        <h2 style={{ fontSize:'16px', fontWeight:'800', marginBottom:'12px' }}>Confirm Delete</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginBottom:'24px' }}>{message}</p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { clients, addClient, addProject, deleteClient, deleteProject, shoots, team, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [showAddClient, setShowAddClient] = useState(false);
  const [addProjectFor, setAddProjectFor] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  const toggle = id => setExpanded(p => p.includes(id) ? p.filter(i=>i!==id) : [...p,id]);

  const statusColor = { active:'#6dc76d', planned:'#7aadff', completed:'var(--text-muted)', 'on-hold':'#ffa500' };
  const getMemberName = id => team.find(t=>t.id===id)?.name?.split(' ')[0] || '?';
  const getShoot = id => shoots.find(s=>s.id===id);

  const handleDeleteClient = (client) => {
    setConfirm({
      message: `Delete client "${client.name}" and all their projects? This cannot be undone.`,
      onConfirm: () => deleteClient(client.id)
    });
  };

  const handleDeleteProject = (clientId, proj) => {
    setConfirm({
      message: `Delete project "${proj.name}"? This cannot be undone.`,
      onConfirm: () => deleteProject(clientId, proj.id)
    });
  };

  return (
    <div className="page-projects" style={{ padding:'28px', maxWidth:'1000px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Client Projects</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>All clients and their project portfolios</p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowAddClient(true)}><Plus size={14} /> Add Client</button>}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'24px', flexWrap:'wrap' }}>
        {[
          { label:'Clients', value: clients.length, color:'var(--accent)' },
          { label:'Total Projects', value: clients.reduce((a,c)=>a+c.projects.length,0), color:'#7aadff' },
          { label:'Active', value: clients.reduce((a,c)=>a+c.projects.filter(p=>p.status==='active').length,0), color:'#6dc76d' },
        ].map(s => (
          <div key={s.label} style={{ padding:'12px 18px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px' }}>
            <div style={{ fontSize:'22px', fontWeight:'800', fontFamily:"'Playfair Display', serif", color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {clients.map(client => (
          <div key={client.id} className="card" style={{ padding:0, overflow:'hidden' }}>
            {/* Client header */}
            <div style={{ padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--surface)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', cursor:'pointer', flex:1 }} onClick={() => toggle(client.id)}>
                <div style={{ width:'38px', height:'38px', background:'linear-gradient(135deg, var(--accent), #083f3e)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:'800', fontSize:'16px', color:'#f0ede8', flexShrink:0 }}>
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize:'15px', fontWeight:'700' }}>{client.name}</h3>
                  <div style={{ display:'flex', gap:'12px', marginTop:'2px' }}>
                    {client.contact && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{client.contact}</span>}
                    {client.email && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{client.email}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:'600' }}>{client.projects.length} project{client.projects.length!==1?'s':''}</span>
                {isAdmin && (
                  <button onClick={e => { e.stopPropagation(); handleDeleteClient(client); }} style={{
                    background:'rgba(255,60,60,0.08)', border:'1px solid rgba(255,60,60,0.15)',
                    borderRadius:'6px', padding:'5px 8px', cursor:'pointer', color:'#ff6b6b',
                    display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', transition:'all 0.15s'
                  }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,60,60,0.18)'}
                  onMouseOut={e=>e.currentTarget.style.background='rgba(255,60,60,0.08)'}>
                    <Trash2 size={12} /> Delete Client
                  </button>
                )}
                <ChevronRight size={16} color="var(--text-muted)" style={{ transform: expanded.includes(client.id) ? 'rotate(90deg)' : 'none', transition:'transform 0.2s', cursor:'pointer' }} onClick={() => toggle(client.id)} />
              </div>
            </div>

            {/* Projects */}
            {expanded.includes(client.id) && (
              <div style={{ padding:'0 20px 16px', background:'var(--surface2)', borderTop:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'12px', marginBottom:'10px' }}>
                  {isAdmin && (
                    <button className="btn-secondary" style={{ fontSize:'11px', padding:'5px 12px' }} onClick={() => setAddProjectFor(client.id)}>
                      <Plus size={12} /> Add Project
                    </button>
                  )}
                </div>
                {client.projects.length === 0 ? (
                  <p style={{ color:'var(--text-muted)', fontSize:'13px', padding:'12px 0' }}>No projects yet</p>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'12px' }}>
                    {client.projects.map(proj => {
                      const shoot = proj.shootId ? getShoot(proj.shootId) : null;
                      return (
                        <div key={proj.id} style={{ padding:'14px', background:'var(--surface)', borderRadius:'10px', border:'1px solid var(--border)', position:'relative' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                            <h4 style={{ fontSize:'13px', fontWeight:'600', color:'var(--text)', flex:1, marginRight:'8px' }}>{proj.name}</h4>
                            <div style={{ display:'flex', gap:'6px', alignItems:'center', flexShrink:0 }}>
                              <span style={{ fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background:`${statusColor[proj.status]}20`, color:statusColor[proj.status], textTransform:'capitalize', fontFamily:'Syne' }}>{proj.status}</span>
                              {isAdmin && (
                                <button onClick={() => handleDeleteProject(client.id, proj)} style={{
                                  background:'none', border:'none', cursor:'pointer', color:'rgba(255,100,100,0.5)',
                                  padding:'2px', display:'flex', alignItems:'center', transition:'color 0.15s'
                                }}
                                onMouseOver={e=>e.currentTarget.style.color='#ff6b6b'}
                                onMouseOut={e=>e.currentTarget.style.color='rgba(255,100,100,0.5)'}>
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                          {shoot && (
                            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}>
                              <Calendar size={11} color="var(--text-muted)" />
                              <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>
                                {new Date(shoot.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · {shoot.shootType}
                              </span>
                            </div>
                          )}

                          {proj.team?.length > 0 && (
                            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                              <Users size={11} color="var(--text-muted)" />
                              <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{proj.team.map(getMemberName).join(', ')}</span>
                            </div>
                          )}

                          {proj.docsLink && (
                            <a href={proj.docsLink} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--accent)', textDecoration:'none', fontWeight:'600' }}>
                              <FileText size={11} /> Open Brief <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {clients.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
            <FolderOpen size={36} style={{ margin:'0 auto 16px', opacity:0.3 }} />
            <p>No clients yet. Add your first client!</p>
          </div>
        )}
      </div>

      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} onAdd={addClient} />}
      {addProjectFor && <AddProjectModal clientId={addProjectFor} onClose={() => setAddProjectFor(null)} onAdd={addProject} shoots={shoots} team={team} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
