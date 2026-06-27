"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NuevaRutinaModal } from "@/components/nueva-rutina-modal"

interface Ejercicio {
  nombre: string
  series: string
  reps: string
}

interface DiaSchedule {
  day: string
  muscleGroups: string[]
  ejercicios?: Ejercicio[]
}

interface Rutina {
  id: number
  nombre: string
  descripcion: string
  programacion_semanal: string
}

export default function RutinasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rutinas, setRutinas] = useState<Rutina[]>([])
  const [loading, setLoading] = useState(true)

  const cargarRutinas = async () => {
    try {
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/rutinas')
      if (response.ok) {
        const data = await response.json()
        setRutinas(data)
      }
    } catch (error) {
      console.error('Error al cargar rutinas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRutinas()
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rutinas</h1>
          <p className="text-gray-600">Crea rutinas organizadas por día de la semana</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => setIsModalOpen(true)}>
          <span className="mr-2">+</span>
          Nueva Rutina
        </Button>
      </div>

      {/* Routines Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">Cargando rutinas...</p>
            </div>
          ) : rutinas.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-gray-500">No hay rutinas creadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">Rutinas Disponibles ({rutinas.length})</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rutinas.map((rutina) => {
                  const programacion: DiaSchedule[] = JSON.parse(rutina.programacion_semanal || '[]')
                  return (
                    <Card key={rutina.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{rutina.nombre}</CardTitle>
                        <p className="text-sm text-gray-500 line-clamp-2">{rutina.descripcion}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {programacion.map((dia, index) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-3">
                            <p className="text-xs font-semibold text-gray-700 mb-1">{dia.day}</p>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {dia.muscleGroups.map((m, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                                  {m}
                                </span>
                              ))}
                            </div>
                            {dia.ejercicios && dia.ejercicios.length > 0 && (
                              <div className="space-y-0.5 mt-1">
                                {dia.ejercicios.map((ej, i) => (
                                  <p key={i} className="text-xs text-gray-500">
                                    • {ej.nombre}{ej.series ? ` ${ej.series}×${ej.reps}` : ""}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NuevaRutinaModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onRutinaCreada={cargarRutinas}
      />
    </div>
  )
}
