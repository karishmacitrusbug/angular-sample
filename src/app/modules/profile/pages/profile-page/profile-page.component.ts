import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@global/services/auth.service';
import { profileMenuItems } from '@modules/profile/data/profile-menu-items';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  public profileMenuItems = profileMenuItems;
  public profileName$: Observable<string> = this.authService.getUser$().pipe(map((user) => user.name));

  constructor(private readonly authService: AuthService) {}
}
