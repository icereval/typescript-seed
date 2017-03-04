import * as hapi from 'hapi';
import * as good from 'good';
import logger from '../logging'


export default class GoodPlugin {
    public static register(server: hapi.Server): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            server.register({
                register: good,
                options: {
                    ops: {
                        interval: 1000,
                    },
                    reporters: {
                        myConsoleReporter: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{ log: '*', response: '*' }]
                        }, {
                            module: 'good-console',
                            args: [{format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'}]
                        }, 'stdout'],
                    }
                }
            }, (error) => {
                if (error) {
                    logger.error('error', error);
                    return reject(error);
                }
            });

            resolve();
        });
    }
}
