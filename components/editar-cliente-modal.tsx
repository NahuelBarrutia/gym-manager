"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Cliente {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  activo: boolean
  tipo: string
  id_paquete: number
  id_rutina: number | null
}

interface Paquete {
  id: number
  nombre: string
  precio: number
}

interface Rutina {
  id: number
  nombre: string
}

interface EditarClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente: Cliente | null
  onClienteActualizado?: () => void
}

export function EditarClienteModal({ open, onOpenChange, cliente, onClienteActualizado }: EditarClienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipo: "gimnasio",
    id_paquete: "",
    id_rutina: "",
    activo: true,
  })
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [paquetesRes, rutinasRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/paquetes`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rutinas`),
        ])
        if (paquetesRes.ok) setPaquetes(await paquetesRes.json())
        if (rutinasRes.ok) setRutinas(await rutinasRes.json())
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    cargarDatos()
  }, [])

  useEffect(() => {
    if (cliente && open) {
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        tipo: cliente.tipo ?? "gimnasio",
        id_paquete: cliente.id_paquete.toString(),
        id_rutina: cliente.id_rutina?.toString() ?? "",
        activo: cliente.activo,
      })
    }
  }, [cliente, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) return

    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes/${cliente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono,
          tipo: formData.tipo,
          id_paquete: parseInt(formData.id_paquete),
          id_rutina: formData.id_rutina ? parseInt(formData.id_rutina) : null,
          activo: formData.activo,
        }),
      })

      if (response.ok) {
        onOpenChange(false)
        onClienteActualizado?.()
        window.dispatchEvent(new CustomEvent("dashboard-refresh"))
      } else {
        console.error("Error al actualizar cliente")
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
          <DialogTitle className="text-2xl font-bold">Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="paquete">Paquete</Label>
              <Select
                value={formData.id_paquete}
                onValueChange={(value) => setFormData({ ...formData, id_paquete: value })}
              >
                <SelectTrigger id="paquete">
                  <SelectValue placeholder="Selecciona un paquete" />
                </SelectTrigger>
                <SelectContent>
                  {paquetes.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} - ${p.precio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rutina">Rutina asignada</Label>
              <Select
                value={formData.id_rutina}
                onValueChange={(value) => setFormData({ ...formData, id_rutina: value === "none" ? "" : value })}
              >
                <SelectTrigger id="rutina">
                  <SelectValue placeholder="Sin rutina asignada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin rutina</SelectItem>
                  {rutinas.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="activo">Estado</Label>
              <button
                id="activo"
                type="button"
                onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.activo ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.activo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">{formData.activo ? "Activo" : "Inactivo"}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
