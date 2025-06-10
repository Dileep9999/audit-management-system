'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

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
import { CategoryItems, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteCategoryData, getCategoryData } from '@src/slices/thunk'
import { Search, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditCategory from './AddEditCategory'

const CategoryList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { categoryList } = useSelector((state: RootState) => state.Category)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [categoryData, setCategoryData] = useState<CategoryItems[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentCategoryList, setCurrentCategoryList] = useState<
    CategoryItems | null | undefined
  >(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)

  useEffect(() => {
    if (!categoryList) {
      dispatch(getCategoryData())
    } else {
      setCategoryData(categoryList)
    }
  }, [categoryList, dispatch])
  // Filter data based on search term
  const filteredData = categoryData.filter(
    (item: CategoryItems) =>
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const handleOpenEditModal = (
    editMode: boolean = false,
    orderList: CategoryItems | null = null
  ) => {
    setEditMode(editMode)
    setCurrentCategoryList(orderList)
  }
  // Status badge styling function
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'badge badge-green'
      case 'Inactive':
        return 'badge badge-gray'
      default:
        return 'badge'
    }
  }
  const handleSelectRecord = (id: number) => {
    setDeletedListData((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setDeletedListData([])
    } else {
      setDeletedListData(categoryData.map((order: { id: number }) => order.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, categoryData])

  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }
  // delete multiple records
  const handleRemoveSelectedRecords = () => {
    dispatch(deleteCategoryData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
    setCurrentCategoryList(null)
  }
  // set customer delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteCategoryData(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
      setEditMode(false)
    }
  }

  // Table column definitions with memoization
  const columns = useMemo(
    () => [
      {
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
        cell: ({ row }: { row: { original: CategoryItems } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: () => 'Category ID',
        accessorKey: 'categoryID',
        cell: ({ row }: { row: { original: CategoryItems } }) => (
          <Link href="#!" className="link link-primary">
            {row.original.categoryID}
          </Link>
        ),
      },
      {
        header: () => 'Category Name',
        accessorKey: 'category',
        cell: ({ row }: { row: { original: CategoryItems } }) => {
          const { category, image } = row.original
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center p-1 border border-gray-200 rounded-sm size-9 dark:border-dark-800 shrink-0">
                <Image
                  src={image}
                  alt={category}
                  height={26}
                  width={26}
                  className="rounded-sm"
                />
              </div>
              <h6>
                <Link
                  href="#!"
                  className="text-gray-800 link-primary dark:text-white">
                  {category}
                </Link>
              </h6>
            </div>
          )
        },
      },
      {
        header: () => 'Products',
        accessorKey: 'products',
      },
      {
        header: () => 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: () => 'Action',
        accessorKey: 'actions',
        cell: ({ row }) => (
          <Dropdown
            position="right"
            trigger="click"
            dropdownClassName="dropdown">
            <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
              <i className="ri-more-2-fill"></i>
            </DropdownButton>
            <DropdownMenu>
              <Link href="#!" className="dropdown-item">
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                Overview
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenEditModal(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                Edit
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(row.original.id)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>{' '}
                Delete
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [deletedListData, handleSelectAll, selectAll]
  )
  // pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    filteredData && filteredData.length > 0
      ? filteredData.slice(startIndex, startIndex + itemsPerPage)
      : []

  return (
    <React.Fragment>
      <BreadCrumb title="Category List" subTitle="Ecommerce" />
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          <div className="card">
            {/* search */}
            <div className="card-header">
              <div className="grid items-center grid-cols-12 gap-3">
                <div className="col-span-3">
                  <h6 className="card-title">Category List</h6>
                </div>

                <div className="col-span-4 col-start-9">
                  <div className="flex gap-2">
                    <div className="relative group/form grow">
                      <input
                        type="text"
                        className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                        placeholder="Search for ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                        <Search className="size-4"></Search>
                      </button>
                    </div>
                    {deletedListData.length > 0 && (
                      <button
                        className="btn btn-red btn-icon"
                        onClick={handleRemoveSelectedRecords}>
                        <Trash className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="pt-0 card-body">
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

        {/* Add & Edit Category Modal */}
        <AddEditCategory
          currentcategoryList={currentCategoryList || undefined}
          editMode={editMode}
          categoryData={categoryData}
        />
      </div>

      {/* modal */}
      <DeleteModal
        show={isModalOpen}
        handleHide={() => setIsModalOpen(false)}
        deleteModalFunction={setDeleteRecord}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />
    </React.Fragment>
  )
}

export default CategoryList
