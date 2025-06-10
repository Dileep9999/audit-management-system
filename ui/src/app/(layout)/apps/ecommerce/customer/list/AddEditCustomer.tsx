'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Image from 'next/image'

import { validatePhoneNumber } from '@src/components/common/ValidationFormate'
import { validateEmailField } from '@src/components/common/ValidationFormate'
import { Modal } from '@src/components/custom/modal/modal'
import { CustomerRecord } from '@src/dtos'
import {
  AddNewCustomerPropsModal,
  OptionType,
  statusOptions,
  subscribeOptions,
} from '@src/dtos/apps/ecommerce'
import { AppDispatch } from '@src/slices/reducer'
import {
  addCustomerProductRecordData,
  editCustomerProductRecordData,
} from '@src/slices/thunk'
import { getRecordId } from '@src/utils/record_id'
import { Upload } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select from 'react-select'

const AddEditNewCustomer: React.FC<AddNewCustomerPropsModal> = ({
  modalState,
  closeModal,
  customerList,
  editMode = false,
  currentCustomer = null,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [preview, setPreview] = useState<string | null>(null)
  const [subscribeOption, setSubscribeOption] = useState<OptionType | null>(
    null
  )
  const [statusOption, setStatusOption] = useState<OptionType | null>(null)
  const handleSubScribeChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setSubscribeOption(selected)
    onChange(selected)
  }
  // handle subscribe change
  const handleStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setStatusOption(selected)
    onChange(selected)
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }
  // use form hook
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<CustomerRecord>({
    mode: 'onChange',
  })

  const submitForm = (data: CustomerRecord, onClose: () => void) => {
    if (editMode && currentCustomer) {
      const updatedContact: CustomerRecord = {
        ...data,
        image: preview || '/assets/images/avatar/user-2.png',
        subscriber: subscribeOption?.value || 'No',
        status: statusOption?.value || 'Inactive',
      }
      dispatch(editCustomerProductRecordData(updatedContact))
    } else {
      // Create new customer with generated customerId
      const newCustomer: CustomerRecord = {
        ...data,
        id: customerList.length > 0 ? customerList.length + 1 : +1,
        customerId: getRecordId(
          customerList.map((item) => ({
            ...item,
            id: item.id || 0, // Ensure 'id' exists
          })),
          'customerId',
          'PEC'
        ),
        image: preview || '/assets/images/avatar/user-2.png',
        subscriber: subscribeOption?.value || 'No',
        status: statusOption?.value || 'Inactive',
      }
      dispatch(addCustomerProductRecordData(newCustomer))
      // Reset the form after submission
      resetForm()
    }
    onClose()
  }
  // reset form
  const resetForm = useCallback(() => {
    reset({
      id: 1,
      customerId: '',
      image: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      subscriber: '',
      gender: '',
      location: '',
      status: '',
    })
    setPreview(null)
    setSubscribeOption(null)
    setStatusOption(null)
    clearErrors()
  }, [reset, clearErrors])

  useEffect(() => {
    if (editMode && currentCustomer) {
      clearErrors()
      Object.keys(currentCustomer).forEach((key) => {
        setValue(
          key as keyof CustomerRecord,
          currentCustomer[key as keyof CustomerRecord]
        )
      })
      setPreview(currentCustomer.image)
      setSubscribeOption({
        value: currentCustomer.subscriber,
        label: currentCustomer.subscriber,
      })
      setStatusOption({
        value: currentCustomer.status,
        label: currentCustomer.status,
      })
    } else {
      resetForm()
      setSubscribeOption(null)
      setStatusOption(null)
    }
  }, [editMode, currentCustomer, setValue, reset, clearErrors, resetForm])

  const handleCloseModal = (modal: string) => {
    closeModal(modal)
    clearErrors()
    setPreview(null)
  }

  return (
    <React.Fragment>
      {/* edit and add customer modal  */}
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditCustomerForm
            : modalState.showAddCustomerForm)
        }
        onClose={() =>
          handleCloseModal(
            editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
          )
        }
        position="modal-center"
        id={editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'}
        contentClass="modal-content p-0"
        content={(onClose) => (
          <>
            <form
              action=""
              onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div className="h-20 bg-gray-100 rounded-t-md dark:bg-dark-850"></div>
              <div className="modal-content">
                <div className="-mt-16">
                  <label htmlFor="logo">
                    <div className="inline-flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200 rounded-full cursor-pointer dark:bg-dark-850 dark:border-dark-800 size-24">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="previewImg"
                          className="object-cover w-full h-full rounded-full"
                          width={94}
                          height={94}
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 dark:text-dark-500">
                          <Upload />
                        </div>
                      )}
                    </div>
                  </label>
                  <div className="hidden mt-4">
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <input
                        type="file"
                        name="logo"
                        id="logo"
                        className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <span className="text-red-500"></span>
                </div>

                <div className="mt-5">
                  <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-6">
                      <label htmlFor="firstNameInput" className="form-label">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstNameInput"
                        className="form-input"
                        placeholder="Enter your first name"
                        {...register('firstName', {
                          required: 'Full name is required.',
                        })}
                      />
                      {errors.firstName && (
                        <span className="text-red-500">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="lastNameInput" className="form-label">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastNameInput"
                        className="form-input"
                        placeholder="Enter your last name"
                        {...register('lastName', {
                          required: 'Full name is required.',
                        })}
                      />
                      {errors.lastName && (
                        <span className="text-red-500">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12">
                      <label htmlFor="emailInput" className="form-label">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="emailInput"
                        className="form-input"
                        placeholder="Enter your email"
                        {...register('email', {
                          required: 'Email is required.',
                          validate: validateEmailField,
                        })}
                      />
                      {errors.email && (
                        <span className="text-red-500">
                          {errors.email.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12">
                      <label htmlFor="phoneNumberInput" className="form-label">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="phoneNumberInput"
                        className="form-input"
                        placeholder="000 000 0000"
                        {...register('phoneNumber', {
                          required: 'Phone number is required.',
                          validate: validatePhoneNumber, // Directly pass the validation function
                        })}
                      />
                      {errors.phoneNumber && (
                        <span className="text-red-500">
                          {errors.phoneNumber.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="genderInput" className="form-label">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="input-radio-group">
                          <input
                            id="maleRadio"
                            className="input-radio input-radio-primary"
                            type="radio"
                            value="Male"
                            {...register('gender', {
                              required: 'Gender is required.',
                            })}
                          />
                          <label
                            htmlFor="maleRadio"
                            className="input-radio-label">
                            Male
                          </label>
                        </div>
                        <div className="input-radio-group">
                          <input
                            id="femaleRadio"
                            className="input-radio input-radio-primary"
                            type="radio"
                            value="Female"
                            {...register('gender', {
                              required: 'Gender is required.',
                            })}
                          />
                          <label
                            htmlFor="femaleRadio"
                            className="input-radio-label">
                            Female
                          </label>
                        </div>
                      </div>
                      {errors.gender && (
                        <span className="text-red-500">Gender is required</span>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="subscriberSelect" className="form-label">
                        Subscriber <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="subscriber"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <Select
                            classNamePrefix="select"
                            options={subscribeOptions}
                            value={subscribeOption}
                            onChange={(selected) =>
                              handleSubScribeChange(selected, onChange)
                            }
                            placeholder="Select Subscriber"
                            id="subscriberSelect"
                          />
                        )}
                      />
                      {errors.subscriber && (
                        <span className="text-red-500">Status is required</span>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="locationInput" className="form-label">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="locationInput"
                        className="form-input"
                        placeholder="Location"
                        {...register('location', {
                          required: 'Location is required.',
                        })}
                      />
                      {errors.location && (
                        <span className="text-red-500">
                          {errors.location.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-6">
                      <label htmlFor="statusSelect" className="form-label">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="subscriber"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <Select
                            classNamePrefix="select"
                            options={statusOptions}
                            value={statusOption}
                            onChange={(selected) =>
                              handleStatusChange(selected, onChange)
                            }
                            placeholder="Select Status"
                            id="statusSelect"
                          />
                        )}
                      />
                      {errors.subscriber && (
                        <span className="text-red-500">Status is required</span>
                      )}
                    </div>
                    <div className="col-span-12">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sub-gray"
                          onClick={() => onClose()}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          {editMode ? 'Update Customer' : 'Add Customer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditNewCustomer
