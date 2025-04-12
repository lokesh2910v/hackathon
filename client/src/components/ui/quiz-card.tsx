import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  AlertCircle, Clock, Star, Coins 
} from "lucide-react";
import { Quiz, Category } from "@shared/schema";

interface QuizCardProps {
  quiz: Quiz;
  category?: Category;
}

export function QuizCard({ quiz, category }: QuizCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine difficulty icon and color
  const getDifficultyDetails = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return { color: 'text-green-500', bgColor: 'bg-green-100' };
      case 'medium':
        return { color: 'text-amber-500', bgColor: 'bg-amber-100' };
      case 'hard':
        return { color: 'text-red-500', bgColor: 'bg-red-100' };
      default:
        return { color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
  };
  
  const difficultyDetails = getDifficultyDetails(quiz.difficulty);
  
  // Determine category color if not provided
  const categoryColor = category?.color || 'bg-blue-100';
  const categoryTextColor = category?.color?.replace('bg-', 'text-').replace('-100', '-800') || 'text-blue-800';
  const categoryName = category?.name || 'Uncategorized';
  
  // Calculate star rating (mock for now, could be based on user ratings)
  const starRating = Math.floor(Math.random() * 5) + 1; // This would be replaced with actual data

  return (
    <Card 
      className={`overflow-hidden border transition-colors ${
        isHovered ? 'border-primary-400' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className={`${categoryColor} ${categoryTextColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
              {categoryName}
            </span>
          </div>
          <div className="ml-auto flex items-center">
            <span className="flex items-center text-xs text-gray-500 mr-4">
              <AlertCircle className={`w-4 h-4 mr-1 ${difficultyDetails.color}`} />
              {quiz.difficulty}
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1 text-gray-400" />
              {quiz.duration} min
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-900">
            {quiz.title}
          </h4>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {quiz.description}
          </p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-amber-600">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${i < starRating ? 'fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="flex items-center">
            <Coins className="h-5 w-5 text-amber-600" />
            <span className="ml-1 text-sm font-medium text-gray-900">
              {parseFloat(quiz.reward.toString()).toFixed(2)} APT
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <Link href={`/quiz/${quiz.id}`}>
            <Button className="w-full">
              Start Quiz
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
