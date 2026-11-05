import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Code } from "lucide-react";

interface TestConfig {
  agentPrompt: string;
  modelEndpoint: string;
  testLimits: {
    maxSteps: number;
    maxTimeSeconds: number;
    maxMemoryMB: number;
  };
  networkRules: {
    blockPublicInternet: boolean;
    mockEndpoints: string[];
  };
  guardrailRules: {
    blockFileWrites: boolean;
    blockShellCommands: boolean;
    riskThreshold: number;
  };
}

const DEFAULT_CONFIG: TestConfig = {
  agentPrompt: "You are a helpful AI assistant. Follow all safety guidelines.",
  modelEndpoint: "http://localhost:8080/v1/chat/completions",
  testLimits: {
    maxSteps: 100,
    maxTimeSeconds: 300,
    maxMemoryMB: 512
  },
  networkRules: {
    blockPublicInternet: true,
    mockEndpoints: ["http://mock-api.local", "http://mock-db.local"]
  },
  guardrailRules: {
    blockFileWrites: true,
    blockShellCommands: true,
    riskThreshold: 7
  }
};

const Config = () => {
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);
  const [jsonConfig, setJsonConfig] = useState(JSON.stringify(DEFAULT_CONFIG, null, 2));
  const [isJsonMode, setIsJsonMode] = useState(false);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setJsonConfig(e.target.value);
      setConfig(parsed);
    } catch {
      // Invalid JSON - don't update config
    }
  };

  const handleFieldChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setJsonConfig(JSON.stringify({ ...config, [key]: value }, null, 2));
  };

  const handleNestedChange = (section: string, key: string, value: any) => {
    setConfig(prev => {
      const sectionObj = prev[section as keyof TestConfig] as Record<string, any>;
      return {
        ...prev,
        [section]: { ...sectionObj, [key]: value }
      };
    });
    setJsonConfig(JSON.stringify(config, null, 2));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Test Configuration</h1>
          <Button onClick={() => setIsJsonMode(!isJsonMode)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isJsonMode ? "Form View" : "JSON View"}
          </Button>
        </div>

        {isJsonMode ? (
          <Card>
            <CardHeader>
              <CardTitle>JSON Configuration</CardTitle>
              <CardDescription>
                Edit the test configuration as JSON
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jsonConfig}
                onChange={handleJsonChange}
                className="font-mono text-sm h-96"
                placeholder='{"agentPrompt": "...", "modelEndpoint": "...", ...}'
              />
            </CardContent>
            <CardFooter>
              <Button onClick={() => setJsonConfig(JSON.stringify(DEFAULT_CONFIG, null, 2))} variant="outline">
                Reset to Default
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>
                  Define the target agent prompt and model endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Agent Prompt</Label>
                  <Textarea
                    value={config.agentPrompt}
                    onChange={(e) => handleFieldChange("agentPrompt", e.target.value)}
                    className="h-32"
                    placeholder="Enter the target agent prompt..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Model Endpoint</Label>
                  <Input
                    value={config.modelEndpoint}
                    onChange={(e) => handleFieldChange("modelEndpoint", e.target.value)}
                    placeholder="http://localhost:8080/v1/chat/completions"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Limits</CardTitle>
                <CardDescription>
                  Set execution boundaries for the sandbox
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Steps</Label>
                  <Input
                    type="number"
                    value={config.testLimits.maxSteps}
                    onChange={(e) => handleNestedChange("testLimits", "maxSteps", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Time (seconds)</Label>
                  <Input
                    type="number"
                    value={config.testLimits.maxTimeSeconds}
                    onChange={(e) => handleNestedChange("testLimits", "maxTimeSeconds", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Memory (MB)</Label>
                  <Input
                    type="number"
                    value={config.testLimits.maxMemoryMB}
                    onChange={(e) => handleNestedChange("testLimits", "maxMemoryMB", parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Rules</CardTitle>
                <CardDescription>
                  Configure air-gapped network settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.networkRules.blockPublicInternet}
                      onChange={(e) => handleNestedChange("networkRules", "blockPublicInternet", e.target.checked)}
                      className="mr-2"
                    />
                    Block Public Internet
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Mock Endpoints</Label>
                  <Textarea
                    value={config.networkRules.mockEndpoints.join("\n")}
                    onChange={(e) => handleNestedChange("networkRules", "mockEndpoints", e.target.value.split("\n").filter(Boolean))}
                    className="h-24"
                    placeholder="http://mock-api.local\nhttp://mock-db.local"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guardrail Rules</CardTitle>
                <CardDescription>
                  Configure LLM supervision rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.guardrailRules.blockFileWrites}
                      onChange={(e) => handleNestedChange("guardrailRules", "blockFileWrites", e.target.checked)}
                      className="mr-2"
                    />
                    Block File Writes
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.guardrailRules.blockShellCommands}
                      onChange={(e) => handleNestedChange("guardrailRules", "blockShellCommands", e.target.checked)}
                      className="mr-2"
                    />
                    Block Shell Commands
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Risk Threshold (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={config.guardrailRules.riskThreshold}
                    onChange={(e) => handleNestedChange("guardrailRules", "riskThreshold", parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Code className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Config;