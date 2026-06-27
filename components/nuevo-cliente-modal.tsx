"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NuevoPaqueteModal } from "@/components/nuevo-paquete-modal"
import { RegistrarPagoModal } from "@/components/registrar-pago-modal"

interface NuevoClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClienteCreado?: () => void
}

interface Paquete {
  id: number
  nombre: string
  descripcion: string
  precio: number
  duracion_dias: number
}

interface Rutina {
  id: number
  nombre: string
  descripcion: string
  programacion_semanal: string
}

export function NuevoClienteModal({ open, onOpenChange, onClienteCreado }: NuevoClienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    paquete: "",
    rutina: "",
    tipo: "gimnasio",
  })
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [isPaqueteModalOpen, setIsPaqueteModalOpen] = useState(false)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [clienteRecienCreado, setClienteRecienCreado] = useState<{id: number, nombre: string, apellido: string} | null>(null)

  useEffect(() => {
    // Cargar paquetes y rutinas disponibles
    const cargarDatos = async () => {
      try {
        const [paquetesRes, rutinasRes] = await Promise.all([
          fetch('http://localhost:4000/api/paquetes'),
          fetch('http://localhost:4000/api/rutinas')
        ])

        if (paquetesRes.ok) {
          const paquetesData = await paquetesRes.json()
          setPaquetes(paquetesData)
        }

        if (rutinasRes.ok) {
          const rutinasData = await rutinasRes.json()
          setRutinas(rutinasData)
        }
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }
    cargarDatos()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:4000/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: '',
          email: formData.email,
          telefono: formData.telefono,
          fecha_nacimiento: new Date(),
          activo: true,
          tipo: formData.tipo,
          id_paquete: parseInt(formData.paquete),
          id_rutina: formData.rutina ? parseInt(formData.rutina) : null,
        }),
      })
  
      if (response.ok) {
        const clienteCreado = await response.json()
        console.log('Cliente creado exitosamente')
        
        // Guardar datos del cliente creado para el pago
        setClienteRecienCreado({
          id: clienteCreado.id,
          nombre: clienteCreado.nombre,
          apellido: clienteCreado.apellido
        })
        
        // Reset form
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          paquete: "",
          rutina: "",
        })
        
        // Cerrar modal de cliente y abrir modal de pago
        onOpenChange(false)
        setIsPagoModalOpen(true)
        
        // Llamar callback para refrescar la lista
        if (onClienteCreado) {
          onClienteCreado()
        }
        
        // Disparar evento para actualizar dashboard
        window.dispatchEvent(new CustomEvent('dashboard-refresh'))
      } else {
        console.error('Error al crear cliente')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Ingresa el nombre del cliente"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="+52 123 456 7890"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

            {/* Tipo de membresía */}
            <div className="space-y-2">
              <Label>Tipo de membresía</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "gimnasio", label: "Gimnasio" },
                  { value: "aerobox", label: "Aero Box" },
                  { value: "personalizado", label: "Personalizado" },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: t.value })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.tipo === t.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Paquete */}
            <div className="space-y-2">
              <Label htmlFor="paquete">Paquete</Label>
              <Select
                value={formData.paquete}
                onValueChange={(value) => setFormData({ ...formData, paquete: value })}
                required
              >
                <SelectTrigger id="paquete">
                  <SelectValue placeholder="Selecciona un paquete" />
                </SelectTrigger>
                <SelectContent>
                  {paquetes.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">No hay paquetes disponibles</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsPaqueteModalOpen(true)}
                      >
                        Crear primer paquete
                      </Button>
                    </div>
                  ) : (
                    paquetes.map((paquete) => (
                      <SelectItem key={paquete.id} value={paquete.id.toString()}>
                        {paquete.nombre} - ${paquete.precio}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Rutina */}
            <div className="space-y-2">
              <Label htmlFor="rutina">Rutina</Label>
              <Select
                value={formData.rutina}
                onValueChange={(value) => setFormData({ ...formData, rutina: value })}
                required
              >
                <SelectTrigger id="rutina">
                  <SelectValue placeholder="Selecciona una rutina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin rutina asignada</SelectItem>
                  {rutinas.map((rutina) => (
                    <SelectItem key={rutina.id} value={rutina.id.toString()}>
                      {rutina.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
      
      <NuevoPaqueteModal 
        open={isPaqueteModalOpen} 
        onOpenChange={setIsPaqueteModalOpen}
        onPaqueteCreado={() => {
          // Recargar paquetes cuando se crea uno nuevo
          const cargarPaquetes = async () => {
            try {
              const response = await fetch('http://localhost:4000/api/paquetes')
              if (response.ok) {
                const data = await response.json()
                setPaquetes(data)
              }
            } catch (error) {
              console.error('Error al cargar paquetes:', error)
            }
          }
          cargarPaquetes()
        }}
      />
      
      <RegistrarPagoModal 
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        clientePreSeleccionado={clienteRecienCreado || undefined}
        paquetePreSeleccionado={paquetes.find(p => p.id.toString() === formData.paquete)}
        onPagoCreado={() => {
          // Opcional: refrescar alguna lista de pagos si es necesario
          console.log('Pago creado exitosamente')
        }}
      />
    </Dialog>
  )
}
