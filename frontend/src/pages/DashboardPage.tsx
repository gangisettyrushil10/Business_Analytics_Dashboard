import { useState, useEffect, useMemo } from "react";
import { DollarSign, TrendingUp, Users, Layers, Sparkles, AlertTriangle } from "lucide-react";
import { getRevenue, getSalesByCategory, getCustomerStats, generateInsights, getAnomalies } from "../api/client";
import {
    RevenueResponse, 
    CategoryResponse, 
    CustomerStatsResponse,
    AnomalyResponse,
} from "../types";
import RevenueChart from "../components/RevenueChart";
import CategoryChart from "../components/CategoryChart";
import CustomerStats from "../components/CustomerStats";
import InsightsBox from "../components/InsightsBox";
import { ChartSkeleton, CardSkeleton } from "../components/LoadingSkeleton";
import DateRangePicker from "../components/DateRangePicker";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import SalesDetailDrawer from "../components/SalesDetailDrawer";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
    const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
    const [categoryData, setCategoryData] = useState<CategoryResponse | null>(null);
    const [customerStats, setCustomerStats] = useState<CustomerStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [rangeDays, setRangeDays] = useState(30);
    const [insights, setInsights] = useState<string | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [showAnomalies, setShowAnomalies] = useState(false);
    const [anomalyData, setAnomalyData] = useState<AnomalyResponse | null>(null);
    const [anomalyErrorShown, setAnomalyErrorShown] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerFilterType, setDrawerFilterType] = useState<"date" | "category" | null>(null);
    const [drawerFilterValue, setDrawerFilterValue] = useState<string | null>(null);
    const { showToast } = useToast();
    const { user } = useAuth();

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            try {
                const [revenue, category, customers] = await Promise.all([
                    getRevenue(rangeDays),
                    getSalesByCategory(),
                    getCustomerStats(),
                ]);
                
                setRevenueData(revenue);
                setCategoryData(category);
                setCustomerStats(customers);
            } catch (err: any) {
                showToast(err.response?.data?.detail || 'Failed to load dashboard data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [rangeDays, showToast]);

    useEffect(() => {
        if (!showAnomalies || !revenueData) {
            // Reset error flag when anomalies are turned off
            if (!showAnomalies) {
                setAnomalyErrorShown(false);
            }
            return;
        }

        const fetchAnomalies = async () => {
            try {
                const anomalies = await getAnomalies(rangeDays);
                setAnomalyData(anomalies);
                setAnomalyErrorShown(false); // Reset on success
            } catch (err: any) {
                const errorMessage = err.response?.data?.detail || 'Failed to load anomalies';
                // Only show error once per toggle session
                if (!anomalyErrorShown) {
                    showToast(errorMessage, 'error');
                    setAnomalyErrorShown(true);
                }
            }
        };

        fetchAnomalies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showAnomalies, rangeDays, revenueData]);

    const handleDateClick = (date: string) => {
        setDrawerFilterType("date");
        setDrawerFilterValue(date);
        setDrawerOpen(true);
    };

    const handleCategoryClick = (category: string) => {
        setDrawerFilterType("category");
        setDrawerFilterValue(category);
        setDrawerOpen(true);
    };

    const handleGenerateInsights = async () => {
        if (!revenueData || !categoryData || !customerStats) {
            showToast('Please wait for dashboard data to load', 'info');
            return;
        }

        setInsightsLoading(true);

        try {
            const periodText = rangeDays === 7 ? '7 days' : 
                              rangeDays === 30 ? '30 days' : 
                              rangeDays === 90 ? '90 days' : '365 days';
            
            const response = await generateInsights({
                revenue: revenueData.data,
                categories: categoryData.categories,
                top_customers: customerStats.top_customers,
                period: periodText
            });

            setInsights(response.insights);
            showToast('AI insights generated successfully', 'success');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate insights';
            showToast(errorMessage, 'error');
            // Clear insights on error so user knows it failed
            setInsights(null);
        } finally {
            setInsightsLoading(false);
        }
    };

    const totalRevenue = revenueData?.data.reduce((sum, point) => sum + point.revenue, 0) || 0;
    const avgDailyRevenue = revenueData && revenueData.data.length
        ? totalRevenue / revenueData.data.length
        : 0;
    const totalCategories = categoryData?.categories.length || 0;
    const totalCustomers = customerStats?.total_customers || 0;

    const statCards = [
        {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            helper: `Last ${rangeDays} days`,
            icon: DollarSign,
        },
        {
            label: "Avg Daily Revenue",
            value: formatCurrency(avgDailyRevenue),
            helper: "Per day average",
            icon: TrendingUp,
        },
        {
            label: "Total Customers",
            value: totalCustomers.toLocaleString(),
            helper: "Active accounts",
            icon: Users,
        },
        {
            label: "Categories",
            value: `${totalCategories}`,
            helper: "Product types",
            icon: Layers,
        },
    ];
    
    return (
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {greeting}, {user?.email?.split("@")[0] || "demo"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Here&apos;s your business analytics overview
                </p>
            </div>

            {/* Stat Cards */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, helper, icon: Icon }) => (
                    <div
                        key={label}
                        className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg"
                    >
                        <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary/50 to-primary" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                                <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">{helper}</p>
                    </div>
                ))}
            </div>

            {/* Analytics Overview Controls */}
            <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Analytics Overview</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <DateRangePicker rangeDays={rangeDays} onChange={setRangeDays} />
                        
                        <button
                            type="button"
                            onClick={() => setShowAnomalies(!showAnomalies)}
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                showAnomalies
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-background hover:bg-accent"
                            }`}
                        >
                            <AlertTriangle className="h-4 w-4" />
                            Show Anomalies
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateInsights}
                            disabled={insightsLoading || !revenueData || !categoryData || !customerStats}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Sparkles className="h-4 w-4" />
                            {insightsLoading ? "Generating…" : "Generate Insights"}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <ChartSkeleton />
                    <div className="grid gap-6 md:grid-cols-2">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            ) : (
                <>
                    {/* Charts */}
                    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold">Revenue Trend</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Daily revenue over time
                                    </p>
                                </div>
                                {revenueData && revenueData.data.length > 0 ? (
                                    <RevenueChart
                                        data={revenueData.data}
                                        anomalies={showAnomalies ? anomalyData?.anomalies : undefined}
                                        onDateClick={handleDateClick}
                                    />
                                ) : (
                                    <div className="flex h-64 flex-col items-center justify-center space-y-2 text-center">
                                        <p className="text-sm font-medium text-card-foreground">
                                            No revenue data yet
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Upload a CSV to unlock trend visualizations.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold">Category Breakdown</h3>
                                </div>

                                {categoryData && categoryData.categories.length > 0 ? (
                                    <>
                                        <CategoryChart data={categoryData.categories} onCategoryClick={handleCategoryClick} />
                                    </>
                                ) : (
                                    <div className="flex h-64 flex-col items-center justify-center space-y-2 text-center">
                                        <p className="text-sm font-medium text-card-foreground">
                                            No category data yet
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Upload data to see how categories compare.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Customer Stats and Insights */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {customerStats && (
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <CustomerStats data={customerStats} />
                            </div>
                        )}
                        <InsightsBox insights={insights || ""} loading={insightsLoading} />
                    </div>
                </>
            )}

            <SalesDetailDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filterType={drawerFilterType}
                filterValue={drawerFilterValue}
            />
        </div>
    );
}
