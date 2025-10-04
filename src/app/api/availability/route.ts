import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tenantSlug = searchParams.get('tenant')
    const date = searchParams.get('date')
    const packageId = searchParams.get('packageId')
    const kidsCount = parseInt(searchParams.get('kids') || '1')

    if (!tenantSlug || !date || !packageId) {
      return NextResponse.json(
        { error: 'Missing required parameters: tenant, date, packageId' },
        { status: 400 }
      )
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .eq('active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get package info
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('tenant_id', tenant.id)
      .eq('active', true)
      .single()

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Get eligible rooms for this package from DB
    const { data: mappings, error: mappingError } = await supabase
      .from('package_rooms')
      .select('room_id')
      .eq('tenant_id', tenant.id)
      .eq('package_id', packageId)

    if (mappingError) {
      return NextResponse.json(
        { error: 'Failed to fetch package room mappings', details: mappingError.message },
        { status: 500 }
      )
    }

    const eligibleRoomIds = (mappings || []).map(m => m.room_id)

    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('tenant_id', tenant.id)
      .in('id', eligibleRoomIds)
      .eq('active', true)

    if (roomsError) {
      return NextResponse.json(
        { error: 'Failed to fetch rooms', details: roomsError.message },
        { status: 500 }
      )
    }

    // Filter rooms by capacity
    const availableRooms = (rooms || []).filter(room => room.max_kids >= kidsCount)

    // Mock time slots (frontend uses Edge Function availability for real data)
    const timeSlots = [
      {
        time_start: '10:00',
        time_end: '12:00',
        rooms: availableRooms.map(room => ({
          room_id: room.id,
          room_name: room.name,
          max_kids: room.max_kids,
          eligible: true,
          available: true // Would check actual availability here
        }))
      },
      {
        time_start: '12:30',
        time_end: '14:30',
        rooms: availableRooms.map(room => ({
          room_id: room.id,
          room_name: room.name,
          max_kids: room.max_kids,
          eligible: true,
          available: true
        }))
      },
      {
        time_start: '15:00',
        time_end: '17:00',
        rooms: availableRooms.map(room => ({
          room_id: room.id,
          room_name: room.name,
          max_kids: room.max_kids,
          eligible: true,
          available: true
        }))
      }
    ]

    return NextResponse.json({
      success: true,
      tenant: tenant.name,
      package: packageData.name,
      date,
      kids_count: kidsCount,
      time_slots: timeSlots
    })

  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}