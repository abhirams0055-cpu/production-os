import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';
import ChatPanel from '../components/ChatPanel';
import { MessageSquare, Hash, User, ChevronRight, Search, Bell } from 'lucide-react';

export default function ChatPage() {
  const { currentUser, team, tasks, bookings, clients, clientAccounts } = useApp();
  const [activeRoom, setActiveRoom] = useState({ type:'general', id:'general', label:'General' });
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState({});

  // Build room list
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
    ...taskRooms,
    ...bookingRooms,
    ...(currentUser?.role === 'admin' ? directRooms : directRooms),
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

  return (
    <div style={{ display:'flex', height:'calc(100vh - 0px)', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:'260px', flexShrink:0, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--surface)', overflowY:'auto' }}>
        <div style={{ padding:'20px 16px 12px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'800', marginBottom:'10px' }}>Chat</h2>
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
                  <button key={room.id} onClick={() => setActiveRoom(room)} style={{
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
          <ChatPanel
            key={activeRoom.id}
            roomType={activeRoom.type}
            roomId={activeRoom.id}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}
