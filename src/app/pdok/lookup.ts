import { HttpResourceRequest } from '@angular/common/http';
import * as z from 'zod/mini';

const LOOKUP_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup';

// Well-known text in WGS84, e.g. `POINT(4.89727884 52.37658789)`.
const point = z.pipe(
  z.string().check(z.regex(/^POINT\(-?\d+(\.\d+)? -?\d+(\.\d+)?\)$/)),
  z.transform((wkt) => {
    const [lon, lat] = wkt.slice('POINT('.length, -1).split(' ').map(Number);
    return { lon, lat };
  }),
);

const address = z.object({
  weergavenaam: z.string(),
  straatnaam: z.string(),
  huis_nlt: z.string(),
  postcode: z.optional(z.string()),
  woonplaatsnaam: z.string(),
  gemeentenaam: z.string(),
  centroide_ll: point,
});

// PDOK answers an unknown id with 200 and no docs; the tuple makes that a parse error.
const lookupResponse = z.object({
  response: z.object({ docs: z.tuple([address]) }),
});

export type Address = z.infer<typeof address>;
export type Point = z.infer<typeof point>;

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
