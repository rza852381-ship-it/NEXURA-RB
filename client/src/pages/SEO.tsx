import { useState } from "react";
import CyberLayout from "@/components/CyberLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Search, Globe, TrendingUp, AlertTriangle, CheckCircle,
  XCircle, Loader2, RefreshCw, Tag, FileText, Zap, BarChart3
} from "lucide-react";

const mockSeoResults = [
  { url: "https://mystore.com", title: "متجري الإلكتروني", score: 78, status: "good" },
  { url: "https://mystore.com/products", title: "صفحة المنتجات", score: 55, status: "warning" },
  { url: "https://mystore.com/about", title: "من نحن", score: 32, status: "poor" },
];

const keywordSuggestions = [
  { keyword: "متجر إلكتروني سعودي", volume: "12,000", difficulty: 45, trend: "up" },
  { keyword: "تسوق أونلاين", volume: "85,000", difficulty: 72, trend: "up" },
  { keyword: "عروض وتخفيضات", volume: "45,000", difficulty: 38, trend: "stable" },
  { keyword: "شحن مجاني السعودية", volume: "28,000", difficulty: 52, trend: "up" },
  { keyword: "أفضل متجر إلكتروني", volume: "18,000", difficulty: 65, trend: "down" },
  { keyword: "تسوق آمن", volume: "9,500", difficulty: 30, trend: "up" },
];

