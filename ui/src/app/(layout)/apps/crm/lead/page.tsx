'use client'

import React, { ChangeEvent, useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DropResult,
  Droppable,
  DroppableProvided,
} from '@hello-pangea/dnd'
import BreadCrumb from '@src/components/common/BreadCrumb'
import DeleteModal from '@src/components/common/DeleteModal'
import { LAYOUT_DIRECTION } from '@src/components/constants/layout'
import { LeadItem, NextPageWithLayout } from '@src/dtos'
import { ModalState } from '@src/dtos/apps/crmlead'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { deleteLeadData, getLeadData } from '@src/slices/thunk'
import { Plus, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import SimpleBar from 'simplebar-react'

import AddEditCrmLead from './AddEditCrmLead'

const CrmLead: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()
  const { lead } = useSelector((state: RootState) => state.Lead)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [modalState, setModalState] = useState<ModalState>({
    showAddLeadForm: false,
    showEditLeadForm: false,
  })
  const statusOrders = ['New', 'Hot', 'Pending', 'Lost']
  const statusClasses = [
    'badge-sky',
    'badge-red',
    'badge-green',
    'badge-purple',
  ]
  const [searchTerm, setSearchTerm] = useState('')
  const [leads, setLeads] = useState<number[] | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [editMode, setEditMode] = useState(false)
  const [currentLead, setCurrentLead] = useState<LeadItem | null>(null)
  const [leadList, setLeadList] = useState<LeadItem[]>([])

  useEffect(() => {
    if (!lead) {
      dispatch(getLeadData())
    } else {
      setLeadList(lead)
    }
  }, [lead, dispatch])
  // Group items by status
  const groupedItems = leadList.reduce(
    (acc: { [key: string]: LeadItem[] }, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    },
    {}
  )
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    // If there's no destination (dropped outside a list), do nothing
    if (!destination) return
    // If the source and destination are the same, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }
    const sourceStatus = source.droppableId
    const destinationStatus = destination.droppableId
    // Find the item that was dragged
    const draggedItem = leadList.find(
      (item) =>
        item.status === sourceStatus &&
        item.id === groupedItems[sourceStatus][source.index].id
    )
    if (!draggedItem) return
    // Update the item's status to the destination status
    const updatedItem = { ...draggedItem, status: destinationStatus }
    // Remove the item from the source group
    const updatedSourceGroup = [...groupedItems[sourceStatus]]
    updatedSourceGroup.splice(source.index, 1)
    // Insert the item into the destination group at the new position
    const updatedDestinationGroup = [...groupedItems[destinationStatus]]
    updatedDestinationGroup.splice(destination.index, 0, updatedItem)
    // Rebuild the leadList with the updated groups
    const updatedLeadList = [
      ...leadList.filter(
        (item) =>
          item.status !== sourceStatus && item.status !== destinationStatus
      ),
      ...updatedSourceGroup,
      ...updatedDestinationGroup,
    ]
    // Update the state with the new leadList
    setLeadList(updatedLeadList)
  }

  const toggleDelete = () => {
    setShow(false)
    setLeads(null)
  }

  const onClickLeadDelete = (id: number) => {
    setLeads([id])
    setShow(true)
  }

  const handleDeleteLead = () => {
    if (leads) {
      dispatch(deleteLeadData(leads))
      setShow(false)
    }
  }

  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = (
    editMode: boolean = false,
    lead: LeadItem | null = null
  ) => {
    setEditMode(editMode)
    setCurrentLead(lead)
    const modalKey = editMode ? 'showEditLeadForm' : 'showAddLeadForm'
    openModal(modalKey)
  }

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditLeadForm' : 'showAddLeadForm'
    closeModal(modalKey)
    setEditMode(false)
    setCurrentLead(null)
  }
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim() === '') {
      setLeadList(lead)
      return
    } else {
      const filteredData = leadList.filter(
        (item: LeadItem) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setLeadList(filteredData)
    }
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Lead" subTitle="CRM" />
      <div>
        <div className="card">
          <div className="card-header">
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-6 xl:col-span-9">
                <div className="relative group/form w-full xl:max-w-[300px]">
                  <input
                    type="text"
                    className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                    placeholder="Search for leads..."
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleSearch(e)
                    }
                  />
                  <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                    <Search className="size-4" />
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 xl:col-span-3">
                <div className="justify-end gap-2 sm:flex">
                  <button
                    type="button"
                    className="mt-2 btn btn-primary shrink-0 sm:mt-0"
                    onClick={() => openModal('showAddLeadForm')}>
                    <Plus className="inline-block size-4" />
                    <span className="align-baseline"> Add Lead</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* lead */}
          <div className="card-body">
            <SimpleBar>
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4">
                  {statusOrders.map((status, i) => {
                    const leadsByStatus = groupedItems[status] || []

                    return (
                      <Droppable key={status} droppableId={status}>
                        {(provided: DroppableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="w-[350px] shrink-0 bg-gray-100 p-5 rounded-md dark:bg-dark-850">
                            <h6 className="mb-4">
                              {status}
                              <span
                                className={`badge ${statusClasses[i]} mx-2`}>
                                {leadsByStatus.length}
                              </span>
                            </h6>
                            <SimpleBar
                              style={{ maxHeight: 'calc(100vh - 25.1rem)' }}
                              className=" -mx-5 px-5">
                              <div
                                className="flex flex-col gap-2"
                                id="leads-container"
                                data-status={status}>
                                {leadsByStatus.map((item, index) => (
                                  <Draggable
                                    key={item.id}
                                    draggableId={String(item.id)}
                                    index={index}>
                                    {(provided: DraggableProvided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}>
                                        <div className="p-3 bg-white border border-white rounded-sm dark:bg-dark-900 dark:border-dark-900 mb-2">
                                          <div className="flex items-center gap-3 mb-4">
                                            <div className="rounded-full size-12">
                                              <Image
                                                src={
                                                  item.image ||
                                                  '/assets/images/avatar/user-3.png'
                                                }
                                                alt="itemImg"
                                                className="rounded-full"
                                                width={48}
                                                height={48}
                                              />
                                            </div>
                                            <div className="grow">
                                              <h6 className="mb-1">
                                                {item.name}
                                              </h6>
                                              <p className="text-sm text-gray-500 dark:text-dark-500">
                                                <i className="ri-time-line"></i>
                                                <span>{item.date}</span> at{' '}
                                                <span>{item.time}</span>
                                              </p>
                                            </div>
                                          </div>
                                          <p className="mb-2">
                                            <i className="ltr:mr-1 rtl:ml-1 ri-mail-line"></i>
                                            <span className="text-gray-500 dark:text-dark-500">
                                              {item.email}
                                            </span>
                                          </p>
                                          <p>
                                            <i className="ltr:mr-1 rtl:ml-1 ri-phone-line"></i>
                                            <span className="text-gray-500 dark:text-dark-500">
                                              {item.phoneNumber}
                                            </span>
                                          </p>
                                          <div className="flex items-center gap-3 mt-3">
                                            <Link
                                              href="#!"
                                              className="link link-primary"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                handleOpenModal(true, item)
                                              }}>
                                              Edit
                                            </Link>
                                            <Link
                                              href="#!"
                                              className="link link-red"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                onClickLeadDelete(item.id)
                                              }}>
                                              Delete
                                            </Link>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            </SimpleBar>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )
                  })}
                </div>
              </DragDropContext>
              {/* } */}
            </SimpleBar>
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

      {/* modals */}
      <AddEditCrmLead
        modalState={modalState}
        closeModal={handleCloseModal}
        leadList={leadList}
        editMode={editMode}
        currentLead={currentLead}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteLead}
      />
    </React.Fragment>
  )
}

export default CrmLead
