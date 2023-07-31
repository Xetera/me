import { Kindle } from "kindle-api";
import { setTimeout as sleep } from "timers/promises";
import { KindleAuthor } from "kindle-api/dist/book";

const FETCHING_DELAY = 200;
export async function* iterBooks(client: Kindle) {
  for (const book of client.defaultBooks) {
    await sleep(FETCHING_DELAY);

    const lightDetails = await book.details();
    const isUnread = lightDetails.progress.position === -1;

    if (isUnread) {
      continue;
    }

    yield { details: await book.fullDetails(lightDetails), book };
  }
}

export function authorName(authors: KindleAuthor[]): string {
  const [author] = authors;
  return author ? `${author.firstName} ${author.lastName}` : "[unknown]";
}
