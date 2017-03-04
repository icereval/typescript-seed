import * as Purdy from 'purdy';
import * as Winston from 'winston';
import config from './config';

const loggingConfig = config.get('logging');
const transports: Winston.TransportInstance[] = [];

if (loggingConfig.console) {
    transports.push(new Winston.transports.Console(loggingConfig.console));
}

export default new Winston.Logger({
    transports: transports,
    rewriters: <any>[
        ((level, msg, meta) => { Object.keys(meta).length > 0 ? Purdy(meta) : null })
    ],
});

