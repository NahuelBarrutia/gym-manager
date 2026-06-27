"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RegistrarPagoModal } from "@/components/registrar-pago-modal"

type FiltroEstado = "todos" | "vigente" | "vencido"

interface Pago {
  id: number
  id_cliente: number
  fecha_pago: string
  monto: number
  cliente?: {
    nombre: string
    apellido: string
    email: string
    paquete?: {
      duracion_dias: number
      nombre: string
    }
  }
}

function calcularVencimiento(fechaPago: string, duracionDias: number): Date {
  const fecha = new Date(fechaPago)
  fecha.setDate(fecha.getDate() + duracionDias)
  return fecha
}

function esVigente(pago: Pago): boolean {
  const duracion = pago.cliente?.paquete?.duracion_dias ?? 0
  return calcularVencimiento(pago.fecha_pago, duracion) >= new Date()
}

export default function PagosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const FILTROS: { value: FiltroEstado; label: string }[] = [
    { value: "todos",   label: "Todos los estados" },
    { value: "vigente", label: "Vigentes" },
    { value: "vencido", label: "Vencidos" },
  ]

  const pagosFiltrados = pagos.filter((p) => {
    const q = busqueda.toLowerCase()
    const nombre = p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido}`.toLowerCase() : ""
    const email = p.cliente?.email.toLowerCase() ?? ""
    const coincideBusqueda = nombre.includes(q) || email.includes(q)

    const vigente = esVigente(p)
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "vigente" && vigente) ||
      (filtroEstado === "vencido" && !vigente)

    return coincideBusqueda && coincideEstado
  })

  const cargarPagos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos`)
      if (response.ok) setPagos(await response.json())
    } catch (error) {
      console.error("Error al cargar pagos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPagos()
  }, [])

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const labelFiltroActual = FILTROS.find((f) => f.value === filtroEstado)?.label ?? "Todos los estados"

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600">Gestiona los pagos y vencimientos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-black text-white hover:bg-gray-800">
          <span className="mr-2">+</span>
          Registrar Pago
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por cliente..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Dropdown de estado */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            className="gap-2 bg-transparent min-w-[170px] justify-between"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {labelFiltroActual}
            <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </Button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-white shadow-lg z-10">
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    filtroEstado === f.value ? "font-semibold text-blue-600" : "text-gray-700"
                  }`}
                  onClick={() => { setFiltroEstado(f.value); setDropdownOpen(false) }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payments List */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">Lista de Pagos ({pagosFiltrados.length})</h3>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">Cargando pagos...</p>
            </div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">
                {busqueda || filtroEstado !== "todos"
                  ? "No se encontraron pagos con ese filtro"
                  : "No hay pagos registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pagosFiltrados.map((pago) => {
                const duracion = pago.cliente?.paquete?.duracion_dias ?? 0
                const vencimiento = calcularVencimiento(pago.fecha_pago, duracion)
                const vigente = vencimiento >= new Date()

                return (
                  <div key={pago.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {pago.cliente
                            ? `${pago.cliente.nombre} ${pago.cliente.apellido}`
                            : `Cliente ID: ${pago.id_cliente}`}
                        </h4>
                        {pago.cliente?.paquete && (
                          <p className="text-xs text-blue-600 mb-1">{pago.cliente.paquete.nombre}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          Pago: {new Date(pago.fecha_pago).toLocaleDateString("es-AR")}
                        </p>
                        {duracion > 0 && (
                          <p className="text-sm text-gray-600">
                            Vence: {vencimiento.toLocaleDateString("es-AR")}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          ${pago.monto.toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vigente
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {vigente ? "Vigente" : "Vencido"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <RegistrarPagoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPagoCreado={cargarPagos}
      />
    </div>
  )
}
