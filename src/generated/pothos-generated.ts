/* eslint-disable */
import type { Prisma, Book, BookProgress, Song, SimklActivity, Request, SimklShow, BookProgressView } from "/Users/xetera/me-ts/node_modules/.pnpm/@prisma+client@5.0.0_prisma@5.0.0/node_modules/@prisma/client";
export default interface PrismaTypes {
    Book: {
        Name: "Book";
        Shape: Book;
        Include: Prisma.BookInclude;
        Select: Prisma.BookSelect;
        OrderBy: Prisma.BookOrderByWithRelationInput;
        WhereUnique: Prisma.BookWhereUniqueInput;
        Where: Prisma.BookWhereInput;
        Create: {};
        Update: {};
        RelationName: "recordedProgress";
        ListRelations: "recordedProgress";
        Relations: {
            recordedProgress: {
                Shape: BookProgress[];
                Name: "BookProgress";
            };
        };
    };
    BookProgress: {
        Name: "BookProgress";
        Shape: BookProgress;
        Include: Prisma.BookProgressInclude;
        Select: Prisma.BookProgressSelect;
        OrderBy: Prisma.BookProgressOrderByWithRelationInput;
        WhereUnique: Prisma.BookProgressWhereUniqueInput;
        Where: Prisma.BookProgressWhereInput;
        Create: {};
        Update: {};
        RelationName: "book";
        ListRelations: never;
        Relations: {
            book: {
                Shape: Book;
                Name: "Book";
            };
        };
    };
    Song: {
        Name: "Song";
        Shape: Song;
        Include: never;
        Select: Prisma.SongSelect;
        OrderBy: Prisma.SongOrderByWithRelationInput;
        WhereUnique: Prisma.SongWhereUniqueInput;
        Where: Prisma.SongWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    SimklActivity: {
        Name: "SimklActivity";
        Shape: SimklActivity;
        Include: never;
        Select: Prisma.SimklActivitySelect;
        OrderBy: Prisma.SimklActivityOrderByWithRelationInput;
        WhereUnique: Prisma.SimklActivityWhereUniqueInput;
        Where: Prisma.SimklActivityWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Request: {
        Name: "Request";
        Shape: Request;
        Include: never;
        Select: Prisma.RequestSelect;
        OrderBy: Prisma.RequestOrderByWithRelationInput;
        WhereUnique: Prisma.RequestWhereUniqueInput;
        Where: Prisma.RequestWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    SimklShow: {
        Name: "SimklShow";
        Shape: SimklShow;
        Include: never;
        Select: Prisma.SimklShowSelect;
        OrderBy: Prisma.SimklShowOrderByWithRelationInput;
        WhereUnique: Prisma.SimklShowWhereUniqueInput;
        Where: Prisma.SimklShowWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    BookProgressView: {
        Name: "BookProgressView";
        Shape: BookProgressView;
        Include: never;
        Select: Prisma.BookProgressViewSelect;
        OrderBy: Prisma.BookProgressViewOrderByWithRelationInput;
        WhereUnique: Prisma.BookProgressViewWhereUniqueInput;
        Where: Prisma.BookProgressViewWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}