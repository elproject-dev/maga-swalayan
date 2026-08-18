"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { Globe } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  activeUsers: {
    label: "Pengguna Aktif",
    color: "#8b5cf6", // Violet 500
  },
} satisfies ChartConfig

interface SourceBarChartProps {
  data: { source: string; activeUsers: number }[]
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload, data } = props;
  const item = data?.find((d: any) => d.source === payload.value);
  const users = item?.activeUsers !== undefined ? `(${item.activeUsers})` : '';

  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={8} 
        y={-22} 
        textAnchor="start" 
        fill="currentColor" 
        fontSize={12}
        className="font-medium text-foreground"
      >
        {payload.value}
        <tspan fill="currentColor" className="font-normal ml-2 text-muted-foreground" dx={6}>
          {users}
        </tspan>
      </text>
    </g>
  );
};

export function SourceBarChart({ data }: SourceBarChartProps) {
  // Format the source name for better readability
  const chartData = data.map(item => {
    let sourceName = item.source;
    if (sourceName === '(not set)' || sourceName === '(direct) / (none)') {
      sourceName = 'Langsung (Direct)';
    }
    return {
      source: sourceName,
      activeUsers: item.activeUsers
    };
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Sumber / Media Pengguna</CardTitle>
        <CardDescription>Data Google Analytics (30 Hari)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-4 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 20, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="source"
                type="category"
                tickLine={false}
                axisLine={false}
                width={1}
                tick={<CustomYAxisTick data={chartData} />}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="activeUsers"
                fill="var(--color-activeUsers)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Belum ada data sumber lalu lintas
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t pt-4 mt-auto">
        <Globe className="h-4 w-4" />
        Menampilkan 10 sumber teratas
      </CardFooter>
    </Card>
  )
}
