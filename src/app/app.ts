import { Component, signal } from '@angular/core';
import { AddressDetails } from './address-details/address-details';
import { AddressSearch } from './address-search/address-search';

@Component({
  selector: 'app-root',
  imports: [AddressDetails, AddressSearch],
  templateUrl: './app.html',
})
export class App {
  protected readonly selectedId = signal<string | undefined>(undefined);
}
