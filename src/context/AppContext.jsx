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
  const [activityLog, setActivityLog] = useState([]);

  const logActivity = async (action, message, user) => {
    if (!user) return;
    const entry = { action, message, user_id: String(user.id), user_name: user.name, ts: new Date().toISOString() };
    const { data } = await supabase.from('activity_log').insert([entry]).select().single();
    if (data) setActivityLog(prev => [{ id: data.id, action: data.action, message: data.message, userId: data.user_id, userName: data.user_name, ts: data.ts }, ...prev].slice(0, 500));
  };

  const clearActivityLog = async () => {
    await supabase.from('activity_log').delete().neq('id', 0);
    setActivityLog([]);
  };
  const [clientAccounts, setClientAccounts] = useState(() => {
    const saved = localStorage.getItem('aaram_client_accounts');
    return saved ? JSON.parse(saved) : [];
  });
  const [clientUser, setClientUser] = useState(() => {
    const saved = localStorage.getItem('aaram_client_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [shootsRes, dateMarksRes, tasksRes, clientsRes, bookingsRes, projectsRes, activityRes] = await Promise.all([
        supabase.from('shoots').select('*').order('date'),
        supabase.from('date_marks').select('*'),
        supabase.from('tasks').select('*').order('created_at'),
        supabase.from('clients').select('*').order('created_at'),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('activity_log').select('*').order('ts', { ascending: false }).limit(500),
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
        status: b.status, submittedAt: b.submitted_at, notes: b.notes || '', clientUserId: b.client_user_id || null
      })));

      if (activityRes.data) setActivityLog(activityRes.data.map(a => ({
        id: a.id, action: a.action, message: a.message,
        userId: a.user_id, userName: a.user_name, ts: a.ts
      })));
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser && !clientUser) return;
    loadData();

    // Real-time: bookings
    const bookingsSub = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        supabase.from('bookings').select('*').order('id', { ascending: false }).then(({ data }) => {
          if (data) setBookings(data.map(b => ({
            id: b.id, clientName: b.client_name, projectName: b.project_name,
            contactName: b.contact_name, phone: b.phone, email: b.email,
            preferredDate: b.preferred_date, shootDays: b.shoot_days,
            status: b.status, submittedAt: b.submitted_at, notes: b.notes || '', clientUserId: b.client_user_id || null
          })));
        });
      })
      .subscribe();

    // Real-time: activity log
    const activitySub = supabase
      .channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        const a = payload.new;
        setActivityLog(prev => [{ id: a.id, action: a.action, message: a.message, userId: a.user_id, userName: a.user_name, ts: a.ts }, ...prev].slice(0, 500));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'activity_log' }, () => {
        setActivityLog([]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(activitySub);
    };
  }, [currentUser, clientUser]);

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
    if (data) {
      setShoots(p => [...p, { id: data.id, clientName: data.client_name, projectName: data.project_name, shootType: data.shoot_type, date: data.date, location: data.location, crew: data.crew || [], notes: data.notes, docsLink: data.docs_link, status: data.status }]);
      logActivity('shoot_added', `added shoot "${shoot.projectName}" for ${shoot.clientName} on ${shoot.date}`, currentUser);
    }
  };

  const updateShoot = async (id, shoot) => {
    await supabase.from('shoots').update({
      client_name: shoot.clientName, project_name: shoot.projectName,
      shoot_type: shoot.shootType, date: shoot.date, location: shoot.location,
      crew: shoot.crew, notes: shoot.notes, docs_link: shoot.docsLink
    }).eq('id', id);
    setShoots(p => p.map(s => s.id === id ? { ...s, ...shoot } : s));
    logActivity('shoot_updated', `updated shoot "${shoot.projectName}"`, currentUser);
  };

  const deleteShoot = async (id) => {
    const shoot = shoots.find(s => s.id === id);
    await supabase.from('shoots').delete().eq('id', id);
    setShoots(p => p.filter(s => s.id !== id));
    logActivity('shoot_deleted', `deleted shoot "${shoot?.projectName || id}"`, currentUser);
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
    if (data) {
      setTasks(p => [...p, { id: data.id, title: data.title, description: data.description, assignedTo: data.assigned_to, deadline: data.deadline, priority: data.priority, status: data.status, project: data.project }]);
      logActivity('task_added', `added task "${task.title}"`, currentUser);
    }
  };

  const updateTask = async (id, task) => {
    const prev = tasks.find(t => t.id === id);
    await supabase.from('tasks').update({
      title: task.title, description: task.description,
      assigned_to: task.assignedTo, deadline: task.deadline,
      priority: task.priority, status: task.status, project: task.project
    }).eq('id', id);
    setTasks(p => p.map(t => t.id === id ? { ...t, ...task } : t));
    if (prev?.status !== 'completed' && task.status === 'completed') {
      logActivity('task_completed', `completed task "${task.title}"`, currentUser);
    } else {
      logActivity('task_updated', `updated task "${task.title}"`, currentUser);
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(p => p.filter(t => t.id !== id));
    logActivity('task_deleted', `deleted task "${task?.title || id}"`, currentUser);
  };

  const addClient = async (client) => {
    const { data } = await supabase.from('clients').insert([{
      name: client.name, contact: client.contact, phone: client.phone, email: client.email
    }]).select().single();
    if (data) {
      setClients(p => [...p, { id: data.id, name: data.name, contact: data.contact, phone: data.phone, email: data.email, projects: [] }]);
      logActivity('client_added', `added client "${client.name}"`, currentUser);
    }
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
      logActivity('project_added', `added project "${project.name}"`, currentUser);
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
    logActivity('project_updated', `updated project "${project.name}"`, currentUser);
  };

  const deleteClient = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    await supabase.from('projects').delete().eq('client_id', clientId);
    await supabase.from('clients').delete().eq('id', clientId);
    setClients(p => p.filter(c => c.id !== clientId));
    logActivity('client_deleted', `deleted client "${client?.name || clientId}"`, currentUser);
  };

  const deleteProject = async (clientId, projectId) => {
    const client = clients.find(c => c.id === clientId);
    const project = client?.projects?.find(p => p.id === projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    setClients(p => p.map(c => c.id === clientId ? {
      ...c, projects: c.projects.filter(pr => pr.id !== projectId)
    } : c));
    logActivity('project_deleted', `deleted project "${project?.name || projectId}"`, currentUser);
  };

  const submitBooking = async (booking) => {
    const { data, error } = await supabase.from('bookings').insert([{
      client_name: booking.clientName, project_name: booking.projectName,
      contact_name: booking.contactName, phone: booking.phone, email: booking.email,
      preferred_date: booking.preferredDate, shoot_days: booking.shootDays, status: 'pending',
      client_user_id: booking.clientUserId ? String(booking.clientUserId) : null,
      submitted_at: new Date().toISOString(),
    }]).select().single();
    if (error) { console.error('submitBooking error:', error); return; }
    if (data) setBookings(p => [{
      id: data.id, clientName: data.client_name, projectName: data.project_name,
      contactName: data.contact_name, phone: data.phone, email: data.email,
      preferredDate: data.preferred_date, shootDays: data.shoot_days,
      status: data.status, submittedAt: data.submitted_at, notes: data.notes || '',
      clientUserId: data.client_user_id
    }, ...p]);
  };

  const approveBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    const { error } = await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
    if (error) { console.error('approveBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    logActivity('booking_approved', `approved booking from ${booking.clientName}`, currentUser);
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
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
    if (error) { console.error('rejectBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
    logActivity('booking_rejected', `rejected booking from ${booking?.clientName || id}`, currentUser);
  };

  const updateBooking = async (id, updates) => {
    const { error } = await supabase.from('bookings').update({
      client_name: updates.clientName, contact_name: updates.contactName,
      phone: updates.phone, email: updates.email,
      preferred_date: updates.preferredDate, shoot_days: updates.shootDays, notes: updates.notes,
    }).eq('id', id);
    if (error) { console.error('updateBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { console.error('deleteBooking error:', error); return; }
    setBookings(p => p.filter(b => b.id !== id));
    logActivity('booking_deleted', `deleted booking from ${booking?.clientName || id}`, currentUser);
  };

  const clientLogin = (email, password) => {
    const acc = clientAccounts.find(a => (a.email === email || a.phone === email) && a.password === password);
    if (acc) {
      setClientUser(acc);
      localStorage.setItem('aaram_client_user', JSON.stringify(acc));
      loadData(); // load shoots, dateMarks, bookings for portal
      return true;
    }
    return false;
  };

  const clientLogout = () => {
    setClientUser(null);
    localStorage.removeItem('aaram_client_user');
  };

  const saveClientAccounts = (accounts) => {
    setClientAccounts(accounts);
    localStorage.setItem('aaram_client_accounts', JSON.stringify(accounts));
  };

  const addClientAccount = (account) => {
    const newAcc = { ...account, id: Date.now() };
    saveClientAccounts([...clientAccounts, newAcc]);
  };

  const updateClientAccount = (id, account) => {
    const updated = clientAccounts.map(a => a.id === id ? { ...a, ...account } : a);
    saveClientAccounts(updated);
    if (clientUser?.id === id) {
      const updatedUser = { ...clientUser, ...account };
      setClientUser(updatedUser);
      localStorage.setItem('aaram_client_user', JSON.stringify(updatedUser));
    }
  };

  const deleteClientAccount = (id) => {
    saveClientAccounts(clientAccounts.filter(a => a.id !== id));
  };

  const addMember = (member) => {
    const newId = Math.max(...team.map(m => m.id), 0) + 1;
    const newMember = { ...member, id: newId };
    setTeam(p => [...p, newMember]);
    logActivity('member_added', `added team member "${member.name}" (${member.title})`, currentUser);
  };

  const updateMember = (id, member) => {
    const existing = team.find(m => m.id === id);
    setTeam(p => p.map(m => m.id === id ? { ...m, ...member } : m));
    if (id === JSON.parse(localStorage.getItem('aaram_user') || '{}')?.id) {
      const updated = { ...JSON.parse(localStorage.getItem('aaram_user')), ...member };
      localStorage.setItem('aaram_user', JSON.stringify(updated));
    }
    logActivity('member_updated', `updated team member "${member.name || existing?.name}"`, currentUser);
  };

  const deleteMember = (id) => {
    const member = team.find(m => m.id === id);
    setTeam(p => p.filter(m => m.id !== id));
    logActivity('member_deleted', `removed team member "${member?.name || id}"`, currentUser);
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
      bookings, submitBooking, approveBooking, rejectBooking, deleteBooking, updateBooking,
      team, addMember, updateMember, deleteMember,
      activityLog, clearActivityLog,
      clientAccounts, clientUser, clientLogin, clientLogout, addClientAccount, updateClientAccount, deleteClientAccount,
      notifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
