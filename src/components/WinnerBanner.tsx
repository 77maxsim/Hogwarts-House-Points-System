import { motion } from 'framer-motion'
import type { WinnerBanner as WinnerBannerType } from '../types/db'
import HouseCrest from './HouseCrest'
import { getHouseTheme } from '../lib/houseTheme'
import type { HouseSlug } from '../types/db'

interface WinnerBannerProps {
  banner: WinnerBannerType
}

export default function WinnerBanner({ banner }: WinnerBannerProps) {
  if (!banner) return null

  const isFinal = banner.winner_status === 'final_winner'
  const isTie   = banner.winner_status === 'tie'
  const slug    = (banner.leading_house_slug ?? banner.leading_house_name?.toLowerCase()) as HouseSlug | null | undefined
  const theme   = slug ? getHouseTheme(slug) : null
  const houseName = banner.leading_house_name ?? ''

  const borderColor = theme ? theme.border : 'rgba(201,168,76,0.40)'
  const glowColor   = theme ? theme.glow   : 'rgba(201,168,76,0.14)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="relative overflow-hidden rounded-xl mb-6"
      style={{
        background: theme
          ? `linear-gradient(135deg, ${theme.bg} 0%, rgba(10,7,2,0.97) 65%)`
          : 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(10,7,2,0.97) 65%)',
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor}50, 0 10px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: theme
            ? `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.secondary}, ${theme.accent}, transparent)`
            : 'linear-gradient(90deg, transparent, #c9a84c, #fde68a, #c9a84c, transparent)',
        }}
      />

      {/* Candle-glow radial behind crest */}
      <div
        className="absolute top-0 left-0 w-48 h-full pointer-events-none"
        style={{
          background: theme
            ? `radial-gradient(ellipse at 20% 50%, ${theme.glow}, transparent 65%)`
            : 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.12), transparent 65%)',
        }}
      />

      <div className="relative flex items-center gap-6 px-6 py-5">
        {/* Crest — large ceremonial display */}
        {slug && !isTie ? (
          <div
            className="shrink-0 rounded-2xl p-2.5"
            style={{
              background: 'rgba(0,0,0,0.40)',
              border: `1px solid ${theme?.border}`,
              boxShadow: `0 0 32px ${glowColor}, 0 0 64px ${glowColor}60`,
            }}
          >
            <HouseCrest house={slug} size={80} />
          </div>
        ) : (
          <div className="shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              {isFinal ? (
                <path d="M26 4 L32 18 L48 20 L37 31 L39 46 L26 40 L13 46 L15 31 L4 20 L20 18 Z"
                  fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" />
              ) : (
                <>
                  <circle cx="26" cy="26" r="18" fill="none" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="18" y1="26" x2="34" y2="26" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="26" y1="18" x2="26" y2="34" stroke="#c9a84c" strokeWidth="2" />
                </>
              )}
            </svg>
          </div>
        )}

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <p
            className="section-label mb-1.5"
            style={{ color: theme ? theme.textDim : '#7a6535' }}
          >
            {isFinal
              ? 'House Cup Winner · 2025–2026'
              : isTie
              ? 'Current Standings'
              : 'Current Leader'}
          </p>

          {isTie ? (
            <p className="font-display text-2xl md:text-3xl text-ink font-semibold">
              All Houses Tied
            </p>
          ) : (
            <p
              className="font-display text-2xl md:text-3xl font-semibold leading-tight"
              style={{ color: theme ? theme.text : '#c9a84c' }}
            >
              {isFinal ? houseName : `Prepared to win: ${houseName}`}
            </p>
          )}

          {isFinal && (
            <p className="text-xs font-mono mt-1.5" style={{ color: theme ? theme.textDim : '#7a6535' }}>
              End-of-year House Cup awarded
            </p>
          )}

          {!isFinal && !isTie && theme && (
            <div
              className="mt-2 h-0.5 rounded-full w-16"
              style={{ background: `linear-gradient(90deg, ${theme.secondary}, transparent)` }}
            />
          )}
        </div>

        {/* Point lead badge */}
        {banner.point_lead && banner.point_lead > 0 && !isTie && (
          <div
            className="text-right shrink-0 rounded-xl px-4 py-3"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${borderColor}`,
              boxShadow: `inset 0 1px 0 ${theme?.secondary ?? '#c9a84c'}18`,
            }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-0.5" style={{ color: theme ? theme.textDim : '#7a6535' }}>Lead</p>
            <p
              className="font-mono text-2xl font-semibold leading-none"
              style={{ color: theme ? theme.secondary : '#c9a84c' }}
            >
              +{banner.point_lead}
            </p>
            <p className="text-xs font-mono mt-0.5" style={{ color: theme ? theme.textDim : '#6b5b3e' }}>points</p>
          </div>
        )}
      </div>

      {/* Bottom shimmer */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          background: theme
            ? `linear-gradient(90deg, transparent, ${theme.border}, transparent)`
            : 'linear-gradient(90deg, transparent, rgba(201,168,76,0.28), transparent)',
        }}
      />
    </motion.div>
  )
}
