import { useState, useEffect } from "react";
import { getRevenue, getSalesByCategory, getCustomerStats, generateInsights } from "../api/client";
import {
    RevenueResponse, 
    CategoryResponse, 
    CustomerStatsResponse
} from "../types";
import RevenueChart from "../components/RevenueChart";
import CategoryChart from "../components/CategoryChart";
import CustomerStats from "../components/CustomerStats";
import InsightsBox from "../components/InsightsBox";
import { ChartSkeleton, CardSkeleton } from "../components/LoadingSkeleton";
import DateRangePicker from "../components/DateRangePicker";
import { useToast } from "../contexts/ToastContext";

export default function DashboardPage() {
    const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
    const [categoryData, setCategoryData] = useState<CategoryResponse | null>(null);
    const [customerStats, setCustomerStats] = useState<CustomerStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [rangeDays, setRangeDays] = useState(30);
    const [insights, setInsights] = useState<string | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            try {
                // fetch all three endpoints in parallel
                const [revenue, category, customers] = await Promise.all([
                    getRevenue(rangeDays),
                    getSalesByCategory(),
                    getCustomerStats(),
                ]);
                
                setRevenueData(revenue);
                setCategoryData(category);
                setCustomerStats(customers);
                showToast('Dashboard data loaded successfully', 'success');
            } catch (err: any) {
                showToast(err.response?.data?.detail || 'Failed to load dashboard data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [rangeDays, showToast]);

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
            showToast(err.response?.data?.detail || 'Failed to generate insights', 'error');
        } finally {
            setInsightsLoading(false);
        }
    };
    
    return (
        <div style={{ 
            padding: '1rem',
            maxWidth: '1200px', 
            margin: '0 auto',
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <h1 style={{ 
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                }}>
                    Business Analytics Dashboard
                </h1>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}>
                    <DateRangePicker rangeDays={rangeDays} onChange={setRangeDays} />
                    
                    <button
                        onClick={handleGenerateInsights}
                        disabled={insightsLoading || !revenueData || !categoryData || !customerStats}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: (insightsLoading || !revenueData || !categoryData || !customerStats) ? 'not-allowed' : 'pointer',
                            opacity: (insightsLoading || !revenueData || !categoryData || !customerStats) ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <span>🤖</span>
                        <span>{insightsLoading ? 'Generating...' : 'Generate Insights'}</span>
                    </button>
                </div>
            </div>
    
            {loading ? (
                <>
                    <ChartSkeleton />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                    <CardSkeleton />
                </>
            ) : (
                <>
                    {revenueData && revenueData.data.length > 0 ? (
                        <RevenueChart data={revenueData.data} />
                    ) : (
                        <div style={{ 
                            padding: '2rem', 
                            background: 'var(--bg-secondary)', 
                            borderRadius: '8px', 
                            marginBottom: '2rem', 
                            textAlign: 'center',
                            color: 'var(--text-primary)',
                            border: `1px solid var(--border-color)`,
                        }}>
                            <p>No revenue data available. Upload a CSV file to see charts.</p>
                        </div>
                    )}

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '2rem', 
                        marginBottom: '2rem' 
                    }}>
                        {categoryData && categoryData.categories.length > 0 ? (
                            <>
                                <CategoryChart data={categoryData.categories} />
                                <div style={{ 
                                    padding: '1rem', 
                                    background: 'var(--bg-secondary)', 
                                    borderRadius: '8px',
                                    border: `1px solid var(--border-color)`,
                                    color: 'var(--text-primary)',
                                }}>
                                    <h3 style={{ color: 'var(--text-primary)' }}>Category Summary</h3>
                                    <p><strong>Total Revenue:</strong> ${categoryData.total_revenue.toFixed(2)}</p>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {categoryData.categories.map((cat) => (
                                            <li key={cat.category} style={{ 
                                                padding: '0.5rem 0', 
                                                borderBottom: `1px solid var(--border-color)` 
                                            }}>
                                                <strong>{cat.category}:</strong> ${cat.total.toFixed(2)} ({cat.percentage}%)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div style={{ 
                                padding: '2rem', 
                                background: 'var(--bg-secondary)', 
                                borderRadius: '8px', 
                                textAlign: 'center', 
                                gridColumn: '1 / -1',
                                color: 'var(--text-primary)',
                                border: `1px solid var(--border-color)`,
                            }}>
                                <p>No category data available.</p>
                            </div>
                        )}
                    </div>

                    {customerStats && <CustomerStats data={customerStats} />}
                    
                    {/* AI Insights */}
                    <InsightsBox insights={insights || ''} loading={insightsLoading} />
                </>
            )}
        </div>
    );
}