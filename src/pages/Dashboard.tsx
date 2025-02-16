
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FileText, CreditCard, TrendingUp, TrendingDown, Plus, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface TopSection {
  users_today: number;
  total_users: number;
  premium_users: number;
  non_premium_users: number;
  total_exercises: number;
  total_meals: number;
  registered_last_7_days: number;
  registered_last_month: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  total_income: number;
}

interface CountryStats {
  country: string;
  total_users: number;
  subscribers: number;
  non_subscribers: number;
  active_users: number;
  inactive_users: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  income: number;
}

interface DashboardData {
  top_section: TopSection;
  bottom_section: CountryStats[];
}

const NavButton = ({ active, children }: { active?: boolean; children: React.ReactNode }) => (
  <button
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 ${
      active
        ? "bg-[#1E2B3D] text-white shadow-[0_0_30px_rgba(30,43,61,0.8)]"
        : "text-white/60 hover:text-white hover:bg-white/5"
    }`}
  >
    {children}
  </button>
);

const StatsCard = ({
  title,
  mainValue,
  trend,
  subStats,
  icon: Icon,
  gradientClass,
}: {
  title: string;
  mainValue: string;
  trend?: string;
  subStats: { icon: any; label: string; value: string; trend?: { value: string; positive: boolean } }[];
  icon: any;
  gradientClass: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${gradientClass}`}>
    <div className="space-y-4">
      <p className="text-sm text-white/70">{title}</p>
      <div className="flex items-end gap-2">
        <p className="text-4xl font-bold">{mainValue}</p>
        {trend && <span className="mb-1 text-sm text-green-400">{trend}</span>}
      </div>
      <div className="space-y-3">
        {subStats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-white/70">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{stat.value}</span>
              {stat.trend && (
                <span className={stat.trend.positive ? "text-green-400" : "text-red-400"}>
                  ({stat.trend.value})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="absolute right-4 top-4 opacity-20">
      <Icon className="w-24 h-24" />
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("https://owntrainer.uz/api/admin/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setData(data);
        } else {
          if (response.status === 401) {
            navigate("/login");
          }
          toast({
            title: "Error",
            description: "Failed to fetch dashboard data",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [navigate]);

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0F16]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F16]">
      <nav className="sticky top-0 z-10 backdrop-blur-xl bg-[#0A0F16]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <NavButton active>
                <Home className="w-4 h-4" />
                Asosiy
              </NavButton>
              <NavButton>
                <FileText className="w-4 h-4" />
                Kontentlar
              </NavButton>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#0A0F16] font-medium hover:bg-white/90 transition-all duration-300">
              <Plus className="w-4 h-4" />
              Qo'shish
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">
        <h1 className="text-2xl font-bold">Admin boshqaruv paneli</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Bugun tizimga qo'shildi"
            mainValue={`${data.top_section.users_today} ta`}
            trend={`+${data.top_section.registered_last_7_days - data.top_section.users_today}`}
            icon={Users}
            gradientClass="bg-gradient-to-br from-[#1C3835] to-[#0F1C1B]"
            subStats={[
              {
                icon: TrendingUp,
                label: "7 kunda",
                value: `${data.top_section.registered_last_7_days} ta`,
                trend: { value: "+7", positive: true }
              },
              {
                icon: TrendingDown,
                label: "1 oyda",
                value: `${data.top_section.registered_last_month} ta`,
                trend: { value: "-62", positive: false }
              }
            ]}
          />
          <StatsCard
            title="Umumiy foydalanuvchilar soni"
            mainValue={`${data.top_section.total_users} ta`}
            icon={Users}
            gradientClass="bg-gradient-to-br from-[#2B2519] to-[#161311]"
            subStats={[
              {
                icon: TrendingUp,
                label: "Premium",
                value: `${data.top_section.premium_users} ta`
              },
              {
                icon: TrendingDown,
                label: "Free",
                value: `${data.top_section.non_premium_users} ta`
              }
            ]}
          />
          <StatsCard
            title="Umumiy kontentlar soni"
            mainValue={`${data.top_section.total_exercises + data.top_section.total_meals} ta`}
            icon={CreditCard}
            gradientClass="bg-gradient-to-br from-[#261A2D] to-[#130D16]"
            subStats={[
              {
                icon: TrendingUp,
                label: "Exercises",
                value: `${data.top_section.total_exercises} ta`
              },
              {
                icon: TrendingDown,
                label: "Meals",
                value: `${data.top_section.total_meals} ta`
              }
            ]}
          />
        </div>

        <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Umumiy statistika</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-4 font-medium text-white/70">Davlatlar</th>
                    <th className="pb-4 font-medium text-white/70">Qo'shildi</th>
                    <th className="pb-4 font-medium text-white/70">Mijozlar (obunali)</th>
                    <th className="pb-4 font-medium text-white/70">Obunasiz kishilar</th>
                    <th className="pb-4 font-medium text-white/70">Aktiv</th>
                    <th className="pb-4 font-medium text-white/70">Noaktiv</th>
                    <th className="pb-4 font-medium text-white/70">Tushum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bottom_section
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-4">{item.country}</td>
                        <td className="py-4">{item.total_users} ta</td>
                        <td className="py-4">{item.subscribers} ta</td>
                        <td className="py-4">{item.non_subscribers} ta</td>
                        <td className="py-4 text-emerald-400">{item.active_users} ta</td>
                        <td className="py-4 text-red-400">{item.inactive_users} ta</td>
                        <td className="py-4">{item.income.toLocaleString()} so'm</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border-t border-white/10 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex space-x-2">
              {Array.from(
                { length: Math.ceil(data.bottom_section.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      currentPage === i + 1 ? "bg-white text-[#0A0F16]" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === Math.ceil(data.bottom_section.length / itemsPerPage)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
