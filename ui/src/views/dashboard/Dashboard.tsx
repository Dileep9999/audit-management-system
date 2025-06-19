import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Total Audits</h2>
          <p className="text-4xl font-bold text-primary-500">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Active Audits</h2>
          <p className="text-4xl font-bold text-green-500">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <p className="text-4xl font-bold text-yellow-500">0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 