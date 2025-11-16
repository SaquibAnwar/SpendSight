"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <main className="bg-muted/40 min-h-[calc(100vh-57px)] border-t border-border/60">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Design System Showcase
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Internal-only sandbox page that renders every core UI primitive in a
            mock dashboard layout. Use this to visually verify new styles
            against the SpendSight design language from{" "}
            <code className="rounded border bg-muted px-1.5 py-0.5 text-[0.8em]">
              design.json
            </code>
            .
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Section
            title="Buttons & Badges"
            description="Primary actions and status chips used across the dashboard."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm" variant="outline">
                Outline
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
              <Button size="sm" variant="link">
                Link
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </Section>

          <Section
            title="Inputs & Textareas"
            description="Form controls for filters, search, and configuration."
          >
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-foreground">Search</span>
                  <Input placeholder="Search transactions or vendors" />
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-foreground">
                    Notes (optional)
                  </span>
                  <Textarea rows={3} placeholder="Add an internal note..." />
                </label>
              </div>
            </div>
          </Section>

          <Section
            title="Switches & Toggles"
            description="Binary controls for feature flags and notification settings."
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    Spending alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notify me when monthly spend exceeds the threshold.
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    AI categorization
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the configured LLM to suggest categories.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Section>

          <Section
            title="Tabs"
            description="Used to switch between dashboard perspectives."
          >
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cash-flow">Cash flow</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4 space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Overview
                </p>
                <p className="text-sm text-muted-foreground">
                  High-level snapshot of balances, inflows, and outflows.
                </p>
              </TabsContent>
              <TabsContent value="cash-flow" className="mt-4 space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Cash flow
                </p>
                <p className="text-sm text-muted-foreground">
                  Month-over-month trends for income and expenses.
                </p>
              </TabsContent>
              <TabsContent value="categories" className="mt-4 space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Categories
                </p>
                <p className="text-sm text-muted-foreground">
                  Breakdown of spend by category with comparison to last
                  period.
                </p>
              </TabsContent>
            </Tabs>
          </Section>

          <Section
            title="Alerts"
            description="Inline status banners for success, warning, and error states."
          >
            <div className="space-y-3">
              <Alert>
                <AlertTitle>Import complete</AlertTitle>
                <AlertDescription>
                  Your latest statement has been parsed and categorized. Review
                  any uncategorized transactions below.
                </AlertDescription>
              </Alert>
              <Alert className="border-destructive/30 bg-destructive/5">
                <AlertTitle>Connection issue</AlertTitle>
                <AlertDescription>
                  We could not refresh live balances. Retry in a few minutes or
                  check your bank connection.
                </AlertDescription>
              </Alert>
            </div>
          </Section>

          <Section
            title="Table"
            description="Compact financial table with aligned numeric values."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">This month</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Housing</TableCell>
                  <TableCell className="text-right">$1,950</TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                    +2.3%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Groceries</TableCell>
                  <TableCell className="text-right">$640</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    +8.1%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transport</TableCell>
                  <TableCell className="text-right">$220</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    –1.4%
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableCaption className="text-xs">
                Sample data only — used to validate table spacing and numeric
                alignment.
              </TableCaption>
            </Table>
          </Section>

          <Section
            title="Dialog"
            description="Example modal for exporting a quick PDF snapshot."
          >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Open export dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export snapshot</DialogTitle>
                  <DialogDescription>
                    Generate a one-page PDF summary of this dashboard to share
                    with your team or clients.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-foreground">
                      Report name
                    </span>
                    <Input defaultValue="Monthly spend overview" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-foreground">
                      Notes (optional)
                    </span>
                    <Textarea
                      rows={3}
                      placeholder="Add any annotations that should appear in the footer."
                    />
                  </label>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => setDialogOpen(false)}>
                    Export PDF
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>
        </div>

        <Card className="border-dashed bg-background/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Typography Scale
            </CardTitle>
            <CardDescription>
              Full type hierarchy from design.json — display, heading, body,
              numeric, and label tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Display
                </p>
                <div className="space-y-2 border-l-2 border-border pl-4">
                  <p className="text-5xl font-bold leading-tight tracking-tight">
                    Display XL (48px)
                  </p>
                  <p className="text-3xl font-semibold leading-tight tracking-tight">
                    Display LG (32px)
                  </p>
                  <p className="text-2xl font-semibold leading-tight tracking-tight">
                    Display MD (24px)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Headings
                </p>
                <div className="space-y-2 border-l-2 border-border pl-4">
                  <p className="text-xl font-semibold">Heading LG (20px)</p>
                  <p className="text-lg font-semibold">Heading SM (18px)</p>
                  <p className="text-sm font-semibold">Heading XS (14px)</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Body
                </p>
                <div className="space-y-2 border-l-2 border-border pl-4">
                  <p className="text-base">
                    Body LG (16px) — Larger body text for emphasis or
                    readability.
                  </p>
                  <p className="text-sm">
                    Body MD (14px) — Primary body copy in cards and labels.
                  </p>
                  <p className="text-xs">
                    Body SM (12px) — Secondary copy, helper text, data labels.
                  </p>
                  <p className="text-[11px]">
                    Body XS (11px) — Tiny labels, captions, chart axis labels.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Numeric
                </p>
                <div className="space-y-2 border-l-2 border-border pl-4 font-mono tabular-nums">
                  <p className="text-4xl font-bold">$50,000.00</p>
                  <p className="text-3xl font-semibold">$28,450.12</p>
                  <p className="text-lg font-semibold">$18,320.99</p>
                  <p className="text-sm font-medium">$14,200.50</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Labels
                </p>
                <div className="space-y-2 border-l-2 border-border pl-4">
                  <p className="text-[13px] font-medium tracking-wide">
                    Label MD (13px) — Form labels, input labels
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wider">
                    Label SM (11px) — Overline labels, category tags
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed bg-background/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Charts & Graphs
            </CardTitle>
            <CardDescription>
              Mock visualizations following the monochrome-first, minimal-chrome
              principles from design.json.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bar Chart Mock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Monthly Spend</p>
                  <Badge variant="outline" className="text-xs">
                    Bar Chart
                  </Badge>
                </div>
                <div className="flex h-48 flex-col justify-between rounded-lg border border-border/60 bg-card p-4">
                  <div className="flex flex-1 items-end justify-between gap-3 text-slate-900 dark:text-slate-100">
                    <BarColumn label="Jan" height="60%" />
                    <BarColumn label="Feb" height="75%" />
                    <BarColumn label="Mar" height="85%" />
                    <BarColumn label="Apr" height="70%" />
                    <BarColumn label="May" height="90%" />
                  </div>
                  <div className="mt-3 h-px w-full bg-border/70" />
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>$0</span>
                    <span>$25k</span>
                    <span>$50k</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Monochrome bars using currentColor so they stay high-contrast in both light and
                  dark modes.
                </p>
              </div>

              {/* Donut Chart Mock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Category Breakdown</p>
                  <Badge variant="outline" className="text-xs">
                    Donut Chart
                  </Badge>
                </div>
                <div className="flex h-48 items-center justify-center rounded-lg border border-border/60 bg-card p-4">
                  <div className="relative flex size-32 items-center justify-center text-slate-900 dark:text-slate-100">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90 text-current">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        strokeDasharray="125 251"
                        strokeOpacity="1"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        strokeDasharray="62 251"
                        strokeDashoffset="-125"
                        strokeOpacity="0.7"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        strokeDasharray="40 251"
                        strokeDashoffset="-187"
                        strokeOpacity="0.45"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        strokeDasharray="24 251"
                        strokeDashoffset="-227"
                        strokeOpacity="0.25"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-semibold tabular-nums">$12.5k</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Neutral palette with white stroke separation and center metric.
                </p>
              </div>

              {/* Line Chart Mock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Trend Over Time</p>
                  <Badge variant="outline" className="text-xs">
                    Line Chart
                  </Badge>
                </div>
                <div className="flex h-48 items-center justify-center rounded-lg border border-border/60 bg-card p-4 text-slate-900 dark:text-slate-100">
                  <svg
                    viewBox="0 0 200 80"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-900"
                      points="0,60 40,45 80,50 120,30 160,35 200,20"
                    />
                    <polyline
                      fill="url(#gradient)"
                      points="0,60 40,45 80,50 120,30 160,35 200,20 200,80 0,80"
                      opacity="0.1"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">
                  Smooth curve with optional gradient fill for emphasis.
                </p>
              </div>

              {/* Sparkline Mock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Inline Sparkline</p>
                  <Badge variant="outline" className="text-xs">
                    Sparkline
                  </Badge>
                </div>
                <div className="space-y-3 rounded-lg border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Housing</span>
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 60 20"
                        className="h-5 w-16"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-emerald-600 dark:text-emerald-400"
                          points="0,15 15,10 30,12 45,8 60,5"
                        />
                      </svg>
                      <span className="text-sm font-semibold tabular-nums">$1,950</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Groceries</span>
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 60 20"
                        className="h-5 w-16"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-slate-700 dark:text-slate-300"
                          points="0,10 15,12 30,8 45,14 60,10"
                        />
                      </svg>
                      <span className="text-sm font-semibold tabular-nums">$640</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transport</span>
                    <div className="flex items-center gap-2">
                      <svg
                        viewBox="0 0 60 20"
                        className="h-5 w-16"
                        preserveAspectRatio="none"
                      >
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-red-600 dark:text-red-400"
                          points="0,8 15,6 30,10 45,15 60,18"
                        />
                      </svg>
                      <span className="text-sm font-semibold tabular-nums">$220</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compact trend indicators for tables and compact layouts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed bg-background/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Color tokens preview
            </CardTitle>
            <CardDescription>
              Quick reference of key scales from the design language — use the
              actual Tailwind theme tokens in product code.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 text-xs md:grid-cols-5">
              <ColorScalePreview
                label="Neutral"
                classes={[
                  "bg-slate-50",
                  "bg-slate-100",
                  "bg-slate-200",
                  "bg-slate-300",
                  "bg-slate-400",
                  "bg-slate-500",
                  "bg-slate-600",
                  "bg-slate-700",
                  "bg-slate-800",
                  "bg-slate-900",
                ]}
              />
              <ColorScalePreview
                label="Green"
                classes={[
                  "bg-emerald-50",
                  "bg-emerald-100",
                  "bg-emerald-200",
                  "bg-emerald-300",
                  "bg-emerald-400",
                  "bg-emerald-500",
                  "bg-emerald-600",
                  "bg-emerald-700",
                  "bg-emerald-800",
                  "bg-emerald-900",
                ]}
              />
              <ColorScalePreview
                label="Blue"
                classes={[
                  "bg-blue-50",
                  "bg-blue-100",
                  "bg-blue-200",
                  "bg-blue-300",
                  "bg-blue-400",
                  "bg-blue-500",
                  "bg-blue-600",
                  "bg-blue-700",
                  "bg-blue-800",
                  "bg-blue-900",
                ]}
              />
              <ColorScalePreview
                label="Purple"
                classes={[
                  "bg-violet-50",
                  "bg-violet-100",
                  "bg-violet-200",
                  "bg-violet-300",
                  "bg-violet-400",
                  "bg-violet-500",
                  "bg-violet-600",
                  "bg-violet-700",
                  "bg-violet-800",
                  "bg-violet-900",
                ]}
              />
              <ColorScalePreview
                label="Orange"
                classes={[
                  "bg-orange-50",
                  "bg-orange-100",
                  "bg-orange-200",
                  "bg-orange-300",
                  "bg-orange-400",
                  "bg-orange-500",
                  "bg-orange-600",
                  "bg-orange-700",
                  "bg-orange-800",
                  "bg-orange-900",
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function ColorScalePreview({
  label,
  classes,
}: {
  label: string;
  classes: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-5 gap-1">
        {classes.map((cls, index) => (
          <div
            key={cls}
            className={`${cls} aspect-[3/2] rounded-md border border-border/40`}
          >
            <span className="sr-only">Shade {index}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarColumn({ label, height }: { label: string; height: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-end gap-1">
      <div
        className="w-8 rounded-t-md bg-current shadow-sm"
        style={{ height }}
        aria-hidden="true"
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}



