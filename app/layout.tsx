import type{Metadata,Viewport}from'next';
import{Manrope,Space_Grotesk}from'next/font/google';
import'./globals.css';import'./polish.css';
import{ServiceWorkerRegistration}from'@/src/components/ServiceWorkerRegistration';import{ToastProvider}from'@/src/components/ToastProvider';
const manrope=Manrope({subsets:['latin'],variable:'--font-body',display:'swap'});
const space=Space_Grotesk({subsets:['latin'],variable:'--font-display',display:'swap'});
export const metadata:Metadata={title:'CarryGo — Get it done',description:'Campus execution network for Nigeria.',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0c',colorScheme:'light'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={manrope.variable+' '+space.variable}><body><ToastProvider>{children}</ToastProvider><ServiceWorkerRegistration/></body></html>}
