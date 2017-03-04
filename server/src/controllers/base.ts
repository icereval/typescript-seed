import * as Hapi from 'hapi';
import * as Boom from 'boom';
import logger from '../logging';


export interface IHttpResponse {
    data: any;
    code?: number;
    headers?: Map<string, string>;
    handler(reply: Hapi.IReply): Hapi.Response
}

export class HttpResponse implements IHttpResponse {
    public data: any = null;
    public code = 200;
    public headers = new Map<string, string>();

    constructor(data?: any, code?: number, headers?: Map<string, string>) {
        this.data = data || this.data;
        this.code = code || this.code;
        this.headers = headers || this.headers;
    }

    handler(reply: Hapi.IReply): Hapi.Response {
        const response = reply(this.data);

        if (this.code !== undefined) {
            response.code(this.code);
        }

        for (const [key, value] of this.headers) {
            response.header(key, value);
        }

        return response;
    }
}

export class HttpResponseRedirect extends HttpResponse {
    public uri: string;

    constructor(uri: any) {
        super();
        this.uri = uri;
    }

    handler(reply: Hapi.IReply): Hapi.Response {
        return reply.redirect(this.uri);
    }
}

export class JsonResponse extends HttpResponse {}

export abstract class Controller {
    protected request: Hapi.Request;
    protected reply: Hapi.IReply;

    constructor(request: Hapi.Request, reply: Hapi.IReply) {
        this.request = request;
        this.reply = reply;
    }

    private isBoomError(arg: any): arg is Boom.BoomError {
        return arg.isBoom !== undefined;
    }

    private responseHandler(response: IHttpResponse): void {
        response.handler(this.reply);
    }

    private errorHandler(e: Error): void {
        if (this.isBoomError(e)) {
            logger.debug(e.message, { name: e.name });
            this.reply(e);
        } else {
            logger.error(e.message, { name: e.name, stack: e.stack });
            this.reply(Boom.wrap(e));
        }
    }

    protected handleInternal(): void {
        let promise: Promise<IHttpResponse>;
        const method = this.request.method;

        if (method === 'delete') {
            promise = this.delete();
        } else if (method === 'get') {
            promise = this.get();
        } else if (method === 'patch') {
            promise = this.patch();
        } else if (method === 'post') {
            promise = this.post();
        } else if (method === 'put') {
            promise = this.put();
        } else {
            this.reply(Boom.notImplemented());
            return;
        }

        promise.then(this.responseHandler.bind(this)).catch(this.errorHandler.bind(this));
    }

    protected async delete(): Promise<IHttpResponse> {
        throw Boom.notImplemented();
    }

    protected async get(): Promise<IHttpResponse> {
        throw Boom.notImplemented();
    }

    protected async patch(): Promise<IHttpResponse> {
        throw Boom.notImplemented();
    }

    protected async post(): Promise<IHttpResponse> {
        throw Boom.notImplemented();
    }

    protected async put(): Promise<IHttpResponse> {
        throw Boom.notImplemented();
    }
}
