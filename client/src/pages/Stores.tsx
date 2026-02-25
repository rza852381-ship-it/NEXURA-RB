import { useState } from "react";
import CyberLayout from "@/components/CyberLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Store, Plus, Link, Unlink, Facebook, Instagram, Twitter,
  Globe, ShoppingBag, Loader2, X, CheckCircle, AlertCircle,
  ExternalLink, Zap, BarChart3, Users, TrendingUp, RefreshCw
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const platformConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  facebook: { color: "oklch(0.60 0.20 250)", icon: <Facebook className="w-4 h-4" />, label: "Facebook" },
  instagram: { color: "oklch(0.65 0.28 25)", icon: <Instagram className="w-4 h-4" />, label: "Instagram" },
  twitter: { color: "oklch(0.65 0.20 210)", icon: <Twitter className="w-4 h-4" />, label: "Twitter" },
  tiktok: { color: "oklch(0.75 0.25 195)", icon: <Zap className="w-4 h-4" />, label: "TikTok" },
};

const storePerformance = [
  { subject: "المبيعات", A: 85, fullMark: 100 },
  { subject: "الزيارات", A: 72, fullMark: 100 },
  { subject: "التحويل", A: 45, fullMark: 100 },
  { subject: "الاحتفاظ", A: 68, fullMark: 100 },
  { subject: "التقييم", A: 92, fullMark: 100 },
  { subject: "السرعة", A: 78, fullMark: 100 },
];

const visitorsData = [
  { day: "الأحد", visitors: 1240, pageViews: 3800 },
  { day: "الاثنين", visitors: 1850, pageViews: 5200 },
  { day: "الثلاثاء", visitors: 1620, pageViews: 4600 },
  { day: "الأربعاء", visitors: 2100, pageViews: 6100 },
  { day: "الخميس", visitors: 2450, pageViews: 7300 },
  { day: "الجمعة", visitors: 3200, pageViews: 9800 },
  { day: "السبت", visitors: 2800, pageViews: 8400 },
];

