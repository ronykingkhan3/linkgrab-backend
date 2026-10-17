import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/info', async (req,res)=>{
  const {url} = req.body;
  try{
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const j = await r.json();
    res.json(j);
  }catch(e){ res.json({title:'YouTube Video'}) }
});

app.post('/api/download', async (req,res)=>{
  const {url} = req.body;
  const videoId = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)?.[1];
  if(!videoId) return res.status(400).json({error:'Invalid ID'});
  
  // Server-side fetch - No CORS, No Failed to fetch
  const r = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
  const data = await r.json();
  const formats = data.videoStreams.filter(s=>s.mimeType.includes('mp4')).map(s=>({
    quality: s.quality, url: s.url
  }));
  res.json({formats, title: data.title, thumbnail: data.thumbnail});
});

export default app;
