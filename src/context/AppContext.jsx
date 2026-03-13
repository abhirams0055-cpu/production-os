import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import {
  playChatSound, playBookingSound, playApprovedSound, playRejectedSound,
  playTaskSound, playMemberSound, playUpdateSound, playAlertSound
} from '../utils/sounds';

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
  const [team, setTeam] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [clientAccounts, setClientAccounts] = useState([]);
  const [clientUser, setClientUser] = useState(() => {
    const saved = localStorage.getItem('aaram_client_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [unreadMessages, setUnreadMessages] = useState({});
  const [incomingAlert, setIncomingAlert] = useState(null);
  const currentChatRoomRef = useRef(null);
  const setCurrentChatRoom = (roomId) => { currentChatRoomRef.current = roomId; };

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [shootsRes, dateMarksRes, tasksRes, clientsRes, bookingsRes, projectsRes, activityRes, teamRes, clientAccRes] = await Promise.all([
        supabase.from('shoots').select('*').order('date'),
        supabase.from('date_marks').select('*'),
        supabase.from('tasks').select('*').order('created_at'),
        supabase.from('clients').select('*').order('created_at'),
        supabase.from('bookings').select('*').order('id', { ascending: false }),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('activity_log').select('*').order('ts', { ascending: false }).limit(500),
        supabase.from('team_members').select('*').order('id'),
        supabase.from('client_accounts').select('*').order('id'),
      ]);
      if (shootsRes.data) setShoots(shootsRes.data.map(s => ({ id: s.id, clientName: s.client_name, projectName: s.project_name, shootType: s.shoot_type, date: s.date, location: s.location, crew: s.crew || [], notes: s.notes, docsLink: s.docs_link, status: s.status })));
      if (dateMarksRes.data) setDateMarksState(dateMarksRes.data.map(m => ({ id: m.id, date: m.date, status: m.status })));
      if (tasksRes.data) setTasks(tasksRes.data.map(t => ({ id: t.id, title: t.title, description: t.description, assignedTo: t.assigned_to, deadline: t.deadline, priority: t.priority, status: t.status, project: t.project })));
      if (clientsRes.data && projectsRes.data) setClients(clientsRes.data.map(c => ({ id: c.id, name: c.name, contact: c.contact, phone: c.phone, email: c.email, projects: projectsRes.data.filter(p => p.client_id === c.id).map(p => ({ id: p.id, name: p.name, status: p.status, shootId: p.shoot_id, docsLink: p.docs_link, team: p.team || [] })) })));
      if (bookingsRes.data) setBookings(bookingsRes.data.map(b => ({ id: b.id, clientName: b.client_name, projectName: b.project_name, contactName: b.contact_name, phone: b.phone, email: b.email, preferredDate: b.preferred_date, shootDays: b.shoot_days, status: b.status, submittedAt: b.submitted_at, notes: b.notes || '', clientUserId: b.client_user_id || null })));
      if (activityRes.data) setActivityLog(activityRes.data.map(a => ({ id: a.id, action: a.action, message: a.message, userId: a.user_id, userName: a.user_name, ts: a.ts })));
      if (teamRes.data) setTeam(teamRes.data.map(m => ({ id: m.id, name: m.name, role: m.role, email: m.email, password: m.password, title: m.title })));
      if (clientAccRes.data) setClientAccounts(clientAccRes.data.map(c => ({ id: c.id, companyName: c.company_name, name: c.contact_name || '', email: c.email, phone: c.phone, password: c.password })));
    } catch (err) { console.error('loadData error:', err); }
    setLoading(false);
  };

  // Seed default team if empty
  const seedTeamIfEmpty = async () => {
    const { data } = await supabase.from('team_members').select('id').limit(1);
    if (data && data.length === 0) {
      await supabase.from('team_members').insert([
        { name: 'Aaram', role: 'admin', email: 'hello@teamaaram.com', password: 'Aaram@111', title: 'Aaram Head' },
        { name: 'VIC', role: 'admin', email: 'hello@vivorporate.com', password: 'Vic@222', title: 'VIC Head' },
        { name: 'Nikhil', role: 'admin', email: 'nikhil@vicorporate.com', password: 'Nikhil@333', title: 'Head' },
        { name: 'Abhiram', role: 'member', email: 'abhiram@vicorporate.com', password: 'abhiram@555', title: 'Creative Head' },
        { name: 'Avinash', role: 'member', email: 'avinash@vicorporate.com', password: 'Avinash@666', title: 'Team Lead' },
        { name: 'Athul', role: 'member', email: 'athul@vicorporate.com', password: 'athul@000', title: 'SEO' },
        { name: 'Sradha', role: 'member', email: 'sradha@vicorporate.com', password: 'sradha@999', title: 'Dev' },
        { name: 'Sabari', role: 'member', email: 'sabari@vicorporate.com', password: 'sabari@1122', title: 'Content Writer' },
      ]);
    }
  };

  useEffect(() => {
    seedTeamIfEmpty().then(() => { if (currentUser || clientUser) loadData(); });
  }, []);

  useEffect(() => {
    if (!currentUser && !clientUser) return;
    loadData();

    const bookingsSub = supabase.channel('bookings-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, () => {
        playBookingSound();
        supabase.from('bookings').select('*').order('id', { ascending: false }).then(({ data }) => {
          if (data) setBookings(data.map(b => ({ id: b.id, clientName: b.client_name, projectName: b.project_name, contactName: b.contact_name, phone: b.phone, email: b.email, preferredDate: b.preferred_date, shootDays: b.shoot_days, status: b.status, submittedAt: b.submitted_at, notes: b.notes || '', clientUserId: b.client_user_id || null })));
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => {
        supabase.from('bookings').select('*').order('id', { ascending: false }).then(({ data }) => {
          if (data) setBookings(data.map(b => ({ id: b.id, clientName: b.client_name, projectName: b.project_name, contactName: b.contact_name, phone: b.phone, email: b.email, preferredDate: b.preferred_date, shootDays: b.shoot_days, status: b.status, submittedAt: b.submitted_at, notes: b.notes || '', clientUserId: b.client_user_id || null })));
        });
      }).subscribe();

    const activitySub = supabase.channel('activity-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_log' }, (payload) => {
        const a = payload.new;
        setActivityLog(prev => [{ id: a.id, action: a.action, message: a.message, userId: a.user_id, userName: a.user_name, ts: a.ts }, ...prev].slice(0, 500));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'activity_log' }, () => setActivityLog([]))
      .subscribe();

    const sender = currentUser || clientUser;
    const messagesSub = supabase.channel('messages-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new;
        if (String(m.sender_id) === String(sender?.id)) return;
        playChatSound();
        setUnreadMessages(prev => {
          const roomKey = m.room_id;
          if (currentChatRoomRef.current === roomKey) return prev;
          return { ...prev, [roomKey]: (prev[roomKey] || 0) + 1 };
        });
      }).subscribe();

    const teamSub = supabase.channel('team-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        supabase.from('team_members').select('*').order('id').then(({ data }) => {
          if (data) setTeam(data.map(m => ({ id: m.id, name: m.name, role: m.role, email: m.email, password: m.password, title: m.title })));
        });
      }).subscribe();

    const clientAccSub = supabase.channel('clientacc-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_accounts' }, () => {
        supabase.from('client_accounts').select('*').order('id').then(({ data }) => {
          if (data) setClientAccounts(data.map(c => ({ id: c.id, companyName: c.company_name, name: c.contact_name || '', email: c.email, phone: c.phone, password: c.password })));
        });
      }).subscribe();

    // Real-time: alerts channel
    const alertSub = supabase.channel('alerts-channel')
      .on('broadcast', { event: 'alert' }, (payload) => {
        const { targets, senderId } = payload.payload || {};
        if (String(senderId) === String((currentUser || clientUser)?.id)) return;
        // targets: null/[] = all, or array of member ids
        if (!targets || targets.length === 0 || targets.includes(String((currentUser || clientUser)?.id))) {
          playAlertSound();
          setIncomingAlert(payload.payload);
          setTimeout(() => setIncomingAlert(null), 8000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(activitySub);
      supabase.removeChannel(messagesSub);
      supabase.removeChannel(teamSub);
      supabase.removeChannel(clientAccSub);
      supabase.removeChannel(alertSub);
    };
  }, [currentUser, clientUser]);

  const login = async (email, password) => {
    const { data } = await supabase.from('team_members').select('*').eq('email', email).eq('password', password).maybeSingle();
    if (data) {
      const user = { id: data.id, name: data.name, role: data.role, email: data.email, title: data.title };
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
    const { data } = await supabase.from('shoots').insert([{ client_name: shoot.clientName, project_name: shoot.projectName, shoot_type: shoot.shootType, date: shoot.date, location: shoot.location, crew: shoot.crew, notes: shoot.notes, docs_link: shoot.docsLink, status: 'confirmed' }]).select().single();
    if (data) { setShoots(p => [...p, { id: data.id, clientName: data.client_name, projectName: data.project_name, shootType: data.shoot_type, date: data.date, location: data.location, crew: data.crew || [], notes: data.notes, docsLink: data.docs_link, status: data.status }]); playBookingSound(); logActivity('shoot_added', `added shoot "${shoot.projectName}" for ${shoot.clientName} on ${shoot.date}`, currentUser); }
  };
  const updateShoot = async (id, shoot) => {
    await supabase.from('shoots').update({ client_name: shoot.clientName, project_name: shoot.projectName, shoot_type: shoot.shootType, date: shoot.date, location: shoot.location, crew: shoot.crew, notes: shoot.notes, docs_link: shoot.docsLink }).eq('id', id);
    setShoots(p => p.map(s => s.id === id ? { ...s, ...shoot } : s));
    playUpdateSound(); logActivity('shoot_updated', `updated shoot "${shoot.projectName}"`, currentUser);
  };
  const deleteShoot = async (id) => {
    const shoot = shoots.find(s => s.id === id);
    await supabase.from('shoots').delete().eq('id', id);
    setShoots(p => p.filter(s => s.id !== id));
    playRejectedSound(); logActivity('shoot_deleted', `deleted shoot "${shoot?.projectName || id}"`, currentUser);
  };
  const setDateMark = async (date, status) => {
    const existing = dateMarks.find(m => m.date === date);
    if (existing) { await supabase.from('date_marks').update({ status }).eq('date', date); setDateMarksState(p => p.map(m => m.date === date ? { ...m, status } : m)); }
    else { const { data } = await supabase.from('date_marks').insert([{ date, status }]).select().single(); if (data) setDateMarksState(p => [...p, { id: data.id, date: data.date, status: data.status }]); }
  };
  const removeDateMark = async (date) => {
    await supabase.from('date_marks').delete().eq('date', date);
    setDateMarksState(p => p.filter(m => m.date !== date));
  };
  const addTask = async (task) => {
    const { data } = await supabase.from('tasks').insert([{ title: task.title, description: task.description, assigned_to: task.assignedTo, deadline: task.deadline, priority: task.priority, status: task.status, project: task.project }]).select().single();
    if (data) { setTasks(p => [...p, { id: data.id, title: data.title, description: data.description, assignedTo: data.assigned_to, deadline: data.deadline, priority: data.priority, status: data.status, project: data.project }]); logActivity('task_added', `added task "${task.title}"`, currentUser); playTaskSound(); }
  };
  const updateTask = async (id, task) => {
    const prev = tasks.find(t => t.id === id);
    await supabase.from('tasks').update({ title: task.title, description: task.description, assigned_to: task.assignedTo, deadline: task.deadline, priority: task.priority, status: task.status, project: task.project }).eq('id', id);
    setTasks(p => p.map(t => t.id === id ? { ...t, ...task } : t));
    if (prev?.status !== 'completed' && task.status === 'completed') { logActivity('task_completed', `completed task "${task.title}"`, currentUser); playApprovedSound(); }
    else { logActivity('task_updated', `updated task "${task.title}"`, currentUser); playUpdateSound(); }
  };
  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(p => p.filter(t => t.id !== id));
    playRejectedSound(); logActivity('task_deleted', `deleted task "${task?.title || id}"`, currentUser);
  };
  const addClient = async (client) => {
    const { data } = await supabase.from('clients').insert([{ name: client.name, contact: client.contact, phone: client.phone, email: client.email }]).select().single();
    if (data) { setClients(p => [...p, { id: data.id, name: data.name, contact: data.contact, phone: data.phone, email: data.email, projects: [] }]); playMemberSound(); logActivity('client_added', `added client "${client.name}"`, currentUser); }
  };
  const addProject = async (clientId, project) => {
    const { data } = await supabase.from('projects').insert([{ client_id: clientId, name: project.name, status: project.status, shoot_id: project.shootId || null, docs_link: project.docsLink, team: project.team || [] }]).select().single();
    if (data) { setClients(p => p.map(c => c.id === clientId ? { ...c, projects: [...c.projects, { id: data.id, name: data.name, status: data.status, shootId: data.shoot_id, docsLink: data.docs_link, team: data.team || [] }] } : c)); playTaskSound(); logActivity('project_added', `added project "${project.name}"`, currentUser); }
  };
  const updateProject = async (clientId, projectId, project) => {
    await supabase.from('projects').update({ name: project.name, status: project.status, shoot_id: project.shootId, docs_link: project.docsLink, team: project.team }).eq('id', projectId);
    setClients(p => p.map(c => c.id === clientId ? { ...c, projects: c.projects.map(pr => pr.id === projectId ? { ...pr, ...project } : pr) } : c));
    playUpdateSound(); logActivity('project_updated', `updated project "${project.name}"`, currentUser);
  };
  const deleteClient = async (clientId) => {
    const client = clients.find(c => c.id === clientId);
    await supabase.from('projects').delete().eq('client_id', clientId);
    await supabase.from('clients').delete().eq('id', clientId);
    setClients(p => p.filter(c => c.id !== clientId));
    playRejectedSound(); logActivity('client_deleted', `deleted client "${client?.name || clientId}"`, currentUser);
  };
  const deleteProject = async (clientId, projectId) => {
    const client = clients.find(c => c.id === clientId);
    const project = client?.projects?.find(p => p.id === projectId);
    await supabase.from('projects').delete().eq('id', projectId);
    setClients(p => p.map(c => c.id === clientId ? { ...c, projects: c.projects.filter(pr => pr.id !== projectId) } : c));
    playRejectedSound(); logActivity('project_deleted', `deleted project "${project?.name || projectId}"`, currentUser);
  };
  const submitBooking = async (booking) => {
    const { data, error } = await supabase.from('bookings').insert([{ client_name: booking.clientName, project_name: booking.projectName, contact_name: booking.contactName, phone: booking.phone, email: booking.email, preferred_date: booking.preferredDate, shoot_days: booking.shootDays, status: 'pending', notes: booking.notes || '', client_user_id: booking.clientUserId ? String(booking.clientUserId) : null, submitted_at: new Date().toISOString() }]).select().single();
    if (error) { console.error('submitBooking error:', error); return; }
    if (data) { setBookings(p => [{ id: data.id, clientName: data.client_name, projectName: data.project_name, contactName: data.contact_name, phone: data.phone, email: data.email, preferredDate: data.preferred_date, shootDays: data.shoot_days, status: data.status, submittedAt: data.submitted_at, notes: data.notes || '', clientUserId: data.client_user_id }, ...p]); playBookingSound(); }
  };
  const approveBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    const { error } = await supabase.from('bookings').update({ status: 'approved' }).eq('id', id);
    if (error) { console.error('approveBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    logActivity('booking_approved', `approved booking from ${booking.clientName}`, currentUser); playApprovedSound();
    for (let i = 0; i < booking.shootDays; i++) { const d = new Date(booking.preferredDate); d.setDate(d.getDate() + i); await setDateMark(d.toISOString().split('T')[0], 'busy'); }
    await addShoot({ clientName: booking.clientName, projectName: booking.projectName, shootType: 'Reel', date: booking.preferredDate, location: 'TBD', crew: [], notes: `Approved booking. Contact: ${booking.contactName} ${booking.phone}`, docsLink: '' });
  };
  const rejectBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', id);
    if (error) { console.error('rejectBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
    logActivity('booking_rejected', `rejected booking from ${booking?.clientName || id}`, currentUser); playRejectedSound();
  };
  const updateBooking = async (id, updates) => {
    const { error } = await supabase.from('bookings').update({ client_name: updates.clientName, contact_name: updates.contactName, phone: updates.phone, email: updates.email, preferred_date: updates.preferredDate, shoot_days: updates.shootDays, notes: updates.notes }).eq('id', id);
    if (error) { console.error('updateBooking error:', error); return; }
    setBookings(p => p.map(b => b.id === id ? { ...b, ...updates } : b));
  };
  const deleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { console.error('deleteBooking error:', error); return; }
    setBookings(p => p.filter(b => b.id !== id));
    playRejectedSound(); logActivity('booking_deleted', `deleted booking from ${booking?.clientName || id}`, currentUser);
  };

  // Team — Supabase
  const addMember = async (member) => {
    const { data } = await supabase.from('team_members').insert([{ name: member.name, role: member.role, email: member.email, password: member.password, title: member.title }]).select().single();
    if (data) { setTeam(p => [...p, { id: data.id, name: data.name, role: data.role, email: data.email, password: data.password, title: data.title }]); logActivity('member_added', `added team member "${member.name}" (${member.title})`, currentUser); playMemberSound(); }
  };
  const updateMember = async (id, member) => {
    const updates = { name: member.name, role: member.role, email: member.email, title: member.title };
    if (member.password && member.password.trim()) updates.password = member.password.trim();
    await supabase.from('team_members').update(updates).eq('id', id);
    setTeam(p => p.map(m => m.id === id ? { ...m, ...member } : m));
    const savedUser = JSON.parse(localStorage.getItem('aaram_user') || '{}');
    if (savedUser?.id === id) { const updated = { ...savedUser, ...member }; setCurrentUser(updated); localStorage.setItem('aaram_user', JSON.stringify(updated)); }
    logActivity('member_updated', `updated team member "${member.name}"`, currentUser); playUpdateSound();
  };
  const deleteMember = async (id) => {
    const member = team.find(m => m.id === id);
    await supabase.from('team_members').delete().eq('id', id);
    setTeam(p => p.filter(m => m.id !== id));
    playRejectedSound(); logActivity('member_deleted', `removed team member "${member?.name || id}"`, currentUser);
  };

  // Client Accounts — Supabase
  const clientLogin = async (emailOrPhone, password) => {
    const trimmedInput = emailOrPhone.trim();
    const trimmedPass = password.trim();

    // First fetch all accounts matching the email/phone, then check password in JS
    // This avoids any query-encoding issues with special chars in passwords
    let { data: rows, error } = await supabase
      .from('client_accounts')
      .select('*')
      .or(`email.eq.${trimmedInput},phone.eq.${trimmedInput}`);

    if (error) console.error('clientLogin query error:', error);

    const match = (rows || []).find(r => r.password === trimmedPass || r.password === password);

    if (match) {
      const acc = { id: match.id, companyName: match.company_name, name: match.contact_name || '', email: match.email, phone: match.phone, password: match.password };
      setClientUser(acc);
      localStorage.setItem('aaram_client_user', JSON.stringify(acc));
      loadData();
      return true;
    }
    return false;
  };
  const clientLogout = () => { setClientUser(null); localStorage.removeItem('aaram_client_user'); };
  const addClientAccount = async (account) => {
    const { data } = await supabase.from('client_accounts').insert([{ company_name: account.companyName, contact_name: account.name || '', email: account.email, phone: account.phone, password: account.password }]).select().single();
    if (data) setClientAccounts(p => [...p, { id: data.id, companyName: data.company_name, name: data.contact_name || '', email: data.email, phone: data.phone, password: data.password }]);
  };
  const updateClientAccount = async (id, account) => {
    const updates = { company_name: account.companyName, contact_name: account.name || '', email: account.email, phone: account.phone };
    if (account.password && account.password.trim()) updates.password = account.password.trim();
    await supabase.from('client_accounts').update(updates).eq('id', id);
    setClientAccounts(p => p.map(a => a.id === id ? { ...a, ...account } : a));
    if (clientUser?.id === id) { const updated = { ...clientUser, ...account }; setClientUser(updated); localStorage.setItem('aaram_client_user', JSON.stringify(updated)); }
  };
  const deleteClientAccount = async (id) => {
    await supabase.from('client_accounts').delete().eq('id', id);
    setClientAccounts(p => p.filter(a => a.id !== id));
  };

  const sendAlert = async ({ message, targets }) => {
    await supabase.channel('alerts-channel').send({
      type: 'broadcast',
      event: 'alert',
      payload: { message, targets, senderId: currentUser?.id, senderName: currentUser?.name, sentAt: new Date().toISOString() },
    });
    playAlertSound();
  };

  const dismissAlert = () => setIncomingAlert(null);

  const clearUnread = (roomId) => { setUnreadMessages(prev => { const n = { ...prev }; delete n[roomId]; return n; }); };
  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  const today = new Date();
  const notifications = [
    ...bookings.filter(b => b.status === 'pending').map(b => ({ id: `bk-${b.id}`, type: 'booking', message: `New booking from ${b.clientName} — ${b.projectName}`, time: b.submittedAt })),
    ...tasks.filter(t => { const diff = (new Date(t.deadline) - today) / 86400000; return diff >= 0 && diff <= 2 && t.status !== 'completed'; }).map(t => ({ id: `tk-${t.id}`, type: 'task', message: `Task "${t.title}" deadline approaching`, time: t.deadline })),
    ...shoots.filter(s => { const diff = (new Date(s.date) - today) / 86400000; return diff >= 0 && diff <= 3; }).map(s => ({ id: `sh-${s.id}`, type: 'shoot', message: `Shoot: ${s.projectName} for ${s.clientName} in ${Math.ceil((new Date(s.date) - today) / 86400000)} day(s)`, time: s.date })),
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
      notifications,
      unreadMessages, clearUnread, totalUnread, setCurrentChatRoom,
      incomingAlert, dismissAlert, sendAlert,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
