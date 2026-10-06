import { httpResource } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { lookupRequest, parseAddress } from '@app/pdok/lookup';

const UNKNOWN = 'Onbekend';
const LOOKUP_ERROR = 'De details van dit adres konden niet worden opgehaald. Probeer het opnieuw.';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.html',
  styleUrl: './address-details.css',
})
export class AddressDetails {
  /** The PDOK id of the address to show. */
  readonly id = input.required<string>();

  protected readonly unknown = UNKNOWN;
  protected readonly lookupError = LOOKUP_ERROR;
  protected readonly address = httpResource(() => lookupRequest(this.id()), {
    parse: parseAddress,
  });
}
