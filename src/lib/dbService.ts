import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  getDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { Video, ChatMessage, UserProfile, VideoCategory } from "../types";

// Seed data definitions
const SEED_VIDEOS: Video[] = [
  {
    id: "intro-1",
    title: "Giới thiệu Cổng Video PToonGo",
    summary: "Chào mừng bạn đến với PToonGo - Cổng lưu trữ, chia sẻ và phát trực tuyến video chất lượng cao. Tại đây chúng tôi cung cấp giao diện mượt mà, tính năng quản trị tối ưu, hỗ trợ bảo mật và hệ thống phân quyền nâng cao cho cá nhân và tổ chức chuyên nghiệp.",
    category: "Giới thiệu",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
    duration: "09:56",
    views: 3200,
    createdAt: 1719878400000,
    uploadedBy: "system"
  },
  {
    id: "intro-2",
    title: "Hướng dẫn sử dụng hệ thống PToonGo",
    summary: "Video này hướng dẫn chi tiết các tính năng cơ bản của PToonGo bao gồm đăng ký tài khoản, tìm kiếm và xem phim hoạt hình, du lịch trải nghiệm, cách tham gia diễn đàn trao đổi công nghệ AI và đặc biệt là bảng điều khiển dành riêng cho Quản trị viên.",
    category: "Giới thiệu",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop",
    duration: "10:53",
    views: 1540,
    createdAt: 1719879400000,
    uploadedBy: "system"
  },
  {
    id: "cartoon-1",
    title: "Cuộc phiêu lưu kỳ thú của Sóc Nhỏ",
    summary: "Một câu chuyện hoạt hình đầy màu sắc về tình bạn và lòng dũng cảm của Sóc Nhỏ trong khu rừng rậm bí ẩn. Chuyến đi mang lại nhiều bài học giá trị cho các bạn nhỏ về tình yêu thiên nhiên và bảo vệ động vật hoang dã quanh ta.",
    category: "Phim hoạt hình",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop",
    duration: "00:15",
    views: 850,
    createdAt: 1719880400000,
    uploadedBy: "system"
  },
  {
    id: "cartoon-2",
    title: "Mèo ú thông minh và Bảo bối tương lai",
    summary: "Bộ phim hoạt hình giả tưởng vui nhộn kể về cuộc sống thường ngày của chú Mèo ú thông minh cùng những món bảo bối kỳ diệu đến từ tương lai giúp các bạn giải quyết các rắc rối hài hước trong học tập và cuộc sống.",
    category: "Phim hoạt hình",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop",
    duration: "00:14",
    views: 1200,
    createdAt: 1719881400000,
    uploadedBy: "system"
  },
  {
    id: "travel-1",
    title: "Hành trình khám phá Vịnh Hạ Long",
    summary: "Trải nghiệm hành trình kỳ vĩ ngắm nhìn toàn cảnh Vịnh Hạ Long - một trong bảy kỳ quan thiên nhiên thế giới mới. Từ những hòn đảo đá vôi nhô lên từ làn nước trong xanh đến cuộc sống yên bình tại làng chài nổi cổ kính.",
    category: "Du lịch trải nghiệm",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop",
    duration: "00:15",
    views: 2400,
    createdAt: 1719882400000,
    uploadedBy: "system"
  },
  {
    id: "travel-2",
    title: "Du lịch bụi Tây Bắc mùa lúa chín",
    summary: "Video ghi lại hành trình trải nghiệm bằng xe máy vượt qua những cung đường đèo hiểm trở bậc nhất Việt Nam để ngắm ruộng bậc thang chín vàng óng ả trải dài khắp sườn núi Mù Cang Chải và Sapa hùng vĩ.",
    category: "Du lịch trải nghiệm",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
    duration: "00:15",
    views: 1890,
    createdAt: 1719883400000,
    uploadedBy: "system"
  },
  {
    id: "ai-1",
    title: "Sự bùng nổ của AI trong sản xuất phim",
    summary: "Phân tích chuyên sâu về sự phát triển vượt bậc của trí tuệ nhân tạo (AI) trong lĩnh vực biên tập, kỹ xảo điện ảnh và lồng tiếng tự động. Khám phá cách các mô hình AI mới nhất giúp tối ưu hóa 90% thời gian sản xuất hậu kỳ.",
    category: "Trao đổi công nghệ AI",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop",
    duration: "12:14",
    views: 4100,
    createdAt: 1719884400000,
    uploadedBy: "system"
  },
  {
    id: "ai-2",
    title: "Ứng dụng Gemini AI trong cuộc sống thực tế",
    summary: "Tìm hiểu các kỹ thuật tương tác tiên tiến với Gemini AI của Google. Video hướng dẫn cụ thể cách ứng dụng AI để lập trình, viết kịch bản video hoạt hình tự động và lên kế hoạch lịch trình du lịch trải nghiệm cực nhanh.",
    category: "Trao đổi công nghệ AI",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop",
    duration: "00:29",
    views: 3300,
    createdAt: 1719885400000,
    uploadedBy: "system"
  }
];

