import { useApp } from '../context/AppContext';
import { Mail, Shield, User, CheckSquare, Camera } from 'lucide-react';

const roleColors = { admin: 'var(--accent)', member: '#7aadff' };
const titleIcons = {
  'Creative Head': Shield,
  'Cinematographer': Camera,
  'Video Editor': CheckSquare,
  'Production Assistant': User,
  'Sound Designer': User,
};

export default function TeamPage() {
  const { team, tasks, currentUser } = useApp();

  const getMemberStats = (memberId) => {
    const memberTasks = tasks.filter(t => t.assignedTo === memberId);
    return {
      total: memberTasks.length,
      pending: memberTasks.filter(t => t.status === 'pending').length,
      inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
      completed: memberTasks.filter(t => t.status === 'completed').length,
    };
  };

  return (
    <div style={{ padding:'28px', maxWidth:'900px' }}>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'800' }}>Team</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'2px' }}>Your production crew</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'16px' }}>
        {team.map(member => {
          const stats = getMemberStats(member.id);
          const isMe = member.id === currentUser?.id;
          const Icon = titleIcons[member.title] || User;
          const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <div key={member.id} className="card" style={{
              border: isMe ? `1px solid var(--accent)` : '1px solid var(--border)',
              position:'relative', overflow:'hidden'
            }}>
              {isMe && (
                <div style={{ position:'absolute', top:0, right:0, background:'var(--accent)', color:'var(--bg)', fontSize:'9px', fontWeight:'800', padding:'3px 10px', fontFamily:'Syne', letterSpacing:'0.06em', borderBottomLeftRadius:'8px' }}>YOU</div>
              )}

              <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'16px' }}>
                <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:`linear-gradient(135deg, ${roleColors[member.role]}, #c678dd)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:'800', fontSize:'20px', color:'var(--bg)', flexShrink:0 }}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize:'14px', fontWeight:'700', color:'var(--text)' }}>{member.name}</h3>
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'1px' }}>{member.title}</p>
                  <span style={{ display:'inline-block', marginTop:'4px', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', fontFamily:'Syne', background:`${roleColors[member.role]}20`, color:roleColors[member.role], textTransform:'capitalize' }}>
                    {member.role}
                  </span>
                </div>
              </div>

              <div style={{ display:'flex', gap:'6px', marginBottom:'14px' }}>
                <a href={`mailto:${member.email}`} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--text-muted)', textDecoration:'none', padding:'5px 10px', background:'var(--surface2)', borderRadius:'6px', border:'1px solid var(--border)', flex:1, justifyContent:'center' }}>
                  <Mail size={11} /> {member.email.split('@')[0]}
                </a>
              </div>

              {/* Task stats */}
              <div style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Task completion</span>
                  <span style={{ fontSize:'11px', fontWeight:'700', color:'var(--accent)' }}>{completionPct}%</span>
                </div>
                <div style={{ height:'4px', background:'var(--surface2)', borderRadius:'2px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${completionPct}%`, background:'var(--accent)', borderRadius:'2px', transition:'width 0.3s' }} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'6px' }}>
                {[
                  { label:'Pending', value:stats.pending, color:'#ffa500' },
                  { label:'Active', value:stats.inProgress, color:'#7aadff' },
                  { label:'Done', value:stats.completed, color:'#6dc76d' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign:'center', padding:'8px 4px', background:'var(--surface2)', borderRadius:'8px' }}>
                    <div style={{ fontSize:'16px', fontWeight:'800', fontFamily:'Syne', color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
