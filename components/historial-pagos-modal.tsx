"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Pago {
  id: number
  fecha_pago: string
  monto: number
  cliente?: {
    paquete?: {
      duracion_dias: number
      nombre: string
    }
  }
}

interface Cliente {
  id: number
  nombre: string
  apellido: string
}

interface HistorialPagosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
}

function calcularVencimiento(fechaPago: string, duracionDias: number): Date {
  const fecha = new Date(fechaPago)
  fecha.setDate(fecha.getDate() + duracionDias)
  return fecha
}

export function HistorialPagosModal({ open, onOpenChange, cliente }: HistorialPagosModalProps) {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cliente || !open) return
    const cargarPagos = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:4000/api/pagos/cliente/${cliente.id}`)
        if (res.ok) setPagos(await res.json())
      } catch (error) {
        console.error("Error al cargar historial:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarPagos()
  }, [cliente, open])

  const hoy = new Date()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Historial de Pagos — {cliente?.nombre} {cliente?.apellido}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        ) : pagos.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-500">Este cliente no tiene pagos registrados.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {pagos.map((pago) => {
              const duracion = pago.cliente?.paquete?.duracion_dias ?? 0
              const vencimiento = calcularVencimiento(pago.fecha_pago, duracion)
              const vigente = vencimiento >= hoy

              return (
                <div key={pago.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pago.cliente?.paquete?.nombre ?? "Sin paquete"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pago: {new Date(pago.fecha_pago).toLocaleDateString("es-AR")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vence: {vencimiento.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-green-600">
                      ${pago.monto.toLocaleString()}
                    </p>
                    <Badge
                      className={vigente
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {vigente ? "Vigente" : "Vencido"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
