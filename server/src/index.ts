import 'reflect-metadata';
import { getDatabaseConfig } from './config';
import { Server } from './server';
import { getConnectionManager, createConnection } from 'typeorm';
import logger from './logging';


async function main(): Promise<void> {
    logger.info(`Running enviroment ${process.env.NODE_ENV || 'dev'}`);

    // setup the database connection w/ our pretty logger
    const databaseConfigs = getDatabaseConfig();
    for (const databaseConfig of databaseConfigs) {
        (<any>databaseConfig.logging).logger = logger.info;
        getConnectionManager().createAndConnect(databaseConfig)
    }

    const server = await Server.init();
    await server.start(() => {
        logger.info('Server running at:', server.info.uri);
    });

    server.once('stop', () => {
        getConnectionManager().get().close();
    });
}

main();
