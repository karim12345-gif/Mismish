export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = message
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, ""),
  ) {
    super(message);
    this.name = "AppError";
  }
}
