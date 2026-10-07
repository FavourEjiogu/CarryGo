'use client';

import { motion } from 'motion/react';

export function MotionPage({children,className=''}:{children:React.ReactNode;className?:string}) {
  return <motion.div
    className={className}
    initial={{opacity:0,y:10}}
    animate={{opacity:1,y:0}}
    transition={{duration:.28,ease:[.22,1,.36,1]}}
  >{children}</motion.div>;
}

export function MotionButton({children,className='',disabled=false,onClick,type='button'}:{
  children:React.ReactNode;className?:string;disabled?:boolean;onClick?:()=>void;type?:'button'|'submit';
}) {
  return <motion.button type={type} className={className} disabled={disabled} onClick={onClick}
    whileTap={disabled?undefined:{scale:.985}}
    transition={{duration:.08}}
  >{children}</motion.button>;
}
