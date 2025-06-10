import { AppDispatch } from "@src/slices/reducer";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { ExamSchedule } from "@src/dtos";
import { addExamListData, editExamListData } from "@src/slices/thunk";
import { Modal } from "@src/components/custom/modal/modal";
import Flatpickr from "react-flatpickr";
import Select, { SingleValue } from "react-select";
import { Plus, X } from "lucide-react";

interface OptionType {
  label: string;
  value: string;
}

const categoryItems: OptionType[] = [
  { label: "Final Test", value: "Final Test" },
  { label: "Practice Test", value: "Practice Test" },
  { label: "Midterm Test", value: "Midterm Test" },
  { label: "Quarterly Test", value: "Quarterly Test" },
];

const testType: OptionType[] = [
  { label: "General", value: "General" },
  { label: "Formative", value: "Formative" },
  { label: "Summative", value: "Summative" },
  { label: "Online", value: "Online" },
  { label: "Rejoining", value: "Rejoining" },
];

const stdClass: OptionType[] = [
  { label: "STD 6", value: "6" },
  { label: "STD 7", value: "7" },
  { label: "STD 8", value: "8" },
  { label: "STD 9", value: "9" },
  { label: "STD 10", value: "10" },
  { label: "STD 11", value: "11" },
  { label: "STD 12", value: "12" },
];

const examStatusOption: OptionType[] = [
  { label: "New", value: "New" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "Completed", value: "Completed" },
];

