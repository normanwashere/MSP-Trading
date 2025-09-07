


import React, { useState, useMemo, useRef } from 'react';
import { Sale, Expense, StockBalance, Product, Location, PaymentType, User, UserRole, SettingsData } from '../../types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';
import { formatCurrency } from '../../constants';

type ReportTab = 'Summary' | 'Expenses' | 'Sales' | 'Stock' | 'End of Day';
type DateRange = 'today' | 'week' | 'month';
type StockSortKey = 'productName' | 'locationName' | 'fullQty' | 'emptyQty';
type ExpenseSortKey = keyof Expense;
type SaleSortKey = 'date' | 'paymentType' | 'total';
type ExpandedCard = 'Gross Sales' | 'Deposits' | 'Discounts' | 'Net Sales' | null;


interface ReportsScreenProps {
    sales: Sale[];
    expenses: Expense[];
    stock: StockBalance[];
    products: Product[];
    locations: Location[];
    currentUser: User;
    settings: SettingsData;
}

interface StockChartData {
    productName: string;
    fullQty: number;
    emptyQty: number;
}

const StockBarChart: React.FC<{ data: StockChartData[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-10">No stock data to display.</p>;
    }

    const chartHeight = 250, barWidth = 40, barMargin = 20, yAxisWidth = 40, xAxisHeight = 80, paddingTop = 20, paddingRight = 10;

    const calculateYAxis = (maxValue: number) => {
        if (maxValue <= 0) return { niceMax: 10, ticks: [0, 2, 4, 6, 8, 10] };
        const numTicks = 5;
        const roughStep = maxValue / (numTicks - 1);
        const exponent = Math.floor(Math.log10(roughStep));
        const powerOf10 = Math.pow(10, exponent);
        const normalizedStep = roughStep / powerOf10;
        let niceNormalizedStep;
        if (normalizedStep <= 1) niceNormalizedStep = 1;
        else if (normalizedStep <= 2) niceNormalizedStep = 2;
        else if (normalizedStep <= 5) niceNormalizedStep = 5;
        else niceNormalizedStep = 10;
        const step = niceNormalizedStep * powerOf10;
        const niceMax = Math.ceil(maxValue / step) * step;
        const ticks = Array.from({ length: niceMax / step + 1 }, (_, i) => i * step);
        return { niceMax, ticks };
    };

    const maxQty = Math.max(0, ...data.map(d => d.fullQty + d.emptyQty));
    const { niceMax, ticks: yAxisTicks } = calculateYAxis(maxQty);
    
    const plotWidth = data.length * (barWidth + barMargin) - barMargin;
    const svgWidth = yAxisWidth + plotWidth + paddingRight;
    const svgHeight = paddingTop + chartHeight + xAxisHeight;
    const yScale = (value: number) => (value / niceMax) * chartHeight;

    const handleMouseOver = (e: React.MouseEvent, d: StockChartData) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            content: `${d.productName}: Full ${d.fullQty}, Empty ${d.emptyQty}`
        });
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="overflow-x-auto pb-4">
                <svg width={svgWidth} height={svgHeight}>
                    <g className="text-xs text-gray-500 dark:text-gray-400 fill-current">
                        {yAxisTicks.map((tick, i) => {
                            const y = paddingTop + chartHeight - yScale(tick);
                            return (
                                <g key={i} className="transition-opacity opacity-70">
                                    <text x={yAxisWidth - 8} y={y} dy="0.32em" textAnchor="end">{tick}</text>
                                    <line x1={yAxisWidth} y1={y} x2={svgWidth - paddingRight} y2={y} className="stroke-current text-gray-900/10 dark:text-white/10" strokeDasharray={tick === 0 ? "0" : "2,3"} />
                                </g>
                            );
                        })}
                    </g>
                    <g transform={`translate(${yAxisWidth}, ${paddingTop})`}>
                        {data.map((d, i) => (
                            <g key={d.productName} onMouseMove={(e) => handleMouseOver(e, d)} onMouseLeave={() => setTooltip(null)}>
                                <rect x={i * (barWidth + barMargin)} y={chartHeight - yScale(d.fullQty) - yScale(d.emptyQty)} width={barWidth} height={yScale(d.emptyQty)} className="fill-current text-orange-400 dark:text-orange-500 transition-opacity opacity-80 hover:opacity-100" rx="2" />
                                <rect x={i * (barWidth + barMargin)} y={chartHeight - yScale(d.fullQty)} width={barWidth} height={yScale(d.fullQty)} className="fill-current text-green-500 dark:text-green-400 transition-opacity opacity-80 hover:opacity-100" rx="2" />
                                <text 
                                    x={i * (barWidth + barMargin) + barWidth / 2} 
                                    y={chartHeight + 15}
                                    transform={`rotate(-45, ${i * (barWidth + barMargin) + barWidth / 2}, ${chartHeight + 15})`}
                                    textAnchor="end"
                                    className="text-xs fill-current text-gray-600 dark:text-gray-400 font-medium"
                                >
                                    {d.productName.replace(' Cylinder', '').replace(' (per meter)', ' (m)')}
                                </text>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>
            {tooltip && (
                <div className="absolute p-2 text-xs bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-sm text-white rounded-md pointer-events-none shadow-lg" style={{ left: `min(calc(100% - 150px), ${tooltip.x + 15}px)`, top: `${tooltip.y - 15}px`, transform: 'translateY(-100%)' }} dangerouslySetInnerHTML={{ __html: tooltip.content.replace(': ', ':<br/>').replace(', ', '<br/>') }} />
            )}
            <div className="flex justify-center space-x-4 mt-2 text-sm"><div className="flex items-center"><div className="w-3 h-3 mr-2 bg-green-500 rounded-sm"></div><span className="text-gray-600 dark:text-gray-400">Full Stock</span></div><div className="flex items-center"><div className="w-3 h-3 mr-2 bg-orange-400 dark:bg-orange-500 rounded-sm"></div><span className="text-gray-600 dark:text-gray-400">Empty Stock</span></div></div>
        </div>
    )
}

const PieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, content: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!data || data.length === 0) return <div className="text-center text-gray-500 dark:text-gray-400 py-10">No data to display.</div>;

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const getCoordinates = (p:number) => [Math.cos(2 * Math.PI * p), Math.sin(2 * Math.PI * p)];

    let cumulativePercent = 0;
    const slices = data.map(item => {
        const percent = item.value / total;
        const [startX, startY] = getCoordinates(cumulativePercent);
        const endAnglePercent = Math.min(0.99999, cumulativePercent + percent);
        cumulativePercent += percent;
        const [endX, endY] = getCoordinates(endAnglePercent);
        const pathData = `M 0,0 L ${startX},${startY} A 1,1 0 ${percent > 0.5 ? 1 : 0} 1 ${endX},${endY} Z`;
        return { pathData, percent, name: item.name, value: item.value };
    });

    const handleMouseOver = (e: React.MouseEvent, slice: typeof slices[0]) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, content: `${slice.name}: ₱${formatCurrency(slice.value)} (${(slice.percent * 100).toFixed(1)}%)` });
    };
    
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 relative" ref={containerRef}>
            <div className="w-52 h-52 flex-shrink-0">
                <svg viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)' }}>
                    {slices.map((slice, i) => <path key={slice.name} d={slice.pathData} fill={COLORS[i % COLORS.length]} onMouseMove={(e) => handleMouseOver(e, slice)} onMouseLeave={() => setTooltip(null)} className="transition-transform duration-200 hover:scale-105" />)}
                </svg>
            </div>
            <div className="w-full">
                 <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">{data.map((item, i) => <li key={item.name} className="flex justify-between items-center"><span className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>{item.name}</span><span className="font-semibold">₱{formatCurrency(item.value)}</span></li>)}</ul>
            </div>
            {tooltip && <div className="absolute p-2 text-xs bg-gray-800/80 dark:bg-gray-900/80 backdrop-blur-sm text-white rounded-md pointer-events-none shadow-lg" style={{ left: `${tooltip.x + 15}px`, top: `${tooltip.y - 15}px`, transform: 'translateY(-100%)' }}>{tooltip.content}</div>}
        </div>
    );
};

