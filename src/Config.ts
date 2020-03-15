import { promises, existsSync } from 'fs';

import { IOptions } from "./types";

export default class Config {
    load(file: string): Promise<IOptions> {
        if (!existsSync(file)) {
            return Promise.reject(new Error(`File "${file}" is not found`));
        }
        return promises.readFile(file, 'utf8')
            .then(text => JSON.parse(text))
            .then((config) => {
                if (!config.dir) {
                    throw new Error('Param "dir" is not defined');
                }
                if (!config.output) {
                    throw new Error('Param "output" is not defined');
                }
                return {
                    excludes: [
                        'node_modules',
                        'coverage',
                        'test',
                        'babel',
                        'webpack',
                        'dist'
                    ],
                    types: ['js', 'vue', 'jsx', 'ts'],
                    aliases: {},
                    ...config
                };
            });
    }
}