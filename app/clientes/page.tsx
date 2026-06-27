"use client"

import { useState, useEffect } from "react"
import { Search, Edit2, Trash2, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { NuevoClienteModal } from "@/components/nuevo-cliente-modal"
import { EditarClienteModal } from "@/components/editar-cliente-modal"
import { HistorialPagosModal } from "@/components/historial-pagos-modal"

type TipoCliente = "gimnasio" | "aerobox" | "personalizado"

const TIPO_CONFIG: Record<TipoCliente, { label: string; clase: string }> = {
  gimnasio:      { label: "Gimnasio",     clase: "bg-blue-100 text-blue-800" },
  aerobox:       { label: "Aero Box",     clase: "bg-orange-100 text-orange-800" },
  personalizado: { label: "Personalizado", clase: "bg-purple-100 text-purple-800" },
}

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  fecha_nacimiento: string
  activo: boolean
  tipo: TipoCliente
  id_paquete: number
  id_rutina: number | null
  paquete?: {
    nombre: string
    precio: number
  }
  rutina?: {
    nombre: string
  }
}

export default function ClientesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isHistorialOpen, setIsHistorialOpen] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<TipoCliente | "todos">("todos")
  const [loading, setLoading] = useState(true)

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.toLowerCase()
    const coincideBusqueda =
      c.nombre.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefono.includes(q)
    const coincideTipo = filtroTipo === "todos" || c.tipo === filtroTipo
    return coincideBusqueda && coincideTipo
  })

  const handleEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setIsEditModalOpen(true)
  }

  const handleVerHistorial = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setIsHistorialOpen(true)
  }

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar este cliente?")) return
    try {
      const response = await fetch(`http://localhost:4000/api/clientes/${id}`, { method: "DELETE" })
      if (response.ok) {
        cargarClientes()
        window.dispatchEvent(new CustomEvent("dashboard-refresh"))
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
    }
  }

  const cargarClientes = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data)
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona los miembros de tu gimnasio</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => setIsModalOpen(true)}>
          <span className="mr-2">+</span>
          Nuevo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            className="pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Filtro por tipo */}
      <div className="mb-4 flex gap-2">
        {([
          { value: "todos",        label: "Todos" },
          { value: "gimnasio",     label: "Gimnasio" },
          { value: "aerobox",      label: "Aero Box" },
          { value: "personalizado", label: "Personalizado" },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setFiltroTipo(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtroTipo === t.value
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({t.value === "todos"
                ? clientes.length
                : clientes.filter((c) => c.tipo === t.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Client List */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">Lista de Clientes ({clientesFiltrados.length})</h3>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">Cargando clientes...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">
                {busqueda ? "No se encontraron clientes con esa búsqueda" : "No hay clientes registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {cliente.nombre} {cliente.apellido}
                      </h4>
                      <p className="text-sm text-gray-600">{cliente.email}</p>
                      <p className="text-sm text-gray-600">{cliente.telefono}</p>
                      {cliente.paquete && (
                        <p className="text-sm text-blue-600">
                          Paquete: {cliente.paquete.nombre} - ${cliente.paquete.precio}
                        </p>
                      )}
                      {cliente.rutina && (
                        <p className="text-sm text-purple-600">
                          Rutina: {cliente.rutina.nombre}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        TIPO_CONFIG[cliente.tipo]?.clase ?? "bg-gray-100 text-gray-800"
                      }`}>
                        {TIPO_CONFIG[cliente.tipo]?.label ?? cliente.tipo}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cliente.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        onClick={() => handleVerHistorial(cliente)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Ver historial de pagos"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditar(cliente)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NuevoClienteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClienteCreado={cargarClientes}
      />

      <EditarClienteModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        cliente={clienteSeleccionado}
        onClienteActualizado={cargarClientes}
      />

      <HistorialPagosModal
        open={isHistorialOpen}
        onOpenChange={setIsHistorialOpen}
        cliente={clienteSeleccionado}
      />
    </div>
  )
}
