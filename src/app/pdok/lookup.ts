import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const LOOKUP_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup';

const address = z.object({
  straatnaam: z.string(),
  huis_nlt: z.string(),
  postcode: z.optional(z.string()),
  woonplaatsnaam: z.string(),
  gemeentenaam: z.string(),
});

// PDOK answers an unknown id with 200 and no docs; the tuple makes that a parse error.
const lookupResponse = z.object({
  response: z.object({ docs: z.tuple([address]) }),
});

type Address = z.infer<typeof address>;

/** No request until an address is chosen. */
export function lookupRequest(id: string | undefined): HttpResourceRequest | undefined {
  if (!id) {
    return undefined;
  }
  return { url: LOOKUP_URL, params: { id } };
}

/** Throws on an unknown id or an unexpected response, which puts the resource in its error state. */
export function parseAddress(raw: unknown): Address {
  return lookupResponse.parse(raw).response.docs[0];
}
