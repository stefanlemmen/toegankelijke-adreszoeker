# Adreszoeker

> Persoonlijk project; geen product van het Kadaster of PDOK.

Een toegankelijke adreszoeker voor Nederlandse adressen, gebouwd volgens het combobox-patroon van de WAI-ARIA Authoring Practices en getoetst aan WCAG 2.1 niveau AA.

**Online bekijken:** https://stefanlemmen.github.io/toegankelijke-adreszoeker/

## Wat de app doet

- Typ minstens 2 tekens van een adres; na een korte pauze verschijnen maximaal 10 suggesties van de PDOK Locatieserver.
- Vindt een zoekvraag niets door een tikfout, dan stelt de app een correctie voor: "Geen adressen gevonden. Bedoelt u damrak?". Kies je die, dan zoekt de app opnieuw met de correctie.
- Kies een suggestie met muis of toetsenbord; daaronder verschijnen straat, huisnummer, postcode, woonplaats en gemeente.
- Een kaart naast het zoekpaneel (op een smal scherm eronder) toont waar het gekozen adres ligt; daarvoor een kaart van Nederland.
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

Staat er een correctie in de statusregel ("Bedoelt u damrak?"), dan ga je er met Tab naartoe en kies je hem met Enter of Spatie. Daarna staat de focus weer in het zoekveld, zodat je met ↓ meteen door de nieuwe suggesties gaat.

## Toegankelijkheid

### Hoe de combobox werkt

Een screenreader ziet geen kleuren of posities, alleen wat de HTML erover vertelt. Waar HTML zelf geen element heeft voor "zoekveld met suggestielijst", vullen ARIA-attributen dat aan. Deze attributen gebruikt de adreszoeker, en hierom:

- **`role="combobox"`** op het zoekveld: het is niet zomaar een tekstveld, maar een veld met een lijst keuzes eronder.
- **`aria-autocomplete="list"`**: de app vult niets zelf in het veld in, maar toont een lijst waaruit je kiest.
- **`aria-controls`**: verwijst naar de lijst die bij dit veld hoort.
- **`aria-expanded`**: geeft aan of die lijst nu open (`true`) of dicht (`false`) is.
- **`aria-activedescendant`**: verwijst naar de suggestie die je met de pijltjestoetsen hebt gemarkeerd. Zo leest de screenreader die suggestie voor, terwijl de focus in het veld blijft.
- **`role="listbox"`** en **`role="option"`**: de lijst en de suggesties erin.
- **`aria-selected="true"`**: markeert de actieve suggestie. Visueel krijgt die ook een rand, dus niet alleen een andere kleur.
- **`aria-describedby`**: koppelt de hint "Minimaal 2 tekens, bijvoorbeeld: Damrak 1 Amsterdam" aan het veld, zodat de screenreader die voorleest zodra het veld de focus krijgt.
- **`role="status"`**: een vaste regel onder het veld voor meldingen ("Zoeken…", "3 adressen gevonden", "Geen adressen gevonden", foutmeldingen). De screenreader leest die voor zonder dat de focus verspringt. De regel staat er altijd, ook leeg, omdat screenreaders een melding kunnen missen als de regel tegelijk met de tekst verschijnt.
- **Een `<button>` voor de correctie**, in de statusregel en opgemaakt als link. Het is een knop omdat hij iets op de pagina doet (opnieuw zoeken) en niet naar een andere pagina gaat. De correctie staat zo één keer op de pagina en wordt samen met "Geen adressen gevonden" voorgelezen.

**Waarom de focus in het veld blijft:** zo kun je gewoon doortypen of je zoekvraag verbeteren terwijl je door de suggesties loopt. De suggesties zelf zijn daarom niet met Tab bereikbaar; dat is bewust en volgens het patroon.

Daarnaast heeft de pagina drie landmarks, `<main>`, `<search>` en de `<footer>`, zodat je met de rotor van VoiceOver (of de landmarknavigatie van andere screenreaders) direct naar het zoekformulier of de link naar de broncode springt.

