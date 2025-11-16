"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction } from "@/types/models";
import {
  createCategoryPieData,
  createDailySpendSeries,
  createRecurringBreakdown,
  createTopMerchants,
  createCategoryTrend,
  createDebitCreditBreakdown,
} from "@/lib/visualizations/builders";

// Monochrome-first palette with limited accents, mapped to design tokens so dark mode stays legible.
const NEUTRAL_SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];
const ACCENT_SERIES = ["var(--primary)", "var(--accent)"];

interface VisualizationDashboardProps {
  transactions: Transaction[];
}

export function VisualizationDashboard({
  transactions,
}: VisualizationDashboardProps) {
  const categoryPieData = useMemo(
    () => createCategoryPieData(transactions),
    [transactions]
  );
  const dailySpendSeries = useMemo(
    () => createDailySpendSeries(transactions),
    [transactions]
  );
  const recurringBreakdown = useMemo(
    () => createRecurringBreakdown(transactions),
    [transactions]
  );
  const topMerchants = useMemo(
    () => createTopMerchants(transactions),
    [transactions]
  );
  const categoryTrend = useMemo(
    () => createCategoryTrend(transactions),
    [transactions]
  );
  const debitCreditBreakdown = useMemo(
    () => createDebitCreditBreakdown(transactions),
    [transactions]
  );

  if (transactions.length === 0) {
    return null;
  }

  return (
    <section id="visualization-dashboard" className="w-full space-y-5">
      <header className="space-y-1.5">
        <h2 className="text-[18px] font-semibold leading-6 tracking-tight">
          Visualisations
        </h2>
        <p className="text-sm text-muted-foreground">
          Explore your spend through interactive charts. Export-ready data is
          generated in the background.
        </p>
      </header>

      <Tabs defaultValue="category" className="flex flex-col gap-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="category">Category breakdown</TabsTrigger>
          <TabsTrigger value="daily">Daily spend</TabsTrigger>
          <TabsTrigger value="recurring">Recurring vs non-recurring</TabsTrigger>
          <TabsTrigger value="merchants">Top merchants</TabsTrigger>
          <TabsTrigger value="trend">Category trend</TabsTrigger>
          <TabsTrigger value="debitcredit">Debits vs credits</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <ChartCard
            title="Category breakdown"
            subtitle="Monochrome donut with neutral legend for part-to-whole spend."
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={140}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={NEUTRAL_SERIES[index % NEUTRAL_SERIES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="daily">
          <ChartCard
            title="Daily spend curve"
            subtitle="Smoothed line with minimal chrome, showing spend over time."
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={dailySpendSeries}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke={NEUTRAL_SERIES[0]}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="recurring">
          <ChartCard
            title="Recurring vs non‑recurring"
            subtitle="Simple bar comparison using neutrals and soft gridlines."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={recurringBreakdown}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={NEUTRAL_SERIES[0]}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="merchants">
          <ChartCard
            title="Top merchants"
            subtitle="Ranked spend by merchant with monochrome bars."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={topMerchants}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="value"
                  fill={NEUTRAL_SERIES[0]}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="trend">
          <ChartCard
            title="Category trend"
            subtitle="Trend lines per category with one accent hue and neutral companions."
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={categoryTrend.dataset}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {categoryTrend.categories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={
                      index === 0
                        ? ACCENT_SERIES[0]
                        : NEUTRAL_SERIES[(index - 1) % NEUTRAL_SERIES.length]
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="debitcredit">
          <ChartCard
            title="Debits vs credits"
            subtitle="Two-slice donut emphasizing net direction of cash flow."
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <Pie
                  data={debitCreditBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={140}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {debitCreditBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        index === 0
                          ? "var(--destructive)"
                          : "var(--primary)"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toFixed(2)}
                  contentStyle={{
                    borderRadius: 6,
                    borderColor: "var(--border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ChartCard({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <Card className="w-full">
      <CardContent className="pt-5">
        {title ? (
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-none">{title}</p>
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="h-full w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

