import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { CountryValidationEffects } from './effects/country-validation.effects';
import * as fromCountryValidation from './reducers';

@NgModule({
  imports: [
    SharedModule,
    StoreModule.forFeature(fromCountryValidation.countryValidationFeatureKey, fromCountryValidation.reducers),
    EffectsModule.forFeature([CountryValidationEffects]),
  ],
})
export class CountryValidationModule {}
