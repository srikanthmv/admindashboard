import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginFg: FormGroup | undefined;
  hide = true;
  constructor(private formBuilder: FormBuilder,
              private router: Router, private authenticationService: AuthenticationService) {
    this.loginFg = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get emailId(): FormControl {
    return this.loginFg?.get('emailId') as FormControl;
  }

  get password(): FormControl {
    return this.loginFg?.get('password') as FormControl;
  }

  ngOnInit(): void {
    if (this.authenticationService.isUserAuthenticated()) {
      this.router.navigate(['/admin/dashboard']).then();
    }
  }

  loginAsAdmin(): void {
    if (this.loginFg?.valid) {
      const loginDetails = this.loginFg.value;
      if (loginDetails.emailId === environment.adminLogin.email &&
          loginDetails.password === environment.adminLogin.password) {
        localStorage.setItem('$token', this.createGuid());
        this.router.navigate(['/admin/dashboard']).then();
      }
    } else {
      this.loginFg?.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.loginFg?.reset();
  }

  createGuid(): string {
    function S4(): string {
      // tslint:disable-next-line:no-bitwise
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

}
