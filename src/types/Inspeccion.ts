export interface Inspeccion {
  id: string
  clienteId: string
  tecnicoId: string
  fecha: string
  estado: 'pendiente' | 'completada' | 'sincronizada'
  datos: Record<string, any>
  pdfUrl?: string
  created_at?: string
  updated_at?: string
}
