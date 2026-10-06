# Adreszoeker

> Persoonlijk project; geen product van het Kadaster of PDOK.

Een toegankelijke adreszoeker voor Nederlandse adressen, gebouwd volgens het combobox-patroon van de WAI-ARIA Authoring Practices en getoetst aan WCAG 2.1 niveau AA.

**Online bekijken:** https://stefanlemmen.github.io/toegankelijke-adreszoeker/

## Wat de app doet

- Typ minstens 2 tekens van een adres; na een korte pauze verschijnen maximaal 10 suggesties van de PDOK Locatieserver.
- Kies een suggestie met muis of toetsenbord; daaronder verschijnen straat, huisnummer, postcode, woonplaats en gemeente.
- Geen backend en geen API-key: de app haalt de gegevens rechtstreeks op bij de publieke API.

## Bediening met het toetsenbord

De focus blijft in het zoekveld; met deze toetsen bedien je de lijst:

| Toets   | Functie                                                                  |
| ------- | ------------------------------------------------------------------------ |
| ↓ / ↑   | Naar de volgende / vorige suggestie (na de laatste terug naar de eerste) |
| Enter   | De actieve suggestie kiezen                                              |
| Escape  | De lijst sluiten; nog een keer Escape wist het veld                      |
| Alt + ↓ | Een gesloten lijst weer openen                                           |

Shift-, Ctrl- en Cmd-combinaties worden door de browser afgehandeld, zodat tekst selecteren en bewerken blijft werken.

## Toegankelijkheid

### Hoe de combobox werkt

Een schermlezer ziet geen kleuren of posities, alleen wat de HTML erover vertelt. Waar HTML zelf geen element heeft voor "zoekveld met suggestielijst", vullen ARIA-attributen dat aan. Deze attributen gebruikt de adreszoeker, en hierom:

- **`role="combobox"`** op het zoekveld: het is niet zomaar een tekstveld, maar een veld met een lijst keuzes eronder.
- **`aria-autocomplete="list"`**: de app vult niets zelf in het veld in, maar toont een lijst waaruit je kiest.
- **`aria-controls`**: verwijst naar de lijst die bij dit veld hoort.
- **`aria-expanded`**: geeft aan of die lijst nu open (`true`) of dicht (`false`) is.
- **`aria-activedescendant`**: verwijst naar de suggestie die je met de pijltjestoetsen hebt gemarkeerd. Zo leest de schermlezer die suggestie voor, terwijl de focus in het veld blijft.
- **`role="listbox"`** en **`role="option"`**: de lijst en de suggesties erin.
- **`aria-selected="true"`**: markeert de actieve suggestie. Visueel krijgt die ook een rand, dus niet alleen een andere kleur.
- **`aria-describedby`**: koppelt de hint "Bijvoorbeeld: Damrak 1 Amsterdam" aan het veld, zodat de schermlezer die voorleest zodra het veld de focus krijgt.
- **`role="status"`**: een vaste regel onder het veld voor meldingen ("Zoeken…", "3 adressen gevonden", "Geen adressen gevonden", foutmeldingen). De schermlezer leest die voor zonder dat de focus verspringt. De regel staat er altijd, ook leeg, omdat schermlezers een melding kunnen missen als de regel tegelijk met de tekst verschijnt.

**Waarom de focus in het veld blijft:** zo kun je gewoon doortypen of je zoekvraag verbeteren terwijl je door de suggesties loopt. De suggesties zelf zijn daarom niet met Tab bereikbaar; dat is bewust en volgens het patroon.

Daarnaast heeft de pagina twee landmarks, `<main>` en `<search>`, zodat je met de rotor van VoiceOver (of de landmarknavigatie van andere schermlezers) direct naar het zoekformulier springt.

Bron: [WAI-ARIA Authoring Practices, Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### Toegankelijkheidsverklaring

**Doel:** [WCAG 2.1](https://www.w3.org/TR/WCAG21/) niveau AA.

**Testmethode:**

- Geautomatiseerd: elke componenttest controleert de pagina met axe-core 4.13.0, in elke toestand (leeg, zoeken, resultaten, lijst open, details, foutmeldingen).
- Lighthouse 13.5.0: toegankelijkheidsscore 100, in de lichte én de donkere weergave (begintoestand van de pagina).
- Contrast handmatig gemeten in licht en donker: tekst minstens 15:1, hint en status minstens 7:1, randen en focusring minstens 5:1.
- Weergave op 320 pixels breed (WCAG 1.4.10), met vergrote tekstafstand (1.4.12) en met 200% tekstgrootte (1.4.4): geen horizontaal scrollen en geen verlies van inhoud.
- Toetsenbord en focusvolgorde in Chrome; landmarks met VoiceOver in Safari.

**Bekende beperkingen:**

- Alleen getest met VoiceOver op macOS; niet met NVDA, JAWS of schermlezers op mobiel.
- 200% browserzoom is nagebootst met een smaller venster en 200% tekst, niet apart met de zoomfunctie van de browser getest.
- Er is geen aparte wisknop; Escape (twee keer) wist het veld.
- De adresgegevens en de tekst van de suggesties komen van PDOK; daar heeft deze app geen invloed op.

**Probleem gevonden?** Meld het via een [issue in deze repository](https://github.com/stefanlemmen/toegankelijke-adreszoeker/issues/new).

## Technische keuzes

- **Angular 22**, zoneless, met signals, signal forms en `httpResource` voor de API-aanroepen.
- **Zod** (`zod/mini`) controleert de antwoorden van PDOK zodra ze binnenkomen; `zod/mini` omdat de klassieke API de bundel te groot maakte.
- **Eigen combobox, geen UI-bibliotheek:** zo is elk ARIA-attribuut zichtbaar, getest en uit te leggen.
- **Tests via de DOM**, zoals een gebruiker de app ziet (Vitest, axe-core); alleen de netwerkverzoeken worden gesimuleerd, met echte, ingekorte PDOK-antwoorden.
- **CSS** zonder framework: kleuren als custom properties met `light-dark()`, zodat de app de lichte of donkere weergave van het systeem volgt.
- **GitHub Actions** draait bij elke pull request en push naar `main` format, typecheck, lint, tests en build, en publiceert `main` daarna op GitHub Pages.

## Lokaal starten

Nodig: Node 26 (zie `.nvmrc`).

```zsh
npm ci
npm start       # http://localhost:4200
npm test
npm run check   # format, typecheck, lint, tests en build, zoals in CI
npm run build
```

## Gemaakt met AI

Ik heb dit project gebouwd met Claude Code als pair programmer. De componenten heb ik zelf geschreven; Claude schreef de tests (test-first), reviewde mijn code en zette CI, deploy en een eerste versie van deze README op. Elke keuze en elke commit heb ik zelf beoordeeld, en de toegankelijkheid heb ik zelf gecontroleerd.

## Bronnen en licentie

- Adresgegevens: BAG via [PDOK Locatieserver](https://www.pdok.nl/), CC0 1.0.
- Code: MIT, zie [LICENSE](LICENSE).
