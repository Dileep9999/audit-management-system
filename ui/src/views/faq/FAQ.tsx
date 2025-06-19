import React from 'react';

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">FAQ</h1>
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          Add FAQ
        </button>
      </div>
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">What is an audit?</h3>
          <p className="text-gray-600 dark:text-gray-300">
            An audit is a systematic examination of records, procedures, and activities of an organization.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">How do I request an audit?</h3>
          <p className="text-gray-600 dark:text-gray-300">
            You can request an audit by clicking the "New Audit" button in the Audits section.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">How long does an audit take?</h3>
          <p className="text-gray-600 dark:text-gray-300">
            The duration of an audit varies depending on its scope and complexity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 