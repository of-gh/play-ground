import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, Shield, FileText, Clock } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  type: "system" | "guardrail" | "network" | "agent";
  level: "info" | "warning" | "error" | "blocked";
  message: string;
  details?: string;
}

const MOCK_LOGS: AuditEntry[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    type: "system",
    level: "info",
    message: "MicroVM initialized successfully",
    details: "firecraker-vm-001"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000).toISOString(),
    type: "network",
    level: "info",
    message: "Air-gapped network configured",
    details: "blocked: outbound, allowed: mock endpoints"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 2000).toISOString(),
    type: "guardrail",
    level: "warning",
    message: "Guardrail rule triggered: blocked file write attempt",
    details: "path: /etc/passwd, risk_score: 8"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 3000).toISOString(),
    type: "agent",
    level: "info",
    message: "Agent reasoning step completed",
    details: "step: 5, tokens: 243"
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 4000).toISOString(),
    type: "guardrail",
    level: "blocked",
    message: "Shell command blocked by guardrail",
    details: "command: rm -rf /, risk_score: 10"
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 5000).toISOString(),
    type: "system",
    level: "info",
    message: "Audit logging started",
    details: "format: jsonl, destination: ./output/session_audit.jsonl"
  }
];

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditEntry[]>(MOCK_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "info": return <Badge variant="secondary">Info</Badge>;
      case "warning": return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
      case "error": return <Badge variant="destructive">Error</Badge>;
      case "blocked": return <Badge variant="destructive">Blocked</Badge>;
      default: return <Badge>{level}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system": return <FileText className="w-4 h-4" />;
      case "guardrail": return <Shield className="w-4 h-4" />;
      case "network": return <Shield className="w-4 h-4" />;
      case "agent": return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleExport = () => {
    const jsonl = filteredLogs.map(log => JSON.stringify(log)).join("\n");
    const blob = new Blob([jsonl], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "session_audit.jsonl";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Audit Log</h1>
          <Button onClick={handleExport} variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Export JSONL
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Audit Trail</CardTitle>
            <CardDescription>
              Immutable structured logs with microsecond timestamps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "system" ? "default" : "outline"}
                  onClick={() => setFilterType("system")}
                >
                  System
                </Button>
                <Button
                  variant={filterType === "guardrail" ? "default" : "outline"}
                  onClick={() => setFilterType("guardrail")}
                >
                  Guardrail
                </Button>
                <Button
                  variant={filterType === "agent" ? "default" : "outline"}
                  onClick={() => setFilterType("agent")}
                >
                  Agent
                </Button>
              </div>
            </div>

            <ScrollArea className="h-96 rounded-md border">
              <div className="space-y-2 p-4">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No logs found matching your criteria.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-1">
                        {getTypeIcon(log.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          {getLevelBadge(log.level)}
                          <Badge variant="outline" className="text-xs">
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;