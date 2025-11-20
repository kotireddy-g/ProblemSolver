import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Database, Layers, Lightbulb, Lock, Smartphone, Zap } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-display font-bold text-white tracking-wide">
              Solution<span className="text-primary">Roadmap</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium"
          >
            <Zap className="h-4 w-4" />
            <span>Strategic Execution Plan</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-white leading-tight"
          >
            Bridging the Gap: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              From Manual Chaos to AI Automation
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            We don't just "install software." We rebuild the trust infrastructure between you and your 500+ vendors. Here is exactly how we solve the 6 critical bottlenecks.
          </motion.p>
        </section>

        {/* Section 1: Where We Start (Data Foundation) */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Phase 1: The Data Foundation</h3>
              <p className="text-muted-foreground">Before automation, we must standardize the raw inputs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DataCard 
              title="Vendor Master Cleanup"
              description="Consolidate duplicate vendors, validate GSTINs, and tag MSME status for priority payments."
              points={["Deduplication", "GST Validation", "Payment Terms"]}
              delay={0.3}
            />
            <DataCard 
              title="Item Master Standardization"
              description="Map volatile SKUs (e.g., 'Tomatoes' vs 'Tomato Local') to a standard catalog to enable price tracking."
              points={["SKU Normalization", "Unit of Measure", "Category Tagging"]}
              delay={0.4}
            />
            <DataCard 
              title="Contract Digitization"
              description="Digitize rate contracts to enable automated 3-way matching against agreed prices."
              points={["Rate Cards", "Validity Periods", "Volume Discounts"]}
              delay={0.5}
            />
          </div>
        </section>

        {/* Section 2: The Solution Roadmap (Timeline) */}
        <section className="relative space-y-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Implementation Roadmap</h3>
              <p className="text-muted-foreground">A phased approach to solving the 6 bottlenecks.</p>
            </div>
          </div>

          {/* Connecting Line */}
          <div className="absolute left-[29px] top-[100px] bottom-0 w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

          <div className="space-y-12 relative">
            <RoadmapItem 
              number="01"
              title="The 'Edge' Capture"
              subtitle="Solving: GRN Creation & Invoice Receipt"
              icon={Smartphone}
              color="bg-purple-500"
              details="Deploy offline-first mobile apps for Kitchen (F&B) and Housekeeping. Staff takes photos of goods; AI auto-generates the GRN. No more manual entry."
            />
            
            <RoadmapItem 
              number="02"
              title="The 'Trust' Portal"
              subtitle="Solving: Payment Authorization & Exception Handling"
              icon={Lock}
              color="bg-amber-500"
              details="Launch Vendor Portal. Suppliers see real-time status: 'Invoice Received' -> 'Approved' -> 'Payment Scheduled'. Reduces 90% of phone calls."
            />

            <RoadmapItem 
              number="03"
              title="The 'Core' Automation"
              subtitle="Solving: 3-Way Matching & GST Validation"
              icon={CheckCircle2}
              color="bg-green-500"
              details="Activate AI Matching Engine. System automatically compares PO (Contract) vs. GRN (Received) vs. Invoice (Billed). Only exceptions go to humans."
            />

            <RoadmapItem 
              number="04"
              title="Predictive Intelligence"
              subtitle="Solving: Future Procurement"
              icon={Lightbulb}
              color="bg-blue-500"
              details="System starts predicting consumption patterns. 'You usually buy 50kg tomatoes on Fridays, but you have 20kg stock. Order 30kg?'"
            />
          </div>
        </section>

      </main>
    </div>
  );
}

function DataCard({ title, description, points, delay }: { title: string, description: string, points: string[], delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-panel p-6 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-2">
        {points.map((p, i) => (
          <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
            {p}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function RoadmapItem({ number, title, subtitle, details, icon: Icon, color, detailsColor = "text-gray-400" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-6 md:gap-10 relative"
    >
      <div className="relative z-10 shrink-0">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg", color)}>
          {number}
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-2xl flex-1 border-l-4 border-l-primary/50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-xl font-bold text-white">{title}</h4>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{subtitle}</span>
          </div>
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className={cn("mt-2 text-sm leading-relaxed", detailsColor)}>
          {details}
        </p>
      </div>
    </motion.div>
  );
}
