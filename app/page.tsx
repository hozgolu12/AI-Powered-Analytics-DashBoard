'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import {
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

import { fetchAnalyticsData, type AnalyticsData } from '@/lib/api';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ChannelChart } from '@/components/dashboard/ChannelChart';
import { AudienceChart } from '@/components/dashboard/AudienceChart';
import { DataTable } from '@/components/dashboard/DataTable';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const analyticsData = await fetchAnalyticsData();
      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // In a real app, this would trigger API calls with date filters
    loadData(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">ADmyBRAND Insights</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Analytics Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {data && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" id="dashboard-content">
        <div className="space-y-8">
          {/* Filter Bar */}
          <FilterBar
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            dateRange={dateRange}
            isRefreshing={isRefreshing}
          />

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : (
              data && [
                {
                  title: "Total Revenue",
                  value: `$${data.metrics.revenue.toLocaleString()}`,
                  change: `+${data.metrics.growthRate}% from last month`,
                  changeType: 'positive' as const,
                  icon: DollarSign,
                },
                {
                  title: "Active Users",
                  value: data.metrics.users.toLocaleString(),
                  change: "+12.5% from last month",
                  changeType: 'positive' as const,
                  icon: Users,
                },
                {
                  title: "Conversion Rate",
                  value: `${data.metrics.conversions}%`,
                  change: "+3.2% from last month",
                  changeType: 'positive' as const,
                  icon: TrendingUp,
                },
                {
                  title: "Growth Rate",
                  value: `${data.metrics.growthRate}%`,
                  change: "Target: 15%",
                  changeType: 'neutral' as const,
                  icon: BarChart3,
                },
              ].map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changeType={metric.changeType}
                  icon={metric.icon}
                />
              ))
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            <RevenueChart
              data={data?.revenueOverTime || []}
              loading={loading}
            />
            <ChannelChart
              data={data?.channelData || []}
              loading={loading}
            />
            <AudienceChart
              data={data?.audienceSegments || []}
              loading={loading}
            />
          </div>

          {/* Data Table */}
          <DataTable
            data={data?.tableData || []}
            loading={loading}
          />
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2025 ADmyBRAND Insights. Powered by real-time analytics.
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-4 md:mt-0">
              <span>Data refreshes every 10 seconds</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}