import { HttpRequest } from '@angular/common/http';

// From the PDOK docs, not from the implementation.
const SUGGEST_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest';
const LOOKUP_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup';

export function isSuggestRequestFor(query: string): (request: HttpRequest<unknown>) => boolean {
  return (request) => {
    const url = new URL(request.urlWithParams);
    return (
      `${url.origin}${url.pathname}` === SUGGEST_URL &&
      url.searchParams.get('q') === query &&
      url.searchParams.get('fq') === 'type:adres'
    );
  };
}

export function isLookupRequestFor(id: string): (request: HttpRequest<unknown>) => boolean {
  return (request) => {
    const url = new URL(request.urlWithParams);
    return `${url.origin}${url.pathname}` === LOOKUP_URL && url.searchParams.get('id') === id;
  };
}
