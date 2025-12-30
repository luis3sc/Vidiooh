import { useEffect, useRef, useState } from 'react'

export const useKeepAlive = (isProcessing: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const [isActive, setIsActive] = useState(false)

  // 1. EL "TRUCO" DEL AUDIO SILENCIOSO (Base64 de un MP3 de 1 segundo de silencio)
  const SILENT_AUDIO = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTSVMAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUzAAAAAAAAAAAAAAAAAAAAAAAAAAAACCAAAAAAAAAAAAAA//OUAAAAAAAAAAAAAAAAAAAAAAAYWluZwAAAAAAAAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAA='

  useEffect(() => {
    // Inicializar el elemento de audio una sola vez
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio(SILENT_AUDIO)
      audio.loop = true
      audio.volume = 0.01 // Casi mudo, pero técnicamente "sonando"
      audioRef.current = audio
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isProcessing && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          const wakeLock = await navigator.wakeLock.request('screen')
          wakeLockRef.current = wakeLock
          console.log('⚡ Wake Lock activo: Pantalla no se apagará')
          
          wakeLock.addEventListener('release', () => {
            console.log('💤 Wake Lock liberado')
            wakeLockRef.current = null
          })
        } catch (err) {
          console.log('⚠️ No se pudo activar Wake Lock:', err)
        }
      }
    }

    const activate = async () => {
      if (isProcessing) {
        // A. Activar Audio Hack
        if (audioRef.current) {
          try {
            await audioRef.current.play()
            setIsActive(true)
            console.log('🔊 Modo Background Activo (Audio)')
          } catch (e) {
            console.warn('No se pudo reproducir audio (interacción requerida):', e)
          }
        }
        // B. Activar Wake Lock
        await requestWakeLock()
      } else {
        // Desactivar todo cuando termina
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          setIsActive(false)
        }
        if (wakeLockRef.current) {
          await wakeLockRef.current.release()
          wakeLockRef.current = null
        }
      }
    }

    activate()
    
    // Re-solicitar Wake Lock si la pestaña vuelve a ser visible (a veces el navegador lo suelta)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLockRef.current) wakeLockRef.current.release()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [isProcessing])

  return isActive
}