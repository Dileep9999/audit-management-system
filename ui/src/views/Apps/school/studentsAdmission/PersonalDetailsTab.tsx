import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { StudentList } from "@src/dtos";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@src/slices/reducer";
import {
  addStudentListData,
  editStudentListData,
  getStudentListData,
} from "@src/slices/thunk";
import Flatpickr from "react-flatpickr";
import { MoveLeft, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OptionType {
  label: string;
  value: string;
}

const genderOptions: OptionType[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Others", value: "Others" },
];

const PersonalDetailsTab = () => {
  const { editMode, currentStudent, studentList } = useSelector(
    (state: RootState) => state.StudentList,
  );
  const dispatch = useDispatch<AppDispatch>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedJoiningDate, setSelectedJoiningDate] = useState<
    Date | undefined
  >(undefined);
  const [selectedGender, setSelectedGender] = useState<OptionType | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!studentList) {
      dispatch(getStudentListData());
    }
  }, [studentList, dispatch]);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    setError,
    reset,
    formState: { errors },
  } = useForm<StudentList>({
    mode: "onChange",
  });

  const getSelectedGenderOption = (gender: string | undefined) => {
    return genderOptions.find((option) => option.value === gender) || null;
  };

  const generateNewStudentId = (studentList: any) => {
    const maxStudentId =
      studentList.length > 0
        ? Math.max(
            ...studentList.map((student: any) => {
              const numericPart = parseInt(student.studentId.split("-")[1], 10);
              return isNaN(numericPart) ? 0 : numericPart;
            }),
          )
        : 0;
    const newStudentId = maxStudentId + 1;
    return `PES-${newStudentId}`;
  };

  const resetForm = useCallback(() => {
    reset({
      _id: studentList && studentList.length > 0 ? studentList.length + 1 : 1,
      studentId: "",
      studentName: "",
      middleName: "",
      lastName: "",
      image: "https://images.kcubeinfotech.com/domiex/images/avatar/user-3.png",
      gender: "",
      rollNo: "",
      age: "",
      class: "",
      email: "",
      phone: "",
      alternativePhone: "",
      nationality: "",
      birthDate: "",
      address: "",
      city: "",
      country: "",
      date: "",
      pinCode: "",
    });
    setSelectedGender(null);
  }, [reset, studentList]);

  const validatePhoneNumber = (value: string) => {
    const phoneNumberPattern = /^\d{10}$/; // Only 10 digits
    return (
      phoneNumberPattern.test(value) ||
      "Phone number must be exactly 10 digits."
    );
  };

  const submitForm = (data: StudentList) => {
    clearErrors();
    if (editMode && currentStudent) {
      const updatedStudent = {
        ...currentStudent, // Preserve current student properties
        ...data, // Update with new form data
        image:
          "https://images.kcubeinfotech.com/domiex/images/avatar/user-3.png",
      };
      dispatch(editStudentListData(updatedStudent));
      navigate("/apps/school/students-list");
    } else {
      const newStudentId = generateNewStudentId(studentList);
      const newStudent = {
        ...data,
        studentId: newStudentId,
        _id:
          studentList.length > 0
            ? Math.max(...studentList.map((s: any) => s._id)) + 1
            : 1, // Auto-increment _id
      };
      dispatch(addStudentListData(newStudent));
      navigate("/apps/school/students-list");
      resetForm();
    }
  };

  useEffect(() => {
    if (editMode && currentStudent) {
      setValue("studentName", currentStudent.studentName || "");
      setValue("middleName", currentStudent.middleName || "");
      setValue("lastName", currentStudent.lastName || "");
      setValue("gender", currentStudent.gender || "");
      setValue("rollNo", currentStudent.rollNo || "");
      setValue("age", currentStudent.age || "");
      setValue("class", currentStudent.class || "");
      setValue("email", currentStudent.email || "");
      setValue("phone", currentStudent.phone || "");
      setValue("alternativePhone", currentStudent.alternativePhone || "");
      setValue("nationality", currentStudent.nationality || "");
      setValue("birthDate", currentStudent.birthDate || "");
      setValue("address", currentStudent.address || "");
      setValue("city", currentStudent.city || "");
      setValue("country", currentStudent.country || "");
      setValue("pinCode", currentStudent.pinCode || "");

      setSelectedDate(
        currentStudent.birthDate
          ? new Date(currentStudent.birthDate)
          : undefined,
      );
      setSelectedJoiningDate(
        currentStudent.date ? new Date(currentStudent.date) : undefined,
      );
      setSelectedGender(getSelectedGenderOption(currentStudent.gender));
    } else {
      resetForm();
    }
  }, [resetForm, currentStudent, editMode, setValue]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("en-GB", options).replace(",", "");
  };

  const handleGenderChange = (selectedOption: OptionType | null) => {
    setSelectedGender(selectedOption); // Update selected gender
    setValue("gender", selectedOption?.value || ""); // Set value in the form state
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(submitForm)}>
        <h6 className="mb-3">Personal Details</h6>
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="firstNameInput" className="form-label">
              First Name
            </label>
            <input
              type="text"
              id="firstNameInput"
              className="form-input"
              placeholder="Enter your first name"
              {...register("studentName", {
                required: "Student Name is required.",
              })}
            />
            {errors.studentName && (
              <span className="text-red-500">{errors.studentName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="middleNameInput" className="form-label">
              Middle Name
            </label>
            <input
              type="text"
              id="middleNameInput"
              className="form-input"
              placeholder="Enter your middle name"
              {...register("middleName", {
                required: "Middle  Name is required.",
              })}
            />
            {errors.middleName && (
              <span className="text-red-500">{errors.middleName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="lastNameInput" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="lastNameInput"
              className="form-input"
              placeholder="Enter your last name"
              {...register("lastName", { required: "Last Name is required." })}
            />
            {errors.lastName && (
              <span className="text-red-500">{errors.lastName.message}</span>
            )}
          </div>
          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="genderSelect" className="form-label">
              Gender
            </label>
            <div id="genderSelect">
              <Select
                classNamePrefix="select"
                id="genderSelect"
                options={genderOptions}
                value={selectedGender}
                onChange={(value) => {
                  handleGenderChange(value); // Your existing change handler
                  clearErrors("gender"); // Clear error when a gender is selected
                }}
                placeholder="Select Gender"
              />
              <input
                type="hidden"
                {...register("gender", { required: "Gender is required." })}
              />
              {errors.gender && (
                <span className="text-red-500">{errors.gender.message}</span>
              )}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="ageInput" className="form-label">
              Age
            </label>
            <input
              type="number"
              id="ageInput"
              className="form-input"
              placeholder="Enter your age"
              {...register("age", { required: "Age is required." })}
            />
            {errors.age && (
              <span className="text-red-500">{errors.age.message}</span>
            )}
          </div>

          <div className="col-span-12 sm:col-span-6 2xl:col-span-4">
            <label htmlFor="joiningDate" className="form-label">
              Date of Birth
            </label>
            <Flatpickr
              id="joiningDate"
              className="form-input"
              placeholder="Select date"
              value={selectedDate || undefined}
              options={{
                mode: "single",
              }}
              onChange={(date: any) => {
                const formattedDate = formatDate(date[0]);
                setSelectedDate(date[0]);
                setValue("birthDate", formattedDate);
                clearErrors("birthDate");
              }}
            />
            <input
              type="hidden"
              {...register("birthDate", { required: "BirthDate is required." })}
            />
            {errors.birthDate && (
              <span className="text-red-500">{errors.birthDate.message}</span>
            )}
          </div>
        </div>

        <h6 className="mt-6 mb-3">Contact Details</h6>
        <div className="grid grid-cols-12 gap-space">
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="mobileNumberInput" className="form-label">
              Mobile Number
            </label>
            <input
              type="number"
              id="mobileNumberInput"
              className="form-input"
              placeholder="Enter your mobile number"
              {...register("phone", {
                required: "Phone Number is required.",
                validate: (value) => {
                  const isValid = validatePhoneNumber(value);
                  if (typeof isValid === "string") {
                    setError("phone", { type: "manual", message: isValid });
                  } else {
                    clearErrors("phone"); // Clear error if valid
                  }
                  return isValid;
                },
              })}
            />
            {errors.phone && (
              <span className="text-red-500">{errors.phone.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label
              htmlFor="alternativeMobileNumberInput"
              className="form-label"
            >
              Alternative Mobile Number
            </label>
            <input
              type="number"
              id="alternativeMobileNumberInput"
              className="form-input"
              placeholder="Enter your mobile number"
              {...register("alternativePhone", {
                required: "Alternative Phone is required.",
                validate: (value) => {
                  const isValid = validatePhoneNumber(value);
                  if (typeof isValid === "string") {
                    setError("alternativePhone", {
                      type: "manual",
                      message: isValid,
                    });
                  } else {
                    clearErrors("alternativePhone"); // Clear error if valid
                  }
                  return isValid;
                },
              })}
            />
            {errors.alternativePhone && (
              <span className="text-red-500">
                {errors.alternativePhone.message}
              </span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="emailIDInput" className="form-label">
              Email ID
            </label>
            <input
              type="email"
              id="emailIDInput"
              className="form-input"
              placeholder="example@example.com"
              {...register("email", { required: "Email is required." })}
            />
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <label htmlFor="nationalityInput" className="form-label">
              Nationality
            </label>
            <input
              type="text"
              id="nationalityInput"
              className="form-input"
              placeholder="Enter your nationality"
              {...register("nationality", {
                required: "Nationality is required.",
              })}
            />
            {errors.nationality && (
              <span className="text-red-500">{errors.nationality.message}</span>
            )}
          </div>
          <div className="col-span-12">
            <label htmlFor="addressInput" className="form-label">
              Parament Address
            </label>
            <input
              type="text"
              id="addressInput"
              className="form-input"
              placeholder="Enter your address"
              {...register("address", { required: "Address is required." })}
            />
            {errors.address && (
              <span className="text-red-500">{errors.address.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="cityInput" className="form-label">
              City
            </label>
            <input
              type="text"
              id="cityInput"
              className="form-input"
              placeholder="Enter your city"
              {...register("city", { required: "City is required." })}
            />
            {errors.city && (
              <span className="text-red-500">{errors.city.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="countryInput" className="form-label">
              Country
            </label>
            <input
              type="text"
              id="countryInput"
              className="form-input"
              placeholder="Enter your country"
              {...register("country", { required: "Country is required." })}
            />
            {errors.country && (
              <span className="text-red-500">{errors.country.message}</span>
            )}
          </div>
          <div className="col-span-12 md:col-span-4">
            <label htmlFor="pinCodeInput" className="form-label">
              Pin Code
            </label>
            <input
              type="text"
              id="pinCodeInput"
              className="form-input"
              placeholder="Enter your pinCode"
              {...register("pinCode", { required: "Pin Code is required." })}
            />
            {errors.pinCode && (
              <span className="text-red-500">{errors.pinCode.message}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-5 ltr:justify-end rtl:justify-start">
          <button type="submit" className="btn btn-primary">
            Save to Next
            <MoveRight className="ltr:inline-block rtl:hidden ltr:ml-1 rtl:mr-1 size-4" />
            <MoveLeft className="ltr:hidden rtl:inline-block ltr:ml-1 rtl:mr-1 size-4" />
          </button>
        </div>
      </form>
    </React.Fragment>
  );
};

export default PersonalDetailsTab;
