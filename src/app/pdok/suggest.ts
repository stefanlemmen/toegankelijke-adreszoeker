import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';

const doc = z.object({ id: z.string(), weergavenaam: z.string() });

const suggestResponse = z.object({
  response: z.object({ docs: z.array(doc) }),
});

const highlightingResponse = z.object({ highlighting: z.record(z.string(), z.unknown()) });

const highlight = z.object({ suggest: z.array(z.string()) });

const collation = z.object({ collationQuery: z.string(), hits: z.number() });

const spellcheckResponse = z.object({
  spellcheck: z.object({ collations: z.array(z.unknown()) }),
});

type Collation = z.infer<typeof collation>;

type Doc = z.infer<typeof doc>;

/** A piece of a suggestion's text; `match` when PDOK marks it as matching the query. */
export interface Segment {
  readonly text: string;
  readonly match: boolean;
}

export interface Suggestion extends Doc {
  readonly segments: readonly Segment[];
}

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
  const docs = suggestResponse.parse(raw).response.docs;
  const highlights = highlightsFrom(raw);
  const suggestions = docs.map((doc) => ({
    ...doc,
    segments: segmentsOf(doc.weergavenaam, highlights[doc.id]),
  }));
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

function highlightsFrom(raw: unknown): Readonly<Record<string, unknown>> {
  const response = highlightingResponse.safeParse(raw);
  return response.success ? response.data.highlighting : {};
}

function segmentsOf(weergavenaam: string, highlightEntry: unknown): readonly Segment[] {
  const unmarked = [{ text: weergavenaam, match: false }];
  const marked = highlight.safeParse(highlightEntry);
  if (!marked.success || marked.data.suggest.length === 0) {
    return unmarked;
  }
  // An inert document: it decodes entities like `&#x27;`, and nothing in it runs or loads.
  const body = new DOMParser().parseFromString(marked.data.suggest[0], 'text/html').body;
  const segments = [...body.childNodes].map(segmentOf);
  return segments.every(isSegment) && textOf(segments) === weergavenaam ? segments : unmarked;
}

function segmentOf(node: ChildNode): Segment | undefined {
  if (node.nodeType === Node.TEXT_NODE) {
    return { text: node.textContent ?? '', match: false };
  }
  const onlyText = [...node.childNodes].every((child) => child.nodeType === Node.TEXT_NODE);
  return node.nodeName === 'B' && onlyText
    ? { text: node.textContent ?? '', match: true }
    : undefined;
}

function isSegment(segment: Segment | undefined): segment is Segment {
  return segment !== undefined;
}

function textOf(segments: readonly Segment[]): string {
  return segments.map((segment) => segment.text).join('');
}
