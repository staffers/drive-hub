import { useState, useMemo } from "react";

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#C084FC','#34D399','#FB923C','#60A5FA'];

const TYPE_META = {
  Doc:    { icon: '📄', light: '#EEF2FF', accent: '#4F46E5' },
  Sheet:  { icon: '📊', light: '#F0FDF4', accent: '#16A34A' },
  Slides: { icon: '📑', light: '#FFF7ED', accent: '#EA580C' },
  Form:   { icon: '📋', light: '#FDF4FF', accent: '#9333EA' },
  Folder: { icon: '📁', light: '#FFFBEB', accent: '#D97706' },
};

const INIT_CLIENTS = [
  { id:'c1',  name:'Scape',             color:'#FF6B6B', initials:'SC' },
  { id:'c2',  name:'LIV Student',       color:'#4ECDC4', initials:'LV' },
  { id:'c3',  name:'Uncle',             color:'#45B7D1', initials:'UN' },
  { id:'c4',  name:'Canto Court',       color:'#FFA07A', initials:'CC' },
  { id:'c5',  name:'Ravenscourt House', color:'#C084FC', initials:'RH' },
  { id:'c6',  name:'Onward Living',     color:'#34D399', initials:'OL' },
  { id:'c7',  name:'Kudos Stairlifts',  color:'#FB923C', initials:'KS' },
  { id:'c8',  name:'Port Synthetics',   color:'#60A5FA', initials:'PS' },
  { id:'int', name:'Internal',          color:'#94A3B8', initials:'IN' },
];

const INIT_DOCS = [
  { id:'d1',  title:'Scape SEO Strategy 2025–26',       url:'https://docs.google.com', clientId:'c1',  category:'Strategy',   type:'Doc',    notes:'Core annual strategy doc',  pinned:true  },
  { id:'d2',  title:'Scape Monthly Reporting Sheet',    url:'https://docs.google.com', clientId:'c1',  category:'Reporting',  type:'Sheet',  notes:'Updated monthly',            pinned:false },
  { id:'d3',  title:'Scape Technical Audit Tracker',   url:'https://docs.google.com', clientId:'c1',  category:'Audit',      type:'Sheet',  notes:'',                           pinned:false },
  { id:'d4',  title:'LIV Student Keyword Research',    url:'https://docs.google.com', clientId:'c2',  category:'SEO',        type:'Sheet',  notes:'Sheffield + Bristol',         pinned:true  },
  { id:'d5',  title:'LIV Student 2026–27 Campaign',    url:'https://docs.google.com', clientId:'c2',  category:'Brand',      type:'Doc',    notes:'Banner campaign docs',        pinned:false },
  { id:'d6',  title:'Uncle SEO Audit',                 url:'https://docs.google.com', clientId:'c3',  category:'Audit',      type:'Doc',    notes:'',                           pinned:false },
  { id:'d7',  title:'Canto Court Strategy',            url:'https://docs.google.com', clientId:'c4',  category:'Strategy',   type:'Doc',    notes:'',                           pinned:false },
  { id:'d8',  title:'Ravenscourt House Keyword Plan',  url:'https://docs.google.com', clientId:'c5',  category:'SEO',        type:'Sheet',  notes:'',                           pinned:false },
  { id:'d9',  title:'Onward Living SEO Roadmap',       url:'https://docs.google.com', clientId:'c6',  category:'Strategy',   type:'Doc',    notes:'',                           pinned:false },
  { id:'d10', title:'Kudos Stairlifts Local SEO',      url:'https://docs.google.com', clientId:'c7',  category:'SEO',        type:'Doc',    notes:'',                           pinned:false },
  { id:'d11', title:'Port Synthetics Technical Audit', url:'https://docs.google.com', clientId:'c8',  category:'Audit',      type:'Doc',    notes:'',                           pinned:false },
  { id:'d12', title:'Client Report Template (Master)', url:'https://docs.google.com', clientId:'int', category:'Templates',  type:'Doc',    notes:'Use for all new clients',     pinned:true  },
  { id:'d13', title:'Stafferton SOPs & Processes',     url:'https://docs.google.com', clientId:'int', category:'Operations', type:'Doc',    notes:'Delegation + processes',      pinned:false },
  { id:'d14', title:'New Business Proposal Deck',      url:'https://docs.google.com', clientId:'int', category:'Templates',  type:'Slides', notes:'',                           pinned:false },
  { id:'d15', title:'Onboarding Questionnaire',        url:'https://docs.google.com', clientId:'int', category:'Templates',  type:'Form',   notes:'Send to all new clients',     pinned:false },
];

