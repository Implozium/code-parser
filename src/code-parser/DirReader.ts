import { promises } from 'fs';
import * as path from 'path';

export default class DirReader {
    private dir: string;
    private excludes: string[];
    private types: string[];

    constructor(dir: string, excludes: string[], types: string[]) {
        this.dir = dir;
        this.excludes = excludes;
        this.types = types;
    }

    readdir(dir: string): Promise<string[]> {
        return promises.readdir(dir)
            .then(files => files.map(file => path.resolve(dir, file)));
    }

    collectFiles(dir: string, outfiles: string[]): Promise<any> {
        return this.readdir(dir)
            .then((files) => {
                return files
                    .filter(file => this.excludes.every(path => !file.includes(path)))
                    .reduce((promise, file) => {
                        return promise
                            .then(() => promises.stat(file))
                            .then((stat) => {
                                if (!stat.isDirectory()) {
                                    if (this.types.some(type => file.endsWith(type))) {
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
        return this.collectFiles(this.dir, files)
            .then(() => files.map(file => file.replace(path.resolve(this.dir), '')));
    }
}