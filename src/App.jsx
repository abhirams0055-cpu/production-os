import { useApp } from './context/AppContext';
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

const pages = {
  dashboard: Dashboard,
  calendar: CalendarPage,
  bookings: BookingsPage,
  tasks: TasksPage,
  projects: ProjectsPage,
  team: TeamPage,
  clients: ClientAccountsPage,
  activity: ActivityPage,
};

export default function App() {
  const { currentUser, view, publicPage, clientUser, clientLogout } = useApp();

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
    </div>
  );
}
