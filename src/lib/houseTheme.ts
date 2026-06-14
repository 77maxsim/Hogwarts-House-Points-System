import type { HouseSlug } from '../types/db'

export interface HouseTheme {
  name: string
  primary: string
  accent: string
  secondary: string
  text: string
  textDim: string
  bg: string
  border: string
  glow: string
  glowStrong: string
  progressFrom: string
  progressTo: string
  gradient: string
  badgeBg: string
}

export const HOUSE_THEME: Record<HouseSlug, HouseTheme> = {
  gryffindor: {
    name: 'Gryffindor',
    primary: '#7f1d1d',
    accent: '#b91c1c',
    secondary: '#fbbf24',
    text: '#f87171',
    textDim: '#b45050',
    bg: 'rgba(127,29,29,0.14)',
    border: 'rgba(185,28,28,0.50)',
    glow: 'rgba(185,28,28,0.28)',
    glowStrong: 'rgba(185,28,28,0.50)',
    progressFrom: '#b91c1c',
    progressTo: '#fbbf24',
    gradient:
      'linear-gradient(160deg, rgba(185,28,28,0.22) 0%, rgba(127,29,29,0.12) 55%, rgba(10,8,3,0) 100%)',
    badgeBg: 'rgba(185,28,28,0.20)',
  },
  slytherin: {
    name: 'Slytherin',
    primary: '#14532d',
    accent: '#16a34a',
    secondary: '#e2e8f0',
    text: '#4ade80',
    textDim: '#3a9060',
    bg: 'rgba(20,83,45,0.14)',
    border: 'rgba(22,163,74,0.50)',
    glow: 'rgba(22,163,74,0.22)',
    glowStrong: 'rgba(22,163,74,0.45)',
    progressFrom: '#14532d',
    progressTo: '#4ade80',
    gradient:
      'linear-gradient(160deg, rgba(22,163,74,0.18) 0%, rgba(20,83,45,0.10) 55%, rgba(10,8,3,0) 100%)',
    badgeBg: 'rgba(22,163,74,0.18)',
  },
  ravenclaw: {
    name: 'Ravenclaw',
    primary: '#1e3a5f',
    accent: '#2563eb',
    secondary: '#d97706',
    text: '#93c5fd',
    textDim: '#5a85be',
    bg: 'rgba(30,58,95,0.14)',
    border: 'rgba(37,99,235,0.50)',
    glow: 'rgba(37,99,235,0.22)',
    glowStrong: 'rgba(37,99,235,0.45)',
    progressFrom: '#1e3a5f',
    progressTo: '#d97706',
    gradient:
      'linear-gradient(160deg, rgba(37,99,235,0.18) 0%, rgba(30,58,95,0.10) 55%, rgba(10,8,3,0) 100%)',
    badgeBg: 'rgba(37,99,235,0.18)',
  },
  hufflepuff: {
    name: 'Hufflepuff',
    primary: '#713f12',
    accent: '#b45309',
    secondary: '#fcd34d',
    text: '#fcd34d',
    textDim: '#a07520',
    bg: 'rgba(113,63,18,0.14)',
    border: 'rgba(180,83,9,0.50)',
    glow: 'rgba(180,83,9,0.22)',
    glowStrong: 'rgba(180,83,9,0.45)',
    progressFrom: '#713f12',
    progressTo: '#fcd34d',
    gradient:
      'linear-gradient(160deg, rgba(180,83,9,0.18) 0%, rgba(113,63,18,0.10) 55%, rgba(10,8,3,0) 100%)',
    badgeBg: 'rgba(180,83,9,0.18)',
  },
}

export function getHouseTheme(slug: string): HouseTheme {
  return HOUSE_THEME[slug as HouseSlug] ?? HOUSE_THEME.gryffindor
}
