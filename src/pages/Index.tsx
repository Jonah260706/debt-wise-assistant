
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from "@/components/ChatInterface";
import DebtDashboard from "@/components/DebtDashboard";
import DebtInputForm from "@/components/DebtInputForm";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, FileInput } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-debt-navy to-debt-slate">
      <header className="p-4 border-b border-debt-slate/30">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-debt-bright rounded-lg p-1">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">DebtWise</h1>
            </div>
            <nav className="hidden md:block">
              <ul className="flex gap-6">
                <li>
                  <Button variant="link" className="text-debt-cream hover:text-debt-bright">Features</Button>
                </li>
                <li>
                  <Button variant="link" className="text-debt-cream hover:text-debt-bright">How It Works</Button>
                </li>
                <li>
                  <Button variant="link" className="text-debt-cream hover:text-debt-bright">About</Button>
                </li>
              </ul>
            </nav>
            <Button className="bg-debt-teal hover:bg-debt-bright text-white">Get Started</Button>
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
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:inline">Assistant</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="input" className="flex items-center gap-1">
                <FileInput className="h-4 w-4" />
                <span className="hidden md:inline">Add Debts</span>
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
