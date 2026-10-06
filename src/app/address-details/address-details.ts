import { Component, input } from '@angular/core';
import { Address } from '@app/pdok/lookup';

const UNKNOWN = 'Onbekend';
const LOOKUP_ERROR = 'De details van dit adres konden niet worden opgehaald. Probeer het opnieuw.';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.html',
  styleUrl: './address-details.css',
})
export class AddressDetails {
  /** The chosen address, once looked up. */
  readonly address = input<Address>();
  /** Whether looking up the chosen address failed. */
  readonly failed = input(false);

  protected readonly unknown = UNKNOWN;
  protected readonly lookupError = LOOKUP_ERROR;
}
