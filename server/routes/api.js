import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Couple, Milestone, Gallery, Song, Reminder, LoveNote, Bucket } from '../models/Schema.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Multer for in-memory file uploads (max 200MB for audio files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max limit
});

// ── YouTube Cookie: Load from env var or fallback file ─────────────────────
let COOKIES_FILE = null;
try {
  COOKIES_FILE = join(tmpdir(), 'yt_cookies.txt');
  let cookieContent = process.env.YOUTUBE_COOKIES;

  if (!cookieContent) {
    const fallbackPath = join(__dirname, '../config/yt_cookies.txt');
    if (existsSync(fallbackPath)) {
      cookieContent = readFileSync(fallbackPath, 'utf8');
      console.log('\u2705 Đã load YouTube cookies từ file fallback');
    }
  } else {
    console.log('\u2705 Đã load YouTube cookies từ biến môi trường YOUTUBE_COOKIES');
  }

  if (cookieContent) {
    writeFileSync(COOKIES_FILE, cookieContent, 'utf8');
  } else {
    COOKIES_FILE = null;
    console.warn('\u26a0\ufe0f Không tìm thấy YOUTUBE_COOKIES!');
  }
} catch (e) {
  console.warn('\u26a0\ufe0f Lỗi ghi file YouTube cookies:', e.message);
  COOKIES_FILE = null;
}

// ── Multi-Provider YouTube Audio Extraction (Piped + Cobalt + Invidious) ──
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.lunar.icu',
  'https://api.piped.yt',
  'https://pipedapi-libre.kavin.rocks',
  'https://pipedapi.palvelin.org',
  'https://piped-api.garudalinux.org',
];

const COBALT_INSTANCES = [
  'https://api.cobalt.tools',
  'https://co.wuk.sh',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.flokinet.to',
  'https://invidious.drgns.space',
  'https://invidious.projectsegfau.lt',
  'https://invidious.eclipso.at',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
];

