import { useState, useEffect, useRef } from "react";
import { Video } from "../types";
import { Play, Volume2, Film, Map, MessageSquare, BookOpen, Cloud } from "lucide-react";
import { useLanguage } from "./LanguageContext";

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

interface HomeProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  setActiveTab: (tab: string) => void;
}

export default function Home({ videos, onSelectVideo, setActiveTab }: HomeProps) {
  const { t } = useLanguage();
  // Filter intro videos
  const introVideos = videos.filter((v) => v.category === "Giới thiệu");
  
  // Selected video for the main intro showcase (defaults to first intro video if exists)
  const [selectedIntroVideo, setSelectedIntroVideo] = useState<Video | null>(null);
  const mainPlayerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (introVideos.length > 0 && !selectedIntroVideo) {
      setSelectedIntroVideo(introVideos[0]);
    }
  }, [videos, introVideos, selectedIntroVideo]);

  // Handle setting volume to 50% on mount / video change
  useEffect(() => {
    if (mainPlayerRef.current) {
      mainPlayerRef.current.volume = 0.5;
    }
  }, [selectedIntroVideo]);

  // Find 1 prominent video card for each of the 5 categories
  const categories: { name: string; tabId: string; icon: any; color: string }[] = [
    { name: "Giới thiệu", tabId: "home", icon: BookOpen, color: "text-pblue" },
    { name: "Phim hoạt hình", tabId: "cartoon", icon: Film, color: "text-pgreen" },
    { name: "Du lịch trải nghiệm", tabId: "travel", icon: Map, color: "text-porange" },
    { name: "Trao đổi công nghệ AI", tabId: "ai", icon: MessageSquare, color: "text-purple-400" },
    { name: "Dự báo thời tiết", tabId: "travel", icon: Cloud, color: "text-cyan-400" },
  ];

  const categoryRepresentations = categories.map((cat) => {
    let catVideo: Video | undefined;
    if (cat.name === "Dự báo thời tiết") {
      const weatherVideos = videos.filter((v) => v.category === "Dự báo thời tiết" || v.id.startsWith("weather-"));
      if (weatherVideos.length > 0) {
        // Sort by createdAt descending to get the newest
        catVideo = [...weatherVideos].sort((a, b) => b.createdAt - a.createdAt)[0];
      }
    } else {
      catVideo = videos.find((v) => v.category === cat.name);
    }

    // Fallback if not found
    if (!catVideo && videos.length > 0) {
      catVideo = videos[0];
    }

    return {
      ...cat,
      video: catVideo,
    };
  });

  return (
    <div className="flex flex-col gap-12 pb-12 animate-fade-in duration-500">
      
      {/* 1. Session Giới thiệu */}
      <section id="intro-session" className="flex flex-col gap-6">
        <div className="border-b border-white/10 pb-2">
          <h2 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-6 bg-pblue rounded-full"></span>
            {t("Giới Thiệu Hệ Thống")}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">WELCOME TO PTOONGO - THE PREMIER VIDEO HUB</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch items-start">
          {/* Cột trái: Khung trình chiếu video chính */}
          <div className="lg:col-span-7 flex flex-col h-full">
            {selectedIntroVideo ? (
              <div className="flex flex-col gap-4 bg-psub/40 p-4 rounded-2xl border border-white/10 shadow-xl h-full justify-between">
                {/* 16:9 Aspect Video Showcase */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner group border border-white/5">
                  {getYoutubeEmbedUrl(selectedIntroVideo.videoUrl) ? (
                    <iframe
                      id="home-main-player-yt"
                      src={getYoutubeEmbedUrl(selectedIntroVideo.videoUrl) || ""}
                      title={selectedIntroVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      id="home-main-player"
                      ref={mainPlayerRef}
                      src={selectedIntroVideo.videoUrl}
                      poster={selectedIntroVideo.thumbnailUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                {/* Info */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-mono font-extrabold tracking-wider bg-pblue/20 text-blue-400 border border-pblue/30 rounded-full w-fit select-none">
                      <BookOpen className="w-3.5 h-3.5 text-pblue" strokeWidth={3} />
                      {selectedIntroVideo.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                      <Volume2 className="w-3.5 h-3.5" /> {t("Âm lượng mặc định: 50%")}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedIntroVideo.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed text-justify">
                    {selectedIntroVideo.summary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl bg-psub/40 border border-white/10 flex items-center justify-center text-gray-400 h-full">
                {t("Đang tải dữ liệu video giới thiệu...")}
              </div>
            )}
          </div>

          {/* Cột phải: Danh sách video giới thiệu (dòng) */}
          <div className="lg:col-span-5 flex flex-col gap-3 lg:h-full lg:max-h-[100%]">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 font-mono flex-shrink-0">{t("Danh sách video giới thiệu")}</h4>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3 min-h-[300px] lg:min-h-0">
              {introVideos.length > 0 ? (
                introVideos.map((video) => {
                  const isSelected = selectedIntroVideo?.id === video.id;
                  return (
                    <div
                      id={`intro-item-${video.id}`}
                      key={video.id}
                      onClick={() => setSelectedIntroVideo(video)}
                      className={`flex gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:bg-psub/60 hover:scale-[1.01] hover:shadow-md
                        ${isSelected 
                          ? "bg-psub/90 border-porange/40 shadow-glow" 
                          : "bg-psub/30 border-white/5"
                        }`}
                    >
                      {/* Left: Text Info */}
                      <div className="flex-1 flex flex-col gap-1 justify-between">
                        <div>
                          <h5 className={`font-semibold text-sm line-clamp-1 transition-colors
                            ${isSelected ? "text-porange" : "text-white"}`}
                          >
                            {video.title}
                          </h5>
                          <p className="text-xs text-gray-300 text-justify line-clamp-3 mt-1 pr-1">
                            {video.summary}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono mt-2 flex items-center gap-1">
                          {t("Thời lượng")}: {video.duration} | {t("Lượt xem")}: {video.views.toLocaleString()}
                        </span>
                      </div>

                      {/* Right: Small 16:9 Thumbnail */}
                      <div className="w-28 md:w-36 aspect-video rounded-lg overflow-hidden bg-black relative border border-white/10 flex-shrink-0">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-contain bg-black"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white fill-white/50" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-400 text-center py-12">{t("Không có video giới thiệu nào được tải lên.")}</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Session Chủ đề chính */}
      <section id="main-topics-session" className="flex flex-col gap-6">
        <div className="border-b border-white/10 pb-2">
          <h2 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-6 bg-porange rounded-full"></span>
            {t("Chủ Đề Tiêu Biểu")}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">EXPLORE OUR CHANNELS & RICH VIDEO CATEGORIES</p>
        </div>

        {/* 5 video cards, responsive, fitting tightly on 1 row if possible on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categoryRepresentations.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <div
                id={`topic-card-${index}`}
                key={index}
                className="flex flex-col rounded-xl overflow-hidden video-card flex-grow shadow-lg aspect-[1/1] w-full min-h-0"
              >
                {/* 16:9 Video Player on Top with controls to preview directly */}
                <div className="relative aspect-video w-full bg-black border-b border-white/10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {cat.video ? (
                    getYoutubeEmbedUrl(cat.video.videoUrl) ? (
                      <iframe
                        id={`preview-player-${index}-yt`}
                        src={getYoutubeEmbedUrl(cat.video.videoUrl)!}
                        title={cat.video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        id={`preview-player-${index}`}
                        src={cat.video.videoUrl}
                        poster={cat.video.thumbnailUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                      {t("Không có video")}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3 md:p-4 flex flex-col gap-1.5 flex-grow justify-between min-h-0">
                  <div className="flex flex-col gap-1 min-h-0 flex-1">
                    {/* Header: Icon + Category Name */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <IconComponent className={`w-3.5 h-3.5 ${cat.color}`} strokeWidth={cat.name === "Giới thiệu" ? 3 : 2} />
                      <span className={`font-display ${cat.name === "Giới thiệu" ? "font-extrabold" : "font-bold"} text-xs ${cat.color}`}>
                        {t(cat.name)}
                      </span>
                    </div>

                    {/* Video title inside card */}
                    <h4 className="font-semibold text-xs text-gray-200 line-clamp-1 flex-shrink-0">
                      {cat.video ? cat.video.title : t("Chưa có video cho chủ đề này")}
                    </h4>

                    {/* Summary of film / topic */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar text-[11px] text-gray-400 text-justify leading-relaxed">
                      {cat.video ? cat.video.summary : t("Vui lòng truy cập trang quản lý để cập nhật thêm video mới cho chủ đề này.")}
                    </div>
                  </div>

                  {/* CTA link to navigate to specific tab */}
                  <button
                    id={`topic-navigate-${cat.tabId}`}
                    onClick={() => setActiveTab(cat.tabId)}
                    className="w-full text-center text-xs font-semibold py-1 rounded-lg bg-white/5 hover:bg-porange hover:text-white transition-all text-gray-300 border border-white/10 hover:border-porange mt-1 flex-shrink-0"
                  >
                    {t("Truy cập Kênh")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
