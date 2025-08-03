'use client';

import { useEffect, useState } from 'react';
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
  Legend
} from 'recharts';

interface MonthlyData {
  date: string;
  count: number;
}

interface CategoryTrendData {
  date: string;
  [category: string]: string | number;
}

const COLORS: { [key: string]: string } = {
  'Property Theft & Larceny': '#e76f51',
  'Vehicle-Related Crimes': '#2a9d8f',
  'Administrative & Investigative': '#264653',
  'Physical Violence & Assault': '#f4a261',
  'Property Damage': '#e9c46a',
  'Drug & Public Order': '#457b9d',
  'Burglary': '#1d3557',
  'Robbery': '#f1faee',
  'Financial Crimes': '#a8dadc',
  'Sexual & Violent Crimes': '#ff006e'
};

export function CrimeCharts() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryTrendData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/charts');
        const result = await response.json();

        setMonthlyData(result.monthly);
        setCategoryData(result.categoryTrends);

        // Extract categories from the first data point
        if (result.categoryTrends.length > 0) {
          const cats = Object.keys(result.categoryTrends[0]).filter(key => key !== 'date');
          setCategories(cats);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return <div className="text-white">Loading charts...</div>;
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8">
      {/* Monthly Distribution Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={formatDate}
                interval={6}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value) => [`${value} incidents`, 'Count']}
                labelFormatter={(label) => formatDate(label)}
              />
              <Bar dataKey="count" fill="#e76f51" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Crime Trend by Category Chart */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Crime Trend by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={formatDate}
                interval={6}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend
                wrapperStyle={{ color: '#9CA3AF' }}
                iconType="rect"
              />
              {categories.map((category) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={COLORS[category] || '#666'}
                  fill={COLORS[category] || '#666'}
                  fillOpacity={0.8}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}