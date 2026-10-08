import type{MetadataRoute}from'next';
const site=(process.env.NEXT_PUBLIC_SITE_URL||'https://carrygo-chi.vercel.app').replace(/\/$/,'');
export default function sitemap():MetadataRoute.Sitemap{return['/','/campus','/faq','/merchants','/testimonials','/privacy','/terms'].map(path=>({url:site+path,changeFrequency:'weekly' as const,priority:path==='/'?1:.6}))}