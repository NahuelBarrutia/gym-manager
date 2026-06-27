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
  tipo: string
}

interface Rutina {
  id: number
  nombre: string
}

const TIPOS = [
  { value: "gimnasio", label: "Gimnasio" },
  { value: "aerobox", label: "Aero Box" },
  { value: "personalizado", label: "Personalizado" },
]

export function NuevoClienteModal({ open, onOpenChange, onClienteCreado }: NuevoClienteModalProps) {
  const [formData, setFormData] = useState({
    nombre: "", email: "", telefono: "", paquete: "", rutina: "", tipo: "gimnasio",
  })
  const [paquetes, setPaquetes] = useState<Paquete[]>([])
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [isPaqueteModalOpen, setIsPaqueteModalOpen] = useState(false)
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)
  const [clienteRecienCreado, setClienteRecienCreado] = useState<{ id: number; nombre: string; apellido: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const paquetesFiltrados = paquetes.filter((p) => p.tipo === formData.tipo)

  useEffect(() => { if (open) cargarDatos() }, [open])

  const handleTipoChange = (tipo: string) => {
    setFormData((prev) => ({ ...prev, tipo, paquete: "" }))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: "",
          email: formData.email,
          telefono: formData.telefono,
          fecha_nacimiento: new Date(),
          activo: true,
          tipo: formData.tipo,
          id_paquete: parseInt(formData.paquete),
          id_rutina: formData.rutina && formData.rutina !== "none" ? parseInt(formData.rutina) : null,
        }),
      })
      if (response.ok) {
        const clienteCreado = await response.json()
        setClienteRecienCreado({ id: clienteCreado.id, nombre: clienteCreado.nombre, apellido: clienteCreado.apellido })
        setFormData({ nombre: "", email: "", telefono: "", paquete: "", rutina: "", tipo: "gimnasio" })
        onOpenChange(false)
        setIsPagoModalOpen(true)
        onClienteCreado?.()
        window.dispatchEvent(new CustomEvent("dashboard-refresh"))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" placeholder="Nombre del cliente" value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="cliente@ejemplo.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" type="tel" placeholder="+54 11 1234-5678" value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>Tipo de membresia</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS.map((t) => (
                  <button key={t.value} type="button" onClick={() => handleTipoChange(t.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.tipo === t.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paquete">Paquete</Label>
              <Select value={formData.paquete} onValueChange={(v) => setFormData({ ...formData, paquete: v })} required>
                <SelectTrigger id="paquete">
                  <SelectValue placeholder={paquetesFiltrados.length === 0 ? "Sin paquetes para esta membresia" : "Selecciona un paquete"} />
                </SelectTrigger>
                <SelectContent>
                  {paquetesFiltrados.length === 0 ? (
                    <div className="p-3 text-center">
                      <p className="text-sm text-gray-500 mb-2">No hay paquetes para {TIPOS.find((t) => t.value === formData.tipo)?.label}</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsPaqueteModalOpen(true)}>Crear paquete</Button>
                    </div>
                  ) : (
                    paquetesFiltrados.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nombre} - ${p.precio.toLocaleString()} / {p.duracion_dias}d
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rutina">Rutina (opcional)</Label>
              <Select value={formData.rutina} onValueChange={(v) => setFormData({ ...formData, rutina: v })}>
                <SelectTrigger id="rutina">
                  <SelectValue placeholder="Sin rutina asignada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin rutina asignada</SelectItem>
                  {rutinas.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading || !formData.paquete}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </span>
                ) : "Guardar Cliente"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NuevoPaqueteModal open={isPaqueteModalOpen} onOpenChange={setIsPaqueteModalOpen} onPaqueteCreado={cargarDatos} />

      <RegistrarPagoModal
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        clientePreSeleccionado={clienteRecienCreado ?? undefined}
        paquetePreSeleccionado={paquetes.find((p) => p.id.toString() === formData.paquete)}
        onPagoCreado={() => window.dispatchEvent(new CustomEvent("dashboard-refresh"))}
      />
    </>
  )
}
