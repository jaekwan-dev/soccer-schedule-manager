"use client"

import Image from 'next/image'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-pulse">
          <Image 
            src="/red_logo.jpg" 
            alt="뻥랩 로고" 
            width={500} 
            height={500} 
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  )
} 