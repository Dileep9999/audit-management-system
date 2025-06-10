'use client'

import React, { useEffect, useState } from 'react'

import { StaticImport } from 'next/dist/shared/lib/get-img-props'
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
import { Tab, Tabs } from '@src/components/custom/tabs/tab'
import { NextPageWithLayout } from '@src/dtos'
import { ProjectList } from '@src/dtos/apps/projects'
import {
  deleteProjectGridData,
  getProjectGridData,
} from '@src/slices/projects/grid/thunk'
import { AppDispatch, RootState } from '@src/slices/reducer'
import { CirclePlus, Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AddEditProjectGrid from './AddEditProjectGrid'

const ProjectCard = ({
  project,
  onClickProjectGridDelete,
  handleOpenModal,
}: {
  project: ProjectList
  onClickProjectGridDelete: (id: number) => void
  handleOpenModal: (editMode: boolean, project: ProjectList | null) => void
}) => {
  return (
    <div className="card">
      <div className="card-body">
        <Dropdown
          position="right"
          trigger="click"
          dropdownClassName="float-end dropdown">
          <DropdownButton colorClass="flex items-center text-gray-500 dark:text-dark-500">
            <i className="ri-more-fill"></i>
          </DropdownButton>
          <DropdownMenu>
            <Link href="/apps/projects/overview" className="dropdown-item">
              <i className="align-middle ltr:mr-2 rtl:ml-2 ri-eye-line"></i>{' '}
              <span>Overview</span>
            </Link>
            <Link
              href="#!"
              className="dropdown-item"
              onClick={(e) => {
                e.preventDefault()
                handleOpenModal(true, project)
              }}>
              <i className="align-middle ltr:mr-2 rtl:ml-2 ri-pencil-line"></i>{' '}
              <span>Edit</span>
            </Link>
            <Link
              href="#!"
              className="dropdown-item"
              onClick={(e) => {
                e.preventDefault()
                onClickProjectGridDelete(project.id)
              }}>
              <i className="align-middle ltr:mr-2 rtl:ml-2 ri-delete-bin-line"></i>
              <span>Delete</span>
            </Link>
          </DropdownMenu>
        </Dropdown>
        <div className="p-2 mb-3 border border-gray-200 rounded-md dark:border-dark-800 size-12">
          <Image
            src={project.projectImage}
            alt="projectImage"
            height={30}
            width={30}
          />
        </div>
        <h6 className="mb-1">{project.projectName}</h6>
        <p className="text-gray-500 dark:text-dark-500">{project.clientName}</p>
        <div className="grid grid-cols-2 mt-3 divide-x divide-gray-200 rtl:divide-x-reverse dark:divide-dark-800">
          <div className="p-2 text-center">
            <h6 className="mb-1">{project.dueDate}</h6>
            <p className="text-gray-500 dark:text-dark-500">Due Date</p>
          </div>
          <div className="p-2 text-center">
            <h6 className="mb-1">{project.totalAmount}</h6>
            <p className="text-gray-500 dark:text-dark-500">Total Amount</p>
          </div>
        </div>
        <div className="mt-5">
          <p className="mb-2 text-gray-500 dark:text-dark-500">
            Project
            <span> {project.progress}% </span>completed
          </p>
          <div className="progress-bar progress-1">
            <div
              className="text-white progress-bar-wrap ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary-500 to-pink-500 via-purple-500"
              style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <p className="text-gray-500 dark:text-dark-500">Assigned To:</p>
          <div className="flex -space-x-3 grow">
            {project.assignees.map(
              (
                assign: { image: string | StaticImport },
                idx: React.Key | null | undefined
              ) => (
                <Link
                  href="#!"
                  className="transition duration-300 ease-linear hover:z-10"
                  title="avatar link"
                  key={idx}>
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-8"
                    src={assign.image}
                    alt="assignImg"
                    height={32}
                    width={32}
                  />
                </Link>
              )
            )}
          </div>
          <div className="shrink-0">
            <span
              className={`badge ${
                project.status === 'Active'
                  ? 'badge-purple'
                  : project.status === 'On Hold'
                    ? 'badge-orange'
                    : project.status === 'Pending'
                      ? 'badge-yellow'
                      : project.status === 'Completed'
                        ? 'badge-green'
                        : 'badge-primary'
              }`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProjectsGrid: NextPageWithLayout = () => {
  const dispatch: AppDispatch = useDispatch()

  const { projectgrid } = useSelector((state: RootState) => state.ProjectsGrid)
  const { layoutMode, layoutDirection } = useSelector(
    (state: RootState) => state.Layout
  )
  const [projectGrid, setProjectGrid] = useState<ProjectList[]>([])
  const [projectGrids, setProjectGrids] = useState<number[] | null>(null)

  const [modalState, setModalState] = useState<{
    showAddProjectForm: boolean
    showEditProjectForm: boolean
  }>({
    showAddProjectForm: false,
    showEditProjectForm: false,
  })
  const [editMode, setEditMode] = useState(false)
  const [currentProjectGrid, setCurrentProjectGrid] =
    useState<ProjectList | null>(null)
  const [show, setShow] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState('All Projects')
  const [searchTerm, setSearchTerm] = useState('')
  // get data
  useEffect(() => {
    if (!projectgrid) {
      dispatch(getProjectGridData())
    } else {
      setProjectGrid(projectgrid)
    }
  }, [projectgrid, dispatch])
  const filteredData = projectGrid.filter(
    (item: ProjectList) =>
      item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const getFilteredProjects = (status: string) => {
    if (status === 'All Projects') return filteredData
    return filteredData.filter((project) => project.status === status)
  }
  // pagination
  const itemsPerPage = 12
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  const paginateProjects = (projects: ProjectList[]) => {
    const start = (currentPage - 1) * itemsPerPage
    return projects.slice(start, start + itemsPerPage)
  }
  const filteredProjects = getFilteredProjects(activeTab)
  const paginatedProjects = paginateProjects(filteredProjects)
  const toggleDelete = () => {
    setShow(false)
    setProjectGrids(null)
  }

  const onClickProjectGridDelete = (id: number) => {
    setProjectGrids([id])
    setShow(true)
  }

  const handleDeleteProjectGrid = () => {
    if (projectGrids) {
      dispatch(deleteProjectGridData(projectGrids))
      setShow(false)
    }
  }
  const openModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: true }))
  const closeModal = (key: string) =>
    setModalState((prev) => ({ ...prev, [key]: false }))

  const handleOpenModal = (
    editMode: boolean = false,
    projectGrid: ProjectList | null = null
  ) => {
    setEditMode(editMode)
    setCurrentProjectGrid(projectGrid)
    const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
    openModal(modalKey)
  }

  const handleCloseModal = () => {
    const modalKey = editMode ? 'showEditProjectForm' : 'showAddProjectForm'
    closeModal(modalKey)
    setEditMode(false) // Reset edit mode
    setCurrentProjectGrid(null) // Reset current project grid
  }

  return (
    <React.Fragment>
      <BreadCrumb title="Grid View" subTitle="Projects" />
      <div>
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="shrink-0">
            <h6 className="card-title">
              My Projects (<span>{filteredProjects.length}</span>)
            </h6>
          </div>
          <div className="md:mx-auto">
            <div className="relative w-full md:!w-80 group/form">
              <input
                type="text"
                className="ltr:pl-9 rtl:pr-9 form-input ltr:group-[&.right]/form:pr-9 rtl:group-[&.right]/form:pl-9 ltr:group-[&.right]/form:pl-4 rtl:group-[&.right]/form:pr-4"
                placeholder="Search for projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:left-3 rtl:right-3 ltr:group-[&.right]/form:right-3 rtl:group-[&.right]/form:left-3 ltr:group-[&.right]/form:left-auto rtl:group-[&.right]/form:right-auto focus:outline-hidden">
                <Search className="size-4"></Search>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault()
                openModal('showAddProjectForm')
              }}>
              <CirclePlus className="inline-block ltr:mr-1 rtl:ml-1 size-4"></CirclePlus>
              <span className="align-middle">Add Project</span>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <Tabs
          ulProps="overflow-x-auto tabs"
          otherClass="nav-item [&.active]:after:opacity-100 [&.active]:after:w-full [&.active]:text-primary-500"
          activeTabClass="active"
          onChange={(tab: React.SetStateAction<string>) => {
            setActiveTab(tab)
            setCurrentPage(1) // Reset to the first page when changing tabs
          }}>
          <Tab label="All Projects">
            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {paginatedProjects &&
                paginatedProjects.length > 0 &&
                paginatedProjects.map((project: ProjectList, idx: number) => (
                  <ProjectCard
                    key={idx}
                    project={project}
                    onClickProjectGridDelete={onClickProjectGridDelete}
                    handleOpenModal={handleOpenModal}
                  />
                ))}
            </div>
            {paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="Active">
            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {paginatedProjects.map((project: ProjectList, idx: number) => (
                <ProjectCard
                  key={idx}
                  project={project}
                  onClickProjectGridDelete={onClickProjectGridDelete}
                  handleOpenModal={handleOpenModal}
                />
              ))}
            </div>
            {paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="Pending">
            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {paginatedProjects.map((project: ProjectList, idx: number) => (
                <ProjectCard
                  key={idx}
                  project={project}
                  onClickProjectGridDelete={onClickProjectGridDelete}
                  handleOpenModal={handleOpenModal}
                />
              ))}
            </div>
            {paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
          <Tab label="On Hold">
            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {paginatedProjects.map((project: ProjectList, idx: number) => (
                <ProjectCard
                  key={idx}
                  project={project}
                  onClickProjectGridDelete={onClickProjectGridDelete}
                  handleOpenModal={handleOpenModal}
                />
              ))}
            </div>
          </Tab>
          <Tab label="Completed">
            <div className="grid grid-cols-1 mt-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5">
              {paginatedProjects.map((project: ProjectList, idx: number) => (
                <ProjectCard
                  key={idx}
                  project={project}
                  onClickProjectGridDelete={onClickProjectGridDelete}
                  handleOpenModal={handleOpenModal}
                />
              ))}
            </div>
            {paginatedProjects.length < 1 && (
              <div className="p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  className="mx-auto size-12"
                  viewBox="0 0 48 48">
                  <linearGradient
                    id="SVGID_1__h35ynqzIJzH4_gr1"
                    x1="34.598"
                    x2="15.982"
                    y1="15.982"
                    y2="34.598"
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#60e8fe"></stop>
                    <stop offset=".033" stopColor="#6ae9fe"></stop>
                    <stop offset=".197" stopColor="#97f0fe"></stop>
                    <stop offset=".362" stopColor="#bdf5ff"></stop>
                    <stop offset=".525" stopColor="#dafaff"></stop>
                    <stop offset=".687" stopColor="#eefdff"></stop>
                    <stop offset=".846" stopColor="#fbfeff"></stop>
                    <stop offset="1" stopColor="#fff"></stop>
                  </linearGradient>
                  <path
                    fill="url(#SVGID_1__h35ynqzIJzH4_gr1)"
                    d="M40.036,33.826L31.68,25.6c0.847-1.739,1.335-3.684,1.335-5.748c0-7.27-5.894-13.164-13.164-13.164	S6.688,12.582,6.688,19.852c0,7.27,5.894,13.164,13.164,13.164c2.056,0,3.995-0.485,5.728-1.326l3.914,4.015l4.331,4.331	c1.715,1.715,4.496,1.715,6.211,0C41.751,38.321,41.751,35.541,40.036,33.826z"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M31.95,25.739l8.086,8.086c1.715,1.715,1.715,4.496,0,6.211l0,0c-1.715,1.715-4.496,1.715-6.211,0	l-4.331-4.331"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M7.525,24.511c-1.771-4.694-0.767-10.196,3.011-13.975c3.847-3.847,9.48-4.817,14.228-2.912"></path>
                  <path
                    fill="none"
                    stroke="#10cfe3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                    strokeWidth="3"
                    d="M30.856,12.603c3.376,5.114,2.814,12.063-1.688,16.565c-4.858,4.858-12.565,5.129-17.741,0.814"></path>
                </svg>
                <p className="mt-2 text-center text-gray-500 dark:text-dark-500">
                  No matching records found
                </p>
              </div>
            )}
          </Tab>
        </Tabs>

        <Pagination
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add Edit Delete Modal */}
      <AddEditProjectGrid
        modalState={modalState}
        closeModal={handleCloseModal}
        projectGrid={projectGrid}
        editMode={editMode}
        currentProjectGrid={currentProjectGrid}
      />

      <DeleteModal
        show={show}
        handleHide={toggleDelete}
        deleteModalFunction={handleDeleteProjectGrid}
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

export default ProjectsGrid
