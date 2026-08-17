"use client"

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function RealtimeBarChart({ data }: { data: any[] }) {
  const chartConfig = {
    users: {
      label: "Pengguna",
      color: "#3b82f6", // Blue 500
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengguna Aktif per Menit</CardTitle>
        <CardDescription>Aktivitas pengguna dalam 30 menit terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="minute"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.includes('mnt') ? value.split(' ')[0] : value}
              fontSize={10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
