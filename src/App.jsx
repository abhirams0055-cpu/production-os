import { useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import BookingsPage from './pages/BookingsPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import ClientPortal from './pages/ClientPortal';
import ClientAccountsPage from './pages/ClientAccountsPage';

const pages = {
  dashboard: Dashboard,
  calendar: CalendarPage,
  bookings: BookingsPage,
  tasks: TasksPage,
  projects: ProjectsPage,
  team: TeamPage,
  clients: ClientAccountsPage,
};

export default function App() {
  const { currentUser, view, clientUser, clientLogout, loadData } = useApp();

  // Client portal
  if (clientUser) return <ClientPortal clientUser={clientUser} onLogout={clientLogout} />;

  // Team not logged in
  if (!currentUser) return <Login />;

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
