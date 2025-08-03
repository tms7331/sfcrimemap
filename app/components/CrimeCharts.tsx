"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import UniqueLoading from "@/components/ui/morph-loading"

// Type definitions
export interface MonthlyData {
  month: string
  incidents: number
}

export interface TrendData {
  month: string
  date?: string
  [key: string]: string | number | undefined
}

interface MonthlyDistributionChartProps {
  data: MonthlyData[]
  loading: boolean
}

interface CrimeTrendChartProps {
  data: TrendData[]
  loading: boolean
}

export function MonthlyDistributionChart({ data, loading }: MonthlyDistributionChartProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-white">Monthly Distribution</CardTitle>
            <CardDescription className="text-slate-400 text-sm">Incidents by month (2018-present)</CardDescription>
          </div>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
            {loading ? "Loading..." : "Live Data"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <UniqueLoading variant="morph" size="lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="incidents" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function CrimeTrendChart({ data, loading }: CrimeTrendChartProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-white">Crime Trend by Category</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Distribution of top crime categories over time
            </CardDescription>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
            {loading ? "Loading..." : "Live Data"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-80 md:h-96">
              <UniqueLoading variant="morph" size="lg" />
            </div>
          ) : (
            <>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    {/* Dynamically render areas based on available categories */}
                    {data.length > 0 && Object.keys(data[0])
                      .filter(key => key !== 'month' && key !== 'date')
                      .map((category, index) => {
                        const colors = [
                          '#EF4444', // red
                          '#F97316', // orange
                          '#EAB308', // yellow
                          '#22C55E', // green
                          '#3B82F6', // blue
                          '#8B5CF6', // purple
                          '#EC4899', // pink
                          '#14B8A6', // teal
                          '#64748B', // slate
                          '#F59E0B'  // amber
                        ]
                        return (
                          <Area
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stackId="1"
                            stroke={colors[index % colors.length]}
                            fill={colors[index % colors.length]}
                            fillOpacity={0.6}
                          />
                        )
                      })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="p-4 bg-gray-900/90 rounded-lg border border-gray-700/50 backdrop-blur-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                  {data.length > 0 && Object.keys(data[0])
                    .filter(key => key !== 'month' && key !== 'date')
                    .map((category, index) => {
                      const colors = [
                        '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
                        '#8B5CF6', '#EC4899', '#14B8A6', '#64748B', '#F59E0B'
                      ]

                      // Map full category names to shortened versions
                      const categoryMap: { [key: string]: string } = {
                        'Administrative & Investigative': 'Administrative',
                        'Drug & Public Order': 'Drug & Public',
                        'Physical Violence & Assault': 'Violence',
                        'Property Theft & Larceny': 'Property Theft',
                        'Sexual & Violent Crimes': 'Sexual & Violent',
                        'Vehicle-Related Crimes': 'Vehicle Crimes',
                        'Financial Crimes': 'Financial',
                        'Property Damage': 'Property Damage',
                        'Burglary': 'Burglary',
                        'Robbery': 'Robbery'
                      }

                      const displayName = categoryMap[category] || category;
                      const total = data.reduce((sum, item) => {
                        const value = item[category];
                        return sum + (typeof value === 'number' ? value : 0);
                      }, 0);

                      return (
                        <div key={category} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="text-gray-300 text-xs font-medium">
                            {displayName}: {total.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
