import { Youtube, Facebook, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 z-50 w-full bg-[#253040]/50 backdrop-blur-md py-[20px] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 gap-4 shadow-lg text-sm shrink-0">
      {/* Left section: Copyright */}
      <div id="footer-left">
        <span className="font-medium italic select-none text-gray-400">
          Copyright by <span className="font-bold tracking-wide animate-gradient-text">NGUYEN QUANG PHUONG</span>
        </span>
      </div>

      {/* Right section: Social links */}
      <div id="footer-right" className="flex items-center gap-4">
        {/* Youtube link */}
        <a 
          id="social-youtube-link"
          href="https://www.youtube.com/@PToonGo" 
          target="_blank" 
          rel="noreferrer"
          className="p-2 rounded-full bg-[#FF0000]/10 hover:bg-[#FF0000]/25 text-[#FF0000] border border-[#FF0000]/20 transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)]"
          title="Youtube Channel"
        >
          <Youtube className="w-4 h-4" />
        </a>

        {/* Facebook link */}
        <a 
          id="social-facebook-link"
          href="https://facebook.com" 
          target="_blank" 
          rel="noreferrer"
          className="p-2 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/20 transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(24,119,242,0.6)]"
          title="Facebook Page"
        >
          <Facebook className="w-4 h-4" />
        </a>

        {/* Zalo link (using MessageCircle icon) */}
        <a 
          id="social-zalo-link"
          href="https://zalo.me" 
          target="_blank" 
          rel="noreferrer"
          className="p-2 rounded-full bg-[#0068FF]/10 hover:bg-[#0068FF]/25 text-[#0068FF] border border-[#0068FF]/20 transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(0,104,255,0.6)] flex items-center gap-1 text-xs font-semibold"
          title="Zalo Chat"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-bold text-[9px] -ml-0.5 tracking-tighter">ZALO</span>
        </a>
      </div>
    </footer>
  );
}
