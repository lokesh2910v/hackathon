import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  CheckCircle, X, Home, List, Coins, 
  Loader2, Clock, Award 
} from "lucide-react";
import { QuizAttempt } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface QuizResultsProps {
  attempt: QuizAttempt;
  quizTitle: string;
  totalQuestions: number;
  completionTime?: string; // Optional completion time display
}

export function QuizResults({ 
  attempt, 
  quizTitle, 
  totalQuestions,
  completionTime = "N/A" 
}: QuizResultsProps) {
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Calculate percentage
  const percentage = Math.round((attempt.score / totalQuestions) * 100);
  
  // Determine icon and message based on score percentage
  let resultIcon = <Award className="h-10 w-10 text-primary-600" />;
  let resultMessage = "Good job!";
  
  if (percentage >= 80) {
    resultIcon = <Award className="h-10 w-10 text-green-600" />;
    resultMessage = "Excellent!";
  } else if (percentage < 50) {
    resultIcon = <X className="h-10 w-10 text-red-600" />;
    resultMessage = "Keep practicing!";
  }
  
  // Mutation for claiming reward
  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/rewards/claim/${attempt.id}`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      if (data.simulated) {
        toast({
          title: "Reward claimed (Simulation)",
          description: `${attempt.rewardAmount} APT has been simulated. The platform wallet needs to be funded on devnet.`,
        });
      } else {
        toast({
          title: "Reward claimed!",
          description: `${attempt.rewardAmount} APT has been added to your wallet.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="text-center bg-primary-50">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white">
          {resultIcon}
        </div>
        <CardTitle className="mt-2">Quiz Completed!</CardTitle>
        <p className="text-sm text-gray-500">
          {resultMessage} You've completed the "{quizTitle}" quiz.
        </p>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Your Score</p>
              <p className="text-2xl font-bold text-gray-900">{attempt.score}/{totalQuestions}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Reward</p>
              <p className="text-2xl font-bold text-amber-600">{parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Results Breakdown</h4>
          <div className="mt-2 text-sm text-left">
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600">Correct Answers</span>
              <span className="font-medium text-green-600">{attempt.score}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600">Incorrect Answers</span>
              <span className="font-medium text-red-600">{totalQuestions - attempt.score}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            {completionTime && (
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-600">Completion Time</span>
                <span className="font-medium">{completionTime}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 p-6">
        {!attempt.rewardClaimed && attempt.rewardAmount && parseFloat(attempt.rewardAmount.toString()) > 0 && (
          <Button 
            className="w-full" 
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
          >
            {claimMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Coins className="mr-2 h-4 w-4" />
            )}
            Claim Reward
          </Button>
        )}
        
        {attempt.rewardClaimed && (
          <div className="w-full flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-md text-sm">
            <CheckCircle className="mr-2 h-4 w-4" />
            {attempt.transactionHash?.startsWith('dev-tx-') || attempt.transactionHash?.startsWith('error-tx-') ? 
              'Reward claimed (simulation mode)' : 
              'Reward claimed successfully'}
            {attempt.transactionHash && !attempt.transactionHash.startsWith('dev-tx-') && !attempt.transactionHash.startsWith('error-tx-') && (
              <a 
                href={`https://explorer.aptoslabs.com/txn/${attempt.transactionHash}?network=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline"
              >
                View Transaction
              </a>
            )}
          </div>
        )}
        
        <Link href="/attempts">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsNavigating(true)}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <List className="mr-2 h-4 w-4" />
            )}
            View All Attempts
          </Button>
        </Link>
        
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full text-primary"
            onClick={() => setIsNavigating(true)}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Home className="mr-2 h-4 w-4" />
            )}
            Return to Dashboard
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
