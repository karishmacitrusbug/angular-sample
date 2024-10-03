import { ChangeDetectionStrategy, Component } from '@angular/core';
import { helpMenuItem } from '@global/constants/global.constants';
import { RouteSegment } from '@global/enums/route-segment.enum';
import {
  logOutLink,
  profileLink,
  profileMenuItems,
  settingsMenuItems,
} from '@modules/profile/data/profile-menu-items';
import { navMenuItems } from '@shared/constants/app.constants';
import { VERSION } from '../../../version';

/**
 * PageLayoutComponent
 *
 * This component is responsible for rendering the layout of the application's page, including
 * navigation menus, profile links, settings, and the application logo.
 * It defines multiple properties used for constructing various parts of the UI, such as menus and links.
 *
 * @class PageLayoutComponent
 */

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {
  /** The version of the application, displayed in the layout footer or header. */
  public readonly version = VERSION;

  /** Array of items for the settings menu, used to display available user settings options. */
  public readonly settingsMenuItems = settingsMenuItems;

  /** Array of items for the profile menu, used to display available profile-related actions. */
  public readonly profileMenuItems = profileMenuItems;

  /** Link used for logging the user out, possibly attached to a logout button or menu item. */
  public readonly logOutLink = logOutLink;

  /** Link to the user's profile, displayed in the navigation or profile section. */
  public readonly profileLink = profileLink;

  /** Array of items for the main navigation menu, used for application-wide navigation. */
  public readonly menuItems = navMenuItems;

  /** Item for the help section of the menu, used to direct users to help resources. */
  public readonly helpMenuItem = helpMenuItem;

  /** Object containing properties for the application logo, including its image path, navigation link, and alt text. */
  public readonly logo = {
    logo: 'assets/icons/logo.svg',
    link: [RouteSegment.Dashboard], // Navigates to the dashboard when the logo is clicked.
    alt: 'CB client portal', // Alt text describing the logo.
  };
}
