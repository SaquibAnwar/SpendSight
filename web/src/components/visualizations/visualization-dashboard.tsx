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

const CHART_COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#F97316",
  "#22C55E",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
];

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
    <section id="visualization-dashboard" className="w-full space-y-4">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Visualisations</h2>
        <p className="text-sm text-muted-foreground">
          Explore your spend through interactive charts. Export-ready data is
          generated in the background.
        </p>
      </header>

      <Tabs defaultValue="category">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="category">Category breakdown</TabsTrigger>
          <TabsTrigger value="daily">Daily spend</TabsTrigger>
          <TabsTrigger value="recurring">Recurring vs non-recurring</TabsTrigger>
          <TabsTrigger value="merchants">Top merchants</TabsTrigger>
          <TabsTrigger value="trend">Category trend</TabsTrigger>
          <TabsTrigger value="debitcredit">Debits vs credits</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={140}
                  paddingAngle={4}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="daily">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={dailySpendSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spend"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="recurring">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={recurringBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Bar dataKey="value" fill={CHART_COLORS[1]} radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="merchants">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={topMerchants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Bar dataKey="value" fill={CHART_COLORS[2]} radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="trend">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={categoryTrend.dataset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
                {categoryTrend.categories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="debitcredit">
          <ChartCard>
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={debitCreditBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={140}
                  paddingAngle={4}
                >
                  {debitCreditBreakdown.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

