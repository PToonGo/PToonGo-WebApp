import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "../types";
import { 
  getAllUsers, 
  updateUserProfile, 
  deleteUserProfile 
} from "../lib/dbService";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Phone, 
  Send, 
  ShieldCheck, 
  Trash2, 
  UserCheck, 
  MessageSquare, 
  Sparkles,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface UserManagementProps {
  user: User | null;
  profile: UserProfile | null;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export default function UserManagement({
  user,
  profile,
  onLogin,
  onRegister,
  onLogout,
}: UserManagementProps) {
  const { t } = useLanguage();

  // Auth Form Toggling
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  // Admin User List States
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const isAdmin = profile?.role === "admin";

  // Fetch all users for Admin
  const fetchUsers = async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const list = await getAllUsers();
      setUsersList(list);
    } catch (err) {
      console.error("Error fetching users list:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [profile]);

  // Handle Auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      if (isLoginTab) {
        await onLogin(authEmail, authPassword);
        setAuthSuccess(t("Đăng nhập thành công!"));
      } else {
        if (!authName.trim()) {
          throw new Error(t("Vui lòng nhập Họ tên khi đăng ký."));
        }
        await onRegister(authEmail, authPassword, authName);
        setAuthSuccess(t("Đăng ký tài khoản thành công!"));
      }
      // Clear inputs
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch (err: any) {
      setAuthError(err.message || t("Xử lý tài khoản thất bại."));
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Contact submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess(false);
    setContactLoading(true);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError(t("Vui lòng nhập đầy đủ Họ tên, Email và Nội dung liên hệ."));
      setContactLoading(false);
      return;
    }

    try {
      // Save contact request to Firestore
      await addDoc(collection(db, "contacts"), {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage,
        createdAt: Date.now(),
      });

      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    } catch (err: any) {
      setContactError(err.message || t("Lỗi khi gửi liên hệ. Vui lòng thử lại."));
    } finally {
      setContactLoading(false);
    }
  };

  // Admin action: Change User Role
  const handleToggleRole = async (targetProfile: UserProfile) => {
    if (targetProfile.uid === user?.uid) {
      alert(t("Bạn không thể tự hạ quyền của chính mình!"));
      return;
    }

    const newRole = targetProfile.role === "admin" ? "user" : "admin";
    if (!window.confirm(`${t("Xác nhận đổi quyền của")} ${targetProfile.email} ${t("thành")} '${newRole}'?`)) {
      return;
    }

    try {
      const updated = { ...targetProfile, role: newRole as "admin" | "user" };
      await updateUserProfile(updated);
      await fetchUsers();
      alert(t("Cập nhật phân quyền thành công!"));
    } catch (err: any) {
      alert(t("Không có quyền thực hiện hoặc lỗi hệ thống: ") + err.message);
    }
  };

  // Admin action: Delete User
  const handleDeleteUser = async (targetUid: string, targetEmail: string) => {
    if (targetUid === user?.uid) {
      alert(t("Bạn không thể tự xóa tài khoản của chính mình!"));
      return;
    }

    if (!window.confirm(`${t("Xác nhận xóa tài khoản")} ${targetEmail} ${t("khỏi danh sách Firestore?")}`)) {
      return;
    }

    try {
      await deleteUserProfile(targetUid);
      await fetchUsers();
      alert(t("Xóa tài khoản thành công!"));
    } catch (err: any) {
      alert(t("Không có quyền thực hiện hoặc lỗi hệ thống: ") + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-12 animate-fade-in duration-500">
      
      {/* 1. Page Header */}
      <div className="border-b border-white/10 pb-2">
        <h2 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-2">
          <span className="w-2 h-6 bg-pgreen rounded-full"></span>
          {t("Người Dùng & Liên Hệ")}
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono">PORTAL ACCESS, REGISTER, AND CONTACT FORM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CỘT PHỤ/TRÁI: BẢNG ĐĂNG NHẬP / PROFILE / LIÊN HỆ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* USER CARD (IF LOGGED IN) */}
          {user ? (
            <div className="bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pgreen/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-porange via-pblue to-pgreen p-[2px]">
                  <div className="w-full h-full bg-[#20232a] rounded-full flex items-center justify-center text-xl font-bold font-mono text-white">
                    {profile?.displayName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display font-bold text-lg text-white">
                    {profile?.displayName || t("Thành viên PToonGo")}
                  </h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </span>
                  <div className="mt-1">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold font-mono text-porange uppercase bg-porange/10 border border-porange/30 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t("Quản trị viên (Admin)")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold font-mono text-pblue uppercase bg-pblue/10 border border-pblue/30 rounded-full">
                        {t("Thành viên thường")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-2 text-xs text-gray-400 font-mono">
                <span>UID: {user.uid}</span>
                <span>{t("Ngày tham gia")}: {profile ? new Date(profile.createdAt).toLocaleDateString() : "Hệ thống"}</span>
              </div>

              <button
                id="btn-logout-main"
                onClick={onLogout}
                className="w-full py-2.5 rounded-xl border border-porange/30 text-porange hover:bg-porange hover:text-white transition-all duration-300 font-semibold text-sm flex items-center justify-center gap-2 transform hover:scale-101 shadow-md"
              >
                <LogOut className="w-4 h-4" /> {t("Đăng xuất tài khoản")}
              </button>
            </div>
          ) : (
            /* TABBED AUTH FORM (IF NOT LOGGED IN) */
            <div className="bg-psub/40 rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
              {/* Tab selector */}
              <div className="flex border-b border-white/10 bg-psub/20">
                <button
                  id="tab-select-login"
                  onClick={() => {
                    setIsLoginTab(true);
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`flex-1 py-4 text-center font-display font-bold text-sm transition-all
                    ${isLoginTab 
                      ? "text-porange border-b-2 border-porange bg-psub/40" 
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {t("Đăng Nhập")}
                </button>
                <button
                  id="tab-select-signup"
                  onClick={() => {
                    setIsLoginTab(false);
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  className={`flex-1 py-4 text-center font-display font-bold text-sm transition-all
                    ${!isLoginTab 
                      ? "text-porange border-b-2 border-porange bg-psub/40" 
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {t("Đăng Ký")}
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAuthSubmit} className="p-6 flex flex-col gap-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400">
                  {isLoginTab ? t("Đăng nhập tài khoản PToonGo") : t("Tạo tài khoản thành viên mới")}
                </span>

                {/* Name field for Sign Up */}
                {!isLoginTab && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300">{t("Họ và tên *")}</label>
                    <div className="relative flex items-center">
                      <UserIcon className="absolute left-3 w-4 h-4 text-gray-500" />
                      <input
                        id="input-auth-name"
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder={t("Nguyễn Văn A")}
                        required
                        className="w-full bg-[#252831] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-porange/50"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">{t("Email *")}</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4 h-4 text-gray-500" />
                    <input
                      id="input-auth-email"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      required
                      className="w-full bg-[#252831] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
                    />
                  </div>
                </div>

                 {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300">{t("Mật khẩu *")}</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
                    <input
                      id="input-auth-password"
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#252831] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
                    />
                    <button
                      id="btn-toggle-password-visibility"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1.5 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors"
                      title={showPassword ? t("Ẩn mật khẩu") : t("Hiện mật khẩu")}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {authError && (
                  <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div className="p-3 text-xs bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                    {authSuccess}
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl btn-porange text-sm font-semibold mt-2 shadow-lg flex items-center justify-center gap-2"
                >
                  {authLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {isLoginTab ? t("Đăng Nhập") : t("Đăng Ký Tài Khoản")}
                </button>
              </form>
            </div>
          )}

          {/* FORM LIÊN HỆ (ALWAYS DISPLAYED FOR GENERAL USE) */}
          <div className="bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm border-b border-white/10 pb-3">
              <MessageSquare className="w-4 h-4 text-porange" />
              {t("Gửi ý kiến Liên hệ")}
            </h3>

            <form onSubmit={handleContactSubmit} className="flex flex-col gap-3">
              {/* Họ tên */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">{t("Họ và tên *")}</label>
                <input
                  id="input-contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t("Họ tên của bạn")}
                  className="bg-[#252831] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-porange/50"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">{t("Email liên hệ *")}</label>
                <input
                  id="input-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="bg-[#252831] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
                />
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">{t("Số điện thoại")}</label>
                <input
                  id="input-contact-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t("Số điện thoại")}
                  className="bg-[#252831] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-porange/50 font-mono"
                />
              </div>

              {/* Nội dung ý kiến (Justified preview) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">{t("Ý kiến/Nội dung liên hệ *")}</label>
                <textarea
                  id="textarea-contact-message"
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t("Nội dung ý kiến đóng góp của bạn...")}
                  className="bg-[#252831] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-porange/50 text-justify"
                />
              </div>

              {/* Contact Feedbacks */}
              {contactError && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  {contactError}
                </div>
              )}
              {contactSuccess && (
                <div className="p-3 text-xs bg-green-500/10 border border-green-500/30 rounded-xl text-green-400">
                  {t("Gửi thông tin liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.")}
                </div>
              )}

              {/* Send Button */}
              <button
                id="btn-send-contact"
                type="submit"
                disabled={contactLoading}
                className="w-full py-2.5 rounded-xl btn-pgreen font-semibold text-sm flex items-center justify-center gap-2 shadow-md transform hover:scale-101 transition-all"
              >
                {contactLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t("Gửi liên hệ")}
              </button>
            </form>
          </div>

        </div>

        {/* CỘT CHÍNH/PHẢI: QUẢN LÝ NGƯỜI DÙNG (ADMIN ONLY) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {isAdmin ? (
            <div className="bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-pblue" />
                  {t("Danh sách Quản lý người dùng")} ({usersList.length})
                </h3>
                <button
                  id="admin-refresh-users"
                  onClick={fetchUsers}
                  disabled={adminLoading}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title={t("Làm mới")}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* User Table list */}
              <div className="overflow-x-auto">
                <table id="users-admin-table" className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-mono">
                      <th className="py-3 px-2">{t("Họ tên")}</th>
                      <th className="py-3 px-2">Email / UID</th>
                      <th className="py-3 px-2 text-center">{t("Vai trò (Role)")}</th>
                      <th className="py-3 px-2 text-center">{t("Hành động")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length > 0 ? (
                      usersList.map((usr) => (
                        <tr id={`user-row-${usr.uid}`} key={usr.uid} className="border-b border-white/5 hover:bg-psub/20 transition-colors">
                          {/* Name */}
                          <td className="py-3 px-2 font-medium text-white">
                            {usr.displayName}
                          </td>
                          {/* Email & UID */}
                          <td className="py-3 px-2 font-mono text-gray-400">
                            <div>{usr.email}</div>
                            <div className="text-[10px] text-gray-600 truncate max-w-[120px]" title={usr.uid}>
                              {usr.uid}
                            </div>
                          </td>
                          {/* Role toggler */}
                          <td className="py-3 px-2 text-center">
                            <button
                              id={`toggle-role-${usr.uid}`}
                              onClick={() => handleToggleRole(usr)}
                              className={`px-2.5 py-1 rounded-full font-bold font-mono text-[9px] transition-all
                                ${usr.role === "admin"
                                  ? "bg-porange/20 text-porange border border-porange/40"
                                  : "bg-pblue/20 text-pblue border border-pblue/40 hover:bg-porange/10 hover:text-porange hover:border-porange/35"
                                }`}
                            >
                              {usr.role.toUpperCase()}
                            </button>
                          </td>
                          {/* Actions */}
                          <td className="py-3 px-2 text-center">
                            <button
                              id={`delete-user-${usr.uid}`}
                              onClick={() => handleDeleteUser(usr.uid, usr.email)}
                              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all"
                              title={t("Xóa người dùng")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">
                          {adminLoading ? t("Đang tải dữ liệu người dùng...") : t("Không có dữ liệu người dùng nào.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* GENERAL INFORMATION BOARD (FOR NON-ADMINS) */
            <div className="bg-psub/40 p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-porange/5 rounded-full blur-2xl"></div>
              
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-porange animate-pulse" />
                {t("Chào mừng tới Cổng Video PToonGo")}
              </h3>
              
              <div className="text-xs text-gray-300 space-y-4 leading-relaxed text-justify">
                <p>
                  {t("PToonGo tự hào là cổng thông tin trình chiếu video thế hệ mới, tích hợp các kênh nội dung giải trí và công nghệ hiện đại. Chúng tôi cung cấp các chương trình hoạt hình vui nhộn, các thước phim hành trình trải nghiệm du lịch thực tế và không gian trao đổi chia sẻ công nghệ AI tiên tiến.")}
                </p>
                <p>
                  <strong className="text-white">{t("Quyền lợi thành viên:")}</strong>
                  <br />
                  {t("- Tham gia thảo luận ý kiến trực tuyến trong mục Trao đổi công nghệ AI.")}
                  <br />
                  {t("- Đánh dấu lưu trữ và trải nghiệm mượt mà chất lượng hình ảnh sắc nét.")}
                  <br />
                  {t("- Nhận các bản tin cập nhật công nghệ AI và lập trình web mới nhất từ tác giả NGUYEN QUANG PHUONG.")}
                </p>
                <p>
                  {t("Nếu bạn là quản trị viên hệ thống (Admin), vui lòng đăng nhập bằng tài khoản admin (ví dụ email ptoongo@gmail.com) để kích hoạt toàn bộ các tính năng đặc biệt: tải lên video mới, chỉnh sửa thông tin, xóa video và phân quyền thành viên trong toàn hệ thống.")}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-2 font-mono text-[10px] text-gray-500">
                <span>{t("Hỗ trợ kỹ thuật: support@ptoongo.com")}</span>
                <span>{t("Địa chỉ liên hệ: Hà Nội, Việt Nam")}</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