async function getYouTubeAudioStream(videoId) {
  // 1. Try Piped APIs (Fastest & most reliable open-source YouTube API)
  for (const instance of PIPED_INSTANCES) {
    try {
      console.log(`[Piped API] 🔍 Thử instance: ${instance}`);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);

      const resp = await fetch(`${instance}/streams/${videoId}`, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      });
      clearTimeout(timer);

      if (!resp.ok) { console.warn(`[Piped API] ${instance} returned ${resp.status}`); continue; }
      const data = await resp.json();

      const audioStreams = (data.audioStreams || [])
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioStreams.length > 0) {
        const best = audioStreams[0];
        console.log(`[Piped API] ✅ Lấy audio stream thành công từ ${instance} (bitrate=${best.bitrate})`);
        return {
          audioUrl: best.url,
          title: data.title || null,
          author: data.uploader || null,
        };
      }
    } catch (e) {
      console.warn(`[Piped API] ${instance} lỗi: ${e.message}`);
    }
  }

  // 2. Try Cobalt APIs (Direct audio downloader API)
  for (const instance of COBALT_INSTANCES) {
    try {
      console.log(`[Cobalt API] 🔍 Thử instance: ${instance}`);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);

      const resp = await fetch(instance, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          downloadMode: 'audio',
          audioFormat: 'mp3',
        }),
      });
      clearTimeout(timer);

      if (!resp.ok) { console.warn(`[Cobalt API] ${instance} returned ${resp.status}`); continue; }
      const data = await resp.json();

      if (data.url) {
        console.log(`[Cobalt API] ✅ Lấy audio stream thành công từ ${instance}`);
        return {
          audioUrl: data.url,
          title: data.filename || null,
          author: null,
        };
      }
    } catch (e) {
      console.warn(`[Cobalt API] ${instance} lỗi: ${e.message}`);
    }
  }

  // 3. Try Invidious APIs (Backup proxy instances)
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[Invidious API] 🔍 Thử instance: ${instance}`);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 7000);

      const apiResp = await fetch(
        `${instance}/api/v1/videos/${videoId}?fields=title,author,adaptiveFormats`,
        { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      clearTimeout(timer);

      if (!apiResp.ok) { console.warn(`[Invidious API] ${instance} returned ${apiResp.status}`); continue; }

      const data = await apiResp.json();
      if (data.error) continue;

      const audioStreams = (data.adaptiveFormats || [])
        .filter(f => f.type && f.type.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioStreams.length > 0) {
        const best = audioStreams[0];
        const proxyAudioUrl = `${instance}/latest_version?id=${videoId}&itag=${best.itag}&local=true`;
        console.log(`[Invidious API] ✅ Lấy audio stream thành công từ ${instance}`);
        return {
          audioUrl: proxyAudioUrl,
          title: data.title || null,
          author: data.author || null,
        };
      }
    } catch (e) {
      console.warn(`[Invidious API] ${instance} lỗi: ${e.message}`);
    }
  }

  return null;
}


const router = express.Router();

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'df8kdfa66',
  api_key: process.env.CLOUDINARY_API_KEY || '813361343442552',
  api_secret: process.env.CLOUDINARY_API_SECRET || '-sVl8_gkH3Me-bAG3kW2EEHCvjg',
});

// Seed Initial Data Helper if database collections are empty
const seedInitialDataIfNeeded = async () => {
  try {
    let couple = await Couple.findOne();
    if (!couple) {
      await Couple.create({});
    }

    const songCount = await Song.countDocuments();
    if (songCount === 0) {
      await Song.insertMany([
        { title: 'Một Đời (Single Version)', artist: '14 Casper ft. Bon', type: 'youtube', source: 'p0iXjM7rMh4', addedBy: 'Anh' },
        { title: 'Ánh Nắng Của Anh', artist: 'Đức Phúc', type: 'youtube', source: 'tH461rS9Cno', addedBy: 'Em' },
        { title: 'Perfect', artist: 'Ed Sheeran', type: 'audio', source: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', addedBy: 'Both' },
      ]);
    }

    const milestoneCount = await Milestone.countDocuments();
    if (milestoneCount === 0) {
      await Milestone.insertMany([
        { date: '2023-02-14', title: 'Lần Đầu Gặp Nhau', description: 'Tại quán cà phê góc phố nhỏ ngập tràn ánh nắng chiều. Nụ cười ấy làm anh ngơ ngẩn cả ngày.', category: 'Gặp gỡ', image: '/images/sunset.png', addedBy: 'Anh', icon: '✨' },
        { date: '2023-03-08', title: 'Chính Thức Yêu Nhau 💛', description: 'Dưới cơn mưa phùn nhẹ, em đã gật đầu đồng ý làm người yêu của anh. Lời hứa bên nhau mãi mãi.', category: 'Kỷ niệm', image: '/images/travel.png', addedBy: 'Both', icon: '💍' },
        { date: '2023-07-20', title: 'Chuyến Du Lịch Biển Đầu Tiên', description: 'Cùng nhau ngắm bình minh trên biển Đà Nẵng, nắm tay đi dạo trên cát mịn.', category: 'Du lịch', image: '/images/date.png', addedBy: 'Em', icon: '🌊' },
      ]);
    }

    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      await Gallery.insertMany([
        { url: '/images/sunset.png', caption: 'Hoàng hôn lãng mạn bên bãi biển 🌅', album: 'Du Lịch', date: '2023-07-20', addedBy: 'Anh', liked: true },
        { url: '/images/travel.png', caption: 'Bình minh ngắm núi cùng em 🌄', album: 'Du Lịch', date: '2023-08-15', addedBy: 'Em', liked: true },
        { url: '/images/date.png', caption: 'Bữa tối nến thơm kỷ niệm 100 ngày yêu 🍷', album: 'Hẹn Hò', date: '2023-05-25', addedBy: 'Both', liked: true },
      ]);
    }

    const reminderCount = await Reminder.countDocuments();
    if (reminderCount === 0) {
      await Reminder.insertMany([
        { date: '2026-08-25', time: '19:30', title: 'Hẹn hò ăn tối nến thơm lãng mạn 🍷', location: 'Nhà hàng Skyview 360', note: 'Nhớ mặc váy hồng em thích nhé!', remindDaysBefore: 1, addedBy: 'Anh' },
        { date: '2026-09-02', time: '08:00', title: 'Chuyến đi nghỉ dưỡng ngắn ngày 🌿', location: 'Homestay Đà Lạt', note: 'Chuẩn bị máy ảnh chụp thật nhiều hình đẹp', remindDaysBefore: 2, addedBy: 'Em' },
      ]);
    }

    const noteCount = await LoveNote.countDocuments();
    if (noteCount === 0) {
      await LoveNote.insertMany([
        { color: 'yellow', title: 'Lời nhắn mỗi buổi sáng ☀️', content: 'Chúc em một ngày làm việc thật vui vẻ và may mắn! Tối nay anh qua đón em đi ăn kem nhé 🍦', author: 'Anh', date: 'Hôm nay', isSecret: false },
        { color: 'pink', title: 'Yêu anh nhiều lắm 🌸', content: 'Cảm ơn anh vì luôn nhường nhịn và chăm sóc em từng chút một. Cùng nhau cố gắng nha!', author: 'Em', date: 'Hôm qua', isSecret: false },
        { color: 'purple', title: 'Thư bí mật gửi em 💌', content: 'Anh đã chuẩn bị một món quà bất ngờ nho nhỏ cho kỷ niệm sắp tới của chúng mình...', author: 'Anh', date: 'Mới gửi', isSecret: true },
      ]);
    }

    const bucketCount = await Bucket.countDocuments();
    if (bucketCount === 0) {
      await Bucket.insertMany([
        { title: 'Cùng ngắm bình minh trên đỉnh núi', completed: true, date: '2023-08-15' },
        { title: 'Đến Paris ngắm tháp Eiffel rực rỡ', completed: false },
        { title: 'Cùng nhau tự tay nấu bữa tối 5 món', completed: true, date: '2023-04-10' },
        { title: 'Đi ngắm tuyết rơi ở Hàn Quốc hoặc Nhật Bản', completed: false },
        { title: 'Cùng nuôi 1 chú mèo hoặc cún cưng', completed: true, date: '2024-01-05' },
        { title: 'Mặc đồ đôi đi dạo phố ban đêm', completed: true, date: '2023-06-01' },
        { title: 'Xây dựng ngôi nhà tràn ngập ánh nắng của riêng hai đứa', completed: false },
      ]);
    }
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
};

// GET All App Data — parallel queries for maximum speed
router.get('/all', async (req, res) => {
  try {
    await seedInitialDataIfNeeded();

    // Run all 7 DB queries in parallel (was sequential, causing slow first load!)
    const [couple, milestones, gallery, playlist, reminders, loveNotes, bucketList] =
      await Promise.all([
        Couple.findOne(),
        Milestone.find().sort({ createdAt: -1 }),
        Gallery.find().sort({ createdAt: -1 }),
        Song.find().sort({ createdAt: -1 }),
        Reminder.find().sort({ createdAt: -1 }),
        LoveNote.find().sort({ createdAt: -1 }),
        Bucket.find().sort({ createdAt: 1 }),
      ]);

    res.json({ couple, milestones, gallery, playlist, reminders, loveNotes, bucketList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Couple API
router.put('/couple', async (req, res) => {
  try {
    let couple = await Couple.findOne();
    if (!couple) {
      couple = new Couple(req.body);
    } else {
      Object.assign(couple, req.body);
    }
    await couple.save();
    res.json(couple);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cloudinary Image Upload API
router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'love_website',
      resource_type: 'auto',
    });

    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Direct MP3 File Upload API (Upload local audio file to Cloudinary & DB)
router.post('/songs/upload-mp3', (req, res, next) => {
  upload.single('audioFile')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File nhạc quá lớn. Dung lượng tối đa cho phép là 200MB!' });
      }
      return res.status(400).json({ error: `Lỗi tải file: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Chưa chọn file âm thanh nào (MP3/M4A/WAV...)' });
    }

    const { title, artist, addedBy } = req.body;
    const originalFileName = req.file.originalname;
    const cleanFileName = originalFileName.replace(/\.[^/.]+$/, '');
    const songTitle = title?.trim() || cleanFileName || 'Bài Hát Mới';
    const songArtist = artist?.trim() || 'Nhiều ca sĩ';

    console.log(`[MP3 Upload Log] 📤 Bắt đầu tải file "${originalFileName}" (${(req.file.size / 1024 / 1024).toFixed(2)} MB) lên Cloudinary...`);

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary uses 'video' format for audio files
          folder: 'love_website_audio',
          public_id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save to Database as HTML5 audio (enables 100% background audio!)
    const newSong = await Song.create({
      title: songTitle,
      artist: songArtist,
      type: 'audio',
      source: cloudinaryResult.secure_url,
      addedBy: addedBy || 'Both',
    });

    console.log(`[MP3 Upload Log] ✅ Tải bài hát thành công: "${songTitle}" -> ${cloudinaryResult.secure_url}`);

    res.status(201).json({
      success: true,
      song: newSong,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });
  } catch (err) {
    console.error('[MP3 Upload Error Log]:', err);
    res.status(500).json({ error: `Lỗi tải file MP3: ${err.message}` });
  }
});

