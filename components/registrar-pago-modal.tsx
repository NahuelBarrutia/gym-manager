"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Calendar, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RegistrarPagoModalProps {
  isOpen: boolean
  onClose: () => void
  onPagoCreado?: () => void
  clientePreSeleccionado?: { id: number; nombre: string; apellido: string }
  paquetePreSeleccionado?: { id: number; nombre: string; precio: number }
}

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  paquete?: { id: number; nombre: string; precio: number; duracion_dias: number }
}

export function RegistrarPagoModal({
  isOpen, onClose, onPagoCreado, clientePreSeleccionado, paquetePreSeleccionado,
}: RegistrarPagoModalProps) {
  const [formData, setFormData] = useState({ cliente: "", fechaPago: "" })
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)

  const clienteSeleccionado = clientes.find((c) => c.id.toString() === formData.cliente)
  const paquete = clienteSeleccionado?.paquete ?? paquetePreSeleccionado ?? null
  const monto = paquete?.precio ?? 0

  useEffect(() => {
    if (isOpen) {
      cargarClientes()
      const hoy = new Date().toISOString().split("T")[0]
      if (clientePreSeleccionado) {
        setFormData({ cliente: clientePreSeleccionado.id.toString(), fechaPago: hoy })
      } else {
        setFormData({ cliente: "", fechaPago: hoy })
      }
    }
  }, [isOpen, clientePreSeleccionado])

  const cargarClientes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`)
      if (res.ok) setClientes(await res.json())
    } catch (error) {
      console.error("Error al cargar clientes:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteSeleccionado || !paquete) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: parseInt(formData.cliente),
          fecha_pago: formData.fechaPago,
          monto,
        }),
      })
      if (response.ok) {
        onClose()
        setFormData({ cliente: "", fechaPago: "" })
        onPagoCreado?.()
        window.dispatchEvent(new CustomEvent("dashboard-refresh"))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Pago</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente */}
          <div>
            <Label htmlFor="cliente" className="mb-2 block text-sm font-medium text-gray-700">Cliente *</Label>
            {clientePreSeleccionado ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{clientePreSeleccionado.nombre} {clientePreSeleccionado.apellido}</span>
              </div>
            ) : (
              <select
                id="cliente"
                required
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Paquete — solo lectura, autocompletado del cliente */}
          <div>
            <Label className="mb-2 block text-sm font-medium text-gray-700">
              Paquete asignado
              <span className="ml-1 text-xs text-gray-400">(automático)</span>
            </Label>
            {paquete ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                <Lock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-800 font-medium">{paquete.nombre}</span>
                <span className="ml-auto text-sm font-semibold text-blue-700">${monto.toLocaleString()}</span>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                {formData.cliente ? "Este cliente no tiene paquete asignado" : "Seleccioná un cliente primero"}
              </div>
            )}
            {formData.cliente && !paquete && (
              <p className="mt-1 text-xs text-amber-600">Asigná un paquete al cliente desde la sección Clientes antes de registrar el pago.</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <Label htmlFor="fechaPago" className="mb-2 block text-sm font-medium text-gray-700">Fecha de Pago *</Label>
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

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">Cancelar</Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading || !paquete}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registrando...
                </span>
              ) : "Registrar Pago"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
