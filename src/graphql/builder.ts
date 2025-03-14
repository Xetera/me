import { prisma } from "@/database/client.js";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaClient from "@prisma/client";
import type PrismaTypes from "@/generated/pothos-generated";
import type { Context } from "./graphql-context";
import TracingPlugin, {
  isRootField,
  wrapResolver,
} from "@pothos/plugin-tracing";
const Prisma = PrismaClient.Prisma;

export const builder = new SchemaBuilder<{
  Context: Context;
  PrismaTypes: PrismaTypes;
  Scalars: {
    Date: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [TracingPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    filterConnectionTotalCount: true,
    dmmf: Prisma.dmmf,
  },
  tracing: {
    // Enable tracing for rootFields by default, other fields need to opt in
    default: (config) => isRootField(config),
    // Log resolver execution duration
    wrap: (resolver, options, config) =>
      wrapResolver(resolver, (error, duration) => {
        console.log(
          `Executed resolver ${config.parentType}.${config.name} in ${duration}ms`
        );
      }),
  },
});
