import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { citrContactEmail } from '@global/constants/global.constants';

@Component({
  selector: 'app-registration-success',
  templateUrl: './registration-success.component.html',
  styleUrls: ['./registration-success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationSuccessComponent {
  public email: string;
  public contactUsLink = `mailto:${citrContactEmail}`;

  constructor(public router: Router) {
    this.email = this.router.getCurrentNavigation().extras.state.email;
  }
}
