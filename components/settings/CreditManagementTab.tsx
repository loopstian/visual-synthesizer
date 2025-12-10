"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const usageByType = [
  { name: "Image Analysis", value: 45, color: "#3b82f6" },
  { name: "Lab Segments", value: 30, color: "#8b5cf6" },
  { name: "Master Prompts", value: 15, color: "#10b981" },
]

const dailyHistory = [
  { day: "Mon", usage: 12 },
  { day: "Tue", usage: 18 },
  { day: "Wed", usage: 15 },
  { day: "Thu", usage: 25 },
  { day: "Fri", usage: 20 },
  { day: "Sat", usage: 10 },
  { day: "Sun", usage: 5 },
]

const recentLogs = [
  { id: 1, action: "Analyzed Image", cost: 1, date: "2 mins ago" },
  { id: 2, action: "Generated Segment", cost: 2, date: "15 mins ago" },
  { id: 3, action: "Master Prompt", cost: 5, date: "1 hour ago" },
  { id: 4, action: "Analyzed Image", cost: 1, date: "2 hours ago" },
  { id: 5, action: "Generated Segment", cost: 2, date: "3 hours ago" },
]

export function CreditManagementTab() {
  return (
    <div className="space-y-6">
      {/* Section 1: The HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card A: Daily Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Free Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">2 / 5 Left</div>
            <Progress value={60} className="h-2" />
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Resets in 04:23:00</p>
          </CardFooter>
        </Card>

        {/* Card B: Plan Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Guest / Free</div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>

        {/* Card C: Total Lifecycle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Lifetime Actions</p>
          </CardFooter>
        </Card>
      </div>

      {/* Section 2: Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card D: Cost Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usageByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usageByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              {usageByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card E: Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyHistory}>
                  <XAxis
                    dataKey="day"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar
                    dataKey="usage"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: The Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.cost} Credit</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
