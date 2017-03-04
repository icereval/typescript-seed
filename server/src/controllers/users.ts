import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as TypeOrm from 'typeorm';
import { Controller, IHttpResponse, JsonResponse } from './base';
import Session from '../models/entity/session';
import User from '../models/entity/user';
import logger from '../logging';


export class UsersController extends Controller {

    static handler(request: Hapi.Request, reply: Hapi.IReply): void {
        new UsersController(request, reply).handleInternal();
    }

    protected async get(): Promise<IHttpResponse> {
        const id = this.request.params['id'];

        const repo = TypeOrm.getConnection().getRepository(User);
        const user = await repo.findOne({ id: id, active: true });
        if (!user) {
            throw Boom.notFound();
        }

        return new JsonResponse({
            id: user.id,
            fullname: user.fullname,
            active: user.active,
        });
    }
}

export class UsersMeController extends Controller {

    static handler(request: Hapi.Request, reply: Hapi.IReply): void {
        new UsersMeController(request, reply).handleInternal();
    }

    protected async get(): Promise<IHttpResponse> {
        const session = <Session>this.request.auth.credentials;
        const user = session.user;

        return new JsonResponse({
            id: user.id,
            fullname: user.fullname,
            active: user.active,
        });
    }

    protected async put(): Promise<IHttpResponse> {
        const session = <Session>this.request.auth.credentials;

        const user = await User.update(<User>{
            id: session.user.id,
            fullname: this.request.payload.fullname,
            active: this.request.payload.active,
            password: this.request.payload.password,
        });

        return new JsonResponse({
            id: user.id,
            fullname: user.fullname,
            active: user.active,
        });
    }
}

export default UsersController;
