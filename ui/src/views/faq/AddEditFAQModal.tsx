import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Modal } from "@src/components/custom/modal/modal";
import { FAQItem, FAQCategory } from "@src/dtos/apps/faq";
import { addFAQItem, updateFAQItem } from "@src/slices/faq/reducer";
import Select, { SingleValue } from "react-select";
import { X } from "lucide-react";
import useTranslation from "@src/hooks/useTranslation";

interface OptionType {
  label: string;
  value: string;
}

interface AddEditFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: boolean;
  currentFAQ?: FAQItem;
  categories: FAQCategory[];
}

const AddEditFAQModal: React.FC<AddEditFAQModalProps> = ({
  isOpen,
  onClose,
  editMode,
  currentFAQ,
  categories,
}) => {
  const dispatch = useDispatch();
  const { t, isRTL } = useTranslation();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FAQItem>();

  const categoryOptions: OptionType[] = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  useEffect(() => {
    if (currentFAQ && editMode) {
      reset(currentFAQ);
    } else {
      reset({
        question: "",
        answer: "",
        category: "",
        isPublished: true,
        order: 1,
      } as Partial<FAQItem>);
    }
  }, [currentFAQ, editMode, reset]);

  const onSubmit = (data: Partial<FAQItem>) => {
    const timestamp = new Date().toISOString();
    if (editMode && currentFAQ) {
      dispatch(
        updateFAQItem({
          ...currentFAQ,
          ...data,
          updatedAt: timestamp,
        } as FAQItem)
      );
    } else {
      dispatch(
        addFAQItem({
          ...data,
          id: `faq-${Date.now()}`,
          createdAt: timestamp,
          updatedAt: timestamp,
        } as FAQItem)
      );
    }
    onClose();
  };

  const modalContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <label className="block text-sm font-medium mb-1">{t('faq.form.question.label')}</label>
        <input
          {...register("question", { required: t('faq.form.question.required') })}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          placeholder={t('faq.form.question.placeholder')}
        />
        {errors.question && (
          <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('faq.form.answer.label')}</label>
        <textarea
          {...register("answer", { required: t('faq.form.answer.required') })}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
          placeholder={t('faq.form.answer.placeholder')}
        />
        {errors.answer && (
          <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('faq.form.category.label')}</label>
        <Select
          options={categoryOptions}
          value={categoryOptions.find(
            (opt) => opt.value === currentFAQ?.category
          )}
          onChange={(selected: SingleValue<OptionType>) => {
            setValue("category", selected?.value || "");
          }}
          className="dark:bg-gray-700"
          placeholder={t('faq.form.category.placeholder')}
          isRtl={isRTL}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register("isPublished")}
          className={`${isRTL ? 'ml-2' : 'mr-2'}`}
          id="isPublished"
        />
        <label htmlFor="isPublished" className="text-sm">
          {t('faq.form.published')}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('faq.form.display_order.label')}</label>
        <input
          type="number"
          {...register("order", { min: { value: 1, message: t('faq.form.display_order.min') } })}
          className="w-24 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          min="1"
        />
      </div>

      <div className={`flex ${isRTL ? 'justify-start space-x-reverse' : 'justify-end space-x-3'} pt-4 border-t dark:border-gray-700`}>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {t('faq.modal.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          {editMode ? t('faq.modal.update') : t('faq.modal.create')}
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
      title={editMode ? t('faq.modal.edit_title') : t('faq.modal.add_title')}
      content={modalContent}
    />
  );
};

export default AddEditFAQModal; 