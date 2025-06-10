import BreadCrumb from "@src/components/common/breadCrumb";
import { NextPageWithLayout } from "@src/dtos";
import React, { useState } from "react";
import Select, { GroupBase, MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

interface OptionType {
  value: number;
  label: string;
  description?: string;
}
type NativeOptionType = {
  value: string | number; // The value of the option can either be a string or a number.
  label: string; // The label for the option is always a string.
  isDisabled?: boolean; // The `isDisabled` field is optional. If present, it's a boolean.
};

function getOptions(count = 10, includeDesc = false): OptionType[] {
  const optionsData: OptionType[] = [];
  for (let i = 1; i <= count; i += 1) {
    const optionData: OptionType = { value: i, label: `Option ${i}` };
    if (includeDesc) {
      optionData.description = `Description ${i}`;
    }
    optionsData.push(optionData);
  }
  return optionsData;
}

interface OptionTypes {
  label: string;
  value: string;
}

// Define the grouped options type
interface GroupedOptionType extends GroupBase<OptionTypes> {}

const groupedOptions: GroupedOptionType[] = [
  {
    label: "Option Group 1",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
      { label: "Option 4", value: "4" },
      { label: "Option 5", value: "5" },
      { label: "Option 6", value: "6" },
      { label: "Option 7", value: "7" },
      { label: "Option 8", value: "8" },
    ],
  },
  {
    label: "Option Group 2",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
      { label: "Option 4", value: "4" },
      { label: "Option 5", value: "5" },
      { label: "Option 6", value: "6" },
      { label: "Option 7", value: "7" },
      { label: "Option 8", value: "8" },
    ],
  },
];
const nativeOptions: NativeOptionType[] = [
  { value: "1", label: "Option 1", isDisabled: true },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
  { value: "5", label: "Option 5" },
  { value: "6", label: "Option 6" },
];

// Highlight matched text in search results
const highlightText = (text: string, search: string) => {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    ),
  );
};

// Custom filter function to include alias in search