export default function SEO() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [activeTab, setActiveTab] = useState<"analyzer" | "keywords" | "suggestions">("analyzer");

  const analyzeSeoMutation = trpc.seo.analyze.useMutation({
    onSuccess: (data: { score: number; aiAnalysis: string; url: string }) => {
      setAiAnalysis(data.aiAnalysis || "");
      setAnalyzing(false);
      toast.success("تم تحليل الصفحة بنجاح");
    },
    onError: () => {
      setAnalyzing(false);
      toast.error("حدث خطأ أثناء التحليل");
    },
  });

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast.error("أدخل رابط الصفحة أولاً");
      return;
    }
    setAnalyzing(true);
    setAiAnalysis("");
    analyzeSeoMutation.mutate({ url });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "oklch(0.70 0.28 160)";
    if (score >= 40) return "oklch(0.85 0.25 85)";
    return "oklch(0.65 0.28 25)";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return "ممتاز";
    if (score >= 40) return "متوسط";
    return "ضعيف";
  };

  return (
    <CyberLayout title="تحسين SEO" subtitle="// SEO_OPTIMIZATION_MODULE">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[oklch(0.65_0.35_340/0.15)] pb-4">
        {[
          { key: "analyzer", label: "محلل الصفحات", icon: <Globe className="w-4 h-4" /> },
          { key: "keywords", label: "الكلمات المفتاحية", icon: <Tag className="w-4 h-4" /> },
          { key: "suggestions", label: "اقتراحات المحتوى", icon: <FileText className="w-4 h-4" /> },
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
      </div>

      {/* ===== ANALYZER TAB ===== */}
      {activeTab === "analyzer" && (
        <div className="space-y-6">
          {/* URL Input */}
          <div className="hud-box p-6 rounded-lg">
            <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-4">// URL_ANALYZER</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 pr-10 font-tech text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-neon px-6 py-2.5 text-sm rounded flex items-center gap-2 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {analyzing ? "جاري التحليل..." : "تحليل"}
              </button>
            </div>
          </div>

          {/* AI Analysis Result */}
          {aiAnalysis && (
            <div className="hud-box p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[oklch(0.65_0.35_340)]" />
                <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// AI_ANALYSIS_RESULT</p>
              </div>
              <div className="font-rajdhani text-sm text-foreground/90 leading-relaxed">
                <Streamdown>{aiAnalysis}</Streamdown>
              </div>
            </div>
          )}

          {/* Previous Analyses */}
          <div className="hud-box p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest">// ANALYZED_PAGES</p>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <RefreshCw className="w-3 h-3" />
                <span className="font-tech text-xs">تحديث</span>
              </button>
            </div>
            <div className="space-y-3">
              {mockSeoResults.map((result, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded border border-[oklch(0.65_0.35_340/0.1)] hover:border-[oklch(0.65_0.35_340/0.3)] transition-all">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 font-cyber text-sm font-bold flex-shrink-0"
                    style={{
                      borderColor: getScoreColor(result.score),
                      color: getScoreColor(result.score),
                      background: `${getScoreColor(result.score)}10`,
                    }}
                  >
                    {result.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani text-sm font-medium text-foreground">{result.title}</p>
                    <p className="font-tech text-xs text-muted-foreground truncate" dir="ltr">{result.url}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-tech"
                    style={{
                      color: getScoreColor(result.score),
                      background: `${getScoreColor(result.score)}15`,
                      border: `1px solid ${getScoreColor(result.score)}40`,
                    }}
                  >
                    {getScoreLabel(result.score)}
                  </div>
                  <div className="flex gap-2">
                    {result.score >= 70 ? (
                      <CheckCircle className="w-4 h-4 text-[oklch(0.70_0.28_160)]" />
                    ) : result.score >= 40 ? (
                      <AlertTriangle className="w-4 h-4 text-[oklch(0.85_0.25_85)]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[oklch(0.65_0.28_25)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== KEYWORDS TAB ===== */}
      {activeTab === "keywords" && (
        <div className="space-y-6">
          <div className="hud-box p-6 rounded-lg">
            <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-4">// KEYWORD_RESEARCH</p>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="أدخل كلمة مفتاحية للبحث..."
                className="flex-1 bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
              />
              <button className="btn-neon px-5 py-2.5 text-sm rounded flex items-center gap-2">
                <Search className="w-4 h-4" />
                بحث
              </button>
            </div>

            {/* Keywords Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[oklch(0.65_0.35_340/0.15)]">
                    {["الكلمة المفتاحية", "حجم البحث", "صعوبة التنافس", "الاتجاه"].map((h) => (
                      <th key={h} className="text-right py-3 px-4 font-tech text-xs text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keywordSuggestions.map((kw, i) => (
                    <tr
                      key={i}
                      className="border-b border-[oklch(0.65_0.35_340/0.07)] hover:bg-[oklch(0.65_0.35_340/0.03)] transition-colors"
                    >
                      <td className="py-3 px-4 font-rajdhani text-sm text-foreground">{kw.keyword}</td>
                      <td className="py-3 px-4 font-tech text-sm text-[oklch(0.75_0.25_195)]">{kw.volume}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[oklch(0.15_0.03_240)] rounded-full overflow-hidden max-w-24">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${kw.difficulty}%`,
                                background: kw.difficulty > 60
                                  ? "oklch(0.65 0.28 25)"
                                  : kw.difficulty > 40
                                  ? "oklch(0.85 0.25 85)"
                                  : "oklch(0.70 0.28 160)",
                              }}
                            />
                          </div>
                          <span className="font-tech text-xs text-muted-foreground">{kw.difficulty}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <TrendingUp
                          className={`w-4 h-4 ${
                            kw.trend === "up"
                              ? "text-[oklch(0.70_0.28_160)]"
                              : kw.trend === "down"
                              ? "text-[oklch(0.65_0.28_25)] rotate-180"
                              : "text-muted-foreground"
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUGGESTIONS TAB ===== */}
      {activeTab === "suggestions" && (
        <div className="space-y-6">
          <div className="hud-box p-6 rounded-lg">
            <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-4">// CONTENT_SUGGESTIONS</p>
            <p className="font-rajdhani text-sm text-muted-foreground mb-6">
              أدخل موضوع أو كلمة مفتاحية وسيقوم الذكاء الاصطناعي بتوليد اقتراحات محتوى SEO متكاملة
            </p>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="مثال: منتجات العناية بالبشرة..."
                className="flex-1 bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
              />
              <button className="btn-neon px-5 py-2.5 text-sm rounded flex items-center gap-2">
                <Zap className="w-4 h-4" />
                توليد
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "عنوان الصفحة المقترح", icon: <Tag className="w-4 h-4" />, content: "أفضل منتجات العناية بالبشرة في السعودية 2026 | متجرك الإلكتروني" },
                { title: "وصف الميتا المقترح", icon: <FileText className="w-4 h-4" />, content: "اكتشف مجموعتنا المميزة من منتجات العناية بالبشرة بأسعار تنافسية. شحن مجاني لجميع أنحاء المملكة." },
                { title: "كلمات مفتاحية مقترحة", icon: <BarChart3 className="w-4 h-4" />, content: "عناية بالبشرة، كريم ترطيب، سيروم فيتامين سي، منتجات طبيعية، بشرة صحية" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded border border-[oklch(0.75_0.25_195/0.2)] bg-[oklch(0.75_0.25_195/0.03)]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[oklch(0.75_0.25_195)]">{item.icon}</span>
                    <p className="font-tech text-xs text-[oklch(0.75_0.25_195)]">{item.title}</p>
                  </div>
                  <p className="font-rajdhani text-sm text-foreground/80 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}
