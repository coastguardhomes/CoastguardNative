export interface User {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'tecnico' | 'cliente'
  telefono?: string
  created_at?: string
}