const SelectPage: NextPageWithLayout = () => {
  const selectedMultiOptions = [3, 4];
  const disabledOptions = [2, 6, 8];
  const selectedOptions = [3];
  // ----------- States ------------
  const [selectedoptions, setSelectedoptions] = useState(null);
  const [options, setOptions] = useState<OptionType[]>(getOptions(8));
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedSearchOption, setSelectedSearchOption] = useState(null);
  const [selectedMultiOption, setSelectedMultiOption] = useState(null);
  const [selectedMultiWithoutOption, setSelectedMultiWithoutOption] =
    useState(null);
  const [selectedDisableOption, setSelectedDisableOption] = useState(null);
  const [selectedGroupOption, setSelectedGroupOption] = useState<
    MultiValue<OptionTypes>
  >([]);
  const [selectedNativeOption, setSelectedNativeOption] =
    useState<NativeOptionType | null>(
      nativeOptions.find((option) => option.value === "4") || null,
    );
  const [selectedPresetMultiOption, setSelectedPresetMultiOption] = useState<
    MultiValue<OptionType>
  >(
    getOptions(8).filter((option) =>
      selectedMultiOptions.includes(option.value),
    ),
  );
  const [selectedHideOption, setSelectedHideOption] = useState(null);
  const [selectedWidthOption, setSelectedWidthOption] = useState(null);
  const [selectedNewOption, setSelectedNewOption] = useState<OptionType | null>(
    null,
  );
  const [selectedmarkOption, setSelectedmarkOption] = useState(null);
  const [selectedshowOption, setSelectedshowOption] = useState(null);
  const [selecteddescriptionOption, setSelecteddescriptionOption] =
    useState(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [selectedValueOptions, setSelectedValueOptions] = useState(null);
  const handleOptionsChange = (selected: any) => {
    if (selected && selected.length > MAX_SELECTION) {
      alert(`You can select a maximum of ${MAX_SELECTION} options.`);
      return;
    }
    setSelectedoptions(selected);
  };
  const [selectedPresetOption, setSelectedPresetOption] = useState<
    MultiValue<OptionType>
  >(getOptions(8).filter((option) => selectedOptions?.includes(option.value)));
  // Custom sorting function to show selected options first
  const sortOptions = (
    options: OptionType[],
    selectedOptions: OptionType[] | null,
  ) => {
    if (!selectedOptions) return options;

    const selectedValues = selectedOptions.map((option) => option.value);

    return [...options].sort((a, b) => {
      const aSelected = selectedValues.includes(a.value) ? -1 : 1;
      const bSelected = selectedValues.includes(b.value) ? -1 : 1;
      return aSelected - bSelected;
    });
  };
  // ----------- Handlers ------------
  const isOptionMultiSelected = (option: OptionType) => {
    return selectedOptions.includes(option.value);
  };
  const handleChange = (selected: any) => {
    setSelectedOption(selected);
  };

  const handleSearchChange = (selected: any) => {
    setSelectedSearchOption(selected);
  };

  const handleMultiChange = (selected: any) => {
    setSelectedMultiOption(selected);
  };

  const handleMultiWithoutChange = (selected: any) => {
    setSelectedMultiWithoutOption(selected);
  };

  const handleDisableChange = (selected: any) => {
    setSelectedDisableOption(selected);
  };

  const handlegroupChange = (selected: MultiValue<OptionTypes>) => {
    setSelectedGroupOption(selected);
  };

  const handlePresetChange = (selected: MultiValue<OptionType>) => {
    setSelectedPresetOption(selected);
  };

  const handleNativeChange = (selected: NativeOptionType | null) => {
    setSelectedNativeOption(selected);
  };

  const handlePresetMultiChange = (selected: MultiValue<OptionType>) => {
    setSelectedPresetMultiOption(selected);
  };

  const handleHideChange = (selected: any) => {
    setSelectedHideOption(selected);
  };

  const handleWidthChange = (selected: any) => {
    setSelectedWidthOption(selected);
  };

  const handlenewChange = (selected: OptionType | null) => {
    setSelectedNewOption(selected);
  };

  const handleCreate = (inputValue: string) => {
    const newOption: any = { label: inputValue, value: inputValue };
    setOptions((prevOptions: any) => [...prevOptions, newOption]);
    setSelectedNewOption(newOption);
  };

  const handleMarkChange = (selected: any) => {
    setSelectedmarkOption(selected);
  };

  const handleshowChange = (selected: any) => {
    setSelectedshowOption(selected);
  };

  const handleDescriptionChange = (selected: any) => {
    setSelecteddescriptionOption(selected);
  };

  const handleInputChange = (newValue: string) => {
    setMenuIsOpen(true);
    return newValue;
  };

  const handleMenuOpen = () => {
    setMenuIsOpen(true);
  };

  const handleMenuClose = () => {
    setMenuIsOpen(false);
  };

  const handleValueChange = (selected: any) => {
    setSelectedValueOptions(selected);
  };

  // ----------- Custom Styles ------------

  const customStyles = {
    menu: (provided: any) => ({
      ...provided,
      width: "130px",
    }),
    control: (provided: any) => ({
      ...provided,
      width: "auto",
    }),
  };

  const customStylesValue = {
    multiValue: (styles: any) => {
      return {
        ...styles,
        backgroundColor: "none",
        border: "1px solid #ddd",
        borderRadius: "20px",
        padding: "1px 3px 1px 3px",
      };
    },
    multiValueRemove: (styles: any) => ({
      ...styles,
      color: "#9ca3af",
      backgroundColor: "none",
      ":hover": {
        backgroundColor: "none",
        color: "#9ca3af",
      },
    }),
  };

  // ----------- Other Components ------------

  const isOptionDisabled = (option: OptionType) => {
    return disabledOptions.includes(option.value);
  };

  const isOptionSelected = (option: OptionType) => {
    return selectedOptions.includes(option.value);
  };

  const aliasOptions = [
    { label: "Colors", value: "colors", alias: "Orange, Red" },
    { label: "Fruits", value: "fruits", alias: ["Orange", "Apple"] },
    { label: "Months", value: "months", alias: "January" },
    { label: "Others", value: "others" },
  ];

  const MAX_SELECTION = 4;

  const ImageOptions = [
    {
      label: "Options 1",
      value: "1",
      description: "Description 1",
      classNames: "fo",
    },
    {
      label: "Options 2",
      value: "2",
      description: "Description 2",
      classNames: "nz",
    },
    {
      label: "Options 3",
      value: "3",
      description: "Description 3",
      classNames: "bi",
    },
  ];

  const formatOptionLabel = ({ label, classNames }: any) => (
    <div className="custom-option">
      {classNames && (
        <i className={`flag flag-${classNames} ltr:mr-2 rtl:ml-2`} />
      )}
      {label}
    </div>
  );

  const customFilterOption = (option: any, searchInput: string) => {
    return searchInput.length > 0 || option.data.value === 0;
  };

  return (
    <React.Fragment>
      <BreadCrumb title="Select" subTitle="Forms" />
      <div className="grid grid-cols-12 gap-x-space">
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Default Select</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedOption}
              onChange={handleChange}
              placeholder="Select"
              id="sampleSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">With search box</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedSearchOption}
              onChange={handleSearchChange}
              isSearchable={true}
              placeholder="Select"
              id="searchBoxSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Select</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(3)}
              value={selectedMultiOption}
              onChange={handleMultiChange}
              isMulti={true}
              isSearchable={true}
              placeholder="Select"
              id="multipleSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Multiple Select without Search</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedMultiWithoutOption}
              onChange={handleMultiWithoutChange}
              isMulti={true}
              placeholder="Select"
              id="multipleWithoutSearchSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Disabled options</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedDisableOption}
              onChange={handleDisableChange}
              isMulti={true}
              isOptionDisabled={isOptionDisabled}
              placeholder="Select"
              id="disabledOptionSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Option Group</h6>
          </div>
          <div className="card-body">
            <Select<OptionTypes, true, GroupedOptionType>
              options={groupedOptions}
              classNamePrefix="select"
              value={selectedGroupOption}
              onChange={handlegroupChange}
              placeholder="Select"
              id="optionGroupSelect"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Preselect value</h6>
          </div>
          <div className="card-body">
            <Select<OptionType, true>
              options={getOptions(8)}
              classNamePrefix="select"
              value={selectedPresetOption}
              onChange={handlePresetChange}
              isOptionSelected={isOptionSelected}
              placeholder="Select"
              id="preselectValue"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Preselect multiple values</h6>
          </div>
          <div className="card-body">
            <Select<OptionType, true>
              options={getOptions(8)}
              classNamePrefix="select"
              value={selectedPresetMultiOption}
              onChange={handlePresetMultiChange}
              isOptionSelected={isOptionMultiSelected}
              isMulti={true}
              placeholder="Select"
              id="preselectMultipleValue"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Hide Clear Button</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedHideOption}
              onChange={handleHideChange}
              isClearable={false}
              placeholder="Select"
              id="hideClearButton"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Custom width for dropbox</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedWidthOption}
              onChange={handleWidthChange}
              placeholder="Select"
              styles={customStyles}
              id="customWidthDropbox"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Allow to add new option</h6>
          </div>
          <div className="card-body">
            <CreatableSelect
              options={options}
              classNamePrefix="select"
              value={selectedNewOption}
              onChange={handlenewChange}
              onCreateOption={handleCreate}
              placeholder="Select or create new..."
              id="allowNewOption"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Mark matched term in label</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedmarkOption}
              onChange={handleMarkChange}
              isSearchable={true}
              formatOptionLabel={(option: OptionType, { inputValue }) => {
                const highlightedLabel = highlightText(
                  option.label,
                  inputValue,
                );
                return <div>{highlightedLabel}</div>;
              }}
              placeholder="Select"
              id="markMatchedLabel"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Showing selected options first</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={sortOptions(getOptions(8), selectedshowOption)}
              value={selectedshowOption}
              onChange={handleshowChange}
              isMulti={true}
              placeholder="Select"
              id="showingSelectedOption"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Using alias for searching</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={aliasOptions}
              filterOption={customFilterOption}
              placeholder="Select an option"
              id="aliasForSearching"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Maximum Values</h6>
          </div>
          <div className="card-body">
            <Select
              classNamePrefix="select"
              options={getOptions(8)}
              value={selectedoptions}
              onChange={handleOptionsChange}
              isMulti={true}
              placeholder="Select"
              id="maximumValues"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Label with description</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(3)}
              classNamePrefix="select"
              value={selecteddescriptionOption}
              onChange={handleDescriptionChange}
              placeholder="Select"
              id="labelDescription"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Show options only on search</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(8)}
              classNamePrefix="select"
              onInputChange={handleInputChange}
              filterOption={customFilterOption}
              menuIsOpen={menuIsOpen}
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              placeholder="Select"
              id="showOptionOnlyOnSearch"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">
              Initialize from native select element (not recommended)
            </h6>
          </div>
          <div className="card-body">
            <Select<NativeOptionType>
              options={nativeOptions}
              value={selectedNativeOption}
              classNamePrefix="select"
              onChange={(e) => handleNativeChange(e)}
              isOptionDisabled={(option) => option?.isDisabled || false}
              placeholder="Select"
              id="nativeSelectReactSelect"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Image/Icon</h6>
          </div>
          <div className="card-body">
            <Select
              options={ImageOptions}
              classNamePrefix="select"
              formatOptionLabel={formatOptionLabel}
              placeholder="Select"
              id="sample-image"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 card">
          <div className="card-header">
            <h6 className="card-title">Show values as tags</h6>
          </div>
          <div className="card-body">
            <Select
              options={getOptions(5)}
              classNamePrefix="select"
              value={selectedValueOptions}
              onChange={handleValueChange}
              placeholder="Select"
              id="value-tag"
              isMulti={true}
              styles={customStylesValue}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default SelectPage;
