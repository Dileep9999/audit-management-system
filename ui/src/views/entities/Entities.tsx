import React from 'react';

const Entities = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Entities</h1>
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          Add Entity
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">IT Department</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Information Technology team responsible for system maintenance and security.
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Members: 0</span>
            <span>Audits: 0</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Finance Department</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Finance and accounting team managing company's financial operations.
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Members: 0</span>
            <span>Audits: 0</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">HR Department</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Human Resources team managing employee relations and recruitment.
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Members: 0</span>
            <span>Audits: 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entities; 