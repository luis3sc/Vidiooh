'use client'

import { useState, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // CORRECCIÓN: Inicializamos en null para evitar el error "does not support nodejs"
  // durante el renderizado del servidor (SSR).
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const messageRef = useRef<string | null>(null)

  const load = async () => {
    // Si ya está cargado, no hacemos nada
    if (loaded) return

    setIsLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'

    try {
      // CORRECCIÓN: Creamos la instancia AQUÍ, solo cuando estamos en el navegador
      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg()
      }

      const ffmpeg = ffmpegRef.current

      ffmpeg.on('log', ({ message }) => {
        messageRef.current = message
        console.log('FFmpeg Log:', message)
      })

      // Cargamos el núcleo de FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      
      setLoaded(true)
    } catch (error) {
      console.error('Error cargando FFmpeg:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Devolvemos la referencia (puede ser null al principio)
  return { ffmpeg: ffmpegRef.current, loaded, load, isLoading }
}