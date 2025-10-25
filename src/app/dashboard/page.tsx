"use client"

import dynamic from 'next/dynamic'
import React from 'react'
import useYouTubeCredentialGuard from '@/lib/hooks/youtube/useYouTubeCredentialGuard'

const DashboardOverview = dynamic(() => import('@/components/dashboard/overview/DashboardOverview'), {
  // Keep SSR off since this page is client-only anyway; improves route code-splitting
  ssr: false,
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export default function page() {
  // Guard kept but bypassed for now to avoid credential checking UI
  const { shouldAllowAccess } = useYouTubeCredentialGuard({ redirectTo: '/auth/youtube-connect', allowBypass: true })

  if (!shouldAllowAccess) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <div>
      <DashboardOverview />
    </div>
  )
}
