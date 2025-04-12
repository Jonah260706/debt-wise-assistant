
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  GraduationCap, 
  Home, 
  Car, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2 
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

// Sample data
const debtTypeData = [
  { name: 'Credit Cards', value: 5000, color: '#30BFBF' },
  { name: 'Student Loans', value: 15000, color: '#2CA58D' },
  { name: 'Mortgage', value: 125000, color: '#0A2342' },
  { name: 'Auto Loan', value: 8000, color: '#3B4754' },
];

const paymentTimelineData = [
  { month: 'Jan', actual: 1200, projected: 1200 },
  { month: 'Feb', actual: 1300, projected: 1200 },
  { month: 'Mar', actual: 1150, projected: 1200 },
  { month: 'Apr', actual: 1250, projected: 1200 },
  { month: 'May', actual: 1400, projected: 1200 },
  { month: 'Jun', actual: 1350, projected: 1200 },
  { month: 'Jul', actual: 0, projected: 1200 },
  { month: 'Aug', actual: 0, projected: 1200 },
  { month: 'Sep', actual: 0, projected: 1200 },
  { month: 'Oct', actual: 0, projected: 1200 },
  { month: 'Nov', actual: 0, projected: 1200 },
  { month: 'Dec', actual: 0, projected: 1200 },
];

const spendingData = [
  { category: 'Housing', amount: 1500 },
  { category: 'Food', amount: 600 },
  { category: 'Transport', amount: 350 },
  { category: 'Entertainment', amount: 250 },
  { category: 'Utilities', amount: 300 },
  { category: 'Debt Payments', amount: 1200 },
];

const COLORS = ['#30BFBF', '#2CA58D', '#0A2342', '#3B4754', '#90A955'];

// Calculate total debt
const totalDebt = debtTypeData.reduce((sum, type) => sum + type.value, 0);

const DebtDashboard = () => {
  const [activeDashboard, setActiveDashboard] = useState("overview");
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview" onClick={() => setActiveDashboard("overview")}>Overview</TabsTrigger>
          <TabsTrigger value="analysis" onClick={() => setActiveDashboard("analysis")}>Analysis</TabsTrigger>
          <TabsTrigger value="forecast" onClick={() => setActiveDashboard("forecast")}>Risk Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
                <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Monthly Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(1200)}</div>
                <p className="text-xs text-muted-foreground mt-1">40% of monthly income</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Interest Paid (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(2450)}</div>
                <p className="text-xs text-muted-foreground mt-1">17% of total payments</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-debt-cream/60">Debt-Free Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">June 2028</div>
                <p className="text-xs text-muted-foreground mt-1">4.2 years remaining</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-debt-bright" />
                    Debt Breakdown
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={debtTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {debtTypeData.map((entry, index) => (
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
                  <DebtBadge icon={<CreditCard className="h-4 w-4" />} label="Credit Cards" />
                  <DebtBadge icon={<GraduationCap className="h-4 w-4" />} label="Student Loans" />
                  <DebtBadge icon={<Home className="h-4 w-4" />} label="Mortgage" />
                  <DebtBadge icon={<Car className="h-4 w-4" />} label="Auto Loan" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-debt-bright" />
                    Payment Timeline
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={paymentTimelineData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']}
                        contentStyle={{ backgroundColor: '#3B4754', border: 'none', borderRadius: '4px' }}
                        labelStyle={{ color: '#F2F4F3' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual Payments" 
                        stroke="#30BFBF" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projected" 
                        name="Projected Payments" 
                        stroke="#2CA58D" 
                        strokeDasharray="5 5" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-debt-bright" />
                Spending Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spendingData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#3B4754', border: 'none', borderRadius: '4px' }}
                      labelStyle={{ color: '#F2F4F3' }}
                    />
                    <Bar dataKey="amount" name="Amount">
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-debt-slate/30 border border-debt-slate/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-debt-cream/60">
                        Debt-to-Income Ratio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">42%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30">
                          Moderate Risk
                        </Badge>
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-debt-slate/30 border border-debt-slate/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-debt-cream/60">
                        Potential Monthly Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(350)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Through spending optimizations
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-debt-teal shrink-0 mt-0.5" />
                      <span>Reduce dining out expenses by $150/month</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-debt-teal shrink-0 mt-0.5" />
                      <span>Consolidate credit card debt to reduce interest payments</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-debt-teal shrink-0 mt-0.5" />
                      <span>Switch to a more affordable phone plan to save $45/month</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forecast" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Risk Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RiskItem 
                  title="Credit Card Payment"
                  amount={350}
                  dueDate="April 18, 2025"
                  status="high-risk"
                  message="High likelihood of insufficient funds based on spending patterns"
                />
                
                <RiskItem 
                  title="Student Loan"
                  amount={220}
                  dueDate="April 24, 2025"
                  status="medium-risk"
                  message="Payment due date falls after typical income deposit date"
                />
                
                <RiskItem 
                  title="Mortgage"
                  amount={1200}
                  dueDate="May 1, 2025"
                  status="low-risk"
                  message="Sufficient funds projected to be available"
                />
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Preventive Actions:</h3>
                  <div className="space-y-2">
                    <ActionItem 
                      title="Transfer $350 to savings" 
                      description="Ensures credit card payment coverage"
                      buttonText="Schedule Transfer"
                    />
                    <ActionItem 
                      title="Adjust student loan due date" 
                      description="Change to 10th of month to align with paycheck"
                      buttonText="Contact Lender"
                    />
                    <ActionItem 
                      title="Setup automatic payments" 
                      description="For all recurring debt obligations"
                      buttonText="Setup Autopay"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper components
const DebtBadge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <Badge variant="outline" className="bg-debt-slate/40 border-debt-slate/60">
    <div className="flex items-center gap-1">
      {icon}
      <span>{label}</span>
    </div>
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
  const statusConfig = {
    'high-risk': { 
      color: 'bg-red-500/20 border-red-500/30', 
      icon: <AlertTriangle className="h-5 w-5 text-red-500" /> 
    },
    'medium-risk': { 
      color: 'bg-yellow-500/20 border-yellow-500/30', 
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> 
    },
    'low-risk': { 
      color: 'bg-green-500/20 border-green-500/30', 
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" /> 
    },
  };

  return (
    <div className={`p-4 rounded-lg border ${statusConfig[status].color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {statusConfig[status].icon}
          <h4 className="font-medium">{title}</h4>
        </div>
        <div className="text-base font-bold">
          ${amount}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Due: {dueDate}</span>
        <span className="text-sm">{message}</span>
      </div>
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
  <div className="flex items-center justify-between p-2 rounded-lg bg-debt-slate/20">
    <div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button variant="outline" size="sm" className="bg-debt-teal/20 border-debt-teal hover:bg-debt-teal hover:text-white text-debt-teal">
      {buttonText}
    </Button>
  </div>
);

export default DebtDashboard;
