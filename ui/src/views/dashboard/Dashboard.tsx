import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
// @ts-ignore
import ReactApexChart from 'react-apexcharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Activity,
  Calendar,
  Target,
  PieChart,
  LineChart,
  MoreVertical,
  Download,
  Filter,
  Eye,
  Settings,
  BookOpen,
  FileText,
  Shield,
  Zap,
  ChevronDown,
  Search,
  Plus,
  XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useChartColors from '@hooks/useChartColors';
import useTranslation from '@hooks/useTranslation';
import { RootState } from 'src/slices/reducer';
import {
  getDashboardStats,
  getAudits,
  getTeamStatistics,
  getUsers,
  getAuditStatuses
} from '../../utils/api_service';

interface DashboardStats {
  total_checklists: number;
  completed: number;
  in_progress: number;
  overdue: number;
  completion_rate: number;
  average_completion_time: number;
  recent_activity: any[];
}

interface AuditData {
  id: number;
  title: string;
  status: string;
  audit_type: string;
  created_at: string;
  updated_at: string;
  period_from: string;
  period_to: string;
  assigned_users: any[];
}

interface TeamStats {
  total_teams: number;
  teams_by_type: { [key: string]: number };
  owned_teams: number;
  member_teams: number;
  active_teams: number;
}

// Component to handle dynamic direction changes
const DirectionHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { direction } = useSelector((state: RootState) => state.Layout);
  
  useEffect(() => {
    // Update document direction
    document.documentElement.dir = direction;
    document.documentElement.className = direction === 'rtl' ? 'rtl' : 'ltr';
  }, [direction]);

  return <>{children}</>;
};

