"use client";

import type { ReactElement, ReactNode } from "react";
import type { NetworkId } from "@/types/olar";

type LogoProps = { size?: number; className?: string; title?: string };

function Box({
  size = 28,
  className = "",
  title,
  children,
}: LogoProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function InstagramLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Instagram"}>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#ig-grad)" />
      <rect
        x="14"
        y="14"
        width="20"
        height="20"
        rx="6"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle cx="24" cy="24" r="5.5" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="32.5" cy="15.5" r="2" fill="#fff" />
    </Box>
  );
}

export function FacebookLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Facebook"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#1877F2" />
      <path
        fill="#fff"
        d="M27.5 38V26.2h4l.6-4.6h-4.6v-2.9c0-1.3.4-2.2 2.3-2.2H32.5V12.1c-.4-.1-1.9-.2-3.6-.2-3.6 0-6 2.1-6 6.1v3.4H18v4.6h4.9V38h4.6z"
      />
    </Box>
  );
}

export function TikTokLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "TikTok"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#010101" />
      <path
        fill="#25F4EE"
        d="M30.2 12.5c.9 2.6 2.8 4.6 5.3 5.4v3.6c-1.9-.1-3.7-.7-5.3-1.7v8.7c0 5-4.1 9-9.1 9-1.7 0-3.3-.5-4.7-1.3 1.5 2.1 4 3.5 6.8 3.5 4.7 0 8.5-3.8 8.5-8.5V12.5h-1.5z"
        opacity="0.9"
        transform="translate(1.2,0.8)"
      />
      <path
        fill="#FE2C55"
        d="M30.2 12.5c.9 2.6 2.8 4.6 5.3 5.4v3.6c-1.9-.1-3.7-.7-5.3-1.7v8.7c0 5-4.1 9-9.1 9-1.7 0-3.3-.5-4.7-1.3 1.5 2.1 4 3.5 6.8 3.5 4.7 0 8.5-3.8 8.5-8.5V12.5h-1.5z"
        opacity="0.9"
        transform="translate(-1.2,-0.8)"
      />
      <path
        fill="#fff"
        d="M30.2 12.5c.9 2.6 2.8 4.6 5.3 5.4v3.6c-1.9-.1-3.7-.7-5.3-1.7v8.7c0 5-4.1 9-9.1 9s-9.1-4-9.1-9 4.1-9 9.1-9c.5 0 1 .1 1.5.2v3.8c-.5-.2-1-.3-1.5-.3-2.9 0-5.2 2.3-5.2 5.3s2.3 5.3 5.2 5.3 5.2-2.3 5.2-5.3V12.5h-1.1z"
      />
    </Box>
  );
}

export function YouTubeLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "YouTube"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#FF0000" />
      <path fill="#fff" d="M20 16.5v15l13-7.5-13-7.5z" />
    </Box>
  );
}

export function WhatsAppLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "WhatsApp"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#25D366" />
      <path
        fill="#fff"
        d="M24 12.5c-6.2 0-11.2 4.9-11.2 11 0 1.9.5 3.8 1.5 5.4L13 35.5l6.8-1.8c1.5.8 3.3 1.3 5.1 1.3 6.2 0 11.2-4.9 11.2-11S30.2 12.5 24 12.5zm0 20.1c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-4 1.1 1.1-3.9-.2-.3c-1-1.5-1.5-3.2-1.5-4.9 0-5.1 4.2-9.2 9.4-9.2s9.4 4.1 9.4 9.2-4.1 9.4-9.3 9.4zm5.1-6.9c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1 0-.3-.1-.6-.2z"
      />
    </Box>
  );
}

export function LinkedInLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "LinkedIn"}>
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#0A66C2" />
      <circle cx="16.5" cy="17" r="2.8" fill="#fff" />
      <rect x="14.2" y="21.2" width="4.6" height="12.5" fill="#fff" />
      <path
        fill="#fff"
        d="M23 21.2h4.4v1.7c.6-1.1 2.1-2.1 4.3-2.1 4.6 0 5.5 3 5.5 6.9v6h-4.6v-5.3c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.4H23V21.2z"
      />
    </Box>
  );
}

export function XLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "X"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#000" />
      <path
        fill="#fff"
        d="M28.8 13h3.2l-7 8 8.2 11H26.5l-5.1-6.7L15 32H11.8l7.5-8.6L11.5 13h6.8l4.6 6.1L28.8 13zm-1.1 17.1h1.8L18.4 14.8h-1.9l11.2 15.3z"
      />
    </Box>
  );
}

