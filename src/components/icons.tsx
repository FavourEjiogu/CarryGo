import type { SVGProps } from 'react';

export type IconName='home'|'plus'|'bolt'|'orders'|'user'|'wallet'|'bell'|'arrow'|'check'|'map'|'shield'|'chevron'|'logout'|'mail'|'clock'|'location'|'search'|'wifi';

const paths:Record<IconName,React.ReactNode>={
  home:<><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-6h6v6"/></>,
  plus:<><path d="M12 5v14M5 12h14"/></>,
  bolt:<><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></>,
  orders:<><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  user:<><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  wallet:<><path d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5Z"/><path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H19"/><path d="M16 13h4"/></>,
  bell:<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  arrow:<><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></>,
  check:<><path d="m5 12 4 4L19 6"/></>,
  map:<><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5Z"/><path d="M9 4v13.5M15 6.5V20"/></>,
  shield:<><path d="M12 3 19 6v5c0 4.6-2.9 7.1-7 9-4.1-1.9-7-4.4-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/></>,
  chevron:<path d="m8 10 4 4 4-4"/>,
  logout:<><path d="M10 5H5v14h5"/><path d="m14 8 4 4-4 4M18 12H9"/></>,
  mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  location:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  wifi:<><path d="M5 12.5a11 11 0 0 1 14 0"/><path d="M8 15.5a6.5 6.5 0 0 1 8 0"/><path d="M11 18.5a2 2 0 0 1 2 0"/><path d="M3 9a14 14 0 0 1 18 0"/></>,
};

export function Icon({name,size=18,strokeWidth=1.8,className}:{
  name:IconName; size?:number; strokeWidth?:number; className?:string;
}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}
