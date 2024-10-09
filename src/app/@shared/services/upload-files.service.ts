import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadFilesService {
  private baseUrl = environment.serverUrl + 'utils';

  constructor(private http: HttpClient) { }

  upload(file: File, id: any, defaultType: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('folder', defaultType);
    formData.append('file', file);
    formData.append('id', id);
    formData.append('default', defaultType);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  getProfilePic(id): Observable<any> {
    return this.http.get(`${this.baseUrl}/files/profile/${id}`);
  }

  getCoverPic(id): Observable<any> {
    return this.http.get(`${this.baseUrl}/files/profile-cover/${id}`);
  }

  uploadFile(
    files: File,
    params?: any
  ): Observable<HttpEvent<any>> {
    const url = `${environment.serverUrl}utils/image-upload`;
    const formData: FormData = new FormData();
    formData.append('file', files);
    let queryParams = new HttpParams();
    if (params) { Object.keys(params).forEach(key => {
      if (params[key]) {queryParams = queryParams.append(key, params[key])}
    });
  }
  const reqUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    const req =
      new HttpRequest(
        'POST',
        reqUrl,
        formData,
        {
          reportProgress: true,
          responseType: 'json',
        }
      );
    return this.http.request(req);
  }
}