// YouTube → MP3 → Cloudinary Converter API
// Uses Invidious (YouTube proxy) to bypass datacenter IP blocking on Render.
router.post('/songs/youtube-to-mp3', async (req, res) => {
  const { youtubeId, title, artist, addedBy } = req.body;
  if (!youtubeId) {
    return res.status(400).json({ error: 'Chưa cung cấp YouTube ID' });
  }

  // Clean YouTube ID (strip playlist params if any)
  const cleanId = youtubeId.split('&')[0].split('?')[0].trim();
  console.log(`[YouTube→MP3 Log] 🎵 Bắt đầu xử lý video ID: ${cleanId}`);

  try {
    // ── Step 1: Cloudinary dedup — skip if already converted ─────────────────────
    const cloudinaryPublicId = `love_website_audio/yt_${cleanId}`;
    try {
      const existing = await cloudinary.api.resource(cloudinaryPublicId, { resource_type: 'video' });
      console.log(`[YouTube→MP3 Log] ⚡ Cache hit trên Cloudinary: ${existing.secure_url}`);
      const newSong = await Song.create({
        title: title || `Video YouTube (${cleanId})`,
        artist: artist || 'YouTube Artist',
        type: 'audio', source: existing.secure_url,
        addedBy: addedBy || 'Both', originalYoutubeId: cleanId,
      });
      return res.status(201).json({ success: true, song: newSong, cloudinaryUrl: existing.secure_url, cached: true });
    } catch (_) { /* not cached, proceed */ }

    // ── Step 2: Get audio stream URL via multi-provider extractor ────────────
    console.log(`[YouTube→MP3 Log] 🔍 Lấy audio stream qua Piped/Cobalt/Invidious APIs...`);
    const streamResult = await getYouTubeAudioStream(cleanId);

    if (!streamResult) {
      return res.status(502).json({
        error: 'Tất cả các máy chủ trung gian (Piped/Cobalt/Invidious) đều bận. Vui lòng chọn tab "📁 Tải MP3" để chọn file nhạc từ máy tính/điện thoại!',
      });
    }

    const videoTitle  = title  || streamResult.title  || `Bài hát YouTube (${cleanId})`;
    const videoAuthor = artist || streamResult.author || 'YouTube Artist';
    console.log(`[YouTube→MP3 Log] 📌 Metadata: "${videoTitle}" - ${videoAuthor}`);

    // ── Step 3: Stream audio URL → Cloudinary ────────────────────────────────
    console.log(`[YouTube→MP3 Log] ⏳ Streaming audio → Cloudinary: ${streamResult.audioUrl}`);
    const cloudinaryResult = await new Promise(async (resolve, reject) => {
      try {
        const audioResp = await fetch(streamResult.audioUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
          },
        });

        if (!audioResp.ok) {
          return reject(new Error(`Máy chủ stream trả về lỗi HTTP ${audioResp.status}`));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video', // Cloudinary uses 'video' for audio files
            folder: 'love_website_audio',
            public_id: `yt_${cleanId}`,
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Convert Web ReadableStream (fetch API) to Node.js Readable for piping
        const nodeStream = Readable.fromWeb(audioResp.body);
        nodeStream.pipe(uploadStream);
        nodeStream.on('error', (err) => reject(new Error(`Stream error: ${err.message}`)));
      } catch (err) {
        reject(err);
      }
    });

    console.log(`[YouTube→MP3 Log] ✅ Upload Cloudinary thành công: ${cloudinaryResult.secure_url}`);

    // ── Step 4: Save to DB ──────────────────────────────────────────────────
    const newSong = await Song.create({
      title: videoTitle,
      artist: videoAuthor,
      type: 'audio',                        // HTML5 <audio> → background playback ✅
      source: cloudinaryResult.secure_url,  // Permanent Cloudinary URL
      addedBy: addedBy || 'Both',
      originalYoutubeId: cleanId,
    });

    res.status(201).json({
      success: true,
      song: newSong,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });

  } catch (err) {
    const errorMsg = err.message || err.toString();
    console.error(`[YouTube→MP3 Error Log] ❌ Lỗi chuyển đổi (ID: ${cleanId}):`, errorMsg);

    res.status(500).json({
      error: errorMsg.includes('tab "📁 Tải MP3"')
        ? errorMsg
        : `YouTube đã chặn IP Cloud của Render đối với video này. Vui lòng chọn tab "📁 Tải MP3" để chọn file nhạc từ máy tính/điện thoại (nhanh & 100% phát nền)!`,
      details: err.stderr || null,
    });
  }
});


