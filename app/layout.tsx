import type{Metadata,Viewport}from'next';
import{Manrope,Space_Grotesk}from'next/font/google';
import'./globals.css';import'./polish.css';
import{CookieConsent}from'@/src/components/CookieConsent';
import{ServiceWorkerRegistration}from'@/src/components/ServiceWorkerRegistration';
import{ToastProvider}from'@/src/components/ToastProvider';
const manrope=Manrope({subsets:['latin'],variable:'--font-body',display:'swap'});
const space=Space_Grotesk({subsets:['latin'],variable:'--font-display',display:'swap'});
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||'https://carrygo-chi.vercel.app';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'CarryGo — Get it done',template:'%s · CarryGo'},description:'A campus execution network for getting everyday things done and earning from the routes you already take.',manifest:'/manifest.webmanifest',icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'},{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/apple-touch-icon.png'},openGraph:{type:'website',locale:'en_NG',siteName:'CarryGo',title:'CarryGo — Get it done',description:'A campus execution network for getting everyday things done and earning from the routes you already take.',images:[{url:'/icon-512.png',width:512,height:512,alt:'CarryGo'}]},twitter:{card:'summary',title:'CarryGo — Get it done',description:'A campus execution network for getting everyday things done and earning from the routes you already take.',images:['/icon-512.png']},appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'CarryGo'},formatDetection:{telephone:false}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0c',colorScheme:'light'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-NG" className={manrope.variable+' '+space.variable}><body><ToastProvider>{children}<CookieConsent/><ServiceWorkerRegistration/></ToastProvider></body></html>}