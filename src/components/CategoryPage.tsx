import React, { useState, useEffect, useRef } from "react";
import { Video, ChatMessage, UserProfile } from "../types";
import { subscribeToMessages, addMessageToChat } from "../lib/dbService";
import { User } from "firebase/auth";
import { Play, Eye, Clock, MessageSquare, Send, Sparkles, User as UserIcon } from "lucide-react";

const getYoutubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

interface CategoryPageProps {
  category: "Phim hoạt hình" | "Du lịch trải nghiệm" | "Trao đổi công nghệ AI";
  title: string;
  slogan: string;
  videos: Video[];
  showChat?: boolean;
  user: User | null;
  profile: UserProfile | null;
  onNavigateToAuth: () => void;
}

export default function CategoryPage({
  category,
  title,
  slogan,
  videos,
  showChat = false,
  user,
  profile,
  onNavigateToAuth,
}: CategoryPageProps) {
  // Filter videos belonging to this category
  const categoryVideos = videos.filter((v) => v.category === category);

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlayingPrimary, setIsPlayingPrimary] = useState(false);
  const primaryPlayerRef = useRef<HTMLVideoElement>(null);

  // For real-time chat in AI tab
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set default selected video when component mounts or videos change
  useEffect(() => {
    if (categoryVideos.length > 0) {
      setSelectedVideo(categoryVideos[0]);
    } else {
      setSelectedVideo(null);
    }
  }, [category, videos]);

  // Reset play state when video changes
  useEffect(() => {
    setIsPlayingPrimary(false);
  }, [selectedVideo]);

  // Handle setting volume to 50% on mount / video play
  useEffect(() => {
    if (isPlayingPrimary && primaryPlayerRef.current) {
      primaryPlayerRef.current.volume = 0.5;
      primaryPlayerRef.current.play().catch(() => {
        console.log("Autoplay blocked by browser policy.");
      });
    }
  }, [isPlayingPrimary]);

  // Chat Subscription (AI only)
  useEffect(() => {
    if (showChat && user) {
      const unsubscribe = subscribeToMessages((msgs) => {
        setChatMessages(msgs);
      });
      return () => unsubscribe();
    }
  }, [showChat, user]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user) return;

    try {
      const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "Ẩn danh";
      await addMessageToChat(newMessageText.trim(), user.uid, user.email || "", displayName);
      setNewMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-12 animate-fade-in duration-500">
      
      {/* 1. Page Banner */}
      <div id="category-banner" className="relative w-full rounded-2xl overflow-hidden bg-psub/50 border border-white/10 p-8 md:p-12 shadow-xl flex flex-col justify-center gap-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-porange/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pblue/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <span className="text-xs font-mono tracking-widest text-porange uppercase font-bold">{category} Channel</span>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-gray-300 italic max-w-xl">
          "{slogan}"
        </p>
      </div>

      {/* 2. Session Giới thiệu: Trình chiếu video lớn + Thông tin */}
      <section id="category-showcase-session" className="flex flex-col gap-6">
        <div className="border-b border-white/10 pb-2">
          <h2 className="text-lg font-display font-semibold text-white tracking-wide">
            Đang Trình Chiếu
          </h2>
        </div>

        {selectedVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái: Khung trình chiếu video 16:9 */}
            <div className="lg:col-span-7 flex flex-col gap-3 bg-psub/40 p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
                {!isPlayingPrimary ? (
                  <div 
                    onClick={() => setIsPlayingPrimary(true)}
                    className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedVideo.thumbnailUrl})` }}
                  >
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-porange flex items-center justify-center text-white shadow-lg shadow-porange/30 transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                ) : getYoutubeEmbedUrl(selectedVideo.videoUrl) ? (
                  <iframe
                    id="category-primary-player-yt"
                    src={`${getYoutubeEmbedUrl(selectedVideo.videoUrl)}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    id="category-primary-player"
                    ref={primaryPlayerRef}
                    src={selectedVideo.videoUrl}
                    poster={selectedVideo.thumbnailUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Cột phải: Khung Thông tin */}
            <div id="category-video-info" className="lg:col-span-5 bg-psub/30 p-6 rounded-2xl border border-white/10 flex flex-col gap-4 self-stretch justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-porange/15 text-porange border border-porange/25 rounded-full">
                    {selectedVideo.category}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Âm lượng mặc định: 50%</span>
                </div>
                
                <h3 className="font-display font-bold text-xl text-white">
                  {selectedVideo.title}
                </h3>
                
                <div className="text-sm text-gray-300 leading-relaxed text-justify space-y-2">
                  <p>{selectedVideo.summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-gray-400 font-mono border-t border-white/10 pt-4 mt-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-porange" />
                  Thời lượng: {selectedVideo.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-pblue" />
                  Lượt xem: {selectedVideo.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full rounded-2xl bg-psub/30 border border-white/10 py-16 text-center text-gray-400">
            Chưa có video nào trong danh mục này. Vui lòng truy cập trang Quản lý Video để tải lên.
          </div>
        )}
      </section>

      {/* 3. Session Chủ đề chính: Các video card còn lại */}
      {categoryVideos.length > 0 && (
        <section id="category-cards-session" className="flex flex-col gap-6">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-lg font-display font-semibold text-white tracking-wide">
              Danh Sách Video Trong Kênh ({categoryVideos.length})
            </h2>
          </div>

          {/* Flexible Grid for multiple cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryVideos.map((video) => {
              const isPlaying = selectedVideo?.id === video.id;
              return (
                <div
                  id={`video-card-${video.id}`}
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex flex-col rounded-xl overflow-hidden cursor-pointer flex-grow video-card aspect-[1/1.1] w-full min-h-0
                    ${isPlaying 
                      ? "border-porange/50 shadow-glow bg-psub/70 scale-101 border-2" 
                      : ""
                    }`}
                >
                  {/* Video Thumbnail / Preview Player directly in-place */}
                  <div className="relative aspect-video w-full bg-black border-b border-white/10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {getYoutubeEmbedUrl(video.videoUrl) ? (
                      <iframe
                        id={`preview-${video.id}-yt`}
                        src={getYoutubeEmbedUrl(video.videoUrl)!}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        id={`preview-${video.id}`}
                        src={video.videoUrl}
                        poster={video.thumbnailUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Info inside card */}
                  <div className="p-3 md:p-4 flex flex-col gap-1.5 flex-grow justify-between min-h-0">
                    <div className="flex flex-col min-h-0 flex-1">
                      <h4 className={`font-semibold text-xs line-clamp-1 transition-colors flex-shrink-0
                        ${isPlaying ? "text-porange" : "text-gray-200"}`}
                      >
                        {video.title}
                      </h4>
                      <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar text-[11px] text-gray-400 text-justify mt-1 leading-relaxed">
                        {video.summary}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5 text-[10px] text-gray-500 font-mono flex-shrink-0">
                      <span>{video.duration}</span>
                      <span>{video.views.toLocaleString()} lượt xem</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Chat exchange section (AI technology channel only) */}
      {showChat && (
        <section id="ai-chat-forum-session" className="flex flex-col gap-6 mt-6">
          <div className="border-b border-white/10 pb-2">
            <h2 className="font-display font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-porange" />
              Diễn Đàn Trực Tuyến - Trao đổi công nghệ AI
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">DISCUSS AI TRENDS AND VIDEO PRODUCTION TECHNOLOGY</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Chat Box */}
            <div className="lg:col-span-8 bg-psub/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px]">
              {/* Chat Header */}
              <div className="bg-psub/60 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-pgreen rounded-full animate-ping"></span>
                  Kênh thảo luận công khai
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {user ? `${chatMessages.length} tin nhắn` : "Vui lòng đăng nhập"}
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-[#2d313d]">
                {user ? (
                  chatMessages.length > 0 ? (
                    chatMessages.map((msg) => {
                      const isMe = msg.userId === user.uid;
                      return (
                        <div
                          id={`chat-msg-${msg.id}`}
                          key={msg.id}
                          className={`flex gap-3 max-w-[80%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                        >
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0
                            ${isMe ? "bg-porange text-white" : "bg-pblue text-white"}`}
                          >
                            {msg.userName.slice(0, 1).toUpperCase()}
                          </div>

                          {/* Message Body */}
                          <div className="flex flex-col gap-1">
                            <span className={`text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}>
                              {msg.userName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-justify
                              ${isMe 
                                ? "bg-porange text-white rounded-tr-none" 
                                : "bg-psub/90 text-gray-100 rounded-tl-none border border-white/5"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <MessageSquare className="w-8 h-8 text-gray-500" />
                      <p className="text-sm">Chưa có cuộc thảo luận nào. Hãy gửi tin nhắn đầu tiên!</p>
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <UserIcon className="w-12 h-12 text-gray-600" />
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-white">Yêu cầu đăng nhập</p>
                      <p className="text-xs text-gray-400 max-w-sm px-6">Bạn cần đăng nhập tài khoản để xem diễn đàn thảo luận và trao đổi ý kiến về công nghệ AI.</p>
                    </div>
                    <button
                      id="chat-login-btn"
                      onClick={onNavigateToAuth}
                      className="btn-porange px-6 py-2 rounded-full text-xs font-semibold"
                    >
                      Đăng nhập / Đăng ký ngay
                    </button>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {user && (
                <form onSubmit={handleSendMessage} className="p-4 bg-psub/60 border-t border-white/10 flex gap-3">
                  <input
                    id="chat-input-text"
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Nhập ý kiến trao đổi về AI của bạn..."
                    className="flex-1 bg-[#252831] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-porange/50 transition-all"
                  />
                  <button
                    id="chat-send-btn"
                    type="submit"
                    className="p-2.5 rounded-xl btn-porange flex items-center justify-center"
                    title="Gửi"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Right: AI technology brief / rules info */}
            <div className="lg:col-span-4 bg-psub/30 p-6 rounded-2xl border border-white/10 flex flex-col gap-4 self-stretch">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-porange" />
                Quy tắc thảo luận
              </h3>
              <ul className="text-xs text-gray-300 space-y-3 leading-relaxed text-justify">
                <li className="flex gap-2">
                  <span className="text-porange font-bold">1.</span>
                  <span>Chỉ trao đổi các nội dung xoay quanh công nghệ Trí tuệ nhân tạo (AI), Machine Learning và ứng dụng AI trong dựng phim hoạt hình hoặc làm video trải nghiệm.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-porange font-bold">2.</span>
                  <span>Tôn trọng ý kiến người khác, không spam link quảng cáo hoặc chia sẻ các phần mềm độc hại.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-porange font-bold">3.</span>
                  <span>Các bài đăng của Admin về hướng dẫn công nghệ AI sẽ được ghim trực tiếp trong mục video của kênh để các thành viên tiện theo dõi.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
