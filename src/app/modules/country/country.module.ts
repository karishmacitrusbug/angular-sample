import { ModuleWithProviders, NgModule } from '@angular/core';
import { COUNTRY_SERVICE_TOKEN } from '@global/modules/country/tokens/country-service.token';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { CountryEffects } from './effects/country.effects';
import * as fromCountry from './reducers';
import { CountryService } from './services/country.service';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    StoreModule.forFeature(fromCountry.countryFeatureKey, fromCountry.reducers),
    EffectsModule.forFeature([CountryEffects]),
  ],
})
export class CountryModule {
  public static forRoot(): ModuleWithProviders<CountryModule> {
    return {
      ngModule: CountryModule,
      providers: [
        {
          provide: COUNTRY_SERVICE_TOKEN,
          useClass: CountryService,
        },
      ],
    };
  }
}
