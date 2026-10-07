import type { NextConfig } from 'next';
const nextConfig:NextConfig={reactStrictMode:true,poweredByHeader:false,compress:true,headers:async()=>[{source:'/sw.js',headers:[{key:'Cache-Control',value:'public,max-age=0,must-revalidate'}]}]};
export default nextConfig;