const AddEditExamSchedule = ({
  modalState,
  closeModal,
  examList,
  editMode,
  currentExam,
}: any) => {
  const dispatch: AppDispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [categoryList, setCategoryList] =
    useState<SingleValue<OptionType> | null>(null);
  const [testTypes, setTestTypes] = useState<SingleValue<OptionType> | null>(
    null,
  );
  const [studentClass, setStudentClass] =
    useState<SingleValue<OptionType> | null>(null);
  const [examStatus, setExamStatus] = useState<SingleValue<OptionType> | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ExamSchedule>();

  useEffect(() => {
    clearErrors();
    if (editMode && currentExam) {
      Object.keys(currentExam).forEach((key) => {
        setValue(key as keyof ExamSchedule, (currentExam as any)[key]);
      });
      setSelectedDate(
        currentExam.startDate ? new Date(currentExam.startDate) : null,
      );
      setSelectedEndDate(
        currentExam.endDate ? new Date(currentExam.endDate) : null,
      );
      setCategoryList(
        categoryItems.find((item) => item.value === currentExam.testCategory) ||
          null,
      );
      setTestTypes(
        testType.find((item) => item.value === currentExam.testType) || null,
      );
      setStudentClass(
        stdClass.find((item) => item.value === currentExam.class) || null,
      );
      setExamStatus(
        examStatusOption.find((item) => item.value === currentExam.status) ||
          null,
      );
    } else {
      reset({
        _id: 0,
        testId: "",
        testName: "",
        testCategory: "",
        testType: "",
        class: "",
        startDate: "",
        endDate: "",
        status: "",
      });
      setSelectedDate(null);
      setSelectedEndDate(null);
      setCategoryList(null);
      setTestTypes(null);
      setStudentClass(null);
      setExamStatus(null);
    }
  }, [editMode, currentExam, setValue, reset, clearErrors]);

  const generateNewExamId = (examList: any) => {
    const maxExamId =
      examList.length > 0
        ? Math.max(
            ...examList.map((exam: any) => {
              const numericPart = parseInt(exam.testId.split("-")[1], 10);
              return isNaN(numericPart) ? 0 : numericPart;
            }),
          )
        : 0;
    const newExamId = maxExamId + 1;
    return `PEE-${newExamId}`;
  };

  const submitForm = (data: ExamSchedule, onClose: () => void) => {
    clearErrors();
    if (editMode && currentExam) {
      const updatedStaffList: ExamSchedule = { ...data };
      dispatch(editExamListData(updatedStaffList));
    } else {
      const newExamId = generateNewExamId(examList);
      const newExam = {
        ...data,
        testId: newExamId,
      };
      dispatch(addExamListData(newExam));
    }
    reset();
    onClose();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed, so add 1) and pad with leading zero
    const day = String(date.getDate()).padStart(2, "0"); // Pad day with leading zero
    return `${year}-${month}-${day}`;
  };

  const handleCloseModal = (modal: string) => {
    closeModal(modal);
    clearErrors();
  };

  return (
    <React.Fragment>
      <Modal
        isOpen={
          editMode ? modalState.showEditExamForm : modalState.showAddExamForm
        }
        onClose={() =>
          handleCloseModal(editMode ? "showEditExamForm" : "showAddExamForm")
        }
        position="modal-center"
        title={editMode ? "Edit Exam" : "Add Exam"}
        id={editMode ? "showEditExamForm" : "showAddExamForm"}
        contentClass="modal-content"
        content={(onClose) => (
          <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label htmlFor="testNameInput" className="form-label">
                  Test Name
                </label>
                <input
                  type="text"
                  id="testNameInput"
                  className="form-input"
                  placeholder="Test name"
                  {...register("testName", {
                    required: "Test Name is required.",
                  })}
                />
                {errors.testName && (
                  <span className="text-red-500">
                    {errors.testName.message}
                  </span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="testCategorySelect" className="form-label">
                  Test Category
                </label>
                <Controller
                  name="testCategory"
                  control={control}
                  rules={{ required: "Test Categoryis required." }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={categoryItems}
                      value={categoryList}
                      onChange={(selected) => {
                        setCategoryList(selected);
                        onChange(selected?.value);
                      }}
                      placeholder="Select Test Category"
                      id="testCategorySelect"
                    />
                  )}
                />
                {errors.testCategory && (
                  <span className="text-red-500">
                    {errors.testCategory.message}
                  </span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="testTypeSelect" className="form-label">
                  Test Type
                </label>
                <Controller
                  name="testType"
                  control={control}
                  rules={{ required: "Test Type required." }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={testType}
                      value={testTypes}
                      onChange={(selected) => {
                        setTestTypes(selected);
                        onChange(selected?.value);
                        clearErrors("testType");
                      }}
                      placeholder="Select Test Type"
                      id="testTypeSelect"
                    />
                  )}
                />
                {errors.testType && (
                  <span className="text-red-500">
                    {errors.testType.message}
                  </span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="classNameSelect" className="form-label">
                  Class
                </label>
                <Controller
                  name="class"
                  control={control}
                  rules={{ required: "class is required." }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={stdClass}
                      value={studentClass}
                      onChange={(selected) => {
                        setStudentClass(selected);
                        onChange(selected?.value);
                        clearErrors("class");
                      }}
                      placeholder="Select Class"
                      id="classNameSelect"
                    />
                  )}
                />
                {errors.class && (
                  <span className="text-red-500">{errors.class.message}</span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="startDateSelect" className="form-label">
                  Start Date
                </label>
                <Flatpickr
                  id="startDateSelect"
                  className="form-input"
                  placeholder="Select start date"
                  value={selectedDate || undefined}
                  options={{ mode: "single" }}
                  onChange={(date: any) => {
                    const formattedDate = formatDate(date[0]);
                    setValue("startDate", formattedDate);
                    setSelectedDate(date[0]);
                    clearErrors("startDate");
                  }}
                />
                <input
                  type="hidden"
                  {...register("startDate", {
                    required: "startDate is required.",
                  })}
                />
                {errors.startDate && (
                  <span className="text-red-500">
                    {errors.startDate.message}
                  </span>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="endDateSelect" className="form-label">
                  End Date
                </label>
                <Flatpickr
                  id="endDateSelect"
                  className="form-input"
                  placeholder="Select end date"
                  value={selectedEndDate || undefined}
                  options={{ mode: "single" }}
                  onChange={(date: any) => {
                    const formattedDate = formatDate(date[0]);
                    setValue("endDate", formattedDate);
                    setSelectedEndDate(date[0]);
                    clearErrors("endDate");
                  }}
                />
                <input
                  type="hidden"
                  {...register("endDate", { required: "endDate is required." })}
                />
                {errors.endDate && (
                  <span className="text-red-500">{errors.endDate.message}</span>
                )}
              </div>
              <div className="col-span-12">
                <label htmlFor="examStatusSelect" className="form-label">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "status is required." }}
                  render={({ field: { onChange } }) => (
                    <Select
                      classNamePrefix="select"
                      options={examStatusOption}
                      value={examStatus}
                      onChange={(selected) => {
                        setExamStatus(selected);
                        onChange(selected?.value);
                        clearErrors("status");
                      }}
                      placeholder="Select Exam Status"
                      id="examStatusSelect"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-red-500">{errors.status.message}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                className="btn btn-active-red"
                onClick={onClose}
              >
                <X className="inline-block size-4" />
                Close
              </button>
              <button className="btn btn-primary" type="submit">
                <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                {editMode ? "Update Exam Schedule" : "Add Exam Schedule"}
              </button>
            </div>
          </form>
        )}
      />
    </React.Fragment>
  );
};

export default AddEditExamSchedule;
