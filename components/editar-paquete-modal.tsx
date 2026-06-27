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
  } | null
  onPaqueteActualizado?: () => void
}

export function EditarPaqueteModal({ open, onOpenChange, paquete, onPaqueteActualizado }: EditarPaqueteModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracion_dias: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (paquete && open) {
      setFormData({
        nombre: paquete.nombre,
        descripcion: paquete.descripcion,
        precio: paquete.precio.toString(),
        duracion_dias: paquete.duracion_dias.toString(),
      })
    }
  }, [paquete, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paquete) return
    
    setLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes/${paquete.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: parseFloat(formData.precio),
          duracion_dias: parseInt(formData.duracion_dias),
        }),
      })

      if (response.ok) {
        console.log('Paquete actualizado exitosamente')
        onOpenChange(false)
        
        // Llamar callback para refrescar la lista
        if (onPaqueteActualizado) {
          onPaqueteActualizado()
        }
        
        // Disparar evento para actualizar dashboard
        window.dispatchEvent(new CustomEvent('dashboard-refresh'))
      } else {
        console.error('Error al actualizar paquete')
      }
    } catch (error) {
      console.error('Error:', error)
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del paquete</Label>
              <Input
                id="nombre"
                placeholder="Ej: Básico, Premium, etc."
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                placeholder="Ej: 3 días por semana"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                placeholder="1500"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duracion_dias">Duración (días)</Label>
              <Input
                id="duracion_dias"
                type="number"
                placeholder="30"
                value={formData.duracion_dias}
                onChange={(e) => setFormData({ ...formData, duracion_dias: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Paquete'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
