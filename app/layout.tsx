import type{Metadata,Viewport}from'next';
import'./globals.css';import'./polish.css';
import{ServiceWorkerRegistration}from'@/src/components/ServiceWorkerRegistration';import{ToastProvider}from'@/src/components/ToastProvider';import{PrivacyConsent}from'@/src/components/PrivacyConsent';import{AnalyticsBootstrap}from'@/src/components/AnalyticsBootstrap';import{InstallPrompt}from'@/src/components/InstallPrompt';
export const metadata:Metadata={
 title:'CarryGo — Get it done',
 description:'Campus execution network for Nigeria.',
 manifest:'/manifest.webmanifest',
 metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'),
 alternates:{canonical:'/'},
 icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'}]},
 appleWebApp:{capable:true,title:'CarryGo',statusBarStyle:'black-translucent'},
 other:{'mobile-web-app-capable':'yes','format-detection':'telephone=no'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0c',colorScheme:'light'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ToastProvider>{children}</ToastProvider><ServiceWorkerRegistration/><PrivacyConsent/><AnalyticsBootstrap/><InstallPrompt/></body></html>}
