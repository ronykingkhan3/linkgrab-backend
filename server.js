import express from 'express';
import cors from 'cors';
import { ytDlpExec } from 'yt-dlp-exec';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('LinkGrab Backend is Running OK!');
});

app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL missing' });
  try {
    const info = await ytDlpExec(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      noPlaylist: true,
    });
    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration_string,
      uploader: info.uploader
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch info' });
  }
});

app.post('/api/download-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL missing' });
  try {
    const result = await ytDlpExec(url, {
      getUrl: true,
      format: 'best',
      noCheckCertificates: true,
      noWarnings: true
    });
    const directUrl = (result.stdout || '').trim().split('\n').pop();
    res.json({ url: directUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to get download url' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
