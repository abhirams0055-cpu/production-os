import { createContext, useContext, useState } from 'react';

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];

const TEAM = [
  { id: 1, name: 'Aaram', role: 'admin', email: 'hello@teamaaram.com', password: 'Aaram@111', title: 'Aaram Head' },
  { id: 2, name: 'VIC', role: 'admin', email: 'hello@vivorporate.com', password: 'Vic@222', title: 'VIC Head' },
  { id: 3, name: 'Nikhil', role: 'admin', email: 'nikhil@vicorporate.com', password: 'Nikhil@333', title: 'Head' },
  { id: 4, name: 'Abhiram', role: 'member', email: 'abhiram@vicorporate.com', password: 'abhiram@555', title: 'Creative Head' },
  { id: 5, name: 'Avinash', role: 'member', email: 'avinash@vicorporate.com', password: 'Avinash@666', title: 'Team Lead' },
  { id: 6, name: 'Athul', role: 'member', email: 'athul@vicorporate.com', password: 'athul@000', title: 'SEO' },
  { id: 7, name: 'Sradha', role: 'member', email: 'sradha@vicorporate.com', password: 'sradha@999', title: 'Dev' },
  { id: 8, name: 'Sabari', role: 'member', email: 'sabari@vicorporate.com', password: 'sabari@1122', title: 'Content Writer' },
];

const addDays = (dateStr, n) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

const d = (offset) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return fmt(dt);
};

const INITIAL_SHOOTS = [];

const INITIAL_DATE_MARKS = [];

const INITIAL_TASKS = [];

const INITIAL_CLIENTS = [];

const INITIAL_BOOKINGS = [];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [publicPage, setPublicPage] = useState(false);

  const [shoots, setShoots] = useState(INITIAL_SHOOTS);
  const [dateMarks, setDateMarks] = useState(INITIAL_DATE_MARKS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [team] = useState(TEAM);
  const [nextId, setNextId] = useState(100);

  const genId = () => { setNextId(p => p+1); return nextId; };

  const login = (email, password) => {
    const user = TEAM.find(u => u.email === email && u.password === password);
    if (user) { setCurrentUser(user); setView('dashboard'); return true; }
    return false;
  };
  const logout = () => { setCurrentUser(null); setView('login'); };

  const addShoot = (shoot) => setShoots(p => [...p, { ...shoot, id: genId(), status: 'confirmed' }]);
  const updateShoot = (id, data) => setShoots(p => p.map(s => s.id === id ? {...s,...data} : s));
  const deleteShoot = (id) => setShoots(p => p.filter(s => s.id !== id));

  const setDateMark = (date, status) => {
    setDateMarks(p => {
      const exists = p.find(m => m.date === date);
      if (exists) return p.map(m => m.date === date ? {...m, status} : m);
      return [...p, { date, status }];
    });
  };
  const removeDateMark = (date) => setDateMarks(p => p.filter(m => m.date !== date));

  const addTask = (task) => setTasks(p => [...p, { ...task, id: genId() }]);
  const updateTask = (id, data) => setTasks(p => p.map(t => t.id === id ? {...t,...data} : t));
  const deleteTask = (id) => setTasks(p => p.filter(t => t.id !== id));

  const addClient = (client) => setClients(p => [...p, { ...client, id: genId(), projects: [] }]);
  const addProject = (clientId, project) => {
    setClients(p => p.map(c => c.id === clientId ? {...c, projects: [...c.projects, {...project, id: genId()}]} : c));
  };
  const updateProject = (clientId, projectId, data) => {
    setClients(p => p.map(c => c.id === clientId ? {
      ...c, projects: c.projects.map(pr => pr.id === projectId ? {...pr,...data} : pr)
    } : c));
  };

  const submitBooking = (booking) => setBookings(p => [...p, { ...booking, id: genId(), status: 'pending', submittedAt: new Date().toISOString() }]);

  const approveBooking = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    setBookings(p => p.map(b => b.id === id ? {...b, status: 'approved'} : b));
    // Block dates
    for (let i = 0; i < booking.shootDays; i++) {
      const date = addDays(booking.preferredDate, i);
      setDateMarks(p => {
        const exists = p.find(m => m.date === date);
        if (exists) return p.map(m => m.date === date ? {...m, status:'busy'} : m);
        return [...p, { date, status: 'busy' }];
      });
    }
    // Add to shoots
    setShoots(p => [...p, {
      id: genId(), clientName: booking.clientName, projectName: booking.projectName,
      shootType: 'Reel', date: booking.preferredDate, location: 'TBD',
      crew: [], notes: `Booking approved. Contact: ${booking.contactName} ${booking.phone}`,
      docsLink: '', status: 'confirmed'
    }]);
  };

  const rejectBooking = (id) => setBookings(p => p.map(b => b.id === id ? {...b, status: 'rejected'} : b));

  // Notifications
  const notifications = [
    ...bookings.filter(b => b.status === 'pending').map(b => ({
      id: `bk-${b.id}`, type: 'booking', message: `New booking from ${b.clientName} — ${b.projectName}`, time: b.submittedAt
    })),
    ...tasks.filter(t => {
      const dl = new Date(t.deadline);
      const diff = (dl - today) / 86400000;
      return diff >= 0 && diff <= 2 && t.status !== 'completed';
    }).map(t => ({
      id: `tk-${t.id}`, type: 'task', message: `Task "${t.title}" deadline approaching`, time: t.deadline
    })),
    ...shoots.filter(s => {
      const sd = new Date(s.date);
      const diff = (sd - today) / 86400000;
      return diff >= 0 && diff <= 3;
    }).map(s => ({
      id: `sh-${s.id}`, type: 'shoot', message: `Shoot: ${s.projectName} for ${s.clientName} in ${Math.ceil((new Date(s.date)-today)/86400000)} day(s)`, time: s.date
    })),
  ];

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, view, setView, publicPage, setPublicPage,
      shoots, addShoot, updateShoot, deleteShoot,
      dateMarks, setDateMark, removeDateMark,
      tasks, addTask, updateTask, deleteTask,
      clients, addClient, addProject, updateProject,
      bookings, submitBooking, approveBooking, rejectBooking,
      team, notifications, fmt, addDays
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
