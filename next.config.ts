import type { NextConfig } from 'next';

const securityHeaders=[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(self)'},
  {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
];

const nextConfig:NextConfig={
  reactStrictMode:true,
  poweredByHeader:false,
  compress:true,
  headers:async()=>[
    {source:'/(.*)',headers:securityHeaders},
    {source:'/sw.js',headers:[{key:'Cache-Control',value:'public,max-age=0,must-revalidate'}]},
  ],
};

export default nextConfig;
