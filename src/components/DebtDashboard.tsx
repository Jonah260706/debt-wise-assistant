import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCardIcon,
  GraduationCapIcon,
  HomeIcon,
  CarIcon,
  TrendingDownIcon,
  PieChartIcon,
  BarChart3Icon,
  CalendarIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
} from "recharts";
import { useDebtDashboard } from "@/context/DebtDashboardContext";
import { Input } from "@/components/ui/input";
import { generatePaymentTimeline } from "@/utils/debtCalculator";

const DebtDashboard = () => {
  const [activeDashboard, setActiveDashboard] = useState("overview");
  const [localIncome, setLocalIncome] = useState<number>(3000);
  const { summary, isLoading, monthlyIncome, setMonthlyIncome, refreshData, applyIncome } = useDebtDashboard();

  // Update local income when the context value changes
  useEffect(() => {
    setLocalIncome(monthlyIncome);
  }, [monthlyIncome]);

  // Apply income changes
  const handleApplyIncome = () => {
    setMonthlyIncome(localIncome);
    applyIncome();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return '₹' + new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 text-debt-bright animate-spin" />
        <span className="ml-2 text-xl">Loading dashboard data...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 glass-card rounded-lg">
        <h2 className="text-2xl font-bold mb-4">No Debt Data Available</h2>
        <p className="text-center mb-6">
          To see your debt analysis and payment projections, please add your debts using the form above.
        </p>
        <Button onClick={() => refreshData()} className="bg-debt-teal hover:bg-debt-bright text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 bg-slate-950 rounded-3xl">
          <TabsTrigger value="overview" className="rounded-3xl " onClick={() => setActiveDashboard("overview")}>Overview</TabsTrigger>

          <TabsTrigger value="forecast" className="rounded-3xl" onClick={() => setActiveDashboard("forecast")}>Risk Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 font-bold ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Debt Dashboard</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <span className="text-sm mr-2">Monthly Income (₹):</span>
                <Input
                  type="number"
                  value={localIncome}
                  onChange={(e) => setLocalIncome(Number(e.target.value))}
                  className="w-28 h-8 text-right"
                />
                <Button
                  onClick={handleApplyIncome}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Apply
                </Button>
              </div>
              <Button
                onClick={() => refreshData()}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 ">
            <Card className="bg-slate-950 rounded-3xl">
              <CardHeader className="pb-2 ">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalDebt)}</div>
                <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 rounded-3xl">
              <CardHeader className="pb-2 ">
                <CardTitle className="text-sm font-medium text-debt-cream/60 ">Monthly Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.monthlyPayments)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(summary.paymentToIncomeRatio)} of monthly income
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 rounded-3xl">
              <CardHeader className="pb-2 ">
                <CardTitle className="text-sm font-medium text-debt-cream/60">
                  Payments Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold ">{formatCurrency(summary.totalRemainingPayments)}</div>
                <div className="mt-1 text-xs">
                  <div className="w-full bg-debt-slate/30 rounded-full h-2 mt-1">
                    <div
                      className="bg-debt-teal h-2 rounded-full"
                      style={{
                        width: `${(summary.totalDebt / summary.totalRemainingPayments) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-debt-teal">
                      {formatCurrency(summary.totalDebt)} principal
                    </span>
                    <span className="text-debt-bright">
                      {formatCurrency(summary.futureInterest)} interest
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Interest Paid (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.interestPaidYTD)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.interestPaidYTD > 0
                    ? `${formatPercentage(summary.interestPaidYTD / (summary.monthlyPayments * 12))} of total payments`
                    : 'No interest paid yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Debt-Free Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.debtFreeDate}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.debtFreeMonths === Infinity
                    ? 'Increase payments to pay off debt'
                    : `${(summary.debtFreeMonths / 12).toFixed(1)} years remaining`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <Card className="bg-slate-950 rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-debt-bright" />
                    Debt Breakdown
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={summary.debtByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {summary.debtByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {summary.debtByType.map((type, index) => (
                    <Badge
                      key={index}
                      style={{ backgroundColor: type.color }}
                      className="flex items-center gap-1"
                    >
                      {getDebtIcon(type.name)}
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 rounded-3xl overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-debt-bright" />
                    Payment Timeline
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={summary.paymentTimeline}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="projectedBalance"
                        stroke="#30BFBF"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                        name="Projected Balance"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Action Cards */}
          <div className="justify-center ">
            <ActionItem
              title="Optimize Your Debt Payment Strategy"
              description="Use our AI-powered debt payoff calculator to find the fastest way to become debt-free and save on interest."
              buttonText="Generate Strategy"
            />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Debt Analysis</h2>
          <p className="text-lg mb-6">
            This section will show detailed analysis of your debt, including interest breakdown,
            payment strategies, and potential savings opportunities.
          </p>
          <div className="p-8 glass-card rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
            <p>The detailed analysis features are currently under development.</p>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Risk Assessment</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Dynamic debt-to-income ratio risk assessment */}
            <RiskItem
              title="Debt-to-Income Ratio"
              amount={summary.paymentToIncomeRatio * 100}
              dueDate="Ongoing"
              status={summary.paymentToIncomeRatio > 0.43 ? "high-risk" :
                summary.paymentToIncomeRatio > 0.36 ? "medium-risk" : "low-risk"}
              message={`Your debt-to-income ratio is ${formatPercentage(summary.paymentToIncomeRatio)}. ${summary.paymentToIncomeRatio > 0.43 ? 'This is considered risky by lenders and may impact your ability to get new credit.' :
                summary.paymentToIncomeRatio > 0.36 ? 'This is approaching the concerning threshold of 43%. Consider reducing your debt or increasing income.' :
                  'This is within healthy limits.'
                }`}
            />

            {/* Dynamic time-to-payoff risk assessment */}
            <RiskItem
              title="Time to Debt Freedom"
              amount={summary.debtFreeMonths === Infinity ? 0 : summary.debtFreeMonths}
              dueDate={summary.debtFreeDate}
              status={summary.debtFreeMonths === Infinity ? "high-risk" :
                summary.debtFreeMonths > 120 ? "medium-risk" : "low-risk"}
              message={summary.debtFreeMonths === Infinity ?
                "With current payment amounts, your debt will never be fully paid off. Increase your payments to make progress." :
                summary.debtFreeMonths > 120 ?
                  `It will take you approximately ${(summary.debtFreeMonths / 12).toFixed(1)} years to become debt-free. Consider increasing payments to reduce this timeframe.` :
                  `You're on track to be debt-free in ${(summary.debtFreeMonths / 12).toFixed(1)} years, which is a reasonable timeframe.`}
            />

            {/* Interest burden risk assessment */}
            <RiskItem
              title="Interest Burden"
              amount={(summary.futureInterest / summary.totalDebt) * 100}
              dueDate="Long-term"
              status={summary.futureInterest > summary.totalDebt ? "high-risk" :
                summary.futureInterest > summary.totalDebt * 0.5 ? "medium-risk" : "low-risk"}
              message={`Over the life of your debt, you'll pay approximately ${formatCurrency(summary.futureInterest)} in interest (${((summary.futureInterest / summary.totalDebt) * 100).toFixed(0)}% of your principal). ${summary.futureInterest > summary.totalDebt ?
                "This is extremely high. Consider strategies to reduce interest rates or accelerate payoff." :
                summary.futureInterest > summary.totalDebt * 0.5 ?
                  "This is significant. Look into refinancing high-interest debt." :
                  "This is a reasonable amount of interest relative to your debt load."
                }`}
            />
          </div>

          <div className="mt-8 glass-card p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Recommended Actions</h3>
            <ul className="space-y-3 list-disc pl-5">
              {summary.paymentToIncomeRatio > 0.36 && (
                <li>Reduce your debt-to-income ratio by increasing income or reducing debt</li>
              )}
              {summary.debtFreeMonths === Infinity && (
                <li>Increase minimum payments on high-interest debts to make progress toward payoff</li>
              )}
              {summary.debtFreeMonths > 120 && (
                <li>Use the debt avalanche method: Pay minimum on all debts, then add extra to highest interest debt</li>
              )}
              {summary.futureInterest > summary.totalDebt * 0.5 && (
                <li>Consider refinancing high-interest debt to reduce total interest paid</li>
              )}
              {summary.debtByType.some(type => type.name === "Credit Card") && (
                <li>Transfer high-interest credit card balances to a lower-rate card or personal loan</li>
              )}
              <li>Set up automatic payments to avoid late fees and penalties</li>
              <li>Create a budget to allocate more funds toward debt repayment</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to get the appropriate icon for debt types
const getDebtIcon = (debtType: string) => {
  switch (debtType) {
    case 'Credit Card':
      return <CreditCardIcon className="h-3 w-3" />;
    case 'Student Loan':
      return <GraduationCapIcon className="h-3 w-3" />;
    case 'Mortgage':
      return <HomeIcon className="h-3 w-3" />;
    case 'Auto Loan':
      return <CarIcon className="h-3 w-3" />;
    default:
      return <span className="h-3 w-3">₹</span>;
  }
};

const DebtBadge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <Badge className="bg-debt-navy hover:bg-debt-navy/80 flex items-center gap-1 cursor-pointer">
    {icon}
    {label}
  </Badge>
);

const RiskItem = ({
  title,
  amount,
  dueDate,
  status,
  message
}: {
  title: string;
  amount: number;
  dueDate: string;
  status: 'high-risk' | 'medium-risk' | 'low-risk';
  message: string;
}) => {
  const statusColors = {
    'high-risk': 'bg-red-600/20 border-red-600/30 text-red-500',
    'medium-risk': 'bg-yellow-600/20 border-yellow-600/30 text-yellow-500',
    'low-risk': 'bg-green-600/20 border-green-600/30 text-green-500',
  };

  const statusIcons = {
    'high-risk': <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
    'medium-risk': <AlertTriangleIcon className="h-6 w-6 text-yellow-500" />,
    'low-risk': <CheckCircle2Icon className="h-6 w-6 text-green-500" />,
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          {statusIcons[status]}
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">Due: {dueDate}</p>
          </div>
        </div>
        <div className="text-right">
          {amount > 0 && (
            <span className="text-xl font-bold">
              {amount < 1000 ? `${amount}%` : new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(amount)}
            </span>
          )}
          <Badge variant="outline" className={status === 'high-risk' ? 'border-red-500 text-red-500' :
            status === 'medium-risk' ? 'border-yellow-500 text-yellow-500' :
              'border-green-500 text-green-500'}>
            {status === 'high-risk' ? 'High Risk' :
              status === 'medium-risk' ? 'Medium Risk' :
                'Low Risk'}
          </Badge>
        </div>
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
};

const ActionItem = ({
  title,
  description,
  buttonText
}: {
  title: string;
  description: string;
  buttonText: string;
}) => (
  <Card className="glass-card">
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button className="bg-debt-teal hover:bg-debt-bright text-white">{buttonText}</Button>
    </CardContent>
  </Card>
);

export default DebtDashboard;
