import { GlobalEnvironment } from '@global/interfaces/global-environment.interface';

/**
 * Environment configuration for the production environment.
 * 
 * This object contains settings that determine the behavior of the 
 * application in a production context. The `production` property indicates 
 * that the application is running in production mode, while the `debug` 
 * property controls whether debugging features are enabled. 
 * 
 * Note: Although this is a production environment, enabling debugging may 
 * expose sensitive information and should be used with caution.
 */
export const environment: GlobalEnvironment = {
  production: true, // Indicates that the application is in production mode
  debug: true,      // Enables debugging features for troubleshooting; use cautiously
};

