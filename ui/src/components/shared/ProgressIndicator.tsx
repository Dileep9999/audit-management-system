import React from 'react';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Target, Activity } from 'lucide-react';

interface ProgressIndicatorProps {
  value: number; // 0-100
  total?: number;
  completed?: number;
  variant?: 'linear' | 'circular' | 'ring' | 'steps' | 'gauge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  animated?: boolean;
  thickness?: 'thin' | 'medium' | 'thick';
  gradient?: boolean;
  showMilestones?: boolean;
  milestones?: number[];
  status?: 'on-track' | 'at-risk' | 'behind' | 'ahead';
  className?: string;
}

interface CircularProgressProps {
  value: number;
  size: number;
  strokeWidth: number;
  color: string;
  gradient?: boolean;
  animated?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size,
  strokeWidth,
  color,
  gradient,
  animated
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${animated ? 'transition-all duration-1000 ease-out' : ''}`}
      >
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
        )}
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${animated ? 'transition-all duration-1000 ease-out' : ''}`}
          style={{
            filter: gradient ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'none'
          }}
        />
      </svg>
    </div>
  );
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  total,
  completed,
  variant = 'linear',
  size = 'md',
  showPercentage = true,
  showLabel = false,
  label,
  color = 'primary',
  animated = true,
  thickness = 'medium',
  gradient = false,
  showMilestones = false,
  milestones = [25, 50, 75],
  status,
  className = ''
}) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Color mapping
  const colorMap = {
    primary: {
      bg: 'bg-primary-500',
      text: 'text-primary-600',
      stroke: '#3B82F6',
      ring: 'ring-primary-500/20'
    },
    success: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      stroke: '#10B981',
      ring: 'ring-green-500/20'
    },
    warning: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-600',
      stroke: '#F59E0B',
      ring: 'ring-yellow-500/20'
    },
    danger: {
      bg: 'bg-red-500',
      text: 'text-red-600',
      stroke: '#EF4444',
      ring: 'ring-red-500/20'
    },
    info: {
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      stroke: '#06B6D4',
      ring: 'ring-blue-500/20'
    }
  };

  // Size mapping
  const sizeMap = {
    sm: { height: 'h-2', width: 60, stroke: 4 },
    md: { height: 'h-3', width: 80, stroke: 6 },
    lg: { height: 'h-4', width: 100, stroke: 8 },
    xl: { height: 'h-6', width: 120, stroke: 10 }
  };

  // Thickness mapping
  const thicknessMap = {
    thin: 'h-1',
    medium: 'h-2',
    thick: 'h-3'
  };

  // Status icon mapping
  const statusIcons = {
    'on-track': <CheckCircle className="w-4 h-4 text-green-500" />,
    'at-risk': <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    'behind': <Clock className="w-4 h-4 text-red-500" />,
    'ahead': <TrendingUp className="w-4 h-4 text-blue-500" />
  };

  const currentColor = colorMap[color];
  const currentSize = sizeMap[size];

  // Linear Progress Bar
  if (variant === 'linear') {
    return (
      <div className={`w-full ${className}`}>
        {(showLabel || status) && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {showLabel && label && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              )}
              {status && statusIcons[status]}
            </div>
            {showPercentage && (
              <span className={`text-sm font-semibold ${currentColor.text}`}>
                {clampedValue.toFixed(0)}%
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          <div className={`w-full ${thicknessMap[thickness]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
            <div
              className={`${thicknessMap[thickness]} ${currentColor.bg} rounded-full transition-all duration-1000 ease-out ${
                gradient ? 'bg-gradient-to-r from-opacity-60 to-opacity-100' : ''
              } ${animated ? 'animate-pulse' : ''}`}
              style={{ 
                width: `${clampedValue}%`,
                boxShadow: gradient ? `0 0 10px ${currentColor.stroke}40` : 'none'
              }}
            />
          </div>
          
          {/* Milestones */}
          {showMilestones && milestones.map((milestone, index) => (
            <div
              key={index}
              className="absolute top-0 w-0.5 h-full bg-gray-400 dark:bg-gray-500"
              style={{ left: `${milestone}%` }}
            >
              <div className="absolute -top-6 -left-2 text-xs text-gray-500 dark:text-gray-400">
                {milestone}%
              </div>
            </div>
          ))}
        </div>
        
        {(total && completed !== undefined) && (
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{completed} completed</span>
            <span>{total} total</span>
          </div>
        )}
      </div>
    );
  }

  // Circular Progress
  if (variant === 'circular') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative">
          <CircularProgress
            value={clampedValue}
            size={currentSize.width}
            strokeWidth={currentSize.stroke}
            color={currentColor.stroke}
            gradient={gradient}
            animated={animated}
          />
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {showPercentage && (
                <div className={`text-lg font-bold ${currentColor.text}`}>
                  {clampedValue.toFixed(0)}%
                </div>
              )}
              {status && (
                <div className="mt-1">
                  {statusIcons[status]}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {showLabel && label && (
          <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </div>
    );
  }

  // Ring Progress (Thin circular)
  if (variant === 'ring') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        <div className="relative">
          <CircularProgress
            value={clampedValue}
            size={40}
            strokeWidth={3}
            color={currentColor.stroke}
            gradient={gradient}
            animated={animated}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-semibold ${currentColor.text}`}>
              {clampedValue.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {showLabel && label && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
        
        {status && statusIcons[status]}
      </div>
    );
  }

  // Steps Progress
  if (variant === 'steps' && total) {
    const steps = Array.from({ length: total }, (_, i) => i + 1);
    const completedSteps = Math.floor((clampedValue / 100) * total);
    
    return (
      <div className={`w-full ${className}`}>
        {showLabel && label && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
            <span className={`text-sm font-semibold ${currentColor.text}`}>
              {completedSteps} of {total} completed
            </span>
          </div>
        )}
        
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    index < completedSteps
                      ? `${currentColor.bg} text-white shadow-lg ring-4 ${currentColor.ring}`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {index < completedSteps ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Step {step}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                    index < completedSteps - 1
                      ? currentColor.bg
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // Gauge Progress
  if (variant === 'gauge') {
    const gaugeValue = (clampedValue / 100) * 180; // 180 degrees for half circle
    
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative">
          <svg width="120" height="80" viewBox="0 0 120 80">
            {/* Background arc */}
            <path
              d="M 20 60 A 40 40 0 0 1 100 60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            
            {/* Progress arc */}
            <path
              d="M 20 60 A 40 40 0 0 1 100 60"
              stroke={currentColor.stroke}
              strokeWidth="8"
              fill="none"
              strokeDasharray="125.66" // Half circumference of circle with radius 40
              strokeDashoffset={125.66 - (clampedValue / 100) * 125.66}
              strokeLinecap="round"
              className={animated ? 'transition-all duration-1000 ease-out' : ''}
            />
            
            {/* Needle */}
            <line
              x1="60"
              y1="60"
              x2={60 + 35 * Math.cos((gaugeValue - 90) * (Math.PI / 180))}
              y2={60 + 35 * Math.sin((gaugeValue - 90) * (Math.PI / 180))}
              stroke={currentColor.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              className={animated ? 'transition-all duration-1000 ease-out' : ''}
            />
            
            {/* Center dot */}
            <circle
              cx="60"
              cy="60"
              r="3"
              fill={currentColor.stroke}
            />
          </svg>
          
          {/* Value display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className={`text-lg font-bold ${currentColor.text}`}>
              {clampedValue.toFixed(0)}%
            </div>
          </div>
        </div>
        
        {showLabel && label && (
          <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </div>
    );
  }

  return null;
};

export default ProgressIndicator; 