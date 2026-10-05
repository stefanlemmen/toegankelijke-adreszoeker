import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';

const suggestion = z.object({ id: z.string(), weergavenaam: z.string() });

const suggestResponse = z.object({
  response: z.object({ docs: z.array(suggestion) }),
});

type Suggestion = z.infer<typeof suggestion>;

/** No request until there is something to search for. */
export function suggestRequest(query: string): HttpResourceRequest | undefined {
  if (!query) {
    return undefined;
  }
  return { url: SUGGEST_URL, params: { q: query, fq: 'type:adres' } };
}

/** Throws on an unexpected response, which puts the resource in its error state. */
export function parseSuggestions(raw: unknown): Suggestion[] {
  return suggestResponse.parse(raw).response.docs;
}
