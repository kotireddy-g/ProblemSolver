import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, TrendingDown, BarChart3, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BottleneckCard {
  title: string;
  percentage: string;
  description: string;
  target: string;
  automationLevel: string;
  icon: React.ReactNode;
  severity: 'critical' | 'warning' | 'info';
}

interface InsightsData {
  bottlenecks: BottleneckCard[];
  metrics: {
    outliers: number;
    normalOperations: number;
    delayedPayments: number;
    healthScore: number;
  };
  actionableItems: {
    category: string;
    items: Array<{
      speed: string;
      percentage: string;
    }>;
  }[];
  criticalIssue: {
    title: string;
    description: string;
    impact: string;
    waste: string;
  };
}

export default function InsightsPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/insights/:sessionId");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (params?.sessionId) {
      setSessionId(params.sessionId);
      // Simulate loading the insights data
      setTimeout(() => {
        setInsightsData(generateInsightsData());
        setIsLoading(false);
      }, 2000);
    }
  }, [params]);

  const generateInsightsData = (): InsightsData => {
    return {
      bottlenecks: [
        {
          title: "Invoice Receipt",
          percentage: "95% Manual",
          description: "Takes 7-10 days/invoice",
          target: "Target: 5% Manual",
          automationLevel: "15%",
          icon: <AlertTriangle className="h-6 w-6" />,
          severity: "critical"
        },
        {
          title: "GRN Creation",
          percentage: "85% Manual",
          description: "No photo evidence",
          target: "Target: 15% Manual",
          automationLevel: "25%",
          icon: <Clock className="h-6 w-6" />,
          severity: "critical"
        },
        {
          title: "3-Way Matching",
          percentage: "80% Manual",
          description: "High error rate",
          target: "Target: 5% Manual",
          automationLevel: "10%",
          icon: <TrendingDown className="h-6 w-6" />,
          severity: "warning"
        },
        {
          title: "GST Validation",
          percentage: "Manual Checks",
          description: "Compliance risk",
          target: "Target: AI Automated",
          automationLevel: "45%",
          icon: <CheckCircle className="h-6 w-6" />,
          severity: "info"
        },
        {
          title: "Exception Handling",
          percentage: "Phone/Email",
          description: "No audit trail",
          target: "Target: System Driven",
          automationLevel: "5%",
          icon: <Zap className="h-6 w-6" />,
          severity: "critical"
        },
        {
          title: "Payment Auth",
          percentage: "Delayed",
          description: "Vendor trust erosion",
          target: "Target: On-Time",
          automationLevel: "20%",
          icon: <BarChart3 className="h-6 w-6" />,
          severity: "warning"
        }
      ],
      metrics: {
        outliers: 100,
        normalOperations: 319,
        delayedPayments: 375,
        healthScore: 38
      },
      actionableItems: [
        {
          category: "Food & Beverages",
          items: [
            { speed: "FAST MOVING", percentage: "73.5%" },
            { speed: "MEDIUM", percentage: "98.8%" },
            { speed: "SLOW", percentage: "89%" },
            { speed: "VERY SLOW", percentage: "129.5%" },
            { speed: "ONCE IN A WHILE", percentage: "86.2%" }
          ]
        },
        {
          category: "Housekeeping",
          items: [
            { speed: "FAST MOVING", percentage: "92.3%" },
            { speed: "MEDIUM", percentage: "75.7%" },
            { speed: "SLOW", percentage: "87.3%" },
            { speed: "VERY SLOW", percentage: "122.7%" },
            { speed: "ONCE IN A WHILE", percentage: "93.9%" }
          ]
        },
        {
          category: "Maintenance",
          items: [
            { speed: "FAST MOVING", percentage: "123.1%" },
            { speed: "MEDIUM", percentage: "186.6%" },
            { speed: "SLOW", percentage: "182.7%" },
            { speed: "VERY SLOW", percentage: "95.9%" },
            { speed: "ONCE IN A WHILE", percentage: "73.8%" }
          ]
        },
        {
          category: "Guest Utilities",
          items: [
            { speed: "FAST MOVING", percentage: "86%" },
            { speed: "MEDIUM", percentage: "83.6%" },
            { speed: "SLOW", percentage: "118%" },
            { speed: "VERY SLOW", percentage: "70.8%" },
            { speed: "ONCE IN A WHILE", percentage: "N/A" }
          ]
        }
      ],
      criticalIssue: {
        title: "Critical Revenue Impact Detected",
        description: "Based on the raw data analysis, your current manual processes are causing significant delays and revenue leakage. Implementing the 6-point solution will recover approximately",
        impact: "₹18.6L annually",
        waste: "₹4.2L Monthly Waste"
      }
    };
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Preparing your insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/?session=${sessionId}&mode=live`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold">
                PI
              </div>
              <h1 className="text-lg font-display font-bold text-white tracking-wide">
                Procurement Intelligence
              </h1>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Analysis based on uploaded raw data
          </div>
        </div>
      </header>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">Analyzing Your Data</h3>
                <p className="text-muted-foreground text-sm">Processing procurement bottlenecks...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        <AnimatePresence>
          {!isLoading && insightsData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* KPI Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{insightsData.metrics.outliers}</div>
                        <div className="text-xs text-muted-foreground">Outliers Detected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{insightsData.metrics.normalOperations}</div>
                        <div className="text-xs text-muted-foreground">Normal Operations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-500/10 border-orange-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{insightsData.metrics.delayedPayments}</div>
                        <div className="text-xs text-muted-foreground">Delayed Payments</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{insightsData.metrics.healthScore}/100</div>
                        <div className="text-xs text-muted-foreground">Procurement Health</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Identified Bottlenecks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-6">Identified Bottlenecks</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insightsData.bottlenecks.map((bottleneck, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                    >
                      <Card className={`border-l-4 ${
                        bottleneck.severity === 'critical' ? 'border-l-red-500 bg-red-500/5' :
                        bottleneck.severity === 'warning' ? 'border-l-orange-500 bg-orange-500/5' :
                        'border-l-blue-500 bg-blue-500/5'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{bottleneck.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">{bottleneck.description}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${
                              bottleneck.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              bottleneck.severity === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {bottleneck.icon}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-2xl font-bold text-white">{bottleneck.percentage}</p>
                            <p className="text-xs text-cyan-400 mt-1">{bottleneck.target}</p>
                          </div>
                          <div className="pt-2 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">AUTOMATION LEVEL</span>
                              <span className="text-xs font-semibold text-white">{bottleneck.automationLevel}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Actionable Items Matrix */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-6">Actionable Items Matrix</h2>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {insightsData.actionableItems.map((category, idx) => (
                        <div key={idx}>
                          <h3 className="text-sm font-semibold text-white mb-3">{category.category}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {category.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                <div className="text-xs text-muted-foreground mb-1 uppercase">{item.speed}</div>
                                <div className="text-lg font-bold text-white">{item.percentage}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Critical Issue Alert */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertDescription className="ml-2">
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-red-300">{insightsData.criticalIssue.title}</p>
                      <p className="text-sm text-red-400/80">
                        {insightsData.criticalIssue.description} <strong>{insightsData.criticalIssue.impact}</strong> annually.
                      </p>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-red-500/20">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">15.8 Days Avg Delay</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                          <span className="text-xs">{insightsData.criticalIssue.waste} Monthly Waste</span>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex gap-4 justify-center pt-4"
              >
                <Button 
                  onClick={() => setLocation("/roadmap")}
                  className="bg-primary text-black hover:bg-primary/90"
                >
                  View Solution Roadmap
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation(`/?session=${sessionId}&mode=live`)}
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
