import { format, formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, Coins, Wallet, 
  LucideIcon, AlertCircle, BookOpen
} from "lucide-react";

export type ActivityType = 'completed' | 'claimed' | 'connected' | 'failed';

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: Date;
}

export function ActivityItem({ type, title, subtitle, timestamp }: ActivityItemProps) {
  // Define icon and colors based on activity type
  let Icon: LucideIcon;
  let bgColor: string;
  let iconColor: string;
  
  switch (type) {
    case 'completed':
      Icon = CheckCircle;
      bgColor = 'bg-green-100';
      iconColor = 'text-green-600';
      break;
    case 'claimed':
      Icon = Coins;
      bgColor = 'bg-primary-100';
      iconColor = 'text-primary-600';
      break;
    case 'connected':
      Icon = Wallet;
      bgColor = 'bg-amber-100';
      iconColor = 'text-amber-600';
      break;
    case 'failed':
      Icon = AlertCircle;
      bgColor = 'bg-red-100';
      iconColor = 'text-red-600';
      break;
    default:
      Icon = BookOpen;
      bgColor = 'bg-blue-100';
      iconColor = 'text-blue-600';
  }
  
  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const fullDate = format(new Date(timestamp), 'MMM d, yyyy');

  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 rounded-full ${bgColor} h-8 w-8 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {title}
          </p>
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        </div>
        
        <div className="flex-shrink-0 text-sm text-gray-500" title={fullDate}>
          {formattedTime}
        </div>
      </div>
    </li>
  );
}
