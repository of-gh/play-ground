export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  model?: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: LLMMessage;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface SandboxConfig {
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

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  guardrailViolations: number;
  executionTime: number;
}

class APIService {
  private config: SandboxConfig | null = null;
  private abortController: AbortController | null = null;

  setConfig(config: SandboxConfig) {
    this.config = config;
  }

  getConfig(): SandboxConfig | null {
    return this.config;
  }

  async executeAgent(
    userPrompt: string,
    onStream: (chunk: string) => void,
    onComplete: (result: ExecutionResult) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.config) {
      onError(new Error("No configuration set"));
      return;
    }

    this.abortController = new AbortController();

    try {
      const messages: LLMMessage[] = [
        { role: "system", content: this.config.agentPrompt },
        { role: "user", content: userPrompt }
      ];

      const request: LLMRequest = {
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      };

      const response = await fetch(this.config.modelEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";
      let guardrailViolations = 0;
      const startTime = Date.now();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              if (data === "[DONE]") {
                onComplete({
                  success: true,
                  output: fullOutput,
                  guardrailViolations,
                  executionTime: Date.now() - startTime
                });
                return;
              }
              
              try {
                const parsed: LLMStreamChunk = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                
                if (content) {
                  fullOutput += content;
                  onStream(content);
                }
              } catch {
                // Ignore parse errors for non-JSON lines
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      onComplete({
        success: true,
        output: fullOutput,
        guardrailViolations,
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        onComplete({
          success: false,
          output: "",
          error: "Execution aborted",
          guardrailViolations: 0,
          executionTime: 0
        });
      } else {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async testConnection(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
          stream: false
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new APIService();