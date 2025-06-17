export const LINK_SHARE_TYPES = {
  UNKNOWN: 0,
  WITHOUT_PASSWORD: 1,
  WITH_PASSWORD: 2,
} as const

export type LinkShareType = typeof LINK_SHARE_TYPES[keyof typeof LINK_SHARE_TYPES]
