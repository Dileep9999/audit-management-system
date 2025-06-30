import React from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  completed?: number;
  pending?: number;
  inProgress?: number;
  className?: string;
  showNumbers?: boolean;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'green' | 'blue' | 'orange';
  animate?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  completed = 0,
  pending = 0,
  inProgress = 0,
  className = '',
  showNumbers = true,
  showStatus = true,
  size = 'md',
  color = 'primary',
  animate = true
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-1.5',
      iconSize: 'h-3 w-3',
      textSize: 'text-xs',
      padding: 'px-2 py-1'
    },
    md: {
      height: 'h-2.5',
      iconSize: 'h-4 w-4',
      textSize: 'text-sm',
      padding: 'px-3 py-1.5'
    },
    lg: {
      height: 'h-3',
      iconSize: 'h-5 w-5',
      textSize: 'text-base',
      padding: 'px-4 py-2'
    }
  };

  // Color configurations
  const colorConfig = {
    primary: {
      bg: 'bg-primary-500',
      text: 'text-primary-600 dark:text-primary-400',
      bgLight: 'bg-primary-100 dark:bg-primary-900/20'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
      bgLight: 'bg-green-100 dark:bg-green-900/20'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-100 dark:bg-blue-900/20'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600 dark:text-orange-400',
      bgLight: 'bg-orange-100 dark:bg-orange-900/20'
    }
  };

  const config = sizeConfig[size];
  const colors = colorConfig[color];

  // Status indicator
  const getStatusIcon = () => {
    if (percentage === 100) {
      return <CheckCircle className={`${config.iconSize} text-green-500`} />;
    } else if (percentage >= 50) {
      return <TrendingUp className={`${config.iconSize} text-blue-500`} />;
    } else if (percentage > 0) {
      return <Clock className={`${config.iconSize} text-orange-500`} />;
    } else {
      return <AlertCircle className={`${config.iconSize} text-gray-400`} />;
    }
  };

  const getStatusText = () => {
    if (percentage === 100) return 'Completed';
    if (percentage >= 75) return 'Nearly Done';
    if (percentage >= 50) return 'In Progress';
    if (percentage >= 25) return 'Getting Started';
    if (percentage > 0) return 'Started';
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (percentage === 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400';
    if (percentage > 0) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        {showNumbers && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showStatus && getStatusIcon()}
              <span className={`font-medium ${colors.text} ${config.textSize}`}>
                Progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${colors.text} ${config.textSize}`}>
                {percentage}%
              </span>
              <span className={`text-gray-500 dark:text-gray-400 ${config.textSize}`}>
                ({current}/{total})
              </span>
            </div>
          </div>
        )}
        
        <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${config.height} overflow-hidden`}>
          <div
            className={`${config.height} ${colors.bg} rounded-full transition-all duration-500 ease-out ${
              animate ? 'animate-pulse' : ''
            }`}
            style={{ 
              width: `${percentage}%`,
              boxShadow: percentage > 0 ? `0 0 8px ${color === 'primary' ? '#3B82F6' : '#10B981'}33` : 'none'
            }}
          />
        </div>
      </div>

      {/* Status breakdown */}
      {showStatus && (completed > 0 || pending > 0 || inProgress > 0) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`${getStatusColor()} font-medium ${config.textSize}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            {completed > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {completed} done
                </span>
              </div>
            )}
            {inProgress > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {inProgress} active
                </span>
              </div>
            )}
            {pending > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {pending} pending
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestone indicators for large progress bars */}
      {size === 'lg' && total > 5 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Start</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>Complete</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator; 