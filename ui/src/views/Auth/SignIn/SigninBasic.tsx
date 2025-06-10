'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import whiteLogo from '@assets/images/logo-white.png'
import LogoMain from '@assets/images/main-logo.png'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin@123'

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !email.trim() || !password.trim()) {
      toast.error('Email and password are required.')
      return
    }

    if (email !== adminEmail || password !== adminPassword) {
      toast.error('Invalid credentials. Please use the admin credentials shown below.')
      return
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboards/ecommerce',
      })

      if (result?.ok) {
        router.push(result.url || '/dashboards/ecommerce')
      } else {
        toast.error('Login failed! Please try again.')
      }
    } catch (error) {
      console.error('Login failed', error)
      toast.error('An error occurred during login.')
    }
  }

  const handleAdminLogin = async () => {
    setEmail(adminEmail)
    setPassword(adminPassword)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: adminEmail,
        password: adminPassword,
        callbackUrl: '/dashboards/ecommerce',
      })

      if (result?.ok) {
        router.push(result.url || '/dashboards/ecommerce')
      } else {
        toast.error('Admin login failed! Please try again.')
      }
    } catch (error) {
      console.error('Admin login failed', error)
      toast.error('An error occurred during login.')
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 from-sky-100 dark:from-sky-500/15 ltr:bg-gradient-to-l rtl:bg-gradient-to-r via-green-50 dark:via-green-500/10 to-pink-50 dark:to-pink-500/10">
      <div className="container">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card">
            <div className="md:p-10 card-body">
              <div className="mb-5 text-center">
                <Link href="#">
                  <Image
                    src={LogoMain}
                    alt="LogoMain"
                    className="h-8 mx-auto dark:hidden"
                    width={175}
                    height={32}
                  />
                  <Image
                    src={whiteLogo}
                    alt="whiteLogo"
                    className="hidden h-8 mx-auto dark:inline-block"
                    width={175}
                    height={32}
                  />
                </Link>
              </div>
              <h4 className="mb-5 text-xl font-bold text-center">
                Admin Login
              </h4>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-12 gap-5 mb-5">
                  <div className="col-span-12">
                    <label htmlFor="emailOrUsername" className="form-label">
                      Email
                    </label>
                    <input
                      type="text"
                      id="emailOrUsername"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full form-input"
                      placeholder="Enter admin email"
                    />
                  </div>
                  <div className="col-span-12">
                    <label htmlFor="password" className="block mb-2 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full ltr:pr-8 rtl:pl-8 form-input"
                        placeholder="Enter admin password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-hidden dark:text-dark-500">
                        {showPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-12">
                    <button type="submit" className="w-full btn btn-primary">
                      Sign In
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-5 p-4 bg-gray-50 dark:bg-dark-900 rounded-lg">
                <h6 className="mb-2 font-semibold">Admin Credentials</h6>
                <p className="text-gray-500 dark:text-dark-500 mb-1">
                  Email: {adminEmail}
                </p>
                <p className="text-gray-500 dark:text-dark-500 mb-3">
                  Password: {adminPassword}
                </p>
                <button
                  className="w-full btn btn-sub-gray"
                  onClick={handleAdminLogin}>
                  Quick Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
