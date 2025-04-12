import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserDebts, DebtItem, DebtSummary } from '@/services/debtService';
import { generateDebtSummary } from '@/utils/debtCalculator';
import { toast } from 'sonner';

interface DebtDashboardContextType {
    debts: DebtItem[];
    isLoading: boolean;
    summary: DebtSummary | null;
    monthlyIncome: number;
    setMonthlyIncome: (income: number) => void;
    refreshData: () => Promise<void>;
    applyIncome: () => void;
}

const defaultContext: DebtDashboardContextType = {
    debts: [],
    isLoading: true,
    summary: null,
    monthlyIncome: 3000, // Default monthly income assumption
    setMonthlyIncome: () => { },
    refreshData: async () => { },
    applyIncome: () => { },
};

const DebtDashboardContext = createContext<DebtDashboardContextType>(defaultContext);

interface DebtDashboardProviderProps {
    children: ReactNode;
}

export const DebtDashboardProvider: React.FC<DebtDashboardProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [debts, setDebts] = useState<DebtItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [summary, setSummary] = useState<DebtSummary | null>(null);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(3000);

    const fetchUserData = async () => {
        if (!user) {
            setDebts([]);
            setSummary(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch user's debts
            const userDebts = await getUserDebts(user.id);
            setDebts(userDebts);

            // Generate debt summary
            const newSummary = generateDebtSummary(userDebts, monthlyIncome);
            setSummary(newSummary);
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data only when user changes, not on income changes
    useEffect(() => {
        fetchUserData();
    }, [user]);

    // Function to apply income changes and recalculate summary
    const applyIncome = () => {
        if (debts.length > 0) {
            // Generate updated debt summary with current income
            const newSummary = generateDebtSummary(debts, monthlyIncome);
            setSummary(newSummary);
        }
    };

    const refreshData = async () => {
        console.log("Refreshing debt dashboard data");
        try {
            await fetchUserData();
            console.log("Data refresh completed");
        } catch (error) {
            console.error("Error refreshing data:", error);
            toast.error("Failed to refresh debt data");
        }
    };

    const value = {
        debts,
        isLoading,
        summary,
        monthlyIncome,
        setMonthlyIncome,
        refreshData,
        applyIncome,
    };

    return (
        <DebtDashboardContext.Provider value={value}>
            {children}
        </DebtDashboardContext.Provider>
    );
};

export const useDebtDashboard = () => useContext(DebtDashboardContext);

export default DebtDashboardContext; 