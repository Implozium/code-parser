import { promises } from 'fs';
import * as path from 'path';

import { IOptions } from './types';

export default class DirReader {
    private options: IOptions;

    constructor(options: IOptions) {
        this.options = options;
    }

    readdir(dir: string): Promise<string[]> {
        return promises.readdir(dir)
            .then(files => files.map(file => path.resolve(dir, file)));
    }

    collectFiles(dir: string, outfiles: string[]): Promise<any> {
        return this.readdir(dir)
            .then((files) => {
                return files
                    .filter(file => this.options.excludes.every(path => !file.includes(path)))
                    .reduce((promise, file) => {
                        return promise
                            .then(() => promises.stat(file))
                            .then((stat) => {
                                if (!stat.isDirectory()) {
                                    if (this.options.types.some(type => file.endsWith(type))) {
                                        outfiles.push(file);
                                    }
                                    return;
                                }
                                return this.collectFiles(file, outfiles);
                            });
                    }, Promise.resolve());
            });
    }

    getFiles(): Promise<string[]> {
        const files: string[] = [];
        return this.collectFiles(this.options.dir, files)
            .then(() => files.map(file => file.replace(path.resolve(this.options.dir), '')));
    }
}