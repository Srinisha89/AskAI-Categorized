import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock database for videos and interactions
  let videos = [
    {
      id: "1",
      title: "Introduction to Quantum Computing",
      description: "A deep dive into the world of quantum physics and computing.",
      thumbnail: "https://picsum.photos/seed/quantum/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      views: "1.2M",
      duration: "10:05",
      author: "TechExplored",
      uploadDate: "2 days ago",
      tags: ["tech", "science", "computing"],
      likes: 12000,
      comments: [{ id: "c1", user: "Alice", text: "This explained it so well!", date: "1 day ago" }]
    },
    {
      id: "2",
      title: "Making the Perfect Sourdough",
      description: "Learn the secrets of a perfect crust and crumb.",
      thumbnail: "https://picsum.photos/seed/bread/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      views: "850K",
      duration: "15:20",
      author: "BreadMaster",
      uploadDate: "1 week ago",
      tags: ["cooking", "tutorial", "baking"],
      likes: 8500,
      comments: []
    },
    {
      id: "3",
      title: "Python for Beginners - Full Course",
      description: "Master Python programming in this comprehensive tutorial.",
      thumbnail: "https://picsum.photos/seed/python1/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      views: "3.5M",
      duration: "4:00:00",
      author: "CodeMaster",
      uploadDate: "5 days ago",
      tags: ["tech", "python", "programming"],
      likes: 156000,
      comments: []
    },
    {
      id: "4",
      title: "Advanced Python Decorators",
      description: "Deep dive into Python meta-programming and decorators.",
      thumbnail: "https://picsum.photos/seed/python2/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      views: "120K",
      duration: "12:30",
      author: "PyExpert",
      uploadDate: "2 days ago",
      tags: ["tech", "python", "advanced"],
      likes: 4200,
      comments: []
    },
    {
      id: "5",
      title: "SpaceX Starship Launch - 2024",
      description: "Breathtaking footage of the latest Starship flight test.",
      thumbnail: "https://picsum.photos/seed/space/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      views: "10M",
      duration: "25:00",
      author: "SpaceX",
      uploadDate: "1 day ago",
      tags: ["tech", "science", "space"],
      likes: 890000,
      comments: []
    },
    {
      id: "6",
      title: "10 Node.js Tips for Speed",
      description: "Optimize your backend performance with these pro tips.",
      thumbnail: "https://picsum.photos/seed/nodejs/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      views: "45K",
      duration: "08:15",
      author: "BackEndBros",
      uploadDate: "6 hours ago",
      tags: ["tech", "nodejs", "programming"],
      likes: 2100,
      comments: []
    },
    {
      id: "7",
      title: "How to Build a Flask App",
      description: "Quick tutorial on Python Flask framework.",
      thumbnail: "https://picsum.photos/seed/flask/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      views: "89K",
      duration: "10:00",
      author: "CodeMaster",
      uploadDate: "3 days ago",
      tags: ["tech", "python", "flask"],
      likes: 3400,
      comments: []
    },
    {
      id: "8",
      title: "Data Science with Pandas",
      description: "Learn high-performance data manipulation in Python.",
      thumbnail: "https://picsum.photos/seed/pandas/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      views: "670K",
      duration: "45:00",
      author: "DataWiz",
      uploadDate: "2 weeks ago",
      tags: ["tech", "python", "datascience"],
      likes: 22000,
      comments: []
    },
    {
      id: "9",
      title: "React vs Vue - 2024 Guide",
      description: "Which frontend framework should you choose?",
      thumbnail: "https://picsum.photos/seed/react/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      views: "450K",
      duration: "14:20",
      author: "TechExplored",
      uploadDate: "Yesterday",
      tags: ["tech", "react", "programming"],
      likes: 12000,
      comments: []
    },
    {
      id: "10",
      title: "Python Automation Secrets",
      description: "Automate boring tasks with simple Python scripts.",
      thumbnail: "https://picsum.photos/seed/automate/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      views: "1.5M",
      duration: "18:40",
      author: "ScriptHero",
      uploadDate: "3 days ago",
      tags: ["tech", "python", "automation"],
      likes: 98000,
      comments: []
    },
    {
      id: "11",
      title: "Machine Learning Roadmap",
      description: "Step by step guide to become an ML engineer.",
      thumbnail: "https://picsum.photos/seed/ml/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      views: "2.1M",
      duration: "22:15",
      author: "PyExpert",
      uploadDate: "1 week ago",
      tags: ["tech", "python", "ml"],
      likes: 145000,
      comments: []
    },
    {
      id: "12",
      title: "Django Rest Framework Tutorial",
      description: "Build powerful APIs with Django.",
      thumbnail: "https://picsum.photos/seed/django/1280/720",
      videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      views: "340K",
      duration: "35:00",
      author: "BackEndBros",
      uploadDate: "4 days ago",
      tags: ["tech", "python", "django"],
      likes: 11000,
      comments: []
    },
    {
        id: "13",
        title: "Web Scraping with Beautiful Soup",
        description: "Scrape any website using Python.",
        thumbnail: "https://picsum.photos/seed/scrape/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        views: "180K",
        duration: "12:00",
        author: "ScriptHero",
        uploadDate: "2 days ago",
        tags: ["tech", "python", "scraping"],
        likes: 6700,
        comments: []
    },
    {
        id: "14",
        title: "FastAPI - The Future of Python APIs",
        description: "Why FastAPI is taking over the Python ecosystem.",
        thumbnail: "https://picsum.photos/seed/fastapi/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        views: "290K",
        duration: "11:50",
        author: "TechExplored",
        uploadDate: "5 hours ago",
        tags: ["tech", "python", "apis"],
        likes: 8900,
        comments: []
    },
    {
        id: "15",
        title: "Neural Networks from Scratch",
        description: "Understand the math behind deep learning.",
        thumbnail: "https://picsum.photos/seed/neuron/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        views: "1.1M",
        duration: "1:05:00",
        author: "PyExpert",
        uploadDate: "3 weeks ago",
        tags: ["tech", "python", "ai"],
        likes: 92000,
        comments: []
    },
    {
        id: "16",
        title: "Top 10 Python Frameworks 2024",
        description: "Explore the ecosystem of Python beyond Django and Flask.",
        thumbnail: "https://picsum.photos/seed/frameworks/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        views: "560K",
        duration: "15:45",
        author: "CodeMaster",
        uploadDate: "4 days ago",
        tags: ["tech", "python", "review"],
        likes: 18000,
        comments: []
    },
    {
        id: "17",
        title: "How Python is used at NASA",
        description: "Exploring the role of Python in space exploration.",
        thumbnail: "https://picsum.photos/seed/nasa/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        views: "2.4M",
        duration: "20:00",
        author: "SpaceX",
        uploadDate: "2 weeks ago",
        tags: ["tech", "python", "space"],
        likes: 120000,
        comments: []
    },
    {
        id: "18",
        title: "Python for Cybersecurity",
        description: "Learn how to build security tools with Python.",
        thumbnail: "https://picsum.photos/seed/security/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        views: "780K",
        duration: "30:00",
        author: "ScriptHero",
        uploadDate: "1 month ago",
        tags: ["tech", "python", "security"],
        likes: 45000,
        comments: []
    },
    {
        id: "19",
        title: "MicroPython on ESP32",
        description: "IoT development with Python.",
        thumbnail: "https://picsum.photos/seed/iot/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        views: "150K",
        duration: "10:30",
        author: "TechExplored",
        uploadDate: "3 days ago",
        tags: ["tech", "python", "iot"],
        likes: 5600,
        comments: []
    },
    {
        id: "20",
        title: "asyncio in Python Explained",
        description: "Concurrent programming made simple.",
        thumbnail: "https://picsum.photos/seed/async/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        views: "220K",
        duration: "14:00",
        author: "PyExpert",
        uploadDate: "1 week ago",
        tags: ["tech", "python", "concurrency"],
        likes: 9300,
        comments: []
    },
    {
        id: "21",
        title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
        description: "Chill beats for your productivity.",
        thumbnail: "https://picsum.photos/seed/lofi/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        views: "50M",
        duration: "Live",
        author: "LofiGirl",
        uploadDate: "Started 1 year ago",
        tags: ["music", "lofi", "chill"],
        likes: 2500000,
        comments: []
    },
    {
        id: "22",
        title: "Top 50 Global Hits 2024",
        description: "The biggest songs in the world right now.",
        thumbnail: "https://picsum.photos/seed/hits/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        views: "15M",
        duration: "3:45:00",
        author: "MusicWorld",
        uploadDate: "1 week ago",
        tags: ["music", "pop", "trending"],
        likes: 450000,
        comments: []
    },
    {
        id: "23",
        title: "Classic Rock Anthems",
        description: "The greatest rock songs of all time.",
        thumbnail: "https://picsum.photos/seed/rock/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        views: "8.2M",
        duration: "1:20:00",
        author: "RockHistory",
        uploadDate: "2 months ago",
        tags: ["music", "rock", "classics"],
        likes: 120000,
        comments: []
    },
    {
        id: "24",
        title: "Jazz for a Rainy Night",
        description: "Smooth jazz for deep relaxation.",
        thumbnail: "https://picsum.photos/seed/jazz/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        views: "1.5M",
        duration: "2:30:00",
        author: "JazzVibes",
        uploadDate: "3 weeks ago",
        tags: ["music", "jazz", "mood"],
        likes: 67000,
        comments: []
    },
    {
        id: "25",
        title: "Synthwave Essentials",
        description: "Ride the retro wave with these synth tracks.",
        thumbnail: "https://picsum.photos/seed/synth/1280/720",
        videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        views: "450K",
        duration: "1:15:00",
        author: "RetroBeats",
        uploadDate: "4 days ago",
        tags: ["music", "synthwave", "electronic"],
        likes: 21000,
        comments: []
    }
  ];

  const users = [
    { 
      id: "u1", 
      name: "Srinisha S", 
      email: "srinisha89s@gmail.com", 
      avatar: "SS", 
      subscriptions: ["TechExplored"], 
      watchHistory: ["1", "2"], // Fix: IDs were "v1", "v2" but should be "1", "2"
      likedVideoIds: ["3"], // Fix: ID was "v3" but should be "3"
      notifications: [
        { id: "n1", text: "TechExplored uploaded a new video", date: "1 hour ago", read: false }
      ] 
    }
  ];

  let currentUser = users[0];

  app.get("/api/user", (req, res) => {
    res.json(currentUser);
  });

  app.post("/api/user/subscribe", (req, res) => {
    const { author } = req.body;
    if (!currentUser.subscriptions.includes(author)) {
      currentUser.subscriptions.push(author);
    } else {
      currentUser.subscriptions = currentUser.subscriptions.filter(s => s !== author);
    }
    res.json(currentUser);
  });

  app.post("/api/videos/:id/like", (req, res) => {
    const video = videos.find(v => v.id === req.params.id);
    if (video) {
      video.likes += 1;
      res.json(video);
    } else res.status(404).json({ error: "Video not found" });
  });

  app.post("/api/videos/:id/comments", (req, res) => {
    const video = videos.find(v => v.id === req.params.id);
    if (video) {
       const newComment = {
         id: Math.random().toString(36).substr(2, 9),
         user: currentUser.name,
         text: req.body.text,
         date: "Just now"
       };
       video.comments.unshift(newComment);
       res.json(newComment);
    } else res.status(404).json({ error: "Video not found" });
  });

  app.post("/api/videos", (req, res) => {
    const newVideo = {
      ...req.body,
      id: (videos.length + 1).toString(),
      views: "0",
      uploadDate: "Just now",
      duration: "0:00",
      likes: 0,
      comments: []
    };
    videos.unshift(newVideo);
    res.json(newVideo);
  });

  app.get("/api/videos", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    
    // 1. Scoring-based Relevance Matching
    const scoredVideos = videos.map(v => {
      let score = 0;
      const title = v.title.toLowerCase();
      const desc = v.description.toLowerCase();
      const tags = v.tags.map(t => t.toLowerCase());

      if (query) {
        // Title Exact or Prefix
        if (title === query) score += 100;
        else if (title.startsWith(query)) score += 70;
        else if (title.includes(query)) score += 50;

        // Tags Exact
        if (tags.includes(query)) score += 40;
        else if (tags.some(t => t.includes(query) || query.includes(t))) score += 20;

        // Description
        if (desc.includes(query)) score += 10;
      }

      // 2. Engagement Factor (Scaling views)
      const views = parseInt(v.views.replace(/[^0-9]/g, '')) || 0;
      score += Math.log10(views + 1) * 2; // Subtle boost for popular videos

      return { ...v, searchScore: score };
    });

    let filtered = scoredVideos
      .filter(v => !query || v.searchScore > (videos.length > 5 ? 5 : 0)) // Only relevant ones if query exists
      .sort((a, b) => b.searchScore - a.searchScore);

    // 3. Fallback Expansion (Never show "No videos found")
    if (query && filtered.length < 4) {
      // Find keywords in query and search those too
      const keywords = query.split(" ").filter(k => k.length > 2);
      const expanded = scoredVideos.filter(v => 
        !filtered.find(f => f.id === v.id) &&
        keywords.some(k => v.tags.includes(k) || v.title.toLowerCase().includes(k))
      );
      filtered = [...filtered, ...expanded];

      // Absolute fallback: Fill with trending
      if (filtered.length < 4) {
        const trending = scoredVideos
          .filter(v => !filtered.find(f => f.id === v.id))
          .sort((a, b) => (parseInt(b.views.replace(/[^0-9]/g, '')) || 0) - (parseInt(a.views.replace(/[^0-9]/g, '')) || 0));
        filtered = [...filtered, ...trending];
      }
    }

    const isHome = !query;

    // 4. Dynamic Categorization (Netflix style)
    const isMusicSearch = query.includes("music") || filtered.some(v => v.tags.includes("music"));
    const isTechSearch = query.includes("tech") || filtered.some(v => v.tags.includes("tech") || v.tags.includes("python"));

    const categorizedResults = {
      isCategorized: true,
      sections: isHome ? [
        {
          id: "trending",
          title: "Trending Now",
          description: "Crowd favorites this week",
          videos: [...scoredVideos].sort((a,b) => parseInt(b.views.replace(/[^0-9]/g, '')) - parseInt(a.views.replace(/[^0-9]/g, ''))).slice(0, 12)
        },
        {
          id: "music_row",
          title: "Global Beats",
          description: "Top music and soundtracks",
          videos: scoredVideos.filter(v => v.tags.includes("music")).slice(0, 12)
        },
        {
          id: "continue",
          title: "Continue Watching",
          description: "Pick up where you left off",
          videos: scoredVideos.filter(v => currentUser.watchHistory?.includes(v.id)).slice(0, 12)
        },
        {
          id: "tech",
          title: "Tech & Innovation",
          description: "The latest in gadgetry and code",
          videos: scoredVideos.filter(v => v.tags.includes("tech")).slice(0, 12)
        }
      ] : [
        {
          id: "relevance",
          title: `Best Matches for "${query}"`,
          description: "Ranked by relevance and quality",
          videos: filtered.slice(0, 12)
        },
        {
          id: "contextual_recommendations",
          title: isMusicSearch ? "More Melodies You'll Love" : (isTechSearch ? "Because You Like Tech" : "Recommended for You"),
          description: isMusicSearch ? "Curated soundtracks for your taste" : "Hand-picked gems from our vault",
          videos: filtered.filter(v => {
            if (isMusicSearch) return v.tags.includes("music");
            if (isTechSearch) return v.tags.includes("tech") || v.tags.includes("computing");
            return true;
          }).slice(0, 12)
        },
        {
          id: "watched",
          title: "Explore from Your History",
          description: "Related to what you've seen before",
          videos: filtered.filter(v => 
            currentUser.watchHistory?.includes(v.id) || 
            v.tags.some(t => videos.find(h => currentUser.watchHistory?.includes(h.id))?.tags.includes(t))
          ).slice(0, 12)
        },
        {
          id: "popularity",
          title: "High Engagement Content",
          description: "Most popular matches from the vault",
          videos: [...filtered].sort((a, b) => {
             const viewsA = parseInt(a.views.replace(/[^0-9]/g, '')) || 0;
             const viewsB = parseInt(b.views.replace(/[^0-9]/g, '')) || 0;
             return viewsB - viewsA;
          }).slice(0, 12)
        }
      ]
    };

    // Filter empty sections
    categorizedResults.sections = categorizedResults.sections.filter(s => s.videos.length > 0);

    res.json(categorizedResults);
  });

  app.get("/api/videos/:id", (req, res) => {
    const video = videos.find(v => v.id === req.params.id);
    if (video) res.json(video);
    else res.status(404).json({ error: "Video not found" });
  });

  // Handle Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
