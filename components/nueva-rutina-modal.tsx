"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"

interface Ejercicio {
  nombre: string
  series: string
  reps: string
}

interface DaySchedule {
  day: string
  muscleGroups: string[]
  ejercicios: Ejercicio[]
}

interface NuevaRutinaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRutinaCreada?: () => void
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const MUSCLE_GROUPS = ["Pecho", "Espalda", "Piernas", "Brazos", "Hombros", "Abdomen", "Cardio", "Glúteos", "Pantorrillas"]

const EJERCICIO_VACIO: Ejercicio = { nombre: "", series: "", reps: "" }

export function NuevaRutinaModal({ open, onOpenChange, onRutinaCreada }: NuevaRutinaModalProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [ejercicioActual, setEjercicioActual] = useState<Ejercicio>(EJERCICIO_VACIO)
  const [ejerciciosTmp, setEjerciciosTmp] = useState<Ejercicio[]>([])

  const handleToggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    )
  }

  const handleAddEjercicio = () => {
    if (!ejercicioActual.nombre) return
    setEjerciciosTmp([...ejerciciosTmp, ejercicioActual])
    setEjercicioActual(EJERCICIO_VACIO)
  }

  const handleRemoveEjercicio = (i: number) => {
    setEjerciciosTmp(ejerciciosTmp.filter((_, idx) => idx !== i))
  }

  const handleAddDay = () => {
    if (!selectedDay || selectedMuscles.length === 0) return

    const newDay: DaySchedule = {
      day: selectedDay,
      muscleGroups: selectedMuscles,
      ejercicios: ejerciciosTmp,
    }

    const idx = schedule.findIndex((s) => s.day === selectedDay)
    if (idx >= 0) {
      const updated = [...schedule]
      updated[idx] = newDay
      setSchedule(updated)
    } else {
      setSchedule([...schedule, newDay])
    }

    setSelectedDay("")
    setSelectedMuscles([])
    setEjerciciosTmp([])
    setEjercicioActual(EJERCICIO_VACIO)
  }

  const handleRemoveDay = (day: string) => {
    setSchedule(schedule.filter((s) => s.day !== day))
  }

  const resetForm = () => {
    setNombre("")
    setDescripcion("")
    setSchedule([])
    setSelectedDay("")
    setSelectedMuscles([])
    setEjerciciosTmp([])
    setEjercicioActual(EJERCICIO_VACIO)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/rutinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          programacion_semanal: JSON.stringify(schedule),
        }),
      })
      if (response.ok) {
        resetForm()
        onOpenChange(false)
        onRutinaCreada?.()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Rutina</DialogTitle>
          <DialogDescription>Crea una nueva rutina de entrenamiento con programación semanal</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la rutina</Label>
              <Input
                id="nombre"
                placeholder="Ej: Rutina de Fuerza"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe los objetivos de esta rutina..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                required
              />
            </div>

            {/* Programación Semanal */}
            <div className="space-y-4">
              <Label>Programación Semanal</Label>

              <Card className="border-2 border-dashed">
                <CardContent className="p-4 space-y-4">

                  {/* Día + grupos musculares */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Día de la semana</Label>
                      <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un día" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Grupos musculares</Label>
                      <div className="grid grid-cols-2 gap-1.5 p-3 border rounded-md max-h-36 overflow-y-auto">
                        {MUSCLE_GROUPS.map((muscle) => (
                          <div key={muscle} className="flex items-center space-x-2">
                            <Checkbox
                              id={muscle}
                              checked={selectedMuscles.includes(muscle)}
                              onCheckedChange={() => handleToggleMuscle(muscle)}
                            />
                            <label htmlFor={muscle} className="text-sm cursor-pointer">{muscle}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ejercicios */}
                  <div className="space-y-2">
                    <Label>Ejercicios del día</Label>

                    {/* Lista de ejercicios agregados */}
                    {ejerciciosTmp.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {ejerciciosTmp.map((ej, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-1.5 text-sm">
                            <span className="font-medium">{ej.nombre}</span>
                            <div className="flex items-center gap-3">
                              {ej.series && <span className="text-gray-500">{ej.series} series</span>}
                              {ej.reps && <span className="text-gray-500">× {ej.reps} reps</span>}
                              <button type="button" onClick={() => handleRemoveEjercicio(i)} className="text-gray-400 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario para agregar ejercicio */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre del ejercicio"
                        value={ejercicioActual.nombre}
                        onChange={(e) => setEjercicioActual({ ...ejercicioActual, nombre: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Series"
                        value={ejercicioActual.series}
                        onChange={(e) => setEjercicioActual({ ...ejercicioActual, series: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        placeholder="Reps"
                        value={ejercicioActual.reps}
                        onChange={(e) => setEjercicioActual({ ...ejercicioActual, reps: e.target.value })}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddEjercicio}
                        disabled={!ejercicioActual.nombre}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddDay}
                    disabled={!selectedDay || selectedMuscles.length === 0}
                    className="w-full"
                    variant="outline"
                  >
                    {schedule.find((s) => s.day === selectedDay) ? "Actualizar día" : "Agregar día"}
                  </Button>
                </CardContent>
              </Card>

              {/* Días ya agregados */}
              {schedule.length > 0 && (
                <div className="space-y-2">
                  <Label>Días programados ({schedule.length})</Label>
                  <div className="space-y-2">
                    {[...schedule]
                      .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                      .map((item) => (
                        <Card key={item.day}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-sm">{item.day}</span>
                              <button type="button" onClick={() => handleRemoveDay(item.day)} className="text-gray-400 hover:text-red-500">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.muscleGroups.map((m) => (
                                <span key={m} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{m}</span>
                              ))}
                            </div>
                            {item.ejercicios.length > 0 && (
                              <div className="space-y-0.5 mt-1">
                                {item.ejercicios.map((ej, i) => (
                                  <p key={i} className="text-xs text-gray-600">
                                    • {ej.nombre}{ej.series ? ` — ${ej.series}×${ej.reps}` : ""}
                                  </p>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!nombre || !descripcion || schedule.length === 0}
            >
              Guardar Rutina
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
