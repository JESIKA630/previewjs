import {
  Endpoint,
  RequestOf,
  ResponseOf,
  WrappedResponse,
} from "@previewjs/api";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

export class ApiRouter {
  private handlers = new Map<string, RequestHandler<any, any>>();

  async handle(
    path: string,
    request: unknown,
    expressRequest: ExpressRequest,
    expressResponse: ExpressResponse
  ): Promise<WrappedResponse<unknown>> {
    const handler = this.handlers.get(path);
    if (!handler) {
      return {
        kind: "error",
        message: `No handler is registered for path '${path}'`,
      };
    }
    try {
      const response = await handler(request, expressRequest, expressResponse);
      return {
        kind: "success",
        response,
      };
    } catch (e: any) {
      console.warn(e);
      return {
        kind: "error",
        message: e.message,
      };
    }
  }

  onRequest<E extends Endpoint<any, any>>(
    endpoint: E,
    handler: RequestHandler<RequestOf<E>, ResponseOf<E>>
  ) {
    if (this.handlers.has(endpoint.path)) {
      throw new Error(
        `Multiple handlers registered for endpoint '${endpoint.path}'`
      );
    }
    this.handlers.set(endpoint.path, handler);
  }
}

export type RequestHandlerForEndpoint<E> = E extends Endpoint<
  infer Request,
  infer Response
>
  ? RequestHandler<Request, Response>
  : never;

export type RequestHandler<Request, Response> = (
  request: Request,
  expressRequest: ExpressRequest,
  expressResponse: ExpressResponse
) => Promise<Response>;
