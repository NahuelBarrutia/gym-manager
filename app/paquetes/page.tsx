"use client"

import { useState, useEffect } from "react"
import { Edit2, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NuevoPaqueteModal } from "@/components/nuevo-paquete-modal"
import { EditarPaqueteModal } from "@/components/editar-paquete-modal"

interface Paquete {
  id: number
  nombre: string
  descripcion: string
  precio: number
  duracion_dias: number
}

export default function PaquetesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<Paquete | null>(null)
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [loading, setLoading] = useState(true)

  const cargarPaquetes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes`)
      if (response.ok) {
        const data = await response.json()
        setPaquetes(data)
      }
    } catch (error) {
      console.error('Error al cargar paquetes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditarPaquete = (paquete: Paquete) => {
    setPaqueteSeleccionado(paquete)
    setIsEditModalOpen(true)
  }

  const handleEliminarPaquete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          console.log('Paquete eliminado exitosamente')
          cargarPaquetes() // Recargar la lista
          // Disparar evento para actualizar dashboard
          window.dispatchEvent(new CustomEvent('dashboard-refresh'))
        } else {
          console.error('Error al eliminar paquete')
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  useEffect(() => {
    cargarPaquetes()
  }, [])

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paquetes</h1>
          <p className="text-gray-600">Define los planes de membresía</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => setIsModalOpen(true)}>
          <span className="mr-2">+</span>
          Nuevo Paquete
        </Button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500">Cargando paquetes...</p>
        </div>
      ) : paquetes.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-500">No hay paquetes creados</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paquetes.map((paquete) => (
            <Card key={paquete.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{paquete.nombre}</CardTitle>
                    <p className="text-sm text-gray-600">{paquete.descripcion}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="text-gray-400 hover:text-blue-600"
                      onClick={() => handleEditarPaquete(paquete)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleEliminarPaquete(paquete.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Duración</p>
                    <p className="font-medium text-gray-900">{paquete.duracion_dias} días</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Precio</p>
                  <p className="text-2xl font-bold text-gray-900">${paquete.precio.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NuevoPaqueteModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onPaqueteCreado={cargarPaquetes}
      />

      <EditarPaqueteModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        paquete={paqueteSeleccionado}
        onPaqueteActualizado={cargarPaquetes}
      />
    </div>
  )
}
