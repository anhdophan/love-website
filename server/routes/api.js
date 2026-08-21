import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import youtubedl, { exec as ytdlExec } from 'youtube-dl-exec';
import { Couple, Milestone, Gallery, Song, Reminder, LoveNote, Bucket } from '../models/Schema.js';

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

// GET All App Data
router.get('/all', async (req, res) => {
  try {
    await seedInitialDataIfNeeded();
    let couple = await Couple.findOne();
    const milestones = await Milestone.find().sort({ createdAt: -1 });
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    const playlist = await Song.find().sort({ createdAt: -1 });
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    const loveNotes = await LoveNote.find().sort({ createdAt: -1 });
    const bucketList = await Bucket.find().sort({ createdAt: 1 });

    res.json({
      couple,
      milestones,
      gallery,
      playlist,
      reminders,
      loveNotes,
      bucketList,
    });
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

// YouTube → MP3 → Cloudinary Converter API (using yt-dlp via youtube-dl-exec)
router.post('/songs/youtube-to-mp3', async (req, res) => {
  const { youtubeId, title, artist, addedBy } = req.body;
  if (!youtubeId) {
    return res.status(400).json({ error: 'Missing youtubeId' });
  }

  // Clean YouTube ID (strip playlist params if any)
  const cleanId = youtubeId.split('&')[0].split('?')[0].trim();
  const youtubeUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  try {
    // ── Step 1: Get video metadata (title, artist) ────────────────────────────
    const info = await youtubedl(youtubeUrl, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
    });

    const videoTitle  = title  || info.title             || 'Unknown Title';
    const videoAuthor = artist || info.uploader          || info.channel || 'Unknown Artist';

    // ── Step 2: Check Cloudinary dedup (don't re-convert same video) ──────────
    const cloudinaryPublicId = `love_website_audio/yt_${cleanId}`;
    try {
      const existing = await cloudinary.api.resource(cloudinaryPublicId, { resource_type: 'video' });
      // Already exists — just save to DB and return
      const newSong = await Song.create({
        title: videoTitle, artist: videoAuthor,
        type: 'audio', source: existing.secure_url,
        addedBy: addedBy || 'Both', originalYoutubeId: cleanId,
      });
      return res.status(201).json({ success: true, song: newSong, cloudinaryUrl: existing.secure_url, cached: true });
    } catch (_) {
      // Not found on Cloudinary → proceed with download
    }

    // ── Step 3: Stream audio from yt-dlp → Cloudinary ────────────────────────
    // yt-dlp output: '-' means write to stdout (stream mode, no temp file needed)
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'love_website_audio',
          public_id: `yt_${cleanId}`,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Spawn yt-dlp: extract best audio, pipe raw bytes to stdout
      const ytProcess = ytdlExec(youtubeUrl, {
        format: 'bestaudio[ext=m4a]/bestaudio/best',
        output: '-',          // stdout stream (no file download)
        noPlaylist: true,
        noWarnings: true,
        callHome: false,
        noCheckCertificates: true,
      }, { stdio: ['ignore', 'pipe', 'ignore'] });

      ytProcess.stdout.pipe(uploadStream);

      ytProcess.on('error', (err) => reject(new Error(`yt-dlp error: ${err.message}`)));
      ytProcess.stdout.on('error', (err) => reject(new Error(`Stream error: ${err.message}`)));
    });

    // ── Step 4: Save to DB ────────────────────────────────────────────────────
    const newSong = await Song.create({
      title: videoTitle,
      artist: videoAuthor,
      type: 'audio',                         // HTML5 <audio> → background playback ✅
      source: cloudinaryResult.secure_url,   // Permanent Cloudinary URL
      addedBy: addedBy || 'Both',
      originalYoutubeId: cleanId,
    });

    res.status(201).json({
      success: true,
      song: newSong,
      cloudinaryUrl: cloudinaryResult.secure_url,
    });

  } catch (err) {
    console.error('[YouTube→MP3] Error:', err.message);
    res.status(500).json({ error: `Không thể chuyển đổi: ${err.message}` });
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
