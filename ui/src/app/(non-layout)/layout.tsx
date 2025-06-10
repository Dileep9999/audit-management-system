import { ReactNode } from 'react'

import NonLayoutWrapper from '@src/components/layout/NonLayoutWrapper'

interface DefaultLayoutProps {
  children: ReactNode
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return <NonLayoutWrapper>{children}</NonLayoutWrapper>
}
