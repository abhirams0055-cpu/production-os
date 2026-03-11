import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Calendar, ClipboardList, CheckSquare,
  FolderOpen, Users, LogOut, Zap, ExternalLink
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
      width: '220px', minHeight: '100vh', background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      padding: '20px 14px', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'6px 10px', marginBottom:'28px' }}>
        <div style={{ width:'30px', height:'30px', background:'var(--accent)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Zap size={15} color="var(--bg)" fill="var(--bg)" />
        </div>
        <span style={{ fontFamily:'Syne', fontSize:'15px', fontWeight:'800', color:'var(--text)' }}>Production OS</span>
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
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setView(item.id)}
              style={{ width:'100%', textAlign:'left', position:'relative' }}
            >
              <Icon size={16} />
              {item.label}
              {badge && (
                <span style={{
                  marginLeft:'auto', background: isActive ? 'var(--bg)' : 'var(--accent)',
                  color: isActive ? 'var(--accent)' : 'var(--bg)',
                  borderRadius:'20px', padding:'1px 7px', fontSize:'10px', fontWeight:'700'
                }}>{badge}</span>
              )}
            </button>
          );
        })}

        {/* Public booking link */}
        <button
          className="sidebar-nav-item"
          onClick={() => setPublicPage(true)}
          style={{ width:'100%', textAlign:'left', marginTop:'8px', borderStyle:'dashed' }}
        >
          <ExternalLink size={16} />
          Client Booking
        </button>
      </nav>

      {/* User info */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:'14px', marginTop:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:'var(--surface2)', marginBottom:'8px' }}>
          <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,var(--accent),#7aadff)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'var(--bg)', flexShrink:0 }}>
            {currentUser?.name?.charAt(0)}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{currentUser?.name}</div>
            <div style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'capitalize' }}>{currentUser?.role}</div>
          </div>
        </div>
        <button className="sidebar-nav-item" onClick={logout} style={{ width:'100%', textAlign:'left', color:'#ff6b6b' }}>
          <LogOut size={16} color="#ff6b6b" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
