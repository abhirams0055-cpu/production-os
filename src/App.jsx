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

const pages = {
  dashboard: Dashboard,
  calendar: CalendarPage,
  bookings: BookingsPage,
  tasks: TasksPage,
  projects: ProjectsPage,
  team: TeamPage,
};

export default function App() {
  const { currentUser, view, publicPage } = useApp();

  if (publicPage) return <PublicBooking />;
  if (!currentUser) return <Login />;

  const Page = pages[view] || Dashboard;

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:'auto', minHeight:'100vh' }}>
        <Page />
      </main>
    </div>
  );
}