const Dashboard: React.FC = () => {
  const { t, currentLanguage, changeLanguage, isLoading: translationLoading, isRTL } = useTranslation();
  const { direction } = useSelector((state: RootState) => state.Layout);

  // Generate comprehensive dummy data
  const generateDummyAudits = (): AuditData[] => {
    const auditTypes = ['financial', 'compliance', 'operational', 'it', 'internal', 'external', 'performance'];
    const statuses = ['draft', 'in_progress', 'review', 'completed', 'overdue', 'on_hold'];
    const companies = ['TechCorp', 'GlobalFinance', 'HealthPlus', 'RetailMax', 'ManufacturingLtd', 'ServicePro'];
    
    return Array.from({ length: 45 }, (_, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 180));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 15);
      
      return {
        id: i + 1,
        title: `${companies[Math.floor(Math.random() * companies.length)]} ${auditTypes[Math.floor(Math.random() * auditTypes.length)].charAt(0).toUpperCase() + auditTypes[Math.floor(Math.random() * auditTypes.length)].slice(1)} Audit ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        audit_type: auditTypes[Math.floor(Math.random() * auditTypes.length)],
        created_at: startDate.toISOString(),
        updated_at: new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())).toISOString(),
        period_from: startDate.toISOString(),
        period_to: endDate.toISOString(),
        assigned_users: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, j) => ({
          id: j + 1,
          name: `User ${j + 1}`,
          email: `user${j + 1}@company.com`
        }))
      };
    });
  };

  const generateDummyStats = (): DashboardStats => {
    return {
      total_checklists: 156,
      completed: 89,
      in_progress: 43,
      overdue: 12,
      completion_rate: 78.5,
      average_completion_time: 24.7,
      recent_activity: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Audit Activity ${i + 1}`,
        status: ['completed', 'in_progress', 'review'][Math.floor(Math.random() * 3)],
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
    };
  };

  const generateDummyTeamStats = (): TeamStats => {
    return {
      total_teams: 12,
      teams_by_type: {
        'Audit': 4,
        'Review': 3,
        'Management': 2,
        'Technical': 2,
        'Compliance': 1
      },
      owned_teams: 5,
      member_teams: 8,
      active_teams: 11
    };
  };

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(generateDummyStats());
  const [audits, setAudits] = useState<AuditData[]>(generateDummyAudits());
  const [teamStats, setTeamStats] = useState<TeamStats | null>(generateDummyTeamStats());
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Set to false to show dummy data immediately

  const [dateRange, setDateRange] = useState('7d');
  const [selectedView, setSelectedView] = useState<'overview' | 'gantt' | 'analytics'>('overview');

  const chartColors = useChartColors({
    chartColors: "[bg-primary-500, bg-success-500, bg-warning-500, bg-danger-500]",
    chartDarkColors: "[bg-primary-400, bg-success-400, bg-warning-400, bg-danger-400]"
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsData, auditsData, teamStatsData, usersData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getAudits().catch(() => []),
        getTeamStatistics().catch(() => null),
        getUsers().catch(() => [])
      ]);

      setDashboardStats(statsData);
      setAudits(auditsData);
      setTeamStats(teamStatsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  // Calculate comprehensive audit status distribution
  const getAuditStatusData = () => {
    // Enhanced status distribution with more realistic proportions
    const statusData = {
      'Completed': 35,
      'In Progress': 28,
      'Review': 15,
      'Draft': 8,
      'On Hold': 5,
      'Overdue': 4,
      'Cancelled': 3,
      'Archived': 2
    };
    
    return {
      series: Object.values(statusData),
      labels: Object.keys(statusData)
    };
  };

  // Calculate comprehensive audit type distribution
  const getAuditTypeData = () => {
    // Enhanced type distribution based on common audit patterns
    const typeData = {
      'Financial': 18,
      'Compliance': 15,
      'Operational': 12,
      'IT Security': 10,
      'Internal': 8,
      'Performance': 7,
      'External': 6,
      'Risk Management': 5,
      'Quality': 4,
      'Environmental': 3
    };
    
    return {
      series: Object.values(typeData),
      labels: Object.keys(typeData)
    };
  };

  // Generate risk level data
  const getRiskLevelData = () => {
    return {
      series: [25, 45, 30], // High, Medium, Low risk percentages
      labels: ['High Risk', 'Medium Risk', 'Low Risk']
    };
  };

  // Generate department performance data
  const getDepartmentPerformanceData = () => {
    const departments = [
      'Finance', 'Operations', 'IT', 'HR', 'Legal', 'Marketing', 'Sales', 'R&D'
    ];
    
    return {
      categories: departments,
      series: [
        {
          name: 'Completed Audits',
          data: departments.map(() => Math.floor(Math.random() * 20) + 5)
        },
        {
          name: 'Pending Audits',
          data: departments.map(() => Math.floor(Math.random() * 15) + 2)
        },
        {
          name: 'Overdue Audits',
          data: departments.map(() => Math.floor(Math.random() * 8))
        }
      ]
    };
  };

  // Generate monthly trends data
  const getMonthlyTrendsData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      categories: months,
      series: [
        {
          name: 'Audit Completion Rate',
          data: [75, 82, 78, 85, 88, 84, 91, 87, 83, 89, 92, 86]
        },
        {
          name: 'Average Response Time (Days)',
          data: [12, 10, 11, 8, 7, 9, 6, 8, 10, 7, 5, 7]
        }
      ]
    };
  };

  // Generate comprehensive timeline data for audits
  const getTimelineData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const timelineData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toISOString().split('T')[0];
    });

    // Generate more realistic data patterns
    const createdCounts = timelineData.map((date, index) => {
      // Simulate business patterns: lower on weekends, higher mid-week
      const dayOfWeek = new Date(date).getDay();
      const baseCount = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 3; // Weekend vs weekday
      const randomVariation = Math.floor(Math.random() * 4);
      const trendFactor = Math.sin(index / days * Math.PI * 2) * 2; // Cyclical trend
      return Math.max(0, Math.floor(baseCount + randomVariation + trendFactor));
    });

    const completedCounts = timelineData.map((date, index) => {
      // Completions typically lag behind creation
      const laggedIndex = Math.max(0, index - 5);
      const baseCount = createdCounts[laggedIndex] ? Math.floor(createdCounts[laggedIndex] * 0.7) : 0;
      const randomVariation = Math.floor(Math.random() * 3);
      return Math.max(0, baseCount + randomVariation);
    });

    const reviewCounts = timelineData.map((date, index) => {
      const baseCount = Math.floor(completedCounts[index] * 0.8);
      const randomVariation = Math.floor(Math.random() * 2);
      return Math.max(0, baseCount + randomVariation);
    });

    const overdueCount = timelineData.map(() => Math.floor(Math.random() * 3));

    return {
      categories: timelineData,
      series: [
        { name: 'Created', data: createdCounts },
        { name: 'Completed', data: completedCounts },
        { name: 'In Review', data: reviewCounts },
        { name: 'Overdue', data: overdueCount }
      ]
    };
  };

  // Enhanced Gantt chart data with more comprehensive project timelines
  const getGanttData = () => {
    const projects = [
      { name: 'Q4 Financial Audit', status: 'completed', duration: 45, delay: 0 },
      { name: 'IT Security Assessment', status: 'in_progress', duration: 30, delay: 0 },
      { name: 'Compliance Review - SOX', status: 'in_progress', duration: 60, delay: 5 },
      { name: 'Operational Efficiency Study', status: 'review', duration: 35, delay: 0 },
      { name: 'Risk Management Evaluation', status: 'draft', duration: 40, delay: 0 },
      { name: 'Quality Control Audit', status: 'overdue', duration: 25, delay: 12 },
      { name: 'Vendor Management Review', status: 'completed', duration: 20, delay: 0 },
      { name: 'HR Policy Compliance', status: 'in_progress', duration: 28, delay: 3 },
      { name: 'Data Privacy Assessment', status: 'on_hold', duration: 35, delay: 0 },
      { name: 'Environmental Impact Audit', status: 'planned', duration: 50, delay: 0 },
      { name: 'Procurement Process Review', status: 'in_progress', duration: 22, delay: 0 },
      { name: 'Customer Service Audit', status: 'review', duration: 18, delay: 2 },
      { name: 'Supply Chain Assessment', status: 'draft', duration: 42, delay: 0 },
      { name: 'Marketing Compliance Check', status: 'completed', duration: 15, delay: 0 },
      { name: 'Legal Documentation Review', status: 'overdue', duration: 30, delay: 8 }
    ];

    const ganttData = projects.map((project, index) => {
      const baseStartDate = new Date();
      baseStartDate.setDate(baseStartDate.getDate() - 60 + (index * 8)); // Stagger start dates
      
      const actualStartDate = new Date(baseStartDate);
      if (project.delay > 0) {
        actualStartDate.setDate(actualStartDate.getDate() + project.delay);
      }
      
      const endDate = new Date(actualStartDate);
      endDate.setDate(endDate.getDate() + project.duration);
      
      const getColor = (status: string) => {
        switch (status) {
          case 'completed': return '#10B981';
          case 'in_progress': return '#3B82F6';
          case 'review': return '#8B5CF6';
          case 'overdue': return '#EF4444';
          case 'on_hold': return '#F59E0B';
          case 'draft': return '#6B7280';
          case 'planned': return '#94A3B8';
          default: return '#6B7280';
        }
      };
      
      return {
        x: project.name,
        y: [actualStartDate.getTime(), endDate.getTime()],
        fillColor: getColor(project.status),
        goals: [
          {
            name: 'Target End',
            value: endDate.getTime(),
            strokeHeight: 5,
            strokeColor: '#775DD0'
          }
        ]
      };
    });

    return ganttData;
  };

  // Generate capacity planning data
  const getCapacityData = () => {
    const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon'];
    
    return {
      categories: teams,
      series: [
        {
          name: 'Current Workload (%)',
          data: [85, 92, 78, 68, 95]
        },
        {
          name: 'Planned Workload (%)',
          data: [95, 88, 85, 82, 90]
        }
      ]
    };
  };

  // Generate audit findings trends
  const getFindingsTrendsData = () => {
    return {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        {
          name: 'Critical Findings',
          data: [12, 8, 15, 10, 6, 9]
        },
        {
          name: 'High Priority',
          data: [25, 32, 28, 35, 29, 31]
        },
        {
          name: 'Medium Priority',
          data: [45, 52, 48, 55, 49, 53]
        },
        {
          name: 'Low Priority',
          data: [18, 22, 19, 25, 21, 24]
        }
      ]
    };
  };

  // Chart options
  const pieChartOptions: any = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: getAuditStatusData().labels,
    colors: chartColors,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + "%";
      }
    }
  };

  const lineChartOptions: any = {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false
      },
      toolbar: {
        show: true
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      },
    },
    xaxis: {
      categories: getTimelineData().categories,
      labels: {
        formatter: function (val: string) {
          return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
    },
    colors: chartColors.slice(0, 2)
  };

  const ganttOptions: any = {
    chart: {
      height: 450,
      type: 'rangeBar',
      toolbar: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '50%',
        rangeBarGroupRows: true
      }
    },
    colors: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
    fill: {
      type: 'solid'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: function (val: number) {
          return new Date(val).toLocaleDateString();
        }
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const startDate = new Date(data.y[0]);
        const endDate = new Date(data.y[1]);
        
        return `
          <div class="bg-white p-3 shadow-lg rounded-lg border">
            <div class="font-semibold text-gray-900">${data.x}</div>
            <div class="text-sm text-gray-600">
              ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
            </div>
          </div>
        `;
      }
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'increase' | 'decrease';
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, changeType, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'increase' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.stats.total_audits', 'Total Audits')}
          value={audits.length}
          change="+12%"
          changeType="increase"
          icon={<FileText className="w-6 h-6 text-white" />}
          color="bg-primary-500"
        />
        <StatCard
          title={t('dashboard.stats.active_audits', 'Active Audits')}
          value={audits.filter(a => a.status === 'in_progress').length}
          change="+8%"
          changeType="increase"
          icon={<Activity className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title={t('dashboard.stats.completed', 'Completed')}
          value={audits.filter(a => a.status === 'completed').length}
          change="+15%"
          changeType="increase"
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title={t('dashboard.stats.teams', 'Teams')}
          value={teamStats?.total_teams || 0}
          change="+3%"
          changeType="increase"
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audit Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.charts.audit_status_distribution', 'Audit Status Distribution')}
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <ReactApexChart
            options={pieChartOptions}
            series={getAuditStatusData().series}
            type="donut"
            height={350}
          />
        </div>

        {/* Audit Timeline */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.audit_timeline', 'Audit Timeline (30 Days)')}</h3>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <ReactApexChart
            options={lineChartOptions}
            series={getTimelineData().series}
            type="line"
            height={350}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Type Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.audit_types', 'Audit Types')}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ReactApexChart
            options={{
              chart: { type: 'bar', height: 300 },
              plotOptions: {
                bar: { horizontal: true, borderRadius: 4 }
              },
              xaxis: {
                categories: getAuditTypeData().labels
              },
              colors: chartColors,
              dataLabels: { enabled: false }
            }}
            series={[{ name: 'Count', data: getAuditTypeData().series }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Team Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.team_performance', 'Team Performance')}</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {teamStats?.teams_by_type && Object.entries(teamStats.teams_by_type).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${(count / (teamStats?.total_teams || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.recent_activity', 'Recent Activity')}</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {audits.slice(0, 5).map((audit, index) => (
              <div key={audit.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  audit.status === 'completed' ? 'bg-green-500' :
                  audit.status === 'in_progress' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {audit.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(audit.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  audit.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  audit.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {audit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGanttTab = () => (
    <div className="space-y-8">
      {/* Gantt Chart Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.audit_timeline_scheduling', 'Audit Timeline & Scheduling')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('dashboard.charts.visual_timeline_description', 'Visual timeline of all audit projects and their progress')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.legend.completed', 'Completed')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.legend.in_progress', 'In Progress')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.legend.overdue', 'Overdue')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.legend.planned', 'Planned')}</span>
          </div>
        </div>

        {/* Gantt Chart */}
        <ReactApexChart
          options={ganttOptions}
          series={[{ data: getGanttData() }]}
          type="rangeBar"
          height={450}
        />
      </div>

      {/* Gantt Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.summary.on_schedule', 'On Schedule')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {audits.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.summary.delayed', 'Delayed')}</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {audits.filter(a => a.status === 'overdue').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.summary.avg_duration', 'Avg Duration')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {dashboardStats?.average_completion_time ? Math.round(dashboardStats.average_completion_time) : 0}h
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.metrics.completion_rate', 'Completion Rate')}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {dashboardStats?.completion_rate ? Math.round(dashboardStats.completion_rate) : 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audit Completion Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.completion_trends', 'Completion Trends')}</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ReactApexChart
            options={{
              chart: { type: 'area', height: 350 },
              xaxis: { categories: getTimelineData().categories.slice(-14) },
              fill: { type: 'gradient' },
              colors: chartColors,
              dataLabels: { enabled: false }
            }}
            series={[{ 
              name: t('dashboard.metrics.completed_audits', 'Completed Audits'), 
              data: getTimelineData().series[1].data.slice(-14) 
            }]}
            type="area"
            height={350}
          />
        </div>

        {/* Risk Assessment */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.risk_assessment', 'Risk Assessment')}</h3>
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <ReactApexChart
            options={{
              chart: { type: 'radialBar', height: 350 },
              plotOptions: {
                radialBar: {
                  offsetY: 0,
                  startAngle: 0,
                  endAngle: 270,
                  hollow: {
                    margin: 5,
                    size: '30%',
                    background: 'transparent'
                  },
                  dataLabels: {
                    name: { show: false },
                    value: { show: false }
                  }
                }
              },
              colors: ['#ef4444', '#f59e0b', '#10b981'],
              labels: [t('dashboard.risk_levels.high_risk', 'High Risk'), t('dashboard.risk_levels.medium_risk', 'Medium Risk'), t('dashboard.risk_levels.low_risk', 'Low Risk')],
              legend: {
                show: true,
                floating: true,
                fontSize: '14px',
                position: 'left',
                offsetX: 160,
                offsetY: 15
              }
            }}
            series={[15, 35, 50]}
            type="radialBar"
            height={350}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.performance_metrics', 'Performance Metrics')}</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {Math.round((audits.filter(a => a.status === 'completed').length / audits.length) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.metrics.success_rate', 'Success Rate')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {audits.filter(a => a.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.metrics.active_audits', 'Active Audits')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(dashboardStats?.average_completion_time || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.metrics.avg_hours', 'Avg Hours')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {teamStats?.active_teams || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.metrics.active_teams', 'Active Teams')}</div>
          </div>
        </div>
      </div>

      {/* Department Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.department_performance', 'Department Performance')}</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {getDepartmentPerformanceData().categories.map((dept, index) => {
              const completed = getDepartmentPerformanceData().series[0].data[index];
              const pending = getDepartmentPerformanceData().series[1].data[index];
              const overdue = getDepartmentPerformanceData().series[2].data[index];
              const total = completed + pending + overdue;
              
              return (
                <div key={dept} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{total} {t('dashboard.metrics.audits', 'audits')}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="h-full flex rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(completed/total)*100}%` }}
                        title={`Completed: ${completed}`}
                      ></div>
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${(pending/total)*100}%` }}
                        title={`Pending: ${pending}`}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(overdue/total)*100}%` }}
                        title={`Overdue: ${overdue}`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-green-600">✓ {completed}</span>
                    <span className="text-blue-600">◐ {pending}</span>
                    <span className="text-red-600">⚠ {overdue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.team_capacity_planning', 'Team Capacity Planning')}</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {getCapacityData().categories.map((team, index) => {
              const current = getCapacityData().series[0].data[index];
              const planned = getCapacityData().series[1].data[index];
              
              return (
                <div key={team} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{team}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {current}% / {planned}%
                    </span>
                  </div>
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-full rounded-full ${
                        current > 90 ? 'bg-red-500' : 
                        current > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${current}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-full bg-blue-500 opacity-30 rounded-full border-2 border-blue-400"
                      style={{ width: `${planned}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{t('dashboard.metrics.current_load', 'Current Load')}</span>
                    <span className="text-blue-500">{t('dashboard.metrics.planned_capacity', 'Planned Capacity')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Findings Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.audit_findings_trends', 'Audit Findings Trends (Last 6 Months)')}</h3>
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        <ReactApexChart
          options={{
            chart: { type: 'line', height: 350, stacked: false },
            xaxis: { categories: getFindingsTrendsData().categories },
            colors: ['#ef4444', '#f59e0b', '#eab308', '#3b82f6'],
            stroke: { width: 3, curve: 'smooth' },
            dataLabels: { enabled: false },
            legend: { position: 'top' },
            yaxis: {
              title: { text: t('dashboard.metrics.number_of_findings', 'Number of Findings') }
            }
          }}
          series={getFindingsTrendsData().series}
          type="line"
          height={350}
        />
      </div>

      {/* Monthly Performance Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.monthly_performance_overview', 'Monthly Performance Overview')}</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <ReactApexChart
          options={{
            chart: { type: 'bar', height: 350 },
            xaxis: { categories: getMonthlyTrendsData().categories },
            colors: ['#10b981', '#3b82f6'],
                         plotOptions: {
               bar: { 
                 horizontal: false,
                 columnWidth: '55%',
                 borderRadius: 4
               }
             },
            dataLabels: { enabled: false },
            legend: { position: 'top' },
            yaxis: [
              {
                title: { text: t('dashboard.metrics.completion_rate', 'Completion Rate (%)') },
                min: 0,
                max: 100
              },
              {
                opposite: true,
                title: { text: t('dashboard.metrics.response_time', 'Response Time (Days)') },
                min: 0,
                max: 20
              }
            ]
          }}
          series={getMonthlyTrendsData().series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.loading.dashboard', 'Loading dashboard...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.title', 'Audit Management Dashboard')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('dashboard.description', 'Monitor audit progress, track performance, and manage timelines')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">{t('dashboard.date_range.last_7_days', 'Last 7 days')}</option>
                <option value="30d">{t('dashboard.date_range.last_30_days', 'Last 30 days')}</option>
                <option value="90d">{t('dashboard.date_range.last_90_days', 'Last 90 days')}</option>
                <option value="1y">{t('dashboard.date_range.last_year', 'Last year')}</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setSelectedView('overview')}
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('dashboard.tabs.overview', 'Overview')}</span>
            </button>
            
            <button
              onClick={() => setSelectedView('gantt')}
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'gantt'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('dashboard.tabs.gantt_chart', 'Gantt Chart')}</span>
            </button>
            
            <button
              onClick={() => setSelectedView('analytics')}
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'analytics'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('dashboard.tabs.analytics', 'Analytics')}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {selectedView === 'overview' && renderOverviewTab()}
        {selectedView === 'gantt' && renderGanttTab()}
        {selectedView === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
};

const DashboardWithDirection: React.FC = () => (
  // <DirectionHandler>
    <Dashboard />
  // </DirectionHandler>
);

export default DashboardWithDirection; 