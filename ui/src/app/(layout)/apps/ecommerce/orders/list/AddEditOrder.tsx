'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Modal } from '@src/components/custom/modal/modal'
import {
  OptionType,
  paymentNameOptions,
  paymentOptions,
  statusOptions,
} from '@src/data/ecommerce/order-list'
import { OrderListItem } from '@src/dtos'
import { AppDispatch } from '@src/slices/reducer'
import { addOrderData, editOrderData } from '@src/slices/thunk'
import { getRecordId } from '@src/utils/record_id'
import { Minus, Plus } from 'lucide-react'
import Flatpickr from 'react-flatpickr'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import Select from 'react-select'

const AddEditOrder = ({
  modalState,
  closeModal,
  orders,
  editMode,
  currentOrderList,
}: {
  modalState: { showEditOrderForm: boolean; showAddOrderForm: boolean }
  closeModal: (formType: string) => void
  orders: OrderListItem[]
  editMode?: boolean
  currentOrderList?: OrderListItem | null
}) => {
  const dispatch: AppDispatch = useDispatch()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<OrderListItem>()

  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [orderDate, setOrderDate] = useState<Date | null>(null)
  const [paymentNameStatus, setPaymentNameStatus] = useState<OptionType | null>(
    null
  )
  const [paymentStatus, setPaymentStatus] = useState<OptionType | null>(null)
  const [orderStatus, setOrderStatus] = useState<OptionType | null>(null)
  const handlePaymentNameStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setPaymentNameStatus(selected)
    onChange(selected)
  }
  const handlePaymentStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setPaymentStatus(selected)
    onChange(selected)
  }
  const handleOrderStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setOrderStatus(selected)
    onChange(selected)
  }
  // Calculate the total price
  useEffect(() => {
    setTotalPrice(quantity * price)
  }, [quantity, price])
  // Handlers for quantity change
  const handleQtyChange = (delta: number) => {
    setQuantity((prevQty) => Math.max(1, prevQty + delta))
  }
  // Reset the form when opening the modal in "Add" mode
  const resetForm = useCallback(() => {
    reset({
      ordersID: '',
      ordersDate: '',
      deliveredDate: '',
      customersName: '',
      productName: '',
      payment: '',
      price: 0,
      total: 0,
      qty: 0,
      status: '',
      image: '',
    })
    setOrderDate(null)
    setDueDate(null)
    setPaymentNameStatus(null)
    setPaymentStatus(null)
    setTotalPrice(0)
    setOrderStatus(null)
    clearErrors()
  }, [reset, clearErrors])

  useEffect(() => {
    if (editMode && currentOrderList) {
      clearErrors()
      Object.keys(currentOrderList).forEach((key) => {
        setValue(
          key as keyof OrderListItem,
          currentOrderList[key as keyof OrderListItem]
        )
      })
      if (currentOrderList.ordersDate) {
        const parsedDate = new Date(currentOrderList.ordersDate)
        setOrderDate(parsedDate) // Set the ordersDate for Flatpickr
      }
      if (currentOrderList.deliveredDate) {
        const parsedDate = new Date(currentOrderList.deliveredDate)
        setDueDate(parsedDate) // Set the deliveredDate for Flatpickr
      }
      if (currentOrderList.productName) {
        setPaymentNameStatus(
          paymentNameOptions.find(
            (opt) => opt.value === currentOrderList.productName
          ) || null
        )
      }
      if (currentOrderList.payment) {
        setPaymentStatus(
          paymentOptions.find(
            (opt) => opt.value === currentOrderList.payment
          ) || null
        )
      }
      if (currentOrderList.status) {
        setOrderStatus(
          statusOptions.find((opt) => opt.value === currentOrderList.status) ||
            null
        )
      }
    } else {
      resetForm()
    }
  }, [editMode, currentOrderList, setValue, clearErrors, resetForm])

  const submitForm = (data: OrderListItem, onClose: () => void) => {
    if (editMode && currentOrderList) {
      const updatedOrderList: OrderListItem = {
        ...data,
        productName: paymentNameStatus ? paymentNameStatus.value : 'Paid',
        payment: paymentStatus ? paymentStatus.value : 'COD',
        status: orderStatus ? orderStatus.value : 'Pending',
        total: currentOrderList.total,
      }
      dispatch(editOrderData(updatedOrderList))
    } else {
      const ordersArray = orders.map((order) => ({
        ...order,
        id: Number(order.ordersID) || 0,
        image: typeof order.image === 'string' ? order.image : '', // convert StaticImageData to string
      }))
      const newOrderList = {
        ...data,
        ordersID: getRecordId(ordersArray, 'ordersID', 'PE0'),
        productName: paymentNameStatus ? paymentNameStatus.value : 'Paid',
        payment: paymentStatus ? paymentStatus.value : 'COD',
        status: orderStatus ? orderStatus.value : 'Pending',
        total: totalPrice,
        qty: quantity,
      }
      dispatch(addOrderData(newOrderList))
      resetForm()
    }
    onClose()
  }

  const formatDate = (date: Date) => {
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month}, ${year}`
  }

  const handleCloseModal = () => {
    closeModal(editMode ? 'showEditOrderForm' : 'showAddOrderForm')
    clearErrors()
    resetForm()
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={
          modalState &&
          (editMode == true
            ? modalState.showEditOrderForm
            : modalState.showAddOrderForm)
        }
        onClose={() => handleCloseModal()}
        position="modal-center"
        title={editMode ? 'Edit Order' : 'Add Order'}
        id={editMode ? 'showEditOrderForm' : 'showAddOrderForm'}
        contentClass="modal-content"
        content={(onClose) => (
          <>
            <form onSubmit={handleSubmit((data) => submitForm(data, onClose))}>
              <div className="grid grid-cols-12 gap-5">
                <div className="col-span-12">
                  <label htmlFor="orderIDInput" className="form-label">
                    Order ID
                  </label>
                  <input
                    type="text"
                    id="orderIDInput"
                    className="form-input"
                    placeholder="Order ID"
                    disabled
                  />
                </div>
                <div className="col-span-6">
                  <label htmlFor="orderDateInput" className="form-label">
                    Order Date
                  </label>
                  <Flatpickr
                    id="ordersDateInput"
                    className="form-input"
                    placeholder="Select due date"
                    value={orderDate || undefined}
                    options={{
                      mode: 'single',
                      dateFormat: 'd M, Y',
                    }}
                    onChange={(date) => {
                      const formattedDate = formatDate(date[0])
                      setValue('ordersDate', formattedDate)
                    }}
                  />
                  <input
                    type="hidden"
                    {...register('ordersDate', {
                      required: 'Order date is required.',
                    })}
                  />
                  {errors.ordersDate && (
                    <span className="text-red-500">
                      {errors.ordersDate.message}
                    </span>
                  )}
                </div>
                <div className="col-span-6">
                  <label htmlFor="deliveredDateInput" className="form-label">
                    Delivered Date
                  </label>
                  <Flatpickr
                    id="deliveredDateInput"
                    className="form-input"
                    placeholder="Select due date"
                    value={dueDate || undefined}
                    options={{
                      mode: 'single',
                      dateFormat: 'd M, Y',
                    }}
                    onChange={(date) => {
                      const formattedDate = formatDate(date[0])
                      setValue('deliveredDate', formattedDate)
                    }}
                  />
                  <input
                    type="hidden"
                    {...register('deliveredDate', {
                      required: 'Delivered date is required.',
                    })}
                  />
                  {errors.deliveredDate && (
                    <span className="text-red-500">
                      {errors.deliveredDate.message}
                    </span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="customerNameInput" className="form-label">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerNameInput"
                    className="form-input"
                    placeholder="Customer name"
                    {...register('customersName', {
                      required: 'Full name is required.',
                    })}
                  />
                  {errors.customersName && (
                    <span className="text-red-500">
                      {errors.customersName.message}
                    </span>
                  )}
                </div>
                <div className="col-span-6">
                  <label htmlFor="quantityInput" className="form-label">
                    Quantity
                  </label>
                  <div>
                    <div className="input-spin-group">
                      <div
                        className="input-spin-minus"
                        onClick={() => handleQtyChange(-1)}>
                        <Minus className="size-4" />
                      </div>
                      <input
                        type="text"
                        value={quantity}
                        {...register('qty', {
                          required: 'Quantity is required.',
                        })}
                        className="input-spin form-input"
                        id="quantityInput"
                        readOnly
                      />
                      <div
                        className="input-spin-plus"
                        onClick={() => handleQtyChange(1)}>
                        <Plus className="size-4" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-6">
                  <label htmlFor="totalAmountInput" className="form-label">
                    Product Amount
                  </label>
                  <input
                    type="number"
                    className="form-input [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Amount"
                    {...register('price', { required: 'Price is required.' })}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                  {errors.price && (
                    <span className="text-red-500">{errors.price.message}</span>
                  )}
                </div>
                <div className="col-span-12">
                  <label htmlFor="productNameSelect" className="form-label">
                    Total Price
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={totalPrice}
                    placeholder="Total Amount"
                    readOnly
                  />
                </div>

                <div className="col-span-12">
                  <label htmlFor="productNameSelect" className="form-label">
                    Products Name
                  </label>
                  <Controller
                    name="productName"
                    control={control}
                    rules={{ required: 'Product name is required' }}
                    render={({ field: { onChange } }) => {
                      return (
                        <Select
                          classNamePrefix="select"
                          options={paymentNameOptions}
                          value={paymentNameStatus} // Make sure this is a valid object or null
                          onChange={(selected) =>
                            handlePaymentNameStatusChange(selected, onChange)
                          }
                          placeholder="Select..."
                          id="productNameSelect"
                        />
                      )
                    }}
                  />
                  {errors.productName && (
                    <span className="text-red-500">
                      {errors.productName.message}
                    </span>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="paymentStatusSelect" className="form-label">
                    Payment Status
                  </label>
                  <Controller
                    name="payment"
                    control={control}
                    rules={{ required: 'Payment status is required' }}
                    render={({ field: { onChange } }) => {
                      return (
                        <Select
                          classNamePrefix="select"
                          options={paymentOptions}
                          value={paymentStatus} // Make sure this is a valid object or null
                          onChange={(selected) =>
                            handlePaymentStatusChange(selected, onChange)
                          }
                          placeholder="Select..."
                          id="paymentStatusSelect"
                        />
                      )
                    }}
                  />
                  {errors.payment && (
                    <span className="text-red-500">
                      {errors.payment.message}
                    </span>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="orderStatusSelect" className="form-label">
                    Order Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: 'Order status is required' }}
                    render={({ field: { onChange } }) => {
                      return (
                        <Select
                          classNamePrefix="select"
                          options={statusOptions}
                          value={orderStatus} // Make sure this is a valid object or null
                          onChange={(selected) =>
                            handleOrderStatusChange(selected, onChange)
                          }
                          placeholder="Select..."
                          id="orderStatusSelect"
                        />
                      )
                    }}
                  />
                  {errors.status && (
                    <span className="text-red-500">
                      {errors.status.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  className="btn btn-active-red"
                  onClick={() => onClose()}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Update Order' : 'Add Order'}
                </button>
              </div>
            </form>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default AddEditOrder
