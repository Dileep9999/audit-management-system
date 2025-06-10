'use client'

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

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
import { CustomerRecord, NextPageWithLayout } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import {
  deleteCustomerProductListData,
  getCustomerProductData,
} from '@src/slices/thunk'
import { Plus, Search, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditNewCustomer from './AddEditCustomer'
import OverviewCustomer from './OverviewCustomer'

interface ModalState {
  showAddCustomerForm: boolean
  showEditCustomerForm: boolean
}

const CustomerList: NextPageWithLayout = () => {
  const { customerList } = useSelector((state: RootState) => state.CustomerList)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )

  const dispatch = useDispatch<AppDispatch>()

  const [customerListData, setCustomerListData] = useState<CustomerRecord[]>([])
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerRecord | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false)
  const [modalState, setModalState] = useState<ModalState>({
    showAddCustomerForm: false,
    showEditCustomerForm: false,
  })

  useEffect(() => {
    if (!customerList) {
      dispatch(getCustomerProductData())
    } else {
      setCustomerListData(customerList)
    }
  }, [customerList, dispatch])
  // pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    customerListData && customerListData.length > 0
      ? customerListData.slice(startIndex, startIndex + itemsPerPage)
      : []

  // search customer
  const handleSearchCustomer = (value: string) => {
    setSearchValue(value)

    if (value.trim() !== '') {
      const filteredCustomers = customerList.filter((item: CustomerRecord) => {
        return (
          item.firstName.toLowerCase().includes(value.toLowerCase()) ||
          item.lastName.toLowerCase().includes(value.toLowerCase()) ||
          item.email.toLowerCase().includes(value.toLowerCase()) ||
          item.gender.toLowerCase().includes(value.toLowerCase()) ||
          item.phoneNumber.toLowerCase().includes(value.toLowerCase()) ||
          item.location.toLowerCase().includes(value.toLowerCase())
        )
      })
      setCustomerListData(filteredCustomers)
    } else {
      setCustomerListData(customerList)
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
      setDeletedListData(customerListData.map((customer) => customer.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, customerListData])

  // delete multiple records
  const handleRemoveSelectedRecords = () => {
    dispatch(deleteCustomerProductListData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  // open modal of add or edit
  const handleOpenModal = useCallback(
    (editMode: boolean = false, customer: CustomerRecord | null = null) => {
      setEditMode(editMode)
      setCurrentCustomer(customer)
      const modalKey = editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
      openModal(modalKey)
    },
    []
  )
  // close modal
  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditCustomerForm' : 'showAddCustomerForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentCustomer(null)
  }
  // status badge
  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'badge badge-green'
      case 'Inactive':
        return 'badge badge-red'
      default:
        return 'badge'
    }
  }

  // handle customer delete record
  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }
  // set customer delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteCustomerProductListData(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }
  // handle customer overview
  const handleCustomerOverview = (
    modal: boolean = false,
    customer: CustomerRecord | null = null
  ) => {
    setCurrentCustomer(customer)
    setIsOverviewModalOpen(modal)
  }
  // close overview modal
  const handleCloseOverview = () => {
    setIsOverviewModalOpen(false)
    setCurrentCustomer(null)
    setEditMode(false)
  }
  // handle customer edit
  const handleEditModeOverview = () => {
    setIsOverviewModalOpen(false)
    setEditMode(true)
    openModal('showEditCustomerForm')
  }

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
        cell: ({ row }: { row: { original: CustomerRecord } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: 'ID',
        accessorKey: 'customerId',
      },
      {
        header: 'Name',
        accessorKey: 'customersName',
        cell: ({ row }: { row: { original: CustomerRecord } }) => (
          <div className="flex items-center gap-2">
            <Image
              src={row.original.image}
              alt="customerImg"
              className="rounded-full shrink-0 size-8"
              width={32}
              height={32}
            />
            <Link href="#!" className="text-current link link-primary grow">
              {row.original.firstName} {row.original.lastName}
            </Link>
          </div>
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Phone Number',
        accessorKey: 'phoneNumber',
      },
      {
        header: 'Subscriber',
        accessorKey: 'subscriber',
      },
      {
        header: 'Gender',
        accessorKey: 'gender',
      },
      {
        header: 'Location',
        accessorKey: 'location',
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: CustomerRecord } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        id: 'actions',
        header: () => 'Action',
        accessorKey: 'action',
        cell: ({ row }: { row: { original: CustomerRecord } }) => (
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
                  handleCustomerOverview(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                <span>Overview</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenModal(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
                <span>Edit</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleDeleteRecord(row.original.id)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                <span>Delete</span>
              </Link>
            </DropdownMenu>
          </Dropdown>
        ),
      },
    ],
    [deletedListData, selectAll, handleOpenModal, handleSelectAll]
  )

  return (
    <React.Fragment>
      <BreadCrumb title="List View" subTitle="Customers" />
      <div>
        <div className="grid items-center grid-cols-12 gap-3 xl:gap-5 mb-3">
          <div className="col-span-12 xl:col-span-5 2xl:col-span-7">
            <h6 className="card-title mb-0">Customer List</h6>
          </div>
          <div className="flex flex-wrap xl:flex-nowrap xl:justify-end col-span-12 gap-3 xl:col-span-7 2xl:col-span-5">
            {deletedListData.length > 0 && (
              <button
                className="btn btn-red btn-icon"
                onClick={handleRemoveSelectedRecords}>
                <Trash className="inline-block size-4" />
              </button>
            )}
            <div className="relative group/form">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input"
                placeholder="Search name, email, gender, etc..."
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleSearchCustomer(e.target.value)
                }
                value={searchValue}
              />
              <span className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3">
                <Search className="size-4" />
              </span>
            </div>
            <button
              className="btn btn-primary"
              data-modal-target="addCustomerModals"
              onClick={() => openModal('showAddCustomerForm')}>
              <Plus className="inline-block ltr:mr-1 rtl:ml-1 size-4" /> New
              Customer
            </button>
          </div>
        </div>
        <div>
          <TableContainer
            columns={columns}
            data={paginatedEvents}
            thClass="!font-medium"
            isSearch={false}
            divClass="overflow-x-auto"
            tableClass="table border-separate hovered flush border-spacing-y-2 whitespace-nowrap"
            tbodyClass="*:bg-gray-50 dark:*:bg-dark-900 *:rounded-md"
            PaginationClassName="pagination-container"
            thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-800 dark:text-dark-500"
            isTableFooter={false}
          />
          {customerListData.length != 0 && (
            <Pagination
              totalItems={customerListData.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Add Edit Customer Modal */}
        <AddEditNewCustomer
          modalState={modalState}
          closeModal={handleCloseModal}
          customerList={customerList}
          editMode={editMode}
          currentCustomer={currentCustomer}
        />

        {/* overview customer Modal */}
        <OverviewCustomer
          show={isOverviewModalOpen}
          handleClose={handleCloseOverview}
          currentCustomer={currentCustomer}
          editMode={editMode}
          handleEditMode={handleEditModeOverview}
        />

        {/* delete record Modal */}
        <DeleteModal
          show={isModalOpen}
          handleHide={() => setIsModalOpen(false)}
          deleteModalFunction={setDeleteRecord}
        />
      </div>

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

export default CustomerList
