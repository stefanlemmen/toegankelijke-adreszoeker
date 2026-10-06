import { Component, input } from '@angular/core';
import { Address } from '@app/pdok/lookup';

@Component({
  selector: 'app-address-map',
  templateUrl: './address-map.html',
})
export class AddressMap {
  /** The chosen address, once looked up. */
  readonly address = input<Address>();
}
