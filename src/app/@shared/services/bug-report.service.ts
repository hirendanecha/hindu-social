import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BugReportService {
  private baseUrl = environment.serverUrl;
  constructor(private http: HttpClient) {}

  reportAbug(data: any): Observable<Object> {
    return this.http.post(`${this.baseUrl}bugs-reports/add-bugs`, data);
  }

  supportContact(data: any): Observable<Object> {
    return this.http.post(`${this.baseUrl}bugs-reports/support-contact`, data);
  }
}
