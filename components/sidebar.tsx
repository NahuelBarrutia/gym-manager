"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dumbbell, LayoutDashboard, Users, CreditCard, Package, ClipboardList, LogOut, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const NAV_ADMIN = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Pagos", href: "/pagos", icon: CreditCard },
  { name: "Paquetes", href: "/paquetes", icon: Package },
  { name: "Rutinas", href: "/rutinas", icon: ClipboardList },
]

const NAV_EMPLEADO = [
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Pagos", href: "/pagos", icon: CreditCard },
  { name: "Rutinas", href: "/rutinas", icon: ClipboardList },
]

function getRolFromStorage(): string {
  try {
    const u = JSON.parse(localStorage.getItem("usuario") ?? "{}")
    return u.rol ?? "empleado"
  } catch { return "empleado" }
}

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [nombreUsuario, setNombreUsuario] = useState("")
  const [rol, setRol] = useState("empleado")

  useEffect(() => {
    const raw = localStorage.getItem("usuario")
    if (raw) {
      try {
        const u = JSON.parse(raw)
        setNombreUsuario(u.nombre ?? "")
        setRol(u.rol ?? "empleado")
      } catch {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    router.replace("/login")
  }

  const navigation = rol === "admin" ? NAV_ADMIN : NAV_EMPLEADO

  const sidebarContent = (
    <div className="flex h-full flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Dumbbell className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900">GymManager</h1>
          <p className="text-xs text-gray-500">Panel de Control</p>
        </div>
        {/* Close button - mobile only */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-100 md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{nombreUsuario || "Usuario"}</p>
            <p className="text-xs text-gray-500">{rol === "admin" ? "Administrador" : "Empleado"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 h-screen">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full w-64 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
