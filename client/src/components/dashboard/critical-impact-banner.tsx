import { AlertTriangle, Clock, DollarSign, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CriticalIssue } from '@/lib/procurement-data';
import { motion } from 'framer-motion';

interface CriticalImpactBannerProps {
  criticalIssues: CriticalIssue[];
  avgDelayDays?: number;
  monthlyWaste?: number;
  revenueImpact?: number;
}

export function CriticalImpactBanner({ 
  criticalIssues, 
  avgDelayDays, 
  monthlyWaste,
  revenueImpact 
}: CriticalImpactBannerProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹0L';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount.toFixed(0)}`;
  };

  const criticalCount = criticalIssues.filter(i => i.severity === 'critical').length;
  const warningCount = criticalIssues.filter(i => i.severity === 'warning').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="bg-gradient-to-r from-red-950/40 to-red-900/20 border-red-500/30 overflow-hidden"
        data-testid="card-critical-impact"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-white" data-testid="text-impact-title">
                  Critical Revenue Impact Detected
                </h3>
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-xs" data-testid="badge-critical-count">
                    {criticalCount} Critical
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge className="text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" data-testid="badge-warning-count">
                    {warningCount} Warning
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-300 mb-4" data-testid="text-impact-description">
                Based on the raw data analysis, your current manual processes are causing significant delays and revenue leakage. 
                Implementing the 6-point solution will recover approximately <strong className="text-red-400">{formatCurrency(revenueImpact)}</strong> annually.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {avgDelayDays !== undefined && avgDelayDays > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <Clock className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Delay</div>
                      <div className="text-lg font-bold text-white" data-testid="text-avg-delay">
                        {avgDelayDays.toFixed(0)} Days
                      </div>
                    </div>
                  </div>
                )}
                
                {monthlyWaste !== undefined && monthlyWaste > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Waste</div>
                      <div className="text-lg font-bold text-white" data-testid="text-monthly-waste">
                        {formatCurrency(monthlyWaste)}
                      </div>
                    </div>
                  </div>
                )}
                
                {revenueImpact !== undefined && revenueImpact > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">Recoverable</div>
                      <div className="text-lg font-bold text-green-400" data-testid="text-revenue-impact">
                        {formatCurrency(revenueImpact)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {criticalIssues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Top Issues:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {criticalIssues.slice(0, 3).map((issue, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-black/20 border border-white/5"
                        data-testid={`issue-card-${index}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium text-white">{issue.type}</p>
                          {issue.severity === 'critical' ? (
                            <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-orange-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-white mb-1" data-testid={`issue-title-${index}`}>
                          {issue.title}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">{issue.description}</p>
                        {issue.automationLevel && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Automation Level</span>
                            <span className="text-primary font-medium">{issue.automationLevel}</span>
                          </div>
                        )}
                        {issue.target && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Target</span>
                            <span className="text-green-400 font-medium">{issue.target}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
