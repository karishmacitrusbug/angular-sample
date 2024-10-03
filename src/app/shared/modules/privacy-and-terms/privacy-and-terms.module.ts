import { ModuleWithProviders, NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TermsAndPrivacyPolicyDialogComponent } from './components/terms-and-privacy-policy-dialog/terms-and-privacy-policy-dialog.component';
import { PrivacyAndTermsDialogService } from './services/privacy-and-terms-dialog.service';

/**
 * Angular module for managing the Terms and Privacy Policy dialog.
 *
 * This module encapsulates the TermsAndPrivacyPolicyDialogComponent and provides
 * the PrivacyAndTermsDialogService for opening the dialog. It imports the
 * SharedModule, making shared components, directives, and pipes available to
 * the Terms and Privacy Policy feature.
 */
@NgModule({
  imports: [SharedModule],
  declarations: [TermsAndPrivacyPolicyDialogComponent],
  exports: [TermsAndPrivacyPolicyDialogComponent],
})
export class PrivacyAndTermsModule {
  /**
   * Provides the PrivacyAndTermsModule as a feature module with its own
   * providers.
   *
   * @returns {ModuleWithProviders<PrivacyAndTermsModule>} A configuration
   * object that includes the PrivacyAndTermsModule and its providers,
   * allowing for the injection of the PrivacyAndTermsDialogService in
   * components that require it.
   */
  public static forFeature(): ModuleWithProviders<PrivacyAndTermsModule> {
    return {
      ngModule: PrivacyAndTermsModule,
      providers: [PrivacyAndTermsDialogService],
    };
  }
}
