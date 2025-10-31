// lib/auth.ts
// Authentication helper functions for admin area

import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 */
export async function signUp({ email, password, fullName }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get the current user session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }

  return session;
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  return user as AuthUser;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Check if user has access to a tenant
 */
export async function userHasTenantAccess(tenantSlug: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('user_has_tenant_access', {
    p_tenant_slug: tenantSlug,
  });

  if (error) {
    console.error('Error checking tenant access:', error);
    return false;
  }

  return data === true;
}

/**
 * Get user's role for a specific tenant
 */
export async function getUserTenantRole(tenantSlug: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_user_tenant_role', {
    p_tenant_slug: tenantSlug,
  });

  if (error) {
    console.error('Error getting user role:', error);
    return null;
  }

  return data;
}

/**
 * Get all tenants the current user has access to
 */
export async function getUserTenants() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_tenants')
    .select(`
      id,
      role,
      permissions,
      tenant:tenants (
        id,
        slug,
        name,
        active,
        subscription_status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }

  return data || [];
}