function uid() { return Math.random().toString(36).slice(2,9); }

const inp = (extra={}) => ({
  width:'100%', boxSizing:'border-box',
  border:'1.5px solid #E5E7EB', borderRadius:'8px',
  padding:'0.5rem 0.7rem', fontSize:'0.83rem',
  fontFamily:'DM Sans,sans-serif', outline:'none',
  color:'#111827', background:'white', ...extra,
});

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'0.9rem' }}>
      <label style={{ display:'block', fontSize:'0.65rem', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem' }}>{label}</label>
      {children}
    </div>
  );
}

function SmBtn({ onClick, bg, col, children }) {
  return (
    <button onClick={onClick} style={{ background:bg||'#F3F4F6', color:col||'#374151', border:'none', borderRadius:'6px', padding:'0.28rem 0.6rem', fontSize:'0.68rem', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
      {children}
    </button>
  );
}

function DocCard({ doc, client, admin, onEdit, onDelete, onPin }) {
  const meta = TYPE_META[doc.type] || TYPE_META.Doc;
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ background:'white', borderRadius:'10px', padding:'0.9rem', border:'1px solid #E5E7EB', display:'flex', flexDirection:'column', gap:'0.45rem', position:'relative', boxShadow: hov ? '0 4px 18px rgba(0,0,0,0.07)' : 'none', transition:'box-shadow 0.15s' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    >
      {doc.pinned && <span style={{ position:'absolute', top:'0.6rem', right:'0.6rem', fontSize:'11px' }}>📌</span>}
      <div style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
        <span style={{ fontSize:'15px', background:meta.light, borderRadius:'6px', padding:'0.22rem 0.32rem', lineHeight:1 }}>{meta.icon}</span>
        <span style={{ fontSize:'0.6rem', fontWeight:700, color:meta.accent, textTransform:'uppercase', letterSpacing:'0.07em' }}>{doc.type}</span>
      </div>
      <a href={doc.url} target="_blank" rel="noopener noreferrer"
        style={{ fontWeight:700, fontSize:'0.85rem', color:'#111827', textDecoration:'none', lineHeight:1.35, fontFamily:'Syne,sans-serif' }}>
        {doc.title}
      </a>
      {doc.notes && <p style={{ margin:0, fontSize:'0.7rem', color:'#9CA3AF', lineHeight:1.4 }}>{doc.notes}</p>}
      <div style={{ display:'flex', gap:'0.35rem', marginTop:'auto', paddingTop:'0.3rem', flexWrap:'wrap' }}>
        {client && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', background:client.color+'18', color:client.color, border:`1px solid ${client.color}33`, borderRadius:'20px', padding:'0.1rem 0.45rem', fontSize:'0.6rem', fontWeight:700 }}>
            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:client.color, display:'inline-block' }}/>
            {client.name}
          </span>
        )}
        <span style={{ background:'#F3F4F6', color:'#6B7280', borderRadius:'20px', padding:'0.1rem 0.45rem', fontSize:'0.6rem', fontWeight:500 }}>{doc.category}</span>
      </div>
      {admin && (
        <div style={{ display:'flex', gap:'0.35rem', borderTop:'1px solid #F3F4F6', paddingTop:'0.55rem', marginTop:'0.15rem' }}>
          <SmBtn onClick={()=>onEdit(doc)} bg="#EEF2FF" col="#4F46E5">Edit</SmBtn>
          <SmBtn onClick={()=>onPin(doc.id)} bg="#FFFBEB" col="#D97706">{doc.pinned?'Unpin':'Pin'}</SmBtn>
          <div style={{flex:1}}/>
          <SmBtn onClick={()=>onDelete(doc.id)} bg="#FEF2F2" col="#DC2626">Delete</SmBtn>
        </div>
      )}
    </div>
  );
}

