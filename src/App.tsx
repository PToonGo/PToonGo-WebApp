import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  getAllVideos, 
  createUserProfile, 
  getUserProfile,
  updateUserProfile
} from "./lib/dbService";
import { Video, UserProfile } from "./types";

// Import components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import CategoryPage from "./components/CategoryPage";
import VideoManagement from "./components/VideoManagement";
import UserManagement from "./components/UserManagement";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("home");

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Videos Database State
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);

  // 1. Fetch videos from Firestore
  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      const list = await getAllVideos();
      setVideos(list);
    } catch (error) {
      console.error("Error fetching videos from Firestore:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 2. Listen to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(true);

      if (currentUser) {
        try {
          // Fetch user profile from Firestore
          let userProfile = await getUserProfile(currentUser.uid);
          const isDefaultAdmin = currentUser.email === "ptoongo@gmail.com" || currentUser.email === "ptoong@gmail.com";

          if (!userProfile) {
            // Fallback: If profile doesn't exist, create one
            userProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
              role: isDefaultAdmin ? "admin" : "user",
              createdAt: Date.now()
            };
            await createUserProfile(userProfile);
          } else if (isDefaultAdmin && userProfile.role !== "admin") {
            // Self-correction: upgrade the existing user profile to admin
            userProfile.role = "admin";
            await updateUserProfile(userProfile);
          }
          setProfile(userProfile);
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Auth Actions
  const handleLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      // Friendly translations
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        throw new Error("Email hoặc Mật khẩu không chính xác.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Định dạng email không hợp lệ.");
      }
      throw new Error(error.message || "Lỗi đăng nhập.");
    }
  };

  const handleRegister = async (email: string, pass: string, name: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const isDefaultAdmin = email === "ptoongo@gmail.com" || email === "ptoong@gmail.com";
      const newProfile: UserProfile = {
        uid: credential.user.uid,
        email: email,
        displayName: name,
        role: isDefaultAdmin ? "admin" : "user",
        createdAt: Date.now()
      };
      await createUserProfile(newProfile);
      setProfile(newProfile);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email này đã được sử dụng bởi một tài khoản khác.");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Mật khẩu quá yếu. Vui lòng nhập tối thiểu 6 ký tự.");
      }
      throw new Error(error.message || "Lỗi tạo tài khoản.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setActiveTab("home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // 4. Render main view content
  const renderContent = () => {
    if (videosLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 font-mono gap-4">
          <div className="w-10 h-10 border-4 border-porange border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải cổng video PToonGo...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <Home
            videos={videos}
            onSelectVideo={(video) => {
              // If selected, navigate to the specific channel
              if (video.category === "Phim hoạt hình") setActiveTab("cartoon");
              else if (video.category === "Du lịch trải nghiệm") setActiveTab("travel");
              else if (video.category === "Trao đổi công nghệ AI") setActiveTab("ai");
            }}
            setActiveTab={setActiveTab}
          />
        );
      case "cartoon":
        return (
          <CategoryPage
            category="Phim hoạt hình"
            title="Thế Giới Hoạt Hình Vui Nhộn"
            slogan="Nơi lưu giữ tuổi thơ với những cuộc phiêu lưu diệu kỳ đầy màu sắc và tiếng cười"
            videos={videos}
            user={user}
            profile={profile}
            onNavigateToAuth={() => setActiveTab("users")}
          />
        );
      case "travel":
        return (
          <CategoryPage
            category="Du lịch trải nghiệm"
            title="Kênh Du Lịch Trải Nghiệm"
            slogan="Hành trình khám phá thiên nhiên kỳ thú, danh lam thắng cảnh và văn hóa con người bốn phương"
            videos={videos}
            user={user}
            profile={profile}
            onNavigateToAuth={() => setActiveTab("users")}
          />
        );
      case "ai":
        return (
          <CategoryPage
            category="Trao đổi công nghệ AI"
            title="Diễn Đàn Trí Tuệ Nhân Tạo"
            slogan="Trao đổi công nghệ AI tiên tiến, ứng dụng mô hình ngôn ngữ lớn và giải pháp kỹ xảo tự động"
            videos={videos}
            showChat={true}
            user={user}
            profile={profile}
            onNavigateToAuth={() => setActiveTab("users")}
          />
        );
      case "management":
        // Admin-only guard
        if (profile?.role !== "admin") {
          return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
              <span className="text-4xl">🔒</span>
              <h3 className="text-xl font-bold text-white">Truy cập bị từ chối</h3>
              <p className="text-sm text-gray-400 max-w-sm">Chỉ có tài khoản Quản trị viên (Admin) mới có quyền truy cập trang Quản lý Video này.</p>
              <button
                onClick={() => setActiveTab("users")}
                className="btn-porange px-6 py-2.5 rounded-full text-xs font-semibold"
              >
                Đăng nhập với quyền Admin
              </button>
            </div>
          );
        }
        return (
          <VideoManagement
            videos={videos}
            refreshVideos={fetchVideos}
            profile={profile}
          />
        );
      case "users":
        return (
          <UserManagement
            user={user}
            profile={profile}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-gray-400">Trang không tồn tại.</div>
        );
    }
  };

  return (
    <div id="ptoongo-app" className="min-h-screen bg-[#303545] text-gray-100 flex flex-col justify-between">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        profile={profile}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-6 md:px-12 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
