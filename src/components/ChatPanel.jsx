import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Paperclip, X, Download, FileText, Image as ImageIcon, Tag, AtSign } from 'lucide-react';
import { supabase } from '../supabase';

function FilePreview({ fileUrl, fileName, fileType }) {
  const isImage = fileType?.startsWith('image/');
  return (
    <a href={fileUrl} target="_blank" rel="noopener noreferrer"
      style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'rgba(201,169,110,0.08)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'8px', textDecoration:'none', marginTop:'6px', maxWidth:'240px' }}>
      {isImage ? <ImageIcon size={14} color="#c9a96e"/> : <FileText size={14} color="#c9a96e"/>}
      <span style={{ fontSize:'12px', color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{fileName}</span>
      <Download size={12} color="var(--text-muted)"/>
    </a>
  );
}

function Message({ msg, isOwn }) {
  const time = new Date(msg.created_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  return (
    <div style={{ display:'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap:'8px', alignItems:'flex-end', marginBottom:'12px' }}>
      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: isOwn ? 'linear-gradient(135deg,#083f3e,#c9a96e)' : 'linear-gradient(135deg,#353535,#555)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', color:'white', flexShrink:0, fontFamily:'Syne' }}>
        {msg.sender_name?.charAt(0)}
      </div>
      <div style={{ maxWidth:'70%' }}>
        {!isOwn && <div style={{ fontSize:'10px', color:'var(--text-muted)', marginBottom:'3px', fontWeight:'600' }}>{msg.sender_name} {msg.sender_type === 'client' && <span style={{ color:'var(--accent)', fontSize:'9px' }}>• CLIENT</span>}</div>}
        {msg.content && (
          <div style={{ padding:'9px 13px', borderRadius: isOwn ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: isOwn ? '#083f3e' : 'var(--surface2)', border:'1px solid var(--border)', fontSize:'13px', color:'var(--text)', lineHeight:'1.5', wordBreak:'break-word' }}>
            {msg.content}
          </div>
        )}
        {msg.file_url && <FilePreview fileUrl={msg.file_url} fileName={msg.file_name} fileType={msg.file_type} />}
        <div style={{ fontSize:'10px', color:'var(--text-dim)', marginTop:'3px', textAlign: isOwn ? 'right' : 'left' }}>{time}</div>
      </div>
    </div>
  );
}

export default function ChatPanel({ roomType, roomId, roomLabel, currentUser, clientUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const sender = currentUser || clientUser;
  const senderId = String(sender?.id);
  const senderName = currentUser ? currentUser.name : clientUser?.companyName || clientUser?.name;
  const senderType = currentUser ? 'team' : 'client';

  useEffect(() => {
    loadMessages();
    const sub = supabase.channel(`chat-${roomType}-${roomId}`)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`room_id=eq.${roomId}` }, (payload) => {
        setMessages(p => [...p, payload.new]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('messages')
      .select('*')
      .eq('room_type', roomType)
      .eq('room_id', String(roomId))
      .order('created_at', { ascending: true })
      .limit(100);
    if (data) setMessages(data);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
  };

  const send = async () => {
    if (!text.trim() && !uploading) return;
    const content = text.trim();
    setText('');
    await supabase.from('messages').insert([{
      room_type: roomType, room_id: String(roomId),
      sender_id: senderId, sender_name: senderName, sender_type: senderType,
      content: content || null,
    }]);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${roomType}/${roomId}/${Date.now()}.${ext}`;
    const { data: uploadData, error } = await supabase.storage.from('chat-files').upload(path, file, { upsert: true });
    if (error) { console.error('upload error:', error); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path);
    await supabase.from('messages').insert([{
      room_type: roomType, room_id: String(roomId),
      sender_id: senderId, sender_name: senderName, sender_type: senderType,
      content: null, file_url: urlData.publicUrl, file_name: file.name, file_type: file.type,
    }]);
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:'300px' }}>
      {/* Header */}
      {roomLabel && (
        <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', fontFamily:'Syne', textTransform:'uppercase', letterSpacing:'0.06em' }}>
          💬 {roomLabel}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', minHeight:'200px' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'12px', padding:'20px' }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--text-dim)', fontSize:'12px', padding:'20px' }}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map(msg => (
            <Message key={msg.id} msg={msg} isOwn={String(msg.sender_id) === senderId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:'8px', alignItems:'flex-end' }}>
        <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'var(--text-muted)' }}>
          <Paperclip size={14}/>
        </button>
        <input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder={uploading ? 'Uploading file...' : 'Type a message...'}
          disabled={uploading}
          style={{ flex:1, padding:'8px 12px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', fontSize:'13px', fontFamily:'DM Sans', outline:'none', resize:'none' }}
        />
        <button onClick={send} disabled={!text.trim() && !uploading} style={{ background:'var(--accent)', border:'none', borderRadius:'8px', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, opacity: text.trim() ? 1 : 0.5 }}>
          <Send size={14} color="#1a1008"/>
        </button>
      </div>
    </div>
  );
}
