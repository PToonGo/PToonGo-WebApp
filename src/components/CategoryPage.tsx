import React, { useState, useEffect, useRef } from "react";
import { Video, ChatMessage, UserProfile } from "../types";
import { subscribeToMessages, addMessageToChat } from "../lib/dbService";
import { User } from "firebase/auth";
import { Play, Eye, Clock, MessageSquare, Send, Sparkles, User as UserIcon, Sun, Cloud, CloudRain, CloudLightning, Wind, ChevronDown, MapPin, Thermometer, Calendar } from "lucide-react";

interface WeatherForecast {
  day: string;
  status: "sunny" | "cloudy" | "rainy" | "stormy" | "windy";
  summary: string;
}

interface TravelLocation {
  id: string;
  name: string;
  fullName: string;
  tempMin: number;
  tempMax: number;
  currentStatus: "sunny" | "cloudy" | "rainy" | "stormy" | "windy";
  top: string;
  left: string;
  forecast: WeatherForecast[];
}

const TRAVEL_LOCATIONS: TravelLocation[] = [
  {
    id: "sapa",
    name: "Sapa",
    fullName: "Sapa (Lào Cai)",
    tempMin: 14,
    tempMax: 22,
    currentStatus: "cloudy",
    top: "10.4%",
    left: "26.8%",
    forecast: [
      { day: "Thứ Hai", status: "cloudy", summary: "Sương mù dày đặc vào sáng sớm, trời lạnh sâu về đêm, thích hợp thưởng thức đồ nướng Bản Phố." },
      { day: "Thứ Ba", status: "sunny", summary: "Trời hửng nắng nhẹ trưa chiều, mây bồng bềnh phủ đỉnh Fansipan, cảnh sắc mộng mơ." },
      { day: "Thứ Tư", status: "rainy", summary: "Mây mù rải rác, có mưa phùn nhẹ vài nơi, độ ẩm cao, khuyến cáo giữ ấm cơ thể." },
      { day: "Thứ Năm", status: "sunny", summary: "Nắng rực rỡ xua tan sương giá, tầm nhìn xa cực tốt, rất đẹp để trekking bản Cát Cát." },
      { day: "Thứ Sáu", status: "windy", summary: "Thời tiết ổn định, khô ráo, gió mát dịu êm thổi qua thung lũng Mường Hoa." },
      { day: "Thứ Bảy", status: "cloudy", summary: "Nhiệt độ giảm sâu, đêm có sương muối nhẹ, cần chuẩn bị trang phục ấm khi ra ngoài." },
      { day: "Chủ Nhật", status: "sunny", summary: "Mây thưa nắng ấm, trời trong xanh không một gợn mây, ngày nghỉ dưỡng tuyệt vời." }
    ]
  },
  {
    id: "hagiang",
    name: "Hà Giang",
    fullName: "Hà Giang",
    tempMin: 16,
    tempMax: 24,
    currentStatus: "windy",
    top: "7.6%",
    left: "40%",
    forecast: [
      { day: "Thứ Hai", status: "windy", summary: "Gió núi lồng lộng thổi qua đèo Mã Pí Lèng, trời se lạnh và khô ráo." },
      { day: "Thứ Ba", status: "sunny", summary: "Trời quang mây tạnh, thung lũng Sủng Là rực rỡ sắc hoa tam giác mạch dưới nắng." },
      { day: "Thứ Tư", status: "cloudy", summary: "Có sương mù nhẹ dọc theo sông Nho Quế lúc bình minh, trưa chiều hửng nắng." },
      { day: "Thứ Năm", status: "sunny", summary: "Thời tiết lý tưởng cho hành trình phượt cột cờ Lũng Cú, trời trong gió nhẹ." },
      { day: "Thứ Sáu", status: "stormy", summary: "Mây đen kéo đến rải rác, có thể có mưa rào nhẹ cục bộ vào chiều tối." },
      { day: "Thứ Bảy", status: "sunny", summary: "Mưa dứt nhanh, bầu trời trong lành trở lại, không khí mát mẻ sảng khoái." },
      { day: "Chủ Nhật", status: "sunny", summary: "Nắng nhẹ trải vàng trên những thửa ruộng bậc thang Hoàng Su Phì, cảnh sắc hữu tình." }
    ]
  },
  {
    id: "hanoi",
    name: "Hà Nội",
    fullName: "Hà Nội",
    tempMin: 26,
    tempMax: 34,
    currentStatus: "sunny",
    top: "19.6%",
    left: "44.16%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Trời nắng rực rỡ, gió thu thoang thoảng dịu mát quanh hồ Hoàn Kiếm." },
      { day: "Thứ Ba", status: "stormy", summary: "Ngày nắng nóng nhẹ, chiều tối có khả năng xuất hiện mưa giông giải nhiệt nhanh." },
      { day: "Thứ Tư", status: "cloudy", summary: "Mây thay đổi, trời mát mẻ dễ chịu, rất thích hợp dạo phố cổ và ăn kem Tràng Tiền." },
      { day: "Thứ Năm", status: "sunny", summary: "Bầu trời trong xanh không gợn mây, nắng vàng hanh hao đặc trưng của mùa thu Hà Nội." },
      { day: "Thứ Sáu", status: "sunny", summary: "Thời tiết hanh khô, độ ẩm giảm, tối và đêm mát mẻ dễ chịu." },
      { day: "Thứ Bảy", status: "sunny", summary: "Nắng nhẹ cả ngày, gió đông nam thổi mát dịu, thời tiết hoàn hảo." },
      { day: "Chủ Nhật", status: "cloudy", summary: "Có mây che phủ bớt nắng, nhiệt độ giảm nhẹ, không khí trong lành dễ chịu." }
    ]
  },
  {
    id: "halong",
    name: "Hạ Long",
    fullName: "Hạ Long",
    tempMin: 25,
    tempMax: 32,
    currentStatus: "sunny",
    top: "17.6%",
    left: "68.6%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Trời trong xanh, sóng êm, vịnh Hạ Long lung linh dưới ánh nắng vàng rực rỡ." },
      { day: "Thứ Ba", status: "sunny", summary: "Nắng đẹp cả ngày, gió biển mát rượi thích hợp cho các hoạt động du thuyền và chèo kayak." },
      { day: "Thứ Tư", status: "windy", summary: "Thời tiết oi bức nhẹ vào giữa trưa, chiều tối có gió lộng từ biển thổi vào mát mẻ." },
      { day: "Thứ Năm", status: "rainy", summary: "Khả năng có mưa rào nhẹ rải rác vào sáng sớm, trưa chiều trời hửng nắng đẹp." },
      { day: "Thứ Sáu", status: "sunny", summary: "Trời ít mây, sóng nhẹ, sóng biển êm ả thuận lợi cho việc tham quan các hang động." },
      { day: "Thứ Bảy", status: "sunny", summary: "Bầu trời trong lành, tầm nhìn trên vịnh cực kỳ thông thoáng và thơ mộng." },
      { day: "Chủ Nhật", status: "sunny", summary: "Nắng rực rỡ, gió biển thổi nhẹ, ngày cuối tuần hoàn hảo cho kỳ nghỉ dưỡng." }
    ]
  },
  {
    id: "hatinh",
    name: "Hà Tĩnh",
    fullName: "Hà Tĩnh",
    tempMin: 24,
    tempMax: 32,
    currentStatus: "sunny",
    top: "33.2%",
    left: "39.6%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Nắng nhẹ, không khí trong lành tại bãi biển Thiên Cầm, sóng êm gió mát dễ chịu." },
      { day: "Thứ Ba", status: "sunny", summary: "Thời tiết khô ráo, ngày nắng ráo rất thuận lợi cho việc viếng Ngã ba Đồng Lộc." },
      { day: "Thứ Tư", status: "cloudy", summary: "Mây nhẹ bao phủ bớt nắng nóng trưa chiều, tối mát mẻ thích hợp dạo chơi kỳ thú." },
      { day: "Thứ Năm", status: "windy", summary: "Gió mát núi Hồng Lĩnh thổi đều, bầu trời trong lành sảng khoái." },
      { day: "Thứ Sáu", status: "sunny", summary: "Trời nắng đẹp cả ngày, thích hợp cho các hoạt động tham quan di tích lịch sử Nguyễn Du." },
      { day: "Thứ Bảy", status: "cloudy", summary: "Có mây rải rác che mát dải đất miền Trung, nhiệt độ ôn hòa dễ chịu." },
      { day: "Chủ Nhật", status: "sunny", summary: "Ngày cuối tuần đầy nắng ấm, không khí trong lành tuyệt đối, sóng vỗ êm đềm." }
    ]
  },
  {
    id: "hue",
    name: "Huế",
    fullName: "Huế",
    tempMin: 24,
    tempMax: 31,
    currentStatus: "rainy",
    top: "46.4%",
    left: "57.6%",
    forecast: [
      { day: "Thứ Hai", status: "rainy", summary: "Mưa bay lãng đãng trên dòng sông Hương, tạo nên vẻ trầm mặc cổ kính của cố đô." },
      { day: "Thứ Ba", status: "rainy", summary: "Mưa rào rải rác ngắt quãng, trời mát mẻ, chiều tối có sương mờ mờ ảo ảo." },
      { day: "Thứ Tư", status: "sunny", summary: "Thời tiết chuyển biến tốt, trời tạnh ráo hoàn toàn và hửng nắng ấm dịu dàng." },
      { day: "Thứ Năm", status: "sunny", summary: "Ngày nắng ráo, gió nhẹ từ đèo Hải Vân thổi về, thích hợp tham quan Đại Nội." },
      { day: "Thứ Sáu", status: "cloudy", summary: "Mây nhiều âm u nhẹ, không khí se lạnh lãng mạn thích hợp thưởng trà cung đình." },
      { day: "Thứ Bảy", status: "stormy", summary: "Có mưa giông bất chợt vào cuối buổi chiều, cần mang theo ô/dù khi dạo phố." },
      { day: "Chủ Nhật", status: "sunny", summary: "Bầu trời tạnh ráo trở lại, nắng hồng nhẹ ấm áp tỏa sáng lăng tẩm cổ kính." }
    ]
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    fullName: "Đà Nẵng",
    tempMin: 25,
    tempMax: 33,
    currentStatus: "sunny",
    top: "49.2%",
    left: "66.9%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Nắng đẹp rực rỡ trên bãi biển Mỹ Khê, sóng vỗ nhẹ nhàng thích hợp tắm biển." },
      { day: "Thứ Ba", status: "sunny", summary: "Trời trong xanh, tầm nhìn tuyệt vời từ đỉnh bán đảo Sơn Trà và chùa Linh Ứng." },
      { day: "Thứ Tư", status: "sunny", summary: "Nắng ấm chan hòa cả ngày, tối trời mát dịu lộng gió rất đẹp để xem Cầu Rồng phun lửa." },
      { day: "Thứ Năm", status: "cloudy", summary: "Thời tiết mát mẻ trên đỉnh Bà Nà Hills, có mây mù nhẹ lướt qua Cầu Vàng kỳ ảo." },
      { day: "Thứ Sáu", status: "stormy", summary: "Khả năng có mưa giông nhiệt ngắn hạn vào chiều muộn, tan nhanh sau 30 phút." },
      { day: "Thứ Bảy", status: "sunny", summary: "Bầu trời trong lành trở lại, gió mát từ sông Hàn thổi lồng lộng cả đêm." },
      { day: "Chủ Nhật", status: "sunny", summary: "Nắng nhẹ thanh bình, nhiệt độ dễ chịu, rất lý tưởng để dạo chơi phố cổ Hội An lân cận." }
    ]
  },
  {
    id: "nhatrang",
    name: "Nha Trang",
    fullName: "Nha Trang",
    tempMin: 26,
    tempMax: 34,
    currentStatus: "sunny",
    top: "70.4%",
    left: "71.7%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Nắng vàng biển xanh cát trắng, vịnh Nha Trang hiền hòa đón du khách tham quan." },
      { day: "Thứ Ba", status: "sunny", summary: "Trời quang đãng tuyệt đối, sóng nhẹ êm đềm cực kỳ thuận lợi cho tour lặn ngắm san hô." },
      { day: "Thứ Tư", status: "sunny", summary: "Thời tiết ổn định, ngày nắng rực rỡ, chiều tối có gió biển thổi lồng lộng mát mẻ." },
      { day: "Thứ Năm", status: "cloudy", summary: "Có mây mỏng che bớt nắng nóng vào buổi trưa, không khí dễ chịu cả ngày." },
      { day: "Thứ Sáu", status: "sunny", summary: "Trời nắng đẹp thích hợp cho các hoạt động vui chơi giải trí ngoài trời tại VinWonders." },
      { day: "Thứ Bảy", status: "sunny", summary: "Thời tiết ôn hòa ấm áp, buổi tối mát mẻ thích hợp dạo chợ đêm Nha Trang." },
      { day: "Chủ Nhật", status: "sunny", summary: "Nắng rực rỡ ngập tràn, bãi tắm nhộn nhịp dưới làn nước trong xanh như ngọc." }
    ]
  },
  {
    id: "vungtau",
    name: "Vũng Tàu",
    fullName: "Vũng Tàu",
    tempMin: 27,
    tempMax: 33,
    currentStatus: "windy",
    top: "82%",
    left: "46%",
    forecast: [
      { day: "Thứ Hai", status: "windy", summary: "Gió biển thổi mạnh mẽ qua Bãi Sau, bầu trời trong lành lộng gió biển mát rượi." },
      { day: "Thứ Ba", status: "sunny", summary: "Ngày nắng ráo, gió lộng mát mẻ, thích hợp ghé thăm ngọn hải đăng Vũng Tàu." },
      { day: "Thứ Tư", status: "cloudy", summary: "Mây thay đổi rải rác, biển êm sóng nhẹ, tối lộng gió biển trong lành dễ chịu." },
      { day: "Thứ Năm", status: "sunny", summary: "Trời nắng rực rỡ trưa chiều, độ ẩm cao thích hợp cho hoạt động thể thao bãi biển." },
      { day: "Thứ Sáu", status: "rainy", summary: "Khả năng có mưa rào nhẹ thoảng qua vào chiều tối, giải nhiệt nhanh cho thành phố." },
      { day: "Thứ Bảy", status: "sunny", summary: "Thời tiết mát dịu sau mưa, bầu trời quang mây, sóng biển vỗ về êm ả." },
      { day: "Chủ Nhật", status: "sunny", summary: "Cuối tuần đầy nắng vàng và gió lộng, thời tiết lý tưởng cho chuyến dã ngoại gia đình." }
    ]
  },
  {
    id: "camau",
    name: "Cà Mau",
    fullName: "Cà Mau",
    tempMin: 26,
    tempMax: 32,
    currentStatus: "rainy",
    top: "88.98%",
    left: "18.1%",
    forecast: [
      { day: "Thứ Hai", status: "rainy", summary: "Mưa rào mùa hè tắm mát rừng đước ngập mặn Năm Căn, không khí trong lành mát rượi." },
      { day: "Thứ Ba", status: "sunny", summary: "Trời hửng nắng ấm sau cơn mưa dài, đất mũi Cà Mau đón những làn gió mát lành." },
      { day: "Thứ Tư", status: "stormy", summary: "Có mây dông phát triển vào buổi chiều, đề phòng sấm chớp giông lốc cục bộ." },
      { day: "Thứ Năm", status: "cloudy", summary: "Ngày nắng gián đoạn, mây trắng bồng bềnh, thích hợp đi xuồng ba lá khám phá rừng u minh." },
      { day: "Thứ Sáu", status: "rainy", summary: "Thời tiết mát mẻ dễ chịu, độ ẩm cao, chiều tối có mưa rào rải rác giải nhiệt." },
      { day: "Thứ Bảy", status: "sunny", summary: "Nắng rực rỡ từ sáng sớm, bầu trời trong trẻo vô cùng thích hợp chụp ảnh tại Cột mốc tọa độ." },
      { day: "Chủ Nhật", status: "sunny", summary: "Thời tiết ôn hòa ổn định, gió nhẹ từ biển Tây thổi vào mang hương vị phù sa ấm áp." }
    ]
  },
  {
    id: "phuquoc",
    name: "Phú Quốc",
    fullName: "Phú Quốc",
    tempMin: 27,
    tempMax: 33,
    currentStatus: "sunny",
    top: "83.2%",
    left: "7.3%",
    forecast: [
      { day: "Thứ Hai", status: "sunny", summary: "Hoàng hôn buông xuống Bãi Trường nhuộm đỏ cả một vùng trời biển Phú Quốc lãng mạn." },
      { day: "Thứ Ba", status: "sunny", summary: "Nắng vàng rực rỡ, sóng êm nước trong như pha lê tại quần đảo An Thới." },
      { day: "Thứ Tư", status: "sunny", summary: "Thời tiết hoàn hảo cho kỳ nghỉ dưỡng sang trọng, trời trong xanh không một gợn mây." },
      { day: "Thứ Năm", status: "sunny", summary: "Gió biển nam thổi mát dịu, nắng ấm rực rỡ thích hợp đi dạo Grand World." },
      { day: "Thứ Sáu", status: "cloudy", summary: "Trời nhiều mây hơn vào buổi chiều, sóng vỗ nhẹ, không khí biển cả trong lành." },
      { day: "Thứ Bảy", status: "rainy", summary: "Xuất hiện mưa rào rải rác chớp nhoáng vào giữa trưa, chiều lại hửng nắng vàng ươm." },
      { day: "Chủ Nhật", status: "sunny", summary: "Ngày nắng rực rỡ sóng yên biển lặng tuyệt đối, biển đảo đón luồng sinh khí mới tươi vui." }
    ]
  },
  {
    id: "condao",
    name: "Côn Đảo",
    fullName: "Côn Đảo",
    tempMin: 26,
    tempMax: 32,
    currentStatus: "windy",
    top: "91.8%",
    left: "35.2%",
    forecast: [
      { day: "Thứ Hai", status: "windy", summary: "Gió đại dương thổi lồng lộng qua bãi Đầm Trầu hoang sơ, bầu trời trong vắt thanh bình." },
      { day: "Thứ Ba", status: "sunny", summary: "Thời tiết nắng ráo hiền hòa, sóng vỗ nhẹ nhàng thích hợp viếng nghĩa trang Hàng Dương." },
      { day: "Thứ Tư", status: "sunny", summary: "Trời trong mây trắng, nắng vàng rực rỡ rọi xuống làn nước biển xanh ngọc bích cực kỳ thơ mộng." },
      { day: "Thứ Năm", status: "sunny", summary: "Thời tiết mát mẻ ôn hòa, gió đông bắc dịu nhẹ thích hợp dạo quanh cung đường biển tuyệt đẹp." },
      { day: "Thứ Sáu", status: "cloudy", summary: "Mây mỏng che mát bầu trời buổi trưa, gió mát lộng mang hơi thở mặn mòi của biển cả." },
      { day: "Thứ Bảy", status: "rainy", summary: "Có khả năng mưa rào thoảng qua vào đêm, ngày nắng ráo lộng gió sảng khoái." },
      { day: "Chủ Nhật", status: "sunny", summary: "Nắng lung linh ngập tràn toàn đảo, biển êm đềm thích hợp cho các hành trình khám phá thiên nhiên." }
    ]
  }
];

