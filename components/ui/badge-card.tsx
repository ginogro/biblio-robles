import Image from 'next/image'

interface BadgeProps {
  name: string
  description: string | null
  iconUrl: string | null
  unlocked: boolean // Para mostrar gris si no la tiene
}

export default function BadgeCard({ name, description, iconUrl, unlocked }: BadgeProps) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
      unlocked
        ? 'bg-indigo-50 border-indigo-200 shadow-sm hover:scale-105'
        : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
    }`}>
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner mb-2 overflow-hidden">
        {iconUrl ? (
          <Image src={iconUrl} alt={name} width={50} height={50} />
        ) : (
          <span className="text-3xl">{unlocked ? '🏅' : '🔒'}</span>
        )}
      </div>
      <h4 className="font-bold text-sm text-center text-gray-800">{name}</h4>
      {unlocked && description && (
        <p className="text-xs text-center text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}