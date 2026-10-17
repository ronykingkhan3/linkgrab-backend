export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const urlPath = req.url;

  // Home Page - UI
  if (urlPath === '/' || urlPath === '/api/index.js' || req.method === 'GET') {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LinkGrab - Rony King Khan</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0a0a1f] text-white min-h-screen p-4"><div class="max-w-3xl mx-auto"><h1 class="text-3xl font-bold text-center mt-8">LinkGrab <span class="text-purple-400">Universal</span></h1><p class="text-center text-gray-400">Developed by Rony King Khan</p><div class="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 mt-8"><input id="url" placeholder="Paste YouTube link - youtu.be or youtube.com" class="w-full p-3 rounded-xl bg-[#101030] border border-gray-700 text-white"><button onclick="go()" id="btn" class="w-full mt-4 bg-purple-600 p-3 rounded-xl font-bold">Download</button><p id="status" class="mt-3 text-sm text-gray-300"></p><div id="result" class="mt-4"></div></div></div><script>async function go(){const u=document.getElementById('url').value.trim();const s=document.getElementById('status');const r=document.getElementById('result');const b=document.getElementById('btn');if(!u){s.textContent='Link dao';return;}b.textContent='Loading...';s.textContent='Fetching info...';try{const info=await fetch('/api/info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u})}).then(x=>x.json());r.innerHTML='<h3 class="font-bold">'+(info.title||'Video')+'</h3><img src="'+(info.thumbnail_url||'')+'" class="w-full rounded-xl mt-2">';s.textContent='Getting download links...';const dl=await fetch('/api/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u})}).then(x=>x.json());if(dl.error){s.textContent=dl.error;return;}let h='<div class="mt-3 space-y-2">';dl.formats.slice(0,6).forEach(f=>{h+='<div class="flex justify-between bg-[#101030] p-3 rounded-xl"><span>'+f.quality+'</span><a href="'+f.url+'" target="_blank" class="bg-purple-600 px-4 py-1 rounded-lg">Download</a></div>'});h+='</div>';r.innerHTML+=h;s.textContent='Ready!';}catch(e){s.textContent='Failed: '+e.message}finally{b.textContent='Download'}}<\/script></body></html>`;
    
    // If it's API call, handle below
    if (urlPath.startsWith('/api/info') || urlPath.startsWith('/api/download')) {
      // continue to API logic
    } else {
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
  }

  // API - Info
  if (urlPath.includes('/api/info')) {
    try {
      const {url} = req.body || JSON.parse(req.body || '{}');
      const resp = await fetch('https://noembed.com/embed?url='+encodeURIComponent(url));
      const data = await resp.json();
      return res.json(data);
    } catch(e){ return res.json({title:'YouTube Video'}) }
  }

  // API - Download - No more Failed to fetch!
  if (urlPath.includes('/api/download')) {
    try {
      let body = req.body;
      if(typeof body === 'string') body = JSON.parse(body);
      const {url} = body;
      const m = url.match(/(?:youtu\\.be\\/|v=)([A-Za-z0-9_-]{11})/);
      const id = m ? m[1] : null;
      if(!id) return res.status(400).json({error:'Invalid YouTube link. Use youtu.be or youtube.com/watch link'});
      
      const piped = await fetch('https://pipedapi.kavin.rocks/streams/'+id, {headers:{'User-Agent':'Mozilla/5.0'}});
      const data = await piped.json();
      if(!data.videoStreams) return res.status(500).json({error:'Video not found, try public video'});
      const formats = data.videoStreams.filter(s=>s.mimeType.includes('mp4')).map(s=>({quality:s.quality, url:s.url}));
      return res.json({formats, title:data.title, thumbnail:data.thumbnail});
    } catch(e){
      return res.status(500).json({error:e.message});
    }
  }

  res.status(404).json({error:'Not found'});
}
