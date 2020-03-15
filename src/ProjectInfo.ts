import { promises } from 'fs';
import * as path from 'path';

import { IProjectInfo, IOptions, IDrawer } from './types';
import DirReader from './DirReader';
import FileInfo from './FileInfo';

export default class ProjectInfo implements IProjectInfo {
    private options: IOptions;
    private dirReader: DirReader;

    files = {};

    constructor(options: IOptions) {
        this.options = options;
        this.dirReader = new DirReader(options);
    }

    resolveFileName(name: string, file: string): string {
        Object.keys(this.options.aliases).forEach((alias) => {
            name = name.replace(
                new RegExp('^' + alias),
                this.options.aliases[alias].indexOf('/') === -1 ? '/' + this.options.aliases[alias] : this.options.aliases[alias]
            );
        });
        if (name.search(/^\.+\//) !== -1) {
            name = path
                .resolve(this.options.dir, '.' + file.replace(/\/[^\/]+$/, ''), name)
                .replace(path.resolve(this.options.dir), '');
        }
        return name;
    }

    findSameFile(name: string, files: string[]): string {
        name = name.replace(/\\/g, '/');
        if (files.includes(name)) {
            return name;
        }
        for (let type of this.options.types) {
            if (files.includes(name + '.' + type)) {
                return name + '.' + type;
            }
            if (files.includes(name + '/index.' + type)) {
                return name + '/index.' + type;
            }
        }
        return name;
    }

    init(): Promise<ProjectInfo> {
        return this.dirReader.getFiles()
            .then((files) => {
                return files.reduce((promise, file) => {
                    file = file.replace(/\\/g, '/');
                    return promise
                        .then(() => promises.readFile(path.resolve(this.options.dir, '.' + file), 'utf-8'))
                        .then((text) => {
                            this.files[file] = new FileInfo(file, text);
                        })
                }, Promise.resolve());
            })
            .then(() => {
                const projectFilesName = Object.keys(this.files);
                projectFilesName.forEach((file) => {
                    this.files[file].imports.forEach((imp) => {
                        imp.file = this.findSameFile(this.resolveFileName(imp.file, file), projectFilesName);
                    });
                });
            })
            .then(() => this)
    }

    save(file: string): Promise<ProjectInfo> {
        return Promise.resolve(this);
    }

    load(file: string): Promise<ProjectInfo> {
        return Promise.resolve(this);
    }

    draw(drawer: IDrawer): Promise<any> {
        const { data, type } = drawer.draw(this);
        return promises.writeFile(this.options.output, data, type);
    }
}