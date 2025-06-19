import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewAuditModal from '../../components/modals/NewAuditModal';
import { FileText, MoreVertical, Edit2, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Audit {
  id: number;
  title: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Pending' | 'On Hold' | 'Cancelled';
  date: string;
}

const statusOptions = [
  { value: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  { value: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { value: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { value: 'On Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  { value: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
];

const ITEMS_PER_PAGE = 7;

const Audits = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [statusDropdownId, setStatusDropdownId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [audits, setAudits] = useState<Audit[]>([
    {
      id: 1,
      title: 'Annual Security Review',
      description: 'Comprehensive security audit of all systems',
      status: 'In Progress',
      date: '2024-03-20'
    },
    {
      id: 2,
      title: 'Compliance Check',
      description: 'Regular compliance verification',
      status: 'Pending',
      date: '2024-03-21'
    },
    // Add more mock data for pagination testing
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 3,
      title: `Test Audit ${i + 3}`,
      description: `Description for audit ${i + 3}`,
      status: 'Pending' as const,
      date: '2024-03-22'
    }))
  ]);

  // Close status dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownId !== null && !(event.target as HTMLElement).closest('.status-dropdown')) {
        setStatusDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownId]);

  const handleNewAudit = (auditData: { title: string; description: string }) => {
    const newAudit: Audit = {
      id: audits.length + 1,
      title: auditData.title,
      description: auditData.description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setAudits([...audits, newAudit]);
  };

  const handleEditAudit = (auditData: { title: string; description: string }) => {
    if (editingAudit) {
      const updatedAudits = audits.map(audit => 
        audit.id === editingAudit.id 
          ? { ...audit, title: auditData.title, description: auditData.description }
          : audit
      );
      setAudits(updatedAudits);
      setEditingAudit(null);
    }
  };

  const handleDeleteAudit = (id: number) => {
    if (window.confirm('Are you sure you want to delete this audit?')) {
      const updatedAudits = audits.filter(audit => audit.id !== id);
      setAudits(updatedAudits);
    }
  };

  const handleStatusChange = (auditId: number, newStatus: Audit['status']) => {
    const updatedAudits = audits.map(audit =>
      audit.id === auditId ? { ...audit, status: newStatus } : audit
    );
    setAudits(updatedAudits);
    setStatusDropdownId(null);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption?.color || statusOptions[0].color;
  };

  // Pagination
  const totalPages = Math.ceil(audits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAudits = audits.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setStatusDropdownId(null); // Close any open status dropdowns
  };

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audits</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white bg-primary-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          New Audit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {currentAudits.map((audit) => (
                <tr
                  key={audit.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => {
                    if (!(e.target as HTMLElement).closest('.action-buttons, .status-dropdown')) {
                      navigate(`/audits/${audit.id}`);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{audit.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{audit.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{audit.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative status-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusDropdownId(statusDropdownId === audit.id ? null : audit.id);
                        }}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(audit.status)}`}
                      >
                        {audit.status}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      {statusDropdownId === audit.id && (
                        <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {statusOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(audit.id, option.value as Audit['status']);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${option.color} hover:bg-opacity-80`}
                                role="menuitem"
                              >
                                {option.value}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{audit.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAudit(audit);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAudit(audit.id);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/audits/${audit.id}`);
                        }}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentAudits.length < ITEMS_PER_PAGE && (
                <tr>
                  <td colSpan={5} className="px-6 py-4">
                    <div style={{ height: `${(ITEMS_PER_PAGE - currentAudits.length) * 73}px` }}></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(endIndex, audits.length)} of {audits.length} entries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="size-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <NewAuditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAudit(null);
        }}
        onSubmit={editingAudit ? handleEditAudit : handleNewAudit}
        initialData={editingAudit || undefined}
      />
    </div>
  );
};

export default Audits; 