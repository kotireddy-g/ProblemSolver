import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, FileText, Search, ShieldAlert, Wallet } from "lucide-react";

export function ProblemSection({ data }: { data: any }) {
  const modules = [
    {
      title: "Invoice Receipt",
      icon: FileText,
      status: "Critical",
      metric: "95% Manual",
      target: "5% Manual",
      desc: "Takes 7-10 days/invoice",
      color: "text-red-400",
      progress: 15
    },
    {
      title: "GRN Creation",
      icon: CheckCircle2,
      status: "Warning",
      metric: "85% Manual",
      target: "15% Manual",
      desc: "No photo evidence",
      color: "text-orange-400",
      progress: 25
    },
    {
      title: "3-Way Matching",
      icon: Search,
      status: "Critical",
      metric: "80% Manual",
      target: "5% Manual",
      desc: "High error rate",
      color: "text-red-400",
      progress: 10
    },
    {
      title: "GST Validation",
      icon: ShieldAlert,
      status: "Warning",
      metric: "Manual Checks",
      target: "AI Automated",
      desc: "Compliance risk",
      color: "text-orange-400",
      progress: 40
    },
    {
      title: "Exception Handling",
      icon: AlertTriangle,
      status: "Severe",
      metric: "Phone/Email",
      target: "System Driven",
      desc: "No audit trail",
      color: "text-red-500",
      progress: 5
    },
    {
      title: "Payment Auth",
      icon: Wallet,
      status: "Critical",
      metric: "Delayed",
      target: "On-Time",
      desc: "Vendor trust erosion",
      color: "text-red-400",
      progress: 20
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-white">Identified Bottlenecks</h2>
        <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
          Analysis based on uploaded raw data
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod, i) => (
          <Card key={mod.title} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                {mod.title}
              </CardTitle>
              <mod.icon className={cn("h-4 w-4", mod.color)} />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-2xl font-bold text-white">{mod.metric}</div>
                  <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-primary font-medium">Target: {mod.target}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>Automation Level</span>
                  <span>{mod.progress}%</span>
                </div>
                <Progress value={mod.progress} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Impact Banner */}
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 flex items-start gap-4">
        <div className="p-3 rounded-full bg-red-500/20 text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Critical Revenue Impact Detected</h3>
          <p className="text-gray-400 text-sm mb-4">
            Based on the raw data analysis, your current manual processes are causing significant delays and revenue leakage.
            Implementing the 6-point solution will recover approximately <span className="text-white font-bold">{data.financial?.revenueLoss}</span> annually.
          </p>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2 text-red-300">
              <Clock className="h-4 w-4" />
              <span>{data.problems?.avgDelayDays} Days Avg Delay</span>
            </div>
            <div className="flex items-center gap-2 text-red-300">
              <Wallet className="h-4 w-4" />
              <span>{data.problems?.wasteAmount} Monthly Waste</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
