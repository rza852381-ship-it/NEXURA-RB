import CyberLayout from "@/components/CyberLayout";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingBag, Megaphone,
  DollarSign, Users, Zap, ArrowLeft, BarChart3,
  Target, Eye, MousePointerClick
} from "lucide-react";

const revenueData = [
  { month: "يناير", revenue: 42000, expenses: 18000 },
  { month: "فبراير", revenue: 55000, expenses: 22000 },
  { month: "مارس", revenue: 48000, expenses: 19000 },
  { month: "أبريل", revenue: 70000, expenses: 25000 },
  { month: "مايو", revenue: 65000, expenses: 28000 },
  { month: "يونيو", revenue: 88000, expenses: 32000 },
  { month: "يوليو", revenue: 92000, expenses: 35000 },
];

const campaignData = [
  { name: "فيسبوك", value: 45, color: "oklch(0.65 0.35 340)" },
  { name: "إنستغرام", value: 30, color: "oklch(0.75 0.25 195)" },
  { name: "تويتر", value: 15, color: "oklch(0.55 0.30 290)" },
  { name: "أخرى", value: 10, color: "oklch(0.85 0.25 85)" },
];

const visitorsData = [
  { day: "السبت", visitors: 1200 },
  { day: "الأحد", visitors: 1800 },
  { day: "الاثنين", visitors: 2400 },
  { day: "الثلاثاء", visitors: 2100 },
  { day: "الأربعاء", visitors: 2800 },
  { day: "الخميس", visitors: 3200 },
  { day: "الجمعة", visitors: 2600 },
];

const recentCampaigns = [
  { name: "حملة رمضان 2026", platform: "Meta Ads", status: "active", budget: "5,000 ر.س", clicks: "12,450", roi: "+34%" },
  { name: "إطلاق منتج جديد", platform: "Instagram", status: "active", budget: "2,500 ر.س", clicks: "8,230", roi: "+22%" },
  { name: "تخفيضات الصيف", platform: "Facebook", status: "scheduled", budget: "8,000 ر.س", clicks: "—", roi: "—" },
  { name: "حملة المتابعين", platform: "Twitter", status: "completed", budget: "1,200 ر.س", clicks: "5,100", roi: "+15%" },
];

