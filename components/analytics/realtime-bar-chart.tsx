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
        <CardTitle className="text-sm font-medium">Pengguna Aktif per Menit</CardTitle>
        <CardDescription>Aktivitas dalam 30 menit terakhir</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <div className="min-w-[600px] w-full">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap={4} barSize={20}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="minute"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  minTickGap={15}
                  tickFormatter={(value) => {
                    if (value === 'Sekarang') return 'Skrg';
                    return value.includes('mnt') ? value.split(' ')[0] : value;
                  }}
                  fontSize={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="var(--color-users)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
