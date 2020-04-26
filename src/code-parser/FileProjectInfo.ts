import { promises } from 'fs';
import * as path from 'path';

import { ProjectInfo } from './types';
import Options from '../Options';
import Drawer from '../drawers/Drawer';
import DirReader from './DirReader';
import FileInfo from './FileInfo';

export default class FileProjectInfo implements ProjectInfo {
    private options: Required<Options>;
    private dirReader: DirReader;

    files: { [index: string]: FileInfo } = {};

    constructor(options: Options) {
        this.options = {
            excludes: [],
            types: [],
            aliases: {},
            ...options,
        };
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

    init(): Promise<this> {
        return this.dirReader.getFiles()
            .then((files) => {
                return files.reduce((promise: Promise<any>, file) => {
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

    save(file: string): Promise<this> {
        return Promise.resolve(this);
    }

    load(file: string): Promise<this> {
        return Promise.resolve(this);
    }

    draw(drawer: Drawer): Promise<any> {
        const { data, type } = drawer.draw(this);
        return promises.writeFile(this.options.output, data, type);
    }
}