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
import { NextPageWithLayout } from '@src/dtos'
import { CrmContactItems } from '@src/dtos/apps/crm'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteContactListData, getContactData } from '@src/slices/thunk'
import { Download, Plus, Search, Trash } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditCrmContact from './AddEditCrmContact'

// add & edit modal
interface ModalState {
  showAddContactForm: boolean
  showEditContactForm: boolean
}
const CrmContact: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const { contact } = useSelector((state: RootState) => state.Contact)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [contactList, setContactList] = useState<CrmContactItems[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [currentContact, setCurrentContact] = useState<CrmContactItems | null>(
    null
  )
  const [modalState, setModalState] = useState<ModalState>({
    showAddContactForm: false,
    showEditContactForm: false,
  })
  const [selectAll, setSelectAll] = useState(false)
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [deleteRecord, setDeleteRecord] = useState<number[] | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const itemsPerPage = 8
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  useEffect(() => {
    if (contact === null) {
      dispatch(getContactData())
    } else {
      setContactList(contact)
    }
  }, [contact, dispatch])

  // Filter data based on search term
  const filteredData = contactList.filter(
    (item: CrmContactItems) =>
      item.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.company.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))
  const handleOpenModal = useCallback(
    (editMode: boolean = false, contact: CrmContactItems | null = null) => {
      setEditMode(editMode)
      setCurrentContact(contact)
      const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
      openModal(modalKey)
    },
    []
  )

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditContactForm' : 'showAddContactForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentContact(null)
  }

  const toggleDelete = () => {
    setShow(false)
    setDeleteRecord(null)
  }
  const onClickProjectDelete = (id: number) => {
    setDeleteRecord([id])
    setShow(true)
  }

  const handleRemoveProject = () => {
    if (deleteRecord !== null) {
      dispatch(deleteContactListData(deleteRecord))
      setDeleteRecord(null)
      setShow(false)
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
      setDeletedListData(filteredData.map((customer) => customer.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, filteredData])

  const handleRemoveSelectedRecords = () => {
    dispatch(deleteContactListData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Customer':
        return 'badge badge-pink'
      case 'Personal':
        return 'badge badge-yellow'
      case 'Employee':
        return 'badge badge-sky'
      case 'Marketing':
        return 'badge badge-purple'
      default:
        return 'badge'
    }
  }

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
        cell: ({ row }: { row: { original: CrmContactItems } }) => (
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
        accessorKey: 'contact_id',
      },
      {
        header: 'Name',
        accessorKey: 'contactName',
        cell: (value: { row: { original: CrmContactItems } }) => {
          return (
            <>
              <div className="flex items-center gap-2">
                <Image
                  src={value.row.original.image}
                  alt="avatar"
                  className="rounded-full shrink-0 size-9"
                  height={36}
                  width={36}
                />
                <div className="grow">
                  <h6>
                    <Link
                      href="#!"
                      className="text-current link link-primary grow">
                      {' '}
                    </Link>
                  </h6>
                  <p className="text-sm text-gray-500 dark:text-dark-500">
                    {value.row.original.phoneNumber}
                  </p>
                </div>
              </div>
            </>
          )
        },
      },
      {
        header: 'Company',
        accessorKey: 'company',
      },
      {
        header: 'Role',
        accessorKey: 'role',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Website',
        accessorKey: 'website',
        cell: () => (
          <Link href="#!" className="badge badge-gray">
            {/*{value.getValue()}*/}
          </Link>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: CrmContactItems } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: (value: { row: { original: CrmContactItems } }) => (
          <>
            <Dropdown
              position="right"
              trigger="click"
              dropdownClassName="dropdown">
              <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
                <i className="ri-more-2-fill"></i>
              </DropdownButton>
              <DropdownMenu>
                <Link href="#!" className="dropdown-item ">
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>
                  <span>Overview</span>
                </Link>

                <Link
                  href="#!"
                  className="dropdown-item "
                  onClick={(e) => {
                    e.preventDefault()
                    handleOpenModal(true, value.row.original)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>
                  <span>Edit</span>
                </Link>
                <Link
                  href="#!"
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault()
                    onClickProjectDelete(value.row.original.id)
                  }}>
                  <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
                  <span>Delete</span>
                </Link>
              </DropdownMenu>
            </Dropdown>
          </>
        ),
      },
    ],
    [selectAll, deletedListData, handleOpenModal, handleSelectAll]
  )

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData && filteredData.length > 0
      ? filteredData.slice(startIndex, startIndex + itemsPerPage)
      : []
  }, [filteredData, currentPage, itemsPerPage])

  return (
    <React.Fragment>
      <BreadCrumb title="Contact" subTitle="CRM" />
      <div>
        <div className="card">
          {/* card header */}
          <div className="card-header">
            <div className="flex flex-wrap justify-between gap-5">
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
                <div className="flex flex-wrap gap-2">
                  {deletedListData.length > 0 && (
                    <button
                      className="btn btn-red btn-icon"
                      onClick={handleRemoveSelectedRecords}>
                      <Trash className="inline-block size-4" />
                    </button>
                  )}
                  <button type="button" className="btn btn-sub-gray">
                    <Download className="inline-block size-4" />
                    <span className="align-baseline">Export</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      openModal('showAddContactForm')
                    }}>
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline">Add Contact</span>
                  </button>
                  {/* dropdown */}
                </div>
              </div>
            </div>
          </div>

          {/* card body */}
          <div className="card-body">
            <div>
              <TableContainer
                columns={columns}
                data={paginatedEvents}
                thClass="!font-medium cursor-pointer"
                isSearch={false}
                divClass="overflow-x-auto"
                tableClass="table whitespace-nowrap"
                PaginationClassName="pagination-container"
                thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                isTableFooter={false}
              />
              {filteredData.length !== 0 && (
                <Pagination
                  totalItems={
                    filteredData && filteredData.length > 0
                      ? filteredData.length
                      : filteredData.length
                  }
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Edit Delete Modal */}
      <AddEditCrmContact
        modalState={modalState}
        closeModal={handleCloseModal}
        contactList={contactList}
        editMode={editMode}
        currentContact={currentContact}
      />

      <ToastContainer
        theme={layoutMode}
        rtl={layoutDirection === LAYOUT_DIRECTION.RTL}
        position={
          layoutDirection === LAYOUT_DIRECTION.RTL ? 'top-left' : 'top-right'
        }
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleRemoveProject}
      />
    </React.Fragment>
  )
}

export default CrmContact
