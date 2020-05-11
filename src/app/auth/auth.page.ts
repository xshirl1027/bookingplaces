import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';

import { AuthService, AuthResponseData } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  @ViewChild('f', { static: false }) form: NgForm;
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}
  private showAlert(header:string, message: string) {
    this.alertCtrl.create({header: header, message: message, buttons: ['okay']})
    .then((ctrl) => {
      ctrl.present();
    });
  }

  onLogin(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        console.log(this.isLogin);
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe((resData) => {
          this.isLoading = false;
          loadingEl.dismiss();
          if (this.isLogin) {
            this.router.navigateByUrl('/places/tabs/discover');
          } else {
            let header = 'Sign up Successful';
            let message = 'Back to login page';
            this.showAlert(header, message);
            this.isLogin = !this.isLogin;
          }
        }, error => {
          let header = "Authentication failed";
          loadingEl.dismiss();
          const code = error.error.error.message;
          let message = 'could not sign up, please try again';
          console.log(code);
          if (code === 'EMAIL_EXISTS') {
            message = 'this email already exists';
          }
          if (code === 'EMAIL_NOT_FOUND') {
            message = 'this email has not been registered';
          }
          if (code === 'INVALID_PASSWORD') {
            message = 'this password is invalid';
          }
          this.showAlert(header, message);
        });
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.onLogin(email, password);
  }
}
