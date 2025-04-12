import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { QuizInterface } from "@/components/ui/quiz-interface";
import { Loader2, AlertTriangle } from "lucide-react";
import { Question, Quiz } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuizPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Fetch quiz details
  const { 
    data: quiz,
    isLoading: isLoadingQuiz,
    error: quizError
  } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${id}`],
  });
  
  // Fetch quiz questions when quiz starts
  const { 
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuery<Omit<Question, "correctOption">[]>({
    queryKey: [`/api/quizzes/${id}/questions`],
    enabled: false, // Don't fetch initially
  });
  
  // Start quiz and fetch questions
  useEffect(() => {
    if (quizStarted && quiz) {
      refetchQuestions();
    }
  }, [quizStarted, quiz, refetchQuestions]);
  
  // Auto-start quiz after loading
  useEffect(() => {
    if (quiz && !quizStarted && !isLoadingQuiz) {
      setQuizStarted(true);
    }
  }, [quiz, isLoadingQuiz, quizStarted]);
  
  // Submit quiz answers
  const submitMutation = useMutation({
    mutationFn: async (answers: number[]) => {
      const res = await apiRequest("POST", `/api/quizzes/${id}/submit`, { answers });
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      // Redirect to results page
      setLocation(`/results/${data.attemptId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle quiz completion
  const handleComplete = (answers: number[]) => {
    submitMutation.mutate(answers);
  };
  
  // Loading state
  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 pt-16 md:pt-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading quiz...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (quizError || !quiz) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 pt-16 md:pt-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              {quizError instanceof Error ? quizError.message : "Quiz not found"}
            </p>
          </div>
        </main>
      </div>
    );
  }
  
  // Quiz content loading or error state
  if (quizStarted && (isLoadingQuestions || !questions)) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        <Sidebar />
        <main className="flex-1 pt-16 md:pt-0 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            {isLoadingQuestions ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">Loading questions...</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {questionsError instanceof Error ? questionsError.message : "Failed to load questions"}
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">{quiz.title}</h2>
          </div>
        </div>
        
        {/* Quiz Content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {quizStarted && questions ? (
            <QuizInterface
              questions={questions}
              quizTitle={quiz.title}
              quizId={quiz.id}
              onComplete={handleComplete}
              timeLimit={quiz.duration}
            />
          ) : (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">Preparing quiz...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
