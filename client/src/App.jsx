import { useState, useEffect } from 'react'

const API_URL = "http://localhost:5000"; // Замени на адрес после деплоя

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [tab, setTab] = useState('recs');
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ avatar: '', bio: '' });

  useEffect(() => {
    if (user) {
      const endpoint = tab === 'recs' ? `/recs/${user.username}` : `/posts`;
      fetch(API_URL + endpoint).then(r => r.json()).then(data => setPosts(data));
    }
  }, [tab, user]);

  if (!user) return <AuthScreen onAuth={setUser} />;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Top Bar */}
      <nav className="sticky top-0 bg-white border-b z-50 h-14 flex items-center justify-between px-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold tracking-tighter italic text-indigo-600">NEXUS</h1>
        <div className="flex gap-4">
            <button onClick={() => setTab('profile')} className="w-8 h-8 rounded-full overflow-hidden border">
                <img src={user.avatar} alt="me" />
            </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {tab === 'profile' ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex flex-col items-center gap-4">
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50" />
                <h2 className="text-2xl font-bold">@{user.username}</h2>
                <p className="text-gray-500 text-center italic">{user.bio || "Нет описания"}</p>
                
                {editing ? (
                    <div className="w-full space-y-3">
                        <input className="w-full border p-2 rounded" placeholder="Ссылка на аватарку" onChange={e => setProfileForm({...profileForm, avatar: e.target.value})} />
                        <textarea className="w-full border p-2 rounded" placeholder="О себе" onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                        <button onClick={async () => {
                            const res = await fetch(`${API_URL}/users/${user.username}`, {
                                method: 'PUT',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(profileForm)
                            });
                            const updated = await res.json();
                            setUser(updated);
                            localStorage.setItem('user', JSON.stringify(updated));
                            setEditing(false);
                        }} className="bg-indigo-600 text-white w-full py-2 rounded-lg">Сохранить</button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="bg-gray-100 px-6 py-2 rounded-lg font-medium text-sm">Редактировать профиль</button>
                )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <PostComposer user={user} onCreated={() => setTab('recs')} />
            {posts.map(p => <PostCard key={p._id} post={p} user={user} />)}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-white border-t h-16 flex justify-around items-center max-w-2xl left-1/2 -translate-x-1/2">
        <button onClick={() => setTab('recs')} className={tab === 'recs' ? 'text-indigo-600' : 'text-gray-400'}>🏠</button>
        <button onClick={() => setTab('messages')} className={tab === 'messages' ? 'text-indigo-600' : 'text-gray-400'}>💬</button>
        <button onClick={() => setTab('profile')} className={tab === 'profile' ? 'text-indigo-600' : 'text-gray-400'}>👤</button>
      </div>
    </div>
  )
}

function PostCard({ post, user }) {
    const [liked, setLiked] = useState(post.likes.includes(user.username));
    const [count, setCount] = useState(post.likes.length);

    const like = async () => {
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);
        await fetch(`${API_URL}/posts/${post._id}/like`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: user.username })
        });
    }

    return (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <span className="font-bold text-sm">@{post.author}</span>
            </div>
            
            <div className="px-4 pb-3 text-[15px]">{post.content}</div>

            {post.image && <img src={post.image} className="w-full object-cover max-h-96" />}
            
            {post.videoUrl && (
                <div className="aspect-video">
                    <iframe width="100%" height="100%" src={post.videoUrl} frameBorder="0" allowFullScreen></iframe>
                </div>
            )}

            <div className="p-4 flex gap-4">
                <button onClick={like} className="text-xl">{liked ? '❤️' : '🤍'} <span className="text-sm font-bold">{count}</span></button>
            </div>
        </div>
    )
}

function PostComposer({ user, onCreated }) {
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [isVid, setIsVid] = useState(false);

    const send = async () => {
        await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                username: user.username, 
                content: text, 
                image: !isVid ? url : '', 
                videoUrl: isVid ? url : '' 
            })
        });
        setText(''); setUrl(''); onCreated();
    }

    return (
        <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full outline-none text-lg" placeholder="Что происходит?" />
            <div className="flex gap-2">
                <input value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-gray-50 p-2 rounded-lg text-xs" placeholder={isVid ? "Ссылка на YouTube" : "Ссылка на фото"} />
                <button onClick={() => setIsVid(!isVid)} className="text-xs bg-gray-100 px-3 rounded-lg">{isVid ? '🎬' : '📷'}</button>
            </div>
            <button onClick={send} className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold shadow-lg shadow-indigo-100">Опубликовать</button>
        </div>
    )
}

// ... AuthScreen оставить из прошлых ответов, но сменить API_URL