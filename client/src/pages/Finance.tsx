import { useState } from "react";
import CyberLayout from "@/components/CyberLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Brain,
  Loader2, X, Zap, ArrowUpRight, ArrowDownRight,
  PieChart, FileText, Calendar, Filter
} from "lucide-react";

const monthlyData = [
  { month: "يناير", revenue: 42000, expenses: 18000, profit: 24000 },
  { month: "فبراير", revenue: 55000, expenses: 22000, profit: 33000 },
  { month: "مارس", revenue: 48000, expenses: 19000, profit: 29000 },
  { month: "أبريل", revenue: 70000, expenses: 25000, profit: 45000 },
  { month: "مايو", revenue: 65000, expenses: 28000, profit: 37000 },
  { month: "يونيو", revenue: 88000, expenses: 32000, profit: 56000 },
  { month: "يوليو", revenue: 92000, expenses: 35000, profit: 57000 },
];

const mockRecords = [
  { id: 1, type: "revenue", category: "مبيعات", amount: "15000", description: "مبيعات يوليو", date: new Date("2026-07-15"), source: "متجر رئيسي" },
  { id: 2, type: "expense", category: "إعلانات", amount: "3500", description: "إعلانات Meta Ads", date: new Date("2026-07-14"), source: "Facebook" },
  { id: 3, type: "revenue", category: "مبيعات", amount: "8200", description: "مبيعات إضافية", date: new Date("2026-07-13"), source: "متجر فرعي" },
  { id: 4, type: "ad_spend", category: "إعلانات", amount: "2100", description: "إعلانات إنستغرام", date: new Date("2026-07-12"), source: "Instagram" },
  { id: 5, type: "expense", category: "تشغيل", amount: "1800", description: "رسوم المنصة", date: new Date("2026-07-11"), source: "NEXURA&RB" },
  { id: 6, type: "revenue", category: "مبيعات", amount: "22000", description: "مبيعات نهاية الأسبوع", date: new Date("2026-07-10"), source: "متجر رئيسي" },
];

const typeConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  revenue: { color: "oklch(0.70 0.28 160)", label: "إيراد", icon: <ArrowUpRight className="w-3 h-3" /> },
  expense: { color: "oklch(0.65 0.28 25)", label: "مصروف", icon: <ArrowDownRight className="w-3 h-3" /> },
  ad_spend: { color: "oklch(0.85 0.25 85)", label: "إنفاق إعلاني", icon: <ArrowDownRight className="w-3 h-3" /> },
  refund: { color: "oklch(0.75 0.25 195)", label: "استرداد", icon: <ArrowUpRight className="w-3 h-3" /> },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="hud-box p-3 rounded text-xs font-rajdhani">
        <p className="text-[oklch(0.65_0.35_340)] font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString("ar-SA")} ر.س</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Finance() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "records" | "reports">("overview");

  const [form, setForm] = useState({
    type: "revenue" as "revenue" | "expense" | "refund" | "ad_spend",
    amount: "",
    category: "",
    description: "",
    source: "",
  });

  const addRecordMutation = trpc.finance.addRecord.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة السجل المالي بنجاح");
      setShowAddModal(false);
      setForm({ type: "revenue", amount: "", category: "", description: "", source: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });

  const aiAnalysisMutation = trpc.finance.aiAnalysis.useMutation({
    onSuccess: (data: { analysis: string; summary: any }) => {
      setAiAnalysis(data.analysis);
      setAnalyzing(false);
    },
    onError: () => {
      setAnalyzing(false);
      toast.error("حدث خطأ أثناء التحليل");
    },
  });

  const handleAdd = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    addRecordMutation.mutate({
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.category || undefined,
      description: form.description || undefined,
      source: form.source || undefined,
    });
  };

  const handleAIAnalysis = () => {
    setAnalyzing(true);
    setAiAnalysis("");
    aiAnalysisMutation.mutate({ period: "month" });
  };

  const totalRevenue = mockRecords.filter((r) => r.type === "revenue").reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpenses = mockRecords.filter((r) => r.type === "expense").reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalAdSpend = mockRecords.filter((r) => r.type === "ad_spend").reduce((s, r) => s + parseFloat(r.amount), 0);
  const netProfit = totalRevenue - totalExpenses - totalAdSpend;

  return (
    <CyberLayout title="المحاسب المالي الذكي" subtitle="// FINANCIAL_INTELLIGENCE">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[oklch(0.65_0.35_340/0.15)] pb-4">
        {[
          { key: "overview", label: "نظرة عامة", icon: <PieChart className="w-4 h-4" /> },
          { key: "records", label: "السجلات المالية", icon: <FileText className="w-4 h-4" /> },
          { key: "reports", label: "التقارير", icon: <Calendar className="w-4 h-4" /> },
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
        <div className="mr-auto flex gap-2">
          <button
            onClick={() => { setShowAIModal(true); handleAIAnalysis(); }}
            className="btn-neon-cyan px-4 py-2 text-sm rounded flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            تحليل ذكي
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-neon px-4 py-2 text-sm rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة سجل
          </button>
        </div>
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "إجمالي الإيرادات", value: totalRevenue, color: "oklch(0.70 0.28 160)", icon: <TrendingUp className="w-5 h-5" />, change: "+18.5%" },
              { label: "إجمالي المصروفات", value: totalExpenses, color: "oklch(0.65 0.28 25)", icon: <TrendingDown className="w-5 h-5" />, change: "+5.2%" },
              { label: "إنفاق الإعلانات", value: totalAdSpend, color: "oklch(0.85 0.25 85)", icon: <DollarSign className="w-5 h-5" />, change: "+12%" },
              { label: "صافي الربح", value: netProfit, color: "oklch(0.65 0.35 340)", icon: <Zap className="w-5 h-5" />, change: "+24%" },
            ].map((card, i) => (
              <div key={i} className="stat-card p-5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded border"
                    style={{ color: card.color, borderColor: `${card.color}40`, background: `${card.color}10` }}
                  >
                    {card.icon}
                  </div>
                  <span className="font-tech text-xs" style={{ color: card.color }}>{card.change}</span>
                </div>
                <p className="font-cyber text-xl font-bold text-foreground">
                  {card.value.toLocaleString("ar-SA")}
                </p>
                <p className="font-tech text-xs text-muted-foreground mt-0.5">ر.س</p>
                <p className="font-rajdhani text-xs text-muted-foreground mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="hud-box p-5 rounded-lg">
              <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-4">// MONTHLY_PERFORMANCE</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.28 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.70 0.28 160)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.28 25)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.28 25)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.35 340)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.65 0.35 340)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.65 0.35 340 / 0.08)" />
                  <XAxis dataKey="month" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="oklch(0.70 0.28 160)" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="oklch(0.65 0.28 25)" fill="url(#expGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" name="الربح" stroke="oklch(0.65 0.35 340)" fill="url(#profGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="hud-box p-5 rounded-lg">
              <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest mb-4">// PROFIT_TREND</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.65 0.35 340 / 0.08)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="profit" name="الربح الصافي" fill="oklch(0.65 0.35 340)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===== RECORDS TAB ===== */}
      {activeTab === "records" && (
        <div className="hud-box rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[oklch(0.65_0.35_340/0.15)] flex items-center justify-between">
            <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// FINANCIAL_RECORDS</p>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Filter className="w-3 h-3" />
              <span className="font-tech text-xs">تصفية</span>
            </button>
          </div>
          <div className="divide-y divide-[oklch(0.65_0.35_340/0.08)]">
            {mockRecords.map((record) => {
              const tc = typeConfig[record.type] || typeConfig.expense;
              const isIncome = record.type === "revenue" || record.type === "refund";
              return (
                <div key={record.id} className="flex items-center gap-4 p-4 hover:bg-[oklch(0.65_0.35_340/0.03)] transition-colors">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded border flex-shrink-0"
                    style={{ color: tc.color, borderColor: `${tc.color}40`, background: `${tc.color}10` }}
                  >
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-rajdhani text-sm font-medium text-foreground">{record.description}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="font-tech text-xs text-muted-foreground">{record.category}</span>
                      <span className="font-tech text-xs text-muted-foreground">{record.source}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p
                      className="font-cyber text-base font-bold"
                      style={{ color: tc.color }}
                    >
                      {isIncome ? "+" : "-"}{parseFloat(record.amount).toLocaleString("ar-SA")} ر.س
                    </p>
                    <p className="font-tech text-xs text-muted-foreground mt-0.5">
                      {record.date.toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-tech hidden sm:block"
                    style={{ color: tc.color, background: `${tc.color}15`, border: `1px solid ${tc.color}40` }}
                  >
                    {tc.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== REPORTS TAB ===== */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "تقرير شهري", desc: "ملخص الأداء المالي لهذا الشهر", color: "oklch(0.65 0.35 340)" },
              { title: "تقرير ربع سنوي", desc: "تحليل الأداء للربع الأول 2026", color: "oklch(0.75 0.25 195)" },
              { title: "تقرير سنوي", desc: "مقارنة شاملة مع العام الماضي", color: "oklch(0.55 0.30 290)" },
            ].map((report, i) => (
              <div key={i} className="hud-box p-5 rounded-lg cursor-pointer group">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded border mb-4"
                  style={{ color: report.color, borderColor: `${report.color}40`, background: `${report.color}10` }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-cyber text-sm font-bold text-foreground mb-2 group-hover:text-[oklch(0.65_0.35_340)] transition-colors">
                  {report.title}
                </h3>
                <p className="font-rajdhani text-xs text-muted-foreground">{report.desc}</p>
                <button className="mt-4 font-tech text-xs text-[oklch(0.65_0.35_340)] hover:text-[oklch(0.75_0.25_195)] transition-colors">
                  تحميل التقرير →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ADD RECORD MODAL ===== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// ADD_RECORD</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">إضافة سجل مالي</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">نوع السجل</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(typeConfig).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, type: key as any }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-rajdhani transition-all ${
                        form.type === key
                          ? `border-[${val.color}] text-[${val.color}]`
                          : "border-[oklch(0.65_0.35_340/0.15)] text-muted-foreground"
                      }`}
                      style={form.type === key ? { borderColor: `${val.color}60`, color: val.color, background: `${val.color}10` } : {}}
                    >
                      {val.icon}
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">المبلغ (ر.س) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-tech text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">الفئة</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="مثال: مبيعات، إعلانات..."
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div>
                <label className="font-tech text-xs text-muted-foreground block mb-2">الوصف</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="وصف مختصر..."
                  className="w-full bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded px-4 py-2.5 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={addRecordMutation.isPending}
                  className="flex-1 btn-neon py-2.5 text-sm rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addRecordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  إضافة
                </button>
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 border border-[oklch(0.65_0.35_340/0.2)] rounded text-muted-foreground hover:text-foreground text-sm font-rajdhani transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AI ANALYSIS MODAL ===== */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="hud-box rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[oklch(0.65_0.35_340/0.15)]">
              <div>
                <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest">// AI_FINANCIAL_ANALYSIS</p>
                <h3 className="font-cyber text-base font-bold text-foreground mt-1">التحليل المالي الذكي</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-2 border-[oklch(0.65_0.35_340)] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">جاري التحليل المالي...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="font-rajdhani text-sm text-foreground/90 leading-relaxed">
                  <Streamdown>{aiAnalysis}</Streamdown>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}
