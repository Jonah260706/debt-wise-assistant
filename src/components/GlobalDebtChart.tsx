import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GlobalDebtChart = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState<string>('2021');
  const [selectedMetric, setSelectedMetric] = useState<string>('Annual average of central government debt (Percent of GDP)');
  const [metricOptions, setMetricOptions] = useState<{ value: string; label: string }[]>([]);
  const [countryLimit, setCountryLimit] = useState<number>(173); // Limit number of countries shown
  const [showAllCountries, setShowAllCountries] = useState<boolean>(true); // Default to show all countries

  // Generate years from 1950 to 2022
  const years = Array.from({ length: 2022 - 1950 + 1 }, (_, i) => (1950 + i).toString());

  useEffect(() => {
    // Parse the CSV file
    Papa.parse('/public/data/central_government_debt.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data;
        setData(parsedData);

        // Extract unique indicator names for metric options
        const uniqueIndicators = Array.from(new Set(parsedData.map((item: any) => item.indicator_name)));
        setMetricOptions(uniqueIndicators.map(indicator => ({ value: indicator, label: indicator })));

        // Set default metric if not already set and it's not in our options yet
        if ((!selectedMetric || !uniqueIndicators.includes(selectedMetric)) && uniqueIndicators.length > 0) {
          setSelectedMetric(uniqueIndicators[0]);
        }
      },
    });
  }, []);

  const handleCountryLimitChange = (value: string) => {
    if (value === 'all') {
      setShowAllCountries(true);
      setCountryLimit(999); // Large number to effectively show all
    } else {
      setShowAllCountries(false);
      setCountryLimit(parseInt(value));
    }
  };

  // Format data for the chart
  const chartData = data
    .filter((item: any) => item.indicator_name === selectedMetric)
    .map((item: any) => ({
      country: item.country_name,
      value: parseFloat(item[selectedYear]) || 0,
    }))
    // Sort by value descending for top N, or alphabetically for "all countries"
    .sort((a, b) => {
      if (showAllCountries) {
        return a.country.localeCompare(b.country); // Alphabetical order for "all countries"
      } else {
        return b.value - a.value; // Value descending for top N
      }
    })
    // Limit number of countries displayed if not showing all
    .slice(0, countryLimit);

  // Generate custom Y-axis ticks for gridlines
  const generateYAxisTicks = () => {
    const max = Math.max(...chartData.map(item => item.value));
    const step = Math.ceil(max / 4 / 55) * 55; // Round to nearest 55 for nice intervals
    return [0, step, step * 2, step * 3, step * 4].filter(tick => tick <= max + step);
  };

  return (
    <Card className="bg-slate-950 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-white">Global Debt Comparison</CardTitle>
        <CardDescription>Compare debt metrics across countries</CardDescription>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm text-debt-cream/80 mb-1 block">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
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
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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

        <div className="mt-4">
          <label className="text-sm text-debt-cream/80 mb-1 block">Number of Countries</label>
          <Select
            value={showAllCountries ? 'all' : countryLimit.toString()}
            onValueChange={handleCountryLimitChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Number of countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="30">Top 30</SelectItem>
              <SelectItem value="all">All Countries</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={500}>
          {showAllCountries ? (
           
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
              <XAxis
                dataKey="country"
                tick={{ fill: '#e2e8f0', fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                tick={{ fill: '#e2e8f0' }}
                domain={[0, 'dataMax + 20']}
                ticks={generateYAxisTicks()}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
                formatter={(value) => [`${value}`, selectedMetric]}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar
                dataKey="value"
                name={selectedMetric}
                fill="#14b8a6"
                maxBarSize={8}
              />
            </BarChart>
          ) : (
            // Regular bar chart for "Top N" view
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="country"
                tick={{ fill: '#e2e8f0' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#e2e8f0' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
                formatter={(value) => [`${value}`, selectedMetric]}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar
                dataKey="value"
                name={selectedMetric}
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GlobalDebtChart;
