import { GlobalEnvironment } from '@global/interfaces/global-environment.interface';

/**
 * Environment configuration for the production environment.
 * 
 * This object contains settings that determine the behavior of the 
 * application in a production context. The `production` property indicates 
 * that the application is running in production mode, while the `debug` 
 * property controls whether debugging features are enabled or disabled.
 */
export const environment: GlobalEnvironment = {
  production: true, // Indicates that the application is in production mode
  debug: false,     // Disables debugging features for improved performance and security
};
