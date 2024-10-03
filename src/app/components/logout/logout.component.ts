import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '@global/services/auth.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutComponent implements OnInit {
  /**
   * Constructor injects AuthService as a dependency.
   *
   * @param {AuthService} authService - Service responsible for handling authentication and logout logic.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Lifecycle hook that is called after the component's data-bound properties are initialized.
   * This method automatically invokes the logout function to log the user out when the component is initialized.
   *
   * @method ngOnInit
   * @returns {void}
   */

  public ngOnInit(): void {
    this.authService.logout();
  }
}
