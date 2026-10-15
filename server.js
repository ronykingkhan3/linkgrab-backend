import express from 'express';
import cors from 'cors';
import ytDlpExec from 'yt-dlp-exec';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req,res)=> res.send('Backend OK'));

app.post('/api/info', async (req,res)=>{
  const {url} = req.body;
  try{
    const info = await ytDlpExec(url, {dumpSingleJson:true, noPlaylist:true, noWarnings:true});
    res.json({ title: info.title, thumbnail: info.thumbnail, duration: info.duration_string });
  }catch(e){
    res.status(500).json({error: 'Failed'});
  }
});

app.post('/api/download-url', async (req,res)=>{
  const {url} = req.body;
  try{
    const r = await ytDlpExec(url, {getUrl:true, format:'best'});
    res.json({url: (r.stdout||'').trim()});
  }catch(e){
    res.status(500).json({error: 'Failed'});
  }
});

app.listen(process.env.PORT||10000, ()=> console.log('Running'));
