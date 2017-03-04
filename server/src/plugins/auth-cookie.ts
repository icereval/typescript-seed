import * as hapi from 'hapi';
import * as hapiAuthCookie from 'hapi-auth-cookie';
import * as moment from 'moment';
import * as TypeOrm from 'typeorm';
import logger from '../logging';
import config from '../config';
import Session from '../models/entity/session';
import User from '../models/entity/user';


export default class AuthCookiePlugin {

    public static register(server: hapi.Server): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            server.register({
                register: hapiAuthCookie,
            }, (error) => {
                if (error) {
                    logger.error('error', error);
                    return reject(error);
                }

                server.auth.strategy('session', 'cookie', 'try', {
                    cookie: config.get('app:cookie_name'),
                    password: config.get('app:cookie_secret'),
                    isSecure: false,
                    ttl: moment().add(config.get('app:cookie_expiration'), 'days').valueOf(),
                    validateFunc: function (request, session, callback) {
                        TypeOrm.getConnection()
                            .getRepository(Session)
                            .createQueryBuilder('session')
                            .innerJoinAndMapOne('session.user', User, 'user', 'user.id=session.user')
                            .where('session.id = :id')
                            .setParameter('id', session.id)
                            .getOne()
                        .then((entity) =>  {
                            if (!entity) {
                                logger.debug('session.id %d could not be found', session.id);
                                return callback(null, false);
                            }

                            logger.debug('session.id %d loaded', session.id);
                            return callback(null, true, entity);
                        }, (err) => {
                            return callback(err, false);
                        });
                    }
                });
                
                resolve();
            });
        })
    }
}