// Songs API (Fix deletion bug)
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/songs', async (req, res) => {
  try {
    const newSong = await Song.create(req.body);
    res.status(201).json(newSong);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Song.findByIdAndDelete(id);
    const updatedSongs = await Song.find().sort({ createdAt: -1 });
    res.json({ message: 'Song deleted successfully', playlist: updatedSongs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time Dual Listening & Sync API Routes
router.post('/music/listening-status', async (req, res) => {
  try {
    const { role, songTitle, artist, source, type, isPlaying, songIndex, currentTime } = req.body;
    let couple = await Couple.findOne();
    if (!couple) couple = new Couple({});

    if (!couple.listeningState) couple.listeningState = {};
    
    const statusObj = {
      songTitle,
      artist,
      source,
      type,
      isPlaying,
      songIndex,
      currentTime: currentTime || 0,
      updatedAt: Date.now(),
    };

    if (role === 'user2') {
      couple.listeningState.user2 = statusObj;
    } else {
      couple.listeningState.user1 = statusObj;
    }

    couple.listeningState.lastUpdatedBy = role;
    couple.markModified('listeningState');
    await couple.save();

    res.json({ success: true, listeningState: couple.listeningState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/music/toggle-shared-mode', async (req, res) => {
  try {
    const { isSharedMode } = req.body;
    let couple = await Couple.findOne();
    if (couple) {
      if (!couple.listeningState) couple.listeningState = {};
      couple.listeningState.isSharedMode = isSharedMode;
      couple.markModified('listeningState');
      await couple.save();
    }
    res.json({ success: true, listeningState: couple.listeningState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/music/dedicate-song', async (req, res) => {
  try {
    let couple = await Couple.findOne();
    if (couple) {
      couple.dedicatedSong = {
        ...req.body,
        date: new Date().toLocaleDateString('vi-VN'),
      };
      await couple.save();
    }
    res.json({ success: true, dedicatedSong: couple.dedicatedSong });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/music/clear-dedicated', async (req, res) => {
  try {
    let couple = await Couple.findOne();
    if (couple) {
      couple.dedicatedSong = { title: '', artist: '', source: '', type: 'youtube', message: '', dedicatedBy: '', date: '' };
      await couple.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Milestones API
router.post('/milestones', async (req, res) => {
  try {
    const item = await Milestone.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/milestones/:id', async (req, res) => {
  try {
    await Milestone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gallery API
router.post('/gallery', async (req, res) => {
  try {
    const photo = await Gallery.create(req.body);
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (photo && photo.public_id) {
      await cloudinary.uploader.destroy(photo.public_id).catch(() => {});
    }
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/gallery/:id/like', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (photo) {
      photo.liked = !photo.liked;
      await photo.save();
    }
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reminders API
router.post('/reminders', async (req, res) => {
  try {
    const reminder = await Reminder.create(req.body);
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/reminders/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Love Notes API
router.post('/notes', async (req, res) => {
  try {
    const note = await LoveNote.create(req.body);
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    await LoveNote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bucket List API
router.post('/bucket', async (req, res) => {
  try {
    const item = await Bucket.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/bucket/:id/toggle', async (req, res) => {
  try {
    const item = await Bucket.findById(req.params.id);
    if (item) {
      item.completed = !item.completed;
      item.date = item.completed ? new Date().toISOString().split('T')[0] : null;
      await item.save();
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
