/** `suggest?q=damrak&fq=type:adres&rows=3` */
export const SUGGEST_DAMRAK = {
  response: {
    docs: [
      { id: 'adr-damrak-18-1', weergavenaam: 'Damrak 18-1, Amsterdam' },
      { id: 'adr-damrak-201', weergavenaam: 'Damrak 201, Amsterdam' },
      { id: 'adr-damrak-1', weergavenaam: 'Damrak 1, 1012LG Amsterdam' },
    ],
  },
};

/** `suggest?q=damrak 201 amsterdam&fq=type:adres`: a single match. */
export const SUGGEST_DAMRAK_201 = {
  response: {
    docs: [{ id: 'adr-damrak-201', weergavenaam: 'Damrak 201, Amsterdam' }],
  },
};

/** `suggest?q=xqzvw&fq=type:adres`: no matches and no corrections. */
export const SUGGEST_NONE = {
  response: {
    docs: [],
  },
  spellcheck: {
    collations: [],
  },
};

/** `suggest?q=darmak&fq=type:adres`: no matches, three corrections, not sorted by hits. */
export const SUGGEST_DARMAK = {
  response: {
    docs: [],
  },
  spellcheck: {
    collations: [
      'collation',
      { collationQuery: 'damrak', hits: 271 },
      'collation',
      { collationQuery: 'dormak', hits: 2 },
      'collation',
      { collationQuery: 'damak', hits: 47 },
    ],
  },
};

/** `suggest?q=Darmak 18 amsterdm&fq=type:adres`: no matches, three corrections with equal hits. */
export const SUGGEST_DARMAK_18_AMSTERDM = {
  response: {
    docs: [],
  },
  spellcheck: {
    collations: [
      'collation',
      { collationQuery: 'damrak 18 amsterda', hits: 2 },
      'collation',
      { collationQuery: 'damrak 18 amsterdam', hits: 2 },
      'collation',
      { collationQuery: 'damrak 18 amsterd', hits: 2 },
    ],
  },
};

/** `lookup?id=adr-damrak-18-1`: an address without a postcode. */
export const LOOKUP_DAMRAK_18_1 = {
  response: {
    docs: [
      {
        weergavenaam: 'Damrak 18-1, Amsterdam',
        straatnaam: 'Damrak',
        huis_nlt: '18-1',
        woonplaatsnaam: 'Amsterdam',
        gemeentenaam: 'Amsterdam',
        centroide_ll: 'POINT(4.89727884 52.37658789)',
      },
    ],
  },
};

/** `lookup?id=…` for an unknown id: PDOK answers 200 with no docs. */
export const LOOKUP_NOT_FOUND = {
  response: {
    docs: [],
  },
};
