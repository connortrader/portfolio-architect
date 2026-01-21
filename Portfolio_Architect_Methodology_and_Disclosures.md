# SetupAlpha Portfolio Architect: Methodology, Disclosures & Protocol Manual

**Version:** 1.0  
**Effective Date:** 2025  
**Document Type:** Technical & Legal Disclosure

---

## 1. Introduction & Purpose

The **SetupAlpha Portfolio Architect** is a specialized simulation engine designed to help quantitative traders, investors, and researchers verify the mathematical relationship between varying systematic trading strategies. Unlike simple "returns calculators," this tool is designed to model the behavior of a **Synthetic Constant-Mix Portfolio**.

This document outlines the precise algorithms, assumptions, and limitations used by the Portfolio Architect. It is vital that users understand the distinction between this **hypothetical simulation** and **live brokerage execution**.

---

## 2. Core Simulation Logic: The "Synthetic Output"

The most critical aspect of this tool is how it handles time-series data. It does not simulate a standard brokerage account with "open" and "closed" trades. Instead, it simulates a **mathematically rebalanced index** of strategies.

### 2.1 Daily Rebalancing Protocol (Constant Risk)
The simulation utilizes a **Daily Rebalancing** engine. This is a deliberate design choice that differs from typical "Buy and Hold" or "Monthly Rebalancing" live accounts.

*   **How It Works:** At the close of *every* trading day, the simulation calculates the total Net Asset Value (NAV) of the portfolio. It then effectively "sells" strategies that have drifted above their target allocation and "buys" strategies that have drifted below.
*   **The Implications (Live vs. Simulation):**
    *   **Live Trend Following:** In a real account, if you have a strategy holding a stock for 3 months and it gains +50%, that position becomes a larger % of your portfolio. You "let the winner run" (Drift).
    *   **Daily Simulation:** This tool "trims" that winner every single day to bring it back to the original weight (e.g., 20%).
*   **Conclusion:** This methodology creates a **conservative equity curve** for strong trend-following strategies because it systematically reduces exposure to winning positions. However, it provides a purer measure of **Correlation** and **Volatility reduction** because it maintains a constant risk profile.

### 2.2 Net-of-Fees Strategy Data
Unlike standard "Gross" backtests available on many platforms, the strategy data ingested by Portfolio Architect is calculated **Net of Fees**. The simulation assumes the following friction costs are already deducted from the underlying daily returns:
*   **Slippage & Impact:** A dynamic buffer applied to entry and exit prices to account for spread crossing and market impact.
*   **Commissions:** Transaction costs modeled on the **Interactive Brokers (IBKR) Pro-Tier** schedule (approx. $0.0035/share).
*   **Execution Buffers:** Limit orders are only considered "filled" if price penetrates the limit by a set margin, eliminating "phantom fills."

---

## 3. Capital Flow & Contributions

To assist with financial planning, the tool allows for the simulation of Recurring Cash Contributions (Dollar Cost Averaging).

*   **Timing:** Cash injections (Monthly, Quarterly, Annually) are simulated as entering the portfolio on the **first trading day** of the period.
*   **Allocation:** The new cash is immediately "deployed" to buy the under-weighted strategies to bring the portfolio back in line with Target Allocations.
*   **Friction:** The cash flow simulation assumes zero friction (no bank wire fees or delay days).

---

## 4. Quantitative Metrics: Glossary

The tool calculates widely accepted industry-standard metrics to evaluate Risk-Adjusted Return.

| Metric | Definition & Formula | Interpretation |
| :--- | :--- | :--- |
| **CAGR** | *Compound Annual Growth Rate* | The constant rate of return required for the starting balance to reach the ending balance. |
| **Sharpe Ratio** | $\frac{(R_p - R_f)}{\sigma_p}$ | Measures excess return per unit of total risk. *Note: this tool assumes Risk-Free Rate ($R_f$) = 0%*. A Sharpe > 1.5 is excellent. |
| **Sortino Ratio** | $\frac{(R_p - R_f)}{\sigma_d}$ | Similar to Sharpe, but divides by **Downside Deviation** ($\sigma_d$) instead of total deviation. It only penalizes volatility that loses money. |
| **Max Drawdown** | *Peak-to-Trough Decline* | The maximum percentage loss observed from a historical equity high. The "Pain Point." |
| **Calmar Ratio** | $\frac{CAGR}{|MaxDD|}$ | A ratio of Reward vs. Tail Risk. A Calmar Ratio > 1.0 implies the annual return is higher than the worst historical crash. |
| **Correlation** | *Pearson Coefficient (-1 to 1)* | Measures how two strategies move together. **0.0** is ideal for diversification. |

---

## 5. Stress Test Regimes

The **Stress Test Module** isolates specific date ranges to demonstrate resilience during historical "Black Swan" events. This assumes that the algorithms currently running would have behaved identically during previous market regimes.

*   **The Dotcom Crash (2000-2002):** Tech bubble burst. High volatility, massive drawdown in NDX.
*   **The Global Financial Crisis (2007-2009):** Systemic banking failure. High correlation between all asset classes.
*   **COVID-19 Panic (2020):** Fastest bear market in history (-35% in 30 days). Tests speed of reaction.
*   **Inflation Bear (2022):** Stock/Bond correlation breakdown. Tests performance during rising rates.

---

## 6. User-Uploaded Data

The platform features an **"Open Architecture"** upload system allowing users to test their own `.csv` equity curves.
*   **No Validation:** SetupAlpha does not audit, verify, or validate user files.
*   **Garbage In, Garbage Out:** If your uploaded CSV has "Look-Ahead Bias" or excludes fees, the simulation will yield misleadingly positive results. Use with caution.

---

## 7. Important Regulatory Disclosures & Liability

### 7.1 Hypothetical Performance (CFTC Rule 4.41)
**HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, SINCE THE TRADES HAVE NOT BEEN EXECUTED, THE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY. SIMULATED TRADING PROGRAMS IN GENERAL ARE ALSO SUBJECT TO THE FACT THAT THEY ARE DESIGNED WITH THE BENEFIT OF HINDSIGHT. NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE SHOWN.**

### 7.2 No Investment Advice
SetupAlpha is a software and education provider. We are **not** a Registered Investment Advisor (RIA), Broker-Dealer, or Commodity Trading Advisor (CTA).
*   Access to this tool does not constitute a recommendation to buy, sell, or hold any security.
*   Returns are not guaranteed. You may lose all of your capital.

### 7.3 Model Limitations
The results shown do not account for external factors such as:
*   **Taxation:** Short-term vs. Long-term capital gains tax.
*   **Psychology:** The user's ability to withstand the simulated drawdowns without intervening.
*   **Execution Lag:** Real-world delays in trade execution.

---

**By using the SetupAlpha Portfolio Architect, you acknowledge that you have read, understood, and accepted the methodologies and limitations described in this document.**
