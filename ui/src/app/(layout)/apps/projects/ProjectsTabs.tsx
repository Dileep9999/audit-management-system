'use client'

import React, { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import user5 from '@assets/images/avatar/user-5.png'
import user11 from '@assets/images/avatar/user-11.png'
import user13 from '@assets/images/avatar/user-13.png'
import user14 from '@assets/images/avatar/user-14.png'
import user16 from '@assets/images/avatar/user-16.png'
import user17 from '@assets/images/avatar/user-17.png'
import user18 from '@assets/images/avatar/user-18.png'
import user20 from '@assets/images/avatar/user-20.png'
import brand2 from '@assets/images/brands/img-02.png'
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
} from '@src/components/custom/dropdown/dropdown'
import { users } from '@src/dtos/apps/user'
import {
  AlignLeft,
  Ellipsis,
  Eye,
  FileText,
  Sparkle,
  UserRound,
} from 'lucide-react'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

const ProjectsTabs = () => {
  const router = usePathname()
  const [currentUser, setCurrentUser] = useState(users[0])
  const selectUser = (user: { name: string; image: string; role: string }) => {
    setCurrentUser(user)
  }
  const isActive = (user: { name: string; image: string; role: string }) =>
    currentUser.name === user.name

  return (
    <React.Fragment>
      <div className="card">
        <div className="relative overflow-hidden rounded-md-t h-44 bg-primary-500/10">
          <div className="border-[60px] border-t-primary-500 border-l-primary-500 absolute opacity-10 -top-2 ltr:right-0 rtl:left-0 rotate-45 size-96"></div>
          <div className="border-[60px] border-green-500 absolute opacity-10 top-20 ltr:right-8 rtl:left-8 rotate-45 size-80"></div>
          <div className="border-[60px] border-pink-500 absolute opacity-10 top-36 ltr:right-28 rtl:left-28 rotate-45 size-40"></div>
        </div>
        <div className="card-body">
          <div className="relative mb-6">
            <div className="flex flex-wrap gap-5">
              <div className="relative flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-lg dark:bg-dark-900 dark:border-dark-800 shadow-gray-100 dark:shadow-dark-850 -mt-14 size-28 shrink-0">
                <Image
                  src={brand2}
                  alt="brandImg"
                  className="mx-auto size-16"
                />
              </div>
              <div className="grow">
                <h5 className="mb-1">
                  AI Model Development
                  <span className="leading-normal ltr:ml-1 rtl:mr-1 badge badge-yellow">
                    In Progress
                  </span>
                </h5>
                <p className="text-gray-500 dark:text-dark-500">
                  Create Date: 25 Jan, 2024
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-modal-target="shareProjectModal">
                  Add User
                </button>
                <Dropdown trigger="click" dropdownClassName="dropdown">
                  <DropdownButton colorClass="btn-icon-text btn-icon btn-sub-gray btn">
                    <Ellipsis className="size-5" />
                  </DropdownButton>
                  <DropdownMenu>
                    <Link href="#!" className="dropdown-item">
                      Create Invoice
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      Generate Billing
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      Delete Project
                    </Link>
                    <Link href="#!" className="dropdown-item">
                      Settings
                    </Link>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5 mb-5">
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">31 May, 2024</h6>
              <p className="text-gray-500 dark:text-dark-500">Due Date</p>
            </div>
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">$25,000</h6>
              <p className="text-gray-500 dark:text-dark-500">Budget ($)</p>
            </div>
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <h6 className="mb-1">$8,000</h6>
              <p className="text-gray-500 dark:text-dark-500">
                Total Spend ($)
              </p>
            </div>
            <div className="col-span-12 p-3 text-center border border-gray-200 border-dashed rounded-md dark:border-dark-800 sm:col-span-6 md:col-span-3 xl:col-span-2">
              <Dropdown
                position=""
                trigger="click"
                dropdownClassName="dropdown">
                <DropdownButton colorClass="flex gap-2 p-0 btn text-start">
                  <Image
                    src={currentUser.image}
                    alt="currentUser"
                    className="rounded-full size-10 shrink-0"
                    width={40}
                    height={40}
                  />
                  <span className="block grow">
                    <span className="text-gray-500 dark:text-dark-500">
                      {currentUser.role}
                    </span>
                    <span className="block font-medium">
                      {currentUser.name}
                    </span>
                  </span>
                  <svg
                    className={'transition-transform duration-300 size-5 '}
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </DropdownButton>
                <DropdownMenu menuClass="p-2 !w-52">
                  {users.map((user) => (
                    <Link
                      href="#!"
                      key={user.name}
                      onClick={(e) => {
                        e.preventDefault()
                        selectUser(user)
                      }}
                      className={`dropdown-item flex items-center gap-2 ${
                        isActive(user) ? 'active' : ''
                      }`}>
                      <Image
                        src={user.image}
                        alt="userImg"
                        className="rounded-full size-8 shrink-0"
                        width={40}
                        height={40}
                      />
                      <h6>{user.name}</h6>
                    </Link>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <div className="grid grid-cols-12 mb-space">
            <div className="col-span-4">
              <h6 className="mb-1">Assigned To:</h6>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user5}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="Ina Payne"
                    data-tooltip-id="defaultTooltip2"
                  />
                  <Tooltip id="defaultTooltip2" />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user11}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="Robert Freeman"
                    data-tooltip-id="defaultTooltip3"
                  />
                  <Tooltip id="defaultTooltip3" />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user13}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="Cody Fisher"
                    data-tooltip-id="defaultTooltip4"
                  />
                  <Tooltip id="defaultTooltip4" />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user14}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="Leal Bureau"
                    data-tooltip-id="defaultTooltip5"
                  />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user16}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="William Keen"
                    data-tooltip-id="defaultTooltip6"
                  />
                  <Tooltip id="defaultTooltip6" />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user17}
                    alt="userImg"
                    width={40}
                    height={40}
                    data-tooltip-content="Julie Seltzer"
                    data-tooltip-id="defaultTooltip7"
                  />
                  <Tooltip id="defaultTooltip7" />
                </Link>
              </div>
            </div>
            <div className="col-span-4">
              <h6 className="mb-1">Report To:</h6>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user20}
                    alt="userImg"
                  />
                </Link>
                <Link
                  href="#!"
                  title="avatar link"
                  className="transition duration-300 ease-linear hover:z-10">
                  <Image
                    className="border-2 border-white rounded-full dark:border-dark-900 size-10"
                    src={user18}
                    alt="userImg"
                  />
                </Link>
              </div>
            </div>
          </div>

          <ul className="overflow-x-auto whitespace-normal tabs-pills">
            <li>
              <Link
                href="/apps/projects/overview"
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${router == '/apps/projects/overview' ? 'active' : ''}`}>
                <Eye className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Overview</span>
              </Link>
            </li>
            <li>
              <Link
                href="/apps/projects/roadmap"
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${router == '/apps/projects/roadmap' ? 'active' : ''}`}>
                <Sparkle className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">RoadMap</span>
              </Link>
            </li>
            <li>
              <Link
                href="/apps/projects/task"
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${router == '/apps/projects/task' ? 'active' : ''}`}>
                <AlignLeft className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Tasks</span>
              </Link>
            </li>
            <li>
              <Link
                href="/apps/projects/files"
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${router == '/apps/projects/files' ? 'active' : ''}`}>
                <FileText className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Files</span>
              </Link>
            </li>
            <li>
              <Link
                href="/apps/projects/users"
                className={`nav-item [&.active]:bg-primary-500 [&.active]:text-primary-50 ${router == '/apps/projects/users' ? 'active' : ''}`}>
                <UserRound className="inline-block ltr:mr-1 rtl:ml-1 size-4" />
                <span className="align-middle">Users</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ProjectsTabs