export function PinterestLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Pinterest"}>
      <rect x="4" y="4" width="40" height="40" rx="24" fill="#E60023" />
      <path
        fill="#fff"
        d="M24 12.5c-6.3 0-11.4 5-11.4 11.2 0 4.6 2.8 8.6 6.8 10.3-.1-.9-.2-2.2 0-3.2.2-.9 1.5-6.2 1.5-6.2s-.4-.7-.4-1.8c0-1.7 1-2.9 2.2-2.9 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.8-2.3 3.8-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.4 2.5-5.4 5.2 0 1 .4 2.1.9 2.7.1.1.1.2.1.3l-.3 1.4c0 .2-.2.2-.4.1-1.5-.7-2.4-2.8-2.4-4.5 0-3.7 2.7-7.1 7.7-7.1 4.1 0 7.2 2.9 7.2 6.8 0 4.1-2.6 7.3-6.1 7.3-1.2 0-2.3-.6-2.7-1.4l-.7 2.8c-.3 1-1 2.2-1.5 3 .1 0 .2.1.3.1 1.1.3 2.3.5 3.5.5 6.3 0 11.4-5 11.4-11.2S30.3 12.5 24 12.5z"
      />
    </Box>
  );
}

export function ThreadsLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Threads"}>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#101010" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        d="M18 22c0-4 3-7 7.5-7 4 0 6.5 2.5 6.5 6.2 0 5.5-5.5 8.3-5.5 8.3s4.8-1.2 4.8-6.5c0-2.8-1.8-4.7-4.3-4.7-2.2 0-3.7 1.5-3.7 3.6 0 1.2.5 2.1 1.6 2.5"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        d="M21.5 25.5c1.2 3.5 4.2 5.5 7.8 5.5"
      />
    </Box>
  );
}

export function GoogleBusinessLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Google Business"}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#fff" stroke="#E8EAED" strokeWidth="2" />
      <path fill="#4285F4" d="M24.5 23.8v3.9h6.7c-.3 1.6-2.1 4.7-6.7 4.7-4 0-7.3-3.3-7.3-7.4s3.3-7.4 7.3-7.4c2.3 0 3.8 1 4.7 1.8l3.2-3.1C30.4 14.4 27.7 13 24.5 13c-6.1 0-11 4.9-11 11s4.9 11 11 11c6.3 0 10.5-4.5 10.5-10.7 0-.7-.1-1.3-.2-1.9H24.5z" />
      <path fill="#34A853" d="M13.5 28.2l3.2-2.4c.9 2.3 3 3.9 5.5 3.9 1.5 0 2.8-.5 3.7-1.3l3.3 2.6C27.3 33 25 34 24.5 34c-4.1 0-7.6-2.7-9-6.4-.5-1.1-.8-2.3-.8-3.6 0-.4 0-.7.1-1.1l-1.3 5.3z" opacity="0" />
      <circle cx="17" cy="34" r="2.2" fill="#EA4335" />
      <circle cx="24" cy="34" r="2.2" fill="#FBBC05" />
      <circle cx="31" cy="34" r="2.2" fill="#34A853" />
      <path fill="#4285F4" d="M16 18h16v2.5H16z" />
      <path fill="#34A853" d="M16 22h10v2.5H16z" />
    </Box>
  );
}

export function TelegramLogo(props: LogoProps) {
  return (
    <Box {...props} title={props.title ?? "Telegram"}>
      <rect x="4" y="4" width="40" height="40" rx="24" fill="#229ED9" />
      <path
        fill="#fff"
        d="M33.8 15.2 30.4 32c-.3 1.1-.9 1.4-1.9.9l-5.2-3.8-2.5 2.4c-.3.3-.5.5-1 .5l.4-5.3 9.7-8.7c.4-.4-.1-.6-.7-.2l-12 7.5-5.2-1.6c-1.1-.4-1.1-1.1.2-1.7l20.3-7.8c.9-.4 1.7.2 1.4 1.3z"
      />
    </Box>
  );
}

const MAP: Record<NetworkId, (p: LogoProps) => ReactElement> = {
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  tiktok: TikTokLogo,
  youtube: YouTubeLogo,
  whatsapp: WhatsAppLogo,
  linkedin: LinkedInLogo,
  x: XLogo,
  pinterest: PinterestLogo,
  threads: ThreadsLogo,
  google: GoogleBusinessLogo,
  telegram: TelegramLogo,
};

export function SocialLogo({
  network,
  size = 28,
  className = "",
}: {
  network: NetworkId;
  size?: number;
  className?: string;
}) {
  const Comp = MAP[network];
  return <Comp size={size} className={className} />;
}

/** Compact row of logos for the Networks blade summary in BladesDock */
export function SocialLogoRow({ size = 18 }: { size?: number }) {
  const ids: NetworkId[] = [
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "whatsapp",
    "linkedin",
  ];
  return (
    <div className="flex flex-wrap items-center gap-1">
      {ids.map((id) => (
        <SocialLogo key={id} network={id} size={size} />
      ))}
    </div>
  );
}
