"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Dumbbell } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile header */}
          <div className="flex h-16 items-center gap-3 border-b bg-white px-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-gray-900">GymManager</span>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
