import { promises } from 'fs';

import { IFileInfo, IFileInfoImport, IFileInfoExports } from './types';

export default class FileInfo implements IFileInfo {
    file = '';
    imports: IFileInfoImport[];
    exports: IFileInfoExports;

    constructor(file: string) {
        this.file = file;
    }

    protected getVars(str: string): [string, string][] {
        return str
            .split(/ *, */)
            .map((str) => {
                const [name, alias = ''] = str.split(/ +as +/);
                return [name.trim(), alias.trim()];
            });
    }

    protected extractImports(str: string): IFileInfoImport[] {
        const importRegExp = `^ *import +(.+) +from +['"\`]([^'"\`]+)['"\`]`;
        const parts = str.match(new RegExp(importRegExp, 'gm')) || [];
        return parts
            .map(str => str.match(new RegExp(importRegExp)).slice(1))
            .map(([ importBody, file ]) => {
                let args: string[] = [];
                let def: string = '';
                let vars: [string, string][] = [];
                if (args = importBody.match(/([^,]+), *\{ *(.+) *\}/)) {
                    def = args[1];
                    vars = this.getVars(args[2]);
                } else if (args = importBody.match(/([^,]+), *\* +as +(.+)/)) {
                    def = args[1];
                    vars = [['*', args[2]]];
                } else if (args = importBody.match(/\{ *(.+) *\}/)) {
                    vars = this.getVars(args[1]);
                } else if (args = importBody.match(/\* +as +(.+)/)) {
                    vars = [['*', args[1]]];
                } else {
                    def = importBody;
                }
    
                return {
                    file: file,
                    default: def,
                    vars: vars,
                };
            });
    }

    protected getType(type: string): string {
        if (['var', 'let', 'const'].includes(type)) {
            return 'var';
        }
        if (type) {
            return type;
        }
        return 'object';
    }

    protected extractExports(str: string): IFileInfoExports {
        const exportRegExp = `^ *export +(.+)`;
        const result: IFileInfoExports = {
            default: {
                name: '',
                type: '',
            },
            vars: []
        };
        const parts = str.match(new RegExp(exportRegExp, 'gm')) || [];
        parts
            .forEach((str) => {
                const exports = str.match(new RegExp(exportRegExp))[1];
                let args: string[] = [];
                if (args = exports.match(/default +(var|let|const|class|function|function\*|interface|type)? *([^\( ]+)/)) {
                    result.default.name = !args[1] ? '' : args[2];
                    result.default.type = this.getType(args[1]);
                } else if (args = exports.match(/(var|let|const|class|function|function\*|interface|type)? +([^\( ]+)/)) {
                    result.vars.push({
                        type: this.getType(args[1]),
                        name: [!args[1] ? '' : args[2], '']
                    });
                }
            });
        return result;
    }

    public init(): Promise<FileInfo> {
        return promises.readFile(this.file, 'utf-8')
            .then((text) => {
                this.imports = this.extractImports(text),
                this.exports = this.extractExports(text)
                return this;
            });
    }
}