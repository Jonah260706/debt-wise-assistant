
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/ChatInterface";
import DebtDashboard from "@/components/DebtDashboard";
import DebtInputForm from "@/components/DebtInputForm";
import GlobalDebtChart from "@/components/GlobalDebtChart";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, FileInput, Globe, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-900 to-violet-950">
      <header className="p-4 border-b border-debt-slate/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-debt-bright rounded-lg p-1">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">कर्जा रे</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-debt-cream text-sm hidden md:inline-block">
                  Hi, {user.user_metadata?.first_name || user.email?.split('@')[0]}
                </span>
              )}
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                size="sm" 
                className="border-debt-teal text-debt-cream hover:bg-debt-teal hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" /> 
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container max-w-6xl mx-auto py-6 px-4 md:px-0">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Your Personal Debt Management Assistant</h1>
          <p className="text-debt-cream/80 max-w-2xl mx-auto">
            Ask questions, analyze your debt, and get personalized recommendations to achieve financial freedom faster.
          </p>
        </div>
        
        <Tabs 
          defaultValue="chat" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-6 rounded-3xl">
            <TabsList className="grid grid-cols-4 w-full max-w-md rounded-3xl">
              <TabsTrigger value="chat" className="flex items-center gap-1 rounded-3xl">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:inline">Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-1 rounded-3xl">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="input" className="flex items-center gap-1 rounded-3xl">
                <FileInput className="h-4 w-4" />
                <span className="hidden md:inline">Add Debts</span>
              </TabsTrigger>
              <TabsTrigger value="global" className="flex items-center gap-1 rounded-3xl">
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">Global Data</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className={`${activeTab === "chat" ? "lg:col-span-3" : "lg:col-span-5"}`}>
              <TabsContent value="chat" className="h-[600px]">
                <ChatInterface />
              </TabsContent>
              <TabsContent value="dashboard">
                <DebtDashboard />
              </TabsContent>
              <TabsContent value="input">
                <DebtInputForm />
              </TabsContent>
              <TabsContent value="global">
                <GlobalDebtChart />
              </TabsContent>
            </div>
            
            {activeTab === "chat" && (
              <div className="hidden lg:block lg:col-span-2 space-y-6">
                <DebtInputForm />
              </div>
            )}
          </div>
        </Tabs>
      </main>
      
      <footer className="border-t border-debt-slate/30 py-4 mt-6">
        <div className="container max-w-6xl mx-auto px-4 md:px-0">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-debt-cream/60">© 2025 DebtWise Assistant. All rights reserved.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="text-debt-cream/60 hover:text-debt-cream">
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" className="text-debt-cream/60 hover:text-debt-cream">
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" className="text-debt-cream/60 hover:text-debt-cream">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
