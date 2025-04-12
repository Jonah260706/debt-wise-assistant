
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Plus, CheckCircle2, CreditCard, GraduationCap, Home, Car } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const debtFormSchema = z.object({
  type: z.string({
    required_error: "Please select a debt type.",
  }),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(1, "Amount must be at least $1."),
  interestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate must be 100% or less."),
  minimumPayment: z.coerce.number().min(0, "Minimum payment cannot be negative."),
  remainingTerm: z.coerce.number().optional(),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

type DebtItem = {
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

const DebtInputForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch user's debts from Supabase
  const { data: debts = [], isLoading, refetch } = useQuery({
    queryKey: ['userDebts'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching debts:', error);
        throw error;
      }
      
      return data as DebtItem[];
    },
    enabled: !!user,
  });

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      type: "",
      name: "",
      amount: undefined,
      interestRate: undefined,
      minimumPayment: undefined,
      remainingTerm: undefined,
    },
  });

  const onSubmit = async (data: DebtFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add debts");
      return;
    }
    
    try {
      // Insert debt into Supabase
      const { error } = await supabase.from('debts').insert({
        user_id: user.id,
        name: data.name,
        type: data.type,
        amount: data.amount,
        interest_rate: data.interestRate,
        minimum_payment: data.minimumPayment,
        remaining_term: data.remainingTerm || null,
      });
      
      if (error) {
        throw error;
      }
      
      // Refresh the debt list
      refetch();
      
      // Show success toast
      toast.success("Debt added successfully!", {
        description: `${data.type} debt of $${data.amount} has been added.`,
      });
      
      // Reset form
      form.reset({
        type: "",
        name: "",
        amount: undefined,
        interestRate: undefined,
        minimumPayment: undefined,
        remainingTerm: undefined,
      });
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("Failed to add debt", {
        description: error.message,
      });
    }
  };

  const removeDebt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh the debt list
      refetch();
      
      toast.success("Debt removed successfully!");
    } catch (error) {
      console.error("Error removing debt:", error);
      toast.error("Failed to remove debt", {
        description: error.message,
      });
    }
  };

  const getDebtIcon = (debtType: string) => {
    switch (debtType) {
      case "Credit Card":
        return <CreditCard className="h-5 w-5 text-debt-bright" />;
      case "Student Loan":
        return <GraduationCap className="h-5 w-5 text-debt-bright" />;
      case "Mortgage":
        return <Home className="h-5 w-5 text-debt-bright" />;
      case "Auto Loan":
        return <Car className="h-5 w-5 text-debt-bright" />;
      default:
        return <CreditCard className="h-5 w-5 text-debt-bright" />;
    }
  };

  return (
    <div className="space-y-4">
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="glass-card rounded-lg"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium">Manage Your Debts</h2>
            <p className="text-sm text-muted-foreground">
              Add your debts to get personalized insights
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="px-4 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select debt type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Student Loan">Student Loan</SelectItem>
                          <SelectItem value="Mortgage">Mortgage</SelectItem>
                          <SelectItem value="Auto Loan">Auto Loan</SelectItem>
                          <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                          <SelectItem value="Medical Debt">Medical Debt</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Chase Credit Card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            className="pl-6" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            className="pr-6"
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minimumPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Monthly Payment</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input 
                            type="number" 
                            className="pl-6" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="remainingTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remaining Term (Months, Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Optional"
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value === "" ? undefined : e.target.valueAsNumber;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-debt-teal hover:bg-debt-bright text-white"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" /> 
                Add Debt
              </Button>
            </form>
          </Form>

          {isLoading ? (
            <div className="flex justify-center items-center h-24 mt-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-debt-teal"></div>
            </div>
          ) : (
            debts.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium border-b border-debt-slate/30 pb-1">
                  Your Debts
                </h3>
                <div className="space-y-2">
                  {debts.map((debt) => (
                    <Card key={debt.id} className="bg-debt-slate/30 border-debt-slate/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDebtIcon(debt.type)}
                            <div>
                              <h4 className="font-medium">{debt.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {debt.type} • {debt.interest_rate}% APR
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${debt.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              ${debt.minimum_payment}/month
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-1">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-red-400 hover:text-red-300"
                            onClick={() => removeDebt(debt.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {debts.length >= 2 && (
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      className="border-debt-teal text-debt-teal hover:bg-debt-teal hover:text-white"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> 
                      Generate Debt Strategy
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DebtInputForm;
