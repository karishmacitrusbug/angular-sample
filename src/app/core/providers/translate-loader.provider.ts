import { HttpClient } from '@angular/common/http';
import { FactoryProvider } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * Function to create a TranslateHttpLoader instance.
 * 
 * This function creates and returns an instance of `TranslateHttpLoader`, which is used to load translation files from a specified path.
 * The loader fetches translation JSON files for different languages from the `assets/i18n/` directory.
 *
 * @param {HttpClient} http - The Angular `HttpClient` used for making HTTP requests to load the translation files.
 * @returns {TranslateHttpLoader} - An instance of `TranslateHttpLoader` configured to load translation files.
 */
export function translateLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

/**
 * Factory provider for the TranslateLoader.
 * 
 * This object configures the `TranslateLoader` provider using a factory pattern. It specifies how to construct
 * the `TranslateLoader` by invoking the `translateLoaderFactory` function and passing in the `HttpClient` dependency.
 * 
 * - provide: The `TranslateLoader` token, which specifies that this provider is responsible for creating instances of the `TranslateLoader`.
 * - useFactory: The factory function (`translateLoaderFactory`) that generates the `TranslateLoader` instance.
 * - deps: The dependencies required by the factory function, in this case, the `HttpClient`.
 */

export const translateLoaderProvider: FactoryProvider = {
  provide: TranslateLoader,
  useFactory: translateLoaderFactory,
  deps: [HttpClient],
};
