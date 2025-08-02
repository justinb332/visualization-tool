import { ReactNode } from 'react'

interface BasicObjectLayoutProps {
  children: ReactNode
}

export default function BasicObjectLayout({ children }: BasicObjectLayoutProps) {
  return (
    <div className="basic-object-layout">
      {children}
    </div>
  )
}