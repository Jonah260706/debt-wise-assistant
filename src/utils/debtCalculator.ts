import { DebtItem, DebtSummary, getDebtTypeColor } from "@/services/debtService";

/**
 * Calculate the monthly interest for a debt
 */
export const calculateMonthlyInterest = (
    principal: number,
    annualInterestRate: number
): number => {
    // Convert annual interest rate to monthly decimal
    const monthlyRate = annualInterestRate / 100 / 12;
    return principal * monthlyRate;
};

/**
 * Calculate the time to pay off a debt (in months)
 */
export const calculateTimeToPayoff = (
    principal: number,
    annualInterestRate: number,
    monthlyPayment: number
): number => {
    if (monthlyPayment <= 0 || principal <= 0) {
        return 0;
    }

    // Convert annual interest rate to monthly decimal
    const monthlyRate = annualInterestRate / 100 / 12;

    if (monthlyRate === 0) {
        // Simple division for 0% interest
        return Math.ceil(principal / monthlyPayment);
    }

    // Formula: n = -log(1 - P*r/PMT) / log(1+r)
    // where n is number of months, P is principal, r is monthly rate, PMT is payment
    const numerator = -Math.log(1 - (principal * monthlyRate) / monthlyPayment);
    const denominator = Math.log(1 + monthlyRate);

    // Check for valid math (payment must be greater than monthly interest)
    if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        return Infinity; // Will never be paid off with current payment
    }

    return Math.ceil(numerator / denominator);
};

/**
 * Format a future date as a string (e.g., "June 2028")
 */
export const formatFutureDate = (monthsFromNow: number): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);

    return date.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric'
    });
};

/**
 * Calculate total monthly minimum payments
 */
export const calculateTotalMonthlyPayment = (debts: DebtItem[]): number => {
    return debts.reduce((total, debt) => total + debt.minimum_payment, 0);
};

/**
 * Calculate projected interest paid year-to-date
 */
export const calculateInterestPaidYTD = (debts: DebtItem[]): number => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const monthsElapsed = currentDate.getMonth(); // 0-11

    // Calculate interest paid for each debt for months elapsed this year
    return debts.reduce((total, debt) => {
        const monthlyInterest = calculateMonthlyInterest(debt.amount, debt.interest_rate);
        return total + (monthlyInterest * (monthsElapsed + 1)); // +1 to include current month
    }, 0);
};

/**
 * Calculate debt-free date based on current payments
 */
export const calculateDebtFreeDate = (debts: DebtItem[]): { date: string; months: number } => {
    if (debts.length === 0) {
        return { date: 'N/A', months: 0 };
    }

    // For each debt, calculate months to payoff
    const payoffMonths = debts.map(debt => {
        return calculateTimeToPayoff(
            debt.amount,
            debt.interest_rate,
            debt.minimum_payment
        );
    });

    // Get the maximum (longest time to pay off)
    const maxMonths = Math.max(...payoffMonths);

    // Handle case where debt cannot be paid off
    if (maxMonths === Infinity) {
        return { date: 'Never', months: Infinity };
    }

    return {
        date: formatFutureDate(maxMonths),
        months: maxMonths
    };
};

/**
 * Group debts by type and calculate totals
 */
export const groupDebtsByType = (debts: DebtItem[]): Array<{ name: string; value: number; color: string }> => {
    const debtByType: { [key: string]: number } = {};

    // Group and sum debts by type
    debts.forEach(debt => {
        if (!debtByType[debt.type]) {
            debtByType[debt.type] = 0;
        }
        debtByType[debt.type] += debt.amount;
    });

    // Convert to array format needed for charts
    return Object.entries(debtByType).map(([name, value]) => ({
        name,
        value,
        color: getDebtTypeColor(name)
    }));
};

/**
 * Format a date as a short month and year string (e.g., "Jan '25")
 */
export const formatMonthYear = (date: Date): string => {
    return date.toLocaleString('en-US', {
        month: 'short',
        year: '2-digit'
    }).replace(' ', "'");
};

/**
 * Generate payment timeline projection starting from the current month until debt-free
 */
