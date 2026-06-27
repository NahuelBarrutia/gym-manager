"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EditarPaqueteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paquete: {
    id: number
    nombre: string
    descripcion: string
    precio: number
    duracion_dias: number
    tipo?: string
  } | null
  onPaqueteActualizado?: () => void
}

const TIPOS = [
  { value: "gimnasio", label: "Gimnasio" },
  { value: "aerobox", label: "Aero Box" },
  { value: "personalizado", label: "Personalizado" },
]

export function EditarPaqueteModal({ open, onOpenChange, paquete, onPaqueteActualizado }: EditarPaqueteModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion_dias: "",
    tipo: "gimnasio",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (paquete && open) {
      setFormData({
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: paquete.precio.toString(),
        duracion_dias: paquete.duracion_dias.toString(),
        tipo: paquete.tipo ?? "gimnasio",
      })
    }
  }, [paquete, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paquete) return
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes/${paquete.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: parseFloat(formData.precio),
          duracion_dias: parseInt(formData.duracion_dias),
          tipo: formData.tipo,
        }),
      })
      if (response.ok) {
        onOpenChange(false)
        onPaqueteActualizado?.()
        window.dispatchEvent(new CustomEvent("dashboard-refresh"))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Paquete</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Membresía</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => (
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

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del paquete</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duracion_dias">Duración (días)</Label>
              <Input
                id="duracion_dias"
                type="number"
                min="1"
                value={formData.duracion_dias}
                onChange={(e) => setFormData({ ...formData, duracion_dias: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Actualizando...
                </span>
              ) : "Actualizar Paquete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
