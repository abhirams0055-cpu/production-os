import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity, Camera, CheckSquare, FolderOpen, Users, Trash2,
  Plus, Pencil, CheckCircle, XCircle, Clock, Filter, Search,
  Calendar, ClipboardList, ChevronDown, Building2
} from 'lucide-react';

const ACTION_META = {
  shoot_added:      { icon: Camera,       color: '#6dc76d', bg: 'rgba(109,199,109,0.1)', label: 'Added Shoot' },
  shoot_updated:    { icon: Camera,       color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', label: 'Updated Shoot' },
  shoot_deleted:    { icon: Camera,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Shoot' },
  task_added:       { icon: CheckSquare,  color: '#6dc76d', bg: 'rgba(109,199,109,0.1)', label: 'Added Task' },
  task_updated:     { icon: CheckSquare,  color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', label: 'Updated Task' },
  task_completed:   { icon: CheckCircle,  color: '#6dc76d', bg: 'rgba(109,199,109,0.15)', label: 'Completed Task' },
  task_deleted:     { icon: Trash2,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Task' },
  project_added:    { icon: FolderOpen,   color: '#6dc76d', bg: 'rgba(109,199,109,0.1)', label: 'Added Project' },
  project_updated:  { icon: FolderOpen,   color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', label: 'Updated Project' },
  project_deleted:  { icon: Trash2,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Project' },
  client_added:     { icon: Building2,    color: '#6dc76d', bg: 'rgba(109,199,109,0.1)', label: 'Added Client' },
  client_deleted:   { icon: Trash2,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Client' },
  booking_approved: { icon: CheckCircle,  color: '#6dc76d', bg: 'rgba(109,199,109,0.15)', label: 'Approved Booking' },
  booking_rejected: { icon: XCircle,      color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Rejected Booking' },
  booking_deleted:  { icon: Trash2,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Booking' },
  member_added:     { icon: Users,        color: '#6dc76d', bg: 'rgba(109,199,109,0.1)', label: 'Added Member' },
  member_updated:   { icon: Users,        color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', label: 'Updated Member' },
  member_deleted:   { icon: Trash2,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', label: 'Deleted Member' },
  date_marked:      { icon: Calendar,     color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', label: 'Marked Date' },
};

const CATEGORIES = [
  { id: 'all', label: 'All Activity' },
  { id: 'shoot', label: 'Shoots' },
  { id: 'task', label: 'Tasks' },
  { id: 'booking', label: 'Bookings' },
  { id: 'project', label: 'Projects' },
  { id: 'member', label: 'Team' },
];

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fullDate(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function MemberAvatar({ name, role }) {
  const colors = ['#083f3e', '#2d6a4f', '#1b4332', '#0d3b2e', '#145a32'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '#083f3e';
  return (
    <div className="page-activity" style={{
      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, #c9a96e)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne', fontWeight: '800', fontSize: '14px', color: '#f0ede8',
      border: role === 'admin' ? '2px solid #c9a96e' : '2px solid rgba(240,237,232,0.1)',
    }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

export default function ActivityPage() {
  const { activityLog, team, currentUser, clearActivityLog } = useApp();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [showClear, setShowClear] = useState(false);

  const filtered = useMemo(() => {
    let logs = [...activityLog].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    if (category !== 'all') logs = logs.filter(l => l.action.startsWith(category));
    if (memberFilter !== 'all') logs = logs.filter(l => String(l.userId) === String(memberFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      logs = logs.filter(l => l.message.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q));
    }
    return logs;
  }, [activityLog, category, memberFilter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(log => {
      const d = new Date(log.ts);
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return Object.entries(groups);
  }, [filtered]);

  // Stats
  const todayLogs = activityLog.filter(l => {
    const d = new Date(l.ts);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  });
  const memberActivity = team.reduce((acc, m) => {
    acc[m.id] = activityLog.filter(l => String(l.userId) === String(m.id)).length;
    return acc;
  }, {});
  const mostActive = team.slice().sort((a, b) => (memberActivity[b.id] || 0) - (memberActivity[a.id] || 0)).slice(0, 3);

  return (
    <div style={{ padding: '28px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>Activity Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Track every action taken by team members</p>
        </div>
        {currentUser?.role === 'admin' && activityLog.length > 0 && (
          <button onClick={() => setShowClear(true)} style={{
            background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
            borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#ff6b6b',
            fontSize: '12px', fontFamily: 'DM Sans', display: 'flex', alignItems: 'center', gap: '6px'
          }}><Trash2 size={13}/> Clear Log</button>
        )}
      </div>

      {/* Top stats + most active */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Actions', value: activityLog.length, sub: 'all time' },
          { label: 'Today', value: todayLogs.length, sub: 'actions today' },
          { label: 'This Week', value: activityLog.filter(l => Date.now() - new Date(l.ts) < 7*86400000).length, sub: 'last 7 days' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '28px', fontWeight: '700', color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginTop: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{s.sub}</div>
          </div>
        ))}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne', marginBottom: '12px' }}>Most Active</div>
          {mostActive.filter(m => memberActivity[m.id] > 0).length === 0
            ? <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No activity yet</p>
            : mostActive.filter(m => memberActivity[m.id] > 0).map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '10px' : 0 }}>
                <MemberAvatar name={m.name} role={m.role} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{memberActivity[m.id]} action{memberActivity[m.id] !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? '#c9a96e' : i === 1 ? '#888' : '#6c4a1a', flexShrink: 0 }} />
              </div>
            ))
          }
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity..." className="input" style={{ paddingLeft: '34px', height: '36px', fontSize: '13px' }} />
        </div>
        {/* Member filter */}
        <div style={{ position: 'relative' }}>
          <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} className="input" style={{ height: '36px', fontSize: '12px', paddingRight: '28px', appearance: 'none', cursor: 'pointer' }}>
            <option value="all">All Members</option>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding: '6px 13px', borderRadius: '20px', border: '1px solid',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Syne',
              background: category === c.id ? 'var(--accent)' : 'var(--surface2)',
              borderColor: category === c.id ? 'var(--accent)' : 'var(--border)',
              color: category === c.id ? '#1a1008' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      {grouped.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Activity size={36} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '14px' }}>{activityLog.length === 0 ? 'No activity logged yet. Actions by team members will appear here.' : 'No results match your filters.'}</p>
        </div>
      ) : (
        <div>
          {grouped.map(([dateLabel, logs]) => (
            <div key={dateLabel} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontFamily: 'Syne', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{dateLabel}</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{logs.length} action{logs.length !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map(log => {
                  const meta = ACTION_META[log.action] || { icon: Activity, color: 'var(--text-muted)', bg: 'var(--surface2)', label: log.action };
                  const Icon = meta.icon;
                  const member = team.find(m => String(m.id) === String(log.userId));
                  return (
                    <div key={log.id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '10px', borderLeft: `3px solid ${meta.color}`,
                      transition: 'background 0.15s',
                    }}>
                      {/* Action icon */}
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                        background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={15} color={meta.color} />
                      </div>
                      {/* Message */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{log.userName}</span>
                          {' '}{log.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{fullDate(log.ts)}</div>
                      </div>
                      {/* Member avatar */}
                      {member && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <MemberAvatar name={member.name} role={member.role} />
                          <div style={{ display: 'none' }}>{member.title}</div>
                        </div>
                      )}
                      {/* Time ago badge */}
                      <span style={{
                        fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0,
                        background: 'var(--surface2)', padding: '3px 9px', borderRadius: '12px',
                        border: '1px solid var(--border)', whiteSpace: 'nowrap',
                      }}>{timeAgo(log.ts)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm clear modal */}
      {showClear && (
        <div className="modal-overlay" onClick={() => setShowClear(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '10px' }}>Clear Activity Log?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>This will permanently delete all logged activity. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowClear(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => { clearActivityLog(); setShowClear(false); }}><Trash2 size={13}/> Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
