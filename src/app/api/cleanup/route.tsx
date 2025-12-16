import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Esta ruta busca videos de hace más de 2 horas y los elimina
export async function GET() {
  try {
    // 1. Conexión MAESTRA: Usamos la 'Secret Key' para poder borrar archivos de cualquiera
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // <--- Aquí usa la clave que acabas de copiar
    )

    // 2. Calcular la fecha límite (Hace 2 horas)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

    // 3. Buscar videos viejos en la DB
    const { data: oldLogs, error: fetchError } = await supabaseAdmin
      .from('conversion_logs')
      .select('id, file_path')
      .lt('created_at', twoHoursAgo) // "lt" = menor que (más viejo que)

    if (fetchError) throw fetchError
    
    // Si no hay nada viejo, terminamos aquí
    if (!oldLogs || oldLogs.length === 0) {
      return NextResponse.json({ message: 'Nada que borrar por hoy.' })
    }

    // 4. Borrar Archivos del Storage (Nube)
    const filesToDelete = oldLogs.map(log => log.file_path)
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin
        .storage
        .from('raw-videos')
        .remove(filesToDelete)
      
      if (storageError) console.error('Error borrando archivos:', storageError)
    }

    // 5. Borrar Registros de la DB
    const idsToDelete = oldLogs.map(log => log.id)
    const { error: dbError } = await supabaseAdmin
      .from('conversion_logs')
      .delete()
      .in('id', idsToDelete)

    if (dbError) throw dbError

    return NextResponse.json({ 
      success: true, 
      deleted_count: idsToDelete.length,
      message: `Limpieza exitosa: Se eliminaron ${idsToDelete.length} videos antiguos.` 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}