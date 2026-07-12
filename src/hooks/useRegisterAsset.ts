import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Asset } from './useAssets'

/**
 * Uploads a file to the Supabase Storage bucket 'asset-photos'
 * and simulates progress feedback for a smooth user interface.
 */
export async function uploadAssetPhoto(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = `photos/${fileName}`

  // Simulate progress steps
  let currentPct = 10
  if (onProgress) onProgress(currentPct)
  
  const progressTimer = setInterval(() => {
    if (currentPct < 90) {
      currentPct += 15
      if (onProgress) onProgress(currentPct)
    }
  }, 120)

  try {
    const { error } = await supabase.storage
      .from('asset-photos')
      .upload(filePath, file, { cacheControl: '3600', upsert: true })

    clearInterval(progressTimer)

    if (error) {
      // Fallback for demo environments if bucket does not exist yet
      if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
        console.warn('Storage bucket "asset-photos" not found. Falling back to Object URL representation.')
        if (onProgress) onProgress(100)
        return URL.createObjectURL(file)
      }
      throw error
    }

    if (onProgress) onProgress(100)

    const { data } = supabase.storage
      .from('asset-photos')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (err) {
    clearInterval(progressTimer)
    throw err
  }
}

/**
 * Mutation to register a new asset
 */
export function useCreateAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation<Asset, Error, Omit<Asset, 'id' | 'asset_tag' | 'created_at'>>({
    mutationFn: async (newAsset) => {
      // Relies on RLS: authenticated user insert
      const { data, error } = await supabase
        .from('assets')
        .insert([newAsset])
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpi'] })
    }
  })
}

/**
 * Mutation to update an existing asset
 */
export function useUpdateAssetMutation() {
  const queryClient = useQueryClient()
  return useMutation<Asset, Error, Partial<Asset> & { id: string }>({
    mutationFn: async (updatedAsset) => {
      // Relies on RLS: authenticated user update
      const { data, error } = await supabase
        .from('assets')
        .update(updatedAsset)
        .eq('id', updatedAsset.id)
        .select()
        .single()

      if (error) throw error
      return data as Asset
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset-detail', data.id] })
    }
  })
}
