import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("phoneme-app");

// runs one step of a request inside its own span, so Jaeger shows it as a separate bar
// if the step throws, the span is marked as an error
export async function step<T>(name: string, work: () => T | Promise<T>): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await work();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}
