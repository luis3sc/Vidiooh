import { useEffect, useState } from 'react'

export const useHardwareCheck = () => {
  const [isLowSpec, setIsLowSpec] = useState(false)
  const [coreCount, setCoreCount] = useState(0)

  useEffect(() => {
    // Verificamos si estamos en el cliente
    if (typeof window !== 'undefined' && navigator.hardwareConcurrency) {
      const cores = navigator.hardwareConcurrency
      setCoreCount(cores)
      
      // CRITERIO: Si tiene 4 núcleos o menos, lo consideramos "Gama Baja" para video
      // El procesamiento de video idealmente requiere 6 u 8 núcleos.
      if (cores <= 4) {
        setIsLowSpec(true)
      }
    }
  }, [])

  return { isLowSpec, coreCount }
}