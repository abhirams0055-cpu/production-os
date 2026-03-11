import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aaram_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('aaram_user');
    return saved ? 'dashboard' : 'login';
  });
  const [publicPage, setPublicPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [shoots, setShoots] = useState([]);
  const [dateMarks, setDateMarksState] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [team, setTeam] = useState(TEAM);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shootsRes, dateMarksRes, tasksRes, clientsRes, bookingsRes, projectsRes] = await Promise.all([
        supabase.from('shoots').select('*').order('date'),
        supabase.from('date_marks').select('*'),
        supabase.from('tasks').select('*').order('created_at'),
        supabase.from('clients').select('*').order('created_at'),
        supabase.from('bookings').select('*').order('submitted_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at'),
      ]);

      if (shootsRes.data) setShoots(shootsRes.data.map(s => ({
        id: s.id, clientName: s.client_name, projectName: s.project_name,
        shootType: s.shoot_type, date: s.date, location: s.location,
        crew: s.crew || [], notes: s.notes, docsLink: s.docs_link, status: s.status
      })));

      if (dateMarksRes.data) setDateMarksState(dateMarksRes.data.map(m => ({ id: m.id, date: m.date, status: m.status })));

      if (tasksRes.data) setTasks(tasksRes.data.map(t => ({
        id: t.id, title: t.title, description: t.description,
        assignedTo: t.assigned_to, deadline: t.deadline,
        priority: t.priority, status: t.status, project: t.project
      })));

      if (clientsRes.data && projectsRes.data) {
        const clientsWithProjects = clientsRes.data.map(c => ({
          id: c.id, name: c.name, contact: c.contact, phone: c.phone, email: c.email,
          projects: projectsRes.data
            .filter(p => p.client_id === c.id)
            .map(p => ({
              id: p.id, name: p.name, status: p.status,
              shootId: p.shoot_id, docsLink: p.docs_link, team: p.team || []
            }))
        }));
        setClients(clientsWithProjects);
      }

      if (bookingsRes.data) setBookings(bookingsRes.data.map(b => ({
        id: b.id, clientName: b.client_name, projectName: b.project_name,
        contactName: b.contact_name, phone: b.phone, email: b.email,
        preferredDate: b.preferred_date, shootDays: b.shoot_days,
        status: b.status, submittedAt: b.submitted_at
      })));
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser]);

  const login = (email, password) => {
    const user = TEAM.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('aaram_user', JSON.stringify(user));
      setView('dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aaram_user');
    setView('login');
    setShoots([]); setTasks([]); setClients([]); setBookings([]); setDateMarksState([]);
  };

  const addShoot = async (shoot) => {
    const { data } = await supabase.from('shoots').insert([{
      client_name: shoot.clientName, project_name: shoot.projectName,
      shoot_type: shoot.shootType, date: shoot.date, location: shoot.location,
      crew: shoot.crew, notes: shoot.notes, docs_link: shoot.docsLink, status: 'confirmed'
    }]).select().single();
    if (data) setShoots(p => [...p, { id: data.id, clientName: data.client_name, projectName: data.project_name, shootType: data.shoot_type, date: data.date, location: data.location, crew: data.crew || [], notes: data.notes, docsLink: data.docs_link, status: data.status }]);
  };

  const updateShoot = async (id, shoot) => {
    await supabase.from('shoots').update({
      client_name: shoot.clientName, project_name: shoot.projectName,
      shoot_type: shoot.shootType, date: shoot.date, location: shoot.location,
      crew: shoot.crew, notes: shoot.notes, docs_link: shoot.docsLink
    }).eq('id', id);
    setShoots(p => p.map(s => s.id === id ? { ...s, ...shoot } : s));
  };

  const deleteShoot = async (id) => {
    await supabase.from('shoots').delete().eq('id', id);
    setShoots(p => p.filter(s => s.id !== id));
  };

  const setDateMark = async (date, status) => {
    const existing = dateMarks.find(m => m.date === date);
    if (existing) {
      await supabase.from('date_marks').update({ status }).eq('date', date);
      setDateMarksState(p => p.map(m => m.date === date ? { ...m, status } : m));
    } else {
      const { data } = await supabase.from('date_marks').insert([{ date, status }]).select().single();
      if (data) setDateMarksState(p => [...p, { id: data.id, date: data.date, status: data.status }]);
    }
  };

  const removeDateMark = async (date) => {
    await supabase.from('date_marks').delete().eq('date', date);
    setDateMarksState(p => p.filter(m => m.date !== date));
  };

  const addTask = async (task) => {
    const { data } = await supabase.from('tasks').insert([{
      title: task.title, description: task.description,
      assigned_to: task.assignedTo, deadline: task.deadline,
      priority: task.priority, status: task.status, project: task.project
    }]).select().single();
    if (data) setTasks(p => [...p, { id: data.id, title: data.title, description: data.description, assignedTo: data.assigned_to, deadline: data.deadline, priority: data.priority, status: data.status, project: data.project }]);
  };

  const updateTask = async (id, task) => {
    await supabase.from('tasks').update({
      title: task.title, description: task.description,
      assigned_to: task.assignedTo, deadline: task.deadline,
      priority: task.priority, status: task.status, project: task.project
    }).eq('id', id);
    setTasks(p => p.map(t => t.id === id ? { ...t, ...task } : t));
  };

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(p => p.filter(t => t.id !== id));
  };

  const addClient = async (client) => {
    const { data } = await supabase.from('clients').insert([{
      name: client.name, contact: client.contact, phone: client.phone, email: client.email
    }]).select().single();
    if (data) setClients(p => [...p, { id: data.id, name: data.name, contact: data.contact, phone: data.phone, email: data.email, projects: [] }]);
  };

  const addProject = async (clientId, project) => {
    const { data } = await supabase.from('projects').insert([{
      client_id: clientId, name: project.name, status: project.status,
      shoot_id: project.shootId || null, docs_link: project.docsLink, team: project.team || []
    }]).select().single();
    if (data) {
      setClients(p => p.map(c => c.id === clientId ? {
        ...c, projects: [...c.projects, { id: data.id, name: data.name, status: data.status, shootId: data.shoot_id, docsLink: data.docs_link, team: data.team || [] }]
      } : c));
    }
  };

  const updateProject = async (clientId, projectId, project) => {
    await supabase.from('projects').update({
      name: project.name, status: project.status,
      shoot_id: project.shootId, docs_link: project.docsLink, team: project.team
    }).eq('id', projectId);
    setClients(p => p.map(c => c.id === clientId ? {
      ...c, projects: c.projects.map(pr => pr.id === projectId ? { ...pr, ...project } : pr)
    } : c));
  };

  const deleteClient = async (clientId) => {
    await supabase.from('projects').delete().eq('client_id', clientId);
    await supabase.from('clients').delete().eq('id', clientId);
    setClients(p => p.filter(c => c.id !== clientId));
  };

  const deleteProject = async (clientId, projectId) => {
    await supabase.from('projects').delete().eq('id', projectId);
    setClients(p => p.map(c => c.id === clientId ? {
      ...c, projects: c.projects.filter(pr => pr.id !== projectId)
    } : c));
  };

  const submitBooking = async (booking) => {
    const { data } = await supabase.from('bookings').insert([{
      client_name: booking.clientName, project_name: booking.projectName,
      contact_name: booking.contactName, phone: booking.phone, email: booking.email,
      preferred_date: booking.preferredDate, shoot_days: booking.shootDays, status: 'pending'
    }]).select().single();
    if (data) setBookings(p => [{ id: data.id, clientName: data.client_name, projectName: data.project_name, contactName: data.contact_name, phone: data.phone, email: data.email, preferredDate: data.preferred_date, shootDays: data.shoot_days, status: data.status, submittedAt: data.submitted_at }, ...p]);
  };

  const approveBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    for (let i = 0; i < booking.shootDays; i++) {
      const d = new Date(booking.preferredDate);
      d.setDate(d.getDate() + i);
      await setDateMark(d.toISOString().split('T')[0], 'busy');
    }
    await addShoot({
      clientName: booking.clientName, projectName: booking.projectName,
      shootType: 'Reel', date: booking.preferredDate, location: 'TBD',
      crew: [], notes: `Approved booking. Contact: ${booking.contactName} ${booking.phone}`, docsLink: ''
    });
  };

  const rejectBooking = async (id) => {
    await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
  };

  const addMember = (member) => {
    const newId = Math.max(...team.map(m => m.id), 0) + 1;
    const newMember = { ...member, id: newId };
    setTeam(p => [...p, newMember]);
  };

  const updateMember = (id, member) => {
    setTeam(p => p.map(m => m.id === id ? { ...m, ...member } : m));
    // If editing self, update currentUser too
    if (id === JSON.parse(localStorage.getItem('aaram_user') || '{}')?.id) {
      const updated = { ...JSON.parse(localStorage.getItem('aaram_user')), ...member };
      localStorage.setItem('aaram_user', JSON.stringify(updated));
    }
  };

  const deleteMember = (id) => {
    setTeam(p => p.filter(m => m.id !== id));
  };

  const today = new Date();
  const notifications = [
    ...bookings.filter(b => b.status === 'pending').map(b => ({
      id: `bk-${b.id}`, type: 'booking', message: `New booking from ${b.clientName} — ${b.projectName}`, time: b.submittedAt
    })),
    ...tasks.filter(t => {
      const diff = (new Date(t.deadline) - today) / 86400000;
      return diff >= 0 && diff <= 2 && t.status !== 'completed';
    }).map(t => ({ id: `tk-${t.id}`, type: 'task', message: `Task "${t.title}" deadline approaching`, time: t.deadline })),
    ...shoots.filter(s => {
      const diff = (new Date(s.date) - today) / 86400000;
      return diff >= 0 && diff <= 3;
    }).map(s => ({ id: `sh-${s.id}`, type: 'shoot', message: `Shoot: ${s.projectName} for ${s.clientName} in ${Math.ceil((new Date(s.date) - today) / 86400000)} day(s)`, time: s.date })),
  ];

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, view, setView, publicPage, setPublicPage, loading,
      shoots, addShoot, updateShoot, deleteShoot,
      dateMarks, setDateMark, removeDateMark,
      tasks, addTask, updateTask, deleteTask,
      clients, addClient, addProject, updateProject, deleteClient, deleteProject,
      bookings, submitBooking, approveBooking, rejectBooking,
      team, addMember, updateMember, deleteMember, notifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
