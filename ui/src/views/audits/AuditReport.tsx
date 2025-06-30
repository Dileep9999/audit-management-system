import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Star,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAudit, getAuditTasks, getAuditFindings } from '../../utils/api_service';

interface AuditData {
  id: number;
  reference_number: string;
  title: string;
  audit_type: string;
  scope: string;
  objectives: string;
  status: string;
  period_from: string;
  period_to: string;
  created_at: string;
  updated_at: string;
  assigned_users: any[];
  workflow?: {
    name: string;
    description: string;
  };
}

interface TaskData {
  id: number;
  task_name: string;
  description: string;
  priority: string;
  risk_level: string;
  control_area: string;
  assigned_to_name: string | null;
  due_date: string | null;
  checklist: {
    status: string;
    completion_percentage: number;
    total_fields: number;
    completed_fields: number;
    template: {
      name: string;
      category: string;
    };
  };
}

interface FindingData {
  id: number;
  title: string;
  description: string;
  severity: string;
  finding_type: string;
  status: string;
  control_area: string;
  risk_level: string;
  assigned_to_name: string | null;
  due_date: string | null;
  created_at: string;
}

const AuditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [findings, setFindings] = useState<FindingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'findings' | 'analysis'>('overview');

  useEffect(() => {
    if (id) {
      loadReportData();
    }
  }, [id]);

  const loadReportData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [auditResponse, tasksResponse, findingsResponse] = await Promise.all([
        getAudit(parseInt(id)),
        getAuditTasks(parseInt(id)),
        getAuditFindings(parseInt(id)).catch(() => []) // Graceful fallback if findings API doesn't exist
      ]);
      
      setAuditData(auditResponse);
      setTasks(tasksResponse);
      setFindings(findingsResponse);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load audit report data');
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    // TODO: Implement PDF generation
    toast.success('PDF report generation feature coming soon');
  };

  const generateExcelReport = () => {
    // TODO: Implement Excel generation
    toast.success('Excel report generation feature coming soon');
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.checklist.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.checklist.status === 'in_progress').length;
  const pendingTasks = totalTasks - completedTasks - inProgressTasks;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalFindings = findings.length;
  const criticalFindings = findings.filter(f => f.severity === 'critical').length;
  const highFindings = findings.filter(f => f.severity === 'high').length;
  const openFindings = findings.filter(f => f.status === 'open').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading audit report...</p>
        </div>
      </div>
    );
  }

  if (!auditData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Audit not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The audit you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/audits')}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            Back to Audits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/audits/${id}`)}
                className="mr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audit Report - {auditData.reference_number}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {auditData.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDFReport}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF Report
              </button>
              <button
                onClick={generateExcelReport}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Excel Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'findings', label: 'Findings', icon: AlertCircle },
              { id: 'analysis', label: 'Analysis', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Executive Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(completionRate)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {openFindings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Open Findings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {criticalFindings + highFindings}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">High/Critical Issues</div>
                </div>
              </div>
            </div>

            {/* Audit Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Audit Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference Number</div>
                    <div className="text-lg text-gray-900 dark:text-white">{auditData.reference_number}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</div>
                    <div className="text-lg text-gray-900 dark:text-white capitalize">{auditData.audit_type}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
                    <div className="text-lg text-gray-900 dark:text-white">{auditData.status}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Period</div>
                    <div className="text-lg text-gray-900 dark:text-white">
                      {new Date(auditData.period_from).toLocaleDateString()} - {new Date(auditData.period_to).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</div>
                    <div className="text-lg text-gray-900 dark:text-white">
                      {new Date(auditData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Size</div>
                    <div className="text-lg text-gray-900 dark:text-white">{auditData.assigned_users.length} members</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Scope</div>
                  <div className="text-gray-900 dark:text-white mt-1">{auditData.scope}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Objectives</div>
                  <div className="text-gray-900 dark:text-white mt-1">{auditData.objectives}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Task Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTasks}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Tasks</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inProgressTasks}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingTasks}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 text-gray-900 dark:text-white">Task</th>
                      <th className="text-left py-3 text-gray-900 dark:text-white">Priority</th>
                      <th className="text-left py-3 text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 text-gray-900 dark:text-white">Progress</th>
                      <th className="text-left py-3 text-gray-900 dark:text-white">Assigned To</th>
                      <th className="text-left py-3 text-gray-900 dark:text-white">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{task.task_name}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs">{task.checklist.template.name}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.checklist.status)}`}>
                            {task.checklist.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${task.checklist.completion_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs">{Math.round(task.checklist.completion_percentage)}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {task.assigned_to_name || 'Unassigned'}
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Findings Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalFindings}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Critical</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highFindings}</div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">High</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFindings}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Findings</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{openFindings}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Open</div>
                </div>
              </div>

              {findings.length > 0 ? (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{finding.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{finding.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(finding.status)}`}>
                            {finding.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Type: {finding.finding_type.replace('_', ' ')}</span>
                        <span>Control Area: {finding.control_area}</span>
                        <span>Assigned: {finding.assigned_to_name || 'Unassigned'}</span>
                        {finding.due_date && (
                          <span>Due: {new Date(finding.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No findings recorded for this audit.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Risk Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Task Risk Distribution</h3>
                  <div className="space-y-3">
                    {['critical', 'high', 'medium', 'low'].map((risk) => {
                      const count = tasks.filter(t => t.risk_level === risk).length;
                      const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                      return (
                        <div key={risk} className="flex items-center justify-between">
                          <span className="capitalize text-gray-700 dark:text-gray-300">{risk} Risk</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  risk === 'critical' ? 'bg-red-500' :
                                  risk === 'high' ? 'bg-orange-500' :
                                  risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Control Areas</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(tasks.map(t => t.control_area || 'General'))).map((area) => {
                      const count = tasks.filter(t => (t.control_area || 'General') === area).length;
                      return (
                        <div key={area} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{area}</span>
                          <span className="text-gray-600 dark:text-gray-400">{count} tasks</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recommendations</h2>
              
              <div className="space-y-4">
                {completionRate < 50 && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-300">Low Completion Rate</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-400">
                        Consider reviewing task assignments and deadlines to improve completion rate.
                      </div>
                    </div>
                  </div>
                )}
                
                {criticalFindings > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-300">Critical Findings Detected</div>
                      <div className="text-sm text-red-700 dark:text-red-400">
                        Immediate attention required for {criticalFindings} critical finding(s).
                      </div>
                    </div>
                  </div>
                )}
                
                {openFindings === 0 && totalFindings > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-300">All Findings Addressed</div>
                      <div className="text-sm text-green-700 dark:text-green-400">
                        Excellent work! All identified findings have been resolved.
                      </div>
                    </div>
                  </div>
                )}
                
                {totalTasks > 0 && completionRate === 100 && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Star className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-300">Audit Complete</div>
                      <div className="text-sm text-green-700 dark:text-green-400">
                        All audit tasks have been completed. Ready for final review.
                      </div>
                    </div>
                  </div>
                )}
                
                {totalTasks === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-300">No Tasks Created</div>
                      <div className="text-sm text-blue-700 dark:text-blue-400">
                        Consider creating audit tasks using checklist templates to structure the audit process.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditReport; 