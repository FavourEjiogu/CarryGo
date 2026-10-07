import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'CarryGo — Get it done',description:'Campus execution marketplace for Bingham University, Karu.',manifest:'/manifest.webmanifest',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<script dangerouslySetInnerHTML={{__html:"if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}"}}/></body></html>}