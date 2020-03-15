import { promises } from 'fs';
import * as path from 'path';
import nomnoml = require('nomnoml');

import { IProjectInfo, IOptions } from './types';
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
                        .then(() => new FileInfo(path.resolve(this.options.dir, '.' + file)).init())
                        .then((fileInfo) => {
                            fileInfo.file = file;
                            this.files[file] = fileInfo;
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

    draw(): Promise<any> {
        let output = `
#arrowSize: 1
#bendSize: 1
#fill: #ffffff
#font: Consolas
#fontSize: 11
#lineWidth: 1
#padding: 4
#spacing: 32
#direction: right
#ranker: longest-path
#gutter: 150
#edges: rounded

#.abstract: fill=#ffffff dashed center bold italic
            `;
        const abstracts: string[] = Object.keys(this.files).reduce((abstracts, name) => {
            const aFileInfo: FileInfo = this.files[name];
            return abstracts.concat(aFileInfo.imports.filter(imp => !this.files[imp.file]).map(imp => imp.file));
        }, []);
        output += '\n';
        output += abstracts.map(file => `[<abstract> ${file}]`).join('\n');
        output += '\n';
        output += Object.keys(this.files).map((name) => {
            const aFileInfo: FileInfo = this.files[name];
            let out = `[${aFileInfo.file}|`;
            if (aFileInfo.exports.default.name || aFileInfo.exports.default.type) {
                out += `${aFileInfo.exports.default.name || 'default'}:${aFileInfo.exports.default.type}`;
            }
            // out += '|\n';
            // out += aFileInfo.exports.vars.map(v => (v.name[1] || v.name[0]) + ':' + v.type).join(';\n');
            out += ']\n';
            aFileInfo.exports.vars.forEach((v) => {
                out += `[<${v.type}> ${aFileInfo.file}: ${(v.name[1] || v.name[0])}| ${v.type}]\n`;
                out += `[${aFileInfo.file}: ${(v.name[1] || v.name[0])}] <-o [${aFileInfo.file}]\n`;
            });
            aFileInfo.imports.forEach((imp) => {
                if (imp.default) {
                    out += `[${aFileInfo.file}] -> [${imp.file}]\n`;
                }
                out += imp.vars.map(v => `[${aFileInfo.file}] -> [${this.files[imp.file] ? imp.file + ': ' + v[0] : imp.file}]`).join('\n');
                out += '\n';
            });
            // out += aFileInfo.imports
            //     .map(imp => `[${aFileInfo.file}] -> [${this.files[imp.file] ? imp.file + ': ' + imp.: imp.file}]`)
            //     .join('\n');

            return out;
        }).join('\n\n');

        console.log(output);

        return promises.writeFile(this.options.output, nomnoml.renderSvg(output), 'utf8');
    }
}