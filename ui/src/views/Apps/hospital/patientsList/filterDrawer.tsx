import { Drawer } from "@src/components/custom/drawer/drawer";
import { MoveLeft, MoveRight, Search } from "lucide-react";
import React, { useState } from "react";
import Select from "react-select";

interface OptionType {
  label: string;
  value: string;
}

const doctorsOptions: OptionType[] = [
  { label: "Dr. Michael", value: "Dr. Michael" },
  { label: "Dr. Sarah", value: "Dr. Sarah" },
  { label: "Dr. Robert", value: "Dr. Robert" },
  { label: "Dr. Emily", value: "Dr. Emily" },
  { label: "Dr. James", value: "Dr. James" },
  { label: "Dr. Olivia", value: "Dr. Olivia" },
  { label: "Dr. David", value: "Dr. David" },
  { label: "Dr. Sophia", value: "Dr. Sophia" },
  { label: "Dr. William", value: "Dr. William" },
  { label: "Dr. Charlotte", value: "Dr. Charlotte" },
];

const statusOptions: OptionType[] = [
  { label: "New", value: "New" },
  { label: "Follow Up", value: "Follow Up" },
  { label: "Old", value: "Old" },
];

const insuranceOptions: OptionType[] = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const cityOptions: OptionType[] = [
  { label: "Algeria", value: "Algeria" },
  { label: "Argentina", value: "Argentina" },
  { label: "Belgium", value: "Belgium" },
  { label: "Mexico", value: "Mexico" },
  { label: "Russia", value: "Russia" },
  { label: "Denmark", value: "Denmark" },
  { label: "Sudan", value: "Sudan" },
  { label: "Spain", value: "Spain" },
  { label: "Germany", value: "Germany" },
  { label: "Israel", value: "Israel" },
  { label: "Namibia", value: "Namibia" },
  { label: "Brazil", value: "Brazil" },
  { label: "Poland", value: "Poland" },
  { label: "Serbia", value: "Serbia" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Norway", value: "Norway" },
  { label: "Romania", value: "Romania" },
  { label: "USA", value: "USA" },
  { label: "Canada", value: "Canada" },
];

const genderOptions: OptionType[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Others", value: "Others" },
];

interface FilterDrawerProps {
  isDrawerOpen: boolean;
  closeDrawer: () => void;
  onFilterChange: (filters: {
    doctor?: string;
    status?: string;
    insurance?: string;
    city?: string;
    gender?: string;
  }) => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isDrawerOpen,
  closeDrawer,
  onFilterChange,
}) => {
  const [selectedDoctors, setSelectedDoctors] = useState<OptionType | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<OptionType | null>(null);
  const [insuranceType, setInsuranceType] = useState<OptionType | null>(null);
  const [selectedCity, setSelectedCity] = useState<OptionType | null>(null);
  const [selectedGender, setSelectedGender] = useState<OptionType | null>(null);

  const handleApplyFilters = () => {
    onFilterChange({
      doctor: selectedDoctors?.value,
      status: selectedStatus?.value,
      insurance: insuranceType?.value,
      city: selectedCity?.value,
      gender: selectedGender?.value,
    });
    closeDrawer();
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      position="right"
      title="Patients Filters"
      content={
        <div>
          <div className="relative mb-5 group/form">
            <input
              type="text"
              className="ltr:pl-9 rtl:pr-9 form-input"
              placeholder="Search for patients..."
              x-model="searchQuery"
            />
            <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 focus:outline-hidden">
              <Search className="size-4" />
            </div>
          </div>
          <div className="mb-5">
            <label>Doctors</label>
            <Select
              classNamePrefix="select"
              value={selectedDoctors}
              onChange={setSelectedDoctors}
              options={doctorsOptions}
              placeholder="Select Doctor"
            />
          </div>
          <div className="mb-5">
            <label>Patient Status</label>
            <Select
              classNamePrefix="select"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="Select Status"
            />
          </div>
          <div className="mb-5">
            <label>Insurance</label>
            <Select
              classNamePrefix="select"
              value={insuranceType}
              onChange={setInsuranceType}
              options={insuranceOptions}
              placeholder="Select Insurance"
            />
          </div>
          <div className="mb-5">
            <label>City</label>
            <Select
              classNamePrefix="select"
              value={selectedCity}
              onChange={setSelectedCity}
              options={cityOptions}
              placeholder="Select City"
            />
          </div>
          <div className="mb-5">
            <label>Gender</label>
            <Select
              classNamePrefix="select"
              value={selectedGender}
              onChange={setSelectedGender}
              options={genderOptions}
              placeholder="Select Gender"
            />
          </div>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            className="btn btn-sub-gray"
            onClick={() => {
              setSelectedDoctors(null);
              setSelectedStatus(null);
              setInsuranceType(null);
              setSelectedCity(null);
              setSelectedGender(null);
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary"
            data-drawer-close="filterSidebar"
            onClick={handleApplyFilters}
          >
            Filters
            <MoveRight className="ml-1 ltr:inline-block rtl:hidden size-4" />
            <MoveLeft className="mr-1 ltr:hidden rtl:inline-block size-4" />
          </button>
        </>
      }
    />
  );
};

export default FilterDrawer;
