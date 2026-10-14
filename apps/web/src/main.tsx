import React from 'react';
import { createRoot } from 'react-dom/client';
function App(){return <main style={{fontFamily:'system-ui',maxWidth:720,margin:'5rem auto',padding:20}}><h1>CrossStream Arena</h1><p>Twitch × Kick · 2–4 creators · shared multiplayer matches</p><p>Foundation scaffold. OAuth, lobby and gameplay are not implemented yet.</p></main>}
createRoot(document.getElementById('root')!).render(<App/>);
