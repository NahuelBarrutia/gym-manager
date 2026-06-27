"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, CreditCard, AlertCircle, TrendingUp, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DashboardStats {
  totalClientes: number
  pagosActivos: number
  porVencer: number
  ingresosMes: number
}

interface PagoReciente {
  id: number
  id_cliente: number
  fecha_pago: string
  monto: number
  cliente?: {
    nombre: string
    apellido: string
    paquete?: {
      duracion_dias: number
    }
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    pagosActivos: 0,
    porVencer: 0,
    ingresosMes: 0
  })
  const [pagosRecientes, setPagosRecientes] = useState<PagoReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("usuario") ?? "{}")
      if (u.rol === "empleado") router.replace("/clientes")
    } catch {}
  }, [])

  const cargarDatosDashboard = async () => {
    try {
      // Cargar clientes
      const clientesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`)
      const clientes = clientesRes.ok ? await clientesRes.json() : []

      // Cargar pagos
      const pagosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos`)
      const pagos = pagosRes.ok ? await pagosRes.json() : []

      // Calcular estadísticas
      const totalClientes = clientes.length

      const hoy = new Date()
      const en10Dias = new Date()
      en10Dias.setDate(hoy.getDate() + 10)

      // Pagos vigentes: fecha_pago + duracion_dias >= hoy
      const pagosActivos = pagos.filter((pago: any) => {
        const duracion = pago.cliente?.paquete?.duracion_dias ?? 0
        const vencimiento = new Date(pago.fecha_pago)
        vencimiento.setDate(vencimiento.getDate() + duracion)
        return vencimiento >= hoy
      }).length

      // Pagos por vencer en los próximos 10 días
      const porVencer = pagos.filter((pago: any) => {
        const duracion = pago.cliente?.paquete?.duracion_dias ?? 0
        const vencimiento = new Date(pago.fecha_pago)
        vencimiento.setDate(vencimiento.getDate() + duracion)
        return vencimiento >= hoy && vencimiento <= en10Dias
      }).length

      // Calcular ingresos del mes actual
      const mesActual = hoy.getMonth()
      const añoActual = hoy.getFullYear()
      
      const ingresosMes = pagos
        .filter((pago: any) => {
          const fechaPago = new Date(pago.fecha_pago)
          return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual
        })
        .reduce((total: number, pago: any) => total + pago.monto, 0)

      // Obtener pagos recientes (últimos 5)
      const pagosRecientesOrdenados = pagos
        .sort((a: any, b: any) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())
        .slice(0, 5)

      setStats({
        totalClientes,
        pagosActivos,
        porVencer,
        ingresosMes
      })
      
      setPagosRecientes(pagosRecientesOrdenados)
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatosDashboard()
    
    // Escuchar eventos de actualización desde otras páginas
    const handleRefresh = () => {
      cargarDatosDashboard()
    }
    
    window.addEventListener('dashboard-refresh', handleRefresh)
    
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh)
    }
  }, [])
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vista general de tu gimnasio</p>
        </div>
        <Button 
          onClick={cargarDatosDashboard} 
          variant="outline" 
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.totalClientes}
            </div>
            <p className="text-xs text-gray-500">Miembros registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagos Activos</CardTitle>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.pagosActivos}
            </div>
            <p className="text-xs text-gray-500">Membresías vigentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Por Vencer</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {loading ? "..." : stats.porVencer}
            </div>
            <p className="text-xs text-gray-500">Próximos 10 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : `$${stats.ingresosMes.toLocaleString()}`}
            </div>
            <p className="text-xs text-gray-500">Total del mes actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Pagos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-gray-500">Cargando...</p>
              </div>
            ) : pagosRecientes.length === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-gray-500">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pagosRecientes.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pago.cliente ? `${pago.cliente.nombre} ${pago.cliente.apellido}` : `Cliente ID: ${pago.id_cliente}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ${pago.monto.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Alertas de Vencimiento</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-gray-500">Cargando...</p>
              </div>
            ) : stats.porVencer === 0 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-gray-500">No hay alertas</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {stats.porVencer} pago{stats.porVencer !== 1 ? 's' : ''} por vencer
                    </p>
                    <p className="text-xs text-gray-500">
                      En los próximos 10 días
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Revisa la sección de pagos para más detalles
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
