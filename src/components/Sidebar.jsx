import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Calendar, ClipboardList, CheckSquare,
  FolderOpen, Users, LogOut, ExternalLink
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'team', label: 'Team', icon: Users },
];

export default function Sidebar() {
  const { view, setView, currentUser, logout, notifications, setPublicPage } = useApp();
  const pendingCount = notifications.filter(n => n.type === 'booking').length;

  return (
    <div style={{
      width: '220px', minHeight: '100vh',
      background: '#083f3e',
      borderRight: '1px solid rgba(201,169,110,0.15)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'6px 10px', marginBottom:'28px' }}>
        <img src="/logo.png" alt="Team Aaram" style={{ width:'120px', objectFit:'contain' }} />
      </div>

      {/* Nav */}
      <nav style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const badge = item.id === 'bookings' && pendingCount > 0 ? pendingCount : null;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
                width:'100%', textAlign:'left', border:'1px solid',
                fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:'500',
                transition:'all 0.15s ease', position:'relative',
                background: isActive ? 'var(--accent)' : 'transparent',
                borderColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#1a1008' : 'rgba(240,237,232,0.7)',
              }}
            >
              <Icon size={16} color={isActive ? '#1a1008' : 'rgba(201,169,110,0.8)'} />
              {item.label}
              {badge && (
                <span style={{
                  marginLeft:'auto',
                  background: isActive ? '#1a1008' : 'var(--accent)',
                  color: isActive ? 'var(--accent)' : '#1a1008',
                  borderRadius:'20px', padding:'1px 7px', fontSize:'10px', fontWeight:'700'
                }}>{badge}</span>
              )}
            </button>
          );
        })}

        {/* Public booking link */}
        <button
          onClick={() => setPublicPage(true)}
          style={{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
            width:'100%', textAlign:'left', border:'1px dashed rgba(201,169,110,0.3)',
            fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:'500',
            background:'transparent', color:'rgba(201,169,110,0.6)',
            marginTop:'8px', transition:'all 0.15s'
          }}
        >
          <ExternalLink size={16} color="rgba(201,169,110,0.6)" />
          Client Booking
        </button>
      </nav>

      {/* User info */}
      <div style={{ borderTop:'1px solid rgba(201,169,110,0.15)', paddingTop:'14px', marginTop:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:'rgba(0,0,0,0.2)', marginBottom:'8px' }}>
          <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,var(--accent),#c9a96e)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#1a1008', flexShrink:0 }}>
            {currentUser?.name?.charAt(0)}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.name}</div>
            <div style={{ fontSize:'10px', color:'rgba(201,169,110,0.7)', textTransform:'capitalize' }}>{currentUser?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
            width:'100%', textAlign:'left', border:'1px solid transparent',
            fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:'500',
            background:'transparent', color:'rgba(255,100,100,0.7)', transition:'all 0.15s'
          }}
        >
          <LogOut size={16} color="rgba(255,100,100,0.7)" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
