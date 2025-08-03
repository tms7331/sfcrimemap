import { NextResponse } from 'next/server';
import { getMonthlyDistribution, getCategoryTrends } from '@/app/lib/chartData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chartType = searchParams.get('type');
    
    if (chartType === 'monthly') {
      const data = await getMonthlyDistribution();
      return NextResponse.json({ data });
    } else if (chartType === 'category-trends') {
      const data = await getCategoryTrends();
      return NextResponse.json({ data });
    } else {
      // Return both if no specific type requested
      const [monthly, categoryTrends] = await Promise.all([
        getMonthlyDistribution(),
        getCategoryTrends()
      ]);
      
      return NextResponse.json({
        monthly,
        categoryTrends
      });
    }
  } catch (error) {
    console.error('Charts API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}