'use client'

import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import product3 from '@assets/images/ecommerce/landing/img-02.jpg'
import product2 from '@assets/images/ecommerce/landing/img-05.jpg'
import bankImage from '@assets/images/others/bank.png'
import moneyImage from '@assets/images/others/money.png'
import masterCadrdImage from '@assets/images/payment/mastercard.png'
import img4 from '@assets/images/products/img-04.png'
import img5 from '@assets/images/products/img-05.png'
import img6 from '@assets/images/products/img-06.png'
import BreadCrumb from '@src/components/common/BreadCrumb'
import {
  ColorItems,
  OptionType,
  SizeItems,
  brandItems,
  categoryItems,
  statusItems,
} from '@src/data/ecommerce/product-list'
import { NextPageWithLayout, ProductListItem } from '@src/dtos'
import Layout from '@src/layout/Layout'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  addProductListData,
  editProductListData,
  setEditModeProductList,
} from '@src/slices/thunk'
import { getRecordId } from '@src/utils/record_id'
import {
  Check,
  Eye,
  ImagePlus,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Select, { MultiValue } from 'react-select'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

const CreateProduct: NextPageWithLayout = () => {
  const { editMode, currentProduct, productlist } = useSelector(
    (state: RootState) => state.ProductList
  )
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [productColor, setProductColor] = useState<number>(1)
  const [productSize, setProductSize] = useState<number>(1)
  const [preview1, setPreview1] = useState<string | null>(null)
  const [preview1Error, setPreview1Error] = useState<boolean>(false)
  const [preview2, setPreview2] = useState<string | null>(null)
  const [preview3, setPreview3] = useState<string | null>(null)
  const [categoryList, setCategoryList] = useState<OptionType | null>(null)
  const [brandList, setBrandList] = useState<OptionType | null>(null)
  const [statusList, setStatusList] = useState<OptionType | null>(null)
  const [stock, setStock] = useState(10)
  const [quantity, setQuantity] = useState(0)
  const [revenue, setRevenue] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [previousPage, setPreviousPage] = useState(
    '/apps/ecommerce/products/list'
  )
  const [price, setPrice] = useState<number | undefined>()
  const [priceError, setPriceError] = useState<boolean>(false)
  const [discount, setDiscount] = useState<string | number>('')

  const handleCategoryChange = (
    selected: OptionType | null,
    onChange: (value: string[]) => void
  ) => {
    setCategoryList(selected)
    onChange(selected ? [selected.value] : [])
  }
  const handleBrandChange = (
    selected: OptionType | null,
    onChange: (value: string[]) => void
  ) => {
    setBrandList(selected)
    onChange(selected ? [selected.value] : [])
  }
  const handleStatusChange = (
    selected: OptionType | null,
    onChange: (value: OptionType | null) => void
  ) => {
    setStatusList(selected)
    onChange(selected)
  }
  // size
  const handleSizeChange = (
    selected: MultiValue<OptionType>,
    onChange: (value: string[]) => void
  ) => {
    const selectedValues = selected.map((option) => option.value)
    onChange(selectedValues)
  }
  // color
  const handleColorChange = (
    selected: MultiValue<OptionType>,
    onChange: (value: string[]) => void
  ) => {
    const selectedValues = selected.map((option) => option.value)
    onChange(selectedValues)
  }
  // Handlers for incrementing and decrementing values
  const handleIncrement =
    (setter: React.Dispatch<React.SetStateAction<number>>) => () => {
      if (quantity < stock) {
        setter((prev) => prev + 1)
        setErrorMessage('')
      } else {
        setErrorMessage(
          `Cannot add quantity more than available stock (${stock}).`
        )
      }
    }
  const handleDecrement =
    (setter: React.Dispatch<React.SetStateAction<number>>) => () => {
      if (quantity > 0) {
        setter((prev) => prev - 1)
        setErrorMessage('') // Clear error message if decrement is successful
      } else {
        setErrorMessage('Quantity cannot be less than 0.')
      }
    }

  useEffect(() => {
    setEditModeProductList(editMode)
  }, [editMode])

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setPreview1Error(false)
    } else {
      setPreview(null)
      setPreview1Error(true)
    }
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductListItem>()

  useEffect(() => {
    if (editMode && currentProduct) {
      Object.keys(currentProduct).forEach((key) => {
        setValue(key as keyof ProductListItem, currentProduct[key])
      })
      setPreview1(currentProduct.image1)
      setPreview2(currentProduct.image2)
      setPreview3(currentProduct.image3)
      if (currentProduct.category) {
        setCategoryList({
          label: currentProduct.category,
          value: currentProduct.category,
        })
      }
      if (currentProduct.brand) {
        setBrandList({
          label: currentProduct.brand,
          value: currentProduct.brand,
        })
      }
      if (currentProduct.status) {
        setStatusList({
          label: currentProduct.status,
          value: currentProduct.status,
        })
      }
      setStock(currentProduct.stock)
      setQuantity(currentProduct.qty)
      setPrice(currentProduct.price)
      setDiscount(currentProduct.discount.toString())
    } else {
      reset({
        productId: '',
        productName: '',
        description: '',
        category: '',
        price: 0,
        discount: 0,
        selling_price: 0,
        revenue: 0,
        stock: 0,
        qty: 0,
        size: [],
        colors: [],
        gender: '',
        image1: '',
        image2: product2 || '',
        image3: product3 || '',
        status: '',
        payment_method: '',
        brand: '',
        color: 'bg-gray-500',
      })
      setPreview1(null)
      setPreview2(null)
      setPreview3(null)
      setPreview1Error(false)
      setCategoryList(null)
      setBrandList(null)
      setStatusList(null)
      setStock(10)
      setQuantity(0)
      setPrice(0)
      setDiscount(0)
      setPriceError(false)
    }
  }, [editMode, currentProduct, setValue, reset])

  useEffect(() => {
    // Get the previous page from localStorage
    const savedPreviousPage = localStorage.getItem('previousPage')
    if (savedPreviousPage) {
      setPreviousPage(savedPreviousPage)
    }
  }, [])
  const submitForm = (data: ProductListItem) => {
    if (!preview1) {
      setPreview1Error(true)
      return
    }

    if (quantity < 1) {
      setErrorMessage('Quantity cannot be less than 1.')
      return
    }

    if ((price ?? 0) < 1) {
      setPriceError(true)
      return
    }

    if (editMode && currentProduct) {
      const updatedContact = {
        ...data,
        image1: preview1 || '',
        image2: preview2 || '',
        image3: preview3 || '',
        price: price || 0,
        discount: Number(discount) || 0,
        category: categoryList?.value || '',
        brand: brandList?.label || '',
        status: statusList?.value || '',
        payment_method: currentProduct.payment_method,
      }
      dispatch(editProductListData(updatedContact))
    } else {
      const newContact = {
        ...data,
        id: productlist ? productlist.length + 1 : 1,
        image1: preview1 || '',
        productId: getRecordId(productlist, 'productId', 'PEP'),
        stock: stock,
        qty: quantity,
        category: categoryList?.value || '',
        brand: brandList?.label || '',
        status: statusList?.value || '',
        revenue: Number(revenue),
      }
      dispatch(addProductListData(newContact))
    }
    reset()
    setPreview1(null)
    setPreview2(null)
    setPreview3(null)
    setPreview1Error(false)
    setCategoryList(null)
    setBrandList(null)
    setStatusList(null)
    setStock(10)
    setQuantity(0)
    setPrice(0)
    setDiscount(0)
    setPriceError(false)
    router.push(previousPage)
  }
  // Function to validate that only numbers are allowed
  const validateNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const regex = /^[0-9]*$/

    if (regex.test(value)) {
      if (event.target.name === 'price') {
        setPrice(Number(value))
      } else if (event.target.name === 'discount') {
        setDiscount(value)
      }
    }
  }
  // Calculate the selling price based on price and discount
  const calculateSellingPrice = () => {
    const priceValue = parseFloat(price?.toString() || '0')
    const discountValue = parseFloat(discount.toString())

    if (
      isNaN(priceValue) ||
      isNaN(discountValue) ||
      discountValue < 0 ||
      discountValue > 100
    ) {
      return '$00.00'
    } else {
      const sellingPrice = priceValue * (1 - discountValue / 100)
      return '$' + sellingPrice.toFixed(2)
    }
  }
  useEffect(() => {
    const priceValue = price ?? 0
    const discountValue = Number(discount)

    if (
      !isNaN(priceValue as number) &&
      !isNaN(Number(discountValue)) &&
      discountValue >= 0 &&
      discountValue <= 100
    ) {
      const sellingPrice = priceValue * (1 - discountValue / 100)
      setRevenue(sellingPrice) // Update the revenue with selling price
    }
  }, [price, discount])

  return (
    <React.Fragment>
      <BreadCrumb title="Product Create" subTitle="Ecommerce" />
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="grow">
            <h6 className="mb-1 card-title">
              {editMode ? 'Edit Products' : 'Add New Products'}
            </h6>
            {editMode === false && (
              <p className="text-gray-500 dark:text-dark-500">
                Please fill the below form to create a new product.
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="btn btn-sub-gray">
              <Trash2 className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
              <span className="align-middle">Delete</span>
            </button>
            <button className="btn btn-primary" type="submit">
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
              <span className="align-middle">
                {editMode ? 'Edit Products' : 'Add Products'}
              </span>
            </button>
          </div>
        </div>

        {/* product description */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-8">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Products Description</h6>
              </div>
              <div className="card-body">
                <div>
                  {/* form */}
                  <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-12">
                      <label htmlFor="productNameInput" className="form-label">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="productNameInput"
                        className="form-input"
                        placeholder="Enter product name"
                        {...register('productName', {
                          required: 'Full name is required.',
                        })}
                      />
                      {errors.productName && (
                        <span className="text-red-500">
                          {errors.productName.message}
                        </span>
                      )}
                    </div>
                    <div className="col-span-12">
                      <label
                        htmlFor="descriptionTextarea"
                        className="form-label">
                        Description
                      </label>
                      <textarea
                        name="descriptionTextarea"
                        id="descriptionTextarea"
                        rows={3}
                        className="h-auto form-input"
                        placeholder="Enter your description"></textarea>
                    </div>
                    <div className="col-span-4">
                      <label htmlFor="categorySelect" className="form-label">
                        Category
                      </label>
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <Select
                            classNamePrefix="select"
                            options={categoryItems}
                            value={categoryList}
                            onChange={(selected) =>
                              handleCategoryChange(selected, onChange)
                            }
                            placeholder="Select..."
                            id="categorySelect"
                          />
                        )}
                      />
                      {errors.category && (
                        <span className="text-red-500">
                          Category is required
                        </span>
                      )}
                    </div>
                    <div className="col-span-4">
                      <label htmlFor="brandTypeSelect" className="form-label">
                        Brand Type
                      </label>
                      <Controller
                        name="brand"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <Select
                            classNamePrefix="select"
                            options={brandItems}
                            value={brandList}
                            onChange={(selected) =>
                              handleBrandChange(selected, onChange)
                            }
                            placeholder="Select..."
                            id="brandTypeSelect"
                          />
                        )}
                      />
                      {errors.brand && (
                        <span className="text-red-500">
                          Brand Name is required
                        </span>
                      )}
                    </div>
                    <div className="col-span-4">
                      <label htmlFor="brandTypeSelect" className="form-label">
                        Status
                      </label>
                      <Controller
                        name="status"
                        control={control}
                        rules={{ required: true }}
                        render={({ field: { onChange } }) => (
                          <Select
                            classNamePrefix="select"
                            options={statusItems}
                            value={statusList}
                            onChange={(selected) =>
                              handleStatusChange(selected, onChange)
                            }
                            placeholder="Select..."
                            id="statusSelect"
                          />
                        )}
                      />
                      {errors.status && (
                        <span className="text-red-500">Status is required</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* product images */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Products Images</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-7 md:row-span-2">
                    <div className="h-full">
                      <label
                        htmlFor="logo1"
                        className="flex items-center justify-center h-full p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview1 ? (
                          <Image
                            src={preview1}
                            alt="previewImg"
                            className="mx-auto h-60"
                            width={472}
                            height={240}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Product Image 1</div>
                          </div>
                        )}
                      </label>
                      <div className="hidden mt-4">
                        <input
                          type="file"
                          name="logo1"
                          id="logo1"
                          className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 dark:text-dark-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 "
                          onChange={(e) => handleFileChange(e, setPreview1)}
                        />
                      </div>
                      {preview1Error && (
                        <span className="text-red-500 mt-2">
                          Image is required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-5">
                    <div>
                      <label
                        htmlFor="logo2"
                        className="flex items-center justify-center h-56 p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview2 ? (
                          <Image
                            src={preview2}
                            alt="preview2"
                            className="mx-auto h-44"
                            width={319}
                            height={176}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Product Image 2</div>
                          </div>
                        )}
                      </label>
                      <div className="hidden mt-4">
                        <input
                          type="file"
                          name="logo2"
                          id="logo2"
                          className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 dark:text-dark-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 "
                          onChange={(e) => handleFileChange(e, setPreview2)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <div>
                      <label
                        htmlFor="logo3"
                        className="flex items-center justify-center h-56 p-5 text-center border border-gray-200 border-dashed cursor-pointer dark:border-dark-800">
                        {preview3 ? (
                          <Image
                            src={preview3}
                            alt="preview2"
                            className="mx-auto h-44"
                            width={319}
                            height={176}
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-dark-500">
                            <ImagePlus className="mx-auto" />
                            <div className="mt-3">Product Image 3</div>
                          </div>
                        )}
                      </label>
                      <div className="hidden mt-4">
                        <input
                          type="file"
                          name="logo3"
                          id="logo3"
                          className="block w-full text-sm file:rounded-md focus:outline-0 text-slate-500 dark:text-dark-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 "
                          onChange={(e) => handleFileChange(e, setPreview3)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance Description */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Advance Description</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-4">
                    <h6 className="form-label">Select Gender</h6>
                    <div className="flex items-center gap-3">
                      <div className="input-radio-group">
                        <input
                          id="maleRadio"
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={
                            editMode && currentProduct.gender === 'Male'
                          }
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
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={
                            editMode && currentProduct.gender === 'Female'
                          }
                        />
                        <label
                          htmlFor="femaleRadio"
                          className="input-radio-label">
                          Female
                        </label>
                      </div>
                      <div className="input-radio-group">
                        <input
                          id="unisexRadio"
                          name="selectGender"
                          className="input-radio input-radio-primary"
                          type="radio"
                          defaultChecked={
                            editMode && currentProduct.gender === 'Unisex'
                          }
                        />
                        <label
                          htmlFor="unisexRadio"
                          className="input-radio-label">
                          Unisex
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label htmlFor="stockInput" className="form-label">
                      Stock
                    </label>
                    <div className="flex input-spin-group input-spin-primary">
                      <button
                        type="button"
                        onClick={handleDecrement(setStock)}
                        className="input-spin-minus">
                        <Minus className="size-4"></Minus>
                      </button>
                      <input
                        type="text"
                        className="input-spin form-input"
                        readOnly
                        id="stockInput"
                        value={stock}
                        {...register('stock', {
                          required: 'Full name is required.',
                        })}
                      />
                      {errors.stock && (
                        <span className="text-red-500">
                          {errors.stock.message}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleIncrement(setStock)}
                        className="input-spin-plus">
                        <Plus className="size-4"></Plus>
                      </button>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <label htmlFor="quantityInput" className="form-label">
                      Quantity
                    </label>
                    <div className="flex input-spin-group input-spin-primary">
                      <button
                        type="button"
                        onClick={handleDecrement(setQuantity)}
                        className="input-spin-minus">
                        <Minus className="size-4"></Minus>
                      </button>
                      <input
                        type="text"
                        className="input-spin form-input"
                        readOnly
                        id="quantityInput"
                        value={quantity}
                        {...register('qty', {
                          required: 'Quantity is required.',
                        })}
                      />
                      {/* {errors.qty && (
                                                <span className="text-red-500">{errors.qty.message}</span>
                                            )} */}
                      <button
                        type="button"
                        onClick={handleIncrement(setQuantity)}
                        className="input-spin-plus">
                        <Plus className="size-4"></Plus>
                      </button>
                    </div>
                    {errorMessage && (
                      <span className="text-red-500">{errorMessage}</span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="sizeSelect" className="form-label">
                      Size
                    </label>
                    <Controller
                      name="size"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          classNamePrefix="select"
                          options={SizeItems}
                          value={SizeItems.filter((option) =>
                            value?.includes(option.value)
                          )}
                          isMulti
                          onChange={(selected) =>
                            handleSizeChange(selected, onChange)
                          }
                          placeholder="Select..."
                          id="sizeSelect"
                        />
                      )}
                    />
                    {errors.size && (
                      <span className="text-red-500">Size is required</span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label htmlFor="colorsSelect" className="form-label">
                      Colors
                    </label>
                    <Controller
                      name="colors"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          classNamePrefix="select"
                          options={ColorItems}
                          value={ColorItems.filter((option) =>
                            value?.includes(option.value)
                          )}
                          isMulti
                          onChange={(selected) =>
                            handleColorChange(selected, onChange)
                          }
                          placeholder="Select..."
                          id="colorsSelect"
                        />
                      )}
                    />
                    {errors.colors && (
                      <span className="text-red-500">Color is required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing section */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Pricing & Sale</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-3">
                    <label htmlFor="priceInput" className="form-label">
                      Price
                    </label>
                    <input
                      type="number"
                      id="priceInput"
                      className="form-input [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="$00.00"
                      {...register('price', {
                        required: 'Price is required.',
                        onChange: (e) => {
                          validateNumber(e) // Perform number validation
                          setPrice(e.target.value) // Update local state
                        },
                      })}
                      value={price}
                    />
                    {priceError && (
                      <span className="text-red-500">
                        Price cannot be less than 1.
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <label htmlFor="discountInput" className="form-label">
                      Discount
                    </label>
                    <input
                      type="number"
                      id="discountInput"
                      className="form-input"
                      placeholder="0%"
                      {...register('discount', {
                        required: 'Discount is required.',
                        onChange: (e) => {
                          validateNumber(e) // Perform number validation
                          setDiscount(e.target.value) // Update local state
                        },
                      })}
                      value={discount}
                    />
                    {errors.discount && (
                      <span className="text-red-500">
                        {errors.discount.message}
                      </span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <label htmlFor="sellingPrice" className="form-label">
                      Selling Price
                    </label>
                    <input
                      type="text"
                      id="sellingPrice"
                      className="form-input"
                      placeholder="$00.00"
                      value={calculateSellingPrice()}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* payment section */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title">Payment Method</h6>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-12 gap-5">
                  <div className="col-span-12 md:col-span-4">
                    <label
                      htmlFor="cashOnDelivery"
                      className="relative block mb-0 cursor-pointer card">
                      <span className="flex items-center gap-3 card-body">
                        <Image
                          src={moneyImage}
                          alt="moneyImage"
                          className="size-8 shrink-0"
                          width={50}
                          height={32}
                        />
                        <span className="block text-base font-semibold grow">
                          Cash on Delivery
                        </span>
                        <input
                          id="cashOnDelivery"
                          className="input-check input-check-primary shrink-0"
                          type="checkbox"
                          defaultChecked={
                            editMode && currentProduct.payment_method === 'Cash'
                          }
                        />
                      </span>
                    </label>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label
                      htmlFor="masterVisaCard"
                      className="relative block mb-0 cursor-pointer card">
                      <span className="flex items-center gap-3 card-body">
                        <Image
                          src={masterCadrdImage}
                          alt="masterCadrdImage"
                          className="h-8 shrink-0"
                          width={50}
                          height={32}
                        />
                        <span className="block text-base font-semibold grow">
                          Visa & Master Card
                        </span>
                        <input
                          id="masterVisaCard"
                          className="input-check input-check-primary shrink-0"
                          type="checkbox"
                          defaultChecked={
                            (editMode &&
                              currentProduct.payment_method === 'Card') ||
                            true
                          }
                        />
                      </span>
                    </label>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label
                      htmlFor="bankCard"
                      className="relative block mb-0 cursor-pointer card">
                      <span className="flex items-center gap-3 card-body">
                        <Image
                          src={bankImage}
                          alt="bankImage"
                          className="h-8 shrink-0"
                          width={32}
                          height={32}
                        />
                        <span className="block text-base font-semibold grow">
                          Bank Transfer
                        </span>
                        <input
                          id="bankCard"
                          className="input-check input-check-primary shrink-0"
                          type="checkbox"
                          defaultChecked={
                            editMode && currentProduct.payment_method === 'Bank'
                          }
                        />
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* card preview */}
          <div className="col-span-12 xl:col-span-4">
            <div className="sticky top-24 card">
              <div className="card-header">
                <h6 className="card-title">
                  <Eye className="inline-block mr-1 size-4" />
                  <span className="align-middle">Product Card Preview</span>
                </h6>
              </div>
              <div className="bg-gray-100 card-body dark:bg-dark-850">
                <div className="mb-0 card">
                  <div className="card-body">
                    <div className="relative p-5 bg-gray-100 dark:bg-dark-850">
                      <Link
                        href="#!"
                        className="absolute z-10 flex items-center justify-center bg-white rounded-full link link-red size-10 shrink-0 top-5 dark:bg-dark-850 ltr:right-5 rtl:left-5">
                        <i className="text-lg ri-heart-line"></i>
                      </Link>

                      <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        pagination={{
                          clickable: true,
                          el: '.swiper-pagination',
                        }}
                        className="productSlider"
                        modules={[Pagination]}
                        dir="ltr">
                        <div className="swiper-wrapper">
                          <SwiperSlide>
                            <Image
                              src={img6}
                              alt="productImg"
                              className="w-3/4 mx-auto"
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <Image
                              src={img4}
                              alt="productImg"
                              className="w-3/4 mx-auto"
                            />
                          </SwiperSlide>
                          <SwiperSlide>
                            <Image
                              src={img5}
                              alt="productImg"
                              className="w-3/4 mx-auto"
                            />
                          </SwiperSlide>
                        </div>
                        <div className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal"></div>
                      </Swiper>
                    </div>
                    <div className="mt-5">
                      <h5 className="mb-2">$36.87</h5>
                      <h6 className="mb-1">
                        <Link
                          href="#!"
                          className="text-current link link-primary">
                          Bra Lace Crop top
                        </Link>
                      </h6>
                      <p className="text-gray-500 dark:text-dark-500">
                        Fashion
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 mt-3 grow">
                          <Link
                            href="#!"
                            className={`flex items-center justify-center text-white rounded-sm size-5 bg-primary-500 group/item ${
                              productColor === 1 ? 'active' : ''
                            }`}
                            onClick={() => setProductColor(1)}>
                            <Check className="size-4 hidden group-[&.active]/item:block" />
                          </Link>
                          <Link
                            href="#!"
                            className={`flex items-center justify-center text-white bg-pink-500 rounded-sm size-5 group/item ${
                              productColor === 2 ? 'active' : ''
                            } `}
                            onClick={() => setProductColor(2)}>
                            <Check className="size-4 hidden group-[&.active]/item:block" />
                          </Link>
                          <Link
                            href="#!"
                            className={`flex items-center justify-center text-white bg-green-500 rounded-sm size-5 group/item ${
                              productColor === 3 ? 'active' : ''
                            }`}
                            onClick={() => setProductColor(3)}>
                            <Check className="size-4 hidden group-[&.active]/item:block" />
                          </Link>
                          <Link
                            href="#!"
                            className={`flex items-center justify-center text-white bg-red-500 rounded-sm size-5 group/item ${
                              productColor === 4 ? 'active' : ''
                            }`}
                            onClick={() => setProductColor(4)}>
                            <Check className="size-4 hidden group-[&.active]/item:block" />
                          </Link>
                        </div>

                        <div className="flex items-center gap-2 mt-3 font-medium shrink-0">
                          <Link
                            href="#!"
                            className={`text-gray-500 dark:text-dark-500 [&.active]:text-green-500 ${
                              productSize === 1 ? 'active' : ''
                            }`}
                            onClick={() => setProductSize(1)}>
                            S
                          </Link>
                          <Link
                            href="#!"
                            className={`text-gray-500 dark:text-dark-500 [&.active]:text-green-500 ${
                              productSize === 2 ? 'active' : ''
                            }`}
                            onClick={() => setProductSize(2)}>
                            M
                          </Link>
                          <Link
                            href="#!"
                            className={`text-gray-500 dark:text-dark-500 [&.active]:text-green-500 ${
                              productSize === 3 ? 'active' : ''
                            }`}
                            onClick={() => setProductSize(3)}>
                            L
                          </Link>
                          <Link
                            href="#!"
                            className={`text-gray-500 dark:text-dark-500 [&.active]:text-green-500 ${
                              productSize === 4 ? 'active' : ''
                            }`}
                            onClick={() => setProductSize(4)}>
                            XL
                          </Link>
                          <Link
                            href="#!"
                            className={`text-gray-500 dark:text-dark-500 [&.active]:text-green-500 ${
                              productSize === 5 ? 'active' : ''
                            }`}
                            onClick={() => setProductSize(5)}>
                            2XL
                          </Link>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          className="w-full btn btn-primary">
                          Buy Now
                        </button>
                        <Link
                          href="#!"
                          className="btn btn-sub-gray btn-icon shrink-0">
                          <ShoppingBasket className="size-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </React.Fragment>
  )
}

CreateProduct.getLayout = (page: React.ReactElement): React.ReactElement => {
  return <Layout breadcrumbTitle="Create Product">{page}</Layout>
}

export default CreateProduct
