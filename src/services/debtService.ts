import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DebtItem = {
    id: string;
    user_id: string;
    name: string;
    type: string;
    amount: number;
    interest_rate: number;
    minimum_payment: number;
    remaining_term: number | null;
    created_at: string;
    updated_at: string;
};

export type DebtSummary = {
    totalDebt: number;
    monthlyPayments: number;
    interestPaidYTD: number;
    debtFreeDate: string;
    debtFreeMonths: number;
    paymentToIncomeRatio: number;
    totalRemainingPayments: number;
    futureInterest: number;
    debtByType: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    paymentTimeline: Array<{
        month: string;
        projectedBalance: number;
    }>;
};

// Color mapping for debt types
const debtTypeColors = {
    'Credit Card': '#30BFBF',
    'Student Loan': '#2CA58D',
    'Mortgage': '#0A2342',
    'Auto Loan': '#3B4754',
    'Personal Loan': '#90A955',
    'Medical Debt': '#E76F51',
    'Tax Debt': '#F4A261',
    'Other': '#6D6875',
};

/**
 * Get all debts for a specific user
 */
export const getUserDebts = async (userId: string): Promise<DebtItem[]> => {
    try {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data as DebtItem[];
    } catch (error) {
        console.error('Error fetching user debts:', error);
        toast.error('Failed to load debt data');
        return [];
    }
};

/**
 * Add a new debt for a user
 */
export const addDebt = async (
    userId: string,
    debt: Omit<DebtItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DebtItem | null> => {
    try {
        const { data, error } = await supabase
            .from('debts')
            .insert({
                user_id: userId,
                name: debt.name,
                type: debt.type,
                amount: debt.amount,
                interest_rate: debt.interest_rate,
                minimum_payment: debt.minimum_payment,
                remaining_term: debt.remaining_term,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        toast.success('Debt added successfully!');
        return data as DebtItem;
    } catch (error) {
        console.error('Error adding debt:', error);
        toast.error('Failed to add debt');
        return null;
    }
};

/**
 * Update an existing debt
 */
export const updateDebt = async (
    debtId: string,
    updates: Partial<Omit<DebtItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<DebtItem | null> => {
    try {
        const { data, error } = await supabase
            .from('debts')
            .update(updates)
            .eq('id', debtId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        toast.success('Debt updated successfully!');
        return data as DebtItem;
    } catch (error) {
        console.error('Error updating debt:', error);
        toast.error('Failed to update debt');
        return null;
    }
};

/**
 * Delete a debt
 */
export const deleteDebt = async (debtId: string): Promise<boolean> => {
    try {
        // First check if the debt exists
        const { data: existingDebt, error: checkError } = await supabase
            .from('debts')
            .select('id')
            .eq('id', debtId)
            .single();

        if (checkError) {
            console.error("Error checking if debt exists:", checkError);
            toast.error("Error checking if debt exists");
            return false;
        }

        if (!existingDebt) {
            console.log(`No debt found with ID: ${debtId}`);
            toast.error("Debt not found");
            return false;
        }

        // If debt exists, proceed with deletion
        console.log(`Attempting to delete debt with ID: ${debtId}`);
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', debtId);

        if (error) {
            console.error("Error deleting debt:", error);
            toast.error("Failed to delete debt");
            return false;
        }

        console.log(`Successfully deleted debt with ID: ${debtId}`);
        toast.success("Debt removed successfully");
        return true;
    } catch (error) {
        console.error("Error in deleteDebt function:", error);
        toast.error("An unexpected error occurred");
        return false;
    }
};

/**
 * Get color for a debt type
 */
export const getDebtTypeColor = (type: string): string => {
    return debtTypeColors[type] || debtTypeColors.Other;
}; 