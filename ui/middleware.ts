import { NextResponse } from 'next/server'

import { withAuth } from 'next-auth/middleware'

export default withAuth(function middleware(req) {
  if (!req.nextauth.token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
})

export const config = { matcher: ['/(.*?)'] }
