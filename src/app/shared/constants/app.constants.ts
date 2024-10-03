import { RouteSegment } from '@global/enums/route-segment.enum';

/**
 * The fallback image URL for the user's profile picture if no image is available.
 * This is used to ensure that a default profile picture is displayed if a user hasn't set one.
 */
export const profilePictureFallback = 'assets/images/profile-picture-fallback.png';

/**
 * Default store fee percentage applied in the system.
 * This value is used to calculate store fees in various operations where applicable.
 */
export const defaultStoreFeePercentage = 30;

/**
 * Navigation Menu Items
 * 
 * An array of navigation items used in the application's sidebar or main navigation menu. Each item includes:
 * 
 * - `link`: An array containing the route segment to which the menu item links.
 * - `exact`: A boolean indicating whether the route match should be exact.
 * - `icon`: The name of the icon displayed next to the menu item.
 * - `title`: A translation key for the menu item's title.
 */
export const navMenuItems = [
  {
    /** Links to the Dashboard route. */
    link: [RouteSegment.Dashboard],
    exact: true,
    icon: 'dashboard',
    title: 'NAVIGATION.DASHBOARD',  // Translation key for "Dashboard".
  },
  {
    /** Links to the Quote List, allowing users to view and manage their quotes. */
    link: [RouteSegment.QuoteList],
    exact: false,
    icon: 'quote-new',
    title: 'NAVIGATION.QUOTES',  // Translation key for "Quotes".
  },
  {
    /** Links to the Shipments List, where users can manage their shipments. */
    link: [RouteSegment.ShipmentsList],
    exact: false,
    icon: 'list',
    title: 'NAVIGATION.SHIPMENTS',  // Translation key for "Shipments".
  },
  {
    /** Links to the Tracking page, where users can track their shipments. */
    link: [RouteSegment.Tracking],
    exact: true,
    icon: 'plane-take-off',
    title: 'NAVIGATION.TRACKING',  // Translation key for "Tracking".
  },
  {
    /** Links to the Invoices page, where users can view their invoices. */
    link: [RouteSegment.Invoices],
    exact: true,
    icon: 'quotes',
    title: 'NAVIGATION.INVOICES',  // Translation key for "Invoices".
  },
  {
    /** Links to the Insights page, where users can view analytics and insights. */
    link: [RouteSegment.Insights],
    exact: true,
    icon: 'insights',
    title: 'NAVIGATION.INSIGHTS',  // Translation key for "Insights".
  },
  {
    /** Links to the Messages page, where users can view and send messages. */
    link: [RouteSegment.Messages],
    exact: true,
    icon: 'messages',
    title: 'NAVIGATION.MESSAGES',  // Translation key for "Messages".
  },
];
