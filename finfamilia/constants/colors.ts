export const Colors = {
  bg: '#0A0E17',
  card: '#131927',
  cardHover: '#1A2235',
  border: '#1E2A3E',
  accent: '#00D4AA',
  accentDim: 'rgba(0,212,170,0.12)',
  accentGlow: 'rgba(0,212,170,0.3)',
  red: '#FF4D6A',
  redDim: 'rgba(255,77,106,0.12)',
  orange: '#FF9F43',
  orangeDim: 'rgba(255,159,67,0.12)',
  yellow: '#FFD93D',
  blue: '#4DA6FF',
  blueDim: 'rgba(77,166,255,0.12)',
  purple: '#A855F7',
  purpleDim: 'rgba(168,85,247,0.12)',
  text: '#F0F4F8',
  textSec: '#8899AA',
  textDim: '#4A5568',
} as const;

export type ColorKey = keyof typeof Colors;
