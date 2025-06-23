import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getAudits } from '../../utils/api_service';
import ErrorToast from '../../components/custom/toast/errorToast';

// Simple date formatter
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

interface Audit {
    id: number;
    reference_number: string;
    title: string;
    audit_type: string;
    audit_type_display: string;
    custom_audit_type: number | null;
    custom_audit_type_name: string | null;
    status: AuditStatusType;
    status_display: string;
    period_from: string;
    period_to: string;
    created_by_name: string;
}

type AuditStatusType = 'planned' | 'in_progress' | 'completed' | 'closed';

interface AuditStatusConfig {
    color: string;
    bgColor: string;
    textColor: string;
    display: string;
}

// Static data for audit statuses with proper styling
const AUDIT_STATUSES: Record<AuditStatusType, AuditStatusConfig> = {
    planned: { 
        color: 'blue', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/20', 
        textColor: 'text-blue-800 dark:text-blue-400',
        display: 'Planned' 
    },
    in_progress: { 
        color: 'orange', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/20', 
        textColor: 'text-orange-800 dark:text-orange-400',
        display: 'In Progress' 
    },
    completed: { 
        color: 'green', 
        bgColor: 'bg-green-100 dark:bg-green-900/20', 
        textColor: 'text-green-800 dark:text-green-400',
        display: 'Completed' 
    },
    closed: { 
        color: 'gray', 
        bgColor: 'bg-gray-100 dark:bg-gray-900/20', 
        textColor: 'text-gray-800 dark:text-gray-400',
        display: 'Closed' 
    }
};

const Audits: React.FC = () => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const auditsData = await getAudits();
            setAudits(auditsData);
        } catch (error) {
            ErrorToast('Failed to load audit data');
            console.error('Error loading audit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAuditTypeName = (audit: Audit) => {
        return audit.custom_audit_type_name || audit.audit_type_display;
    };

    const getStatusConfig = (status: AuditStatusType) => {
        return AUDIT_STATUSES[status] || AUDIT_STATUSES.planned;
    };

    // Filter audits based on search
    const filteredAudits = audits.filter(audit =>
        audit.reference_number.toLowerCase().includes(filter.toLowerCase()) ||
        audit.title.toLowerCase().includes(filter.toLowerCase()) ||
        getAuditTypeName(audit).toLowerCase().includes(filter.toLowerCase()) ||
        audit.status_display.toLowerCase().includes(filter.toLowerCase()) ||
        audit.created_by_name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    };

    return (
        <div className="p-4 relative min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <div className="flex items-center justify-between w-full">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audits</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadData}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Refresh audits"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Filter by reference, title, type, status, creator..."
                        value={filter}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded px-3 py-2 w-64 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        onClick={() => navigate('/audits/new')}
                    >
                        <PlusIcon className="w-4 h-4" />
                        New Audit
                    </button>
                </div>
            </div>

            {loading && <div className="text-center py-8">Loading audits...</div>}
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden min-h-[400px] flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {filteredAudits.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-lg font-semibold text-gray-400">
                                                {loading ? 'Loading...' : 'No audits found'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAudits.map((audit) => {
                                    const statusConfig = getStatusConfig(audit.status);
                                    return (
                                        <tr
                                            key={audit.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                                {audit.reference_number}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs">
                                                <div className="truncate" title={audit.title}>
                                                    {audit.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {getAuditTypeName(audit)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                                    {audit.status_display}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {formatDate(audit.period_from)} - {formatDate(audit.period_to)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {audit.created_by_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/audits/${audit.id}`)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/audits/${audit.id}/edit`)}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Audits; 