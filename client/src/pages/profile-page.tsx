import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletButton } from "@/components/ui/wallet-button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Loader2, User, Mail, Key, Wallet, AlertTriangle, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Fetch user stats
  const { 
    data: stats,
    isLoading: isLoadingStats
  } = useQuery<{
    quizzesTaken: number;
    successRate: number;
    aptsEarned: string;
    knowledgeScore: number;
  }>({
    queryKey: ["/api/user/stats"],
  });
  
  const formatAddress = (address?: string) => {
    if (!address) return "Not connected";
    return `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
  };
  
  const formatBalance = (balance?: string) => {
    if (!balance) return "0.00";
    return parseFloat(balance).toFixed(2);
  };
  
  const copyToClipboard = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Wallet address copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">Profile</h2>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {!user ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Profile Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Username
                      </Label>
                      <div className="text-sm font-medium">{user.username}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Label>
                      <div className="text-sm font-medium">{user.email}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 flex items-center">
                        <Key className="h-3 w-3 mr-1" />
                        Account Created
                      </Label>
                      <div className="text-sm font-medium">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Wallet Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                  <CardDescription>
                    Connect your Aptos wallet to claim rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.walletAddress ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-3">
                        <Wallet className="h-5 w-5" />
                        <div className="flex-1">Wallet successfully connected</div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Wallet Address</Label>
                        <div className="flex items-center">
                          <div className="text-sm font-mono bg-gray-100 p-2 rounded-md flex-1 truncate">
                            {user.walletAddress}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2"
                            onClick={copyToClipboard}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Current Balance</Label>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold text-amber-600">
                            {formatBalance(user.balance?.toString())} APT
                          </div>
                        </div>
                      </div>
                      
                      {isLoadingStats ? (
                        <div className="h-10 animate-pulse bg-gray-100 rounded"></div>
                      ) : stats && (
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Total Earned</Label>
                          <div className="flex items-center">
                            <div className="text-2xl font-bold text-green-600">
                              {parseFloat(stats.aptsEarned).toFixed(2)} APT
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 text-amber-700 rounded-md flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" />
                        <div>No wallet connected. You need to connect a wallet to claim rewards.</div>
                      </div>
                      
                      <WalletButton />
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Stats and Account Settings */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  ) : stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm text-gray-500">Quizzes Taken</div>
                        <div className="text-2xl font-bold">{stats.quizzesTaken}</div>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm text-gray-500">Success Rate</div>
                        <div className="text-2xl font-bold">{stats.successRate}%</div>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm text-gray-500">APT Earned</div>
                        <div className="text-2xl font-bold text-amber-600">{parseFloat(stats.aptsEarned).toFixed(2)}</div>
                      </div>
                      <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm text-gray-500">Knowledge Score</div>
                        <div className="text-2xl font-bold">{stats.knowledgeScore}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Failed to load stats
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
