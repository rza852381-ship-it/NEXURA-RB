import { useState } from "react";
import CyberLayout from "@/components/CyberLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Megaphone, Plus, Zap, Brain, Calendar, DollarSign,
  Target, Eye, MousePointerClick, TrendingUp, Loader2,
  Facebook, Instagram, Twitter, Play, Pause, Trash2,
  X, ChevronDown, Sparkles, Upload
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  meta_ads: <Megaphone className="w-4 h-4" />,
};

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "oklch(0.70 0.28 160)", label: "نشطة" },
  scheduled: { color: "oklch(0.85 0.25 85)", label: "مجدولة" },
  completed: { color: "oklch(0.75 0.25 195)", label: "مكتملة" },
  paused: { color: "oklch(0.65 0.28 25)", label: "متوقفة" },
  draft: { color: "oklch(0.60 0.05 240)", label: "مسودة" },
  failed: { color: "oklch(0.65 0.28 25)", label: "فشلت" },
};

const mockCampaigns = [
  {
    id: 1, name: "حملة رمضان 2026", type: "meta_ads", status: "active",
    budget: "5000", spent: "2340", impressions: 145000, clicks: 12450,
    conversions: 380, platforms: ["facebook", "instagram"],
    createdAt: new Date("2026-02-01"),
  },
  {
    id: 2, name: "إطلاق منتج جديد", type: "social_post", status: "active",
    budget: "2500", spent: "1100", impressions: 89000, clicks: 8230,
    conversions: 210, platforms: ["instagram"],
    createdAt: new Date("2026-02-10"),
  },
  {
    id: 3, name: "تخفيضات الصيف", type: "meta_ads", status: "scheduled",
    budget: "8000", spent: "0", impressions: 0, clicks: 0,
    conversions: 0, platforms: ["facebook", "instagram", "twitter"],
    createdAt: new Date("2026-02-20"),
  },
  {
    id: 4, name: "حملة المتابعين", type: "social_post", status: "completed",
    budget: "1200", spent: "1200", impressions: 56000, clicks: 5100,
    conversions: 95, platforms: ["twitter"],
    createdAt: new Date("2026-01-15"),
  },
];

