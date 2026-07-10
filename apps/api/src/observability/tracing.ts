import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

/**
 * OpenTelemetry bootstrap.
 *
 * Must be initialised BEFORE the NestJS app (and therefore before any
 * instrumented library such as http/express/pg) is imported, otherwise
 * auto-instrumentation cannot patch those modules. `main.ts` calls
 * {@link startTracing} at the very top of its bootstrap.
 *
 * Tracing is opt-in via `OTEL_ENABLED` so local development stays lightweight
 * while production/staging export spans to an OTLP collector (Grafana/Tempo).
 */

let sdk: NodeSDK | undefined;

interface TracingOptions {
  enabled: boolean;
  serviceName: string;
  endpoint?: string;
  serviceVersion: string;
}

export function startTracing(options: TracingOptions): void {
  if (!options.enabled || !options.endpoint) {
    return;
  }

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: options.serviceName,
      [ATTR_SERVICE_VERSION]: options.serviceVersion,
    }),
    traceExporter: new OTLPTraceExporter({ url: `${options.endpoint}/v1/traces` }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Filesystem spans are noisy and rarely actionable.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();
}

/** Flush and shut down the tracer on graceful shutdown. */
export async function stopTracing(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = undefined;
  }
}
