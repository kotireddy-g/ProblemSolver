import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Check, Scan, Zap, Brain, Server, Shield, Bot, FileText, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TechStackItem {
  name: string;
  type: "frontend" | "backend" | "ai" | "infra";
}

export interface PrototypeData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: TechStackItem[];
  features: string[];
}

interface PrototypeViewProps {
  data: PrototypeData;
  isOpen: boolean;
  onClose: () => void;
}

export function PrototypeView({ data, isOpen, onClose }: PrototypeViewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-[#0f0f23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left: Context & Tech */}
            <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-xl font-bold text-white">Solution Detail</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{data.title}</h3>
                  <p className="text-primary font-medium mb-4">{data.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{data.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.techStack.map((tech) => (
                      <span 
                        key={tech.name}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border font-mono",
                          tech.type === 'ai' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                          tech.type === 'frontend' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                          tech.type === 'backend' && "bg-green-500/10 text-green-400 border-green-500/20",
                          tech.type === 'infra' && "bg-orange-500/10 text-orange-400 border-orange-500/20",
                        )}
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Key Capabilities</h4>
                  <ul className="space-y-3">
                    {data.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Visual Prototype */}
            <div className="flex-1 bg-black/20 relative flex flex-col">
               <div className="absolute top-4 right-4 z-10 hidden md:block">
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                 {data.id === '01' && <EdgeCaptureMock />}
                 {data.id === '02' && <TrustPortalMock />}
                 {data.id === '03' && <CoreAutomationMock />}
                 {data.id === '04' && <PredictiveMock />}
              </div>
              
              <div className="p-4 border-t border-white/10 bg-white/5 text-center text-xs text-muted-foreground font-mono">
                INTERACTIVE PROTOTYPE PREVIEW
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* --- MOCK COMPONENTS --- */

function EdgeCaptureMock() {
  return (
    <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-4 border-gray-800 shadow-2xl overflow-hidden relative flex flex-col">
      {/* Status Bar */}
      <div className="h-8 bg-black flex justify-between items-center px-6 pt-2">
        <span className="text-[10px] text-white font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-white rounded-sm" />
          <div className="w-2 h-2 bg-white rounded-sm" />
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 bg-gray-900 relative">
        {/* Camera Viewfinder */}
        <div className="h-3/4 bg-gray-800 relative overflow-hidden">
           <img 
             src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=1000&auto=format&fit=crop" 
             alt="Vegetables" 
             className="w-full h-full object-cover opacity-80"
           />
           
           {/* AI Bounding Boxes */}
           <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary/80 rounded-lg bg-primary/10 flex items-start justify-between p-2">
             <span className="bg-primary text-black text-[10px] font-bold px-1 rounded">Tomato (Local)</span>
             <span className="bg-black/50 text-white text-[10px] px-1 rounded">98%</span>
           </div>
           
           <div className="absolute bottom-32 right-12 w-24 h-24 border-2 border-blue-400/80 rounded-lg bg-blue-400/10 flex items-start justify-between p-2">
             <span className="bg-blue-400 text-black text-[10px] font-bold px-1 rounded">Crate (Red)</span>
           </div>

           {/* Scanning Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
           <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-xs drop-shadow-md font-medium">
             <span>AI Mode: Enabled</span>
             <span>Offline</span>
           </div>
        </div>

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white rounded-t-2xl p-4 flex flex-col gap-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Incoming Delivery</h4>
              <p className="text-xs text-gray-500">Vendor: Fresh Farms Ltd.</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">PO #4921</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto py-2">
             <div className="shrink-0 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
               <div className="text-[10px] text-gray-500">Detected</div>
               <div className="font-bold text-gray-900">45kg Tomato</div>
             </div>
             <div className="shrink-0 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
               <div className="text-[10px] text-gray-500">Quality</div>
               <div className="font-bold text-green-600">Grade A</div>
             </div>
          </div>

          <Button className="w-full bg-primary text-black hover:bg-primary/90 font-bold">
            <Check className="mr-2 h-4 w-4" /> Generate GRN
          </Button>
        </div>
      </div>
    </div>
  );
}

function TrustPortalMock() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl">
      {/* Browser Header */}
      <div className="h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4 bg-white h-5 rounded border text-[10px] flex items-center px-2 text-gray-400">
          portal.procurement-intelligence.com/vendor
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Payment Dashboard</h3>
            <p className="text-sm text-gray-500">Welcome, Fresh Farms Ltd.</p>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-500">Next Payout</div>
             <div className="text-lg font-bold text-green-600">₹1,42,000</div>
             <div className="text-[10px] text-gray-400">Scheduled for: March 15</div>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Recent Invoice Status</h4>
          <div className="relative flex justify-between items-center px-4">
            {/* Connecting Line */}
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-100 -z-0" />
            
            {[
              { label: "Received", date: "Mar 10", active: true },
              { label: "GRN Matched", date: "Mar 11", active: true },
              { label: "Approved", date: "Mar 12", active: true },
              { label: "Paid", date: "Mar 15", active: false }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center z-10 bg-white px-2">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border-2 mb-2", step.active ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200")}>
                  {step.active && <Check className="h-3 w-3" />}
                </div>
                <span className="text-xs font-medium text-gray-900">{step.label}</span>
                <span className="text-[10px] text-gray-400">{step.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Notification Preview */}
        <div className="bg-[#e6ffda] p-3 rounded-lg border border-green-200 flex gap-3 max-w-sm ml-auto relative">
          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">WhatsApp</div>
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="text-xs text-gray-800">
            <p className="font-bold text-green-800 mb-1">Payment Alert</p>
            Your invoice #INV-2024-001 has been approved! Amount ₹45,000 will be credited to your account ending in 8821 tomorrow.
          </div>
        </div>
      </div>
    </div>
  );
}

function CoreAutomationMock() {
  return (
    <div className="w-full max-w-4xl h-[500px] bg-[#1e1e2e] rounded-lg border border-white/10 flex overflow-hidden shadow-2xl">
      {/* Left: Document Viewer */}
      <div className="w-1/2 bg-gray-800 p-4 border-r border-white/10 relative group">
         <div className="absolute inset-0 bg-black/20 pointer-events-none" />
         <img 
           src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop" 
           alt="Invoice" 
           className="w-full h-full object-cover opacity-60 grayscale"
         />
         {/* OCR Highlights */}
         <div className="absolute top-24 right-12 w-24 h-8 bg-yellow-500/20 border border-yellow-500/50" />
         <div className="absolute top-40 left-8 w-full max-w-[200px] h-32 bg-blue-500/10 border border-blue-500/30" />
         
         <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
           <Scan className="h-3 w-3 animate-spin" /> Scanning...
         </div>
      </div>

      {/* Right: Data Extraction */}
      <div className="w-1/2 p-6 bg-[#1e1e2e] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Auto-Extraction
          </h3>
          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
            Confidence: 98.5%
          </span>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Vendor</label>
            <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
              <span className="text-sm text-white">Tech Solutions Inc.</span>
              <Check className="h-3 w-3 text-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider">Invoice #</label>
              <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                <span className="text-sm text-white">INV-9921</span>
                <Check className="h-3 w-3 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] text-gray-400 uppercase tracking-wider">Date</label>
               <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                 <span className="text-sm text-white">20 Mar 2024</span>
                 <Check className="h-3 w-3 text-green-500" />
               </div>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] text-gray-400 uppercase tracking-wider">Line Items</label>
             <div className="bg-white/5 rounded border border-white/10 overflow-hidden">
               <div className="flex text-[10px] text-gray-400 p-2 border-b border-white/5">
                 <span className="w-8">#</span>
                 <span className="flex-1">Item</span>
                 <span className="w-16 text-right">Amount</span>
               </div>
               <div className="flex text-xs text-white p-2 border-b border-white/5 items-center">
                 <span className="w-8">1</span>
                 <span className="flex-1">Server Maintenance</span>
                 <span className="w-16 text-right">₹12,000</span>
               </div>
               <div className="flex text-xs text-white p-2 items-center">
                 <span className="w-8">2</span>
                 <span className="flex-1">Cloud Storage</span>
                 <span className="w-16 text-right">₹5,000</span>
               </div>
             </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
           <div className="flex justify-between items-center text-xs mb-2">
             <span className="text-gray-400">GST Validation</span>
             <span className="text-green-400 flex items-center gap-1"><Shield className="h-3 w-3" /> Validated</span>
           </div>
           <div className="flex justify-between items-center text-xs">
             <span className="text-gray-400">3-Way Match</span>
             <span className="text-green-400 flex items-center gap-1"><Check className="h-3 w-3" /> Matched with PO #881</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function PredictiveMock() {
  return (
    <div className="w-full max-w-3xl bg-[#0f0f23] border border-white/10 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" /> Consumption Forecast
          </h3>
          <p className="text-sm text-gray-400">Category: Fresh Produce (Tomatoes)</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300">Weekly</span>
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded border border-primary/30">Monthly</span>
        </div>
      </div>

      {/* Chart Area Mock */}
      <div className="h-64 w-full relative mb-6 border-b border-white/5">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
           {[...Array(5)].map((_, i) => <div key={i} className="h-px w-full bg-white/5" />)}
        </div>
        
        {/* Bars/Lines */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 gap-2">
           {[40, 65, 45, 80, 55, 70, 90, 100, 85, 95, 110, 120].map((h, i) => (
             <div key={i} className="w-full relative group">
                <div 
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-500",
                    i > 8 ? "bg-purple-500/50 border-t-2 border-purple-400 border-dashed" : "bg-blue-500/50 hover:bg-blue-500/70"
                  )}
                  style={{ height: `${h/1.5}%` }}
                />
                {i === 9 && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-10">
                    Predicted Spike
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 flex items-start gap-4">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 mt-1">
           <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
           <h4 className="text-sm font-bold text-white mb-1">AI Reorder Suggestion</h4>
           <p className="text-xs text-gray-300 leading-relaxed mb-3">
             Based on upcoming wedding events next weekend, tomato consumption is predicted to spike by 35%. 
             Your current stock of 20kg is insufficient.
           </p>
           <div className="flex items-center gap-4">
             <Button size="sm" className="h-8 bg-purple-500 hover:bg-purple-600 text-white text-xs">
               Auto-Order 50kg
             </Button>
             <span className="text-[10px] text-gray-500">Estimated Cost: ₹1,200</span>
           </div>
        </div>
      </div>
    </div>
  );
}

// Icon wrapper for PredictiveMock
function Lightbulb({className}: {className?: string}) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
}
