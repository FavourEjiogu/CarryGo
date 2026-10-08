import type{MetadataRoute}from'next';

const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://carrygo-chi.vercel.app';

export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:'*',allow:['/','/faq','/privacy','/terms','/merchants'],disallow:['/api/','/auth/','/do','/earn','/orders','/you','/wallet','/profile','/security','/mfa','/notifications','/reset-password']},sitemap:origin.replace(/\/$/,'')+'/sitemap.xml'};
}
