import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { QuizResults } from "@/components/ui/quiz-results";
import { Loader2, AlertTriangle } from "lucide-react";
import { QuizAttempt, Quiz } from "@shared/schema";
import { format } from "date-fns";

export default function ResultsPage() {
  const { attemptId } = useParams();
  
  // Fetch the attempt
  const { 
    data: attempt,
    isLoading: isLoadingAttempt,
    error: attemptError
  } = useQuery<QuizAttempt>({
    queryKey: [`/api/quiz-attempts/${attemptId}`],
  });
  
  // Fetch the quiz if we have an attempt
  const {
    data: quiz,
    isLoading: isLoadingQuiz,
    error: quizError
  } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${attempt?.quizId}`],
    enabled: !!attempt?.quizId,
  });
  
  const isLoading = isLoadingAttempt || (attempt && isLoadingQuiz);
  const error = attemptError || quizError;
  
  // Format the completion time if available
  const formattedCompletionTime = attempt?.completedAt 
    ? format(new Date(attempt.completedAt), 'HH:mm:ss')
    : "N/A";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">Quiz Results</h2>
          </div>
        </div>
        
        {/* Results Content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Loading results...</p>
            </div>
          ) : error || !attempt || !quiz ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {error instanceof Error ? error.message : "Failed to load results"}
              </p>
            </div>
          ) : (
            <QuizResults
              attempt={attempt}
              quizTitle={quiz.title}
              totalQuestions={quiz.questionCount}
              completionTime={formattedCompletionTime}
            />
          )}
        </div>
      </main>
    </div>
  );
}
