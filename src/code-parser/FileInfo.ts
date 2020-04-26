import { BlockInfo, BlockInfoImport, BlockInfoExports } from './types';

export default class FileInfo implements BlockInfo {
    file = '';
    imports: BlockInfoImport[];
    exports: BlockInfoExports;

    constructor(file: string, text: string) {
        this.file = file;
        this.imports = this.extractImports(text);
        this.exports = this.extractExports(text);
    }

    protected getVars(str: string): [string, string][] {
        if (!str) {
            return [];
        }
        return str
            .split(/ *, */)
            .map((str) => {
                const [name, alias = ''] = str.split(/ +as +/);
                return [name.trim(), alias.trim()];
            });
    }

    protected extractImports(text: string): BlockInfoImport[] {
        const importRegExp = `^ *import +(.+) +from +['"\`]([^'"\`]+)['"\`]`;
        const parts = text.match(new RegExp(importRegExp, 'gm')) || [];
        return parts
            .map(part => part.match(new RegExp(importRegExp))!.slice(1))
            .map(([ importBody, file ]) => {
                let args: string[] = [];
                let def: string = '';
                let vars: [string, string][] = [];
                if (args = importBody.match(/([^,]+), *\{ *(.+) *\}/) ?? []) {
                    def = args[1];
                    vars = this.getVars(args[2]);
                } else if (args = importBody.match(/([^,]+), *\* +as +(.+)/) ?? []) {
                    def = args[1];
                    vars = [['*', args[2]]];
                } else if (args = importBody.match(/\{ *(.+) *\}/) ?? []) {
                    vars = this.getVars(args[1]);
                } else if (args = importBody.match(/\* +as +(.+)/) ?? []) {
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

    protected extractExports(text: string): BlockInfoExports {
        const exportRegExp = `^ *export +(.+)`;
        const result: BlockInfoExports = {
            default: {
                name: '',
                type: '',
            },
            vars: []
        };
        const parts = text.match(new RegExp(exportRegExp, 'gm')) || [];
        parts
            .forEach((part) => {
                const exports = part.match(new RegExp(exportRegExp))![1];
                let args: string[] | null = [];
                if (args = exports.match(/default +(?:(var|let|const|class|function|function\*|interface|type|enum) +)?([^\( ]+)/)) {
                    result.default.name = !args[1] ? '' : args[2];
                    result.default.type = this.getType(args[1]);
                } else if (args = exports.match(/(?:(var|let|const|class|function|function\*|interface|type|enum) +)?([^\( ]+)/)) {
                    result.vars.push({
                        type: this.getType(args[1]),
                        name: [!args[1] ? '' : args[2], ''],
                    });
                }
            });
        return result;
    }
}