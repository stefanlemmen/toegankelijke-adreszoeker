import { Component, computed, input } from '@angular/core';
import { Address, Point } from '@app/pdok/lookup';

const TILES_URL = 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0';
const LIGHT_LAYER = 'standaard';
const DARK_LAYER = 'grijs';
const COLUMNS = 9;
const ROWS = 7;
const ADDRESS_ZOOM = 17;
const OVERVIEW_ZOOM = 8;
// Amersfoort, roughly the centre of the Netherlands.
const NETHERLANDS: Point = { lon: 5.387, lat: 52.155 };

interface Tile {
  light: string;
  dark: string;
}

/** The Web Mercator tile that contains `point` (the OpenStreetMap tile formula). */
function tileAt({ lon, lat }: Point, zoom: number): { column: number; row: number } {
  const tiles = 2 ** zoom;
  const latitude = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latitude) + 1 / Math.cos(latitude)) / Math.PI) / 2;
  return {
    column: Math.floor(((lon + 180) / 360) * tiles),
    row: Math.floor(y * tiles),
  };
}

/** The grid of tiles around `centre`, row by row. */
function tilesAround(centre: Point, zoom: number): Tile[] {
  const { column, row } = tileAt(centre, zoom);
  const firstColumn = column - Math.floor(COLUMNS / 2);
  const firstRow = row - Math.floor(ROWS / 2);
  return Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const path = `EPSG:3857/${zoom}/${firstColumn + (index % COLUMNS)}/${firstRow + Math.floor(index / COLUMNS)}.png`;
    return {
      light: `${TILES_URL}/${LIGHT_LAYER}/${path}`,
      dark: `${TILES_URL}/${DARK_LAYER}/${path}`,
    };
  });
}

@Component({
  selector: 'app-address-map',
  templateUrl: './address-map.html',
  styleUrl: './address-map.css',
})
export class AddressMap {
  /** The chosen address, once looked up; until then a map of the Netherlands. */
  readonly address = input<Address>();

  protected readonly columns = COLUMNS;

  protected readonly tiles = computed(() => {
    const address = this.address();
    return address
      ? tilesAround(address.centroide_ll, ADDRESS_ZOOM)
      : tilesAround(NETHERLANDS, OVERVIEW_ZOOM);
  });
}
