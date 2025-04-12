import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { WalletButton } from "./wallet-button";
import { 
  Home, HelpCircle, ClipboardList, Coins, User, 
  Menu, X, AlertTriangle, BookOpen
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

const navigationItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "All Quizzes", icon: BookOpen, href: "/quizzes" },
  { name: "My Attempts", icon: ClipboardList, href: "/attempts" },
  { name: "My Rewards", icon: Coins, href: "/rewards" },
  { name: "Profile", icon: User, href: "/profile" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Format wallet address for display
  const shortenAddress = (address?: string) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };
  
  // Format balance to 2 decimal places
  const formatBalance = (balance?: string) => {
    if (!balance) return "0.00 APT";
    return `${parseFloat(balance).toFixed(2)} APT`;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-md md:hidden flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
          </svg>
          <h1 className="text-xl font-bold">Aptos Quiz</h1>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-primary hover:bg-gray-100"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md w-64 fixed top-0 bottom-0 left-0 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 flex items-center space-x-2 border-b border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
            </svg>
            <h1 className="text-xl font-bold">Aptos Quiz</h1>
            
            {/* Close button (mobile only) */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 ml-auto rounded-md text-gray-400 hover:text-primary hover:bg-gray-100 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Nav Menu */}
          <nav className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    location === item.href 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </h3>
                <div className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/quizzes?category=${category.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <span 
                        className="w-2 h-2 mr-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback for no categories */}
            {categories.length === 0 && (
              <div className="mt-8 px-3 py-2">
                <div className="flex items-center text-sm text-gray-500">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  No categories available
                </div>
              </div>
            )}
          </nav>
          
          {/* User & Wallet Section */}
          <div className="p-4 border-t border-gray-200">
            <WalletButton />
            
            {user && (
              <div className="mt-4 flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">{user.username}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    {user.walletAddress ? (
                      <span className="truncate">{formatBalance(user.balance?.toString())}</span>
                    ) : (
                      <span className="text-yellow-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No wallet connected
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Logout button */}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="ml-2 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                    <path d="M9.293 7.293a1 1 0 011.414 0L12 8.586l1.293-1.293a1 1 0 111.414 1.414L13.414 10l1.293 1.293a1 1 0 01-1.414 1.414L12 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 10 9.293 8.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
