/*instrumentation.ts*/
import { NodeSDK } from "@opentelemetry/sdk-node";
import { Resource } from "@opentelemetry/resources";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaInstrumentation } = require("@prisma/instrumentation");

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const resource = Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: "me",
    })
  );

  // no sampling for requests without a parent span
  const sampler = new ParentBasedSampler({
    root: new AlwaysOffSampler(),
    localParentNotSampled: new AlwaysOnSampler(),
  });

  const sdk = new NodeSDK({
    sampler,
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
      keepAlive: true,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      }),
    }),
    instrumentations: [
      new PrismaInstrumentation(),
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-graphql": {
          ignoreTrivialResolveSpans: true,
        },
      }),
    ],
  });

  sdk.start();
  process.on("SIGINT", async () => {
    console.log("[tracing] Shutting down");
    try {
      await sdk.shutdown();
      console.log("[tracing] Shut down successfully");
    } catch (err) {
      console.error("[tracing] Error shutting down", err);
    }
  });
} else {
  console.log(
    "Skipping telemetry setup because OTEL_EXPORTER_OTLP_ENDPOINT is not set"
  );
}
