import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityItem, ActivityType } from "@/components/ui/activity-item";
import { QuizCard } from "@/components/ui/quiz-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Zap, CheckCircle, Coins, Lightbulb,
  Loader2, ArrowRight
} from "lucide-react";
import { Quiz, Category, QuizAttempt } from "@shared/schema";
import { format } from "date-fns";

export default function HomePage() {
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
  
  // Fetch quiz attempts (for activity)
  const {
    data: attempts = [],
    isLoading: isLoadingAttempts
  } = useQuery<QuizAttempt[]>({
    queryKey: ["/api/quiz-attempts"],
  });
  
  // Fetch quizzes
  const {
    data: quizzes = [],
    isLoading: isLoadingQuizzes
  } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });
  
  // Fetch categories
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Generate activity items from attempts
  const activities = attempts.slice(0, 3).map(attempt => {
    // Find the quiz for this attempt
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    
    // Format date for sorting
    const date = new Date(attempt.completedAt || new Date());
    
    let type: ActivityType = 'completed';
    let title = `Completed "${quiz?.title || 'Quiz'}"`;
    let subtitle = `Earned ${parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT • Score: ${attempt.score}/${quiz?.questionCount || 10}`;
    
    if (attempt.rewardClaimed) {
      type = 'claimed';
      title = `Claimed reward for "${quiz?.title || 'Quiz'}"`;
      subtitle = `Transferred ${parseFloat(attempt.rewardAmount?.toString() || "0").toFixed(2)} APT to wallet`;
    }
    
    return {
      type,
      title,
      subtitle,
      timestamp: date,
      id: attempt.id
    };
  });
  
  // Get quizzes with categories for display
  const quizzesWithCategories = quizzes.slice(0, 4).map(quiz => {
    const category = categories.find(c => c.id === quiz.categoryId);
    return { quiz, category };
  });
  
  const isLoading = isLoadingStats || isLoadingAttempts || isLoadingQuizzes || isLoadingCategories;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">Dashboard</h2>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Stats Section */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white shadow rounded-lg h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Quizzes Taken"
                value={stats?.quizzesTaken || 0}
                icon={<Zap />}
                iconBgClass="bg-primary-100"
                iconColorClass="text-primary-600"
              />
              <StatCard
                title="Success Rate"
                value={`${stats?.successRate || 0}%`}
                icon={<CheckCircle />}
                iconBgClass="bg-green-100"
                iconColorClass="text-green-600"
              />
              <StatCard
                title="APT Earned"
                value={parseFloat(stats?.aptsEarned || "0").toFixed(2)}
                icon={<Coins />}
                iconBgClass="bg-amber-100"
                iconColorClass="text-amber-600"
              />
              <StatCard
                title="Knowledge Score"
                value={stats?.knowledgeScore || 0}
                icon={<Lightbulb />}
                iconBgClass="bg-blue-100"
                iconColorClass="text-blue-600"
              />
            </div>
          )}
          
          {/* Recent Activity & Available Quizzes */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="lg:col-span-1 bg-white shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                
                <div className="mt-6 flow-root">
                  {isLoadingAttempts ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse h-16 bg-gray-100 rounded" />
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <ul className="-my-5 divide-y divide-gray-200">
                      {activities.map((activity, index) => (
                        <ActivityItem
                          key={`${activity.id}-${index}`}
                          type={activity.type}
                          title={activity.title}
                          subtitle={activity.subtitle}
                          timestamp={activity.timestamp}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No activity yet</p>
                      <p className="text-sm text-gray-400 mt-1">Complete quizzes to see activity here</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Link href="/attempts">
                    <Button variant="outline" className="w-full">
                      View all
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Available Quizzes */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Available Quizzes</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Newest
                    </Button>
                    <Button variant="outline" size="sm">
                      Highest Reward
                    </Button>
                  </div>
                </div>
                
                {isLoadingQuizzes ? (
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="animate-pulse bg-gray-100 rounded-lg h-64" />
                    ))}
                  </div>
                ) : quizzesWithCategories.length > 0 ? (
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {quizzesWithCategories.map(({ quiz, category }) => (
                      <QuizCard key={quiz.id} quiz={quiz} category={category} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No quizzes available</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for new quizzes</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link href="/quizzes">
                    <Button variant="outline" className="w-full">
                      View all quizzes
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
