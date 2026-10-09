import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';

const suggestion = z.object({ id: z.string(), weergavenaam: z.string() });

const suggestResponse = z.object({
  response: z.object({ docs: z.array(suggestion) }),
});

export type Suggestion = z.infer<typeof suggestion>;

export interface SuggestResult {
  readonly suggestions: readonly Suggestion[];
}

export const NO_SUGGESTIONS: SuggestResult = { suggestions: [] };

/** No request until there is something to search for. */
export function suggestRequest(query: string): HttpResourceRequest | undefined {
  if (!query) {
    return undefined;
  }
  return { url: SUGGEST_URL, params: { q: query, fq: 'type:adres' } };
}

/** Throws on an unexpected response, which puts the resource in its error state. */
export function parseSuggestResult(raw: unknown): SuggestResult {
  return { suggestions: suggestResponse.parse(raw).response.docs };
}
