"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { DashboardHeader } from "@/components/DashboardHeader"
import { SessionMonitor } from "@/components/SessionMonitor"
import AuthGuard from "@/components/auth/AuthGuard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen crypto-gradient-bg">
      {/* Session Monitor - monitors for concurrent logins */}
      <SessionMonitor />

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 crypto-navbar">
        <DashboardHeader onMenuClick={handleToggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex pt-16 h-screen">
        {/* Full height container */}
        <Sidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />
        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8 lg:ml-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-8">
            <AuthGuard>{children}</AuthGuard>
          </div>
        </main>
      </div>
    </div>
  )
}