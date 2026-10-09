/** `suggest?q=damrak&fq=type:adres&rows=3` */
export const SUGGEST_DAMRAK = {
  response: {
    docs: [
      { id: 'adr-damrak-18-1', weergavenaam: 'Damrak 18-1, Amsterdam' },
      { id: 'adr-damrak-201', weergavenaam: 'Damrak 201, Amsterdam' },
      { id: 'adr-damrak-1', weergavenaam: 'Damrak 1, 1012LG Amsterdam' },
    ],
  },
  highlighting: {
    'adr-damrak-18-1': { suggest: ['<b>Damrak</b> 18-1, Amsterdam'] },
    'adr-damrak-201': { suggest: ['<b>Damrak</b> 201, Amsterdam'] },
    'adr-damrak-1': { suggest: ['<b>Damrak</b> 1, 1012LG Amsterdam'] },
  },
};

/** `suggest?q=damrak&fq=type:adres&rows=4`, altered: only the first highlight is as PDOK sends it. */
export const SUGGEST_DAMRAK_UNEXPECTED_HIGHLIGHTING = {
  response: {
    docs: [
      { id: 'adr-damrak-18-1', weergavenaam: 'Damrak 18-1, Amsterdam' },
      { id: 'adr-damrak-201', weergavenaam: 'Damrak 201, Amsterdam' },
      { id: 'adr-damrak-1', weergavenaam: 'Damrak 1, 1012LG Amsterdam' },
      { id: 'adr-damrak-5', weergavenaam: 'Damrak 5, 1012LG Amsterdam' },
    ],
  },
  highlighting: {
    'adr-damrak-18-1': { suggest: ['<b>Damrak</b> 18-1, Amsterdam'] },
    'adr-damrak-1': { suggest: ['<b>Damrak</b> 1, Amsterdam'] },
    'adr-damrak-5': { suggest: ['<b>Damrak</b> 5, 1012LG <img src="x" alt="">Amsterdam'] },
  },
};

/** `suggest?q=s-gravenhage spui 70&fq=type:adres&rows=1`: PDOK escapes the apostrophe in the highlight. */
export const SUGGEST_SPUI_70 = {
  response: {
    docs: [{ id: 'adr-spui-70', weergavenaam: "Spui 70, 2511BT 's-Gravenhage" }],
  },
  highlighting: {
    'adr-spui-70': {
      suggest: ['<b>Spui</b> <b>70</b>, 2511BT &#x27;<b>s</b>-<b>Gravenhage</b>'],
    },
  },
};

/** `suggest?q=damrak 201 amsterdam&fq=type:adres`: a single match. */
export const SUGGEST_DAMRAK_201 = {
  response: {
    docs: [{ id: 'adr-damrak-201', weergavenaam: 'Damrak 201, Amsterdam' }],
  },
  highlighting: {
    'adr-damrak-201': { suggest: ['<b>Damrak</b> <b>201</b>, <b>Amsterdam</b>'] },
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
