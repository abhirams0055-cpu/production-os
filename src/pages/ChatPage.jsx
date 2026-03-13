import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatPanel from '../components/ChatPanel';
import { MessageSquare, Hash, User, Search, Bell, X, Send, ChevronDown } from 'lucide-react';

export default function ChatPage() {
  const { currentUser, team, tasks, bookings, clientAccounts, unreadMessages, clearUnread, setCurrentChatRoom, sendAlert } = useApp();
  const [activeRoom, setActiveRoom] = useState({ type:'general', id:'general', label:'General' });
  const [search, setSearch] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertTargets, setAlertTargets] = useState([]); // [] = all
  const [alertMode, setAlertMode] = useState('all'); // 'all' | 'select'
  const [alertSending, setAlertSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const openRoom = (room) => {
    setActiveRoom(room);
    setCurrentChatRoom(room.id);
    clearUnread(room.id);
  };

  useEffect(() => {
    setCurrentChatRoom(activeRoom.id);
    clearUnread(activeRoom.id);
    return () => setCurrentChatRoom(null);
  }, []);

  const taskRooms = tasks.map(t => ({ type:'task', id:String(t.id), label:`Task: ${t.title}`, sub: t.project || '' }));
  const bookingRooms = bookings.map(b => ({ type:'booking', id:String(b.id), label:`Booking: ${b.clientName}`, sub: b.preferredDate || '' }));
  const directRooms = currentUser?.role === 'admin'
    ? [
        ...team.filter(m => m.id !== currentUser.id).map(m => ({ type:'direct', id:`direct_team_${Math.min(currentUser.id, m.id)}_${Math.max(currentUser.id, m.id)}`, label:m.name, sub:m.title, avatar:m.name })),
        ...clientAccounts.map(c => ({ type:'direct', id:`direct_client_${c.id}`, label:c.companyName, sub:'Client', avatar:c.companyName, isClient:true })),
      ]
    : [{ type:'direct', id:`direct_team_${Math.min(currentUser.id,1)}_${Math.max(currentUser.id,1)}`, label:'Aaram (Admin)', sub:'Admin', avatar:'A' }];

  const allRooms = [
    { type:'general', id:'general', label:'General', sub:'Team-wide channel', isSpecial:true },
    ...taskRooms, ...bookingRooms, ...directRooms,
  ];
  const filtered = allRooms.filter(r => r.label.toLowerCase().includes(search.toLowerCase()));
  const roomCategories = [
    { label:'Channels', rooms: filtered.filter(r => r.type === 'general') },
    { label:'Tasks', rooms: filtered.filter(r => r.type === 'task') },
    { label:'Bookings', rooms: filtered.filter(r => r.type === 'booking') },
    { label:'Direct Messages', rooms: filtered.filter(r => r.type === 'direct') },
  ].filter(c => c.rooms.length > 0);

  const roomIcon = (type) => {
    if (type === 'general') return <Hash size={13}/>;
    if (type === 'task') return <span style={{ fontSize:'11px' }}>✅</span>;
    if (type === 'booking') return <span style={{ fontSize:'11px' }}>📅</span>;
    return <User size={13}/>;
  };

  const otherMembers = team.filter(m => m.id !== currentUser?.id);

  const toggleTarget = (id) => {
    setAlertTargets(p => p.includes(String(id)) ? p.filter(x => x !== String(id)) : [...p, String(id)]);
  };

  const handleSendAlert = async () => {
    if (!alertMsg.trim()) return;
    setAlertSending(true);
    const targets = alertMode === 'all' ? [] : alertTargets;
    await sendAlert({ message: alertMsg.trim(), targets });
    setAlertSending(false);
    setAlertSent(true);
    setTimeout(() => {
      setShowAlertModal(false);
      setAlertSent(false);
      setAlertMsg('');
      setAlertTargets([]);
      setAlertMode('all');
    }, 1800);
  };

  return (
    <div style={{ display:'flex', height:'calc(100vh - 0px)', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:'260px', flexShrink:0, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--surface)', overflowY:'auto' }}>
        <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <h2 style={{ fontSize:'16px', fontWeight:'800' }}>Chat</h2>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setShowAlertModal(true)}
                title="Send Alert"
                style={{
                  background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.3)',
                  borderRadius:'8px', padding:'5px 10px', cursor:'pointer', color:'#ff5050',
                  display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', fontWeight:'700',
                  fontFamily:'Syne', transition:'all 0.15s'
                }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(255,80,80,0.22)'; }}
                onMouseOut={e => { e.currentTarget.style.background='rgba(255,80,80,0.12)'; }}
              >
                <Bell size={12}/> Alert
              </button>
            )}
          </div>
          <div style={{ position:'relative' }}>
            <Search size={12} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rooms..." className="input" style={{ paddingLeft:'30px', height:'32px', fontSize:'12px' }}/>
          </div>
        </div>

        <div style={{ flex:1, padding:'8px 0' }}>
          {roomCategories.map(cat => (
            <div key={cat.label}>
              <div style={{ padding:'10px 16px 4px', fontSize:'10px', fontWeight:'700', color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'Syne' }}>{cat.label}</div>
              {cat.rooms.map(room => {
                const isActive = activeRoom.id === room.id;
                return (
                  <button key={room.id} onClick={() => openRoom(room)} style={{
                    width:'100%', textAlign:'left', padding:'8px 16px', border:'none', cursor:'pointer',
                    background: isActive ? 'rgba(201,169,110,0.12)' : 'none',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    display:'flex', alignItems:'center', gap:'10px', transition:'all 0.1s',
                  }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'8px', background: isActive ? 'rgba(201,169,110,0.2)' : 'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', color: isActive ? 'var(--accent)' : 'var(--text-muted)', flexShrink:0, fontSize:'13px', fontWeight:'700', fontFamily:'Syne' }}>
                      {room.avatar ? room.avatar.charAt(0) : roomIcon(room.type)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'13px', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--accent)' : 'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{room.label}</div>
                      {room.sub && <div style={{ fontSize:'10px', color:'var(--text-dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{room.sub}</div>}
                    </div>
                    {room.isClient && <span style={{ fontSize:'9px', background:'rgba(201,169,110,0.15)', color:'var(--accent)', padding:'2px 5px', borderRadius:'4px', fontFamily:'Syne', fontWeight:'700' }}>CLIENT</span>}
                    {unreadMessages[room.id] > 0 && (
                      <span style={{ background:'#ff4444', color:'white', borderRadius:'50%', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', flexShrink:0 }}>
                        {unreadMessages[room.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(201,169,110,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
            {roomIcon(activeRoom.type)}
          </div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:'700' }}>{activeRoom.label}</div>
            {activeRoom.sub && <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{activeRoom.sub}</div>}
          </div>
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          <ChatPanel key={activeRoom.id} roomType={activeRoom.type} roomId={activeRoom.id} currentUser={currentUser} />
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div className="card" style={{ width:'100%', maxWidth:'480px', border:'1px solid rgba(255,80,80,0.3)', padding:'28px' }}>
            {alertSent ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>🚨</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#ff5050' }}>Alert Sent!</div>
                <div style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'6px' }}>All selected members have been notified.</div>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'36px', height:'36px', background:'rgba(255,80,80,0.12)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Bell size={18} color="#ff5050" />
                    </div>
                    <div>
                      <div style={{ fontSize:'16px', fontWeight:'800' }}>Send Alert</div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>Triggers a loud ring on their device</div>
                    </div>
                  </div>
                  <button onClick={() => setShowAlertModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px' }}><X size={18}/></button>
                </div>

                {/* Message */}
                <div style={{ marginBottom:'16px' }}>
                  <label className="label">Alert Message</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. Urgent meeting in 5 mins! Check your phone."
                    value={alertMsg}
                    onChange={e => setAlertMsg(e.target.value)}
                    style={{ resize:'none' }}
                    autoFocus
                  />
                </div>

                {/* Target */}
                <div style={{ marginBottom:'20px' }}>
                  <label className="label">Send To</label>
                  <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
                    {[['all','🔔 All Members'],['select','👤 Select Members']].map(([val, label]) => (
                      <button key={val} onClick={() => { setAlertMode(val); setAlertTargets([]); }} style={{
                        flex:1, padding:'9px', borderRadius:'8px', border:'1px solid',
                        background: alertMode === val ? 'rgba(255,80,80,0.15)' : 'var(--surface2)',
                        borderColor: alertMode === val ? 'rgba(255,80,80,0.5)' : 'var(--border)',
                        color: alertMode === val ? '#ff5050' : 'var(--text-muted)',
                        fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'DM Sans'
                      }}>{label}</button>
                    ))}
                  </div>

                  {alertMode === 'select' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'180px', overflowY:'auto', padding:'4px 0' }}>
                      {otherMembers.map(m => {
                        const selected = alertTargets.includes(String(m.id));
                        return (
                          <button key={m.id} onClick={() => toggleTarget(m.id)} style={{
                            display:'flex', alignItems:'center', gap:'10px', padding:'8px 12px',
                            borderRadius:'8px', border:'1px solid',
                            background: selected ? 'rgba(255,80,80,0.1)' : 'var(--surface2)',
                            borderColor: selected ? 'rgba(255,80,80,0.4)' : 'var(--border)',
                            cursor:'pointer', textAlign:'left', transition:'all 0.1s'
                          }}>
                            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background: selected ? 'rgba(255,80,80,0.2)' : 'var(--surface)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', fontFamily:'Syne', color: selected ? '#ff5050' : 'var(--text-muted)', flexShrink:0 }}>
                              {m.name.charAt(0)}
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:'13px', fontWeight:'600', color: selected ? '#ff5050' : 'var(--text)' }}>{m.name}</div>
                              <div style={{ fontSize:'11px', color:'var(--text-dim)' }}>{m.title}</div>
                            </div>
                            <div style={{ width:'16px', height:'16px', borderRadius:'4px', border:`2px solid ${selected ? '#ff5050' : 'var(--border)'}`, background: selected ? '#ff5050' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              {selected && <span style={{ color:'white', fontSize:'10px', fontWeight:'800' }}>✓</span>}
                            </div>
                          </button>
                        );
                      })}
                      {alertTargets.length > 0 && (
                        <div style={{ fontSize:'11px', color:'var(--text-muted)', textAlign:'center', marginTop:'4px' }}>
                          {alertTargets.length} member{alertTargets.length !== 1 ? 's' : ''} selected
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendAlert}
                  disabled={alertSending || !alertMsg.trim() || (alertMode === 'select' && alertTargets.length === 0)}
                  style={{
                    width:'100%', padding:'13px', borderRadius:'10px', border:'none',
                    background: (!alertMsg.trim() || (alertMode === 'select' && alertTargets.length === 0)) ? 'var(--surface2)' : 'linear-gradient(135deg, #ff5050, #cc2200)',
                    color: (!alertMsg.trim() || (alertMode === 'select' && alertTargets.length === 0)) ? 'var(--text-dim)' : 'white',
                    fontSize:'14px', fontWeight:'700', cursor: alertSending ? 'wait' : 'pointer',
                    fontFamily:'DM Sans', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    transition:'all 0.15s'
                  }}
                >
                  <Bell size={15}/>
                  {alertSending ? 'Sending...' : alertMode === 'all' ? 'Ring All Members' : `Ring ${alertTargets.length} Member${alertTargets.length !== 1 ? 's' : ''}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
