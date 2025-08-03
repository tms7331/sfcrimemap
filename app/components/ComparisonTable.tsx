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
    <div className="w-full bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Category Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3 text-right">{month1}</th>
              <th scope="col" className="px-6 py-3 text-right">{month2}</th>
              <th scope="col" className="px-6 py-3 text-right">Change</th>
              <th scope="col" className="px-6 py-3 text-right">% Change</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={stat.category} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                <td className="px-6 py-4 font-medium text-white">
                  {stat.category}
                </td>
                <td className="px-6 py-4 text-right">
                  {stat.period1.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {stat.period2.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${
                  stat.change > 0 ? 'text-red-400' : stat.change < 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {stat.change > 0 ? '+' : ''}{stat.change.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${
                  stat.change > 0 ? 'text-red-400' : stat.change < 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {stat.change > 0 ? '+' : ''}{stat.percentChange.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-gray-600">
            <tr className="font-semibold bg-gray-700">
              <td className="px-6 py-3 text-white">Total</td>
              <td className="px-6 py-3 text-right text-white">
                {stats.reduce((sum, stat) => sum + stat.period1, 0).toLocaleString()}
              </td>
              <td className="px-6 py-3 text-right text-white">
                {stats.reduce((sum, stat) => sum + stat.period2, 0).toLocaleString()}
              </td>
              <td className={`px-6 py-3 text-right ${
                stats.reduce((sum, stat) => sum + stat.change, 0) > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {stats.reduce((sum, stat) => sum + stat.change, 0) > 0 ? '+' : ''}
                {stats.reduce((sum, stat) => sum + stat.change, 0).toLocaleString()}
              </td>
              <td className={`px-6 py-3 text-right ${
                stats.reduce((sum, stat) => sum + stat.change, 0) > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {(() => {
                  const totalPeriod1 = stats.reduce((sum, stat) => sum + stat.period1, 0);
                  const totalChange = stats.reduce((sum, stat) => sum + stat.change, 0);
                  const percentChange = totalPeriod1 > 0 ? (totalChange / totalPeriod1) * 100 : 0;
                  return `${totalChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}