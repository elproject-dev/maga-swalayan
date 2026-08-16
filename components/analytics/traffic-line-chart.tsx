"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { CalendarDays } from "lucide-react"

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
    color: "#3b82f6", // Blue 500
  },
  pageViews: {
    label: "Tayangan Halaman",
    color: "#eab308", // Yellow 500
  },
} satisfies ChartConfig

interface TrafficLineChartProps {
  data: { date: string; activeUsers: number; pageViews: number }[]
}

export function TrafficLineChart({ data }: TrafficLineChartProps) {
  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Tren Kunjungan Harian</CardTitle>
        <CardDescription>Pergerakan pengguna dan tayangan halaman (30 Hari Terakhir)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-2 sm:px-6">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8}
                minTickGap={20}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={<ChartTooltipContent />}
              />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="var(--color-activeUsers)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="var(--color-pageViews)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg mx-4">
            Belum ada data tren kunjungan harian
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t pt-4 mt-4">
        <CalendarDays className="h-4 w-4" />
        Menampilkan data historis per hari
      </CardFooter>
    </Card>
  )
}