Bron: [WAI-ARIA Authoring Practices, Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### De kaart

De kaart is een aanvulling: alles wat erop staat, staat ook als tekst op de pagina.

- **Eén afbeelding met een tekstalternatief:** `role="img"` met "Kaart van Nederland" of "Kaart met de ligging van Damrak 18-1, Amsterdam". De adresgegevens ernaast zijn de uitgebreide beschrijving.
- **Tegels en marker verborgen voor screenreaders:** de kaarttegels hebben `alt=""` en de marker `aria-hidden`, zodat een screenreader niet 63 losse afbeeldingen voorleest.
- **Niet bedienbaar:** geen pannen, zoomen of klikken, dus ook geen extra toetsenbordbediening; de kaart krijgt nooit de focus.
- **Marker:** een speld, herkenbaar aan zijn vorm, donker met een witte rand, zodat hij op lichte en gedimde tegels zichtbaar blijft.
- **Donkere weergave:** PDOK heeft geen donkere kaart, dus de gewone kaart wordt met een CSS-filter gedimd. Laden de tegels niet, dan blijft een effen vlak over; zoeken en de details werken gewoon.

### Wat een screenreader zegt

Zo klinkt de adreszoeker met VoiceOver in Safari op macOS (oktober 2026). VoiceOver spreekt de paginatekst in het Nederlands uit, maar woorden als "combo box" en "collapsed" in de taal van macOS; die stond bij deze test op Engels.

| Wat je doet                        | Wat VoiceOver zegt                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Met Tab naar het zoekveld          | "Adres Minimaal 2 tekens, bijvoorbeeld: Damrak 1 Amsterdam, list box pop-up collapsed, combo box, search" |
| `damrak` typen                     | "expanded, list 10 items"                                                                                 |
| ↓                                  | "Damrak 18-1, Amsterdam, selected, (1 of 10)"                                                             |
| Nog een keer ↓                     | "Damrak 201, Amsterdam, selected, (2 of 10)"                                                              |
| ↑                                  | "Damrak 18-1, Amsterdam, selected, (1 of 10)"                                                             |
| Enter                              | "collapsed, Damrak 18-1, Amsterdam"                                                                       |
| Opnieuw `damrak` typen, dan Escape | "collapsed, damrak"                                                                                       |
| Nog een keer Escape                | "Zoekveld gewist"                                                                                         |
| `xqzvw` typen (bestaat niet)       | "Geen adressen gevonden"                                                                                  |
| `darmak` typen (tikfout)           | "Geen adressen gevonden. Bedoelt u damrak ?"                                                              |
| Rotor (VO+U), Landmarks            | `main`, `search` en `content information`                                                                 |

Na het kiezen lees je met VO+→ eerst de kop ("heading level 2, Gekozen adres") en daarna de details als "description list 5 items", gevolgd door elk label en elke waarde.

Als er resultaten zijn, zegt VoiceOver "expanded, list 10 items" en slaat het de statusmelding "10 adressen gevonden" over; het aantal hoor je dus via de lijst. Zonder lijst, zoals bij "Geen adressen gevonden" of "Zoekveld gewist", leest VoiceOver de statusmelding wel voor.

### Toegankelijkheidsverklaring

**Status:** voldoet aan [WCAG 2.1](https://www.w3.org/TR/WCAG21/) niveau AA. Eigen beoordeling op 6 oktober 2026, voor de kaart bijgewerkt op 7 oktober 2026, per succescriterium: alle 50 criteria van niveau A en AA (zie [de tabel](#per-succescriterium)). Geen onafhankelijke audit.

**Testmethode:**

- Geautomatiseerd: elke componenttest controleert de pagina met axe-core 4.13.0, in elke toestand (leeg, zoeken, resultaten, lijst open, details, foutmeldingen).
- Lighthouse 13.5.0 op de live site: toegankelijkheidsscore 100, in de lichte én de donkere weergave (begintoestand van de pagina). Na het toevoegen van de kaart lokaal opnieuw gedraaid met Lighthouse 13.5.0: weer 100 in licht en donker, op mobiel en desktop.
- Contrast handmatig gemeten in licht en donker, ook op de grijze achtergrond van het paneel: tekst minstens 12:1, hint en status minstens 6,8:1, randen minstens 4,5:1, focusring minstens 7,3:1.
- Weergave op 320 pixels breed (WCAG 1.4.10), met vergrote tekstafstand (1.4.12) en met 200% tekstgrootte (1.4.4): geen horizontaal scrollen en geen verlies van inhoud.
- Handmatig: toetsenbord en focusvolgorde in Chrome en Safari; de hele zoekflow met VoiceOver in Safari (zie hierboven).

**Bekende beperkingen:**

- Alleen getest met VoiceOver op macOS; niet met NVDA, JAWS of screenreaders op mobiel.
- 200% browserzoom is nagebootst met een smaller venster en 200% tekst, niet apart met de zoomfunctie van de browser getest.
- Er is geen aparte wisknop; Escape (twee keer) wist het veld.
- De adresgegevens en de tekst van de suggesties komen van PDOK; daar heeft deze app geen invloed op.

**Probleem gevonden?** Meld het via een [issue in deze repository](https://github.com/stefanlemmen/toegankelijke-adreszoeker/issues/new).

#### Per succescriterium

| Criterium                                                  | Niveau | Resultaat | Toelichting                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 Non-text Content                                     | A      | Voldoet   | Het GitHub-icoon is decoratief en verborgen voor screenreaders. De kaart is één afbeelding met een tekstalternatief met het adres; de adresgegevens staan als tekst ernaast. Tegels en marker zijn verborgen voor screenreaders. |
| 1.2.1 Audio-only and Video-only (Prerecorded)              | A      | N.v.t.    | Geen audio of video.                                                                                                                                                                                                             |
| 1.2.2 Captions (Prerecorded)                               | A      | N.v.t.    | Geen video.                                                                                                                                                                                                                      |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A      | N.v.t.    | Geen video.                                                                                                                                                                                                                      |
| 1.2.4 Captions (Live)                                      | AA     | N.v.t.    | Geen live media.                                                                                                                                                                                                                 |
| 1.2.5 Audio Description (Prerecorded)                      | AA     | N.v.t.    | Geen video.                                                                                                                                                                                                                      |
| 1.3.1 Info and Relationships                               | A      | Voldoet   | Label en hint gekoppeld aan het zoekveld; lijst als `listbox` met `option`s; kop "Gekozen adres" boven de details als beschrijvingslijst; landmarks `main`, `search` en `footer`.                                                |
| 1.3.2 Meaningful Sequence                                  | A      | Voldoet   | De volgorde in de code is gelijk aan de zichtbare volgorde: paneel, kaart, footer.                                                                                                                                               |
| 1.3.3 Sensory Characteristics                              | A      | Voldoet   | Instructies verwijzen niet naar vorm, plek of geluid.                                                                                                                                                                            |
| 1.3.4 Orientation                                          | AA     | Voldoet   | Werkt staand en liggend; de oriëntatie ligt niet vast.                                                                                                                                                                           |
| 1.3.5 Identify Input Purpose                               | AA     | N.v.t.    | Het zoekveld vraagt een willekeurig adres, geen gegevens over de gebruiker zelf.                                                                                                                                                 |
| 1.4.1 Use of Color                                         | A      | Voldoet   | De actieve suggestie heeft een rand én een achtergrondkleur; de links zijn onderstreept; de marker is herkenbaar aan zijn vorm.                                                                                                  |
| 1.4.2 Audio Control                                        | A      | N.v.t.    | Geen audio.                                                                                                                                                                                                                      |
| 1.4.3 Contrast (Minimum)                                   | AA     | Voldoet   | Tekst minstens 12:1, hint en status minstens 6,8:1, links in de footer 7,3:1; licht en donker. Namen op de kaart horen bij een afbeelding met veel andere visuele inhoud en vallen onder de uitzondering.                        |
| 1.4.4 Resize Text                                          | AA     | Voldoet   | 200% tekstgrootte zonder verlies van inhoud (zie bekende beperkingen over browserzoom).                                                                                                                                          |
| 1.4.5 Images of Text                                       | AA     | Voldoet   | Geen afbeeldingen van tekst; de namen op de kaarttegels horen bij een kaart met veel andere visuele inhoud, en het adres staat ook als tekst op de pagina.                                                                       |
| 1.4.10 Reflow                                              | AA     | Voldoet   | Op 320 pixels breed geen horizontaal scrollen, ook met de lijst, de details en de kaart; de kaart past binnen het scherm.                                                                                                        |
| 1.4.11 Non-text Contrast                                   | AA     | Voldoet   | Rand van het zoekveld minstens 4,5:1; focusring minstens 7,3:1; rand van de actieve suggestie minstens 6,8:1. De marker is donker met een witte rand; het adres staat ook als tekst ernaast.                                     |
| 1.4.12 Text Spacing                                        | AA     | Voldoet   | Met vergrote tekstafstand op 320 pixels wordt niets afgesneden; een lange waarde scrolt binnen het zoekveld, zoals in elk tekstveld.                                                                                             |
| 1.4.13 Content on Hover or Focus                           | AA     | N.v.t.    | De lijst verschijnt door typen, niet door hover of focus.                                                                                                                                                                        |
| 2.1.1 Keyboard                                             | A      | Voldoet   | Zoeken, kiezen, sluiten en wissen werken met het toetsenbord (zie [Bediening met het toetsenbord](#bediening-met-het-toetsenbord)).                                                                                              |
| 2.1.2 No Keyboard Trap                                     | A      | Voldoet   | Tab en Shift+Tab verlaten het zoekveld altijd.                                                                                                                                                                                   |
| 2.1.4 Character Key Shortcuts                              | A      | N.v.t.    | Geen sneltoetsen met letters, cijfers of leestekens.                                                                                                                                                                             |
| 2.2.1 Timing Adjustable                                    | A      | N.v.t.    | Geen tijdslimieten.                                                                                                                                                                                                              |
| 2.2.2 Pause, Stop, Hide                                    | A      | N.v.t.    | Geen bewegende of automatisch verversende inhoud.                                                                                                                                                                                |
| 2.3.1 Three Flashes or Below Threshold                     | A      | Voldoet   | Niets flitst.                                                                                                                                                                                                                    |
| 2.4.1 Bypass Blocks                                        | A      | N.v.t.    | Eén pagina, dus geen herhaalde blokken; landmarks zijn er wel.                                                                                                                                                                   |
| 2.4.2 Page Titled                                          | A      | Voldoet   | Titel "Adreszoeker – zoek een adres in Nederland".                                                                                                                                                                               |
| 2.4.3 Focus Order                                          | A      | Voldoet   | Tab gaat van het zoekveld naar de twee links in de footer; de kaart krijgt geen focus; de focus blijft in het veld bij het kiezen.                                                                                               |
| 2.4.4 Link Purpose (In Context)                            | A      | Voldoet   | "Broncode op GitHub" zegt waar de link heen gaat; "CC BY 4.0" staat in de zin "Kaart: BRT Achtergrondkaart, Kadaster, CC BY 4.0".                                                                                                |
| 2.4.5 Multiple Ways                                        | AA     | N.v.t.    | Eén pagina, geen set van pagina's.                                                                                                                                                                                               |
| 2.4.6 Headings and Labels                                  | AA     | Voldoet   | Koppen "Adreszoeker" en "Gekozen adres" en label "Adres" beschrijven onderwerp en doel.                                                                                                                                          |
| 2.4.7 Focus Visible                                        | AA     | Voldoet   | Duidelijke focusring van 3 pixels op het zoekveld en de links, licht en donker.                                                                                                                                                  |
| 2.5.1 Pointer Gestures                                     | A      | N.v.t.    | Geen veeg- of meervingergebaren.                                                                                                                                                                                                 |
| 2.5.2 Pointer Cancellation                                 | A      | Voldoet   | Een suggestie wordt gekozen bij het loslaten van de muisknop.                                                                                                                                                                    |
| 2.5.3 Label in Name                                        | A      | Voldoet   | De toegankelijke namen zijn gelijk aan de zichtbare tekst.                                                                                                                                                                       |
| 2.5.4 Motion Actuation                                     | A      | N.v.t.    | Geen bediening door het apparaat te bewegen.                                                                                                                                                                                     |
| 3.1.1 Language of Page                                     | A      | Voldoet   | `lang="nl"`.                                                                                                                                                                                                                     |
| 3.1.2 Language of Parts                                    | AA     | Voldoet   | De enige niet-Nederlandse woorden zijn eigennamen (GitHub, CC BY 4.0); eigennamen zijn uitgezonderd.                                                                                                                             |
| 3.2.1 On Focus                                             | A      | Voldoet   | Focus verandert niets aan de pagina.                                                                                                                                                                                             |
| 3.2.2 On Input                                             | A      | Voldoet   | Typen toont suggesties en kiezen toont de details en de kaart; de focus blijft in het zoekveld.                                                                                                                                  |
| 3.2.3 Consistent Navigation                                | AA     | N.v.t.    | Eén pagina.                                                                                                                                                                                                                      |
| 3.2.4 Consistent Identification                            | AA     | N.v.t.    | Eén pagina.                                                                                                                                                                                                                      |
| 3.3.1 Error Identification                                 | A      | Voldoet   | Fouten bij zoeken en ophalen staan als tekst in een statusmelding.                                                                                                                                                               |
| 3.3.2 Labels or Instructions                               | A      | Voldoet   | Label "Adres" met de minimale lengte en een voorbeeld.                                                                                                                                                                           |
| 3.3.3 Error Suggestion                                     | AA     | Voldoet   | Foutmeldingen zeggen wat je kunt doen: "Probeer het opnieuw." Vindt een zoekvraag niets en kent PDOK een correctie, dan staat die erbij: "Bedoelt u damrak?"                                                                     |
| 3.3.4 Error Prevention (Legal, Financial, Data)            | AA     | N.v.t.    | Geen juridische of financiële handelingen; er wordt niets opgeslagen.                                                                                                                                                            |
| 4.1.1 Parsing                                              | A      | Voldoet   | Geldt voor HTML altijd als voldaan (WCAG 2.1, noot bij 4.1.1).                                                                                                                                                                   |
| 4.1.2 Name, Role, Value                                    | A      | Voldoet   | Zoekveld, lijst en suggesties hebben naam, rol en status (`aria-expanded`, `aria-activedescendant`, `aria-selected`); bevestigd met VoiceOver.                                                                                   |
| 4.1.3 Status Messages                                      | AA     | Voldoet   | Aantal resultaten, zoeken, fouten, wissen en de correctie staan in een statusmelding (zie hierboven over VoiceOver).                                                                                                             |

## Technische keuzes

- **Angular 22**, zoneless, met signals, signal forms en `httpResource` voor de API-aanroepen.
- **Zod** (`zod/mini`) controleert de antwoorden van PDOK zodra ze binnenkomen; `zod/mini` omdat de klassieke API de bundel te groot maakte.
- **Eigen combobox, geen UI-bibliotheek:** zo is elk ARIA-attribuut zichtbaar, getest en uit te leggen.
- **Tests via de DOM**, zoals een gebruiker de app ziet (Vitest, axe-core); alleen de netwerkverzoeken worden gesimuleerd, met echte, ingekorte PDOK-antwoorden.
- **Kaart zonder kaartbibliotheek:** statische tegels van de PDOK BRT Achtergrondkaart als raster van `<img>`; de app berekent uit de coördinaten welke tegels nodig zijn, en CSS zet het adres precies in het midden. Geen nieuwe dependency.
- **CSS** zonder framework: kleuren als custom properties met `light-dark()`, zodat de app de lichte of donkere weergave van het systeem volgt.
- **Open Sans, zelf gehost:** woff2-bestanden (rechtop en cursief, elk Latijns en uitgebreid Latijns, variabel gewicht) in de repository, zodat de browser van een bezoeker geen fontserver van derden aanroept. Het uitgebreide bestand laadt alleen als een adres zo'n teken bevat.
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

Ik heb dit project gebouwd met Claude Code als pair programmer. De componenten heb ik zelf geschreven; Claude schreef de tests (test-first), reviewde mijn code en zette CI, deploy en een eerste versie van deze README op. Bij de kaart schreef Claude ook de componenten, na mijn akkoord op de aanpak per stap. Elke keuze en elke commit heb ik zelf beoordeeld, en de toegankelijkheid heb ik zelf met toetsenbord en VoiceOver gecontroleerd.

## Bronnen en licentie

- Adresgegevens: BAG via [PDOK Locatieserver](https://www.pdok.nl/), CC0 1.0.
- Kaart: BRT Achtergrondkaart van het Kadaster via [PDOK](https://www.pdok.nl/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.nl).
- Lettertype: [Open Sans](https://github.com/googlefonts/opensans), SIL Open Font License 1.1, zie [src/fonts/OFL.txt](src/fonts/OFL.txt).
- Code: MIT, zie [LICENSE](LICENSE).
