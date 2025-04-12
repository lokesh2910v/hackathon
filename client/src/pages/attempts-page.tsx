import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, CheckCircle, XCircle, Coins, BookOpen, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { QuizAttempt, Quiz } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

export default function AttemptsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all attempts
  const { 
    data: attempts = [],
    isLoading: isLoadingAttempts
  } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quiz-attempts"],
  });
  
  // Fetch all quizzes to get titles
  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes
  } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });
  
  const isLoading = isLoadingAttempts || isLoadingQuizzes;
  
  // Filter attempts by quiz title if search term is present
  const filteredAttempts = searchTerm
    ? attempts.filter(attempt => {
        const quiz = quizzes.find(q => q.id === attempt.quizId);
        return quiz?.title.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : attempts;
  
  // Find a quiz by its ID
  const getQuizById = (quizId: number) => quizzes.find(q => q.id === quizId);
  
  // Calculate the score percentage
  const calculatePercentage = (score: number, quizId: number) => {
    const quiz = getQuizById(quizId);
    if (!quiz) return 0;
    
    return Math.round((score / quiz.questionCount) * 100);
  };
  
  // Get status of an attempt
  const getStatus = (attempt: QuizAttempt) => {
    const percentage = calculatePercentage(attempt.score, attempt.quizId);
    
    if (percentage >= 70) return "passed";
    return "failed";
  };
  
  // Format date for display
  const formatDate = (dateString?: Date | string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">My Quiz Attempts</h2>
          </div>
        </div>
        
        {/* Attempts Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by quiz title..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Attempts List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAttempts.length > 0 ? (
            <div className="space-y-4">
              {filteredAttempts.map(attempt => {
                const quiz = getQuizById(attempt.quizId);
                const percentage = calculatePercentage(attempt.score, attempt.quizId);
                const status = getStatus(attempt);
                
                return (
                  <Card key={attempt.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Status indicator */}
                        <div className={`w-full md:w-2 flex-shrink-0 ${
                          status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        
                        <div className="p-5 flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {quiz?.title || "Unknown Quiz"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Completed on {formatDate(attempt.completedAt)}
                              </p>
                            </div>
                            
                            <div className="flex items-center mt-2 md:mt-0">
                              {status === 'passed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mr-1" />
                              )}
                              <span className={`text-sm font-medium ${
                                status === 'passed' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {status === 'passed' ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center">
                              <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Score</p>
                                <p className="text-sm font-medium">
                                  {attempt.score}/{quiz?.questionCount || '?'} ({percentage}%)
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <Coins className="h-5 w-5 text-amber-500 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Reward</p>
                                <p className="text-sm font-medium">
                                  {parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT
                                  {attempt.rewardClaimed && (
                                    <span className="text-xs ml-1 text-green-600">(Claimed)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="text-sm font-medium">
                                  {quiz?.duration || '?'} minutes
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link href={`/results/${attempt.id}`}>
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                View Results
                              </Button>
                            </Link>
                            
                            {!attempt.rewardClaimed && attempt.rewardAmount && parseFloat(attempt.rewardAmount.toString()) > 0 && (
                              <Link href={`/results/${attempt.id}`}>
                                <Button variant="default" size="sm" className="w-full sm:w-auto">
                                  <Coins className="h-4 w-4 mr-1" />
                                  Claim Reward
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No quiz attempts yet</h3>
              <p className="text-gray-500 mt-1">
                Take a quiz to see your attempt history
              </p>
              <Link href="/quizzes">
                <Button className="mt-4">
                  Browse Quizzes
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
