import { Injectable } from '@angular/core';
import { BaseCountryService } from '@global/modules/country/base-classes/base-country.service';
import * as CountryActions from '@modules/country/actions/country.actions';
import * as fromCountry from '@modules/country/reducers';
import { Store } from '@ngrx/store';
import { Country } from '@CitT/data';
import { Observable } from 'rxjs';
import { first, map, switchMap, takeWhile } from 'rxjs/operators';

@Injectable()
export class CountryService extends BaseCountryService {
  constructor(private readonly store$: Store<fromCountry.AppState>) {
    super();
  }

  public getAllCountries$(): Observable<Country[]> {
    this.store$.dispatch(CountryActions.getAll());

    return this.store$.select(fromCountry.selectAllCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      switchMap(() => this.store$.select(fromCountry.selectAllCountriesData).pipe(first((countries) => countries.length > 0)))
    );
  }

  public getDestinationCountries$(): Observable<Country[]> {
    this.store$.dispatch(CountryActions.getAll());

    return this.store$.select(fromCountry.selectDestinationCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      switchMap(() => this.store$.select(fromCountry.selectDestinationCountriesData).pipe(first((countries) => countries.length > 0)))
    );
  }

  public isVatRegistrationRequiredForDestinationCountry$(countryName: string): Observable<boolean> {
    this.store$.dispatch(CountryActions.getDestination());

    return this.store$.select(fromCountry.selectDestinationCountriesLoading).pipe(
      takeWhile((isLoading) => isLoading, true),
      switchMap(() => this.store$.select(fromCountry.selectDestinationCountriesData).pipe(first((countries) => countries.length > 0))),
      map((countries) => countries.find((country) => country.value === countryName)?.VATRegistrationrequired)
    );
  }
}
