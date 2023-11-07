import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        })
      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');

    const token = localStorage.getItem('authorization_token');
    const headers = new HttpHeaders();
    if (token) {
      headers.set('Authorization', `Basic ${token}`);
    }

    return this.http
      .get<string>(url, {
        params: {
          name: fileName,
        },
        headers,
      })
      .pipe(
        // eslint-disable-next-line rxjs/no-implicit-any-catch
        catchError((errorData: HttpErrorResponse) => {
          const { error, status } = errorData;
          if (error.status === 401 || error.status === 403) {
            alert(`Status: ${status}. Message: ${error.message}`);
          }
          return throwError(() => errorData);
        })
      );
  }
}
