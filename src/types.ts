export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: number;
}

export type VideoCategory = "Giới thiệu" | "Phim hoạt hình" | "Du lịch trải nghiệm" | "Trao đổi công nghệ AI" | "Dự báo thời tiết";

export interface Video {
  id: string; // generated automatically, e.g., "intro-1", "cartoon-2", "travel-1", "ai-1"
  title: string;
  summary: string;
  category: VideoCategory;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  createdAt: number;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: number;
}
