"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }
      setChecking(false)
    }
  }, [authLoading, isAuthenticated, router])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="sr-only">Loading dashboard...</span>
        <div className="rounded-full">
          <span
            className="inline-block animate-spin rounded-full"
            style={{ width: 24, height: 24, borderWidth: 3, borderColor: "var(--brand-primary) transparent transparent transparent" }}
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
