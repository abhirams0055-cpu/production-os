import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';

const PRIORITIES = ['low','medium','high'];
const STATUSES = ['pending','in-progress','completed'];

function AddTaskModal({ onClose, onAdd, team }) {
  const [form, setForm] = useState({
    title:'', description:'', assignedTo:'', deadline:'',
    priority:'medium', status:'pending', project:''
  });
  const [err, setErr] = useState('');

  const submit = () => {
    if (!form.title || !form.assignedTo || !form.deadline) { setErr('Please fill required fields'); return; }
    onAdd({ ...form, assignedTo: parseInt(form.assignedTo) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:'800' }}>Assign Task</h2>
          <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div><label className="label">Task Title *</label><input className="input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Edit Reel - First Cut" /></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{ resize:'vertical' }} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Assign To *</label>
              <select className="input" value={form.assignedTo} onChange={e=>setForm(p=>({...p,assignedTo:e.target.value}))}>
                <option value="">Select member...</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div><label className="label">Deadline *</label><input className="input" type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Project</label>
              <input className="input" value={form.project} onChange={e=>setForm(p=>({...p,project:e.target.value}))} placeholder="Project name" />
            </div>
          </div>
          {err && <p style={{ color:'#ff6b6b', fontSize:'12px' }}>{err}</p>}
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit}>Assign Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, team, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const today = new Date();

  const myTasks = isAdmin ? tasks : tasks.filter(t => t.assignedTo === currentUser?.id);

  const filtered = myTasks.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });

  const priorityColor = { high:'#ff6b6b', medium:'#ffa500', low:'#6dc76d' };
  const statusIcon = { pending: Circle, 'in-progress': Clock, completed: CheckCircle };

  const getMemberName = id => team.find(t => t.id === id)?.name || 'Unknown';

  const handleStatusChange = (task, newStatus) => {
    if (isAdmin || task.assignedTo === currentUser?.id) {
      updateTask(task.id, { status: newStatus });
    }
  };

  return (
    <div style={{ padding:'28px', maxWidth:'1000px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Tasks</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>
            {isAdmin ? 'Assign and track team tasks' : 'Your assigned tasks'}
          </p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Assign Task</button>}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[
          { label:'Total', count: myTasks.length, color:'var(--text-muted)' },
          { label:'Pending', count: myTasks.filter(t=>t.status==='pending').length, color:'#ffa500' },
          { label:'In Progress', count: myTasks.filter(t=>t.status==='in-progress').length, color:'#7aadff' },
          { label:'Completed', count: myTasks.filter(t=>t.status==='completed').length, color:'#6dc76d' },
        ].map(s => (
          <div key={s.label} style={{ padding:'10px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px' }}>
            <div style={{ fontSize:'18px', fontWeight:'800', fontFamily:'Syne', color:s.color }}>{s.count}</div>
            <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:'4px' }}>
          {['all','pending','in-progress','completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'6px 12px', borderRadius:'6px', border:'1px solid',
              background: filter === f ? 'var(--accent)' : 'var(--surface2)',
              borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
              color: filter === f ? 'var(--bg)' : 'var(--text)',
              fontSize:'11px', fontWeight:'600', cursor:'pointer', textTransform:'capitalize', fontFamily:'Syne'
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'4px', marginLeft:'auto' }}>
          {['all','high','medium','low'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)} style={{
              padding:'6px 12px', borderRadius:'6px', border:'1px solid',
              background: priorityFilter === p ? (priorityColor[p] || 'var(--accent)') : 'var(--surface2)',
              borderColor: priorityFilter === p ? (priorityColor[p] || 'var(--accent)') : 'var(--border)',
              color: priorityFilter === p ? 'white' : 'var(--text)',
              fontSize:'11px', fontWeight:'600', cursor:'pointer', textTransform:'capitalize', fontFamily:'Syne'
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
          <CheckCircle size={36} style={{ margin:'0 auto 16px', opacity:0.3 }} />
          <p>No tasks found</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtered.map(task => {
            const dl = new Date(task.deadline);
            const daysLeft = Math.ceil((dl - today) / 86400000);
            const overdue = daysLeft < 0 && task.status !== 'completed';
            const StatusIcon = statusIcon[task.status] || Circle;
            const canEdit = isAdmin || task.assignedTo === currentUser?.id;

            return (
              <div key={task.id} className="card" style={{
                borderLeft: `3px solid ${priorityColor[task.priority]}`,
                opacity: task.status === 'completed' ? 0.65 : 1
              }}>
                <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                  <button style={{ background:'none', border:'none', cursor: canEdit ? 'pointer' : 'default', color: task.status === 'completed' ? '#6dc76d' : 'var(--text-muted)', marginTop:'2px', flexShrink:0 }}
                    onClick={() => canEdit && handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}>
                    <StatusIcon size={18} />
                  </button>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px', flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:'14px', fontWeight:'600', textDecoration: task.status==='completed' ? 'line-through' : 'none', color:'var(--text)' }}>{task.title}</h3>
                      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        <span className={`badge badge-${task.status.replace('-','')}`}>{task.status}</span>
                      </div>
                    </div>

                    {task.description && <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>{task.description}</p>}

                    <div style={{ display:'flex', gap:'12px', marginTop:'10px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'11px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span>👤</span> {getMemberName(task.assignedTo)}
                      </span>
                      {task.project && <span style={{ fontSize:'11px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px' }}><span>📁</span> {task.project}</span>}
                      <span style={{ fontSize:'11px', color: overdue ? '#ff6b6b' : daysLeft <= 2 ? '#ffa500' : 'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px', fontWeight: overdue ? '600' : '400' }}>
                        <span>📅</span> {overdue ? `Overdue by ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due ${fmt(task.deadline)}`}
                      </span>
                    </div>

                    {canEdit && task.status !== 'completed' && (
                      <div style={{ display:'flex', gap:'6px', marginTop:'10px' }}>
                        {STATUSES.filter(s => s !== task.status).map(s => (
                          <button key={s} className="btn-secondary" style={{ padding:'4px 10px', fontSize:'11px', textTransform:'capitalize' }}
                            onClick={() => handleStatusChange(task, s)}>
                            → {s}
                          </button>
                        ))}
                        {isAdmin && (
                          <button className="btn-danger" style={{ padding:'4px 10px', fontSize:'11px', marginLeft:'auto' }}
                            onClick={() => deleteTask(task.id)}>
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} team={team} />}
    </div>
  );
}