function DocModal({ doc, clients, onSave, onClose }) {
  const blank = { title:'', url:'', clientId:clients[0]?.id||'', category:'', type:'Doc', notes:'', pinned:false };
  const [f, setF] = useState(doc || blank);
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  const valid = f.title.trim() && f.url.trim() && f.clientId && f.category.trim();
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem' }}>
      <div style={{ background:'white', borderRadius:'14px', padding:'1.4rem', width:'100%', maxWidth:'460px', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.1rem' }}>
          <h3 style={{ margin:0, fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700 }}>{doc?'Edit Doc':'Add Doc'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.4rem', lineHeight:1, cursor:'pointer', color:'#9CA3AF' }}>×</button>
        </div>
        <Field label="Title"><input style={inp()} value={f.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Scape SEO Strategy 2025" autoFocus/></Field>
        <Field label="Google Drive URL"><input style={inp()} value={f.url} onChange={e=>set('url',e.target.value)} placeholder="https://docs.google.com/..."/></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <Field label="Client">
            <select style={inp()} value={f.clientId} onChange={e=>set('clientId',e.target.value)}>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Type">
            <select style={inp()} value={f.type} onChange={e=>set('type',e.target.value)}>
              {['Doc','Sheet','Slides','Form','Folder'].map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Category"><input style={inp()} value={f.category} onChange={e=>set('category',e.target.value)} placeholder="Strategy, Reporting, SEO…"/></Field>
        <Field label="Notes (optional)"><textarea style={inp({ height:'60px', resize:'vertical' })} value={f.notes} onChange={e=>set('notes',e.target.value)}/></Field>
        <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.8rem', cursor:'pointer', marginBottom:'1.1rem', color:'#374151' }}>
          <input type="checkbox" checked={f.pinned} onChange={e=>set('pinned',e.target.checked)} style={{ accentColor:'#4F46E5' }}/>
          Pin to top of client view
        </label>
        <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
          <SmBtn onClick={onClose}>Cancel</SmBtn>
          <button onClick={()=>valid&&onSave(f)} disabled={!valid} style={{ background:valid?'#0F172A':'#E5E7EB', color:valid?'white':'#9CA3AF', border:'none', borderRadius:'8px', padding:'0.5rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:valid?'pointer':'default', fontFamily:'DM Sans,sans-serif' }}>
            {doc?'Save Changes':'Add Doc'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const initials = name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div style={{ background:'white', borderRadius:'14px', padding:'1.4rem', width:'100%', maxWidth:'340px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.1rem' }}>
          <h3 style={{ margin:0, fontFamily:'Syne,sans-serif', fontSize:'1rem', fontWeight:700 }}>Add Client</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.4rem', lineHeight:1, cursor:'pointer', color:'#9CA3AF' }}>×</button>
        </div>
        <Field label="Client Name"><input style={inp()} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Onward Living" autoFocus/></Field>
        <Field label="Colour">
          <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap' }}>
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{ width:'24px', height:'24px', borderRadius:'50%', background:c, border:color===c?'3px solid #0F172A':'3px solid transparent', cursor:'pointer', outline:'none' }}/>
            ))}
          </div>
        </Field>
        {name && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', background:'#F9FAFB', borderRadius:'8px', padding:'0.55rem', marginBottom:'1rem' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'7px', background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.72rem', fontFamily:'Syne,sans-serif', flexShrink:0 }}>
              {initials||'?'}
            </div>
            <span style={{ fontWeight:600, fontSize:'0.83rem', color:'#111827' }}>{name}</span>
          </div>
        )}
        <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
          <SmBtn onClick={onClose}>Cancel</SmBtn>
          <button onClick={()=>name.trim()&&onSave({id:uid(),name:name.trim(),color,initials:initials||name[0]?.toUpperCase()||'?'})} disabled={!name.trim()} style={{ background:name.trim()?'#0F172A':'#E5E7EB', color:name.trim()?'white':'#9CA3AF', border:'none', borderRadius:'8px', padding:'0.5rem 1.1rem', fontSize:'0.8rem', fontWeight:600, cursor:name.trim()?'pointer':'default', fontFamily:'DM Sans,sans-serif' }}>
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DocHub() {
  const [clients, setClients]     = useState(INIT_CLIENTS);
  const [docs, setDocs]           = useState(INIT_DOCS);
  const [selClient, setSelClient] = useState('all');
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [admin, setAdmin]         = useState(false);
  const [showDocM, setShowDocM]   = useState(false);
  const [editDoc, setEditDoc]     = useState(null);
  const [showCliM, setShowCliM]   = useState(false);
  const [toast, setToast]         = useState('');

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),2400); };

  const filtered = useMemo(() => docs.filter(d => {
    if (selClient !== 'all' && d.clientId !== selClient) return false;
    if (catFilter && d.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || (d.notes||'').toLowerCase().includes(q);
    }
    return true;
  }), [docs, selClient, search, catFilter]);

  const pinned   = filtered.filter(d => d.pinned);
  const unpinned = filtered.filter(d => !d.pinned);

  const categories = useMemo(() => {
    const src = selClient === 'all' ? docs : docs.filter(d=>d.clientId===selClient);
    return [...new Set(src.map(d=>d.category))].sort();
  }, [docs, selClient]);

  const clientCount = id => docs.filter(d=>d.clientId===id).length;

  function saveDoc(f) {
    if (editDoc) setDocs(ds=>ds.map(d=>d.id===editDoc.id?{...d,...f}:d));
    else setDocs(ds=>[...ds,{...f,id:uid()}]);
    setShowDocM(false); setEditDoc(null);
    showToast(editDoc ? 'Doc updated ✓' : 'Doc added ✓');
  }

  function deleteDoc(id) { setDocs(ds=>ds.filter(d=>d.id!==id)); showToast('Removed'); }
  function togglePin(id) { setDocs(ds=>ds.map(d=>d.id===id?{...d,pinned:!d.pinned}:d)); }
  function addClient(c) { setClients(cs=>[...cs,c]); setShowCliM(false); showToast(`${c.name} added ✓`); }

  function handleShare() {
    const cl = clients.find(c=>c.id===selClient);
    const slug = cl ? cl.name.toLowerCase().replace(/\s+/g,'-') : 'all';
    try { navigator.clipboard.writeText(`https://docs.stafferton.digital/share/${slug}?key=demo-token`); } catch(e){}
    showToast('Share link copied ✓');
  }

  const sBtn = id => ({
    width:'100%', textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between',
    background: selClient===id ? 'rgba(255,255,255,0.1)' : 'transparent',
    border:'none', borderRadius:'7px', padding:'0.38rem 0.55rem',
    color: selClient===id ? 'white' : '#94A3B8',
    fontFamily:'DM Sans,sans-serif', fontWeight: selClient===id?600:400,
    fontSize:'0.78rem', cursor:'pointer',
  });

  const pill = active => ({
    background: active ? '#0F172A' : '#F3F4F6', color: active ? 'white' : '#6B7280',
    border:'none', borderRadius:'20px', padding:'0.18rem 0.65rem',
    fontSize:'0.7rem', fontWeight: active?600:400, cursor:'pointer',
    fontFamily:'DM Sans,sans-serif',
  });

  const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(225px,1fr))', gap:'0.65rem', marginBottom:'0.4rem' };
  const sLabel = { fontSize:'0.6rem', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.45rem' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
        a:hover{opacity:0.8;}
        input:focus,select:focus,textarea:focus{border-color:#6366F1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.08);}
      `}</style>

      <div style={{ display:'flex', height:'100vh', fontFamily:'DM Sans,sans-serif', background:'#F8FAFC', overflow:'hidden' }}>

        <div style={{ width:'205px', flexShrink:0, background:'#0F172A', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'1rem 0.9rem 0.85rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'0.92rem', color:'white', letterSpacing:'-0.01em' }}>Stafferton</div>
            <div style={{ fontSize:'0.58rem', color:'#475569', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'2px' }}>Doc Hub</div>
          </div>
          <div style={{ padding:'0.55rem 0.55rem 0.15rem' }}>
            <button style={sBtn('all')} onClick={()=>{setSelClient('all');setCatFilter('');}}>
              <span style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
                <span style={{ fontSize:'11px' }}>📋</span> All Docs
              </span>
              <span style={{ fontSize:'0.6rem', color:'#475569', background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'1px 5px' }}>{docs.length}</span>
            </button>
          </div>
          <div style={{ padding:'0 0.55rem', overflowY:'auto', flex:1 }}>
            <div style={{ fontSize:'0.56rem', fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0.55rem 0.55rem 0.25rem' }}>Clients</div>
            {clients.map(c=>(
              <button key={c.id} style={sBtn(c.id)} onClick={()=>{setSelClient(c.id);setCatFilter('');}}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:c.color, flexShrink:0, display:'inline-block' }}/>
                  {c.name}
                </span>
                <span style={{ fontSize:'0.6rem', color:'#475569' }}>{clientCount(c.id)}</span>
              </button>
            ))}
          </div>
          <div style={{ padding:'0.65rem 0.55rem', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
            {admin && (
              <button onClick={()=>setShowCliM(true)} style={{ background:'rgba(255,255,255,0.05)', border:'none', borderRadius:'7px', padding:'0.4rem 0.6rem', color:'#94A3B8', fontSize:'0.72rem', cursor:'pointer', fontFamily:'DM Sans,sans-serif', textAlign:'left' }}>+ Add Client</button>
            )}
            <button onClick={()=>setAdmin(a=>!a)} style={{ background:admin?'rgba(79,70,229,0.2)':'rgba(255,255,255,0.04)', border:admin?'1px solid rgba(79,70,229,0.4)':'1px solid transparent', borderRadius:'7px', padding:'0.4rem 0.6rem', color:admin?'#A5B4FC':'#64748B', fontSize:'0.72rem', cursor:'pointer', fontFamily:'DM Sans,sans-serif', textAlign:'left', fontWeight:admin?600:400 }}>
              {admin ? '🔓 Admin mode on' : '🔒 Admin mode'}
            </button>
          </div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
          <div style={{ padding:'0.7rem 0.9rem', background:'white', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:'0.55rem', flexShrink:0 }}>
            <div style={{ flex:1, position:'relative' }}>
              <span style={{ position:'absolute', left:'0.65rem', top:'50%', transform:'translateY(-50%)', fontSize:'12px', pointerEvents:'none' }}>🔍</span>
              <input placeholder="Search docs, categories, notes…" value={search} onChange={e=>setSearch(e.target.value)} style={inp({ background:'#F8FAFC', borderColor:'#E5E7EB', paddingLeft:'1.9rem' })}/>
            </div>
            {selClient !== 'all' && (
              <button onClick={handleShare} style={{ background:'#F0FDF4', color:'#15803D', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'0.42rem 0.75rem', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>
                🔗 Share view
              </button>
            )}
            {admin && (
              <button onClick={()=>{setEditDoc(null);setShowDocM(true);}} style={{ background:'#0F172A', color:'white', border:'none', borderRadius:'8px', padding:'0.42rem 0.85rem', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>
                + Add Doc
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div style={{ padding:'0.45rem 0.9rem', background:'white', borderBottom:'1px solid #E5E7EB', display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
              <button style={pill(catFilter==='')} onClick={()=>setCatFilter('')}>All</button>
              {categories.map(cat=>(
                <button key={cat} style={pill(catFilter===cat)} onClick={()=>setCatFilter(catFilter===cat?'':cat)}>{cat}</button>
              ))}
            </div>
          )}

          <div style={{ padding:'0.5rem 0.9rem 0', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            {selClient !== 'all' && (() => { const cl = clients.find(c=>c.id===selClient); return cl ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.72rem', fontWeight:600, color:cl.color }}>
                <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:cl.color, display:'inline-block' }}/>
                {cl.name}
              </span>
            ) : null; })()}
            <span style={{ fontSize:'0.68rem', color:'#9CA3AF', marginLeft:'auto' }}>
              {filtered.length} doc{filtered.length!==1?'s':''}
              {(search||catFilter) ? ' (filtered)' : ''}
            </span>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'0.6rem 0.9rem 0.9rem' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#9CA3AF' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:'0.6rem' }}>📭</div>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'#6B7280', marginBottom:'0.2rem', fontSize:'0.95rem' }}>No docs found</div>
                <div style={{ fontSize:'0.75rem' }}>Try a different search or filter{admin?', or add a new doc':''}.</div>
              </div>
            )}
            {pinned.length > 0 && (
              <>
                <div style={sLabel}>📌 Pinned</div>
                <div style={grid}>
                  {pinned.map(doc=>(
                    <DocCard key={doc.id} doc={doc} client={clients.find(c=>c.id===doc.clientId)} admin={admin}
                      onEdit={d=>{setEditDoc(d);setShowDocM(true);}} onDelete={deleteDoc} onPin={togglePin}/>
                  ))}
                </div>
              </>
            )}
            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && <div style={{ ...sLabel, marginTop:'1rem' }}>All docs</div>}
                <div style={grid}>
                  {unpinned.map(doc=>(
                    <DocCard key={doc.id} doc={doc} client={clients.find(c=>c.id===doc.clientId)} admin={admin}
                      onEdit={d=>{setEditDoc(d);setShowDocM(true);}} onDelete={deleteDoc} onPin={togglePin}/>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDocM && <DocModal doc={editDoc} clients={clients} onSave={saveDoc} onClose={()=>{setShowDocM(false);setEditDoc(null);}}/>}
      {showCliM && <ClientModal onSave={addClient} onClose={()=>setShowCliM(false)}/>}

      {toast && (
        <div style={{ position:'fixed', bottom:'1.25rem', right:'1.25rem', background:'#111827', color:'white', padding:'0.6rem 1rem', borderRadius:'10px', fontSize:'0.8rem', fontWeight:500, fontFamily:'DM Sans,sans-serif', zIndex:300, boxShadow:'0 8px 24px rgba(0,0,0,0.18)', pointerEvents:'none' }}>
          {toast}
        </div>
      )}
    </>
  );
}
