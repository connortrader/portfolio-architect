import React from 'react';
import { PortfolioStats, Strategy } from '../types';
import { calculatePairwiseCorrelation, getMaxDrawdownInPeriod } from '../services/financeService';

// Final Polish: Clean borders (no shadow), Responsive tables, White MaxDD column, ROI Badges

export const StatsGrid: React.FC<{
    stats: PortfolioStats,
    spyStats: PortfolioStats | null,
    equityHistory?: number[]
}> = ({ stats, spyStats }) => {

    const fmtMoney = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString()}`;
    const fmtPct = (n: number | undefined) => n !== undefined ? `${(n * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '—';
    const fmtNum = (n: number | undefined) => n !== undefined ? n.toFixed(2) : '—';

    const totalReturn = stats.totalReturn || 0;
    const isPositive = totalReturn >= 0;

    // Calculate % difference for Stripe-style badge
    const calcDiff = (port: number | undefined, spy: number | undefined, lowerBetter = false) => {
        if (port === undefined || spy === undefined || spy === 0) return null;
        const diff = lowerBetter
            ? ((Math.abs(spy) - Math.abs(port)) / Math.abs(spy)) * 100
            : ((port - spy) / Math.abs(spy)) * 100;
        return diff;
    };

    const DiffBadge: React.FC<{ diff: number | null }> = ({ diff }) => {
        if (diff === null) return null;
        const positive = diff > 0;
        return (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {positive ? '+' : ''}{diff.toFixed(0)}%
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Hero Section */}
            <div className="bg-white rounded-lg border border-neutral-200 px-6 py-5">
                <p className="text-xs text-neutral-500 font-medium tracking-wide mb-1">Your Combined Portfolio</p>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-semibold text-neutral-900 tabular-nums">{fmtMoney(stats.finalBalance || 100000)}</span>
                    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{fmtPct(totalReturn)} all time
                    </span>
                </div>
            </div>

            {/* Metrics Grid - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'CAGR', port: stats.cagr, spy: spyStats?.cagr, diff: calcDiff(stats.cagr, spyStats?.cagr) },
                    { label: 'Sharpe Ratio', port: stats.sharpe, spy: spyStats?.sharpe, diff: calcDiff(stats.sharpe, spyStats?.sharpe), isRatio: true },
                    { label: 'Max Drawdown', port: stats.maxDrawdown, spy: spyStats?.maxDrawdown, diff: calcDiff(stats.maxDrawdown, spyStats?.maxDrawdown, true), isDD: true },
                    { label: 'Calmar', port: stats.calmar, spy: spyStats?.calmar, diff: calcDiff(stats.calmar, spyStats?.calmar), isRatio: true },
                ].map((m, i) => {
                    const portVal = m.isDD && m.port ? `-${fmtPct(Math.abs(m.port))}` : m.isRatio ? fmtNum(m.port) : fmtPct(m.port);
                    const spyVal = m.isDD && m.spy ? `-${fmtPct(Math.abs(m.spy))}` : m.isRatio ? fmtNum(m.spy) : fmtPct(m.spy);

                    return (
                        <div key={i} className="bg-white rounded-lg border border-neutral-200 px-5 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-neutral-500 font-medium">{m.label}</p>
                                <DiffBadge diff={m.diff} />
                            </div>
                            <p className="text-2xl font-semibold text-neutral-900 tabular-nums mb-1">{portVal}</p>
                            <p className="text-xs text-neutral-400 tabular-nums">SPY {spyVal}</p>
                        </div>
                    );
                })}
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-900">Performance Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50">
                                <th className="text-left font-medium text-neutral-500 px-6 py-3">Metric</th>
                                <th className="text-right font-medium text-neutral-700 px-6 py-3 w-32">Portfolio</th>
                                <th className="text-right font-medium text-neutral-400 px-6 py-3 w-32">SPY</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {[
                                { label: 'Total Return', port: stats.totalReturn, spy: spyStats?.totalReturn },
                                { label: 'Sortino Ratio', port: stats.sortino, spy: spyStats?.sortino, isRatio: true },
                                { label: 'Best Year', port: stats.bestYear, spy: spyStats?.bestYear },
                                { label: 'Worst Year', port: stats.worstYear, spy: spyStats?.worstYear },
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="text-neutral-600 px-6 py-3">{row.label}</td>
                                    <td className="text-right font-medium text-neutral-900 px-6 py-3 tabular-nums">{row.isRatio ? fmtNum(row.port) : fmtPct(row.port)}</td>
                                    <td className="text-right text-neutral-400 px-6 py-3 tabular-nums">{row.isRatio ? fmtNum(row.spy) : fmtPct(row.spy)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const CorrelationMatrix: React.FC<{ strategies: Strategy[] }> = ({ strategies }) => {
    if (strategies.length < 2) return null;

    const matrix: (number | null)[][] = strategies.map((_, i) =>
        strategies.map((_, j) => i === j ? 1 : calculatePairwiseCorrelation(strategies[i].data, strategies[j].data))
    );

    const getCellBg = (v: number | null, isDiag: boolean) => {
        if (isDiag) return 'bg-neutral-50 text-neutral-300';
        if (v === null) return '';
        // High Correlation (Bad) -> Matches MaxDD style (White bg, Red text)
        if (v >= 0.7) return 'bg-white text-red-600 border border-transparent';

        // Low Correlation (Good) -> Matches Monthly "Total" column greens (inverted logic as Low is Good)
        if (v <= 0.3) return 'bg-green-300 text-green-900';
        if (v <= 0.5) return 'bg-green-200 text-green-900';
        return 'bg-green-100 text-green-800';
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900">Strategy Correlation</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[600px]">
                    <thead>
                        <tr className="bg-neutral-50/50 border-b border-neutral-200">
                            <th className="text-left font-medium text-neutral-500 px-4 py-3">Strategy</th>
                            {strategies.map((s, i) => <th key={i} className="text-center font-medium text-neutral-500 px-2 py-3 w-20">{s.name.slice(0, 6)}...</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {strategies.map((s, i) => (
                            <tr key={i}>
                                <td className="text-neutral-700 font-medium px-4 py-3 whitespace-nowrap">{s.name}</td>
                                {matrix[i].map((v, j) => (
                                    <td key={j} className={`text-center tabular-nums font-medium px-2 py-3 ${getCellBg(v, i === j)}`}>
                                        {v?.toFixed(2) ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const StressPeriodsTable: React.FC<{
    dates: string[], combinedEquity: number[], spyEquity: number[]
}> = ({ dates, combinedEquity, spyEquity }) => {
    const periods = [
        { name: 'Dotcom Crash', start: '2000-03-10', end: '2002-10-09' },
        { name: '2008 Financial Crisis', start: '2007-10-09', end: '2009-03-09' },
        { name: 'COVID-19 Crash', start: '2020-02-19', end: '2020-03-23' },
        { name: '2022 Bear Market', start: '2022-01-03', end: '2022-10-12' },
        { name: '2025 Tariffs Crash', start: '2025-02-19', end: '2025-04-08' }
    ];

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900">Stress Test Analysis</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50/50">
                            <th className="text-left font-medium text-neutral-500 px-6 py-3">Crisis Period</th>
                            <th className="text-left font-medium text-neutral-400 px-4 py-3">Dates</th>
                            <th className="text-right font-medium text-neutral-700 px-6 py-3 w-32">Portfolio</th>
                            <th className="text-right font-medium text-neutral-400 px-6 py-3 w-32">SPY</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {periods.map((p, i) => {
                            const port = getMaxDrawdownInPeriod(combinedEquity, dates, p.start, p.end);
                            const spy = getMaxDrawdownInPeriod(spyEquity, dates, p.start, p.end);

                            return (
                                <tr key={i}>
                                    <td className="text-neutral-800 font-medium px-6 py-3 whitespace-nowrap">{p.name}</td>
                                    <td className="text-neutral-400 text-xs px-4 py-3 tabular-nums whitespace-nowrap">{p.start} → {p.end}</td>
                                    <td className="text-right font-medium text-neutral-900 px-6 py-3 tabular-nums">
                                        {port !== null ? `-${(port * 100).toFixed(1)}%` : '—'}
                                    </td>
                                    <td className="text-right text-neutral-400 px-6 py-3 tabular-nums">
                                        {spy !== null ? `-${(spy * 100).toFixed(1)}%` : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const MonthlyTable: React.FC<{ stats: PortfolioStats }> = ({ stats }) => {
    const years = Object.keys(stats.monthlyReturns).map(Number).sort((a, b) => a - b);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let totalSum = 0, cnt = 0, ddSum = 0, ddCnt = 0;
    const monthAvg = Array(12).fill(0);
    const monthCnt = Array(12).fill(0);

    years.forEach(y => {
        const annual = stats.annualReturns[y];
        if (annual !== undefined) { totalSum += annual; cnt++; }
        const dd = stats.annualMaxDrawdowns?.[y];
        if (dd !== undefined) { ddSum += dd; ddCnt++; }
        months.forEach((_, m) => {
            const v = stats.monthlyReturns[y]?.[m];
            if (v !== undefined) { monthAvg[m] += v; monthCnt[m]++; }
        });
    });

    // ALL cells get background color
    // ALL cells get background color
    const getCellStyle = (v: number | undefined) => {
        if (v === undefined) return 'bg-white text-neutral-300';
        if (v >= 0.05) return 'bg-green-300 text-green-900';
        if (v >= 0.02) return 'bg-green-200 text-green-900';
        if (v >= 0) return 'bg-green-100 text-green-800';
        if (v >= -0.02) return 'bg-red-50/40 text-red-600';
        if (v >= -0.05) return 'bg-red-50 text-red-700';
        return 'bg-red-100/80 text-red-900';
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900">Monthly Returns</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[800px]">
                    <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50/50">
                            <th className="text-left font-medium text-neutral-500 px-3 py-3 w-16">Year</th>
                            {months.map(m => <th key={m} className="text-center font-medium text-neutral-500 px-1 py-3">{m}</th>)}
                            <th className="text-center font-medium text-neutral-600 px-3 py-3 w-16 bg-neutral-100/50">Total</th>
                            <th className="text-center font-medium text-neutral-600 px-3 py-3 w-16 bg-white border-l border-neutral-100">MaxDD</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {years.map(y => {
                            const row = stats.monthlyReturns[y] || {};
                            const total = stats.annualReturns[y];
                            const maxDD = stats.annualMaxDrawdowns?.[y];
                            return (
                                <tr key={y}>
                                    <td className="px-3 py-2 font-medium text-neutral-700">{y}</td>
                                    {months.map((_, m) => (
                                        <td key={m} className={`px-1 py-2 text-center tabular-nums ${getCellStyle(row[m])}`}>
                                            {row[m] !== undefined ? (row[m] * 100).toFixed(1) : ''}
                                        </td>
                                    ))}
                                    <td className={`px-3 py-2 text-center tabular-nums font-medium ${getCellStyle(total)}`}>
                                        {total !== undefined ? `${(total * 100).toFixed(1)}%` : ''}
                                    </td>
                                    <td className="px-3 py-2 text-center tabular-nums bg-white text-red-600 font-medium border-l border-neutral-100">
                                        {maxDD ? `-${(maxDD * 100).toFixed(1)}%` : ''}
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Average row */}
                        <tr className="bg-neutral-50/50 font-medium border-t border-neutral-200">
                            <td className="px-3 py-2 text-neutral-600">Avg</td>
                            {monthAvg.map((s, m) => {
                                const avg = monthCnt[m] > 0 ? s / monthCnt[m] : undefined;
                                return <td key={m} className={`px-1 py-2 text-center tabular-nums ${getCellStyle(avg)}`}>{avg !== undefined ? (avg * 100).toFixed(1) : ''}</td>;
                            })}
                            <td className={`px-3 py-2 text-center tabular-nums ${getCellStyle(cnt > 0 ? totalSum / cnt : undefined)}`}>
                                {cnt > 0 ? `${((totalSum / cnt) * 100).toFixed(1)}%` : ''}
                            </td>
                            <td className="px-3 py-2 text-center tabular-nums bg-white text-red-600 border-l border-neutral-100">
                                {ddCnt > 0 ? `-${((ddSum / ddCnt) * 100).toFixed(1)}%` : ''}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};