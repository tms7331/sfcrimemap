"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react"
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
import { useState, useEffect } from "react"
import { CrimeMap } from "./components/CrimeMap"
import { ComparisonMap } from "./components/ComparisonMap"

// Mock data for monthly distribution
const monthlyData = [
  { month: "Jan", incidents: 8500 },
  { month: "Feb", incidents: 7800 },
  { month: "Mar", incidents: 9200 },
  { month: "Apr", incidents: 8900 },
  { month: "May", incidents: 9800 },
  { month: "Jun", incidents: 10500 },
  { month: "Jul", incidents: 11200 },
  { month: "Aug", incidents: 10800 },
  { month: "Sep", incidents: 9600 },
  { month: "Oct", incidents: 9100 },
  { month: "Nov", incidents: 8400 },
  { month: "Dec", incidents: 7900 },
]

// Mock data for crime trends by category
const trendData = [
  { month: "Jan", theft: 3200, assault: 1800, burglary: 1200, vandalism: 900, drug: 800, other: 600 },
  { month: "Feb", theft: 2900, assault: 1600, burglary: 1100, vandalism: 850, drug: 750, other: 600 },
  { month: "Mar", theft: 3500, assault: 2000, burglary: 1300, vandalism: 1000, drug: 900, other: 500 },
  { month: "Apr", theft: 3300, assault: 1900, burglary: 1250, vandalism: 950, drug: 850, other: 650 },
  { month: "May", theft: 3800, assault: 2100, burglary: 1400, vandalism: 1100, drug: 900, other: 500 },
  { month: "Jun", theft: 4200, assault: 2300, burglary: 1500, vandalism: 1200, drug: 950, other: 350 },
  { month: "Jul", theft: 4500, assault: 2400, burglary: 1600, vandalism: 1300, drug: 1000, other: 400 },
  { month: "Aug", theft: 4300, assault: 2200, burglary: 1550, vandalism: 1250, drug: 950, other: 550 },
  { month: "Sep", theft: 3900, assault: 2000, burglary: 1400, vandalism: 1100, drug: 850, other: 350 },
  { month: "Oct", theft: 3600, assault: 1850, burglary: 1300, vandalism: 1000, drug: 800, other: 550 },
  { month: "Nov", theft: 3300, assault: 1700, burglary: 1200, vandalism: 900, drug: 750, other: 550 },
  { month: "Dec", theft: 3100, assault: 1600, burglary: 1100, vandalism: 800, drug: 700, other: 600 },
]

