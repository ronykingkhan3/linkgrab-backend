import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LinkGrab - Rony King Khan</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-[#0a0a1f] text-white min-h-screen p-4"><div class="max-w-3xl mx-auto"><h1 class="text-3xl font-bold text-center mt-8">LinkGrab <span class="text-purple-400">Universal</span></h1><p class="text-center text-gray-400">Developed by Rony King Khan</p><div class="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-6 mt-8"><input id="url" placeholder="Paste YouTube link - youtu.be or youtube.com" class="w-full p-3 rounded-xl bg-[#101030] border border-gray-700 text-white"><button onclick="go()" id="btn" class="w-full mt-4 bg-purple-600 p-3 rounded-xl font-bold">Download</button><p id="status" class="mt-3 text-sm text-gray-300"></p><div id="result" class="mt-4"></div></div><div class="text-center mt-6 text-xs text-gray-500">YouTube Share link + Address bar link both work now</div></div><script>async function go(){const url=document.getElementById('url').value.trim();const status=document.getElementById('status');const result=document.getElementById('result');const btn=document.getElementById('btn');if(!url){status.textContent='Link paste koro';return;}btn.textContent='Loading...';status.textContent='Fetching...';try{const info=await fetch('/api/info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})}).then(r=>r.json());result.innerHTML='<h3 class="font-bold mt-2">'+(info.title||'Video')+'</h3><img src="'+(info.thumbnail_url||'')+'" class="rounded-xl w-full mt-2">';status.textContent='Getting download links...';const dl=await fetch('/api/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})}).then(r=>r.json());if(dl.error){status.textContent='Error: '+dl.error;return;}let html='<div class="mt-3 space-y-2">';dl.formats.slice(0,6).forEach(f=>{html+='<div class="flex justify-between bg-[#101030] p-3 rounded-xl"><span>'+f.quality+'</span><a href="'+f.url+'" target="_blank" class="bg-purple-600 px-4 py-1 rounded-lg">Download</a></div>'});html+='</div>';result.innerHTML+=html;status.textContent='Ready!';}catch(e){status.textContent='Failed: '+e.message;}finally{btn.textContent='Download';}}</script></body></html>`;

app.get('/', (req,res)=> res.send(HTML));
app.post('/api/info', async (req,res)=>{
  try{
    const {url} = req.body;
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const j = await r.json();
    res.json(j);
  }catch(e){ res.json({title:'YouTube Video'}) }
});
app.post('/api/download', async (req,res)=>{
  try{
    const {url} = req.body;
    const videoId = url.match(/(?:youtu\\.be\\/|v=)([A-Za-z0-9_-]{11})/)?.[1];
    if(!videoId) return res.status(400).json({error:'Invalid YouTube ID'});
    const piped = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`, {headers:{'User-Agent':'Mozilla/5.0'}});
    const data = await piped.json();
    if(!data.videoStreams) return res.status(500).json({error:'Video not found'});
    const formats = data.videoStreams.filter(s=>s.mimeType.includes('mp4')).map(s=>({quality:s.quality, url:s.url}));
    res.json({formats, title:data.title});
  }catch(e){ res.status(500).json({error:e.message}) }
});

export default app;