// Helper to seed database if empty
export async function seedVideosIfEmpty() {
  try {
    const videosColRef = collection(db, "videos");
    const snapshot = await getDocs(videosColRef);
    if (snapshot.empty) {
      console.log("Seeding initial videos into Firestore...");
      for (const video of SEED_VIDEOS) {
        await setDoc(doc(db, "videos", video.id), video);
      }
      console.log("Seeding completed successfully.");
    }
  } catch (error) {
    console.warn("Seeding database was bypassed (this is expected for non-admin users when database is not yet seeded):", error);
  }
}

// 1. Get all videos
export async function getAllVideos(): Promise<Video[]> {
  try {
    await seedVideosIfEmpty();
    const videosColRef = collection(db, "videos");
    const snapshot = await getDocs(videosColRef);
    const videos: Video[] = [];
    snapshot.forEach((document) => {
      videos.push(document.data() as Video);
    });
    
    if (videos.length === 0) {
      console.log("No videos found in Firestore, returning local seed videos.");
      return SEED_VIDEOS;
    }
    
    // Sort by createdAt descending
    return videos.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching videos from Firestore, falling back to local seed videos:", error);
    return SEED_VIDEOS;
  }
}

// 2. Add a video
export async function addVideoToFirestore(video: Video): Promise<void> {
  const docRef = doc(db, "videos", video.id);
  await setDoc(docRef, video);
}

// 3. Update a video
export async function updateVideoInFirestore(video: Video): Promise<void> {
  const docRef = doc(db, "videos", video.id);
  await updateDoc(docRef, { ...video });
}

// 4. Delete a video
export async function deleteVideoFromFirestore(videoId: string): Promise<void> {
  const docRef = doc(db, "videos", videoId);
  await deleteDoc(docRef);
}

// 5. User Profile functions
export async function createUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, "users", profile.uid);
  await setDoc(docRef, profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const usersColRef = collection(db, "users");
  const snapshot = await getDocs(usersColRef);
  const users: UserProfile[] = [];
  snapshot.forEach((document) => {
    users.push(document.data() as UserProfile);
  });
  return users.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, "users", profile.uid);
  await updateDoc(docRef, { ...profile });
}

export async function deleteUserProfile(uid: string): Promise<void> {
  const docRef = doc(db, "users", uid);
  await deleteDoc(docRef);
}

// 6. AI Chat Forum Real-time listener
export function subscribeToMessages(callback: (messages: ChatMessage[]) => void) {
  const colRef = collection(db, "messages");
  const q = query(colRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((document) => {
      messages.push(document.data() as ChatMessage);
    });
    callback(messages);
  });
}

// 7. Add a message to chat
export async function addMessageToChat(text: string, userId: string, userEmail: string, userName: string): Promise<void> {
  const colRef = collection(db, "messages");
  const newDocRef = doc(colRef); // Auto generate ID
  const chatMsg: ChatMessage = {
    id: newDocRef.id,
    text,
    userId,
    userEmail,
    userName,
    createdAt: Date.now()
  };
  await setDoc(newDocRef, chatMsg);
}
