import { NgModule } from '@angular/core';
import { environment } from '@env/environment';
import { Language } from '@global/enums/language.enum';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateCompiler, TranslateModule } from '@ngx-translate/core';
import { ROOT_REDUCERS } from 'app/reducers';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { translateLoaderProvider } from './providers/translate-loader.provider';

/**
 * AppModule Configuration
 *
 * This NgModule configures the main imports for the application, including translation support,
 * state management, and dev tools. It integrates the necessary modules for i18n, NgRx state management,
 * and effects handling, with specific configuration options for different environments (e.g., production vs. development).
 *
 * @NgModule
 */

@NgModule({
  declarations: [], // No components, directives, or pipes declared in this module.

  imports: [
    /**
     * TranslateModule: Provides internationalization (i18n) functionality.
     * Configures translation options including the default language, translation loader, and compiler.
     *
     * - defaultLanguage: English is set as the default language.
     * - loader: Defines how translation files are loaded, using a custom provider.
     * - compiler: Configures a custom compiler (TranslateMessageFormatCompiler) for handling message formatting in translations.
     */
    TranslateModule.forRoot({
      defaultLanguage: Language.English,
      loader: translateLoaderProvider,
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler,
      },
    }),

    /**
     * StoreModule: Sets up NgRx Store for managing the application's state.
     *
     * - forRoot: Configures the root state with `ROOT_REDUCERS`, initializing the global state.
     * - runtimeChecks: Strict checks are enabled for ensuring proper serializability and NgZone actions.
     *   - strictStateSerializability: Ensures the state is serializable.
     *   - strictActionSerializability: Ensures actions are serializable.
     *   - strictActionWithinNgZone: Ensures actions are dispatched within Angular's NgZone.
     */
    StoreModule.forRoot(ROOT_REDUCERS, {
      runtimeChecks: {
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
      },
    }),

    /**
     * StoreRouterConnectingModule: Connects the Angular router to the NgRx store, enabling router state management.
     */
    StoreRouterConnectingModule.forRoot(),

    /**
     * StoreDevtoolsModule: Adds support for Redux DevTools in development mode.
     * In production mode, the dev tools are disabled for performance optimization.
     */
    environment.production ? [] : StoreDevtoolsModule.instrument(),

    /**
     * EffectsModule: Sets up the root effects for handling side effects in the application.
     * Effects listen for dispatched actions and can trigger asynchronous operations.
     */
    EffectsModule.forRoot(),
  ],
})
export class CoreModule {}
