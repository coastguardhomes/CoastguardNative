import { supabase } from "../lib/supabase"

// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data.user
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}

// GET USER
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// REGISTER
export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error
  return data.user
}

// RESET PASSWORD
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
  return true
}

// UPDATE PASSWORD
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
  return true
}
