import { supabase } from './supabase'

/**
 * Upload a file to Supabase Storage bucket "media"
 * Returns the public URL of the uploaded file
 */
export async function uploadMedia(file: File, folder: string = 'images'): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Upload an avatar to Supabase Storage bucket "media"
 * Uses a fixed filename (userId) and upserts (overwrites) if it exists.
 */
export async function uploadAvatar(file: Blob, userId: string): Promise<string | null> {
  const fileName = `avatars/${userId}.webp`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/webp'
    })

  if (error) {
    console.error('Upload avatar error:', error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(data.path)

  // Tambahkan query cache buster agar browser langsung memuat gambar baru
  return `${urlData.publicUrl}?v=${Date.now()}`
}

/**
 * Delete a file from the media bucket by its public URL
 */
export async function deleteMedia(publicUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const urlObj = new URL(publicUrl)
    // Mencari '/media/' di pathname
    const mediaIndex = urlObj.pathname.indexOf('/media/')
    if (mediaIndex === -1) return { success: false, error: "URL tidak valid (tidak ada /media/)" }

    // Mengambil semua karakter setelah '/media/'
    const filePath = decodeURIComponent(urlObj.pathname.substring(mediaIndex + 7))

    const { error } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (error) {
      console.error("Gagal menghapus media:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("URL tidak valid untuk dihapus:", err)
    return { success: false, error: err.message }
  }
}
