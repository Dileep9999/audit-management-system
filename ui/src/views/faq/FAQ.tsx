import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { RootState } from '@src/slices/reducer';
import { setFAQItems, setFAQCategories, deleteFAQItem } from '@src/slices/faq/reducer';
import { mockFAQItems, mockFAQCategories } from '@src/data/faq/mock_data';
import { FAQItem, FAQCategory } from '@src/dtos/apps/faq';
import AddEditFAQModal from './AddEditFAQModal';
import useTranslation from '@src/hooks/useTranslation';

const FAQ = () => {
  const dispatch = useDispatch();
  const { items: faqs, categories } = useSelector((state: RootState) => state.faq);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | undefined>(undefined);
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    // Initialize with mock data
    dispatch(setFAQItems(mockFAQItems));
    dispatch(setFAQCategories(mockFAQCategories));
  }, [dispatch]);

  const handleAddFAQ = () => {
    setEditingFAQ(undefined);
    setIsModalOpen(true);
  };

  const handleEditFAQ = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setIsModalOpen(true);
  };

  const handleDeleteFAQ = (id: string) => {
    if (window.confirm(t('faq.delete_confirm'))) {
      dispatch(deleteFAQItem(id));
    }
  };

  const toggleFAQ = (id: string) => {
    setSelectedFAQ(selectedFAQ === id ? null : id);
  };

  const getFAQsByCategory = (categoryId: string) => {
    return faqs.filter(faq => faq.category === categoryId && faq.isPublished);
  };

  return (
    <div className="container mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('faq.title')}</h1>
        <button
          onClick={handleAddFAQ}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          {t('faq.add_faq')}
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t('faq.description')}
      </p>

      <div className="space-y-8">
        {categories.map((category: FAQCategory) => (
          <div key={category.id} className="space-y-4">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
            
            <div className="space-y-4">
              {getFAQsByCategory(category.id).map((faq: FAQItem) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <div className="flex justify-between items-start">
                    <button
                      className="flex-1 flex items-center justify-between text-start"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      {selectedFAQ === faq.id ? (
                        <ChevronUp className={`h-5 w-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                      ) : (
                        <ChevronDown className={`h-5 w-5 ${isRTL ? 'transform rotate-180' : ''}`} />
                      )}
                    </button>
                    <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse mr-4' : 'ml-4'}`}>
                      <button
                        onClick={() => handleEditFAQ(faq)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title={t('faq.actions.edit')}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className="text-red-500 hover:text-red-700"
                        title={t('faq.actions.delete')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {selectedFAQ === faq.id && (
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 || faqs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{t('faq.no_faqs')}</p>
        </div>
      )}

      <AddEditFAQModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editMode={!!editingFAQ}
        currentFAQ={editingFAQ}
        categories={categories}
      />
    </div>
  );
};

export default FAQ; 