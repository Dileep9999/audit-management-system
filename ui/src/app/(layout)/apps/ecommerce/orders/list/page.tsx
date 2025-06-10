'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

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
import { NextPageWithLayout, OrderListItem } from '@src/dtos'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteOrderData, getOrderData } from '@src/slices/thunk'
import OrderWidgets from '@src/views/Apps/order/OrderWidgets'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditOrder from './AddEditOrder'
import OrderListTab from './OrderListTab'
import OverviewModal from './OverviewModal'

const OrderList: NextPageWithLayout = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { orderList } = useSelector((state: RootState) => state.Order)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [ordersWithID] = useState<OrderListItem[]>([])
  const [activeTab, setActiveTab] = useState('All')
  const [, setSortedOrders] = useState<OrderListItem[]>([])
  const [editMode, setEditMode] = useState(false)
  const [currentOrderList, setCurrentOrderList] =
    useState<OrderListItem | null>(null)
  const [deletedListData, setDeletedListData] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletedRecord, setDeletedRecord] = useState<number[] | null>(null)
  const [modalState, setModalState] = useState<{
    showAddOrderForm: boolean
    showEditOrderForm: boolean
  }>({
    showAddOrderForm: false,
    showEditOrderForm: false,
  })
  // filter orders
  const filteredOrders = useMemo(() => {
    return activeTab === 'All'
      ? orders
      : orders.filter((order) => order.status === activeTab)
  }, [activeTab, orders])

  // pagination
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents =
    filteredOrders && filteredOrders.length > 0
      ? filteredOrders.slice(startIndex, startIndex + itemsPerPage)
      : []

  useEffect(() => {
    if (!orderList) {
      dispatch(getOrderData())
    } else {
      setOrders(orderList)
    }
  }, [orderList, dispatch])

  useEffect(() => {
    setSortedOrders(ordersWithID)
  }, [ordersWithID])

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenOverviewEditModal = useCallback(
    (editMode: boolean = false, orderList: OrderListItem | null = null) => {
      setEditMode(editMode)
      setCurrentOrderList(orderList)
      const modalKey = editMode ? 'showEditOrderForm' : 'showAddOrderForm'
      openModal(modalKey)
    },
    []
  )
  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditOrderForm' : 'showAddOrderForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentOrderList(null)
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
      setDeletedListData(orderList.map((order: { id: number }) => order.id))
    }
    setSelectAll((prev) => !prev)
  }, [selectAll, orderList])

  const handleDeleteRecord = (id: number) => {
    setIsModalOpen(true)
    setDeletedRecord([id])
  }
  // delete multiple records
  const handleRemoveSelectedRecords = () => {
    dispatch(deleteOrderData(deletedListData))
    setDeletedListData([])
    setSelectAll(false)
  }
  // set customer delete record
  const setDeleteRecord = () => {
    if (deletedRecord && isModalOpen) {
      dispatch(deleteOrderData(deletedRecord))
      setIsModalOpen(false)
      setDeletedRecord(null)
    }
  }

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'Delivered':
        return 'badge badge-green'
      case 'New':
        return 'badge badge-primary'
      case 'Cancelled':
        return 'badge badge-red'
      case 'Shipping':
        return 'badge badge-purple'
      default:
        return 'badge badge-yellow'
    }
  }

  const getPaymentClass = (payment: string | undefined) => {
    switch (payment) {
      case 'Paid':
        return 'badge badge-green'
      case 'COD':
        return 'badge badge-gray'
      case 'Unpaid':
        return 'badge badge-red'
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
        cell: ({ row }: { row: { original: OrderListItem } }) => (
          <input
            className="input-check input-check-primary"
            type="checkbox"
            checked={deletedListData.includes(row.original.id)}
            onChange={() => handleSelectRecord(row.original.id)}
          />
        ),
      },
      {
        header: () => 'Order ID',
        accessorKey: 'ordersID',
        cell: ({ row }: { row: { original: OrderListItem } }) => {
          return (
            <Link href="#!" className="link link-primary">
              {row.original.ordersID}
            </Link>
          )
        },
      },
      {
        header: 'Order Date',
        accessorKey: 'ordersDate',
      },
      {
        header: 'Delivered Date',
        accessorKey: 'deliveredDate',
      },
      {
        header: 'Customers',
        accessorKey: 'customersName',
      },
      {
        header: 'Product',
        accessorKey: 'productName',
      },
      {
        header: 'Payment',
        accessorKey: 'payment',
        cell: ({ row }: { row: { original: OrderListItem } }) => {
          const payment = row.original.payment
          return <span className={getPaymentClass(payment)}>{payment}</span>
        },
      },
      {
        header: 'Total',
        accessorKey: 'total',
      },
      {
        header: 'QTY',
        accessorKey: 'qty',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: { row: { original: OrderListItem } }) => {
          const { status } = row.original
          return <span className={getStatusClass(status)}>{status}</span>
        },
      },
      {
        header: 'Action',
        accessorKey: '',
        cell: ({ row }: { row: { original: OrderListItem } }) => (
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
                  handleOpenOverviewModal(true, row.original)
                }}>
                <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
                <span>Overview</span>
              </Link>
              <Link
                href="#!"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenOverviewEditModal(true, row.original)
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
    [deletedListData, selectAll, handleOpenOverviewEditModal, handleSelectAll]
  )

  const [overviewShow, setOverviewShow] = useState(false)

  const handleOpenOverviewModal = (
    overview: boolean,
    orderList: OrderListItem | null = null
  ) => {
    setOverviewShow(overview)
    setCurrentOrderList(orderList)
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Orders List" subTitle="Orders" />
      <div>
        <OrderWidgets />
        <div>
          <OrderListTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openModal={openModal}
            deletedListData={deletedListData}
            handleRemoveSelectedRecords={handleRemoveSelectedRecords}
          />
          <div className="card">
            <div className="pt-0 card-body">
              <div>
                <TableContainer
                  columns={columns}
                  data={paginatedEvents || []}
                  thClass="!font-medium whitespace-nowrap cursor-pointer"
                  isSearch={false}
                  divClass="overflow-x-auto table-box"
                  tableClass="table hovered"
                  PaginationClassName="grid grid-cols-12 gap-5 mb-5 items-center"
                  thtrClass="text-gray-500 bg-gray-100 dark:bg-dark-850 dark:text-dark-500"
                  isTableFooter={false}
                />
                {filteredOrders.length != 0 && (
                  <Pagination
                    totalItems={filteredOrders.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
          {/* Add Edit Modal */}
          <AddEditOrder
            modalState={modalState}
            closeModal={handleCloseModal}
            orders={orders}
            editMode={editMode}
            currentOrderList={currentOrderList}
          />

          {/* Overview Modal */}
          <OverviewModal
            overviewShow={overviewShow}
            closeOverviewModal={() => setOverviewShow(false)}
            selectedOrder={currentOrderList || ({} as OrderListItem)}
            handleOpenOverviewEditModal={handleOpenOverviewEditModal}
          />

          {/* delete record Modal */}
          <DeleteModal
            show={isModalOpen}
            handleHide={() => setIsModalOpen(false)}
            deleteModalFunction={setDeleteRecord}
          />
        </div>
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

export default OrderList
