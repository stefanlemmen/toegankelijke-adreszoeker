import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';

const suggestion = z.object({ id: z.string(), weergavenaam: z.string() });

const suggestResponse = z.object({
  response: z.object({ docs: z.array(suggestion) }),
});

const collation = z.object({ collationQuery: z.string(), hits: z.number() });

const spellcheckResponse = z.object({
  spellcheck: z.object({ collations: z.array(z.unknown()) }),
});

type Collation = z.infer<typeof collation>;

export type Suggestion = z.infer<typeof suggestion>;

export interface SuggestResult {
  readonly suggestions: readonly Suggestion[];
  readonly correction?: string;
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
  const suggestions = suggestResponse.parse(raw).response.docs;
  if (suggestions.length > 0) {
    return { suggestions };
  }
  return { suggestions, correction: correctionFrom(raw) };
}

function correctionFrom(raw: unknown): string | undefined {
  const response = spellcheckResponse.safeParse(raw);
  if (!response.success) {
    return undefined;
  }
  const collations = response.data.spellcheck.collations.flatMap((item): Collation[] => {
    const parsed = collation.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  return collations.reduce<Collation | undefined>(
    (best, candidate) => (!best || isBetter(candidate, best) ? candidate : best),
    undefined,
  )?.collationQuery;
}

function isBetter(candidate: Collation, best: Collation): boolean {
  if (candidate.hits !== best.hits) {
    return candidate.hits > best.hits;
  }
  return candidate.collationQuery.length > best.collationQuery.length;
}
