import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UserModel} from '../../../models/user.model';
import {END_POINTS} from '../../../endpoints';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<UserModel[]>{
   return this.http.get(END_POINTS.getUsers) as Observable<UserModel[]>;
  }
}