const ReportsScreen: React.FC<ReportsScreenProps> = ({ sales, expenses, stock, products, locations, currentUser, settings }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>(currentUser.role === UserRole.Staff ? 'End of Day' : 'Summary');
    const [cashCounted, setCashCounted] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange>('today');
    const [stockSortConfig, setStockSortConfig] = useState<{ key: StockSortKey; direction: 'asc' | 'desc' }>({ key: 'productName', direction: 'asc' });
    const [expenseSortConfig, setExpenseSortConfig] = useState<{ key: ExpenseSortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [saleSortConfig, setSaleSortConfig] = useState<{ key: SaleSortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<ExpandedCard>(null);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [isEodModalOpen, setEodModalOpen] = useState(false);

    const availableTabs: ReportTab[] = currentUser.role === UserRole.Staff
        ? ['End of Day']
        : ['Summary', 'Expenses', 'Sales', 'Stock', 'End of Day'];


    const { filteredSales, filteredExpenses } = useMemo(() => {
        const now = new Date();
        let startDate = new Date(now);
        switch (dateRange) {
            case 'today': startDate.setHours(0, 0, 0, 0); break;
            case 'week': startDate.setDate(now.getDate() - now.getDay()); startDate.setHours(0, 0, 0, 0); break;
            case 'month': startDate.setDate(1); startDate.setHours(0, 0, 0, 0); break;
        }
        return {
            filteredSales: sales.filter(s => new Date(s.date) >= startDate),
            filteredExpenses: expenses.filter(e => new Date(e.date) >= startDate)
        };
    }, [sales, expenses, dateRange]);

    const salesSummary = useMemo(() => {
        const summary = { gross: 0, deposits: 0, discounts: 0, net: 0, byPayment: { [PaymentType.Cash]: 0, [PaymentType.EWallet]: 0, [PaymentType.Bank]: 0 } };
        filteredSales.forEach(sale => {
            summary.gross += sale.subtotal;
            summary.deposits += sale.depositTotal;
            summary.discounts += sale.discountAmount;
            summary.net += sale.total;
            summary.byPayment[sale.paymentType] = (summary.byPayment[sale.paymentType] || 0) + sale.total;
        });
        return summary;
    }, [filteredSales]);

    const detailedBreakdowns = useMemo(() => {
        const grossByProduct = new Map<string, { qty: number, total: number }>();
        filteredSales.forEach(sale => sale.items.forEach(item => {
            const current = grossByProduct.get(item.productName) || { qty: 0, total: 0 };
            current.qty += item.qty;
            current.total += item.qty * item.unitPrice;
            grossByProduct.set(item.productName, current);
        }));
        const depositsBreakdown = filteredSales.reduce((acc, sale) => {
            sale.items.forEach(item => {
                if(item.deposit > 0) item.returnedEmpty ? acc.waived += item.qty * item.deposit : acc.collected += item.qty * item.deposit;
            });
            return acc;
        }, { collected: 0, waived: 0 });
        const discountsBreakdown = filteredSales.filter(s => s.discountAmount > 0).map(s => ({ id: s.id.slice(-6), amount: s.discountAmount }));
        return {
            gross: Array.from(grossByProduct.entries()).map(([name, data]) => ({ name, ...data })),
            deposits: depositsBreakdown,
            discounts: discountsBreakdown
        };
    }, [filteredSales]);

    const aggregatedStock = useMemo(() => {
        const stockMap = new Map<string, { fullQty: number; emptyQty: number }>();
        stock.forEach(s => {
            const current = stockMap.get(s.productId) || { fullQty: 0, emptyQty: 0 };
            current.fullQty += s.fullQty;
            current.emptyQty += s.emptyQty;
            stockMap.set(s.productId, current);
        });
        return Array.from(stockMap.entries()).map(([productId, quantities]) => ({
            productId,
            productName: products.find(p => p.id === productId)?.name || 'Unknown',
            ...quantities,
        })).sort((a, b) => b.fullQty - a.fullQty);
    }, [stock, products]);

    const expensesByCategory = useMemo(() => {
        if (filteredExpenses.length === 0) return [];
        const categoryMap = new Map<string, number>();
        filteredExpenses.forEach(e => categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount));
        return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredExpenses]);

    const salesByPaymentType = useMemo(() => {
        if (filteredSales.length === 0) return [];
        const paymentMap = new Map<string, number>();
        filteredSales.forEach(s => paymentMap.set(s.paymentType, (paymentMap.get(s.paymentType) || 0) + s.total));
        return Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredSales]);
    
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const simpleProfit = salesSummary.gross - totalExpenses;

    const todaysData = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaysSales = sales.filter(s => new Date(s.date) >= todayStart);
        const todaysExpenses = expenses.filter(e => new Date(e.date) >= todayStart);
        const totalCashSalesToday = todaysSales
            .filter(s => s.paymentType === PaymentType.Cash)
            .reduce((sum, s) => sum + s.total, 0);
        const todaysSalesSummary = todaysSales.reduce((acc, sale) => {
            acc.total += sale.total;
            acc.byPayment[sale.paymentType] = (acc.byPayment[sale.paymentType] || 0) + sale.total;
            return acc;
        }, { total: 0, byPayment: { [PaymentType.Cash]: 0, [PaymentType.EWallet]: 0, [PaymentType.Bank]: 0 } });
        const totalTodaysExpenses = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);

        const saleTransactions = todaysSales.map(s => ({
            id: s.id,
            date: s.date,
            type: 'Sale',
            description: `Sale #${s.id.slice(-6)}`,
            amount: s.total,
        }));
        
        const expenseTransactions = todaysExpenses.map(e => ({
            id: e.id,
            date: e.date,
            type: 'Expense',
            description: e.category,
            amount: -e.amount,
        }));
        
        const combinedTransactions = [...saleTransactions, ...expenseTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


        return {
            todaysSales,
            todaysExpenses,
            totalCashSalesToday,
            todaysSalesSummary,
            totalTodaysExpenses,
            combinedTransactions,
        };
    }, [sales, expenses]);
    
    const dateRangeTitle = { today: "Today", week: "This Week", month: "This Month" }[dateRange];
    const getProduct = (id: string) => products.find(p => p.id === id);
    const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || 'Unknown';

    const sortData = (data: any[], config: any) => {
        const sorted = [...data];
        sorted.sort((a, b) => {
            let aValue, bValue;
            if (config.key === 'productName') {
                aValue = getProduct(a.productId)?.name || '';
                bValue = getProduct(b.productId)?.name || '';
            } else if (config.key === 'locationName') {
                aValue = getLocationName(a.locationId);
                bValue = getLocationName(b.locationId);
            } else {
                aValue = a[config.key];
                bValue = b[config.key];
            }
            if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    };

    const sortedStock = useMemo(() => sortData(stock, stockSortConfig), [stock, stockSortConfig, products, locations]);
    const sortedExpenses = useMemo(() => sortData(filteredExpenses, expenseSortConfig), [filteredExpenses, expenseSortConfig]);
    const sortedSales = useMemo(() => sortData(filteredSales, saleSortConfig), [filteredSales, saleSortConfig]);

    const requestSort = (key: string, config: any, setConfig: any) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (config.key === key && config.direction === 'asc') direction = 'desc';
        setConfig({ key, direction });
    };

    const requestStockSort = (key: StockSortKey) => requestSort(key, stockSortConfig, setStockSortConfig);
    const requestExpenseSort = (key: ExpenseSortKey) => requestSort(key, expenseSortConfig, setExpenseSortConfig);
    const requestSaleSort = (key: SaleSortKey) => requestSort(key, saleSortConfig, setSaleSortConfig);
    const getSortIndicator = (key: string, config: any) => config.key === key ? (config.direction === 'asc' ? '▲' : '▼') : null;
    const getStockSortIndicator = (key: StockSortKey) => getSortIndicator(key, stockSortConfig);
    const getExpenseSortIndicator = (key: ExpenseSortKey) => getSortIndicator(key, expenseSortConfig);
    const getSaleSortIndicator = (key: SaleSortKey) => getSortIndicator(key, saleSortConfig);
    
    const handlePrint = () => {
      window.print();
    };
    
    const SummaryCard: React.FC<{ title: ExpandedCard, value: number, color: string, children: React.ReactNode }> = ({ title, value, color, children }) => {
        const isExpanded = expandedCard === title;
        return (
             <GlassCard className={`p-0 bg-${color}-500/10 dark:bg-${color}-500/20 transition-all duration-300`}>
                <button onClick={() => setExpandedCard(prev => prev === title ? null : title)} className="w-full p-4 text-left">
                    <div className="flex justify-between items-center">
                        <div><div className={`text-sm text-${color}-700 dark:text-${color}-300`}>{title}</div><div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">₱{formatCurrency(value)}</div></div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}><div className="p-4 border-t border-black/10 dark:border-white/10 text-sm">{children}</div></div>
            </GlassCard>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Summary':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="Gross Sales" value={salesSummary.gross} color="blue"><div className="space-y-1 text-gray-700 dark:text-gray-300">{detailedBreakdowns.gross.map(item => <div key={item.name} className="flex justify-between"><span>{item.name} (x{item.qty})</span><span className="font-medium">₱{formatCurrency(item.total)}</span></div>)}</div></SummaryCard>
                        <SummaryCard title="Deposits" value={salesSummary.deposits} color="orange"><div className="grid grid-cols-2 gap-x-4 text-gray-700 dark:text-gray-300"><span>Collected:</span><span className="text-right font-medium">₱{formatCurrency(detailedBreakdowns.deposits.collected)}</span><span>Waived (Returned):</span><span className="text-right font-medium text-green-600 dark:text-green-400">- ₱{formatCurrency(detailedBreakdowns.deposits.waived)}</span></div></SummaryCard>
                        <SummaryCard title="Discounts" value={salesSummary.discounts} color="red"><div className="space-y-1 text-gray-700 dark:text-gray-300">{detailedBreakdowns.discounts.length > 0 ? detailedBreakdowns.discounts.map(item => <div key={item.id} className="flex justify-between"><span>Sale #{item.id}</span><span className="font-medium">- ₱{formatCurrency(item.amount)}</span></div>) : <p>No discounts given.</p>}</div></SummaryCard>
                        <SummaryCard title="Net Sales" value={salesSummary.net} color="green"><div className="grid grid-cols-2 gap-x-4 text-gray-700 dark:text-gray-300"><span>Cash:</span><span className="text-right font-medium">₱{formatCurrency(salesSummary.byPayment.Cash)}</span><span>E-Wallet:</span><span className="text-right font-medium">₱{formatCurrency(salesSummary.byPayment["E-Wallet"])}</span><span>Bank Transfer:</span><span className="text-right font-medium">₱{formatCurrency(salesSummary.byPayment["Bank Transfer"])}</span></div></SummaryCard>
                        <GlassCard className="p-4 mt-4 sm:col-span-2 lg:col-span-4 bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200"><h3 className="font-bold text-lg mb-2">Simple Profit View ({dateRangeTitle})</h3><div className="grid grid-cols-2 gap-x-4"><span>Gross Sales:</span> <span className="text-right">₱{formatCurrency(salesSummary.gross)}</span><span>- Total Expenses:</span> <span className="text-right">₱{formatCurrency(totalExpenses)}</span></div><div className="grid grid-cols-2 gap-x-4 font-bold text-xl mt-2 border-t border-black/10 dark:border-white/10 pt-2"><span>Indicative Profit:</span><span className="text-right">₱{formatCurrency(simpleProfit)}</span></div></GlassCard>
                    </div>
                );
            case 'Expenses':
                return (
                    <div className="space-y-6">
                        <GlassCard className="p-4"><h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Expenses by Category ({dateRangeTitle})</h3><PieChart data={expensesByCategory} /></GlassCard>
                        <GlassCard className="p-4">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Expense Details ({dateRangeTitle})</h3>
                            <div className="hidden md:grid grid-cols-3 gap-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl text-xs text-gray-500 dark:text-gray-400 uppercase rounded-t-lg border-b border-black/10 dark:border-white/15"><div className="px-6 py-3 cursor-pointer rounded-l-lg" onClick={() => requestExpenseSort('date')}>Date <span className="text-xs">{getExpenseSortIndicator('date')}</span></div><div className="px-6 py-3 cursor-pointer" onClick={() => requestExpenseSort('category')}>Category <span className="text-xs">{getExpenseSortIndicator('category')}</span></div><div className="px-6 py-3 cursor-pointer text-right rounded-r-lg" onClick={() => requestExpenseSort('amount')}>Amount <span className="text-xs">{getExpenseSortIndicator('amount')}</span></div></div>
                            <div className="space-y-4 md:space-y-0">{sortedExpenses.map((expense) => <React.Fragment key={expense.id}><div onClick={() => expense.note && setExpandedExpenseId(p => p === expense.id ? null : expense.id)} className={`block p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 md:grid md:grid-cols-3 md:gap-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:border-b md:rounded-none text-sm ${expense.note ? 'cursor-pointer' : ''}`}><div className="md:hidden space-y-2"><div className="flex justify-between items-start"><span className="font-bold text-base text-gray-900 dark:text-gray-100">{expense.category}</span><span className="font-bold text-base text-orange-600 dark:text-orange-400">₱{formatCurrency(expense.amount)}</span></div><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>{expense.date.toLocaleDateString()}</span></div></div><div className="hidden md:flex items-center px-6 py-4 text-gray-800 dark:text-gray-300">{expense.date.toLocaleDateString()}</div><div className="hidden md:flex items-center px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{expense.category}</div><div className="hidden md:flex items-center justify-end px-6 py-4 text-right font-semibold text-orange-600 dark:text-orange-400">₱{formatCurrency(expense.amount)}</div></div>{expandedExpenseId === expense.id && <div className="md:border-b border-black/10 dark:border-white/10"><div className="p-4 text-sm text-gray-600 dark:text-gray-400 bg-white/5 dark:bg-gray-900/5 backdrop-blur-2xl"><div className="pl-3 border-l-2 border-blue-500"><strong>Note:</strong> {expense.note}</div></div></div>}</React.Fragment>)}</div>
                            <div className="flex justify-end font-bold text-gray-800 dark:text-gray-200 text-lg mt-4 pt-2 border-t border-black/10 dark:border-white/10"><span>Total: ₱{formatCurrency(totalExpenses)}</span></div>
                        </GlassCard>
                    </div>
                );
            case 'Sales':
                 return (
                     <div className="space-y-6">
                        <GlassCard className="p-4"><h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Sales by Payment Type ({dateRangeTitle})</h3><PieChart data={salesByPaymentType} /></GlassCard>
                        <GlassCard className="p-4">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Sales Log ({dateRangeTitle})</h3>
                            <div className="hidden md:grid md:grid-cols-4 gap-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl text-xs text-gray-500 dark:text-gray-400 uppercase rounded-t-lg border-b border-black/10 dark:border-white/15"><div className="px-6 py-3 cursor-pointer rounded-l-lg" onClick={() => requestSaleSort('date')}>Date <span className="text-xs">{getSaleSortIndicator('date')}</span></div><div className="px-6 py-3">ID</div><div className="px-6 py-3 cursor-pointer" onClick={() => requestSaleSort('paymentType')}>Payment <span className="text-xs">{getSaleSortIndicator('paymentType')}</span></div><div className="px-6 py-3 cursor-pointer text-right rounded-r-lg" onClick={() => requestSaleSort('total')}>Total <span className="text-xs">{getSaleSortIndicator('total')}</span></div></div>
                             <div className="space-y-4 md:space-y-0">{sortedSales.map((sale) => <React.Fragment key={sale.id}><div onClick={() => setExpandedSaleId(p => p === sale.id ? null : sale.id)} className="block p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 md:grid md:grid-cols-4 md:gap-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:border-b md:rounded-none text-sm cursor-pointer"><div className="md:hidden space-y-2"><div className="flex justify-between items-start"><div className="font-bold text-base text-gray-900 dark:text-gray-100"><span>#{sale.id.slice(-6)}</span><span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 text-xs">{sale.paymentType}</span></div><span className="font-bold text-base text-green-600 dark:text-green-400">₱{formatCurrency(sale.total)}</span></div><div className="flex justify-between text-xs text-gray-500 dark:text-gray-400"><span>{new Date(sale.date).toLocaleString()}</span></div></div><div className="hidden md:flex items-center px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-300">{new Date(sale.date).toLocaleString()}</div><div className="hidden md:flex items-center px-6 py-4 text-gray-500 dark:text-gray-400">#{sale.id.slice(-6)}</div><div className="hidden md:flex items-center px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{sale.paymentType}</div><div className="hidden md:flex items-center justify-end px-6 py-4 text-right font-semibold text-green-600 dark:text-green-400">₱{formatCurrency(sale.total)}</div></div>{expandedSaleId === sale.id && <div className="md:border-b border-black/10 dark:border-white/10"><div className="p-4 text-sm text-gray-600 dark:text-gray-400 bg-white/5 dark:bg-gray-900/5 backdrop-blur-2xl"><div className="pl-3 border-l-2 border-blue-500 space-y-2"><div><strong>Items:</strong><ul className="list-disc pl-6 mt-1 text-xs">{sale.items.map(item => <li key={item.productId} className="flex justify-between"><span>{item.qty}x {item.productName}</span><span>₱{formatCurrency(item.qty * item.unitPrice)}</span></li>)}</ul></div>{(sale.paymentRefNo || sale.paymentPhotoUrl || sale.discountInfo?.customerIdPhotoUrl) && <div className="pt-2 border-t border-black/10 dark:border-white/10"><div className="space-y-1">{sale.paymentRefNo && <p className="text-xs"><strong>Ref #:</strong> {sale.paymentRefNo}</p>}<div className="flex space-x-2 mt-1">{sale.paymentPhotoUrl && <button onClick={() => setViewingPhoto(sale.paymentPhotoUrl!)} className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">View Proof</button>}{sale.discountInfo?.customerIdPhotoUrl && <button onClick={() => setViewingPhoto(sale.discountInfo.customerIdPhotoUrl)} className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">View ID</button>}</div></div></div>}</div></div></div>}</React.Fragment>)}</div>
                        </GlassCard>
                    </div>
                );
            case 'Stock':
                 return (
                    <div className="space-y-6">
                        <GlassCard className="p-4"><h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Overall Stock Levels</h3><StockBarChart data={aggregatedStock} /></GlassCard>
                        <GlassCard className="p-4">
                            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Stock Levels by Location</h3>
                             <div className="hidden md:grid md:grid-cols-4 gap-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl text-xs text-gray-500 dark:text-gray-400 uppercase rounded-t-lg border-b border-black/10 dark:border-white/15"><div className="px-6 py-3 cursor-pointer rounded-l-lg" onClick={() => requestStockSort('productName')}>Product <span className="text-xs">{getStockSortIndicator('productName')}</span></div><div className="px-6 py-3 cursor-pointer" onClick={() => requestStockSort('locationName')}>Location <span className="text-xs">{getStockSortIndicator('locationName')}</span></div><div className="px-6 py-3 cursor-pointer text-center" onClick={() => requestStockSort('fullQty')}>Full Qty <span className="text-xs">{getStockSortIndicator('fullQty')}</span></div><div className="px-6 py-3 cursor-pointer text-center rounded-r-lg" onClick={() => requestStockSort('emptyQty')}>Empty Qty <span className="text-xs">{getStockSortIndicator('emptyQty')}</span></div></div>
                             <div className="space-y-4 md:space-y-0">{sortedStock.map((item) => {
                                    const product = getProduct(item.productId);
                                    let qtyColor = item.fullQty > 0 ? (product && item.fullQty <= product.lowStockThreshold ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400') : 'text-red-600 dark:text-red-400';
                                    return <div key={item.id} className="block p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 md:grid md:grid-cols-4 md:gap-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:border-b md:rounded-none text-sm"><div className="md:hidden space-y-2"><div className="flex justify-between items-start"><div><div className="font-bold text-base text-gray-900 dark:text-gray-100">{product?.name || 'Unknown'}</div><div className="text-xs text-gray-500 dark:text-gray-400">{getLocationName(item.locationId)}</div></div><div className="text-right"><div className={`font-bold text-base ${qtyColor}`}>{item.fullQty} <span className="text-xs text-gray-500 dark:text-gray-400">Full</span></div><div className="font-semibold text-sm text-orange-600 dark:text-orange-400">{item.emptyQty} <span className="text-xs text-gray-500 dark:text-gray-400">Empty</span></div></div></div></div><div className="hidden md:flex items-center px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{product?.name || 'Unknown'}</div><div className="hidden md:flex items-center px-6 py-4 text-gray-700 dark:text-gray-300">{getLocationName(item.locationId)}</div><div className={`hidden md:flex items-center justify-center px-6 py-4 text-center font-bold ${qtyColor}`}>{item.fullQty}</div><div className="hidden md:flex items-center justify-center px-6 py-4 text-center font-semibold text-orange-600 dark:text-orange-400">{item.emptyQty}</div></div>;
                                })}</div>
                        </GlassCard>
                    </div>
                 );
            case 'End of Day':
                const cashCountedNum = parseFloat(cashCounted) || 0;
                const cashVariance = cashCounted ? cashCountedNum - todaysData.totalCashSalesToday : null;
                const varianceColor = cashVariance === null ? 'text-gray-500' : cashVariance === 0 ? 'text-green-500' : cashVariance > 0 ? 'text-green-500' : 'text-red-500';
                
                return (
                    <>
                        <div className="space-y-6">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 text-center">
                                End of Day Report for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <GlassCard className="p-4 flex flex-col">
                                    <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2">Today's Sales</h4>
                                    <div className="space-y-1 text-sm flex-grow">
                                        <div className="flex justify-between"><span>Cash:</span> <span className="font-medium">₱{formatCurrency(todaysData.todaysSalesSummary.byPayment.Cash)}</span></div>
                                        <div className="flex justify-between"><span>E-Wallet:</span> <span className="font-medium">₱{formatCurrency(todaysData.todaysSalesSummary.byPayment['E-Wallet'])}</span></div>
                                        <div className="flex justify-between"><span>Bank:</span> <span className="font-medium">₱{formatCurrency(todaysData.todaysSalesSummary.byPayment['Bank Transfer'])}</span></div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex justify-between font-bold text-gray-800 dark:text-gray-200">
                                        <span>Total Sales:</span>
                                        <span>₱{formatCurrency(todaysData.todaysSalesSummary.total)}</span>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-4 flex flex-col">
                                     <h4 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-2">Today's Expenses</h4>
                                      <div className="space-y-1 text-sm flex-grow">
                                        {todaysData.todaysExpenses.length > 0 ? todaysData.todaysExpenses.map(exp => (
                                            <div key={exp.id} className="flex justify-between">
                                                <span>{exp.category}</span>
                                                <span className="font-medium">₱{formatCurrency(exp.amount)}</span>
                                            </div>
                                        )) : <p className="text-gray-500 dark:text-gray-400">No expenses today.</p>}
                                     </div>
                                     <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex justify-between font-bold text-gray-800 dark:text-gray-200">
                                        <span>Total Expenses:</span>
                                        <span>₱{formatCurrency(todaysData.totalTodaysExpenses)}</span>
                                     </div>
                                </GlassCard>

                                <GlassCard className="p-4">
                                    <h4 className="font-bold text-lg text-green-600 dark:text-green-400 mb-2">Cash Reconciliation</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Expected Cash:</span> <span className="font-medium">₱{formatCurrency(todaysData.totalCashSalesToday)}</span></div>
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="cash-counted-main">Counted Cash:</label>
                                            <input
                                                id="cash-counted-main"
                                                type="number"
                                                value={cashCounted}
                                                onChange={e => setCashCounted(e.target.value)}
                                                placeholder="0.00"
                                                className="w-28 bg-gray-200 dark:bg-gray-700/50 text-right font-medium text-gray-800 dark:text-gray-200 rounded-md p-1 border border-gray-900/10 dark:border-white/20"
                                            />
                                        </div>
                                    </div>
                                     <div className={`mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex justify-between font-bold ${varianceColor}`}>
                                        <span>Variance:</span>
                                        <span>{cashVariance !== null ? `₱${formatCurrency(cashVariance)}` : `Enter cash count`}</span>
                                    </div>
                                </GlassCard>
                            </div>

                            <GlassCard className="p-4">
                                 <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">Today's Transactions</h4>
                                 <div className="max-h-64 overflow-y-auto pr-2 -mr-2">
                                     <div className="space-y-2 text-sm">
                                        {todaysData.combinedTransactions.length > 0 ? todaysData.combinedTransactions.map(t => (
                                             <div key={t.id} className="flex justify-between items-center p-2 rounded-md bg-black/5 dark:bg-white/5">
                                                 <div>
                                                    <span className={`font-semibold ${t.type === 'Sale' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{t.type}</span>
                                                    <span className="ml-2 text-gray-600 dark:text-gray-300">{t.description}</span>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleTimeString()}</div>
                                                 </div>
                                                 <div className={`font-bold ${t.type === 'Sale' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                     {t.amount > 0 ? '+' : ''}₱{formatCurrency(t.amount)}
                                                 </div>
                                             </div>
                                        )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions today.</p>}
                                     </div>
                                 </div>
                            </GlassCard>
                            
                            <div className="flex justify-end mt-2">
                                <button onClick={() => setEodModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                                    View & Print EOD Report
                                </button>
                            </div>
                        </div>
                        <Modal isOpen={isEodModalOpen} onClose={() => setEodModalOpen(false)} title={`EOD Report - ${new Date().toLocaleDateString()}`}>
                            <div className="printable-area p-4 rounded-md">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold">{settings.shopName}</h3>
                                    <p className="text-xs">End of Day Report</p>
                                </div>
                                <div className="text-xs mb-2">
                                    <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                                    <p><strong>User:</strong> {currentUser.name}</p>
                                </div>

                                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                                <h4 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">Sales Summary</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="summary-item flex justify-between"><span>Cash Sales</span><span>₱{formatCurrency(todaysData.todaysSalesSummary.byPayment.Cash)}</span></div>
                                    <div className="summary-item flex justify-between"><span>E-Wallet Sales</span><span>₱{formatCurrency(todaysData.todaysSalesSummary.byPayment['E-Wallet'])}</span></div>
                                    <div className="summary-item flex justify-between"><span>Bank Sales</span><span>₱{formatCurrency(todaysData.todaysSalesSummary.byPayment['Bank Transfer'])}</span></div>
                                    <div className="summary-item total-row flex justify-between text-sm"><span>Total Sales</span><span>₱{formatCurrency(todaysData.todaysSalesSummary.total)}</span></div>
                                </div>

                                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                                <h4 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">Expenses</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="summary-item total-row flex justify-between text-sm"><span>Total Expenses</span><span>-₱{formatCurrency(todaysData.totalTodaysExpenses)}</span></div>
                                </div>

                                <hr className="my-2 border-gray-300 dark:border-gray-600" />
                                <h4 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">Cash Reconciliation</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="summary-item flex justify-between"><span>Expected Cash</span><span>₱{formatCurrency(todaysData.totalCashSalesToday)}</span></div>
                                    <div className="summary-item flex justify-between"><span>Counted Cash</span><span>₱{formatCurrency(cashCountedNum)}</span></div>
                                    <div className={`summary-item total-row flex justify-between text-sm ${varianceColor}`}><span>Variance</span><span>₱{formatCurrency(cashVariance ?? 0)}</span></div>
                                </div>
                                
                                <div className="text-center mt-4 text-xs">
                                    <p>End of Report</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4 non-printable">
                                <button onClick={() => setEodModalOpen(false)} className="px-4 py-2 bg-gray-500 text-gray-100 rounded-lg hover:bg-gray-600 transition text-sm font-semibold">Close</button>
                                <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">Print</button>
                            </div>
                        </Modal>
                    </>
                );
            default: return null;
        }
    };


    return (
        <>
            <GlassCard className="p-4 md:p-6 h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="hidden md:block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Reports</h2>
                        <div className="border-b border-black/10 dark:border-white/10 md:border-b-0">
                            <nav className="-mb-px flex space-x-2 md:space-x-6 overflow-x-auto">
                                {availableTabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'}`}>{tab}</button>)}
                            </nav>
                        </div>
                    </div>
                    {activeTab !== 'End of Day' && (
                         <div className="self-end md:self-center">
                             <select
                                value={dateRange}
                                onChange={e => setDateRange(e.target.value as DateRange)}
                                className="bg-white/50 dark:bg-black/40 text-gray-700 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 focus:ring-2 focus:ring-blue-500 focus:outline-none py-1 pl-3 pr-8 text-sm"
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                         </div>
                     )}
                </div>
                {renderContent()}
            </GlassCard>
            <Modal isOpen={!!viewingPhoto} onClose={() => setViewingPhoto(null)} title="View Photo">
                {viewingPhoto && <img src={viewingPhoto} alt="Attachment" className="w-full h-auto rounded-lg" />}
            </Modal>
        </>
    );
};

export default ReportsScreen;