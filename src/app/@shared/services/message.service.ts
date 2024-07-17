import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class MessageService {
    chatList: any[] = [];
    private baseUrl = environment.serverUrl + 'messages';

    constructor(private http: HttpClient) { }

    getMessages(obj: any): Observable<any> {
        return this.http.post(`${this.baseUrl}`, obj);
    }

    getRoomProfileList(searchText, id): Observable<object> {
      return this.http.get(
        `${this.baseUrl}/get-members/${id}?searchText=${searchText}`
      );
    }

    getGroupById(id: any): Observable<any> {
      return this.http.get(`${this.baseUrl}/get-group/${id}`);
    }

    getRoomById(id: any): Observable<any> {
      return this.http.get(`${this.baseUrl}/get-room/${id}`);
    }

    getMessageMedia(data: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/get-media/`, data);
    }
}