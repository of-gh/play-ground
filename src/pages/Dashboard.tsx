import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Square, Activity, Shield, AlertTriangle, Clock, Cpu, Network } from "lucide-react";

interface SandboxStatus {
  id: string;
  status: "idle" | "running" | "stopping" | "killing" | "stopped";
  startTime?: Date;
  uptime?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkBlocked?: boolean;
  guardrailViolations?: number;
}

export const Dashboard = () => {
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [guardrailAlerts, setGuardrailAlerts] = useState<number>(0);

  const startSandbox = async () => {
    setIsRunning(true);
    setSandboxStatus({
      id: Date.now().toString(),
      status: "running",
      startTime: new Date(),
      cpuUsage: 0,
      memoryUsage: 0,
      networkBlocked: true,
      guardrailViolations: 0
    });
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSandboxStatus(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          guardrailViolations: Math.max(0, prev.guardrailViolations! - 1)
        };
      });
    }, 2000);
    
    // Simulate logs
    const logMessages = [
      "[INFO] Initializing microVM isolation engine...",
      "[INFO] Setting up air-gapped network...",
      "[INFO] Loading LLM guardrail rules...",
      "[INFO] Starting audit logging...",
      "[INFO] Sandbox ready for agent execution"
    ];
    
    logMessages.forEach((msg, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, msg]);
      }, index * 1000);
    });
    
    return () => clearInterval(interval);
  };

  const stopSandbox = async () => {
    setIsRunning(false);
    setSandboxStatus(prev => prev ? { ...prev, status: "stopping" } : null);
    
    setTimeout(() => {
      setSandboxStatus(prev => prev ? { ...prev, status: "stopped" } : null);
    }, 1000);
  };

  const killSandbox = async () => {
    setIsRunning(false);
    setSandboxStatus(prev => prev ? { ...prev, status: "killing" } : null);
    
    // Simulate kill switch latency
    setTimeout(() => {
      setSandboxStatus(prev => prev ? { ...prev, status: "stopped" } : null);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground">PlayGround Dashboard</h1>
        <div className="flex items-center gap-2">
          {sandboxStatus?.status === "running" ? (
            <Badge variant="destructive" className="animate-pulse">
              <Activity className="w-4 h-4 mr-1" />
              RUNNING
            </Badge>
          ) : sandboxStatus?.status === "stopped" ? (
            <Badge variant="secondary">STOPPED</Badge>
          ) : (
            <Badge variant="outline">IDLE</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sandboxStatus?.status === "running" ? "Active" : 
               sandboxStatus?.status === "stopped" ? "Stopped" : "Idle"}
            </div>
            <p className="text-xs text-muted-foreground">
              MicroVM Isolation Engine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sandboxStatus?.startTime 
                ? Math.floor((Date.now() - sandboxStatus.startTime.getTime()) / 1000) + "s"
                : "0s"}
            </div>
            <p className="text-xs text-muted-foreground">
              Session duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Guardrail Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{guardrailAlerts}</div>
            <p className="text-xs text-muted-foreground">
              LLM rule violations blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {sandboxStatus?.networkBlocked ? "Blocked" : "Open"}
            </div>
            <p className="text-xs text-muted-foreground">
              Air-gapped protection
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
            <CardDescription>
              Start, stop, or kill the sandbox environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={startSandbox}
                disabled={isRunning}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Sandbox
              </Button>
              <Button 
                onClick={stopSandbox}
                disabled={!isRunning}
                variant="outline"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Sandbox
              </Button>
              <Button 
                onClick={killSandbox}
                disabled={!isRunning}
                variant="destructive"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Kill Switch
              </Button>
            </div>
            
            {sandboxStatus?.status === "running" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{sandboxStatus.cpuUsage?.toFixed(1)}%</span>
                </div>
                <Progress value={sandboxStatus.cpuUsage} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{sandboxStatus.memoryUsage?.toFixed(1)}%</span>
                </div>
                <Progress value={sandboxStatus.memoryUsage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
            <CardDescription>
              Real-time sandbox activity and guardrail alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-muted-foreground text-center py-4">
                  No logs yet. Start the sandbox to see activity.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-xs text-foreground">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};