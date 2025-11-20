import { MatrixCell, CATEGORIES, VELOCITIES } from "@/lib/procurement-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatrixGridProps {
  data: Record<string, Record<string, MatrixCell>>;
  onCellClick: (category: string, velocity: string, cell: MatrixCell) => void;
}

export function MatrixGrid({ data, onCellClick }: MatrixGridProps) {
  return (
    <div className="glass-panel rounded-2xl p-6 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          Actionable Items Matrix
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Velocity vs. Category Analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-[180px_repeat(5,1fr)] gap-4 min-w-[800px]">
          {/* Header Row */}
          <div className="col-span-1" />
          {VELOCITIES.map(v => (
            <div key={v} className="text-xs font-mono uppercase tracking-wider text-muted-foreground text-center py-2">
              {v.replace(/-/g, ' ')}
            </div>
          ))}

          {/* Data Rows */}
          {CATEGORIES.map((category, i) => (
            <motion.div 
              key={category} 
              className="contents group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center text-sm font-medium text-gray-300 border-r border-white/5 pr-4">
                {category}
              </div>
              
              {VELOCITIES.map((velocity) => {
                const cell = data[category]?.[velocity];
                if (!cell) return <div key={velocity} />;

                return (
                  <motion.button
                    key={velocity}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCellClick(category, velocity, cell)}
                    className="relative h-16 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-1 group/cell"
                  >
                    <div className={cn(
                      "h-3 w-3 rounded-full shadow-[0_0_10px_currentColor]",
                      cell.status === 'normal' && "bg-green-500 text-green-500",
                      cell.status === 'warning' && "bg-yellow-500 text-yellow-500 animate-pulse",
                      cell.status === 'critical' && "bg-red-500 text-red-500 animate-ping"
                    )} />
                    <span className="text-xs font-mono text-white/70">
                      {cell.efficiency}%
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
