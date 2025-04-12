
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

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
  debtType: z.string({
    required_error: "Please select a debt type.",
  }),
  balance: z.coerce.number().min(1, "Balance must be at least $1."),
  interestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate must be 100% or less."),
  minimumPayment: z.coerce.number().min(0, "Minimum payment cannot be negative."),
  lender: z.string().optional(),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

type DebtItem = DebtFormValues & {
  id: string;
};

const DebtInputForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debts, setDebts] = useState<DebtItem[]>([]);

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      debtType: "",
      balance: undefined,
      interestRate: undefined,
      minimumPayment: undefined,
      lender: "",
    },
  });

  const onSubmit = (data: DebtFormValues) => {
    // Add debt to list
    const newDebt: DebtItem = {
      ...data,
      id: crypto.randomUUID(),
    };

    setDebts([...debts, newDebt]);
    
    // Show success toast
    toast.success("Debt added successfully!", {
      description: `${data.debtType} debt of $${data.balance} has been added.`,
    });
    
    // Reset form
    form.reset({
      debtType: "",
      balance: undefined,
      interestRate: undefined,
      minimumPayment: undefined,
      lender: "",
    });
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
    toast.success("Debt removed successfully!");
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
                  name="debtType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
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
                  name="balance"
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
                  name="lender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lender (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Name of bank or lender
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-debt-teal hover:bg-debt-bright text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> 
                Add Debt
              </Button>
            </form>
          </Form>

          {debts.length > 0 && (
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
                          {getDebtIcon(debt.debtType)}
                          <div>
                            <h4 className="font-medium">{debt.debtType}</h4>
                            <p className="text-xs text-muted-foreground">
                              {debt.lender && `${debt.lender} • `}
                              {debt.interestRate}% APR
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${debt.balance}</p>
                          <p className="text-xs text-muted-foreground">
                            ${debt.minimumPayment}/month
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
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DebtInputForm;
