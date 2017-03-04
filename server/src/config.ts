import * as nconf from 'nconf';
import * as nconfYaml from 'nconf-yaml';
import * as SmartConfig from 'hapi-config/lib/smart-config';
import { ConnectionOptions } from 'typeorm';
import { PlatformTools } from 'typeorm/platform/PlatformTools';

nconf.argv().env().file({
    file: './config.yaml',
    format: nconfYaml,
});

export default SmartConfig(nconf);

export function getDatabaseConfig(): ConnectionOptions[] {
    // Source: https://github.com/typeorm/typeorm/blob/c12dc0002c84737b21fd2a1437e61fe9d3ed91fe/src/connection/ConnectionManager.ts#L362

    const path: string = undefined;

    const optionsArray: ConnectionOptions[] = PlatformTools.load(path || (PlatformTools.load("app-root-path").path + "/ormconfig.json"));
    if (!optionsArray)
        throw new Error(`Configuration ${path || "ormconfig.json"} was not found. Add connection configuration inside ormconfig.json file.`);

    // const promises = optionsArray
    //     .filter(options => !options.environment || options.environment === PlatformTools.getEnvVariable("NODE_ENV")) // skip connection creation if environment is set in the options, and its not equal to the value in the NODE_ENV variable
    //     .map(options => this.createAndConnectByConnectionOptions(options));

    return optionsArray.filter(options => !options.environment || options.environment === PlatformTools.getEnvVariable("NODE_ENV"));
}
