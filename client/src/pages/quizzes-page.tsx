import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/ui/sidebar";
import { QuizCard } from "@/components/ui/quiz-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Filter, Loader2, BookOpen, 
  ChevronDown, SlidersHorizontal 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Quiz, Category } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuizzesPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
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
  
  // Parse URL query parameters on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const categoryParam = url.searchParams.get('category');
    
    if (categoryParam) {
      const categoryId = parseInt(categoryParam);
      if (!isNaN(categoryId)) {
        setSelectedCategory(categoryId);
      }
    }
  }, []);
  
  const isLoading = isLoadingQuizzes || isLoadingCategories;
  
  // Get all available difficulties
  const difficulties = [...new Set(quizzes.map(quiz => quiz.difficulty))];
  
  // Filter quizzes based on search, category, and difficulty
  const filteredQuizzes = quizzes.filter(quiz => {
    // Filter by search term
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === null || quiz.categoryId === selectedCategory;
    
    // Filter by difficulty
    const matchesDifficulty = selectedDifficulty === null || quiz.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  // Sort quizzes
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // Assuming createdAt is a date string
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "highest-reward":
        return parseFloat(b.reward.toString()) - parseFloat(a.reward.toString());
      case "lowest-reward":
        return parseFloat(a.reward.toString()) - parseFloat(b.reward.toString());
      case "difficulty-asc":
        // Simple difficulty ordering (easy, medium, hard)
        const diffOrder = { "easy": 1, "medium": 2, "hard": 3 };
        return (diffOrder[a.difficulty.toLowerCase()] || 99) - (diffOrder[b.difficulty.toLowerCase()] || 99);
      case "difficulty-desc":
        const diffOrderDesc = { "easy": 1, "medium": 2, "hard": 3 };
        return (diffOrderDesc[b.difficulty.toLowerCase()] || 99) - (diffOrderDesc[a.difficulty.toLowerCase()] || 99);
      default:
        return 0;
    }
  });
  
  // Get the quizzes with their categories for display
  const quizzesWithCategories = sortedQuizzes.map(quiz => {
    const category = categories.find(c => c.id === quiz.categoryId);
    return { quiz, category };
  });
  
  // Handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    
    // Update URL query params
    if (categoryId !== null) {
      navigate(`/quizzes?category=${categoryId}`);
    } else {
      navigate('/quizzes');
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSortBy("newest");
    navigate('/quizzes');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 pt-16 md:pt-0 md:ml-64">
        {/* Topbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-medium">All Quizzes</h2>
          </div>
        </div>
        
        {/* Quizzes Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search quizzes..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {/* Mobile filter button */}
              <Button 
                variant="outline" 
                className="lg:hidden" 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              {/* Desktop filters */}
              <div className="hidden lg:flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Category
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup 
                      value={selectedCategory?.toString() || ""}
                      onValueChange={(value) => handleCategorySelect(value ? parseInt(value) : null)}
                    >
                      <DropdownMenuRadioItem value="">All Categories</DropdownMenuRadioItem>
                      {categories.map((category) => (
                        <DropdownMenuRadioItem key={category.id} value={category.id.toString()}>
                          <span 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Difficulty
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuRadioGroup 
                      value={selectedDifficulty || ""}
                      onValueChange={(value) => setSelectedDifficulty(value || null)}
                    >
                      <DropdownMenuRadioItem value="">All Difficulties</DropdownMenuRadioItem>
                      {difficulties.map((difficulty) => (
                        <DropdownMenuRadioItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest-reward">Highest Reward</SelectItem>
                      <SelectItem value="lowest-reward">Lowest Reward</SelectItem>
                      <SelectItem value="difficulty-asc">Difficulty (Easy-Hard)</SelectItem>
                      <SelectItem value="difficulty-desc">Difficulty (Hard-Easy)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
              </div>
            </div>
          </div>
          
          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="mb-6 lg:hidden">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger>Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div 
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                          selectedCategory === null ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleCategorySelect(null)}
                      >
                        All Categories
                      </div>
                      {categories.map((category) => (
                        <div 
                          key={category.id}
                          className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center ${
                            selectedCategory === category.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <span 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="difficulty">
                  <AccordionTrigger>Difficulty</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div 
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                          selectedDifficulty === null ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedDifficulty(null)}
                      >
                        All Difficulties
                      </div>
                      {difficulties.map((difficulty) => (
                        <div 
                          key={difficulty}
                          className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                            selectedDifficulty === difficulty ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedDifficulty(difficulty)}
                        >
                          {difficulty}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="sort">
                  <AccordionTrigger>Sort By</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {[
                        { value: "newest", label: "Newest First" },
                        { value: "oldest", label: "Oldest First" },
                        { value: "highest-reward", label: "Highest Reward" },
                        { value: "lowest-reward", label: "Lowest Reward" },
                        { value: "difficulty-asc", label: "Difficulty (Easy-Hard)" },
                        { value: "difficulty-desc", label: "Difficulty (Hard-Easy)" }
                      ].map((option) => (
                        <div 
                          key={option.value}
                          className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                            sortBy === option.value ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setSortBy(option.value)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Button variant="ghost" onClick={clearFilters} className="mt-2 w-full">
                Clear All Filters
              </Button>
            </div>
          )}
          
          {/* Active filters summary */}
          {(selectedCategory !== null || selectedDifficulty !== null || searchTerm) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory !== null && (
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <button 
                    className="ml-2 text-primary-500 hover:text-primary-700"
                    onClick={() => handleCategorySelect(null)}
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {selectedDifficulty !== null && (
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Difficulty: {selectedDifficulty}
                  <button 
                    className="ml-2 text-primary-500 hover:text-primary-700"
                    onClick={() => setSelectedDifficulty(null)}
                  >
                    &times;
                  </button>
                </div>
              )}
              
              {searchTerm && (
                <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: {searchTerm}
                  <button 
                    className="ml-2 text-primary-500 hover:text-primary-700"
                    onClick={() => setSearchTerm("")}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Quizzes Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : quizzesWithCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quizzesWithCategories.map(({ quiz, category }) => (
                <QuizCard key={quiz.id} quiz={quiz} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No quizzes found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters or search term
              </p>
              <Button className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