export default function Campaigns() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "draft">("all");

  // Create form state
  const [form, setForm] = useState({
    name: "",
    type: "meta_ads" as "meta_ads" | "social_post" | "email" | "sms" | "content",
    budget: "",
    platforms: [] as string[],
    adContent: "",
    scheduledAt: "",
    description: "",
  });

  // AI form state
  const [aiForm, setAiForm] = useState({
    productName: "",
    productDescription: "",
    targetAudience: "",
    platform: "facebook",
    tone: "exciting" as "professional" | "casual" | "exciting" | "emotional",
  });

  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحملة بنجاح");
      setShowCreateModal(false);
      setForm({ name: "", type: "meta_ads", budget: "", platforms: [], adContent: "", scheduledAt: "", description: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء إنشاء الحملة"),
  });

  const generateAIMutation = trpc.campaigns.generateAdText.useMutation({
    onSuccess: (data: { content: string }) => {
      setAiContent(data.content);
      setGeneratingAI(false);
    },
    onError: () => {
      setGeneratingAI(false);
      toast.error("حدث خطأ أثناء توليد النص");
    },
  });

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("أدخل اسم الحملة"); return; }
    createMutation.mutate({
      name: form.name,
      type: form.type,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      platforms: form.platforms,
      adContent: form.adContent,
      scheduledAt: form.scheduledAt || undefined,
      description: form.description,
    });
  };

  const handleGenerateAI = () => {
    if (!aiForm.productName.trim()) { toast.error("أدخل اسم المنتج"); return; }
    setGeneratingAI(true);
    setAiContent("");
    generateAIMutation.mutate(aiForm);
  };

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  };

  const filteredCampaigns = mockCampaigns.filter((c) => {
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "draft") return c.status === "draft" || c.status === "scheduled";
    return true;
  });

  return (
    <CyberLayout title="الحملات الإعلانية" subtitle="// CAMPAIGNS_MANAGER">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {[
            { key: "all", label: "جميع الحملات" },
            { key: "active", label: "النشطة" },
            { key: "draft", label: "المجدولة" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded text-sm font-rajdhani transition-all ${
                activeTab === tab.key
                  ? "bg-[oklch(0.65_0.35_340/0.15)] border border-[oklch(0.65_0.35_340/0.5)] text-[oklch(0.65_0.35_340)]"
                  : "border border-[oklch(0.65_0.35_340/0.15)] text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="btn-neon-cyan px-4 py-2 text-sm rounded flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            توليد نص بالذكاء الاصطناعي
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-neon px-4 py-2 text-sm rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            حملة جديدة
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الحملات", value: "12", icon: <Megaphone className="w-4 h-4" />, color: "oklch(0.65 0.35 340)" },
          { label: "إجمالي الإنفاق", value: "18,640 ر.س", icon: <DollarSign className="w-4 h-4" />, color: "oklch(0.75 0.25 195)" },
          { label: "إجمالي النقرات", value: "125,680", icon: <MousePointerClick className="w-4 h-4" />, color: "oklch(0.55 0.30 290)" },
          { label: "معدل التحويل", value: "3.8%", icon: <TrendingUp className="w-4 h-4" />, color: "oklch(0.70 0.28 160)" },
        ].map((stat, i) => (
          <div key={i} className="stat-card p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
              {stat.icon}
              <span className="font-tech text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="font-cyber text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="hud-box rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[oklch(0.65_0.35_340/0.15)]">
          <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// CAMPAIGNS_LIST</p>
        </div>
        <div className="divide-y divide-[oklch(0.65_0.35_340/0.08)]">
          {filteredCampaigns.map((campaign) => {
            const sc = statusConfig[campaign.status] || statusConfig.draft;
            const roi = campaign.conversions > 0
              ? (((campaign.conversions * 150 - parseFloat(campaign.spent)) / parseFloat(campaign.spent)) * 100).toFixed(1)
              : "—";
            return (
              <div key={campaign.id} className="p-4 hover:bg-[oklch(0.65_0.35_340/0.03)] transition-colors">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded border flex-shrink-0"
                    style={{ borderColor: `${sc.color}40`, background: `${sc.color}10`, color: sc.color }}
                  >
                    {platformIcons[campaign.type] || <Megaphone className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-rajdhani text-base font-semibold text-foreground">{campaign.name}</h3>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-tech"
                        style={{ color: sc.color, background: `${sc.color}15`, border: `1px solid ${sc.color}40` }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex gap-1">
                        {campaign.platforms.map((p) => (
                          <span key={p} className="text-muted-foreground">{platformIcons[p]}</span>
                        ))}
                      </div>
                      <span className="font-tech text-xs text-muted-foreground">
                        {campaign.createdAt.toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:grid grid-cols-4 gap-6 text-center">
                    {[
                      { label: "الميزانية", value: `${parseFloat(campaign.budget).toLocaleString("ar-SA")} ر.س` },
                      { label: "الإنفاق", value: `${parseFloat(campaign.spent).toLocaleString("ar-SA")} ر.س` },
                      { label: "النقرات", value: campaign.clicks.toLocaleString("ar-SA") },
                      { label: "العائد", value: typeof roi === "string" && roi !== "—" ? `+${roi}%` : roi },
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="font-tech text-xs text-muted-foreground">{item.label}</p>
                        <p className={`font-cyber text-sm font-bold mt-0.5 ${item.label === "العائد" && item.value !== "—" ? "text-[oklch(0.70_0.28_160)]" : "text-foreground"}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === "active" ? (
                      <button className="w-8 h-8 flex items-center justify-center border border-[oklch(0.85_0.25_85/0.4)] rounded text-[oklch(0.85_0.25_85)] hover:bg-[oklch(0.85_0.25_85/0.1)] transition-colors">
                        <Pause className="w-3 h-3" />
                      </button>
                    ) : campaign.status === "paused" ? (
                      <button className="w-8 h-8 flex items-center justify-center border border-[oklch(0.70_0.28_160/0.4)] rounded text-[oklch(0.70_0.28_160)] hover:bg-[oklch(0.70_0.28_160/0.1)] transition-colors">
                        <Play className="w-3 h-3" />
                      </button>
                    ) : null}
                    <button className="w-8 h-8 flex items-center justify-center border border-[oklch(0.65_0.28_25/0.4)] rounded text-[oklch(0.65_0.28_25)] hover:bg-[oklch(0.65_0.28_25/0.1)] transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                {campaign.status === "active" && parseFloat(campaign.budget) > 0 && (
                  <div className="mt-3 mr-14">
                    <div className="flex justify-between mb-1">
                      <span className="font-tech text-xs text-muted-foreground">الإنفاق من الميزانية</span>
                      <span className="font-tech text-xs text-[oklch(0.65_0.35_340)]">
                        {((parseFloat(campaign.spent) / parseFloat(campaign.budget)) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1 bg-[oklch(0.15_0.03_240)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((parseFloat(campaign.spent) / parseFloat(campaign.budget)) * 100, 100)}%`,
                          background: "linear-gradient(90deg, oklch(0.65 0.35 340), oklch(0.75 0.25 195))",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== CREATE CAMPAIGN MODAL ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// NEW_CAMPAIGN</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">إنشاء حملة جديدة</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">اسم الحملة *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: حملة رمضان 2026"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">نوع الحملة</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                >
                  <option value="meta_ads">Meta Ads (Facebook & Instagram)</option>
                  <option value="social_post">منشور وسائل التواصل</option>
                  <option value="email">بريد إلكتروني</option>
                  <option value="content">محتوى تسويقي</option>
                </select>
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">الميزانية (ر.س)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  placeholder="5000"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-tech text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">المنصات</label>
                <div className="flex gap-2 flex-wrap">
                  {["facebook", "instagram", "twitter"].map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm font-rajdhani transition-all ${
                        form.platforms.includes(p)
                          ? "bg-[oklch(0.65_0.35_340/0.15)] border-[oklch(0.65_0.35_340/0.5)] text-[oklch(0.65_0.35_340)]"
                          : "border-[oklch(0.65_0.35_340/0.15)] text-muted-foreground"
                      }`}
                    >
                      {platformIcons[p]}
                      <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">نص الإعلان</label>
                <textarea
                  value={form.adContent}
                  onChange={(e) => setForm((f) => ({ ...f, adContent: e.target.value }))}
                  placeholder="أدخل نص الإعلان هنا..."
                  rows={4}
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">تاريخ الجدولة (اختياري)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-tech text-sm text-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 btn-neon py-2.5 text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  إنشاء الحملة
                </button>
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 border border-[oklch(0.65_0.35_340/0.2)] rounded text-muted-foreground hover:text-foreground text-sm font-rajdhani transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AI TEXT GENERATOR MODAL ===== */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest">// AI_AD_GENERATOR</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">توليد نص إعلاني بالذكاء الاصطناعي</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-tech text-xs text-muted-foreground block mb-2">اسم المنتج *</label>
                  <input
                    value={aiForm.productName}
                    onChange={(e) => setAiForm((f) => ({ ...f, productName: e.target.value }))}
                    placeholder="مثال: عطر الورد الفاخر"
                    className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  />
                </div>
                <div>
                  <label className="font-tech text-xs text-muted-foreground block mb-2">الجمهور المستهدف</label>
                  <input
                    value={aiForm.targetAudience}
                    onChange={(e) => setAiForm((f) => ({ ...f, targetAudience: e.target.value }))}
                    placeholder="مثال: نساء 25-45 سنة"
                    className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">وصف المنتج</label>
                <textarea
                  value={aiForm.productDescription}
                  onChange={(e) => setAiForm((f) => ({ ...f, productDescription: e.target.value }))}
                  placeholder="وصف مختصر للمنتج..."
                  rows={2}
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-tech text-xs text-muted-foreground block mb-2">المنصة</label>
                  <select
                    value={aiForm.platform}
                    onChange={(e) => setAiForm((f) => ({ ...f, platform: e.target.value }))}
                    className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="twitter">Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="font-tech text-xs text-muted-foreground block mb-2">الأسلوب</label>
                  <select
                    value={aiForm.tone}
                    onChange={(e) => setAiForm((f) => ({ ...f, tone: e.target.value as any }))}
                    className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  >
                    <option value="exciting">مثير ومتحمس</option>
                    <option value="professional">احترافي</option>
                    <option value="casual">غير رسمي</option>
                    <option value="emotional">عاطفي</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="w-full btn-neon-cyan py-2.5 text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generatingAI ? "جاري التوليد..." : "توليد النص الإعلاني"}
              </button>
              {aiContent && (
                <div className="p-4 rounded border border-[oklch(0.75_0.25_195/0.3)] bg-[oklch(0.75_0.25_195/0.05)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[oklch(0.75_0.25_195)]" />
                    <p className="font-tech text-xs text-[oklch(0.75_0.25_195)]">النص المولّد</p>
                  </div>
                  <div className="font-rajdhani text-sm text-foreground/90 leading-relaxed">
                    <Streamdown>{aiContent}</Streamdown>
                  </div>
                  <button
                    onClick={() => {
                      setForm((f) => ({ ...f, adContent: aiContent }));
                      setShowAIModal(false);
                      setShowCreateModal(true);
                    }}
                    className="mt-4 btn-neon px-4 py-2 text-xs rounded flex items-center gap-2"
                  >
                    <Zap className="w-3 h-3" />
                    استخدم هذا النص في حملة جديدة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}
