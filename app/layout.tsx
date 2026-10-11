import type {Metadata,Viewport} from 'next';
import './globals.css';
import './polish.css';
import './launch-polish.css';
import {ServiceWorkerRegistration} from '@/src/components/ServiceWorkerRegistration';
import {ToastProvider} from '@/src/components/ToastProvider';
import {CookieConsent} from '@/src/components/CookieConsent';

export const metadata:Metadata={
  title:'CarryGo — Get it done',
  description:'Campus execution network for Nigeria.',
  manifest:'/manifest.webmanifest',
  icons:{icon:'/icon.svg'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0c',colorScheme:'light'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><ToastProvider>{children}</ToastProvider><CookieConsent/><ServiceWorkerRegistration/></body></html>
}
