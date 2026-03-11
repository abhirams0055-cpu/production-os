import { useApp } from '../context/AppContext';
import { Calendar, CheckSquare, Clock, Bell, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export default function Dashboard() {
  const { shoots, tasks, bookings, team, currentUser, notifications, setView } = useApp();
  const today = new Date();
  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });

  const upcoming = shoots
    .filter(s => new Date(s.date) >= today)
    .sort((a,b) => new Date(a.date)-new Date(b.date))
    .slice(0,5);

  const myTasks = tasks.filter(t =>
    currentUser?.role === 'admin' ? true : t.assignedTo === currentUser?.id
  );
  const todayTasks = myTasks.filter(t => t.status !== 'completed' && t.deadline === new Date().toISOString().split('T')[0]);
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedTasks = myTasks.filter(t => t.status === 'completed').length;
  const activeTasks = myTasks.filter(t => t.status !== 'completed').length;

  const shootTypeColors = { 'Reel':'var(--accent)', 'Advertisement':'#7aadff', 'YouTube Video':'#ff6b35', 'Brand Film':'#c678dd' };

  return (
    <div style={{ padding:'28px', maxWidth:'1200px' }}>
      {/* Header */}
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'800', color:'var(--text)', marginBottom:'4px' }}>
          Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {currentUser?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>
          {today.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom:'24px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {notifications.slice(0,3).map(n => (
            <div key={n.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:'rgba(232,255,71,0.06)', border:'1px solid rgba(232,255,71,0.2)', borderRadius:'10px' }}>
              <Bell size={14} color="var(--accent)" />
              <span style={{ fontSize:'13px', color:'var(--text)' }}>{n.message}</span>
              {n.type === 'booking' && (
                <button className="btn-secondary" style={{ marginLeft:'auto', padding:'4px 12px', fontSize:'11px' }} onClick={() => setView('bookings')}>Review</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'16px', marginBottom:'28px' }}>
        {[
          { label:'Upcoming Shoots', value: upcoming.length, icon: Calendar, color:'var(--accent)', sub:'next 30 days' },
          { label:'Pending Bookings', value: pendingBookings.length, icon: Clock, color:'#ffa500', sub:'awaiting review', action: () => setView('bookings') },
          { label:'Active Tasks', value: activeTasks, icon: CheckSquare, color:'#7aadff', sub:'in progress' },
          { label:'Tasks Done', value: completedTasks, icon: TrendingUp, color:'#6dc76d', sub:'completed' },
          { label:'Team Members', value: team.length, icon: Users, color:'#c678dd', sub:'in workspace' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card" style={{ cursor: stat.action ? 'pointer' : 'default' }} onClick={stat.action}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontSize:'28px', fontWeight:'800', fontFamily:'Syne', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--text)', marginTop:'2px' }}>{stat.label}</div>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'2px' }}>{stat.sub}</div>
                </div>
                <div style={{ width:'36px', height:'36px', background:`${stat.color}15`, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={16} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {/* Upcoming shoots */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'700' }}>Upcoming Shoots</h3>
            <button className="btn-secondary" style={{ padding:'4px 12px', fontSize:'11px' }} onClick={() => setView('calendar')}>View All</button>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>No upcoming shoots</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {upcoming.map(s => {
                const daysLeft = Math.ceil((new Date(s.date) - today) / 86400000);
                return (
                  <div key={s.id} style={{ display:'flex', gap:'12px', padding:'12px', background:'var(--surface2)', borderRadius:'8px', alignItems:'center' }}>
                    <div style={{ width:'3px', height:'40px', background: shootTypeColors[s.shootType] || 'var(--accent)', borderRadius:'2px', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.projectName}</div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{s.clientName} · {s.shootType}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:'700', color: daysLeft <= 2 ? '#ff6b6b' : 'var(--text)' }}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                      </div>
                      <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>{fmt(s.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'700' }}>Today's Tasks</h3>
            <button className="btn-secondary" style={{ padding:'4px 12px', fontSize:'11px' }} onClick={() => setView('tasks')}>View All</button>
          </div>
          {myTasks.filter(t => t.status !== 'completed').slice(0,5).length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>All clear! No pending tasks.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {myTasks.filter(t => t.status !== 'completed').slice(0,5).map(task => {
                const dl = new Date(task.deadline);
                const overdue = dl < today && task.status !== 'completed';
                const priorityColor = { high:'#ff6b6b', medium:'#ffa500', low:'#6dc76d' }[task.priority];
                return (
                  <div key={task.id} style={{ display:'flex', gap:'10px', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px', alignItems:'center' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:priorityColor, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'12px', fontWeight:'500', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{task.title}</div>
                      <div style={{ fontSize:'10px', color: overdue ? '#ff6b6b' : 'var(--text-muted)' }}>
                        {overdue ? '⚠ Overdue' : `Due ${fmt(task.deadline)}`}
                      </div>
                    </div>
                    <span className={`badge badge-${task.status.replace('-','')}`} style={{ fontSize:'9px' }}>{task.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending bookings */}
      {pendingBookings.length > 0 && (
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'700' }}>Pending Client Bookings</h3>
            <button className="btn-secondary" style={{ padding:'4px 12px', fontSize:'11px' }} onClick={() => setView('bookings')}>Manage All</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'12px' }}>
            {pendingBookings.map(b => (
              <div key={b.id} style={{ padding:'14px', background:'var(--surface2)', borderRadius:'10px', border:'1px solid rgba(255,165,0,0.2)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--text)' }}>{b.clientName}</span>
                  <span className="badge badge-pending">Pending</span>
                </div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{b.projectName}</div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px' }}>
                  {new Date(b.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} · {b.shootDays} day{b.shootDays>1?'s':''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
