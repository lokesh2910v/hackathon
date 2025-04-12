import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import { useAuth } from "@/hooks/use-auth";
import { QuizAttempt, Quiz } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { Link } from "wouter";
import {
  Loader2, AlertTriangle, Wallet, Coins, CheckCircle, 
  ArrowUpRight, ArrowDownLeft, ExternalLink
} from "lucide-react";

export default function RewardsPage() {
  const { user } = useAuth();
  
  // Fetch quiz attempts to calculate rewards
  const {
    data: attempts = [],
    isLoading: isLoadingAttempts
  } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quiz-attempts"],
  });
  
  // Fetch quizzes for title display
  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes
  } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });
  
  const isLoading = isLoadingAttempts || isLoadingQuizzes;
  
  // Get quiz title by ID
  const getQuizTitle = (quizId: number) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz?.title || "Unknown Quiz";
  };
  
  // Calculate total rewards
  const totalRewards = attempts.reduce((sum, attempt) => {
    if (attempt.rewardAmount) {
      return sum + parseFloat(attempt.rewardAmount.toString());
    }
    return sum;
  }, 0);
  
  // Calculate claimed rewards
  const claimedRewards = attempts.reduce((sum, attempt) => {
    if (attempt.rewardClaimed && attempt.rewardAmount) {
      return sum + parseFloat(attempt.rewardAmount.toString());
    }
    return sum;
  }, 0);
  
  // Calculate pending rewards
  const pendingRewards = totalRewards - claimedRewards;
  
  // Filter attempts with unclaimed rewards
  const unclaimedAttempts = attempts.filter(
    attempt => !attempt.rewardClaimed && attempt.rewardAmount && parseFloat(attempt.rewardAmount.toString()) > 0
  );
  
  // Format transaction hash for display
  const formatTransactionHash = (hash?: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  // Get network explorer URL
  const getExplorerUrl = (hash?: string) => {
    if (!hash) return "#";
    // Using Aptos explorer - change to the appropriate network (mainnet/testnet/etc)
    return `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">My Rewards</h2>
          </div>
        </div>
        
        {/* Rewards Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Wallet Status */}
              {!user?.walletAddress ? (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle>Connect Your Wallet</CardTitle>
                    <CardDescription>
                      You need to connect an Aptos wallet to claim your rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 flex-col sm:flex-row">
                      <div className="flex-1">
                        <div className="p-4 bg-amber-50 text-amber-700 rounded-md flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <div>
                            No wallet connected. You need to connect a wallet to claim your rewards.
                          </div>
                        </div>
                      </div>
                      <WalletButton />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle>Wallet Connected</CardTitle>
                    <CardDescription>
                      Your wallet is ready to receive rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="p-4 bg-green-50 text-green-600 rounded-md flex items-center gap-3 flex-1">
                        <Wallet className="h-5 w-5 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <div className="text-sm font-semibold">Wallet Address</div>
                          <div className="text-xs font-mono truncate">{user.walletAddress}</div>
                        </div>
                      </div>
                      <div className="p-4 bg-primary-50 text-primary-600 rounded-md flex items-center gap-3 flex-1">
                        <Coins className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold">Current Balance</div>
                          <div className="text-xl font-bold">{parseFloat(user.balance?.toString() || "0").toFixed(2)} APT</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Rewards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Total Rewards Earned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{totalRewards.toFixed(2)} APT</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Claimed Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{claimedRewards.toFixed(2)} APT</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500">Pending Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600">{pendingRewards.toFixed(2)} APT</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Unclaimed Rewards */}
              {unclaimedAttempts.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Unclaimed Rewards</CardTitle>
                    <CardDescription>
                      You have rewards that haven't been claimed yet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {unclaimedAttempts.map(attempt => (
                        <div key={attempt.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
                          <div className="mb-3 sm:mb-0">
                            <p className="font-medium">{getQuizTitle(attempt.quizId)}</p>
                            <p className="text-sm text-gray-500">
                              Completed on {format(new Date(attempt.completedAt || new Date()), 'MMM d, yyyy')}
                            </p>
                            <div className="flex items-center mt-1">
                              <Coins className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="text-amber-600 font-medium">
                                {parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT
                              </span>
                            </div>
                          </div>
                          
                          <Link href={`/results/${attempt.id}`}>
                            <Button disabled={!user?.walletAddress}>
                              <Coins className="h-4 w-4 mr-2" />
                              Claim Reward
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Your reward claim transaction history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attempts.some(a => a.rewardClaimed) ? (
                    <div className="divide-y">
                      {attempts
                        .filter(a => a.rewardClaimed)
                        .sort((a, b) => {
                          // Sort by completion date descending
                          const dateA = new Date(a.completedAt || 0);
                          const dateB = new Date(b.completedAt || 0);
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map(attempt => (
                          <div key={attempt.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start sm:items-center mb-2 sm:mb-0">
                              <div className="rounded-full bg-green-100 p-2 mr-3">
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">{getQuizTitle(attempt.quizId)}</div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(attempt.completedAt || new Date()), 'MMM d, yyyy • h:mm a')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="text-right">
                                <div className="text-green-600 font-medium">
                                  +{parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT
                                </div>
                                {attempt.transactionHash && (
                                  <div className="text-xs text-gray-500 font-mono flex items-center justify-end">
                                    {formatTransactionHash(attempt.transactionHash)}
                                    <a 
                                      href={getExplorerUrl(attempt.transactionHash)} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-1 text-primary hover:text-primary-700"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                              <div className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs flex items-center self-end sm:self-auto">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Claimed
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Coins className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                      <p className="text-gray-500 mt-1">
                        Complete quizzes and claim rewards to see your transaction history
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
