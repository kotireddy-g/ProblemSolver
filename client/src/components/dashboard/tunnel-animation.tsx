import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function TunnelAnimation({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setParticles(prev => [...prev.slice(-20), Date.now()]);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className={cn(
      "relative h-[320px] w-full overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-[#0f0f23] to-[#080814] transition-all duration-500",
      isActive && "shadow-[0_0_50px_-12px_rgba(100,255,218,0.2)]"
    )}>
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="flex h-full items-center justify-between px-12 relative z-10 perspective-[2000px]">
        
        {/* Input Stage */}
        <div className="relative z-20 flex flex-col items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-display font-bold text-primary tracking-widest uppercase"
          >
            Raw Data
          </motion.div>
          <div className="h-40 w-40 rounded-xl border border-primary/30 bg-black/40 backdrop-blur-md flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-primary animate-particle-input"
                    style={{ 
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${Math.random() * 2}s` 
                    }}
                  />
                ))}
              </div>
            )}
            <span className="font-mono text-xs text-muted-foreground">Input Stream</span>
          </div>
        </div>

        {/* The Tunnel */}
        <div className="flex-1 h-full flex items-center justify-center relative mx-8">
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Processing Nodes */}
          <div className="flex gap-12 z-10">
            {['Collect', 'Curate', 'Analyze'].map((stage, i) => (
              <motion.div
                key={stage}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.5 }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="h-12 w-12 rounded-full bg-black border border-secondary/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,188,212,0.3)]">
                  <div className={cn("h-3 w-3 rounded-full bg-secondary transition-all duration-500", isActive && "animate-pulse")} />
                </div>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-mono text-secondary/80 uppercase tracking-wider">
                  {stage}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Tunnel Particles */}
          {isActive && particles.map((id) => (
            <motion.div
              key={id}
              initial={{ x: -200, opacity: 0, scale: 0.5 }}
              animate={{ x: 200, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "linear" }}
              onAnimationComplete={() => setParticles(prev => prev.filter(p => p !== id))}
              className="absolute h-1 w-8 rounded-full bg-gradient-to-r from-primary to-transparent blur-[1px]"
              style={{ top: `${40 + Math.random() * 20}%` }}
            />
          ))}
        </div>

        {/* Output Stage */}
        <div className="relative z-20 flex flex-col items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-display font-bold text-green-400 tracking-widest uppercase"
          >
            Intelligence
          </motion.div>
          <div className="h-40 w-40 rounded-xl border border-green-500/30 bg-black/40 backdrop-blur-md flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-green-500/5" />
             {isActive && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-green-400 animate-particle-output"
                    style={{ 
                      top: `${30 + Math.random() * 40}%`,
                      left: '20%',
                      animationDelay: `${Math.random() * 1.5}s` 
                    }}
                  />
                ))}
              </div>
            )}
            <span className="font-mono text-xs text-muted-foreground">Structured Data</span>
          </div>
        </div>

      </div>
    </div>
  );
}
