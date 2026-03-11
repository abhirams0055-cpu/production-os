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

const INITIAL_SHOOTS = [
  {
    id: 1, clientName: 'PADMA', projectName: 'Kurti Launch Campaign',
    shootType: 'Reel', date: d(3), location: 'Studio A, Andheri West',
    crew: [2, 3], notes: 'Need 3 outfit changes. Golden hour preferred.',
    docsLink: 'https://docs.google.com/document/d/example1', status: 'confirmed'
  },
  {
    id: 2, clientName: 'TechVibe', projectName: 'App Launch Ad',
    shootType: 'Advertisement', date: d(7), location: 'Bandra Rooftop',
    crew: [2, 4, 5], notes: 'Drone shots required. Book license.',
    docsLink: 'https://docs.google.com/document/d/example2', status: 'confirmed'
  },
  {
    id: 3, clientName: 'PADMA', projectName: 'Festive Collection Reel',
    shootType: 'Reel', date: d(14), location: 'Juhu Beach',
    crew: [2, 3, 4], notes: 'Sunset shoot. Start at 4pm.',
    docsLink: 'https://docs.google.com/document/d/example3', status: 'confirmed'
  },
  {
    id: 4, clientName: 'NovaBrands', projectName: 'Brand Story Film',
    shootType: 'Brand Film', date: d(21), location: 'Factory, Thane',
    crew: [2, 3, 4, 5], notes: 'Full day shoot. Factory walkthrough + interviews.',
    docsLink: 'https://docs.google.com/document/d/example4', status: 'confirmed'
  },
];

const INITIAL_DATE_MARKS = [
  { date: d(5), status: 'busy' },
  { date: d(6), status: 'busy' },
  { date: d(10), status: 'tentative' },
  { date: d(15), status: 'available' },
  { date: d(16), status: 'available' },
  { date: d(20), status: 'available' },
];

const INITIAL_TASKS = [
  { id: 1, title: 'Edit Kurti Launch Reel', description: 'First cut with color grading', assignedTo: 3, deadline: d(5), priority: 'high', status: 'in-progress', project: 'Kurti Launch Campaign' },
  { id: 2, title: 'Location recce - Bandra Rooftop', description: 'Check lighting conditions and permission', assignedTo: 4, deadline: d(4), priority: 'high', status: 'pending', project: 'App Launch Ad' },
  { id: 3, title: 'Sound design - TechVibe Ad', description: 'Background score + SFX', assignedTo: 5, deadline: d(9), priority: 'medium', status: 'pending', project: 'App Launch Ad' },
  { id: 4, title: 'Mood board - NovaBrands', description: 'Create reference board for brand film', assignedTo: 2, deadline: d(12), priority: 'medium', status: 'completed', project: 'Brand Story Film' },
  { id: 5, title: 'Script review - Festive Reel', description: 'Review and approve final script', assignedTo: 1, deadline: d(10), priority: 'low', status: 'pending', project: 'Festive Collection Reel' },
];

const INITIAL_CLIENTS = [
  {
    id: 1, name: 'PADMA', contact: 'Meera Joshi', phone: '+91 98765 43210', email: 'meera@padma.in',
    projects: [
      { id: 1, name: 'Kurti Launch Campaign', status: 'active', shootId: 1, docsLink: 'https://docs.google.com/document/d/example1', team: [2,3] },
      { id: 2, name: 'Festive Collection Reel', status: 'active', shootId: 3, docsLink: 'https://docs.google.com/document/d/example3', team: [2,3,4] },
      { id: 3, name: 'Product Photoshoot', status: 'planned', shootId: null, docsLink: '', team: [2,4] },
    ]
  },
  {
    id: 2, name: 'TechVibe', contact: 'Rohan Verma', phone: '+91 87654 32109', email: 'rohan@techvibe.io',
    projects: [
      { id: 4, name: 'App Launch Ad', status: 'active', shootId: 2, docsLink: 'https://docs.google.com/document/d/example2', team: [2,4,5] },
    ]
  },
  {
    id: 3, name: 'NovaBrands', contact: 'Aarav Singh', phone: '+91 76543 21098', email: 'aarav@novabrands.com',
    projects: [
      { id: 5, name: 'Brand Story Film', status: 'active', shootId: 4, docsLink: 'https://docs.google.com/document/d/example4', team: [2,3,4,5] },
    ]
  },
];

const INITIAL_BOOKINGS = [
  {
    id: 1, clientName: 'Zara Studios', projectName: 'Summer Collection Lookbook',
    contactName: 'Fatima Khan', phone: '+91 91234 56789', email: 'fatima@zarastudios.com',
    preferredDate: d(18), shootDays: 2, status: 'pending', submittedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2, clientName: 'GreenLeaf Foods', projectName: 'Product Launch YouTube Video',
    contactName: 'Deepak Nair', phone: '+91 80987 65432', email: 'deepak@greenleaf.com',
    preferredDate: d(25), shootDays: 1, status: 'pending', submittedAt: new Date(Date.now() - 7200000).toISOString()
  },
];

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
