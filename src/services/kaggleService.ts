
import { supabase } from "@/integrations/supabase/client";

export type GlobalDebtData = {
  country: string;
  year: number;
  debt_to_gdp_ratio: number;
  household_debt_ratio: number;
  government_debt_ratio: number;
  corporate_debt_ratio: number;
};

export const fetchDatasets = async () => {
  const { data, error } = await supabase.functions.invoke('kaggle-debt-data', {
    body: {
      action: 'fetchDatasets'
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const importKaggleData = async () => {
  const { data, error } = await supabase.functions.invoke('kaggle-debt-data', {
    body: {
      action: 'importData'
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const queryGlobalDebtData = async (params: { 
  country?: string; 
  year?: number; 
  limit?: number; 
}) => {
  const { data, error } = await supabase.functions.invoke('kaggle-debt-data', {
    body: {
      action: 'queryData',
      ...params
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchGlobalDebtDataFromDB = async (params: { 
  country?: string; 
  year?: number; 
  limit?: number; 
}) => {
  let query = supabase
    .from('global_debt_data')
    .select('*')
    .order('year', { ascending: false });

  if (params.country) {
    query = query.eq('country', params.country);
  }

  if (params.year) {
    query = query.eq('year', params.year);
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
