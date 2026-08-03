// Reexporta el cliente único definido en src/lib/supabase.js.
//
// Antes este archivo llamaba a createClient() por su cuenta, así que la app
// levantaba DOS clientes de Supabase: uno aquí (Login, PrivateRoute,
// AuthContext, Register...) y otro en lib/supabase.js (el resto de pantallas).
// Dos instancias de GoTrue compartiendo la misma sesión provocaban que, justo
// después de iniciar sesión, el guard todavía no la viera y devolviese al
// login.
//
// Se mantiene el archivo para no tocar los imports que ya apuntan aquí.

import supabase from "./lib/supabase.js";
export default supabase;
