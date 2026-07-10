import React, { createContext, useContext, useState } from "react";

export type Language = "VI" | "EN";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation / Header
  "Trang chủ": { VI: "Trang chủ", EN: "Home" },
  "Phim hoạt hình": { VI: "Phim hoạt hình", EN: "Cartoons" },
  "Du lịch trải nghiệm": { VI: "Du lịch trải nghiệm", EN: "Travel & Experience" },
  "Trao đổi công nghệ AI": { VI: "Trao đổi công nghệ AI", EN: "AI Tech Discussion" },
  "Quản lý Video": { VI: "Quản lý Video", EN: "Video Management" },
  "Quản lý người dùng & Liên hệ": { VI: "Quản lý người dùng & Liên hệ", EN: "User & Contact" },
  "Đăng nhập": { VI: "Đăng nhập", EN: "Log In" },
  "Đăng xuất": { VI: "Đăng xuất", EN: "Log Out" },

  // Home Page
  "Kênh Truyền Thông Số": { VI: "Kênh Truyền Thông Số", EN: "Digital Media Channel" },
  "Chào mừng đến với PToonGo - Hệ thống phân phối và lưu trữ video đa nền tảng tối ưu": {
    VI: "Chào mừng đến với PToonGo - Hệ thống phân phối và lưu trữ video đa nền tảng tối ưu",
    EN: "Welcome to PToonGo - The ultimate cross-platform video distribution and storage system"
  },
  "Trải nghiệm ngay": { VI: "Trải nghiệm ngay", EN: "Experience Now" },
  "VỀ CHÚNG TÔI": { VI: "VỀ CHÚNG TÔI", EN: "ABOUT US" },
  "Cổng thông tin giải trí & công nghệ hàng đầu Việt Nam": {
    VI: "Cổng thông tin giải trí & công nghệ hàng đầu Việt Nam",
    EN: "Vietnam's leading entertainment & technology portal"
  },
  "Hệ thống cung cấp trải nghiệm giải trí đặc sắc và kiến thức AI chuyên sâu toàn diện.": {
    VI: "Hệ thống cung cấp trải nghiệm giải trí đặc sắc và kiến thức AI chuyên sâu toàn diện.",
    EN: "The system provides unique entertainment experiences and comprehensive, in-depth AI knowledge."
  },
  "CHỦ ĐỀ TIÊU BIỂU": { VI: "CHỦ ĐỀ TIÊU BIỂU", EN: "FEATURED TOPICS" },
  "EXPLORE OUR CHANNELS & RICH VIDEO CATEGORIES": {
    VI: "KHÁM PHÁ CÁC KÊNH & CHỦ ĐỀ VIDEO PHONG PHÚ",
    EN: "EXPLORE OUR CHANNELS & RICH VIDEO CATEGORIES"
  },
  "Xem ngay": { VI: "Xem ngay", EN: "Watch Now" },
  "Đang tải cổng video PToonGo...": { VI: "Đang tải cổng video PToonGo...", EN: "Loading PToonGo video portal..." },

  // CategoryPage
  "Thế Giới Hoạt Hình Vui Nhộn": { VI: "Thế Giới Hoạt Hình Vui Nhộn", EN: "Fun Cartoon World" },
  "Nơi lưu giữ tuổi thơ với những cuộc phiêu lưu diệu kỳ đầy màu sắc và tiếng cười": {
    VI: "Nơi lưu giữ tuổi thơ với những cuộc phiêu lưu diệu kỳ đầy màu sắc và tiếng cười",
    EN: "Preserving childhood with colorful, laughter-filled magical adventures"
  },
  "Kênh Du Lịch Trải Nghiệm": { VI: "Kênh Du Lịch Trải Nghiệm", EN: "Travel & Experience Channel" },
  "Hành trình khám phá thiên nhiên kỳ thú, danh lam thắng cảnh và văn hóa con người bốn phương": {
    VI: "Hành trình khám phá thiên nhiên kỳ thú, danh lam thắng cảnh và văn hóa con người bốn phương",
    EN: "A journey to discover wondrous nature, scenic spots, and global cultures"
  },
  "Diễn Đàn Trí Tuệ Nhân Tạo": { VI: "Diễn Đàn Trí Tuệ Nhân Tạo", EN: "Artificial Intelligence Forum" },
  "Trao đổi công nghệ AI tiên tiến, ứng dụng mô hình ngôn ngữ lớn và giải pháp kỹ xảo tự động": {
    VI: "Trao đổi công nghệ AI tiên tiến, ứng dụng mô hình ngôn ngữ lớn và giải pháp kỹ xảo tự động",
    EN: "Exchange advanced AI tech, large language model applications, and automated visual effects solutions"
  },
  "Đang Trình Chiếu": { VI: "Đang Trình Chiếu", EN: "Now Showing" },
  "Thời tiết Du ký": { VI: "Thời tiết Du ký", EN: "Travel Weather" },
  "Dự báo thời tiết": { VI: "Dự báo thời tiết", EN: "Weather Forecast" },
  "Những hành trình thú vị": { VI: "Những hành trình thú vị", EN: "Exciting Journeys" },
  "Danh Sách Video Trong Kênh": { VI: "Danh Sách Video Trong Kênh", EN: "Channel Video List" },
  "Bản đồ thời tiết Việt Nam": { VI: "Bản đồ thời tiết Việt Nam", EN: "Vietnam Weather Map" },
  "Mở rộng": { VI: "Mở rộng", EN: "Zoom In" },
  "Thu nhỏ": { VI: "Thu nhỏ", EN: "Zoom Out" },
  "Đặt lại": { VI: "Đặt lại", EN: "Reset" },
  "Vui lòng": { VI: "Vui lòng", EN: "Please" },
  "đăng nhập": { VI: "đăng nhập", EN: "log in" },
  "để tham gia trò chuyện trực tuyến cùng cộng đồng.": {
    VI: "để tham gia trò chuyện trực tuyến cùng cộng đồng.",
    EN: "to join online chats with the community."
  },
  "Học hỏi và phát triển cùng trí tuệ nhân tạo.": {
    VI: "Học hỏi và phát triển cùng trí tuệ nhân tạo.",
    EN: "Learn and grow together with artificial intelligence."
  },
  "Nhập tin nhắn...": { VI: "Nhập tin nhắn...", EN: "Type a message..." },
  "Gửi": { VI: "Gửi", EN: "Send" },
  "Hôm nay": { VI: "Hôm nay", EN: "Today" },
  "Chủ Nhật": { VI: "Chủ Nhật", EN: "Sunday" },
  "Thứ Hai": { VI: "Thứ Hai", EN: "Monday" },
  "Thứ Ba": { VI: "Thứ Ba", EN: "Tuesday" },
  "Thứ Tư": { VI: "Thứ Tư", EN: "Wednesday" },
  "Thứ Năm": { VI: "Thứ Năm", EN: "Thursday" },
  "Thứ Sáu": { VI: "Thứ Sáu", EN: "Friday" },
  "Thứ Bảy": { VI: "Thứ Bảy", EN: "Saturday" },
  "Dự báo hành trình 7 ngày tới": { VI: "Dự báo hành trình 7 ngày tới", EN: "7-Day Journey Forecast" },
  "Dự báo hành trình 7 ngày tới:": { VI: "Dự báo hành trình 7 ngày tới:", EN: "7-Day Journey Forecast:" },
  "Điểm dừng du ký:": { VI: "Điểm dừng du ký:", EN: "Travel destination stop:" },
  "Chưa có video nào trong danh mục này. Vui lòng truy cập trang Quản lý Video để tải lên.": {
    VI: "Chưa có video nào trong danh mục này. Vui lòng truy cập trang Quản lý Video để tải lên.",
    EN: "No videos in this category yet. Please go to the Video Management page to upload."
  },
  "lượt xem": { VI: "lượt xem", EN: "views" },
  "Diễn Đàn Trực Tuyến - Trao đổi công nghệ AI": {
    VI: "Diễn Đàn Trực Tuyến - Trao đổi công nghệ AI",
    EN: "Online Forum - AI Tech Discussion"
  },
  "Kênh thảo luận công khai": { VI: "Kênh thảo luận công khai", EN: "Public Discussion Channel" },
  "tin nhắn": { VI: "tin nhắn", EN: "messages" },
  "Vui lòng đăng nhập": { VI: "Vui lòng đăng nhập", EN: "Please log in" },
  "Chưa có cuộc thảo luận nào. Hãy gửi tin nhắn đầu tiên!": {
    VI: "Chưa có cuộc thảo luận nào. Hãy gửi tin nhắn đầu tiên!",
    EN: "No discussions yet. Be the first to send a message!"
  },
  "Yêu cầu đăng nhập": { VI: "Yêu cầu đăng nhập", EN: "Login Required" },
  "Bạn cần đăng nhập tài khoản để xem diễn đàn thảo luận và trao đổi ý kiến về công nghệ AI.": {
    VI: "Bạn cần đăng nhập tài khoản để xem diễn đàn thảo luận và trao đổi ý kiến về công nghệ AI.",
    EN: "You need to log in to view the discussion forum and exchange opinions on AI technology."
  },
  "Đăng nhập / Đăng ký ngay": { VI: "Đăng nhập / Đăng ký ngay", EN: "Log In / Register Now" },
  "Nhập ý kiến trao đổi về AI của bạn...": {
    VI: "Nhập ý kiến trao đổi về AI của bạn...",
    EN: "Enter your thoughts and exchange opinions on AI..."
  },
  "Quy tắc thảo luận": { VI: "Quy tắc thảo luận", EN: "Discussion Rules" },
  "Chỉ trao đổi các nội dung xoay quanh công nghệ Trí tuệ nhân tạo (AI), Machine Learning và ứng dụng AI trong dựng phim hoạt hình hoặc làm video trải nghiệm.": {
    VI: "Chỉ trao đổi các nội dung xoay quanh công nghệ Trí tuệ nhân tạo (AI), Machine Learning và ứng dụng AI trong dựng phim hoạt hình hoặc làm video trải nghiệm.",
    EN: "Only exchange content centered around Artificial Intelligence (AI), Machine Learning, and AI applications in cartoon rendering or travel video production."
  },
  "Tôn trọng ý kiến người khác, không spam link quảng cáo hoặc chia sẻ các phần mềm độc hại.": {
    VI: "Tôn trọng ý kiến người khác, không spam link quảng cáo hoặc chia sẻ các phần mềm độc hại.",
    EN: "Respect others' opinions, do not spam promotional links, and do not share malicious software."
  },
  "Các bài đăng của Admin về hướng dẫn công nghệ AI sẽ được ghim trực tiếp trong mục video của kênh để các thành viên tiện theo dõi.": {
    VI: "Các bài đăng của Admin về hướng dẫn công nghệ AI sẽ được ghim trực tiếp trong mục video của kênh để các thành viên tiện theo dõi.",
    EN: "Admin's guide posts on AI tech will be pinned directly in the channel's video section for members' easy tracking."
  },
  "Vị trí hiện tại": { VI: "Vị trí hiện tại", EN: "Current Location" },
  "Độ ẩm": { VI: "Độ ẩm", EN: "Humidity" },
  "Sức gió": { VI: "Sức gió", EN: "Wind Speed" },
  "Lượt xem": { VI: "Lượt xem", EN: "Views" },
  "Tác giả": { VI: "Tác giả", EN: "Author" },
  "Tải lên bởi": { VI: "Tải lên bởi", EN: "Uploaded by" },
  "Thời lượng": { VI: "Thời lượng", EN: "Duration" },

  // Footer
  "Cổng Video Truyền Thông Đa Phương Tiện PToonGo.": {
    VI: "Cổng Video Truyền Thông Đa Phương Tiện PToonGo.",
    EN: "PToonGo Multimedia Video Portal."
  },
  "Bản quyền": { VI: "Bản quyền", EN: "Copyright" },
  "đã được đăng ký bảo hộ.": { VI: "đã được đăng ký bảo hộ.", EN: "all rights reserved." },
  "Liên hệ hỗ trợ": { VI: "Liên hệ hỗ trợ", EN: "Support Contact" },
  "Điều khoản dịch vụ": { VI: "Điều khoản dịch vụ", EN: "Terms of Service" },
  "Chính sách bảo mật": { VI: "Chính sách bảo mật", EN: "Privacy Policy" },

  // Home Page Additional
  "Giới Thiệu Hệ Thống": { VI: "Giới Thiệu Hệ Thống", EN: "System Introduction" },
  "Âm lượng mặc định: 50%": { VI: "Âm lượng mặc định: 50%", EN: "Default volume: 50%" },
  "Đang tải dữ liệu video giới thiệu...": { VI: "Đang tải dữ liệu video giới thiệu...", EN: "Loading introduction video..." },
  "Danh sách video giới thiệu": { VI: "Danh sách video giới thiệu", EN: "Introduction Video List" },
  "Không có video giới thiệu nào được tải lên.": { VI: "Không có video giới thiệu nào được tải lên.", EN: "No introduction videos uploaded." },
  "Chủ Đề Tiêu Biểu": { VI: "Chủ Đề Tiêu Biểu", EN: "Featured Topics" },
  "Không có video": { VI: "Không có video", EN: "No video" },
  "Chưa có video cho chủ đề này": { VI: "Chưa có video cho chủ đề này", EN: "No videos for this topic yet" },
  "Vui lòng truy cập trang quản lý để cập nhật thêm video mới cho chủ đề này.": {
    VI: "Vui lòng truy cập trang quản lý để cập nhật thêm video mới cho chủ đề này.",
    EN: "Please visit the management page to update new videos for this topic."
  },
  "Truy cập Kênh": { VI: "Truy cập Kênh", EN: "Visit Channel" },
  "Giới thiệu": { VI: "Giới thiệu", EN: "Introduction" },

  // User & Contact
  "ĐĂNG NHẬP": { VI: "ĐĂNG NHẬP", EN: "LOGIN" },
  "ĐĂNG KÝ": { VI: "ĐĂNG KÝ", EN: "REGISTER" },
  "Họ tên": { VI: "Họ tên", EN: "Full Name" },
  "Mật khẩu": { VI: "Mật khẩu", EN: "Password" },
  "Đăng nhập với email của bạn để tiếp cận nội dung chất lượng cao.": {
    VI: "Đăng nhập với email của bạn để tiếp cận nội dung chất lượng cao.",
    EN: "Log in with your email to access high-quality content."
  },
  "Tạo tài khoản mới để tương tác và lưu trữ các video yêu thích.": {
    VI: "Tạo tài khoản mới để tương tác và lưu trữ các video yêu thích.",
    EN: "Create a new account to interact and save your favorite videos."
  },
  "Vui lòng nhập Họ tên khi đăng ký.": { VI: "Vui lòng nhập Họ tên khi đăng ký.", EN: "Please enter your Full Name when registering." },
  "Đăng nhập thành công!": { VI: "Đăng nhập thành công!", EN: "Logged in successfully!" },
  "Đăng ký tài khoản thành công!": { VI: "Đăng ký tài khoản thành công!", EN: "Registered account successfully!" },
  "VUI LÒNG ĐĂNG NHẬP": { VI: "VUI LÒNG ĐĂNG NHẬP", EN: "PLEASE LOG IN" },
  "Để mở khóa đầy đủ tính năng và quản lý tài khoản cá nhân của bạn.": {
    VI: "Để mở khóa đầy đủ tính năng và quản lý tài khoản cá nhân của bạn.",
    EN: "To unlock full features and manage your personal account."
  },
  "Truy cập bị từ chối": { VI: "Truy cập bị từ chối", EN: "Access Denied" },
  "Chỉ có tài khoản Quản trị viên (Admin) mới có quyền truy cập trang Quản lý Video này.": {
    VI: "Chỉ có tài khoản Quản trị viên (Admin) mới có quyền truy cập trang Quản lý Video này.",
    EN: "Only Admin accounts have permission to access this Video Management page."
  },
  "Đăng nhập với quyền Admin": { VI: "Đăng nhập với quyền Admin", EN: "Log in as Admin" },
  "Trang không tồn tại.": { VI: "Trang không tồn tại.", EN: "Page does not exist." },
  "LIÊN HỆ VỚI CHÚNG TÔI": { VI: "LIÊN HỆ VỚI CHÚNG TÔI", EN: "CONTACT US" },
  "Nếu bạn có bất kỳ câu hỏi hoặc phản hồi nào, vui lòng gửi tin nhắn cho chúng tôi.": {
    VI: "Nếu bạn có bất kỳ câu hỏi hoặc phản hồi nào, vui lòng gửi tin nhắn cho chúng tôi.",
    EN: "If you have any questions or feedback, please send us a message."
  },
  "Nội dung tin nhắn": { VI: "Nội dung tin nhắn", EN: "Message Content" },
  "Nội dung liên hệ...": { VI: "Nội dung liên hệ...", EN: "Type your message here..." },
  "Gửi thông tin liên hệ": { VI: "Gửi thông tin liên hệ", EN: "Send Message" },
  "Số điện thoại (tùy chọn)": { VI: "Số điện thoại (tùy chọn)", EN: "Phone Number (optional)" },
  "Thông tin liên hệ của bạn đã được gửi thành công!": {
    VI: "Thông tin liên hệ của bạn đã được gửi thành công!",
    EN: "Your contact info has been sent successfully!"
  },
  "Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.": {
    VI: "Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
    EN: "Thank you! We will reply as soon as possible."
  },
  "Quản lý Người dùng": { VI: "Quản lý Người dùng", EN: "User Management" },
  "Danh sách tài khoản đăng ký trên hệ thống PToonGo": {
    VI: "Danh sách tài khoản đăng ký trên hệ thống PToonGo",
    EN: "List of registered accounts on PToonGo system"
  },
  "Họ tên & Email": { VI: "Họ tên & Email", EN: "Name & Email" },
  "Quyền hạn": { VI: "Quyền hạn", EN: "Role" },
  "Ngày đăng ký": { VI: "Ngày đăng ký", EN: "Registration Date" },
  "Hành động": { VI: "Hành động", EN: "Action" },
  "Admin": { VI: "Admin", EN: "Admin" },
  "User": { VI: "User", EN: "User" },
  "Bạn không thể tự hạ quyền của chính mình!": {
    VI: "Bạn không thể tự hạ quyền của chính mình!",
    EN: "You cannot demote yourself!"
  },

  // Video Management
  "Trang Quản lý Video": { VI: "Trang Quản lý Video", EN: "Video Management" },
  "Thêm & Chỉnh sửa Video": { VI: "Thêm & Chỉnh sửa Video", EN: "Add & Edit Video" },
  "Tiêu đề Video": { VI: "Tiêu đề Video", EN: "Video Title" },
  "Tóm tắt": { VI: "Tóm tắt", EN: "Summary" },
  "Chủ đề": { VI: "Chủ đề", EN: "Topic" },
  "Đường dẫn Video": { VI: "Đường dẫn Video", EN: "Video URL" },
  "Đường dẫn Hình ảnh": { VI: "Đường dẫn Hình ảnh", EN: "Thumbnail URL" },
  "Thời lượng (phút:giây)": { VI: "Thời lượng (phút:giây)", EN: "Duration (min:sec)" },
  "Số lượt xem ban đầu": { VI: "Số lượt xem ban đầu", EN: "Initial Views" },
  "Cập nhật Video": { VI: "Cập nhật Video", EN: "Update Video" },
  "Thêm Video Mới": { VI: "Thêm Video Mới", EN: "Add New Video" },
  "Danh sách Video Hiện Tại": { VI: "Danh sách Video Hiện Tại", EN: "Current Video List" },
  "ID Video": { VI: "ID Video", EN: "Video ID" },
  "Hủy": { VI: "Hủy", EN: "Cancel" },
  "Chọn file Video (.mp4)": { VI: "Chọn file Video (.mp4)", EN: "Select Video File (.mp4)" },
  "Chọn file Ảnh (.jpg/.png)": { VI: "Chọn file Ảnh (.jpg/.png)", EN: "Select Image File (.jpg/.png)" },
  "Đang tải video...": { VI: "Đang tải video...", EN: "Uploading video..." },
  "Đang tải ảnh...": { VI: "Đang tải ảnh...", EN: "Uploading image..." },

  // User Management Portal
  "Người Dùng & Liên Hệ": { VI: "Người Dùng & Liên Hệ", EN: "Users & Contact" },
  "Thành viên PToonGo": { VI: "Thành viên PToonGo", EN: "PToonGo Member" },
  "Quản trị viên (Admin)": { VI: "Quản trị viên (Admin)", EN: "Administrator (Admin)" },
  "Thành viên thường": { VI: "Thành viên thường", EN: "Regular Member" },
  "Ngày tham gia": { VI: "Ngày tham gia", EN: "Join Date" },
  "Đăng xuất tài khoản": { VI: "Đăng xuất tài khoản", EN: "Log Out Account" },
  "Đăng Nhập": { VI: "Đăng Nhập", EN: "Log In" },
  "Đăng Ký": { VI: "Đăng Ký", EN: "Register" },
  "Đăng nhập tài khoản PToonGo": { VI: "Đăng nhập tài khoản PToonGo", EN: "Log into PToonGo Account" },
  "Tạo tài khoản thành viên mới": { VI: "Tạo tài khoản thành viên mới", EN: "Create a New Member Account" },
  "Họ và tên *": { VI: "Họ và tên *", EN: "Full Name *" },
  "Nguyễn Văn A": { VI: "Nguyễn Văn A", EN: "John Doe" },
  "Email *": { VI: "Email *", EN: "Email *" },
  "Mật khẩu *": { VI: "Mật khẩu *", EN: "Password *" },
  "Ẩn mật khẩu": { VI: "Ẩn mật khẩu", EN: "Hide password" },
  "Hiện mật khẩu": { VI: "Hiện mật khẩu", EN: "Show password" },
  "Đăng Ký Tài Khoản": { VI: "Đăng Ký Tài Khoản", EN: "Register Account" },
  "Gửi ý kiến Liên hệ": { VI: "Gửi ý kiến Liên hệ", EN: "Send Contact Feedback" },
  "Họ tên của bạn": { VI: "Họ tên của bạn", EN: "Your Full Name" },
  "Email liên hệ *": { VI: "Email liên hệ *", EN: "Contact Email *" },
  "Số điện thoại": { VI: "Số điện thoại", EN: "Phone Number" },
  "Ý kiến/Nội dung liên hệ *": { VI: "Ý kiến/Nội dung liên hệ *", EN: "Contact Message/Feedback *" },
  "Nội dung ý kiến đóng góp của bạn...": { VI: "Nội dung ý kiến đóng góp của bạn...", EN: "Type your feedback or thoughts here..." },
  "Gửi thông tin liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.": {
    VI: "Gửi thông tin liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.",
    EN: "Contact feedback submitted successfully! We will reply as soon as possible."
  },
  "Gửi liên hệ": { VI: "Gửi liên hệ", EN: "Send Feedback" },
  "Danh sách Quản lý người dùng": { VI: "Danh sách Quản lý người dùng", EN: "User Management List" },
  "Làm mới": { VI: "Làm mới", EN: "Refresh" },
  "Vai trò (Role)": { VI: "Vai trò (Role)", EN: "Role" },
  "Xóa người dùng": { VI: "Xóa người dùng", EN: "Delete User" },
  "Đang tải dữ liệu người dùng...": { VI: "Đang tải dữ liệu người dùng...", EN: "Loading user data..." },
  "Không có dữ liệu người dùng nào.": { VI: "Không có dữ liệu người dùng nào.", EN: "No registered users found." },
  "Chào mừng tới Cổng Video PToonGo": { VI: "Chào mừng tới Cổng Video PToonGo", EN: "Welcome to PToonGo Video Portal" },
  "PToonGo tự hào là cổng thông tin trình chiếu video thế hệ mới, tích hợp các kênh nội dung giải trí và công nghệ hiện đại. Chúng tôi cung cấp các chương trình hoạt hình vui nhộn, các thước phim hành trình trải nghiệm du lịch thực tế và không gian trao đổi chia sẻ công nghệ AI tiên tiến.": {
    VI: "PToonGo tự hào là cổng thông tin trình chiếu video thế hệ mới, tích hợp các kênh nội dung giải trí và công nghệ hiện đại. Chúng tôi cung cấp các chương trình hoạt hình vui nhộn, các thước phim hành trình trải nghiệm du lịch thực tế và không gian trao đổi chia sẻ công nghệ AI tiên tiến.",
    EN: "PToonGo is proud to be a next-generation video streaming portal integrating modern entertainment and advanced technologies. We offer fun animation episodes, realistic travel adventure documentaries, and an interactive discussion space for cutting-edge AI technologies."
  },
  "Quyền lợi thành viên:": { VI: "Quyền lợi thành viên:", EN: "Member Benefits:" },
  "- Tham gia thảo luận ý kiến trực tuyến trong mục Trao đổi công nghệ AI.": {
    VI: "- Tham gia thảo luận ý kiến trực tuyến trong mục Trao đổi công nghệ AI.",
    EN: "- Join live discussion forums under the AI Tech Channel."
  },
  "- Đánh dấu lưu trữ và trải nghiệm mượt mà chất lượng hình ảnh sắc nét.": {
    VI: "- Đánh dấu lưu trữ và trải nghiệm mượt mà chất lượng hình ảnh sắc nét.",
    EN: "- Track bookmarks and enjoy ultra-crisp, smooth-streaming video playback."
  },
  "- Nhận các bản tin cập nhật công nghệ AI và lập trình web mới nhất từ tác giả NGUYEN QUANG PHUONG.": {
    VI: "- Nhận các bản tin cập nhật công nghệ AI và lập trình web mới nhất từ tác giả NGUYEN QUANG PHUONG.",
    EN: "- Receive AI and web development newsletters directly from creator NGUYEN QUANG PHUONG."
  },
  "Nếu bạn là quản trị viên hệ thống (Admin), vui lòng đăng nhập bằng tài khoản admin (ví dụ email ptoongo@gmail.com) để kích hoạt toàn bộ các tính năng đặc biệt: tải lên video mới, chỉnh sửa thông tin, xóa video và phân quyền thành viên trong toàn hệ thống.": {
    VI: "Nếu bạn là quản trị viên hệ thống (Admin), vui lòng đăng nhập bằng tài khoản admin (ví dụ email ptoongo@gmail.com) để kích hoạt toàn bộ các tính năng đặc biệt: tải lên video mới, chỉnh sửa thông tin, xóa video và phân quyền thành viên trong toàn hệ thống.",
    EN: "If you are a system administrator (Admin), please sign in with an admin account (such as ptoongo@gmail.com) to access all restricted special features: upload new videos, edit metadata, delete videos, and configure roles."
  },
  "Hỗ trợ kỹ thuật: support@ptoongo.com": { VI: "Hỗ trợ kỹ thuật: support@ptoongo.com", EN: "Technical Support: support@ptoongo.com" },
  "Địa chỉ liên hệ: Hà Nội, Việt Nam": { VI: "Địa chỉ liên hệ: Hà Nội, Việt Nam", EN: "Contact Address: Hanoi, Vietnam" },
  "Xác nhận đổi quyền của": { VI: "Xác nhận đổi quyền của", EN: "Confirm changing role of" },
  "thành": { VI: "thành", EN: "to" },
  "Cập nhật phân quyền thành công!": { VI: "Cập nhật phân quyền thành công!", EN: "Roles updated successfully!" },
  "Không có quyền thực hiện hoặc lỗi hệ thống: ": { VI: "Không có quyền thực hiện hoặc lỗi hệ thống: ", EN: "Permission denied or system error: " },
  "Xác nhận xóa tài khoản": { VI: "Xác nhận xóa tài khoản", EN: "Confirm deleting account" },
  "khỏi danh sách Firestore?": { VI: "khỏi danh sách Firestore?", EN: "from Firestore?" },
  "Xóa tài khoản thành công!": { VI: "Xóa tài khoản thành công!", EN: "Account deleted successfully!" },
  "Bạn không có quyền thêm video! Chỉ dành cho Quản trị viên.": {
    VI: "Bạn không có quyền thêm video! Chỉ dành cho Quản trị viên.",
    EN: "You do not have permission to add videos! Only for Admin."
  },
  "Vui lòng điền đầy đủ các thông tin bắt buộc (*)": {
    VI: "Vui lòng điền đầy đủ các thông tin bắt buộc (*)",
    EN: "Please fill out all required fields (*)"
  },
  "Thêm video mới thành công!": { VI: "Thêm video mới thành công!", EN: "Video added successfully!" },
  "Lỗi khi lưu video vào Firestore.": { VI: "Lỗi khi lưu video vào Firestore.", EN: "Error saving video to Firestore." },
  "Bạn không có quyền cập nhật video! Chỉ dành cho Quản trị viên.": {
    VI: "Bạn không có quyền cập nhật video! Chỉ dành cho Quản trị viên.",
    EN: "You do not have permission to update videos! Only for Admin."
  },
  "Cập nhật thông tin video thành công!": { VI: "Cập nhật thông tin video thành công!", EN: "Video updated successfully!" },
  "Lỗi khi cập nhật video.": { VI: "Lỗi khi cập nhật video.", EN: "Error updating video." },
  "Bạn không có quyền thực hiện chức năng xóa video! Chỉ có Quản trị viên (Admin) mới có quyền.": {
    VI: "Bạn không có quyền thực hiện chức năng xóa video! Chỉ có Quản trị viên (Admin) mới có quyền.",
    EN: "You do not have permission to delete videos! Only Admins can delete."
  },
  "Bạn có chắc chắn muốn xóa video": { VI: "Bạn có chắc chắn muốn xóa video", EN: "Are you sure you want to delete video" },
  "Hành động này sẽ xóa vĩnh viễn video khỏi cơ sở dữ liệu.": {
    VI: "Hành động này sẽ xóa vĩnh viễn video khỏi cơ sở dữ liệu.",
    EN: "This action will permanently delete this video from the database."
  },
  "Xóa video thành công!": { VI: "Xóa video thành công!", EN: "Video deleted successfully!" },
  "Lỗi khi xóa video.": { VI: "Lỗi khi xóa video.", EN: "Error deleting video." },
  "Copyright by": { VI: "Bản quyền thuộc về", EN: "Copyright by" },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_lang");
    return (saved as Language) || "VI";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
