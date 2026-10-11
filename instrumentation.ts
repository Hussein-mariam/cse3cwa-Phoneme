import { registerOTel } from "@vercel/otel";

// Next.js runs this once on startup. It sends a trace of every request to Jaeger (http://localhost:16686)
export function register() {
  registerOTel({ serviceName: "phoneme-app" });
}
