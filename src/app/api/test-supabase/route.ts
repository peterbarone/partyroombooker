import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('Connection error:', connectionError)
      
      // If tables don't exist, provide setup instructions
      if (connectionError.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          error: 'Database tables not found',
          message: 'Please run the database.sql script in your Supabase dashboard SQL Editor',
          instructions: [
            '1. Go to your Supabase dashboard: https://supabase.com/dashboard',
            '2. Click on "SQL Editor"', 
            '3. Click "New query"',
            '4. Copy the contents of src/lib/database.sql',
            '5. Paste it in the SQL Editor and click Run',
            '6. This will create all tables and sample data',
            '7. Then test this API again'
          ]
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: false,
        error: connectionError.message,
        code: connectionError.code
      }, { status: 500 })
    }

    // Test reading tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('active', true)

    if (tenantsError) {
      return NextResponse.json({
        success: false,
        error: tenantsError.message
      }, { status: 500 })
    }

    // Test reading rooms for the test tenant
    const testTenant = tenants.find((t: any) => t.slug === 'thefamilyfunfactory')
    let roomsCount = 0
    
    if (testTenant) {
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id')
        .eq('tenant_id', testTenant.id)
        .eq('active', true)
      
      if (!roomsError) {
        roomsCount = rooms?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: {
        tenants_found: tenants.length,
        test_tenant_exists: !!testTenant,
        rooms_for_test_tenant: roomsCount,
        tenants: tenants.map((t: any) => ({ slug: t.slug, name: t.name }))
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred',
      details: error.message
    }, { status: 500 })
  }
}