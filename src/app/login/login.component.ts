import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../shared/api/api.service';
import { AuthService } from '../shared/auth/auth.service';

import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/contacts']);
    }
  }

  onSubmit(form: NgForm) {
    const values = form.value;

    const payload = {
      username: values.username,
      password: values.password
    };

    this.auth.login(payload)
    .pipe(first())
    .subscribe({
      next: (data) => {
        // get return url from route parameters or default to '/'
        this.auth.setToken(data.token);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        // this.router.navigate(['/contacts']);
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        console.log(err);
      }
  })

  }

}
