import { User } from "firebase/auth";
import { UserProfile } from "../types";
import { Play, ShieldAlert, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  profile: UserProfile | null;
  onLogout: () => Promise<void>;
}

export default function Header({ activeTab, setActiveTab, user, profile, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = profile?.role === "admin";

  const navItems = [
    { id: "home", label: "Trang chủ" },
    { id: "cartoon", label: "Phim hoạt hình" },
    { id: "travel", label: "Du lịch trải nghiệm" },
    { id: "ai", label: "Trao đổi công nghệ AI" },
  ];

  // Conditionally add Admin tab
  if (isAdmin) {
    navItems.push({ id: "management", label: "Quản lý Video" });
  }

  // Always add User / Contact tab
  navItems.push({ id: "users", label: "Quản lý người dùng & Liên hệ" });

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md py-[20px] flex items-center justify-between px-6 md:px-12 border-b border-white/10 shadow-lg shrink-0">
      {/* Logo Container */}
      <div 
        id="logo-container"
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => handleNavClick("home")}
      >
        {/* Biểu tượng truyền thông hiện đại ở bên trái (Kích thước 1.5 lần = 60px) - hiệu ứng play-flow-glow tách riêng */}
        <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-tr from-porange via-pblue to-pgreen p-[2.5px] flex items-center justify-center shadow-lg shrink-0 play-flow-glow">
          <div className="w-full h-full bg-[#202530] rounded-[14px] flex items-center justify-center">
            <Play className="w-[30px] h-[30px] text-porange fill-porange ml-[3px]" />
          </div>
        </div>
        
        {/* Logo hình /assets/Logo-PToonGo.png (Kích thước 1.5 lần = h-[54px]) - hiệu ứng logo-img-glow tách riêng */}
        <div className="flex items-center">
          <img 
            src="/assets/Logo-PToonGo.png" 
            alt="PToonGo Logo" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            className="h-[54px] w-auto max-w-[180px] object-contain logo-img-glow"
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav id="desktop-nav" className="hidden lg:flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform nav-item
                ${isActive 
                  ? "bg-porange/15 text-porange border border-porange/30 shadow-glow scale-101 font-semibold" 
                  : "text-gray-300 hover:text-white"
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Quick Info */}
      <div id="user-quick-info" className="hidden lg:flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3 bg-psub/80 px-3 py-1.5 rounded-full border border-white/10">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-white">
                {profile?.displayName || user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-[9px] text-gray-400 flex items-center gap-1 justify-end">
                {isAdmin ? (
                  <span className="text-porange flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  "User"
                )}
              </span>
            </div>
            <button 
              id="logout-btn-header"
              onClick={onLogout}
              className="p-1.5 rounded-full bg-porange/10 hover:bg-porange/30 text-porange hover:scale-105 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            id="login-btn-header"
            onClick={() => handleNavClick("users")}
            className="flex items-center gap-2 text-xs font-medium text-white bg-porange/10 hover:bg-porange border border-porange/30 hover:border-porange px-4 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_12px_rgba(233,103,46,0.5)]"
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng nhập
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        id="mobile-menu-btn"
        className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-dropdown-menu" className="absolute top-16 left-0 w-full bg-[#253040]/95 backdrop-blur-lg border-b border-white/10 flex flex-col p-6 gap-3 lg:hidden shadow-xl animate-in slide-in-from-top-4 duration-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                id={`mobile-nav-btn-${item.id}`}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-porange/20 text-porange font-semibold border-l-4 border-porange" 
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
          
          {/* User profile on mobile */}
          <div className="border-t border-white/10 pt-4 mt-2">
            {user ? (
              <div className="flex items-center justify-between bg-psub/80 px-4 py-2.5 rounded-lg border border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {profile?.displayName || user.displayName || user.email?.split("@")[0]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isAdmin ? "Admin" : "User"}
                  </span>
                </div>
                <button
                  id="mobile-logout-btn"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-porange bg-porange/10 px-3 py-1.5 rounded-lg hover:bg-porange/20 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={() => handleNavClick("users")}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-porange hover:bg-[#c9511e] py-2.5 rounded-lg transition-all"
              >
                <LogIn className="w-4 h-4" /> Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
