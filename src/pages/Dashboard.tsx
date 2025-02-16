
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, CreditCard, TrendingUp, TrendingDown, Plus } from "lucide-react";
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
    className={`px-6 py-2 rounded-lg transition-all ${
      active
        ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        : "text-white/60 hover:text-white hover:bg-white/5"
    }`}
  >
    {children}
  </button>
);

const StatsCard = ({
  title,
  mainValue,
  subStats,
  icon: Icon,
  gradientClass,
}: {
  title: string;
  mainValue: string;
  subStats: { icon: any; label: string; value: string; trend?: "up" | "down" }[];
  icon: any;
  gradientClass: string;
}) => (
  <div className={`glass-card p-6 rounded-2xl space-y-4 ${gradientClass}`}>
    <div className="space-y-1">
      <p className="text-sm text-white/60">{title}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-semibold">{mainValue}</p>
        <Icon className="w-8 h-8 text-white/80" />
      </div>
    </div>
    <div className="space-y-2">
      {subStats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/5">
            <stat.icon className="w-4 h-4 text-white/60" />
          </div>
          <span className="text-sm text-white/60">{stat.label}:</span>
          <span className="text-sm font-medium">{stat.value}</span>
          {stat.trend && (
            <span className={stat.trend === "up" ? "text-green-400" : "text-red-400"}>
              {stat.trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
      ))}
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
      <div className="min-h-screen w-full flex items-center justify-center bg-admin-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-dark">
      <nav className="border-b border-white/10 backdrop-blur-xl bg-admin-dark/30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NavButton active>Asosiy</NavButton>
            <NavButton>Kontentlar</NavButton>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-white text-admin-dark font-medium hover:bg-white/90 transition-colors">
            <Plus className="w-4 h-4" />
            Qo'shish
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8 animate-fadeIn">
        <h1 className="text-2xl font-semibold">Admin boshqaruv paneli</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Bugun tizimga qo'shildi"
            mainValue={`${data.top_section.users_today} ta`}
            icon={Users}
            gradientClass="bg-gradient-to-br from-green-500/10 to-green-600/5"
            subStats={[
              {
                icon: TrendingUp,
                label: "7 kunda",
                value: `${data.top_section.registered_last_7_days} ta`,
              },
              {
                icon: TrendingDown,
                label: "1 oyda",
                value: `${data.top_section.registered_last_month} ta`,
              },
            ]}
          />
          <StatsCard
            title="Umumiy foydalanuvchilar soni"
            mainValue={`${data.top_section.total_users} ta`}
            icon={Users}
            gradientClass="bg-gradient-to-br from-orange-500/10 to-orange-600/5"
            subStats={[
              {
                icon: TrendingUp,
                label: "Premium",
                value: `${data.top_section.premium_users} ta`,
              },
              {
                icon: TrendingDown,
                label: "Free",
                value: `${data.top_section.non_premium_users} ta`,
              },
            ]}
          />
          <StatsCard
            title="Umumiy kontentlar soni"
            mainValue={`${data.top_section.total_exercises + data.top_section.total_meals} ta`}
            icon={CreditCard}
            gradientClass="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
            subStats={[
              {
                icon: TrendingUp,
                label: "Exercises",
                value: `${data.top_section.total_exercises} ta`,
              },
              {
                icon: TrendingDown,
                label: "Meals",
                value: `${data.top_section.total_meals} ta`,
              },
            ]}
          />
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Umumiy statistika</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-4 font-medium">Davlatlar</th>
                    <th className="pb-4 font-medium">Qo'shildi</th>
                    <th className="pb-4 font-medium">Mijozlar (obunali)</th>
                    <th className="pb-4 font-medium">Obunasiz kishilar</th>
                    <th className="pb-4 font-medium">Aktiv</th>
                    <th className="pb-4 font-medium">Noaktiv</th>
                    <th className="pb-4 font-medium">Tushum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bottom_section
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="py-4">{item.country}</td>
                        <td className="py-4">{item.total_users} ta</td>
                        <td className="py-4">{item.subscribers} ta</td>
                        <td className="py-4">{item.non_subscribers} ta</td>
                        <td className="py-4 text-green-400">{item.active_users} ta</td>
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
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      currentPage === i + 1 ? "bg-white text-admin-dark" : "bg-white/5 hover:bg-white/10"
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
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
