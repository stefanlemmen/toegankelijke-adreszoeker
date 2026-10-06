import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { lookupRequest, parseAddress } from '@app/pdok/lookup';
import { AddressDetails } from './address-details/address-details';
import { AddressSearch } from './address-search/address-search';

export const REPO_URL = 'https://github.com/stefanlemmen/toegankelijke-adreszoeker';

@Component({
  selector: 'app-root',
  imports: [AddressDetails, AddressSearch],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly repoUrl = REPO_URL;
  protected readonly selectedId = signal<string | undefined>(undefined);

  // One lookup for both the details and the map.
  private readonly lookup = httpResource(() => lookupRequest(this.selectedId()), {
    parse: parseAddress,
  });
  // `value()` throws in the error state.
  protected readonly address = computed(() =>
    this.lookup.hasValue() ? this.lookup.value() : undefined,
  );
  protected readonly lookupFailed = computed(() => this.lookup.error() !== undefined);
}
