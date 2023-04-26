import { prisma } from "@/database/client.js";
import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import PrismaClient from "@prisma/client";
import PrismaTypes from "@/generated/pothos-generated";
import { Context } from "./graphql-context";

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
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    filterConnectionTotalCount: true,
    dmmf: Prisma.dmmf,
  },
});