const mockStores = [
  {
    id: 1, name: "متجر الأناقة", url: "https://elegance.sa", platform: "shopify",
    status: "active", revenue: 125000, visitors: 48320,
    connections: ["facebook", "instagram"],
  },
  {
    id: 2, name: "متجر التقنية", url: "https://techstore.sa", platform: "woocommerce",
    status: "active", revenue: 89000, visitors: 32150,
    connections: ["twitter"],
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="hud-box p-3 rounded text-xs font-rajdhani">
        <p className="text-[oklch(0.65_0.35_340)] font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString("ar-SA")}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Stores() {
  const [activeTab, setActiveTab] = useState<"stores" | "analytics" | "social">("stores");
  const [showAddStore, setShowAddStore] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"facebook" | "instagram" | "twitter" | "tiktok">("facebook");
  const [publishing, setPublishing] = useState(false);

  const [storeForm, setStoreForm] = useState({
    name: "", url: "", platform: "custom" as "shopify" | "woocommerce" | "custom" | "other", description: "",
  });

  const createStoreMutation = trpc.stores.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المتجر بنجاح");
      setShowAddStore(false);
      setStoreForm({ name: "", url: "", platform: "custom", description: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة المتجر"),
  });

  const connectMutation = trpc.social.connect.useMutation({
    onSuccess: () => {
      toast.success(`تم ربط ${platformConfig[selectedPlatform]?.label} بنجاح`);
      setShowConnectModal(false);
    },
    onError: () => toast.error("حدث خطأ أثناء الربط"),
  });

  const publishMutation = trpc.social.publishPost.useMutation({
    onSuccess: (data: { success: boolean; message: string }) => {
      toast.success(data.message);
      setPublishing(false);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء النشر");
      setPublishing(false);
    },
  });

  const handleConnect = () => {
    if (!selectedStoreId) { toast.error("اختر متجراً أولاً"); return; }
    connectMutation.mutate({
      platform: selectedPlatform,
      storeId: selectedStoreId,
      pageName: `صفحة ${platformConfig[selectedPlatform]?.label}`,
    });
  };

  const handlePublish = (platforms: string[]) => {
    setPublishing(true);
    publishMutation.mutate({
      content: "منتجات جديدة متاحة الآن! تسوق الآن واستمتع بأفضل العروض 🛍️",
      platforms,
    });
  };

  return (
    <CyberLayout title="ربط المتاجر والتحليلات" subtitle="// STORE_INTEGRATION_HUB">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[oklch(0.65_0.35_340/0.15)] pb-4">
        {[
          { key: "stores", label: "المتاجر", icon: <Store className="w-4 h-4" /> },
          { key: "analytics", label: "تحليل الزيارات", icon: <BarChart3 className="w-4 h-4" /> },
          { key: "social", label: "وسائل التواصل", icon: <Link className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-rajdhani transition-all ${
              activeTab === tab.key
                ? "bg-[oklch(0.65_0.35_340/0.15)] border border-[oklch(0.65_0.35_340/0.5)] text-[oklch(0.65_0.35_340)]"
                : "border border-[oklch(0.65_0.35_340/0.15)] text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {activeTab === "stores" && (
          <button
            onClick={() => setShowAddStore(true)}
            className="mr-auto btn-neon px-4 py-2 text-sm rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة متجر
          </button>
        )}
      </div>

      {/* ===== STORES TAB ===== */}
      {activeTab === "stores" && (
        <div className="space-y-4">
          {mockStores.map((store) => (
            <div key={store.id} className="hud-box p-5 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded border border-[oklch(0.65_0.35_340/0.3)] bg-[oklch(0.65_0.35_340/0.08)] flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-[oklch(0.65_0.35_340)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-cyber text-base font-bold text-foreground">{store.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-tech bg-[oklch(0.70_0.28_160/0.15)] border border-[oklch(0.70_0.28_160/0.4)] text-[oklch(0.70_0.28_160)]">
                      {store.status === "active" ? "نشط" : "متوقف"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-tech bg-[oklch(0.75_0.25_195/0.1)] border border-[oklch(0.75_0.25_195/0.3)] text-[oklch(0.75_0.25_195)] capitalize">
                      {store.platform}
                    </span>
                  </div>
                  <a href={store.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 font-tech text-xs text-muted-foreground hover:text-[oklch(0.65_0.35_340)] transition-colors mt-1"
                    dir="ltr"
                  >
                    <Globe className="w-3 h-3" />
                    {store.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="flex items-center gap-6 mt-3 flex-wrap">
                    <div>
                      <p className="font-tech text-xs text-muted-foreground">الإيرادات</p>
                      <p className="font-cyber text-sm font-bold text-[oklch(0.70_0.28_160)]">
                        {store.revenue.toLocaleString("ar-SA")} ر.س
                      </p>
                    </div>
                    <div>
                      <p className="font-tech text-xs text-muted-foreground">الزوار</p>
                      <p className="font-cyber text-sm font-bold text-[oklch(0.75_0.25_195)]">
                        {store.visitors.toLocaleString("ar-SA")}
                      </p>
                    </div>
                    <div>
                      <p className="font-tech text-xs text-muted-foreground">المنصات المربوطة</p>
                      <div className="flex gap-1 mt-0.5">
                        {store.connections.map((p) => (
                          <span key={p} style={{ color: platformConfig[p]?.color }}>
                            {platformConfig[p]?.icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setSelectedStoreId(store.id); setShowConnectModal(true); }}
                    className="btn-neon-cyan px-3 py-1.5 text-xs rounded flex items-center gap-1"
                  >
                    <Link className="w-3 h-3" />
                    ربط منصة
                  </button>
                  <button
                    onClick={() => handlePublish(store.connections)}
                    disabled={publishing}
                    className="btn-neon px-3 py-1.5 text-xs rounded flex items-center gap-1 disabled:opacity-50"
                  >
                    {publishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    نشر تلقائي
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الزوار", value: "80,470", change: "+12.3%", color: "oklch(0.65 0.35 340)", icon: <Users className="w-5 h-5" /> },
              { label: "مشاهدات الصفحات", value: "245,300", change: "+8.7%", color: "oklch(0.75 0.25 195)", icon: <BarChart3 className="w-5 h-5" /> },
              { label: "معدل الارتداد", value: "42.5%", change: "-3.2%", color: "oklch(0.85 0.25 85)", icon: <TrendingUp className="w-5 h-5" /> },
              { label: "معدل التحويل", value: "3.8%", change: "+0.5%", color: "oklch(0.70 0.28 160)", icon: <RefreshCw className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="stat-card p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-9 h-9 flex items-center justify-center rounded border"
                    style={{ color: stat.color, borderColor: `${stat.color}40`, background: `${stat.color}10` }}
                  >
                    {stat.icon}
                  </div>
                  <span className="font-tech text-xs" style={{ color: stat.color }}>{stat.change}</span>
                </div>
                <p className="font-cyber text-xl font-bold text-foreground">{stat.value}</p>
                <p className="font-rajdhani text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 hud-box p-5 rounded-lg">
              <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-4">// WEEKLY_VISITORS</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={visitorsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.65 0.35 340 / 0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="visitors" name="الزوار" fill="oklch(0.65 0.35 340)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pageViews" name="مشاهدات الصفحات" fill="oklch(0.75 0.25 195)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="hud-box p-5 rounded-lg">
              <p className="font-tech text-xs text-[oklch(0.55_0.30_290)] tracking-widest mb-4">// STORE_PERFORMANCE</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={storePerformance}>
                  <PolarGrid stroke="oklch(0.65 0.35 340 / 0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Rajdhani" }} />
                  <Radar name="الأداء" dataKey="A" stroke="oklch(0.65 0.35 340)" fill="oklch(0.65 0.35 340)" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="hud-box p-5 rounded-lg">
            <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest mb-4">// TRAFFIC_SOURCES</p>
            <div className="space-y-3">
              {[
                { source: "بحث مباشر (Google)", percentage: 35, visitors: "28,165" },
                { source: "وسائل التواصل الاجتماعي", percentage: 28, visitors: "22,532" },
                { source: "إعلانات مدفوعة", percentage: 22, visitors: "17,703" },
                { source: "بريد إلكتروني", percentage: 10, visitors: "8,047" },
                { source: "مصادر أخرى", percentage: 5, visitors: "4,024" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <p className="font-rajdhani text-sm text-foreground w-48 flex-shrink-0">{item.source}</p>
                  <div className="flex-1 h-2 bg-[oklch(0.15_0.03_240)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        background: `linear-gradient(90deg, oklch(0.65 0.35 340), oklch(0.75 0.25 195))`,
                      }}
                    />
                  </div>
                  <span className="font-tech text-xs text-[oklch(0.65_0.35_340)] w-8">{item.percentage}%</span>
                  <span className="font-tech text-xs text-muted-foreground w-16 text-left">{item.visitors}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== SOCIAL TAB ===== */}
      {activeTab === "social" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(platformConfig).map(([platform, config]) => {
              const isConnected = mockStores.some((s) => s.connections.includes(platform));
              return (
                <div key={platform} className="hud-box p-5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded border"
                        style={{ color: config.color, borderColor: `${config.color}40`, background: `${config.color}10` }}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-cyber text-sm font-bold text-foreground">{config.label}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isConnected ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-[oklch(0.70_0.28_160)]" />
                              <span className="font-tech text-xs text-[oklch(0.70_0.28_160)]">متصل</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-muted-foreground" />
                              <span className="font-tech text-xs text-muted-foreground">غير متصل</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (isConnected) {
                          toast.info("تم فصل الاتصال");
                        } else {
                          setSelectedStoreId(mockStores[0]?.id || 1);
                          setSelectedPlatform(platform as any);
                          setShowConnectModal(true);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded border font-rajdhani transition-all ${
                        isConnected
                          ? "border-[oklch(0.65_0.28_25/0.4)] text-[oklch(0.65_0.28_25)] hover:bg-[oklch(0.65_0.28_25/0.1)]"
                          : "border-[oklch(0.65_0.35_340/0.4)] text-[oklch(0.65_0.35_340)] hover:bg-[oklch(0.65_0.35_340/0.1)]"
                      }`}
                    >
                      {isConnected ? (
                        <span className="flex items-center gap-1"><Unlink className="w-3 h-3" /> فصل</span>
                      ) : (
                        <span className="flex items-center gap-1"><Link className="w-3 h-3" /> ربط</span>
                      )}
                    </button>
                  </div>
                  {isConnected && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "المتابعون", value: "12.4K" },
                        { label: "التفاعل", value: "8.2%" },
                        { label: "المنشورات", value: "48" },
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-2 rounded bg-[oklch(0.08_0.02_240)]">
                          <p className="font-cyber text-sm font-bold text-foreground">{stat.value}</p>
                          <p className="font-tech text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== ADD STORE MODAL ===== */}
      {showAddStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// ADD_STORE</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">إضافة متجر جديد</h3>
              </div>
              <button onClick={() => setShowAddStore(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">اسم المتجر *</label>
                <input
                  value={storeForm.name}
                  onChange={(e) => setStoreForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: متجر الأناقة"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">رابط المتجر</label>
                <input
                  value={storeForm.url}
                  onChange={(e) => setStoreForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://mystore.com"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-tech text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">منصة المتجر</label>
                <select
                  value={storeForm.platform}
                  onChange={(e) => setStoreForm((f) => ({ ...f, platform: e.target.value as any }))}
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                >
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="custom">مخصص</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => createStoreMutation.mutate(storeForm)}
                  disabled={createStoreMutation.isPending}
                  className="flex-1 btn-neon py-2.5 text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createStoreMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  إضافة المتجر
                </button>
                <button onClick={() => setShowAddStore(false)} className="px-4 py-2.5 border border-[oklch(0.65_0.35_340/0.2)] rounded text-muted-foreground hover:text-foreground text-sm font-rajdhani transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONNECT MODAL ===== */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest">// CONNECT_PLATFORM</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">ربط منصة تواصل</h3>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">اختر المنصة</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(platformConfig).map(([p, config]) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p as any)}
                      className="flex items-center gap-2 px-3 py-2 rounded border text-sm font-rajdhani transition-all"
                      style={selectedPlatform === p
                        ? { borderColor: `${config.color}60`, color: config.color, background: `${config.color}10` }
                        : { borderColor: "oklch(0.65 0.35 340 / 0.15)", color: "oklch(0.60 0.05 240 / 0.7)" }
                      }
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="w-full btn-neon py-2.5 text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {connectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                ربط الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}
