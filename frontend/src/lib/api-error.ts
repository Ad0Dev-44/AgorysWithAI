export class ApiClientError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);

    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}