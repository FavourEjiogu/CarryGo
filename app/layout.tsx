import{Manrope,Space_Grotesk}from'next/font/google';

const manrope=Manrope({subsets:['latin'],variable:'--font-body',display:'swap'});
const space=Space_Grotesk({subsets:['latin'],variable:'--font-display',display:'swap'});
import type{Metadata,Viewport}from'next';
import'./globals.css';import'./polish.css';
import{ServiceWorkerRegistration}from'@/src/components/ServiceWorkerRegistration';import{PWAExperience}from'@/src/components/PWAExperience';import{ToastProvider}from'@/src/components/ToastProvider';
export const metadata:Metadata={
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://carrygo-chi.vercel.app'),
  referrer:'strict-origin-when-cross-origin',
  appleWebApp:{capable:true,title:'CarryGo',statusBarStyle:'black-translucent'},
title:'CarryGo — Get it done',description:'Campus execution network for Nigeria.',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0c',colorScheme:'light'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={manrope.variable+" "+space.variable}><body><ToastProvider>{children}</ToastProvider><ServiceWorkerRegistration/><PWAExperience/></body></html>}
