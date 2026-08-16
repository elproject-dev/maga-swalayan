"use client"

import * as React from "react"
import { Users } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  count: {
    label: "Total",
  },
  pelanggan: {
    label: "Pelanggan Biasa",
    color: "#94a3b8", // Slate 400
  },
  member: {
    label: "Member",
    color: "#eab308", // Yellow 500 (Maga Swalayan Theme)
  },
  staf: {
    label: "Staf",
    color: "#10b981", // Emerald 500
  },
} satisfies ChartConfig

interface UsersPieChartProps {
  totalPelanggan: number
  totalMember: number
  totalStaf: number
}

export function UsersPieChart({ totalPelanggan, totalMember, totalStaf }: UsersPieChartProps) {
  // Pelanggan biasa adalah (totalPelanggan - totalMember) karena totalMember adalah subset dari tabel pelanggan
  const pelangganBiasa = Math.max(0, totalPelanggan - totalMember);

  const chartData = [
    { type: "pelanggan", count: pelangganBiasa, fill: "var(--color-pelanggan)" },
    { type: "member", count: totalMember, fill: "var(--color-member)" },
    { type: "staf", count: totalStaf, fill: "var(--color-staf)" },
  ]

  const total = totalPelanggan + totalStaf

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Perbandingan Pengguna</CardTitle>
        <CardDescription>Pelanggan, Member, & Staf</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString('id-ID')}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Pengguna
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t pt-4 mt-auto">
        <Users className="h-4 w-4" />
        Total keseluruhan pengguna: {total}
      </CardFooter>
    </Card>
  )
}
