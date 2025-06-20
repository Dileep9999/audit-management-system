import React, { useState, useEffect } from 'react';
import { Modal } from '@src/components/custom/modal/modal';
import { useForm } from 'react-hook-form';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (auditData: { title: string; description: string }) => void;
  initialData?: {
    title: string;
    description: string;
  };
}

const NewAuditModal: React.FC<NewAuditModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ title: '', description: '' });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: { title: string; description: string }) => {
    onSubmit(data);
    reset({ title: '', description: '' }); // Reset form
    onClose();
  };

  const modalContent = (
    <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          {...register("title", { required: "Title is required" })}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          placeholder="Enter audit title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
          placeholder="Enter audit description"
          rows={4}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          {initialData ? 'Save Changes' : 'Create Audit'}
        </button>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="modal-center"
      size="modal-lg"
      title={initialData ? 'Edit Audit' : 'New Audit'}
      content={modalContent}
    />
  );
};

export default NewAuditModal; 