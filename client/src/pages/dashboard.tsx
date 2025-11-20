import { useState, useEffect } from "react";
import { TunnelAnimation } from "@/components/dashboard/tunnel-animation";
import { MatrixGrid } from "@/components/dashboard/matrix-grid";
import { ProblemSection } from "@/components/dashboard/problem-section";
import { generateSyntheticData, DashboardData, MatrixCell } from "@/lib/procurement-data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Play, Activity, TrendingUp, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [data, setData] = useState<DashboardData>(generateSyntheticData('monthly'));
  const [selectedCell, setSelectedCell] = useState<{category: string, velocity: string, cell: MatrixCell} | null>(null);

  useEffect(() => {
    setData(generateSyntheticData(filter));
  }, [filter]);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setHasData(true);
      setIsAnalyzing(false); 
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold">
              PI
            </div>
            <h1 className="text-lg font-display font-bold text-white tracking-wide">
              Procurement<span className="text-primary">Intelligence</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasData && (
              <Button 
                onClick={handleStartAnalysis} 
                disabled={isAnalyzing}
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
            )}
            {hasData && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Data Source:</span>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">raw_procurement_data.csv</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Top Section: Tunnel & Controls */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl text-white font-medium">Data Ingestion Pipeline</h2>
             {hasData && (
               <Tabs defaultValue="monthly" onValueChange={(v) => setFilter(v as any)} className="w-[400px]">
                 <TabsList className="grid w-full grid-cols-4 bg-white/5">
                   <TabsTrigger value="daily">Daily</TabsTrigger>
                   <TabsTrigger value="weekly">Weekly</TabsTrigger>
                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
                 </TabsList>
               </Tabs>
             )}
          </div>
          
          <TunnelAnimation isActive={isAnalyzing || hasData} />
        </section>

        <AnimatePresence>
          {hasData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                    <AlertTriangleIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.outliers}</div>
                    <div className="text-xs text-muted-foreground">Outliers Detected</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.normal}</div>
                    <div className="text-xs text-muted-foreground">Normal Operations</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
                    <ClockIcon />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.outputs.delayed}</div>
                    <div className="text-xs text-muted-foreground">Delayed Payments</div>
                  </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{data.healthScore}/100</div>
                    <div className="text-xs text-muted-foreground">Procurement Health</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Matrix */}
                <div className="lg:col-span-2">
                  <MatrixGrid 
                    data={data.matrix} 
                    onCellClick={(c, v, cell) => setSelectedCell({category: c, velocity: v, cell})} 
                  />
                </div>

                {/* Right: Problems */}
                <div className="lg:col-span-1">
                   <ProblemSection data={data} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasData && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Upload className="h-12 w-12 mb-4 opacity-50" />
            <p>Upload raw procurement data to begin analysis</p>
            <p className="text-xs opacity-50 mt-2">Supported formats: CSV, Excel, JSON</p>
          </div>
        )}
      </main>

      {/* Details Drawer */}
      <Sheet open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <SheetContent className="bg-[#0f0f23] border-l border-white/10 text-white w-[400px] sm:w-[540px]">
          {selectedCell && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-display text-primary">
                  {selectedCell.category}
                </SheetTitle>
                <SheetDescription className="text-gray-400">
                  Velocity: <span className="text-white font-mono uppercase">{selectedCell.velocity}</span>
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                    <div className={cn(
                      "text-2xl font-bold",
                      selectedCell.cell.efficiency < 80 ? "text-orange-400" : "text-green-400"
                    )}>
                      {selectedCell.cell.efficiency}%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                     <div className="text-xs text-muted-foreground mb-1">Status</div>
                     <div className="text-lg font-medium capitalize text-white">
                       {selectedCell.cell.status}
                     </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-4">Top Products Impacted</h3>
                  <div className="space-y-3">
                    {selectedCell.cell.products.map((prod, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
                        <div>
                          <div className="text-sm font-medium text-white">{prod.name}</div>
                          <div className="text-xs text-gray-500">Cycle: {prod.purchaseCycle}</div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm font-mono text-primary">Qty: {prod.quantity}</div>
                           <div className="text-xs text-red-400">Waste: {prod.wastage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                   <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                     <Activity className="h-4 w-4" /> Recommended Action
                   </h4>
                   <p className="text-xs text-blue-200/80 leading-relaxed">
                     High wastage detected in this category. Consider implementing 
                     <strong> GRN Automation</strong> to verify quality at entry and 
                     <strong> 3-Way Matching</strong> to ensure invoice accuracy.
                   </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Icons
function AlertTriangleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
}
function CheckCircleIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}
function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
