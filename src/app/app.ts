import { Component, signal } from '@angular/core';
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
}
