import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyChartProps {
  data: number[];
  title: string;
}

export function HourlyChart({ data, title }: HourlyChartProps) {
  const chartData = data.map((value, index) => ({
    hour: `${index.toString().padStart(2, '0')}:00`,
    requests: value,
  }));

  return (
    <div className="glass-card p-4">
      <h3 className="font-medium mb-4">{title}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(187 85% 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(187 85% 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="hsl(215 20% 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              stroke="hsl(215 20% 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 10%)',
                border: '1px solid hsl(222 30% 18%)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(215 20% 55%)' }}
              itemStyle={{ color: 'hsl(187 85% 53%)' }}
            />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="hsl(187 85% 53%)"
              strokeWidth={2}
              fill="url(#colorRequests)"
              name="Request"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
