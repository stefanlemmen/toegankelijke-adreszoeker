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

const TILE_SIZE = 256;

interface Tile {
  light: string;
  dark: string;
}

/** Where `point` lies in the Web Mercator tile grid, in tiles (the OpenStreetMap tile formula). */
function positionOf({ lon, lat }: Point, zoom: number): { x: number; y: number } {
  const tiles = 2 ** zoom;
  const latitude = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latitude) + 1 / Math.cos(latitude)) / Math.PI) / 2;
  return { x: ((lon + 180) / 360) * tiles, y: y * tiles };
}

/**
 * The grid of tiles around `centre`, row by row, and the shift that puts `centre`
 * on the grid's top-left corner; the CSS then moves that corner to the middle of the map.
 */
function tilesAround(centre: Point, zoom: number): { tiles: Tile[]; translate: string } {
  const { x, y } = positionOf(centre, zoom);
  const firstColumn = Math.floor(x) - Math.floor(COLUMNS / 2);
  const firstRow = Math.floor(y) - Math.floor(ROWS / 2);
  const tiles = Array.from({ length: COLUMNS * ROWS }, (_, index) => {
    const path = `EPSG:3857/${zoom}/${firstColumn + (index % COLUMNS)}/${firstRow + Math.floor(index / COLUMNS)}.png`;
    return {
      light: `${TILES_URL}/${LIGHT_LAYER}/${path}`,
      dark: `${TILES_URL}/${DARK_LAYER}/${path}`,
    };
  });
  const translate = `${-(x - firstColumn) * TILE_SIZE}px ${-(y - firstRow) * TILE_SIZE}px`;
  return { tiles, translate };
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
  protected readonly tileSize = TILE_SIZE;

  protected readonly map = computed(() => {
    const address = this.address();
    return address
      ? tilesAround(address.centroide_ll, ADDRESS_ZOOM)
      : tilesAround(NETHERLANDS, OVERVIEW_ZOOM);
  });
}
