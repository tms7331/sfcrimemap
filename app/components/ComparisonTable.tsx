'use client';

import { Badge } from '@/components/ui/badge';

interface CategoryStat {
  category: string;
  period1: number;
  period2: number;
  change: number;
  percentChange: number;
}

interface ComparisonTableProps {
  stats: CategoryStat[];
  month1: string;
  month2: string;
}

export function ComparisonTable({ stats, month1, month2 }: ComparisonTableProps) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">
                Category
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-300">
                {month1}
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-300">
                {month2}
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-300">
                Change
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-slate-300">
                % Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {stats.map((stat) => (
              <tr key={stat.category} className="hover:bg-white/5 transition-colors duration-200">
                <td className="px-6 py-4 text-sm font-medium text-white">
                  <Badge variant="outline" className="bg-white/5 border-white/10">
                    {stat.category}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-300 font-mono">
                  {stat.period1.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-300 font-mono">
                  {stat.period2.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-center font-mono">
                  <span className={`font-semibold ${
                    stat.change > 0 ? 'text-red-400' : stat.change < 0 ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-center font-mono">
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.change > 0 
                      ? 'bg-red-500/10 text-red-400' 
                      : stat.change < 0 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.percentChange.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-white/10 bg-black/20">
              <td className="px-6 py-4 text-sm font-semibold text-white">
                Total
              </td>
              <td className="px-6 py-4 text-sm text-center font-semibold text-white font-mono">
                {stats.reduce((sum, stat) => sum + stat.period1, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-center font-semibold text-white font-mono">
                {stats.reduce((sum, stat) => sum + stat.period2, 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-center font-mono">
                <span className={`font-semibold ${
                  stats.reduce((sum, stat) => sum + stat.change, 0) > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {stats.reduce((sum, stat) => sum + stat.change, 0) > 0 ? '+' : ''}
                  {stats.reduce((sum, stat) => sum + stat.change, 0).toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-center font-mono">
                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stats.reduce((sum, stat) => sum + stat.change, 0) > 0 
                    ? 'bg-red-500/10 text-red-400' 
                    : 'bg-green-500/10 text-green-400'
                }`}>
                  {(() => {
                    const totalPeriod1 = stats.reduce((sum, stat) => sum + stat.period1, 0);
                    const totalChange = stats.reduce((sum, stat) => sum + stat.change, 0);
                    const percentChange = totalPeriod1 > 0 ? (totalChange / totalPeriod1) * 100 : 0;
                    return `${totalChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
                  })()}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}