export const generatePaymentTimeline = (
    debts: DebtItem[],
    debtFreeMonths: number
): Array<{ month: string; projectedBalance: number }> => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    if (totalDebt === 0) {
        return [{ month: "Now", projectedBalance: 0 }];
    }

    const totalMonthlyPayment = calculateTotalMonthlyPayment(debts);
    const timeline: Array<{ month: string; projectedBalance: number }> = [
        { month: "Now", projectedBalance: totalDebt }
    ];

    let currentBalance = totalDebt;
    const currentDate = new Date();

    // Calculate a simple weighted average interest rate for projection
    // Note: This is an approximation for the summary timeline.
    // More accurate payoff calculations happen elsewhere.
    const weightedInterestRate = debts.reduce((sum, debt) => sum + debt.amount * debt.interest_rate, 0) / totalDebt;

    // Determine the number of months to project
    // Cap at 30 years (360 months) if payoff is "Never" (Infinity) or very long
    const monthsToProject = (debtFreeMonths === Infinity || debtFreeMonths > 360) ? 360 : debtFreeMonths;

    for (let i = 1; i <= monthsToProject; i++) {
        // Calculate interest for the month based on the weighted average rate
        const monthlyInterest = calculateMonthlyInterest(currentBalance, weightedInterestRate);

        // Update balance: previous balance + interest - payment
        currentBalance += monthlyInterest;
        currentBalance -= totalMonthlyPayment;

        // Ensure balance doesn't go below zero
        currentBalance = Math.max(0, currentBalance);

        // Move to the next month
        currentDate.setMonth(currentDate.getMonth() + 1);

        timeline.push({
            month: formatMonthYear(currentDate),
            projectedBalance: currentBalance,
        });

        // Stop if balance reaches zero early (due to approximation or high payments)
        if (currentBalance === 0) {
            break;
        }
    }

    // If capped at 360 months and balance > 0, indicate it continues
    if (monthsToProject === 360 && currentBalance > 0) {
        timeline.push({ month: "...", projectedBalance: currentBalance });
    }


    return timeline;
};

/**
 * Calculate payment-to-income ratio (requires income)
 */
export const calculatePaymentToIncomeRatio = (
    monthlyPayment: number,
    monthlyIncome: number
): number => {
    if (monthlyIncome <= 0) return 0;
    return monthlyPayment / monthlyIncome;
};

/**
 * Calculate total amount needed to pay off all debts
 * This includes both principal and future interest
 */
export const calculateTotalRemainingPayments = (debts: DebtItem[]): number => {
    return debts.reduce((total, debt) => {
        // For debts that will never be paid off (payment < monthly interest)
        const monthlyInterest = calculateMonthlyInterest(debt.amount, debt.interest_rate);
        if (debt.minimum_payment <= monthlyInterest) {
            // Just return the principal as minimum - infinite payments aren't realistic to calculate
            return total + debt.amount;
        }

        // Calculate months to payoff
        const months = calculateTimeToPayoff(
            debt.amount,
            debt.interest_rate,
            debt.minimum_payment
        );

        // Total payment is monthly payment * number of months
        const totalPayment = debt.minimum_payment * months;
        return total + totalPayment;
    }, 0);
};

/**
 * Calculate total future interest to be paid
 */
export const calculateFutureInterest = (debts: DebtItem[]): number => {
    return debts.reduce((total, debt) => {
        // For debts that will never be paid off (payment < monthly interest)
        const monthlyInterest = calculateMonthlyInterest(debt.amount, debt.interest_rate);
        if (debt.minimum_payment <= monthlyInterest) {
            // Just use the principal amount since we can't calculate infinite interest
            return total;
        }

        // Calculate months to payoff
        const months = calculateTimeToPayoff(
            debt.amount,
            debt.interest_rate,
            debt.minimum_payment
        );

        // Total payment is monthly payment * number of months
        const totalPayment = debt.minimum_payment * months;

        // Future interest is total payment minus current principal
        const futureInterest = totalPayment - debt.amount;
        return total + futureInterest;
    }, 0);
};

/**
 * Generate a complete debt summary for a user
 */
export const generateDebtSummary = (
    debts: DebtItem[],
    monthlyIncome: number = 3000 // Default assumption
    // pastPayments parameter removed as it's no longer used by the new timeline
): DebtSummary => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const monthlyPayments = calculateTotalMonthlyPayment(debts);
    const interestPaidYTD = calculateInterestPaidYTD(debts);
    const debtFree = calculateDebtFreeDate(debts);
    const paymentToIncomeRatio = calculatePaymentToIncomeRatio(monthlyPayments, monthlyIncome);
    const debtByType = groupDebtsByType(debts);
    // Pass debtFree.months to the updated timeline generator
    const paymentTimeline = generatePaymentTimeline(debts, debtFree.months);
    const totalRemainingPayments = calculateTotalRemainingPayments(debts);
    const futureInterest = calculateFutureInterest(debts);

    return {
        totalDebt,
        monthlyPayments,
        interestPaidYTD,
        debtFreeDate: debtFree.date,
        debtFreeMonths: debtFree.months,
        paymentToIncomeRatio,
        debtByType,
        paymentTimeline, // Now contains projected balances
        totalRemainingPayments,
        futureInterest
    };
}; 