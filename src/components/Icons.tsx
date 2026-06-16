import type { ReactNode, SVGProps } from 'react'

function createIcon(pathData: ReactNode) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        {pathData}
      </svg>
    )
  }
}

export const ScissorsIcon = createIcon(
  <>
    <circle cx="6" cy="7" r="3" />
    <circle cx="6" cy="17" r="3" />
    <path d="M8.5 8.5 19 3" />
    <path d="M8.5 15.5 19 21" />
    <path d="m10 12 10 0" />
  </>,
)

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </>,
)

export const UsersIcon = createIcon(
  <>
    <path d="M16 20a4 4 0 0 0-8 0" />
    <circle cx="12" cy="8" r="4" />
    <path d="M21 20a4 4 0 0 0-3-3.87" />
    <path d="M18 4.5a4 4 0 0 1 0 7.8" />
  </>,
)

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </>,
)

export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </>,
)

export const HomeIcon = createIcon(
  <>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10.5V20h14v-9.5" />
  </>,
)

export const LogoutIcon = createIcon(
  <>
    <path d="M10 17 15 12 10 7" />
    <path d="M15 12H3" />
    <path d="M13 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
  </>,
)

export const MapPinIcon = createIcon(
  <>
    <path d="M12 21s6-5.25 6-11a6 6 0 1 0-12 0c0 5.75 6 11 6 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
)

export const PhoneIcon = createIcon(
  <>
    <path d="M6.5 4.5c1 4 6 9 10 10l2-2a1.8 1.8 0 0 1 2 0l2 1.2a2 2 0 0 1 .8 2.2c-.7 2.3-3 3.8-5.4 3.3C11.5 18 6 12.5 4.8 5.9c-.5-2.4 1-4.7 3.3-5.4a2 2 0 0 1 2.2.8L11.5 3a1.8 1.8 0 0 1 0 2l-2 2" />
  </>,
)

export const MailIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>,
)

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </>,
)

export const StarIcon = createIcon(
  <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9L6.6 20l1-6L3.3 9.4l6-.9L12 3Z" />,
)

export const StoreIcon = createIcon(
  <>
    <path d="M4 10h16v10H4z" />
    <path d="M3 10 5 4h14l2 6" />
    <path d="M9 14h6v6H9z" />
  </>,
)

export const SettingsIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="m19.4 15 1.1 1.9-1.8 3-2.2-.6a7.9 7.9 0 0 1-1.7 1l-.4 2.2h-3.5l-.4-2.2a7.9 7.9 0 0 1-1.7-1l-2.2.6-1.8-3L4.6 15a8.6 8.6 0 0 1 0-2l-1.8-1.1 1.8-3 2.2.6a7.9 7.9 0 0 1 1.7-1l.4 2.2h3.5l.4 2.2a7.9 7.9 0 0 1 1.7 1l2.2-.6 1.8 3-1.8 1.1a8.6 8.6 0 0 1 0 2Z" />
  </>,
)

export const ClipboardIcon = createIcon(
  <>
    <rect x="8" y="4" width="8" height="4" rx="1" />
    <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    <path d="M9 14h6M9 18h6M10 10h4" />
  </>,
)

export const ShieldIcon = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
)
