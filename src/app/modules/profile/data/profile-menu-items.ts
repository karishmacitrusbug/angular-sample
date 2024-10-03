import { ProfileRouteSegment } from '@global/enums/profile-route-segment.enum';
import { RouteSegment } from '@global/enums/route-segment.enum';

export const profileLink = {
  title: 'PROFILE_MENU.PROFILE_AND_NOTIFICATIONS',
  link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.ProfileAndNotifications],
  icon: 'profile',
};

export const logOutLink = {
  title: 'COMMON.LOG_OUT',
  link: [RouteSegment.Root, RouteSegment.Logout],
  icon: 'log-out',
};

export const settingsMenuItems = [
  {
    title: 'PROFILE_MENU.MY_TEAM',
    link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.MyTeam],
    icon: 'team',
  },
  {
    title: 'PROFILE_MENU.PRODUCT_LISTING',
    link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.ProductListing],
    icon: 'product-catalog',
  },
  {
    title: 'PROFILE_MENU.LOCAL_VAT_REGISTRATIONS',
    link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.LocalVatRegistrations],
    icon: 'consignees',
  },
  {
    title: 'PROFILE_MENU.QUOTE_DEFAULTS',
    link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.QuoteDefaults],
    icon: 'quote-details',
  },
  {
    title: 'PROFILE_MENU.ADDRESS_BOOK',
    link: [RouteSegment.Root, RouteSegment.Profile, ProfileRouteSegment.AddressBook],
    icon: 'address',
  },
  profileLink,
];

export const profileMenuItems = [...settingsMenuItems, logOutLink];
