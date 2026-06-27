"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RegistrarPagoModalProps {
  isOpen: boolean
  onClose: () => void
  onPagoCreado?: () => void
  clientePreSeleccionado?: {
    id: number
    nombre: string
    apellido: string
  }
  paquetePreSeleccionado?: {
    id: number
    nombre: string
    precio: number
  }
}

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
}

interface Paquete {
  id: number
  nombre: string
  precio: number
}

export function RegistrarPagoModal({ 
  isOpen, 
  onClose, 
  onPagoCreado,
  clientePreSeleccionado,
  paquetePreSeleccionado 
}: RegistrarPagoModalProps) {
  const [formData, setFormData] = useState({
    cliente: "",
    paquete: "",
    fechaPago: "",
    duracion: "1",
  })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cargarDatos()
      // Si hay cliente y paquete preseleccionados, los establecemos
      if (clientePreSeleccionado && paquetePreSeleccionado) {
        setFormData({
          cliente: clientePreSeleccionado.id.toString(),
          paquete: paquetePreSeleccionado.id.toString(),
          fechaPago: new Date().toISOString().split('T')[0],
          duracion: "1",
        })
      }
    }
  }, [isOpen, clientePreSeleccionado, paquetePreSeleccionado])

  const cargarDatos = async () => {
    try {
      const [clientesRes, paquetesRes] = await Promise.all([
        fetch('${process.env.NEXT_PUBLIC_API_URL}/api/clientes'),
        fetch('${process.env.NEXT_PUBLIC_API_URL}/api/paquetes')
      ])

      if (clientesRes.ok) {
        const clientesData = await clientesRes.json()
        setClientes(clientesData)
      }

      if (paquetesRes.ok) {
        const paquetesData = await paquetesRes.json()
        setPaquetes(paquetesData)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const clienteSeleccionado = clientes.find(c => c.id.toString() === formData.cliente)
      const paqueteSeleccionado = paquetes.find(p => p.id.toString() === formData.paquete)
      
      if (!clienteSeleccionado || !paqueteSeleccionado) {
        console.error('Cliente o paquete no encontrado')
        return
      }

      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_cliente: parseInt(formData.cliente),
          fecha_pago: formData.fechaPago,
          monto: paqueteSeleccionado.precio * parseInt(formData.duracion),
        }),
      })

      if (response.ok) {
        console.log('Pago registrado exitosamente')
        onClose()
        setFormData({
          cliente: "",
          paquete: "",
          fechaPago: "",
          duracion: "1",
        })
        // Llamar callback para refrescar la lista
        if (onPagoCreado) {
          onPagoCreado()
        }
        
        // Disparar evento para actualizar dashboard
        window.dispatchEvent(new CustomEvent('dashboard-refresh'))
      } else {
        console.error('Error al registrar pago')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente */}
          <div>
            <Label htmlFor="cliente" className="mb-2 block text-sm font-medium text-gray-700">
              Cliente *
            </Label>
            <select
              id="cliente"
              required
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id.toString()}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Paquete */}
          <div>
            <Label htmlFor="paquete" className="mb-2 block text-sm font-medium text-gray-700">
              Paquete *
            </Label>
            <select
              id="paquete"
              required
              value={formData.paquete}
              onChange={(e) => setFormData({ ...formData, paquete: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleccionar paquete</option>
              {paquetes.map((paquete) => (
                <option key={paquete.id} value={paquete.id.toString()}>
                  {paquete.nombre} - ${paquete.precio}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Pago */}
          <div>
            <Label htmlFor="fechaPago" className="mb-2 block text-sm font-medium text-gray-700">
              Fecha de Pago *
            </Label>
            <div className="relative">
              <Input
                id="fechaPago"
                type="date"
                required
                value={formData.fechaPago}
                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                className="w-full"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Duración */}
          <div>
            <Label htmlFor="duracion" className="mb-2 block text-sm font-medium text-gray-700">
              Duración (meses) *
            </Label>
            <select
              id="duracion"
              required
              value={formData.duracion}
              onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="1">1 mes</option>
              <option value="2">2 meses</option>
              <option value="3">3 meses</option>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
