'use client'

interface ProgressBarProps {
  currentPoints: number
  currentLevelMinPoints: number
  nextLevelMinPoints: number | null // null si ya está en el nivel máximo
  levelName: string
}

export default function ProgressBar({
  currentPoints,
  currentLevelMinPoints,
  nextLevelMinPoints,
  levelName
}: ProgressBarProps) {

  // Si ya está en el nivel máximo
  if (nextLevelMinPoints === null) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold">🏆 Nivel Máximo: {levelName}</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-4">
          <div className="bg-white h-4 rounded-full w-full flex items-center justify-center text-xs font-bold text-orange-600">
            ¡MAESTRO LECTOR!
          </div>
        </div>
      </div>
    )
  }

  // Cálculo del porcentaje de progreso hacia el siguiente nivel
  const pointsNeeded = nextLevelMinPoints - currentLevelMinPoints
  const pointsEarned = currentPoints - currentLevelMinPoints
  const percentage = Math.min(100, Math.max(0, (pointsEarned / pointsNeeded) * 100))

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Nivel Actual: <strong className="text-indigo-600">{levelName}</strong></span>
        <span className="text-sm font-bold text-indigo-600">{currentPoints} XP</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Efecto de brillo animado */}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        ¡Te faltan <strong>{nextLevelMinPoints - currentPoints} puntos</strong> para el siguiente nivel!
      </p>
    </div>
  )
}