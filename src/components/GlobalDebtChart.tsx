
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGlobalDebtDataFromDB } from '@/services/kaggleService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';

const GlobalDebtChart = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedMetric, setSelectedMetric] = useState<string>("debt_to_gdp_ratio");
  const { user } = useAuth();
  
  const { data: globalDebtData, isLoading, error } = useQuery({
    queryKey: ['globalDebtData', selectedYear],
    queryFn: () => fetchGlobalDebtDataFromDB({ year: parseInt(selectedYear), limit: 10 }),
    enabled: !!user, // Only fetch if logged in
  });
  
  const metricOptions = [
    { value: 'debt_to_gdp_ratio', label: 'Debt to GDP Ratio' },
    { value: 'household_debt_ratio', label: 'Household Debt Ratio' },
    { value: 'government_debt_ratio', label: 'Government Debt Ratio' },
    { value: 'corporate_debt_ratio', label: 'Corporate Debt Ratio' },
  ];
  
  const years = ["2023", "2022", "2021", "2020", "2019"];
  
  const getMetricLabel = (value: string) => {
    return metricOptions.find(option => option.value === value)?.label || value;
  };

  // Format data for the chart
  const chartData = globalDebtData?.map(item => ({
    country: item.country,
    [selectedMetric]: item[selectedMetric as keyof typeof item] as number,
  }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Global Debt Comparison</CardTitle>
        <CardDescription>Compare debt metrics across countries</CardDescription>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm text-debt-cream/80 mb-1 block">Year</label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-debt-cream/80 mb-1 block">Metric</label>
            <Select 
              value={selectedMetric}
              onValueChange={setSelectedMetric}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-debt-teal"></div>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 h-64 flex items-center justify-center">
            Error loading global debt data. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && chartData && (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="country" 
                tick={{ fill: '#e2e8f0' }}
                tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
              />
              <YAxis tick={{ fill: '#e2e8f0' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
              />
              <Legend />
              <Bar 
                dataKey={selectedMetric} 
                name={getMetricLabel(selectedMetric)}
                fill="#14b8a6" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {!isLoading && !error && (!chartData || chartData.length === 0) && (
          <div className="text-center text-debt-cream/80 h-64 flex items-center justify-center">
            No global debt data available for the selected year.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalDebtChart;
