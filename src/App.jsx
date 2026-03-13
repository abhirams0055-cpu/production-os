import { useApp } from './context/AppContext';
import { useEffect } from 'react';
import { unlockAudio } from './utils/sounds';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import BookingsPage from './pages/BookingsPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import PublicBooking from './pages/PublicBooking';
import ClientPortal from './pages/ClientPortal';
import ClientAccountsPage from './pages/ClientAccountsPage';
import ActivityPage from './pages/ActivityPage';
import ChatPage from './pages/ChatPage';

const pages = {
  dashboard: Dashboard,
  calendar: CalendarPage,
  bookings: BookingsPage,
  tasks: TasksPage,
  projects: ProjectsPage,
  team: TeamPage,
  clients: ClientAccountsPage,
  activity: ActivityPage,
  chat: ChatPage,
};

export default function App() {
  const { currentUser, view, publicPage, clientUser, clientLogout, incomingAlert, dismissAlert } = useApp();

  useEffect(() => {
    const unlock = () => { unlockAudio(); window.removeEventListener('click', unlock); };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  // Client portal (logged in as client)
  if (clientUser) return <ClientPortal clientUser={clientUser} onLogout={clientLogout} />;

  // Not logged in as team
  if (!currentUser) return <Login />;

  // Public booking page (sidebar link or unauthenticated)
  if (publicPage) return <PublicBooking />;

  const Page = pages[view] || Dashboard;

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main className="main-content" style={{ flex:1, overflowY:'auto', minHeight:'100vh' }}>
        <Page />
      </main>
      {incomingAlert && (
        <div style={{
          position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)',
          zIndex:9999, maxWidth:'460px', width:'calc(100% - 40px)',
          background:'linear-gradient(135deg, #2a0000, #1a0000)',
          border:'2px solid #ff5050', borderRadius:'16px', padding:'18px 20px',
          boxShadow:'0 8px 40px rgba(255,80,80,0.4), 0 0 0 4px rgba(255,80,80,0.1)',
          animation:'alertPulse 0.4s ease',
          display:'flex', alignItems:'flex-start', gap:'14px'
        }}>
          <div style={{ fontSize:'28px', flexShrink:0, animation:'alertBell 0.5s ease infinite alternate' }}>🚨</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'12px', fontWeight:'800', color:'#ff5050', fontFamily:'Syne', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'4px' }}>
              Alert from {incomingAlert.senderName}
            </div>
            <div style={{ fontSize:'15px', fontWeight:'600', color:'#fff', lineHeight:'1.4' }}>
              {incomingAlert.message}
            </div>
          </div>
          <button onClick={dismissAlert} style={{ background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.3)', borderRadius:'8px', padding:'4px 8px', cursor:'pointer', color:'#ff5050', flexShrink:0 }}>
            Dismiss
          </button>
        </div>
      )}
      <style>{`
        @keyframes alertPulse {
          from { opacity:0; transform:translateX(-50%) scale(0.9); }
          to { opacity:1; transform:translateX(-50%) scale(1); }
        }
        @keyframes alertBell {
          from { transform: rotate(-15deg); }
          to { transform: rotate(15deg); }
        }
      `}</style>
    </div>
  );
}
