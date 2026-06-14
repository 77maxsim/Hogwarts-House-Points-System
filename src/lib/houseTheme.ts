import type { HouseSlug } from '../types/db'

export interface HouseTheme {
  name: string
  primary: string
  secondary: string
  accent: string
  glow: string
  text: string
  textDim: string
  bg: string
  border: string
  glowStrong: string
  progressFrom: string
  progressTo: string
  gradient: string
  badgeBg: string
}

export const HOUSE_THEME: Record<HouseSlug, HouseTheme> = {
  gryffindor: {
    name: 'Gryffindor',
    primary: '#7F1D1D',
    secondary: '#DC2626',
    accent: '#FBBF24',
    glow: 'rgba(220,38,38,0.45)',
    text: '#FCA5A5',
    textDim: '#9B2C2C',
    bg: 'rgba(127,29,29,0.55)',
    border: 'rgba(220,38,38,0.65)',
    glowStrong: 'rgba(220,38,38,0.75)',
    progressFrom: '#7F1D1D',
    progressTo: '#FBBF24',
    gradient: 'linear-gradient(145deg, #3A0909 0%, #5A1212 35%, #380707 65%, #170202 100%)',
    badgeBg: 'rgba(220,38,38,0.18)',
  },
  slytherin: {
    name: 'Slytherin',
    primary: '#064E3B',
    secondary: '#059669',
    accent: '#C0C7C4',
    glow: 'rgba(5,150,105,0.45)',
    text: '#6EE7B7',
    textDim: '#065F46',
    bg: 'rgba(6,78,59,0.55)',
    border: 'rgba(5,150,105,0.65)',
    glowStrong: 'rgba(5,150,105,0.75)',
    progressFrom: '#064E3B',
    progressTo: '#C0C7C4',
    gradient: 'linear-gradient(145deg, #031A0F 0%, #085A32 35%, #062818 65%, #020D08 100%)',
    badgeBg: 'rgba(5,150,105,0.18)',
  },
  ravenclaw: {
    name: 'Ravenclaw',
    primary: '#172554',
    secondary: '#2563EB',
    accent: '#CD7F32',
    glow: 'rgba(37,99,235,0.45)',
    text: '#BFDBFE',
    textDim: '#1E40AF',
    bg: 'rgba(23,37,84,0.55)',
    border: 'rgba(37,99,235,0.65)',
    glowStrong: 'rgba(37,99,235,0.75)',
    progressFrom: '#172554',
    progressTo: '#CD7F32',
    gradient: 'linear-gradient(145deg, #060C22 0%, #0D1E50 35%, #091438 65%, #030716 100%)',
    badgeBg: 'rgba(37,99,235,0.18)',
  },
  hufflepuff: {
    name: 'Hufflepuff',
    primary: '#713F12',
    secondary: '#D97706',
    accent: '#FDE68A',
    glow: 'rgba(217,119,6,0.45)',
    text: '#FDE68A',
    textDim: '#92400E',
    bg: 'rgba(113,63,18,0.55)',
    border: 'rgba(217,119,6,0.65)',
    glowStrong: 'rgba(217,119,6,0.75)',
    progressFrom: '#713F12',
    progressTo: '#FDE68A',
    gradient: 'linear-gradient(145deg, #1C0E04 0%, #3E2208 35%, #221304 65%, #0D0703 100%)',
    badgeBg: 'rgba(217,119,6,0.18)',
  },
}

export function getHouseTheme(slug: string): HouseTheme {
  return HOUSE_THEME[slug as HouseSlug] ?? HOUSE_THEME.gryffindor
}
