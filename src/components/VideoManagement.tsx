import React, { useState, useEffect, useRef } from "react";
import { Video, VideoCategory, UserProfile } from "../types";
import { 
  addVideoToFirestore, 
  updateVideoInFirestore, 
  deleteVideoFromFirestore 
} from "../lib/dbService";
import { 
  Upload, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Film, 
  Image as ImageIcon, 
  Eye, 
  Clock, 
  ListOrdered 
} from "lucide-react";

// Helper to extract YouTube video ID and construct high-res thumbnail URL
const getYoutubeThumbnailUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
};

// Helper to extract YouTube video ID and construct embed URL
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

interface VideoManagementProps {
  videos: Video[];
  refreshVideos: () => Promise<void>;
  profile: UserProfile | null;
}

export default function VideoManagement({ videos, refreshVideos, profile }: VideoManagementProps) {
  // Form states
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<VideoCategory>("Giới thiệu");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [duration, setDuration] = useState("03:15");
  const [views, setViews] = useState<number>(0);
  
  // Upload states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Refs for file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Active selected video for editing
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  // Auto-generate video ID based on category and current count
  useEffect(() => {
    if (!selectedVideoId) {
      const prefixMap: Record<VideoCategory, string> = {
        "Giới thiệu": "intro-",
        "Phim hoạt hình": "cartoon-",
        "Du lịch trải nghiệm": "travel-",
        "Trao đổi công nghệ AI": "ai-",
      };
      const prefix = prefixMap[category];
      const count = videos.filter((v) => v.category === category).length;
      setId(`${prefix}${count + 1}`);
    }
  }, [category, videos, selectedVideoId]);

  // Handle row selection to load form
  const handleSelectVideo = (video: Video) => {
    setSelectedVideoId(video.id);
    setId(video.id);
    setTitle(video.title);
    setSummary(video.summary);
    setCategory(video.category);
    setVideoUrl(video.videoUrl);
    setThumbnailUrl(video.thumbnailUrl);
    setDuration(video.duration);
    setViews(video.views);
    setUploadError("");
  };

  // Reset Form
  const handleResetForm = () => {
    setSelectedVideoId(null);
    setTitle("");
    setSummary("");
    setVideoUrl("");
    setThumbnailUrl("");
    setDuration("03:15");
    setViews(0);
    setUploadError("");
  };

  // Upload helper
  const uploadFile = async (file: File, type: "video" | "thumb") => {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "video") setUploadingVideo(true);
    else setUploadingThumb(true);
    setUploadError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Tải tệp lên thất bại. Vui lòng thử lại.");
      }

      const data = await res.json();
      if (type === "video") {
        setVideoUrl(data.url);
      } else {
        setThumbnailUrl(data.url);
      }
    } catch (err: any) {
      setUploadError(err.message || "Có lỗi xảy ra khi tải tệp.");
    } finally {
      setUploadingVideo(false);
      setUploadingThumb(false);
    }
  };

  // Handlers for manual file selections
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "video");
    }
  };

  const handleThumbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0], "thumb");
    }
  };

  // Handlers for Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropVideo = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0], "video");
    }
  };

  const handleDropThumb = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0], "thumb");
    }
  };

  // Extract the first frame of the video
  const extractVideoFrame = (url: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = url;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      const timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error("Quá thời gian trích xuất ảnh từ video (Timeout)"));
      }, 10000);

      const cleanup = () => {
        clearTimeout(timeoutId);
        video.onseeked = null;
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      video.onloadedmetadata = () => {
        video.currentTime = 0.5; // Seek to 0.5s to avoid initial black screen
      };

      video.onseeked = () => {
        cleanup();
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Không thể khởi tạo canvas context"));
            return;
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
              resolve(file);
            } else {
              reject(new Error("Không thể tạo Blob từ canvas"));
            }
          }, "image/jpeg", 0.85);
        } catch (err) {
          reject(err);
        }
      };

      video.onerror = () => {
        cleanup();
        reject(new Error("Lỗi khi tải tệp video để trích xuất ảnh thu nhỏ. Vui lòng kiểm tra lại định dạng video."));
      };
    });
  };

  const handleVideoUrlChange = (val: string) => {
    setVideoUrl(val);
    const ytThumb = getYoutubeThumbnailUrl(val);
    if (ytThumb) {
      setThumbnailUrl(ytThumb);
    }
  };

  // Helper to ensure thumbnail exists
  const ensureThumbnail = async (currentVideoUrl: string, currentThumbnailUrl: string): Promise<string> => {
    if (currentThumbnailUrl && currentThumbnailUrl.trim() !== "") {
      return currentThumbnailUrl;
    }

    if (!currentVideoUrl || currentVideoUrl.trim() === "") {
      throw new Error("Vui lòng tải lên tệp video hoặc cung cấp đường dẫn video trước.");
    }

    // Tự động kiểm tra và trích xuất ảnh thu nhỏ từ YouTube nếu là video YouTube
    const ytThumb = getYoutubeThumbnailUrl(currentVideoUrl);
    if (ytThumb) {
      setThumbnailUrl(ytThumb);
      return ytThumb;
    }

    setUploadingThumb(true);
    setUploadError("Đang tự động trích xuất ảnh thu nhỏ từ Frame đầu của video...");

    try {
      const file = await extractVideoFrame(currentVideoUrl);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Không thể tải ảnh trích xuất lên server.");
      }

      const data = await res.json();
      setThumbnailUrl(data.url);
      setUploadError("");
      return data.url;
    } catch (err: any) {
      throw new Error("Không thể trích xuất ảnh thu nhỏ tự động: " + (err.message || err));
    } finally {
      setUploadingThumb(false);
    }
  };

  // Add video
  const handleAddVideo = async () => {
    if (!profile || profile.role !== "admin") {
      setUploadError("Bạn không có quyền thêm video! Chỉ dành cho Quản trị viên.");
      return;
    }

    setUploadError("");
    let finalThumbnailUrl = thumbnailUrl;

    if (!finalThumbnailUrl || finalThumbnailUrl.trim() === "") {
      try {
        finalThumbnailUrl = await ensureThumbnail(videoUrl, thumbnailUrl);
      } catch (err: any) {
        setUploadError(err.message);
        return;
      }
    }

    if (!title || !summary || !videoUrl || !finalThumbnailUrl) {
      setUploadError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    const newVideo: Video = {
      id,
      title,
      summary,
      category,
      videoUrl,
      thumbnailUrl: finalThumbnailUrl,
      duration,
      views: Number(views) || 0,
      createdAt: Date.now(),
      uploadedBy: profile.displayName || "admin",
    };

    try {
      await addVideoToFirestore(newVideo);
      await refreshVideos();
      handleResetForm();
      alert("Thêm video mới thành công!");
    } catch (err: any) {
      setUploadError(err.message || "Lỗi khi lưu video vào Firestore.");
    }
  };

  // Update video
  const handleUpdateVideo = async () => {
    if (!profile || profile.role !== "admin") {
      setUploadError("Bạn không có quyền cập nhật video! Chỉ dành cho Quản trị viên.");
      return;
    }

    if (!selectedVideoId) return;
    setUploadError("");
    let finalThumbnailUrl = thumbnailUrl;

    if (!finalThumbnailUrl || finalThumbnailUrl.trim() === "") {
      try {
        finalThumbnailUrl = await ensureThumbnail(videoUrl, thumbnailUrl);
      } catch (err: any) {
        setUploadError(err.message);
        return;
      }
    }

    if (!title || !summary || !videoUrl || !finalThumbnailUrl) {
      setUploadError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    const updatedVideo: Video = {
      id,
      title,
      summary,
      category,
      videoUrl,
      thumbnailUrl: finalThumbnailUrl,
      duration,
      views: Number(views) || 0,
      createdAt: Date.now(),
      uploadedBy: profile.displayName || "admin",
    };

    try {
      await updateVideoInFirestore(updatedVideo);
      await refreshVideos();
      handleResetForm();
      alert("Cập nhật thông tin video thành công!");
    } catch (err: any) {
      setUploadError(err.message || "Lỗi khi cập nhật video.");
    }
  };

  // Delete video
  const handleDeleteVideo = async (vidToDelete?: string) => {
    // Admin check
    if (!profile || profile.role !== "admin") {
      alert("Bạn không có quyền thực hiện chức năng xóa video! Chỉ có Quản trị viên (Admin) mới có quyền.");
      return;
    }

    const targetId = vidToDelete || selectedVideoId;
    if (!targetId) return;

    const targetVideo = videos.find((v) => v.id === targetId);
    const videoTitle = targetVideo ? targetVideo.title : targetId;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa video "${videoTitle}"? Hành động này sẽ xóa vĩnh viễn video khỏi cơ sở dữ liệu.`)) {
      return;
    }

    try {
      await deleteVideoFromFirestore(targetId);
      await refreshVideos();
      
      // Reset form if the deleted video was currently selected or if it's the current targetId
      if (!vidToDelete || targetId === selectedVideoId) {
        handleResetForm();
      }
      
      alert("Xóa video thành công!");
    } catch (err: any) {
      setUploadError(err.message || "Lỗi khi xóa video.");
    }
  };

  // Group videos by category for the right list view
  const groupByCategory = (cats: VideoCategory[]) => {
    return cats.map((cat) => ({
      category: cat,
      items: videos.filter((v) => v.category === cat),
    }));
  };

  const groupedVideos = groupByCategory([
    "Giới thiệu",
    "Phim hoạt hình",
    "Du lịch trải nghiệm",
    "Trao đổi công nghệ AI",
  ]);

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in duration-500">
      
      {/* Page Header */}
      <div className="border-b border-white/10 pb-2 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-6 bg-pblue rounded-full"></span>
            Hệ Thống Quản Lý Video
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">ADMIN PANEL FOR VIDEO UPLOAD AND MANAGEMENT</p>
        </div>
        <button
          id="refresh-list-btn"
          onClick={refreshVideos}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-psub/50 hover:bg-psub text-xs text-gray-300 hover:text-white border border-white/10 transition-all font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch items-start">
        
        {/* CỘT BÊN TRÁI: FORM VIDEO */}
        <div className="lg:col-span-6 flex flex-col gap-6 bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg h-full">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Film className="w-4 h-4 text-porange" />
              {selectedVideoId ? `Chỉnh sửa Video: ${selectedVideoId}` : "Thêm Video Mới"}
            </h3>
            {selectedVideoId && (
              <button
                id="reset-form-btn"
                onClick={handleResetForm}
                className="text-xs text-porange hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tạo video mới
              </button>
            )}
          </div>

          {/* DRAG & DROP / SELECT LOCAL VIDEO FILE */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300">Tải lên video (Kéo thả hoặc Chọn tệp) *</label>
            <div
              id="video-dropzone"
              onDragOver={handleDragOver}
              onDrop={handleDropVideo}
              onClick={() => videoInputRef.current?.click()}
              className="relative aspect-video w-full rounded-xl border-2 border-dashed border-white/20 hover:border-porange/50 bg-[#1e2129] flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden"
            >
              <input
                id="video-file-input"
                type="file"
                ref={videoInputRef}
                onChange={handleVideoFileChange}
                accept="video/*"
                className="hidden"
              />
              
              {videoUrl ? (
                <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                  {getYoutubeEmbedUrl(videoUrl) ? (
                    <iframe
                      src={getYoutubeEmbedUrl(videoUrl)!}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video src={videoUrl} controls className="w-full h-full object-contain animate-fade-in" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-gray-300 pointer-events-none">
                    Video Sẵn sàng
                  </div>
                </div>
              ) : uploadingVideo ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-porange animate-spin" />
                  <span className="text-xs text-gray-400 font-mono">Đang tải video lên server...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <div className="p-3 bg-white/5 rounded-full group-hover:bg-porange/10 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-porange" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Nhấn để chọn video từ máy tính hoặc kéo thả vào đây</span>
                  <span className="text-[10px] text-gray-500 font-mono">Định dạng hỗ trợ: MP4, WebM, OGG</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Mã định danh (ID - Tự động)</label>
              <input
                id="input-video-id"
                type="text"
                value={id}
                disabled
                className="bg-[#20232a] border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed font-mono"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Chủ đề (Category) *</label>
              <select
                id="select-video-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategory)}
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50"
              >
                <option value="Giới thiệu">Giới thiệu</option>
                <option value="Phim hoạt hình">Phim hoạt hình</option>
                <option value="Du lịch trải nghiệm">Du lịch trải nghiệm</option>
                <option value="Trao đổi công nghệ AI">Trao đổi công nghệ AI</option>
              </select>
            </div>

            {/* Title */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Tiêu đề Video *</label>
              <input
                id="input-video-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cuộc phiêu lưu kì thú"
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50"
              />
            </div>

            {/* Summary */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Tóm tắt nội dung phim/video (Justified) *</label>
              <textarea
                id="textarea-video-summary"
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Nhập nội dung mô tả chi tiết của phim..."
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50 text-justify"
              />
            </div>

            {/* Video Url string field */}
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Đường dẫn tệp Video (videoUrl) *</label>
              <input
                id="input-video-url"
                type="text"
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="Chọn tệp bên trên hoặc dán URL trực tiếp (Ví dụ URL Youtube, MP4,...)"
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono text-xs"
              />
            </div>

            {/* Thumbnail URL Input + Upload Small preview area */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">Đường dẫn hình ảnh Thumbnail *</label>
                <input
                  id="input-thumbnail-url"
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Dán URL hình ảnh hoặc tải ảnh lên bên phải"
                  className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono text-xs"
                />
              </div>

              {/* Upload image square */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400">Hình thu nhỏ (16:9)</span>
                <div
                  id="thumb-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={handleDropThumb}
                  onClick={() => thumbInputRef.current?.click()}
                  className="aspect-video w-full rounded-lg border-2 border-dashed border-white/20 hover:border-porange/50 bg-[#1e2129] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                >
                  <input
                    id="thumb-file-input"
                    type="file"
                    ref={thumbInputRef}
                    onChange={handleThumbFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Thumb Preview" className="w-full h-full object-cover" />
                  ) : uploadingThumb ? (
                    <RefreshCw className="w-5 h-5 text-porange animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-porange transition-colors" />
                      <span className="text-[9px] text-gray-500">Tải ảnh lên</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Thời lượng (duration) *</label>
              <input
                id="input-video-duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ví dụ: 03:15, 12:40"
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
              />
            </div>

            {/* Views */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Lượt xem ảo (views)</label>
              <input
                id="input-video-views"
                type="number"
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="bg-[#252831] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
              />
            </div>
          </div>

          {/* Form feedback */}
          {uploadError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {uploadError}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 border-t border-white/10 pt-4 mt-2 justify-end items-center">
            <button
              id="btn-add-video"
              onClick={handleAddVideo}
              className="btn-porange px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-101"
            >
              <Plus className="w-4 h-4" /> Thêm mới
            </button>

            {selectedVideoId && (
              <button
                id="btn-update-video"
                onClick={handleUpdateVideo}
                className="btn-pblue px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-101"
              >
                <RefreshCw className="w-4 h-4" /> Cập nhật
              </button>
            )}

            {selectedVideoId && (
              <button
                id="btn-delete-video"
                onClick={() => handleDeleteVideo()}
                className="px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all transform hover:scale-101 border bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border-red-500/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
            )}
          </div>
        </div>

        {/* CỘT BÊN PHẢI: DANH SÁCH VIDEO THEO NHÓM CHỦ ĐỀ */}
        <div className="lg:col-span-6 flex flex-col lg:h-full lg:max-h-[100%]">
          <div className="bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4 lg:h-full lg:max-h-[100%] min-h-[400px] lg:min-h-0">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm border-b border-white/10 pb-3 flex-shrink-0">
              <ListOrdered className="w-4 h-4 text-pblue" />
              Danh sách video phân theo chủ đề
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6 min-h-0">
              {groupedVideos.map((group) => {
                const categoryColor = 
                  group.category === "Giới thiệu" ? "text-pblue" :
                  group.category === "Phim hoạt hình" ? "text-pgreen" :
                  group.category === "Du lịch trải nghiệm" ? "text-porange" :
                  group.category === "Trao đổi công nghệ AI" ? "text-purple-400" :
                  "text-white";
                return (
                  <div id={`group-${group.category}`} key={group.category} className="flex flex-col gap-3">
                    <span className={`text-xs font-bold ${categoryColor} font-mono uppercase bg-[#2a2d36] px-3 py-1 rounded-md border border-white/5 self-start`}>
                      {group.category}
                    </span>

                    <div className="flex flex-col gap-3">
                      {group.items.length > 0 ? (
                        group.items.map((video) => {
                          const isEditingThis = selectedVideoId === video.id;
                          return (
                            <div
                              id={`mgmt-item-${video.id}`}
                              key={video.id}
                              onClick={() => handleSelectVideo(video)}
                              className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer relative transition-all duration-300 hover:bg-psub/70 hover:scale-[1.01] hover:shadow-md
                                ${isEditingThis 
                                  ? "bg-psub/90 border-porange/50 shadow-glow" 
                                  : "bg-psub/20 border-white/5"
                                }`}
                            >
                              {/* Left: Small 16:9 Thumbnail preview */}
                              <div className="w-20 md:w-28 aspect-video rounded-lg overflow-hidden bg-black/60 border border-white/5 relative flex-shrink-0">
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop";
                                  }}
                                />
                              </div>

                              {/* Middle: Metadata */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h4 className={`font-semibold text-xs line-clamp-1
                                    ${isEditingThis ? "text-porange" : "text-white"}`}
                                  >
                                    {video.title}
                                  </h4>
                                  <p className="text-[11px] text-gray-400 text-justify line-clamp-2 mt-1 leading-relaxed">
                                    {video.summary}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-1.5">
                                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {video.duration}</span>
                                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {video.views.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Right: Dedicated high-contrast Delete Button */}
                              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  id={`trash-btn-${video.id}`}
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all text-xs font-semibold border border-red-500/20 hover:border-red-500 shadow-sm active:scale-95"
                                  title="Xóa video này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">Xóa</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-gray-500 italic py-2 pl-2">Không có video trong danh mục này.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
