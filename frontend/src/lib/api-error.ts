export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}