import { motion, AnimatePresence } from "motion/react";
import { Search, Youtube, Menu, Bell, User, LayoutGrid, Play, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, MessageSquare, Plus, Home, Compass, Library, History, Clock, X, Upload } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { processSearchIntent, AISearchResult } from "./services/geminiService";
import { Video, Comment } from "./types";

interface UserData {
  id: string;
  name: string;
  avatar: string;
  subscriptions: string[];
  notifications: { id: string, text: string, date: string, read: boolean }[];
}

interface SearchSection {
  id: string;
  title: string;
  description: string;
  videos: Video[];
}

function VideoCard({ video, onClick }: { video: Video, onClick: () => void, key?: any }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer space-y-3"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100">
        <img 
          src={video.thumbnail} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          referrerPolicy="no-referrer"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
          {video.duration}
        </span>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="text-white fill-white" size={40} />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-200 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">{video.title}</h3>
          <p className="text-xs text-zinc-500 mt-1 hover:text-zinc-800">{video.author}</p>
          <p className="text-xs text-zinc-400">{video.views} views • {video.uploadDate}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const searchBarRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (searchBarRef.current) {
      searchBarRef.current.style.height = "auto";
      searchBarRef.current.style.height = `${searchBarRef.current.scrollHeight}px`;
    }
  }, [query]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [categorizedSections, setCategorizedSections] = useState<SearchSection[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiResult, setAiResult] = useState<AISearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // Interaction states
  const [commentText, setCommentText] = useState("");
  const [uploadData, setUploadData] = useState({ title: "", description: "", thumbnail: "", videoUrl: "" });

  useEffect(() => {
    fetchVideos();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const resp = await fetch("/api/user");
      const data = await resp.json();
      setUser(data);
    } catch (err) {
      console.error("Fetch user failed:", err);
    }
  };

  const fetchVideos = async (searchTerm = "") => {
    try {
      const resp = await fetch(`/api/videos${searchTerm ? `?q=${searchTerm}` : ""}`);
      const data = await resp.json();
      if (data.isCategorized) {
        setVideos([]);
        setCategorizedSections(data.sections);
      } else {
        setVideos(data);
        setCategorizedSections([]);
      }
    } catch (err) {
      console.error("Fetch videos failed:", err);
    }
  };

  const handleLike = async () => {
    if (!selectedVideo) return;
    try {
      const resp = await fetch(`/api/videos/${selectedVideo.id}/like`, { method: "POST" });
      const updated = await resp.json();
      setSelectedVideo(updated);
      setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleSubscribe = async (author: string) => {
    try {
      const resp = await fetch("/api/user/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author })
      });
      const updatedUser = await resp.json();
      setUser(updatedUser);
    } catch (err) {
      console.error("Subscribe failed:", err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo || !commentText.trim()) return;
    try {
      const resp = await fetch(`/api/videos/${selectedVideo.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText })
      });
      const newComment = await resp.json();
      setSelectedVideo(prev => prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : null);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...uploadData, author: user?.name || "Anonymous", tags: ["tech"] })
      });
      const newVid = await resp.json();
      setVideos(prev => [newVid, ...prev]);
      setIsUploadOpen(false);
      setUploadData({ title: "", description: "", thumbnail: "", videoUrl: "" });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim()) {
      fetchVideos();
      setAiResult(null);
      setSearchStatus(null);
      return;
    };

    setIsSearching(true);
    setAiResult(null);
    setSearchStatus(`Searching for "${finalQuery}"...`);

    // AI Intent processing
    const result = await processSearchIntent(finalQuery);
    if (result.isAIRequest) {
      setAiResult(result);
      setSearchStatus(`Showing results for "${finalQuery}"`);
    } else {
      setSearchStatus(`Found videos for "${finalQuery}"`);
    }

    // Standard search with Fallback logic on backend
    await fetchVideos(finalQuery);
    setIsSearching(false);
    setSelectedVideo(null); // Return to list view
  };

  const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? "bg-zinc-100 font-medium" : "hover:bg-zinc-100"}`}>
      <Icon size={20} className={active ? "text-red-600" : "text-zinc-700"} />
      <span className="text-sm font-sans">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 min-h-[56px] py-1 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-zinc-100 rounded-full">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => { setQuery(""); fetchVideos(); setSelectedVideo(null); }}>
            <Youtube className="text-red-600 fill-red-600" size={30} />
            <span className="text-xl font-bold tracking-tighter">CurioVid</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8 flex justify-center">
          <form onSubmit={handleSearch} className="relative group w-full max-w-xl">
            <div className={`flex items-start bg-zinc-100 rounded-2xl px-4 py-2 border border-transparent focus-within:border-red-500 focus-within:bg-white transition-all shadow-sm ring-red-100 focus-within:ring-4 ${query.length > 50 ? 'rounded-xl' : 'rounded-full'}`}>
              <Search size={18} className="text-zinc-500 mt-1 mr-2 flex-shrink-0" />
              <textarea
                ref={searchBarRef}
                rows={1}
                placeholder="Search or ask AI anything..."
                className="w-full bg-transparent outline-none text-sm placeholder:text-zinc-500 resize-none py-0.5 leading-relaxed min-h-[20px] max-h-[150px] no-scrollbar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              {isSearching && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full ml-2 mt-1 flex-shrink-0" />}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsUploadOpen(true)} className="p-2 hover:bg-zinc-100 rounded-full hidden sm:block">
            <Plus size={20} />
          </button>
          <div className="relative">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="p-2 hover:bg-zinc-100 rounded-full">
              <Bell size={20} />
              {user?.notifications.some(n => !n.read) && <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />}
            </button>
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-zinc-100 shadow-xl rounded-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-2 border-b border-zinc-50 font-bold text-sm">Notifications</div>
                  {user?.notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-zinc-50 cursor-pointer space-y-1">
                      <p className="text-sm">{n.text}</p>
                      <p className="text-xs text-zinc-400">{n.date}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer ml-2">
            {user?.avatar || "SS"}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsUploadOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Upload Video</h2>
                <button onClick={() => setIsUploadOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase">Title</label>
                   <input 
                    required
                    value={uploadData.title}
                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-all" 
                    placeholder="Enter video title"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                   <textarea 
                    required
                    rows={3}
                    value={uploadData.description}
                    onChange={e => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-all" 
                    placeholder="Tell viewers about your video"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Thumbnail URL</label>
                    <input 
                      required
                      value={uploadData.thumbnail}
                      onChange={e => setUploadData({ ...uploadData, thumbnail: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-all" 
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Video URL (mp4)</label>
                    <input 
                      required
                      value={uploadData.videoUrl}
                      onChange={e => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:border-red-600 outline-none transition-all" 
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                  <Upload size={20} />
                  Publish Video
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pt-14 flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 bottom-0 top-14 bg-white border-r border-zinc-100 transition-all duration-300 z-40 ${isSidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
          <div className="p-2 space-y-1">
            <SidebarItem icon={Home} label="Home" active={!selectedVideo} />
            <SidebarItem icon={Compass} label="Explore" />
            <SidebarItem icon={Plus} label="Subscriptions" />
            <hr className="my-2 border-zinc-100" />
            <SidebarItem icon={Library} label="Library" />
            <SidebarItem icon={History} label="History" />
            <SidebarItem icon={Play} label="Your Videos" />
            <SidebarItem icon={Clock} label="Watch Later" />
          </div>
        </aside>

        {/* Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <div className="max-w-7xl mx-auto p-4 lg:p-6 pb-20">
            {selectedVideo ? (
              /* Video View */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                    <video 
                      src={selectedVideo.videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full"
                      poster={selectedVideo.thumbnail}
                    />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">{selectedVideo.title}</h1>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm leading-none">{selectedVideo.author}</p>
                        <p className="text-xs text-zinc-500 mt-1">1.2M subscribers</p>
                      </div>
                      <button 
                        onClick={() => handleSubscribe(selectedVideo.author)}
                        className={`${user?.subscriptions.includes(selectedVideo.author) ? "bg-zinc-200 text-zinc-900" : "bg-zinc-900 text-white"} px-4 py-2 rounded-full text-xs font-bold ml-4 hover:opacity-90 transition-colors`}
                      >
                        {user?.subscriptions.includes(selectedVideo.author) ? "Subscribed" : "Subscribe"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-zinc-100 rounded-full overflow-hidden">
                        <button onClick={handleLike} className="px-4 py-2 hover:bg-zinc-200 flex items-center gap-2 border-r border-zinc-200">
                          <ThumbsUp size={16} className={selectedVideo.likes > 45000 ? "text-red-500 fill-red-500" : ""} /> <span className="text-xs font-bold">{selectedVideo.likes.toLocaleString()}</span>
                        </button>
                        <button className="px-4 py-2 hover:bg-zinc-200">
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                      <button className="bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-4 text-sm">
                    <p className="font-bold mb-1">{selectedVideo.views} views • {selectedVideo.uploadDate}</p>
                    <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed">{selectedVideo.description}</p>
                  </div>

                  {/* Comments Section */}
                  <div className="pt-4 space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-lg">{selectedVideo.comments?.length || 0} Comments</h3>
                      <button className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                         <LayoutGrid size={16} /> Sort by
                      </button>
                    </div>
                    <form onSubmit={handleComment} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0 flex items-center justify-center font-bold text-zinc-400">?</div>
                      <div className="flex-1 space-y-2">
                        <input 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..." 
                          className="w-full border-b border-zinc-200 py-1 outline-none focus:border-red-600 transition-colors"
                        />
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setCommentText("")} className="px-4 py-2 text-sm font-bold rounded-full hover:bg-zinc-100">Cancel</button>
                          <button type="submit" className="px-4 py-2 text-sm font-bold bg-zinc-100 rounded-full hover:bg-zinc-200 disabled:opacity-50" disabled={!commentText.trim()}>Comment</button>
                        </div>
                      </div>
                    </form>
                    <div className="space-y-6">
                      {selectedVideo.comments?.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex-shrink-0 flex items-center justify-center font-bold text-zinc-300">
                            {comment.user[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{comment.user} <span className="text-zinc-500 font-normal ml-2">{comment.date}</span></p>
                            <p className="text-sm mt-1">{comment.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-zinc-500">
                               <ThumbsUp size={14} className="cursor-pointer hover:text-black transition-colors" />
                               <ThumbsDown size={14} className="cursor-pointer hover:text-black transition-colors" />
                               <span className="text-xs font-bold cursor-pointer hover:text-black transition-colors uppercase tracking-widest text-[10px]">Reply</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations Sidebar */}
                <div className="space-y-4">
                   <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-widest px-2">Up Next</h3>
                   {videos.filter(v => v.id !== selectedVideo.id).map(video => (
                    <div 
                      key={video.id} 
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-3 cursor-pointer group p-2 rounded-xl hover:bg-zinc-100 transition-all"
                    >
                      <div className="relative w-40 h-24 flex-shrink-0 bg-zinc-200 rounded-lg overflow-hidden">
                        <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1 rounded">{video.duration}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">{video.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{video.author}</p>
                        <p className="text-[11px] text-zinc-400">{video.views} views • {video.uploadDate}</p>
                      </div>
                    </div>
                   ))}
                </div>
              </div>
            ) : (
              /* Feed View */
              <div className="space-y-6">
                {/* Search status / AI Context */}
                {searchStatus && (
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{searchStatus}</span>
                  </div>
                )}

                {/* Content Display (Always Categorized for Netflix Feel) */}
                <div className="space-y-16">
                  {categorizedSections.map((section, idx) => (
                    <motion.div 
                      key={section.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-end justify-between px-2">
                        <div className="space-y-1">
                          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900">{section.title}</h3>
                          <p className="text-sm font-medium text-zinc-400 uppercase tracking-[0.15em]">{section.description}</p>
                        </div>
                        <button className="text-xs font-bold text-red-600 hover:underline uppercase tracking-widest hidden sm:block">Explore All</button>
                      </div>
                      <div className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-2 -mx-2 snap-x">
                        {section.videos.map(video => (
                          <div key={`${section.id}-${video.id}`} className="min-w-[280px] sm:min-w-[320px] lg:min-w-[360px] snap-start">
                             <VideoCard video={video} onClick={() => setSelectedVideo(video)} />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {categorizedSections.length === 0 && videos.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {videos.map(video => (
                          <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
                        ))}
                     </div>
                  )}

                  {categorizedSections.length === 0 && videos.length === 0 && !isSearching && (
                    <div className="py-20 text-center space-y-4">
                      <LayoutGrid className="mx-auto text-zinc-200 w-16 h-16" />
                      <p className="text-zinc-500">No content available at the moment.</p>
                      <button onClick={() => fetchVideos("")} className="text-red-600 font-bold hover:underline">Refresh Feed</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

