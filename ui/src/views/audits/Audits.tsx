import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getAudits, getAuditStatuses, deleteAudit } from '../../utils/api_service';
import ErrorToast from '../../components/custom/toast/errorToast';
import { toast } from 'react-hot-toast';

// Simple date formatter
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};

interface Audit {
    id: number;
    reference_number: string;
    title: string;
    audit_type: string;
    custom_audit_type: number | null;
    status: string; // Now dynamic workflow state name
    status_display: string;
    period_from: string;
    period_to: string;
    created_by_name: string;
    workflow_name?: string;
}

interface StatusOption {
    id: string;
    name: string;
}

// Delete confirmation modal component
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    auditTitle: string;
    auditReference: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    auditTitle,
    auditReference
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Delete Audit
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to delete the audit "{auditTitle}" ({auditReference})? 
                    This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// Dynamic status color assignment based on common status patterns
const getStatusStyling = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('draft') || statusLower.includes('plan')) {
        return {
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            textColor: 'text-blue-800 dark:text-blue-400'
        };
    } else if (statusLower.includes('progress') || statusLower.includes('active') || statusLower.includes('ongoing')) {
        return {
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            textColor: 'text-orange-800 dark:text-orange-400'
        };
    } else if (statusLower.includes('review') || statusLower.includes('pending')) {
        return {
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
            textColor: 'text-yellow-800 dark:text-yellow-400'
        };
    } else if (statusLower.includes('complete') || statusLower.includes('done') || statusLower.includes('finish')) {
        return {
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            textColor: 'text-green-800 dark:text-green-400'
        };
    } else if (statusLower.includes('closed') || statusLower.includes('archive')) {
        return {
            bgColor: 'bg-gray-100 dark:bg-gray-900/20',
            textColor: 'text-gray-800 dark:text-gray-400'
        };
    } else {
        // Default styling for unknown statuses
        return {
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            textColor: 'text-purple-800 dark:text-purple-400'
        };
    }
};

const Audits: React.FC = () => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [auditToDelete, setAuditToDelete] = useState<Audit | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [auditsData, statusesData] = await Promise.all([
                getAudits(),
                getAuditStatuses()
            ]);
            
            setAudits(auditsData);
            setAvailableStatuses(statusesData.data || []);
        } catch (error) {
            ErrorToast('Failed to load audit data');
            console.error('Error loading audit data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (audit: Audit) => {
        setAuditToDelete(audit);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!auditToDelete) return;

        setIsDeleting(true);
        try {
            await deleteAudit(auditToDelete.id);
            toast.success(`Audit "${auditToDelete.reference_number}" deleted successfully`);
            
            // Remove the deleted audit from the list
            setAudits(audits.filter(audit => audit.id !== auditToDelete.id));
            
            setDeleteModalOpen(false);
            setAuditToDelete(null);
        } catch (error: any) {
            console.error('Error deleting audit:', error);
            let errorMessage = 'Failed to delete audit';
            if (error?.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModalOpen(false);
        setAuditToDelete(null);
    };

    const getAuditTypeName = (audit: Audit) => {
        // Handle audit type display - prefer custom type name if available
        if (audit.custom_audit_type) {
            // If there's a custom audit type, we'd need the name from the API
            // For now, just show the audit_type
            return audit.audit_type;
        }
        return audit.audit_type;
    };

    // Filter audits based on search
    const filteredAudits = audits.filter(audit =>
        audit.reference_number.toLowerCase().includes(filter.toLowerCase()) ||
        audit.title.toLowerCase().includes(filter.toLowerCase()) ||
        getAuditTypeName(audit).toLowerCase().includes(filter.toLowerCase()) ||
        audit.status.toLowerCase().includes(filter.toLowerCase()) ||
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Workflow</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {filteredAudits.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-lg font-semibold text-gray-400">
                                                {loading ? 'Loading...' : 'No audits found'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAudits.map((audit) => {
                                    const statusStyling = getStatusStyling(audit.status);
                                    return (
                                        <tr
                                            key={audit.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                                <button
                                                        onClick={() => navigate(`/audits/${audit.id}`)}
                                                        className=" hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View audit"
                                                    >
                                                {audit.reference_number}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs">
                                                <button
                                                    onClick={() => navigate(`/audits/${audit.id}`)}
                                                    className="truncate text-left cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title={`View audit: ${audit.title}`}
                                                >
                                                    {audit.title}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {getAuditTypeName(audit)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyling.bgColor} ${statusStyling.textColor}`}>
                                                    {audit.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                {audit.workflow_name || 'No Workflow'}
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
                                                        title="View audit"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/audits/${audit.id}/edit`)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        title="Edit audit"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(audit)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Delete audit"
                                                        disabled={isDeleting}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                auditTitle={auditToDelete?.title || ''}
                auditReference={auditToDelete?.reference_number || ''}
            />
        </div>
    );
};

export default Audits; 