// Mock comparison data
const comparisonData = [
  { category: "Larceny Theft", period1: 1240, period2: 1309, change: 69, percentChange: 5.6 },
  { category: "Disorderly Conduct", period1: 164, period2: 115, change: -49, percentChange: -29.9 },
  { category: "Warrant", period1: 170, period2: 216, change: 46, percentChange: 27.1 },
  { category: "Drug Offense", period1: 197, period2: 156, change: -41, percentChange: -20.8 },
  { category: "Missing Person", period1: 148, period2: 114, change: -34, percentChange: -23.0 },
  { category: "Arson", period1: 17, period2: 45, change: 28, percentChange: 164.7 },
  { category: "Suspicious Occ", period1: 138, period2: 115, change: -23, percentChange: -16.7 },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"historical" | "compare">("historical")
  const [firstPeriod, setFirstPeriod] = useState("2024-01")
  const [secondPeriod, setSecondPeriod] = useState("2024-02")
  const [realMonthlyData, setRealMonthlyData] = useState(monthlyData)
  const [monthlyLoading, setMonthlyLoading] = useState(false)
  const [realTrendData, setRealTrendData] = useState(trendData)
  const [trendLoading, setTrendLoading] = useState(false)
  const [mapData, setMapData] = useState<{ longitude: number; latitude: number; weight: number }[]>([])
  const [mapLoading, setMapLoading] = useState(false)

  useEffect(() => {
    if (activeTab === "historical") {
      const fetchMonthlyData = async () => {
        setMonthlyLoading(true)
        try {
          const response = await fetch('/api/charts?type=monthly')
          const result = await response.json()
          if (result.data) {
            // Format the data to match the expected structure
            const formattedData = result.data.map((item: { date: string; count: number }) => ({
              month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
              incidents: item.count
            }))
            setRealMonthlyData(formattedData)
          }
        } catch (error) {
          console.error('Error fetching monthly data:', error)
          // Keep using mock data on error
        } finally {
          setMonthlyLoading(false)
        }
      }
      fetchMonthlyData()

      const fetchTrendData = async () => {
        setTrendLoading(true)
        try {
          const response = await fetch('/api/charts?type=category-trends')
          const result = await response.json()
          if (result.data) {
            // Format the data - need to extract month and limit data points
            const formattedData = result.data.slice(-12).map((item: { date: string; [key: string]: string | number }) => ({
              month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
              ...item
            }))
            setRealTrendData(formattedData)
          }
        } catch (error) {
          console.error('Error fetching trend data:', error)
          // Keep using mock data on error
        } finally {
          setTrendLoading(false)
        }
      }
      fetchTrendData()

      const fetchMapData = async () => {
        setMapLoading(true)
        try {
          const response = await fetch('/api/incidents?limit=5000')
          const result = await response.json()
          if (result.data) {
            setMapData(result.data)
          }
        } catch (error) {
          console.error('Error fetching map data:', error)
        } finally {
          setMapLoading(false)
        }
      }
      fetchMapData()
    }
  }, [activeTab])

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-400" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-emerald-400" />
    return <Minus className="h-4 w-4 text-slate-400" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-red-400"
    if (change < 0) return "text-emerald-400"
    return "text-slate-400"
  }

  const renderHistoricalData = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:items-stretch">
      {/* Charts Column */}
      <div className="xl:col-span-1 flex flex-col gap-4 order-2 xl:order-1">
        {/* Monthly Distribution */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-white">Monthly Distribution</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Incidents by month (2018-present)</CardDescription>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                {monthlyLoading ? "Loading..." : "Live Data"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            </div>
          </CardContent>
        </Card>

        {/* Crime Trend by Category */}
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
                {trendLoading ? "Loading..." : "Live Data"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Legend />
                  {/* Dynamically render areas based on available categories */}
                  {realTrendData.length > 0 && Object.keys(realTrendData[0])
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
          </CardContent>
        </Card>
      </div>

      {/* Heat Map Column */}
      <div className="xl:col-span-2 order-1 xl:order-2 flex">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 flex-1 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-medium text-white">Crime Heat Map</CardTitle>
                <CardDescription className="text-slate-400">
                  Geographic distribution of incidents across San Francisco
                </CardDescription>
              </div>
              <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30">
                <CalendarDays className="h-3 w-3 mr-1" />
                {mapLoading ? "Loading..." : "Last 2 Weeks"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="relative h-[400px] md:h-[500px] xl:h-full rounded-lg overflow-hidden border border-white/5">
              {mapLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <div className="text-white">Loading map...</div>
                </div>
              ) : (
                <CrimeMap data={mapData} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCompareData = () => (
    <div className="space-y-4">
      {/* Comparison Controls and Map Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:items-stretch">
        {/* Select Period Controls - Left side on large screens */}
        <div className="xl:col-span-1 order-2 xl:order-1 flex">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-white">Select Period</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">Choose time periods to compare</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {/* First Period */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">First Period</label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={Number.parseInt(firstPeriod.split("-")[1])}
                    onChange={(e) => setFirstPeriod(`2024-${e.target.value.padStart(2, "0")}`)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-blue-400 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
                    {firstPeriod}
                  </div>
                </div>
              </div>

              {/* Second Period */}
              <div className="space-y-3 mt-8">
                <label className="text-sm font-medium text-slate-300">Second Period</label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={Number.parseInt(secondPeriod.split("-")[1])}
                    onChange={(e) => setSecondPeriod(`2024-${e.target.value.padStart(2, "0")}`)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-purple-400 bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">
                    {secondPeriod}
                  </div>
                </div>
              </div>

              {/* Comparison Info */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-3">
                  Showing difference: <span className="text-purple-400">{secondPeriod}</span> minus{" "}
                  <span className="text-blue-400">{firstPeriod}</span>
                </p>
                <div className="flex flex-col space-y-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(65, 182, 196)' }}></div>
                    <span className="text-slate-300">Decrease</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(255, 255, 255)', border: '1px solid rgb(148, 163, 184)' }}></div>
                    <span className="text-slate-300">No change</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgb(255, 20, 50)' }}></div>
                    <span className="text-slate-300">Increase</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crime Comparison Map - Right side on large screens */}
        <div className="xl:col-span-2 order-1 xl:order-2 flex">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-medium text-white">Crime Comparison Map</CardTitle>
                  <CardDescription className="text-slate-400">
                    Geographic comparison of crime incidents between selected periods
                  </CardDescription>
                </div>
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 hover:bg-slate-500/30">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  Comparison View
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <div className="relative h-[400px] md:h-[500px] xl:h-full rounded-lg overflow-hidden border border-white/5">
                <ComparisonMap month1={firstPeriod} month2={secondPeriod} hideControls={true} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Comparison Table - Full width below */}
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-white">Category Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 uppercase tracking-wider">
                    {firstPeriod}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 uppercase tracking-wider">
                    {secondPeriod}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-slate-300 uppercase tracking-wider">
                    % Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonData.map((row) => (
                  <tr key={row.category} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm font-medium text-white">{row.category}</td>
                    <td className="px-6 py-4 text-sm text-center text-slate-300 font-mono">
                      {row.period1.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-300 font-mono">
                      {row.period2.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium font-mono ${getTrendColor(row.change)}`}>
                        {row.change > 0 ? "+" : ""}{row.change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getTrendIcon(row.change)}
                        <span className={`font-medium font-mono ${getTrendColor(row.change)}`}>
                          {row.percentChange > 0 ? "+" : ""}
                          {row.percentChange.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-blue-500/30">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-light text-white">SF Crime Data</h1>
                  <p className="text-sm text-slate-400">Real-time crime analytics dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("historical")}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === "historical"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
            >
              Historical Data
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === "compare"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
            >
              Compare Data
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-4">
        {activeTab === "historical" ? renderHistoricalData() : renderCompareData()}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}
