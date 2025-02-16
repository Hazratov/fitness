import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  dailyUsers: number;
  weeklyUsers: number;
  totalUsers: number;
  usersByCountry: {
    country: string;
    totalUsers: number;
    activeUsers: number;
    subscribers: number;  // premiumUsers o'rniga
    revenue: number;
  }[];
}

const transformStats = (backendData: any): DashboardStats => {
  return {
    dailyUsers: backendData.top_section.users_today,
    weeklyUsers: backendData.top_section.registered_last_7_days,
    totalUsers: backendData.top_section.total_users,
    usersByCountry: backendData.bottom_section.map((country: any) => ({
      country: country.country,
      totalUsers: country.total_users,
      activeUsers: country.active_users,
      subscribers: country.subscribers, // premiumUsers o'rniga subscribers ishlatamiz
      revenue: country.income, // revenue o'rniga income ishlatilmoqda
    })),
  };
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  icon: any;
  className?: string;
}) => (
  <div className={`glass-card p-6 rounded-2xl space-y-4 transition-all hover:scale-[1.02] cursor-pointer ${className}`}>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-400">{title}</p>
      <Icon className="w-6 h-6 text-white/80" />
    </div>
    <p className="text-3xl font-semibold">{value} ta</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
          setStats(transformStats(data));
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

  if (!stats) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-admin-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-dark p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <h1 className="text-2xl font-semibold">Admin boshqaruv paneli</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Bugun qo'shilgan foydalanuvchilar"
            value={stats.dailyUsers}
            icon={Home}
            className="bg-gradient-to-br from-green-500/20 to-green-600/20"
          />
          <StatsCard
            title="Umumiy foydalanuvchilar soni"
            value={stats.totalUsers}
            icon={Users}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
          />
          <StatsCard
            title="Umumiy kontentlar soni"
            value={214}
            icon={CreditCard}
            className="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
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
                    <th className="pb-4 font-medium">Obunachilar</th>
                    <th className="pb-4 font-medium">Daromad</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.usersByCountry
                    ?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="py-4">{item.country}</td>
                        <td className="py-4">{item.totalUsers} ta</td>
                        <td className="py-4 text-admin-green">{item.subscribers} ta</td>
                        <td className="py-4">{item.revenue.toLocaleString()} so'm</td>
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
              {Array.from({ length: Math.ceil(stats.usersByCountry.length / itemsPerPage) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === i + 1 ? "bg-white text-admin-dark" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === Math.ceil(stats.usersByCountry.length / itemsPerPage)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
