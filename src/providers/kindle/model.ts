import { z } from "zod";
import { Book as PrismaBook } from "@prisma/client";
import { builder } from "@/graphql/builder.js";
import { sanitizeDeviceName } from "./kindle-provider.js";

export const KindleConfig = z.object({
  enabled: z.boolean().default(false),
  deviceToken: z.string(),
  cookies: z.string(),
  tlsServer: z.object({
    apiKey: z.string(),
    url: z.string(),
  }),
});

export type KindleConfig = z.infer<typeof KindleConfig>;

export type BookProgress = {
  bookId: string;
  progress: number;
  device?: string;
  syncDate: Date;
};

export class ReadBook {
  constructor(public book: PrismaBook, public progress: BookProgress) {}
}

export const Book = builder.objectType(ReadBook, {
  name: "Book",
  fields: (t) => ({
    title: t.field({
      type: "String",
      description: "Title of the book",
      resolve: (root) => root.book.title,
    }),
    author: t.field({
      type: "String",
      description: "Author of the book",
      resolve: (root) => root.book.author,
    }),
    asin: t.field({
      type: "String",
      description: "Amazon Standard Identification Number",
      resolve: (root) => root.book.providerId,
    }),
    coverUrl: t.field({
      type: "String",
      description: "URL to the cover image",
      resolve: (root) => root.book.coverUrl,
    }),
    progress: t.field({
      type: "Float",
      description:
        "Percentage of the book read. Books with 0 percentage reads are not shown.",
      resolve: async (root, _, { prisma }) => {
        return root.progress.progress;
      },
    }),
    device: t.field({
      type: "String",
      nullable: true,
      resolve: (root) => {
        return root.progress.device
          ? sanitizeDeviceName(root.progress.device)
          : null;
      },
    }),
    readAt: t.field({
      type: "Date",
      nullable: true,
      description: "The last date this book was read",
      resolve: (root) => {
        return root.progress.syncDate;
      },
    }),
    firstSeenAt: t.field({
      type: "Date",
      description: "The first time this book was seen on the Kindle API",
      resolve: (root) => root.book.seenAt,
    }),
  }),
});
