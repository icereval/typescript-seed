import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as TypeOrm from 'typeorm';
import { Controller, IHttpResponse, HttpResponseRedirect, JsonResponse } from './base';
import Session from '../models/entity/session';
import User from '../models/entity/user';
import logger from '../logging';
import config from '../config';


export class AuthLoginController extends Controller {

    static handler(request: Hapi.Request, reply: Hapi.IReply): void {
        new AuthLoginController(request, reply).handleInternal();
    }

    protected async post(): Promise<IHttpResponse> {
        const username = this.request.params['username'];
        const password = this.request.params['password'];

        let user: User;
        try {
            user = await User.verify(username, password);
        } catch (e) {
            throw Boom.unauthorized();
        }

        if (!user.active) {
            throw Boom.unauthorized();
        }

        const session = await Session.create(user);
        this.request['cookieAuth'].set({ id: session.id });

        return new JsonResponse({
            id: user.id,
            fullname: user.fullname,
            active: user.active,
        });
    }
}

export class AuthLogoutController extends Controller {

    static handler(request: Hapi.Request, reply: Hapi.IReply): void {
        new AuthLogoutController(request, reply).handleInternal();
    }

    protected async delete(): Promise<IHttpResponse> {
        // TODO: cleanup session data
        this.request['cookieAuth'].clear();
        return new JsonResponse({ success: true });
    }
}

export class AuthSignUpController extends Controller {

    static handler(request: Hapi.Request, reply: Hapi.IReply): void {
        new AuthSignUpController(request, reply).handleInternal();
    }

    protected async post(): Promise<IHttpResponse> {
        const user = await User.create(<User>{
            username: this.request.params['username'],
            password: this.request.params['password'],
            fullname: this.request.params['fullname'],
        });

        const session = await Session.create(user);
        this.request['cookieAuth'].set({ id: session.id });

        return new JsonResponse({
            id: user.id,
            fullname: user.fullname,
            active: user.active,
        });
    }
}
