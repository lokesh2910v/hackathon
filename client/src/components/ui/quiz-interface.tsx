import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Clock, HelpCircle } from "lucide-react";
import { Question } from "@shared/schema";

interface QuizInterfaceProps {
  questions: Omit<Question, "correctOption">[];
  quizTitle: string;
  quizId: number;
  onComplete: (answers: number[]) => void;
  timeLimit?: number; // in minutes
}

export function QuizInterface({ 
  questions, 
  quizTitle, 
  quizId, 
  onComplete, 
  timeLimit = 10 
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    // Filter out any unanswered questions (set to 0 as default)
    const finalAnswers = answers.map(a => a === -1 ? 0 : a);
    onComplete(finalAnswers);
  };
  
  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-10 flex justify-center">
          <div className="text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No questions available</h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-primary-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle>{quizTitle}</CardTitle>
          <div className="flex items-center text-sm">
            <Clock className="mr-1 h-4 w-4" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-500">Question</span>
            <span className="ml-2 text-sm font-medium text-gray-900">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.text}</h4>
          
          <RadioGroup 
            value={answers[currentQuestionIndex].toString()} 
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="font-medium text-gray-700">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 flex items-center justify-between p-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={answers[currentQuestionIndex] === -1 || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}
