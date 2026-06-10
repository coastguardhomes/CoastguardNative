export interface SyncItem {
  id: string
  tipo: 'inspeccion'
  payload: any
  fecha: string
  estado: 'pendiente' | 'procesando' | 'completado' | 'error'
}
