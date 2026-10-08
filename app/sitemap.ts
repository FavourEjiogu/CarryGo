import type{MetadataRoute}from'next';

const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://carrygo-chi.vercel.app';

export default function sitemap():MetadataRoute.Sitemap{
 const base=origin.replace(/\/$/,'');
 return [
  {url:base+'/',changeFrequency:'weekly',priority:1},
  {url:base+'/login',changeFrequency:'monthly',priority:.8},
  {url:base+'/faq',changeFrequency:'monthly',priority:.7},
  {url:base+'/privacy',changeFrequency:'yearly',priority:.4},
  {url:base+'/terms',changeFrequency:'yearly',priority:.4},
  {url:base+'/merchants',changeFrequency:'weekly',priority:.6},
 ];
}
