"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Dumbbell, LayoutDashboard, Users, CreditCard, Package, ClipboardList, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Pagos", href: "/pagos", icon: CreditCard },
  { name: "Paquetes", href: "/paquetes", icon: Package },
  { name: "Rutinas", href: "/rutinas", icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [nombreUsuario, setNombreUsuario] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem("usuario")
    if (raw) {
      try {
        const u = JSON.parse(raw)
        setNombreUsuario(u.nombre ?? "")
      } catch {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    router.replace("/login")
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Dumbbell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">GymManager</h1>
          <p className="text-xs text-gray-500">Panel de Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer con usuario y logout */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{nombreUsuario || "Usuario"}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
