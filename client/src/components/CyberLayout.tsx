import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard, Search, Megaphone, Share2, DollarSign,
  BarChart3, Bot, Settings, LogOut, Zap, Menu, X,
  ShoppingBag, Bell, ChevronLeft, Store
} from "lucide-react";

const navItems = [
  { icon: <LayoutDashboard className="w-4 h-4" />, label: "لوحة التحكم", path: "/dashboard" },
  { icon: <Search className="w-4 h-4" />, label: "تحسين SEO", path: "/seo" },
  { icon: <Megaphone className="w-4 h-4" />, label: "الحملات الإعلانية", path: "/campaigns" },
  { icon: <Share2 className="w-4 h-4" />, label: "وسائل التواصل", path: "/social" },
  { icon: <DollarSign className="w-4 h-4" />, label: "المحاسب المالي", path: "/finance" },
  { icon: <BarChart3 className="w-4 h-4" />, label: "التحليلات", path: "/analytics" },
  { icon: <ShoppingBag className="w-4 h-4" />, label: "المتاجر", path: "/stores" },
  { icon: <Store className="w-4 h-4" />, label: "تكامل سلة", path: "/salla" },
  { icon: <Bot className="w-4 h-4" />, label: "المساعد الذكي", path: "/assistant" },
];

interface CyberLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function CyberLayout({ children, title, subtitle }: CyberLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[oklch(0.65_0.35_340)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center cyber-grid">
        <div className="hud-box p-10 rounded-lg text-center max-w-sm">
          <div className="w-16 h-16 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.5)] rounded-full mx-auto mb-6 bg-[oklch(0.65_0.35_340/0.1)]">
            <Zap className="w-8 h-8 text-[oklch(0.65_0.35_340)]" />
          </div>
          <h2 className="font-cyber text-xl font-bold gradient-text-cyber mb-3">تسجيل الدخول مطلوب</h2>
          <p className="font-rajdhani text-muted-foreground text-sm mb-6">
            يجب تسجيل الدخول للوصول إلى لوحة التحكم
          </p>
          <a href={getLoginUrl()} className="btn-neon px-6 py-2.5 text-sm rounded block text-center">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed top-0 right-0 h-full z-40 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
        style={{
          background: "oklch(0.08 0.02 240)",
          borderLeft: "1px solid oklch(0.65 0.35 340 / 0.2)",
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[oklch(0.65_0.35_340/0.15)]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 border border-[oklch(0.65_0.35_340/0.6)] rotate-45 pulse-neon" />
                <Zap className="w-4 h-4 text-[oklch(0.65_0.35_340)]" />
              </div>
              <span className="font-cyber text-sm gradient-text-cyber font-bold tracking-widest flicker">NEXURA&RB</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.3)] rounded text-[oklch(0.65_0.35_340)] hover:bg-[oklch(0.65_0.35_340/0.1)] transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-right ${
                  isActive
                    ? "bg-[oklch(0.65_0.35_340/0.15)] border-r-2 border-[oklch(0.65_0.35_340)] text-[oklch(0.65_0.35_340)]"
                    : "text-muted-foreground hover:bg-[oklch(0.65_0.35_340/0.07)] hover:text-foreground border-r-2 border-transparent"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-rajdhani text-sm font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.35_340)] pulse-neon" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[oklch(0.65_0.35_340/0.15)] p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.35_340/0.2)] border border-[oklch(0.65_0.35_340/0.4)] flex items-center justify-center text-[oklch(0.65_0.35_340)] font-cyber text-xs">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-rajdhani text-sm font-medium text-foreground truncate">{user?.name || "مستخدم"}</p>
                <p className="font-tech text-xs text-muted-foreground truncate">{user?.role === "admin" ? "ADMIN" : "USER"}</p>
              </div>
            </div>
          ) : null}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded border border-[oklch(0.65_0.28_25/0.3)] text-[oklch(0.65_0.28_25)] hover:bg-[oklch(0.65_0.28_25/0.1)] transition-colors ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="font-rajdhani text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "mr-64" : "mr-16"
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[oklch(0.65_0.35_340/0.15)] bg-[oklch(0.06_0.01_240/0.95)] backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <div>
            {title && (
              <h1 className="font-cyber text-lg font-bold text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="font-tech text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 border border-[oklch(0.70_0.28_160/0.3)] rounded bg-[oklch(0.70_0.28_160/0.05)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.70_0.28_160)] pulse-neon" />
              <span className="font-tech text-xs text-[oklch(0.70_0.28_160)]">ONLINE</span>
            </div>
            {/* Notifications */}
            <button className="w-8 h-8 flex items-center justify-center border border-[oklch(0.65_0.35_340/0.3)] rounded text-muted-foreground hover:text-[oklch(0.65_0.35_340)] hover:border-[oklch(0.65_0.35_340/0.6)] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.35_340)]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