const statusColors: Record<string, string> = {
  active: "oklch(0.70 0.28 160)",
  scheduled: "oklch(0.85 0.25 85)",
  completed: "oklch(0.75 0.25 195)",
  paused: "oklch(0.65 0.28 25)",
};
const statusLabels: Record<string, string> = {
  active: "نشطة",
  scheduled: "مجدولة",
  completed: "مكتملة",
  paused: "متوقفة",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="hud-box p-3 rounded text-xs font-rajdhani">
        <p className="text-[oklch(0.65_0.35_340)] font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString("ar-SA")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();

  const statCards = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "إجمالي الإيرادات",
      value: "92,450 ر.س",
      change: "+18.5%",
      positive: true,
      color: "oklch(0.65 0.35 340)",
    },
    {
      icon: <Megaphone className="w-5 h-5" />,
      label: "الحملات النشطة",
      value: "12",
      change: "+3 هذا الأسبوع",
      positive: true,
      color: "oklch(0.75 0.25 195)",
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "المتاجر المربوطة",
      value: "5",
      change: "جميعها متصلة",
      positive: true,
      color: "oklch(0.55 0.30 290)",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "إجمالي الزوار",
      value: "48,320",
      change: "+12.3%",
      positive: true,
      color: "oklch(0.85 0.25 85)",
    },
    {
      icon: <MousePointerClick className="w-5 h-5" />,
      label: "معدل التحويل",
      value: "3.8%",
      change: "+0.5%",
      positive: true,
      color: "oklch(0.70 0.28 160)",
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: "إجمالي النقرات",
      value: "125,680",
      change: "-2.1%",
      positive: false,
      color: "oklch(0.65 0.35 340)",
    },
  ];

  return (
    <CyberLayout title="لوحة التحكم" subtitle="// DASHBOARD_OVERVIEW">
      {/* Welcome banner */}
      <div className="hud-box p-5 rounded-lg mb-6 flex items-center justify-between">
        <div>
          <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest mb-1">
            // WELCOME_BACK
          </p>
          <h2 className="font-cyber text-xl font-bold text-foreground">
            مرحباً، <span className="gradient-text-cyber">{user?.name || "المستخدم"}</span>
          </h2>
          <p className="font-rajdhani text-sm text-muted-foreground mt-1">
            هنا ملخص أداء منصتك اليوم — كل شيء يسير بشكل ممتاز
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/campaigns")}
            className="btn-neon px-4 py-2 text-xs rounded flex items-center gap-2"
          >
            <Zap className="w-3 h-3" />
            حملة جديدة
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="btn-neon-cyan px-4 py-2 text-xs rounded flex items-center gap-2"
          >
            <BarChart3 className="w-3 h-3" />
            التقارير
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 flex items-center justify-center rounded border"
                style={{ color: card.color, borderColor: `${card.color}40`, background: `${card.color}10` }}
              >
                {card.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-tech ${card.positive ? "text-[oklch(0.70_0.28_160)]" : "text-[oklch(0.65_0.28_25)]"}`}>
                {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{card.change}</span>
              </div>
            </div>
            <p className="font-cyber text-lg font-bold text-foreground">{card.value}</p>
            <p className="font-rajdhani text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 hud-box p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// REVENUE_ANALYSIS</p>
              <h3 className="font-cyber text-sm font-bold text-foreground mt-1">الإيرادات والمصروفات</h3>
            </div>
            <select className="font-tech text-xs bg-[oklch(0.12_0.03_240)] border border-[oklch(0.65_0.35_340/0.2)] text-muted-foreground px-2 py-1 rounded">
              <option>آخر 7 أشهر</option>
              <option>آخر 12 شهر</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.35 340)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.35 340)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.25 195)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.25 195)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.65 0.35 340 / 0.08)" />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="oklch(0.65 0.35 340)" fill="url(#revenueGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="oklch(0.75 0.25 195)" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Distribution */}
        <div className="hud-box p-5 rounded-lg">
          <div className="mb-4">
            <p className="font-tech text-xs text-[oklch(0.75_0.25_195)] tracking-widest">// CAMPAIGN_DIST</p>
            <h3 className="font-cyber text-sm font-bold text-foreground mt-1">توزيع الحملات</h3>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={campaignData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {campaignData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {campaignData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="font-rajdhani text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-tech text-xs text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitors Chart + Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors */}
        <div className="hud-box p-5 rounded-lg">
          <div className="mb-4">
            <p className="font-tech text-xs text-[oklch(0.55_0.30_290)] tracking-widest">// VISITORS_WEEK</p>
            <h3 className="font-cyber text-sm font-bold text-foreground mt-1">الزوار هذا الأسبوع</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={visitorsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.65 0.35 340 / 0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "oklch(0.60 0.05 240)", fontSize: 9, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="visitors" name="الزوار" fill="oklch(0.55 0.30 290)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Campaigns */}
        <div className="lg:col-span-2 hud-box p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-tech text-xs text-[oklch(0.65_0.35_340)] tracking-widest">// RECENT_CAMPAIGNS</p>
              <h3 className="font-cyber text-sm font-bold text-foreground mt-1">آخر الحملات</h3>
            </div>
            <button
              onClick={() => navigate("/campaigns")}
              className="flex items-center gap-1 text-[oklch(0.65_0.35_340)] hover:text-[oklch(0.75_0.25_195)] transition-colors"
            >
              <span className="font-tech text-xs">عرض الكل</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentCampaigns.map((campaign, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded border border-[oklch(0.65_0.35_340/0.1)] hover:border-[oklch(0.65_0.35_340/0.3)] hover:bg-[oklch(0.65_0.35_340/0.03)] transition-all cursor-pointer"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: statusColors[campaign.status] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-rajdhani text-sm font-medium text-foreground truncate">{campaign.name}</p>
                  <p className="font-tech text-xs text-muted-foreground">{campaign.platform}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-tech text-xs text-foreground">{campaign.clicks}</p>
                  <p className="font-tech text-xs text-muted-foreground">نقرة</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-tech text-xs text-foreground">{campaign.budget}</p>
                  <p className="font-tech text-xs text-muted-foreground">الميزانية</p>
                </div>
                <div
                  className="px-2 py-0.5 rounded text-xs font-tech"
                  style={{
                    color: statusColors[campaign.status],
                    background: `${statusColors[campaign.status]}15`,
                    border: `1px solid ${statusColors[campaign.status]}40`,
                  }}
                >
                  {statusLabels[campaign.status]}
                </div>
                <div className={`font-tech text-xs ${campaign.roi.startsWith("+") ? "text-[oklch(0.70_0.28_160)]" : "text-muted-foreground"}`}>
                  {campaign.roi}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