const getWeatherIcon = (status: "sunny" | "cloudy" | "rainy" | "stormy" | "windy", className = "w-5 h-5") => {
  switch (status) {
    case "sunny":
      return <Sun className={`${className} text-amber-400 animate-spin`} style={{ animationDuration: "12s" }} />;
    case "cloudy":
      return <Cloud className={`${className} text-sky-300 animate-pulse`} />;
    case "rainy":
      return <CloudRain className={`${className} text-blue-400 animate-bounce`} style={{ animationDuration: "3s" }} />;
    case "stormy":
      return <CloudLightning className={`${className} text-violet-400 animate-pulse`} />;
    case "windy":
      return <Wind className={`${className} text-teal-300 animate-pulse`} />;
  }
};

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

  // States for weather mapping widget in Travel tab
  const [selectedLocationId, setSelectedLocationId] = useState<string>("hanoi");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedLocation = TRAVEL_LOCATIONS.find((loc) => loc.id === selectedLocationId) || TRAVEL_LOCATIONS[2];

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
          category === "Du lịch trải nghiệm" ? (
            /* 2-column layout for Travel Tab */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: "Hành trình mới" */}
              <div className="xl:col-span-5 flex flex-col gap-6 bg-psub/40 p-5 rounded-2xl border border-white/10 shadow-lg self-stretch h-full">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-base font-display font-semibold text-white tracking-wide flex items-center gap-2">
                    <Play className="w-4 h-4 text-porange fill-current" />
                    Hành trình mới
                  </h3>
                </div>

                {/* Video Player Box */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
                  {!isPlayingPrimary ? (
                    <div 
                      onClick={() => setIsPlayingPrimary(true)}
                      className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center bg-black"
                    >
                      <img 
                        src={selectedVideo.thumbnailUrl} 
                        alt={selectedVideo.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-porange flex items-center justify-center text-white shadow-[0_0_25px_rgba(249,115,22,0.95)] hover:shadow-[0_0_35px_rgba(249,115,22,1)] border-2 border-white/30 transform group-hover:scale-110 transition-all duration-300 animate-pulse">
                          <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : getYoutubeEmbedUrl(selectedVideo.videoUrl) ? (
                    <iframe
                      id="category-primary-player-yt-travel"
                      src={`${getYoutubeEmbedUrl(selectedVideo.videoUrl)}?autoplay=1`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      id="category-primary-player-travel"
                      ref={primaryPlayerRef}
                      src={selectedVideo.videoUrl}
                      poster={selectedVideo.thumbnailUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Title, category, summary below video player */}
                <div className="flex flex-col gap-4 flex-grow">
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

                  <div className="flex items-center gap-6 text-xs text-gray-400 font-mono border-t border-white/10 pt-4 mt-auto">
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

              {/* Right Column: "Thời tiết Du ký" (2 Panels) */}
              <div className="xl:col-span-7 flex flex-col gap-4 bg-psub/40 p-5 rounded-2xl border border-white/10 shadow-lg self-stretch">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="text-base font-display font-semibold text-white tracking-wide flex items-center gap-2">
                    <Sun className="w-4 h-4 text-porange animate-spin" style={{ animationDuration: '15s' }} />
                    Thời tiết Du ký
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-grow">
                  {/* Left Panel: Vietnam Tech AI Map (md:col-span-5) */}
                  <div className="md:col-span-5 relative bg-gradient-to-b from-black/80 to-black/95 border border-white/10 rounded-xl aspect-[9/16] w-full overflow-hidden shadow-2xl">
                    {/* Background 3D Vietnam Map Image */}
                    <div 
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80 pointer-events-none"
                      style={{ backgroundImage: "url('/assets/3D_vn_map.png')" }}
                    />

                    {/* Cyber grids & HUD overlays */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
                    <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/70"></div>

                    {/* Cyber Neon Vietnam Map connection line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <style>{`
                        @keyframes cyber-dash-flow {
                          to {
                            stroke-dashoffset: -40;
                          }
                        }
                        @keyframes cyber-pulse {
                          0%, 100% {
                            opacity: 0.6;
                            filter: drop-shadow(0 0 1px #f97316) drop-shadow(0 0 3px #f97316);
                          }
                          50% {
                            opacity: 1;
                            filter: drop-shadow(0 0 3px #f97316) drop-shadow(0 0 8px #f97316);
                          }
                        }
                        .animate-cyber-flow {
                          animation: cyber-dash-flow 3s linear infinite;
                        }
                        .animate-cyber-pulse {
                          animation: cyber-pulse 2s ease-in-out infinite;
                        }
                      `}</style>
                      <defs>
                        <linearGradient id="cyber-grad-map" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>

                      {/* Wide Glow Aura Path */}
                      <path 
                        d="M 40 7.6 L 26.8 10.4 L 44.16 19.6 L 68.6 17.6 L 39.6 33.2 L 57.6 46.4 L 66.9 49.2 L 71.7 70.4 L 46 82 L 18.1 88.98 L 7.3 83.2" 
                        fill="none" 
                        stroke="url(#cyber-grad-map)" 
                        strokeWidth="2.5" 
                        opacity="0.3"
                        className="animate-cyber-pulse"
                      />

                      {/* Main Dynamic Neon Travel Line (North to South) */}
                      <path 
                        d="M 40 7.6 L 26.8 10.4 L 44.16 19.6 L 68.6 17.6 L 39.6 33.2 L 57.6 46.4 L 66.9 49.2 L 71.7 70.4 L 46 82 L 18.1 88.98 L 7.3 83.2" 
                        fill="none" 
                        stroke="url(#cyber-grad-map)" 
                        strokeWidth="1.5" 
                        strokeDasharray="6 4"
                        className="animate-cyber-flow"
                      />

                      {/* Fine Bright Core Line */}
                      <path 
                        d="M 40 7.6 L 26.8 10.4 L 44.16 19.6 L 68.6 17.6 L 39.6 33.2 L 57.6 46.4 L 66.9 49.2 L 71.7 70.4 L 46 82 L 18.1 88.98 L 7.3 83.2" 
                        fill="none" 
                        stroke="#ffffff" 
                        strokeWidth="0.5" 
                        opacity="0.9"
                      />

                      <circle cx="35.2" cy="91.8" r="1.5" fill="#f97316" opacity="0.8" className="animate-ping" />
                      <circle cx="35.2" cy="91.8" r="0.8" fill="#f97316" />
                      <circle cx="7.3" cy="83.2" r="1.5" fill="#f97316" opacity="0.8" className="animate-ping" />
                      <circle cx="7.3" cy="83.2" r="0.8" fill="#f97316" />
                    </svg>

                    {/* Location Nodes */}
                    {TRAVEL_LOCATIONS.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => {
                            setSelectedLocationId(loc.id);
                            setIsDropdownOpen(false);
                          }}
                          className="absolute group focus:outline-none transition-all duration-300"
                          style={{ top: loc.top, left: loc.left }}
                        >
                          {/* Pulsing Target Dot */}
                          <div className="relative flex items-center justify-center">
                            <div className={`absolute w-3.5 h-3.5 rounded-full animate-ping opacity-60 transition-colors
                              ${isSelected ? "bg-porange" : "bg-pblue group-hover:bg-porange/50"}`} 
                            />
                            <div className={`w-2.5 h-2.5 rounded-full shadow-md border border-white/30 transition-all duration-300
                              ${isSelected ? "bg-porange scale-110" : "bg-pblue group-hover:bg-porange"}`} 
                            />
                          </div>

                          {/* Tech badge card floating above the node */}
                          <div className={`absolute -top-7 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-md border text-[9px] font-medium transition-all duration-300 shadow-md flex items-center gap-1 whitespace-nowrap
                            ${isSelected 
                              ? "bg-black border-porange text-porange font-bold scale-105 z-20 shadow-[0_0_12px_rgba(249,115,22,0.4)]" 
                              : "bg-black/85 border-white/10 text-gray-300 group-hover:text-white group-hover:border-white/25 z-10"}`}
                          >
                            <span className="max-w-[70px] truncate">{loc.name}</span>
                            <span className="flex items-center gap-0.5">
                              {getWeatherIcon(loc.currentStatus, "w-3 h-3")}
                              <span className="font-mono text-[8px]">{loc.tempMin}-{loc.tempMax}°</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    <div className="absolute top-2 left-2 text-[8px] font-mono text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
                      GPS COORDS: ACTIVE
                    </div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
                      AI SATELLITE MAP v2.5
                    </div>
                  </div>

                  {/* Right Panel: Choice Dropdown & 7 Days Forecast (md:col-span-7) */}
                  <div className="md:col-span-7 flex flex-col gap-4 min-h-0">
                    {/* Choose location menu */}
                    <div className="relative">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block mb-1">
                        Điểm dừng du ký:
                      </label>
                      <button
                        id="travel-location-dropdown-btn"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between bg-black/50 border border-white/10 hover:border-porange/40 transition-colors px-4 py-2.5 rounded-xl text-xs font-semibold text-white text-left focus:outline-none"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-porange animate-bounce" />
                          {selectedLocation.fullName}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Floating custom dropdown menu list */}
                      {isDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-black/95 border border-white/10 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in divide-y divide-white/5">
                          {TRAVEL_LOCATIONS.map((loc) => (
                            <button
                              key={loc.id}
                              onClick={() => {
                                setSelectedLocationId(loc.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors
                                ${selectedLocationId === loc.id ? "text-porange bg-porange/5 font-bold" : "text-gray-300"}`}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className={`w-3.5 h-3.5 ${selectedLocationId === loc.id ? "text-porange" : "text-gray-500"}`} />
                                {loc.fullName}
                              </span>
                              <span className="flex items-center gap-2 font-mono text-[10px]">
                                {getWeatherIcon(loc.currentStatus, "w-3.5 h-3.5")}
                                {loc.tempMin}°C - {loc.tempMax}°C
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 7 Day forecast area */}
                    <div className="flex-1 flex flex-col gap-1.5 min-h-[350px] md:min-h-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 block">
                        Dự báo hành trình 7 ngày tới:
                      </span>
                      <div className="flex-1 flex flex-col gap-1 md:gap-1.5 min-h-0 justify-between">
                        {selectedLocation.forecast.map((fc, i) => (
                          <div
                            key={i}
                            className="flex-1 flex items-center justify-between bg-black/30 border border-white/5 hover:border-white/10 px-3 py-1 rounded-xl gap-3 transition-colors duration-200 min-h-0"
                          >
                            {/* Left Info: Bold location + details */}
                            <div className="flex-grow flex flex-col gap-0.5 min-h-0 justify-center">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                  {selectedLocation.fullName.toUpperCase()}
                                </span>
                                <span className="text-[9px] font-mono text-porange font-medium">
                                  {fc.day}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 text-justify leading-tight line-clamp-2">
                                {fc.summary}
                              </p>
                            </div>

                            {/* Right Info: Animated icon */}
                            <div className="flex-shrink-0 bg-black/40 p-1.5 rounded-lg border border-white/5 flex items-center justify-center">
                              {getWeatherIcon(fc.status, "w-[30px] h-[30px]")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Original single video block + right details column for other categories */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cột trái: Khung trình chiếu video 16:9 */}
              <div className="lg:col-span-7 flex flex-col gap-3 bg-psub/40 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
                  {!isPlayingPrimary ? (
                    <div 
                      onClick={() => setIsPlayingPrimary(true)}
                      className="absolute inset-0 w-full h-full cursor-pointer group flex items-center justify-center bg-black"
                    >
                      <img 
                        src={selectedVideo.thumbnailUrl} 
                        alt={selectedVideo.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-porange flex items-center justify-center text-white shadow-[0_0_25px_rgba(249,115,22,0.95)] hover:shadow-[0_0_35px_rgba(249,115,22,1)] border-2 border-white/30 transform group-hover:scale-110 transition-all duration-300 animate-pulse">
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
          )
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
                  className={`flex flex-col rounded-xl overflow-hidden cursor-pointer flex-grow video-card aspect-[1/1] w-full min-h-0
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
