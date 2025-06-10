'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import Pagination from '@src/components/common/Pagination'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import TableContainer from '@src/components/custom/table/table'
import { OptionType } from '@src/data/ecommerce/product-list'
import { NextPageWithLayout, ProductListItem } from '@src/dtos'
import { ProductOptions } from '@src/dtos/apps/products'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteProductListData,
  getProductListData,
  setCurrentProductList,
  setEditModeProductList,
  setProductListStatus,
} from '@src/slices/thunk'
import { Download, Filter, LayoutGrid, Plus, Search, Trash } from 'lucide-react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { ToastContainer } from 'react-toastify'

const List: NextPageWithLayout = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { productList } = useSelector((state: RootState) => state.ProductList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [allProductList, setAllProductList] = React.useState<ProductListItem[]>(
    []
  )
  const [selectedProductOption, setSelectedProductOption] =
    useState<OptionType | null>(null)
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPublishedFilter, setIsPublishedFilter] = useState(false)
  const [isInactiveFilter, setIsInactiveFilter] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({
    isPublished: false,
    isInactive: false,
  })
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (!productList) {
      dispatch(getProductListData())
    } else {
      setAllProductList(productList)
    }
  }, [productList, dispatch])

  const handleChangeStatusProduct = useCallback(
    (product: ProductListItem) => {
      dispatch(setProductListStatus(product))
    },
    [dispatch]
  )

  const handleEditProduct = useCallback(
    (product: ProductListItem) => {
      dispatch(setEditModeProductList(true))
      dispatch(setCurrentProductList(product))
      router.push('/apps/ecommerce/products/create-products')
    },
    [dispatch, router]
  )

  const handleAddProduct = () => {
    dispatch(setEditModeProductList(false))
    localStorage.setItem('previousPage', '/apps/ecommerce/products/list')
    router.push('/apps/ecommerce/products/create-products')
  }

  // status color
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Published':
        return 'badge badge-green'
      case 'Inactive':
        return 'badge badge-gray'
      default:
        return 'badge'
    }
  }

  // set multiple delete records
  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // select all or unselect all
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(
        allProductList.map((order: { id: number }) => order.id)
      )
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, allProductList])

  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }

  // delete multiple records
  const handleRemoveSelectedRecords = () => {
    dispatch(deleteProductListData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }

  // set customer delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteProductListData(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  // overview
  const handleOverviewProduct = useCallback(
    (product: ProductListItem) => {
      dispatch(setCurrentProductList(product))
      router.push('/apps/ecommerce/products/overview')
    },
    [dispatch, router]
  )

  // handle select product
  const handleSelectProduct = (selectedOption: OptionType | null) => {
    setSelectedProductOption(selectedOption)
  }

  // table header
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            id="checkboxAll"
            className="input-check input-check-primary"
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
        ),
        accessorKey: 'id',
        enableSorting: false,
        cell: ({ row }: { row: { original: ProductListItem } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: () => 'Product ID',
        accessorKey: 'productId',
      },
      {
        header: () => 'Product',
        accessorKey: 'productName',
        cell: (value: { row: { original: ProductListItem } }) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-1 border border-gray-200 rounded-sm dark:border-dark-800 size-9">
              <Image
                src={value.row.original.image1}
                alt="productImg"
                className="rounded-sm"
                width={26}
                height={26}
              />
            </div>
            <h6>
              <Link href="#"></Link>
              {value.row.original.productName}
            </h6>
          </div>
        ),
      },
      {
        header: () => 'Category',
        accessorKey: 'category',
      },
      {
        id: 'stock',
        header: () => 'Stock',
        accessorKey: 'stock',
        cell: (value: { row: { original: ProductListItem } }) => (
          <label className="switch-group switch-soft">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={value.row.original.status === 'Published'}
                onChange={() => handleChangeStatusProduct(value.row.original)}
              />
              <div className="switch-wrapper peer-checked:!bg-purple-500/15"></div>
              <div className="switch-dot peer-checked:translate-x-full rtl:peer-checked:-translate-x-full peer-checked:!bg-purple-500"></div>
            </div>
          </label>
        ),
      },
      {
        header: () => 'Price',
        accessorKey: 'price',
        cell: (value: { getValue: () => number }) => (
          <span>${value.getValue()}</span>
        ),
      },
      {
        header: () => 'QTY',
        accessorKey: 'qty',
      },
      {
        header: () => 'Revenue',
        accessorKey: 'revenue',
        cell: (value: { getValue: () => number }) => (
          <Link href="#!">{value.getValue()}</Link>
        ),
      },
      {
        header: () => 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: ProductListItem } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'action',
        cell: (value: { row: { original: ProductListItem } }) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleOverviewProduct(value.row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>
                <span>Overview</span>
              </Link>

              <button
                className="dropdown-item "
                onClick={() => handleEditProduct(value.row.original)}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>
                <span>Edit</span>
              </button>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(value.row.original.id)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [
      deletedListData,
      handleChangeStatusProduct,
      handleEditProduct,
      handleOverviewProduct,
      handleSelectAll,
      selectAll,
    ]
  )

  // Filter data based on search term and applied filters
  const filteredData = useMemo(() => {
    return allProductList.filter((item) => {
      const matchesSearchTerm =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPriceRange =
        item.price >= priceRange[0] && item.price <= priceRange[1]

      const matchesTypeProducts =
        !selectedProductOption ||
        selectedProductOption.value === 'All' ||
        item.category === selectedProductOption.value
      const matchesPublishedFilter = appliedFilters.isPublished
        ? item.status === 'Published'
        : true
      const matchesInactiveFilter = appliedFilters.isInactive
        ? item.status === 'Inactive'
        : true

      return (
        matchesSearchTerm &&
        matchesTypeProducts &&
        matchesPublishedFilter &&
        matchesInactiveFilter &&
        matchesPriceRange
      )
    })
  }, [
    allProductList,
    searchTerm,
    appliedFilters,
    selectedProductOption,
    priceRange,
  ])

  const handlePublishedFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsPublishedFilter(e.target.checked)
  }

  const handleInactiveFilterChange = (e: {
    target: { checked: boolean | ((prevState: boolean) => boolean) }
  }) => {
    setIsInactiveFilter(e.target.checked)
  }

  // Handle the apply button click
  const handleApplyFilters = () => {
    setAppliedFilters({
      isPublished: isPublishedFilter,
      isInactive: isInactiveFilter,
    })
  }

  // Handle reset button click
  const handleResetFilters = () => {
    setIsPublishedFilter(false)
    setIsInactiveFilter(false)
    setAppliedFilters({
      isPublished: false,
      isInactive: false,
    })
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  // handle slider based set filter
  const handleSliderChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange([value[0], value[1]])
    }
  }

  // Export CSV file based on productlist
  const exportTable = () => {
    if (!productList || productList.length === 0) return

    // Prepare CSV headers based on ProductListItem interface
    const headers = [
      'id',
      'productId',
      'productName',
      'description',
      'category',
      'price',
      'discount',
      'count',
      'selling_price',
      'revenue',
      'color',
      'size',
      'colors',
      'gender',
      'stock',
      'qty',
      'image1',
      'image2',
      'image3',
      'status',
      'payment_method',
      'brand',
      'activeColor',
      'activeSize',
    ]
    // Map header keys to CSV header row
    let csvContent = headers.join(',') + '\n'
    // Map each product's values to a CSV row
    productList.forEach((product: ProductListItem) => {
      const row = headers.map((header) => {
        const value = product[header as keyof ProductListItem]
        // Convert arrays to string and handle image data
        if (Array.isArray(value)) {
          return `"${value.join(',')}"` // Join arrays as comma-separated values
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value)}"` // Stringify objects
        }
        return `"${value}"` // Ensure other fields are wrapped in quotes for CSV
      })
      csvContent += row.join(',') + '\n'
    })
    // Create Blob and download URL
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = 'products.csv'
    link.click()
    // Clean up URL object
    URL.revokeObjectURL(url)
  }

  return (
    <React.Fragment>
      <BreadCrumb subTitle="Ecommerce" title="Products List" />
      <div className="card">
        <div className="card-header">
          <div className="flex flex-wrap items-center gap-5">
            <div className="grow">
              <h6 className="mb-1 card-title">Products List</h6>
              <p className="text-gray-500 dark:text-dark-500">
                Track your store&apos;s progress to boost your sales.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button className="btn btn-sub-gray" onClick={exportTable}>
                <Download className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />{' '}
                Export
              </button>
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault()
                  handleAddProduct()
                }}>
                <Plus className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />{' '}
                Add Product
              </button>
              <Link
                href="/apps/ecommerce/products/grid"
                className="btn btn-purple btn-icon">
                <LayoutGrid className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <div className="relative group/form">
                <input
                  type="text"
                  className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                  placeholder="Search for ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                  <Search className="size-4" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                {deletedListData.length > 0 && (
                  <button
                    className="btn btn-red btn-icon"
                    onClick={handleRemoveSelectedRecords}>
                    <Trash className="inline-block size-4" />
                  </button>
                )}
                <div id="sampleSelect" className="grow">
                  <Select
                    classNamePrefix="select"
                    options={ProductOptions}
                    value={selectedProductOption}
                    onChange={handleSelectProduct}
                    placeholder="Sorting by class"
                    isClearable={true}
                  />
                </div>
                {/* filter */}
                <Dropdown
                  position="right"
                  trigger="click"
                  dropdownClassName="dropdown"
                  closeOnOutsideClick={false}>
                  <DropdownButton colorClass="btn btn-sub-gray">
                    <Filter className="inline-block ltr:mr-1 rtl:ml-1 align-center size-4" />
                    Filters
                  </DropdownButton>
                  <DropdownMenu menuClass="!w-64 p-3">
                    <h6 className="mb-4">Filter Options</h6>

                    <form onSubmit={(e) => e.preventDefault()}>
                      <h6 className="mb-2 text-sm">Status</h6>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="input-check-group">
                          <input
                            id="publishedCheckboxFilter"
                            className="input-check input-check-primary"
                            type="checkbox"
                            value="Published"
                            checked={isPublishedFilter}
                            onChange={handlePublishedFilterChange}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor="publishedCheckboxFilter"
                            className="input-check-label">
                            Published
                          </label>
                        </div>
                        <div className="input-check-group">
                          <input
                            id="inactiveCheckboxFilter"
                            className="input-check input-check-primary"
                            type="checkbox"
                            value="Inactive"
                            checked={isInactiveFilter}
                            onChange={handleInactiveFilterChange}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor="inactiveCheckboxFilter"
                            className="input-check-label">
                            Inactive
                          </label>
                        </div>
                        <div className="col-span-2">
                          <label className="mb-3 form-label">Price Range</label>
                          <div>
                            <Slider
                              range
                              min={0}
                              max={100000}
                              defaultValue={priceRange}
                              onChange={handleSliderChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 mt-5">
                        <button
                          type="reset"
                          className="btn-sm btn btn-sub-gray"
                          onClick={handleResetFilters}>
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="btn-sm btn btn-primary"
                          onClick={handleApplyFilters}>
                          Apply
                        </button>
                      </div>
                    </form>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* main table  */}
        <div className="pt-0 card-body">
          <div>
            <TableContainer
              columns={columns}
              data={paginatedEvents}
              thClass="!font-medium cursor-pointer"
              isSearch={false}
              divClass="overflow-x-auto table-box"
              tableClass="table hovered"
              PaginationClassName="pagination-container"
              thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
              isTableFooter={false}
            />
            {filteredData.length != 0 && (
              <Pagination
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        show={isModalOpen}
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />
    </React.Fragment>
  )
}

export default List
