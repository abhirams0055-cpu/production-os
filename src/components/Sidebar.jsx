import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Calendar, ClipboardList, CheckSquare,
  FolderOpen, Users, LogOut, ExternalLink, Menu, X, Building2, Activity
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'clients', label: 'Clients', icon: Building2, adminOnly: true },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'activity', label: 'Activity', icon: Activity, adminOnly: true },
];

export default function Sidebar() {
  const { view, setView, currentUser, logout, notifications, setPublicPage } = useApp();
  const pendingCount = notifications.filter(n => n.type === 'booking').length;
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavItem = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = view === item.id;
    const badge = item.id === 'bookings' && pendingCount > 0 ? pendingCount : null;
    return (
      <button
        onClick={() => { setView(item.id); onClick?.(); }}
        style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
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
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <div className="desktop-sidebar" style={{
        width:'220px', minHeight:'100vh',
        background:'#083f3e',
        borderRight:'1px solid rgba(201,169,110,0.15)',
        display:'flex', flexDirection:'column',
        padding:'20px 14px', flexShrink:0,
        position:'sticky', top:0, height:'100vh', overflowY:'auto'
      }}>
        <div style={{ display:'flex', alignItems:'center', padding:'6px 10px', marginBottom:'28px' }}>
          <img src="/logo.png" alt="Team Aaram" style={{ width:'120px', objectFit:'contain' }} />
        </div>
        <nav style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
          {navItems.filter(item => !item.adminOnly || currentUser?.role === 'admin').map(item => <NavItem key={item.id} item={item} />)}
          <button onClick={() => setPublicPage(true)} style={{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
            width:'100%', textAlign:'left', border:'1px dashed rgba(201,169,110,0.3)',
            fontFamily:'DM Sans, sans-serif', fontSize:'13px', fontWeight:'500',
            background:'transparent', color:'rgba(201,169,110,0.6)', marginTop:'8px'
          }}>
            <ExternalLink size={16} color="rgba(201,169,110,0.6)" />
            Client Booking
          </button>
        </nav>
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
          <button onClick={logout} style={{
            display:'flex', alignItems:'center', gap:'10px',
            padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
            width:'100%', textAlign:'left', border:'1px solid transparent',
            fontFamily:'DM Sans, sans-serif', fontSize:'13px',
            background:'transparent', color:'rgba(255,100,100,0.7)'
          }}>
            <LogOut size={16} color="rgba(255,100,100,0.7)" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-topbar" style={{
        display:'none', position:'fixed', top:0, left:0, right:0,
        background:'#083f3e', borderBottom:'1px solid rgba(201,169,110,0.2)',
        padding:'10px 16px', zIndex:50,
        alignItems:'center', justifyContent:'space-between', height:'56px'
      }}>
        <img src="/logo.png" alt="Team Aaram" style={{ width:'90px', objectFit:'contain' }} />
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {pendingCount > 0 && (
            <span style={{ background:'var(--accent)', color:'#1a1008', borderRadius:'20px', padding:'2px 8px', fontSize:'11px', fontWeight:'700' }}>{pendingCount}</span>
          )}
          <button onClick={() => setMobileOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#f0ede8', padding:'4px' }}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          <div style={{
            position:'absolute', top:0, right:0, bottom:0, width:'260px',
            background:'#083f3e', borderLeft:'1px solid rgba(201,169,110,0.2)',
            display:'flex', flexDirection:'column', padding:'20px 14px',
            animation:'slideInRight 0.2s ease'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <img src="/logo.png" alt="Team Aaram" style={{ width:'90px', objectFit:'contain' }} />
              <button onClick={() => setMobileOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(240,237,232,0.6)', padding:'4px' }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ display:'flex', flexDirection:'column', gap:'4px', flex:1 }}>
              {navItems.filter(item => !item.adminOnly || currentUser?.role === 'admin').map(item => <NavItem key={item.id} item={item} onClick={() => setMobileOpen(false)} />)}
              <button onClick={() => { setPublicPage(true); setMobileOpen(false); }} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'11px 14px', borderRadius:'10px', cursor:'pointer',
                width:'100%', textAlign:'left', border:'1px dashed rgba(201,169,110,0.3)',
                fontFamily:'DM Sans, sans-serif', fontSize:'13px',
                background:'transparent', color:'rgba(201,169,110,0.6)', marginTop:'8px'
              }}>
                <ExternalLink size={16} color="rgba(201,169,110,0.6)" />
                Client Booking
              </button>
            </nav>
            <div style={{ borderTop:'1px solid rgba(201,169,110,0.15)', paddingTop:'14px', marginTop:'14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', borderRadius:'8px', background:'rgba(0,0,0,0.2)', marginBottom:'8px' }}>
                <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,var(--accent),#c9a96e)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#1a1008', flexShrink:0 }}>
                  {currentUser?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'12px', fontWeight:'600', color:'var(--text)' }}>{currentUser?.name}</div>
                  <div style={{ fontSize:'10px', color:'rgba(201,169,110,0.7)', textTransform:'capitalize' }}>{currentUser?.role}</div>
                </div>
              </div>
              <button onClick={() => { logout(); setMobileOpen(false); }} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 14px', borderRadius:'10px', cursor:'pointer',
                width:'100%', textAlign:'left', border:'none',
                fontFamily:'DM Sans, sans-serif', fontSize:'13px',
                background:'transparent', color:'rgba(255,100,100,0.7)'
              }}>
                <LogOut size={16} color="rgba(255,100,100,0.7)" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-bottom-nav" style={{
        display:'none', position:'fixed', bottom:0, left:0, right:0,
        background:'#083f3e', borderTop:'1px solid rgba(201,169,110,0.2)',
        padding:'6px 4px', zIndex:50,
        justifyContent:'space-around', alignItems:'center'
      }}>
        {navItems.filter(item => !item.adminOnly || currentUser?.role === 'admin').map(item => {
          const Icon = item.icon;
          const isActive = view === item.id;
          const badge = item.id === 'bookings' && pendingCount > 0 ? pendingCount : null;
          return (
            <button key={item.id} onClick={() => setView(item.id)} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
              padding:'6px 10px', borderRadius:'10px', cursor:'pointer',
              background:'none', border:'none', flex:1, position:'relative',
              color: isActive ? 'var(--accent)' : 'rgba(240,237,232,0.45)',
              transition:'all 0.15s'
            }}>
              <Icon size={20} color={isActive ? 'var(--accent)' : 'rgba(240,237,232,0.45)'} />
              <span style={{ fontSize:'9px', fontFamily:'Syne', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
              {badge && <span style={{ position:'absolute', top:'2px', right:'8px', width:'16px', height:'16px', background:'var(--accent)', color:'#1a1008', borderRadius:'50%', fontSize:'9px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
