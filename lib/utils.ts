import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 팀원 화면 기준 레벨 관련 함수들
export const getLevelName = (level: number) => {
  switch (level) {
    case 1: return "루키 1"
    case 2: return "비기너 1"
    case 3: return "비기너 2"
    case 4: return "비기너 3"
    case 5: return "아마추어 1"
    case 6: return "아마추어 2"
    case 7: return "아마추어 3"
    case 8: return "아마추어 4"
    case 9: return "아마추어 5"
    case 10: return "세미프로 1"
    case 11: return "세미프로 2"
    case 12: return "세미프로 3"
    case 13: return "프로 1"
    default: return `레벨 ${level}`
  }
}

export const getCategoryName = (level: number) => {
  if (level === 1) return "루키"
  if (level >= 2 && level <= 4) return "비기너"
  if (level >= 5 && level <= 9) return "아마추어"
  if (level >= 10 && level <= 12) return "세미프로"
  if (level === 13) return "프로"
  return "기타"
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "루키": return "🥾"
    case "비기너": return "⚽"
    case "아마추어": return "🏆"
    case "세미프로": return "⭐"
    case "프로": return "🥇"
    default: return "⚽"
  }
}

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "프로": return { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-orange-800', border: 'border-orange-300' }
    case "세미프로": return { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-800', border: 'border-blue-300' }
    case "아마추어": return { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-800', border: 'border-green-300' }
    case "비기너": return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
    case "루키": return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
  }
}

export const getLevelIcon = (level: number) => {
  switch (level) {
    case 1: return "🥾"
    case 2: return "⚽"
    case 3: return "🏃"
    case 4: return "👟"
    case 5: return "🏆"
    case 6: return "⭐"
    case 7: return "🔥"
    case 8: return "👑"
    case 9: return "💎"
    case 10: return "🌟"
    case 11: return "🎯"
    case 12: return "⚡"
    case 13: return "🥇"
    default: return "⚽"
  }
}

export const getLevelColor = (level: number) => {
  switch (level) {
    case 13: return { bg: 'bg-gradient-to-r from-yellow-100 to-orange-100', text: 'text-orange-800', border: 'border-orange-300' }
    case 12: return { bg: 'bg-gradient-to-r from-purple-100 to-pink-100', text: 'text-purple-800', border: 'border-purple-300' }
    case 11: return { bg: 'bg-gradient-to-r from-purple-100 to-indigo-100', text: 'text-purple-800', border: 'border-purple-300' }
    case 10: return { bg: 'bg-gradient-to-r from-blue-100 to-indigo-100', text: 'text-blue-800', border: 'border-blue-300' }
    case 9: return { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-800', border: 'border-green-300' }
    case 8: return { bg: 'bg-gradient-to-r from-green-100 to-teal-100', text: 'text-green-800', border: 'border-green-300' }
    case 7: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    case 6: return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 5: return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' }
    case 4: return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
    case 3: return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' }
    case 2: return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
    case 1: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
  }
}
