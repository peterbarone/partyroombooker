 'use client'
 import dynamic from 'next/dynamic'

 // Load Rive on the client only
 const RiveAnimation = dynamic(() => import('@/components/RiveAnimation'), { ssr: false })

 export default function GreetingScene() {
   return (
     <div className="w-full h-full relative flex items-start justify-center px-4 z-40 pt-40">
       {/* Logo */}
       <div className="flex justify-center">
         <img
           src="/assets/logo.png"
           alt="Company Logo"
           className="h-[72px] sm:h-24 md:h-28 w-auto drop-shadow"
         />
       </div>

       {/* Rive animation (update src to your actual .riv path under public/) */}
       <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="w-full max-w-[720px] aspect-[16/9]">
           <RiveAnimation src="/greeting/intro.riv" stateMachine="State Machine 1" className="w-full h-full" />
         </div>
       </div>
     </div>
   );
 }
