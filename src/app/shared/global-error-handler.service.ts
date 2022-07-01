import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor() {}

  handleError(error: Error | HttpErrorResponse) {
    console.log('GlobalErrorHandlerService');
    console.error(error);
    // const statusCode = error.status;
    // const body = error;
    // const errorE = {
    //   statusCode: statusCode,
    //   error: body.error,
    //   message: body.error.message,
    // };
    return throwError(error);
  }
}
