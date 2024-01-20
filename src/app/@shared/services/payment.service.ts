import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PaymentIntent } from "@stripe/stripe-js";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private baseUrl = environment.serverUrl;
  constructor(private http: HttpClient) {}

  createPaymentIntent(metadata): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.baseUrl}stripe/create-payment-intent`,
      // `${environment.API_URL}stripe/create-payment-intent`,
      metadata 
    );
  }

  purchasePlans(plandata): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.baseUrl}plans/purchase-plans`, plandata 
    );
  }

  updatePlans(plandata): Observable<PaymentIntent> {
    return this.http.put<PaymentIntent>(
      `${this.baseUrl}plans/update-plan`, plandata 
    );
  }

  getAppointmentCards(): Observable<any> {
    return this.http.get(`${this.baseUrl}plans`);
  }
}
