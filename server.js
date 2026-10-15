import express from 'express';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => res.send('LinkGrab Backend Running OK!'));

app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL missing' });
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      noPlaylist: true
    });
    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration_string,
      uploader: info.uploader
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Failed to fetch info' });
  }
});

app.post('/api/download-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL missing' });
  try {
    const result = await youtubedl(url, {
      getUrl: true,
      format: 'best',
      noCheckCertificates: true,
      noWarnings: true
    });
    const directUrl = result.stdout?.trim().split('\n').pop();
    res.json({ url: directUrl });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Failed' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server on ' + PORT));
