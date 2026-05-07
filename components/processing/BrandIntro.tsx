'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

interface BrandIntroProps {
  onComplete?: () => void
  duration?: number
  message?: string
  showProgress?: boolean
}

export function BrandIntro({
  onComplete,
  duration = 5200,
  message,
  showProgress = true,
}: BrandIntroProps) {
  const [exiting, setExiting] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setExiting(true), duration)
    const doneTimer = window.setTimeout(() => {
      setHidden(true)
      onComplete?.()
    }, duration + 800)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [duration, onComplete])

  if (hidden) return null

  return (
    <div
      className={`aj-intro ${exiting ? 'aj-intro--exit' : ''}`}
      role="status"
      aria-label="A carregar AssinaJá"
    >
      <div className="aj-bg" aria-hidden="true">
        <div className="aj-orb aj-orb--1" />
        <div className="aj-orb aj-orb--2" />
        <div className="aj-orb aj-orb--3" />
        <div className="aj-grain" />
      </div>

      <svg
        className="aj-trails"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ajGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0033FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#0033FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#977DFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ajGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#977DFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#977DFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00033D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ajGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0033FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#977DFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#0033FF" stopOpacity="0" />
          </linearGradient>
          <filter id="ajBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="aj-stroke aj-stroke--1"
          d="M -50 520 C 200 360, 420 680, 640 460 S 1080 280, 1280 420"
          stroke="url(#ajGrad1)"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="url(#ajBloom)"
        />
        <path
          className="aj-stroke aj-stroke--2"
          d="M -50 380 C 240 540, 460 240, 700 420 S 1060 600, 1280 360"
          stroke="url(#ajGrad2)"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#ajBloom)"
        />
        <path
          className="aj-stroke aj-stroke--3"
          d="M -50 600 C 280 460, 500 720, 760 540 S 1100 380, 1280 500"
          stroke="url(#ajGrad3)"
          fill="none"
          strokeWidth="1.4"
          strokeLinecap="round"
          filter="url(#ajBloom)"
        />
      </svg>

      <div className="aj-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="aj-particle"
            style={{ ['--i' as string]: i } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="aj-stage">
        <div className="aj-halo" aria-hidden="true" />
        <div className="aj-glass" aria-hidden="true" />

        <div className="aj-logo-wrap">
          {Array.from({ length: 7 }).map((_, i) => (
            <Image
              key={i}
              src="/brand/assinaja-logo.png"
              alt=""
              aria-hidden="true"
              className="aj-shard"
              style={{ ['--i' as string]: i } as React.CSSProperties}
              width={220}
              height={220}
              priority
              draggable={false}
            />
          ))}

          <Image
            src="/brand/assinaja-logo.png"
            alt="AssinaJá"
            className="aj-logo"
            width={220}
            height={220}
            priority
            draggable={false}
          />
        </div>

        <div className="aj-tagline">
          <span>Assinaturas digitais</span>
          <i />
          <span>com confiança</span>
        </div>

        {message ? <p className="aj-message">{message}</p> : null}

        {showProgress ? (
          <div className="aj-progress" aria-hidden="true">
            <div className="aj-progress__bar" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BrandIntro
