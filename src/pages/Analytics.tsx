import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { HourlyChart } from '@/components/dashboard/HourlyChart';
import { TopItemsList } from '@/components/dashboard/TopItemsList';
import { getMockStats, getMockTopIPs, getMockTopPaths } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Globe, Activity, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stats = getMockStats();
  const topIPs = getMockTopIPs();
  const topPaths = getMockTopPaths();

  // Weekly trend data
  const weeklyData = [
    { day: 'Sen', requests: 4200, threats: 280 },
    { day: 'Sel', requests: 3800, threats: 210 },
    { day: 'Rab', requests: 5100, threats: 390 },
    { day: 'Kam', requests: 4600, threats: 320 },
    { day: 'Jum', requests: 5800, threats: 450 },
    { day: 'Sab', requests: 3200, threats: 180 },
    { day: 'Min', requests: 2900, threats: 150 },
  ];

  // Risk distribution
  const riskData = [
    { name: 'Kritis', value: 15, color: 'hsl(0 72% 51%)' },
    { name: 'Tinggi', value: 25, color: 'hsl(15 90% 55%)' },
    { name: 'Sedang', value: 35, color: 'hsl(38 92% 50%)' },
    { name: 'Rendah', value: 20, color: 'hsl(142 76% 36%)' },
    { name: 'Info', value: 5, color: 'hsl(199 89% 48%)' },
  ];

  // Method distribution
  const methodData = [
    { method: 'GET', count: 4500 },
    { method: 'POST', count: 2800 },
    { method: 'HEAD', count: 1200 },
    { method: 'OPTIONS', count: 800 },
    { method: 'PUT', count: 400 },
    { method: 'DELETE', count: 200 },
  ];

  const user = { email: 'admin@neypot.id', role: 'admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={() => toast.info('Logout clicked')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <main className={cn(
        'transition-all duration-300 p-6',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      )}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analitik</h1>
          <p className="text-muted-foreground">Statistik dan tren keamanan</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hourly Chart */}
          <HourlyChart data={stats.events_per_hour} title="Request per Jam" />

          {/* Weekly Trend */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Tren Mingguan</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 10%)',
                      border: '1px solid hsl(222 30% 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="requests" stroke="hsl(187 85% 53%)" strokeWidth={2} dot={false} name="Total Request" />
                  <Line type="monotone" dataKey="threats" stroke="hsl(0 72% 51%)" strokeWidth={2} dot={false} name="Threats" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Distribusi Risiko</h3>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 10%)',
                      border: '1px solid hsl(222 30% 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Method Distribution */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Distribusi Method HTTP</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData} layout="vertical">
                  <XAxis type="number" stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="method" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 47% 10%)',
                      border: '1px solid hsl(222 30% 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(187 85% 53%)" radius={[0, 4, 4, 0]} name="Jumlah" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopItemsList
            title="Top 5 IP Sumber"
            items={topIPs}
            icon={<Globe className="h-4 w-4 text-primary" />}
          />
          <TopItemsList
            title="Top 5 Path Target"
            items={topPaths}
            icon={<Activity className="h-4 w-4 text-primary" />}
          />
        </div>
      </main>
    </div>
  );
}
