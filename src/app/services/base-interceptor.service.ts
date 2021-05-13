import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import { Router } from '@angular/router';
import {Observable, throwError} from 'rxjs';
import {AuthenticationService} from './authentication.service';

const baseUrl = environment.baseUrl;
const version = environment.version;

@Injectable()
export class BaseHttpInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const stopAddingDefURL = req.headers.get('stopAddingDefURL') === 'true';
    let authReq: HttpRequest<any>;
    const accessToken: string | null = this.getAuthentication();
    const isLoadNotReq = req.headers.get('isLoadNotReq') === 'true';

    authReq = this.addHeaders(req, accessToken, stopAddingDefURL, isLoadNotReq);
    if (isLoadNotReq) {
      this.hideLoader();
    } else {
      this.startLoader();
    }
    return next.handle(authReq).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.hideLoader();
          }
        },
        (err) => {
         throwError(err);
        }
      )
    );
  }

  private startLoader(): void {
    // loader on
  }

  private hideLoader(): void {
    // loader off
  }

  private getAuthentication(): string | null {
    return this.authService.getAccessToken();
  }

  addHeaders(req: HttpRequest<any>, accessToken: string | null, stopAddingDefURL: boolean, isLoadNotReq: boolean): HttpRequest<any> {
      return req.clone({
        headers: req.headers
          .set('Cache-Control', 'no-cache,no-store')
          .set('Pragma', 'no-cache')
          .delete(isLoadNotReq ? 'isLoadNotReq' : ''),
        url: stopAddingDefURL ? req.url : `${baseUrl}` + req.url
      });
  }

}
