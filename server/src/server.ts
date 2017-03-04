import { Server as HapiServer } from 'hapi';
import GoodPlugin from './plugins/good';
import AuthCookiePlugin from './plugins/auth-cookie';
import { getConnection } from 'typeorm';
import Routes from './routes';
import config from './config';

export class Server {
    public static async init(): Promise<HapiServer> {
        const server = new HapiServer();
        server.connection({
            host: config.get('server:host'),
            port: config.get('server:port'),
            router: {
                isCaseSensitive: false,
                stripTrailingSlash: true,
            },
            routes: {
                cors: config.get('server:routes:cors'),
            },
        });

        await GoodPlugin.register(server);
        await AuthCookiePlugin.register(server);

        await Routes.init(server);

        return server;
    }
}
