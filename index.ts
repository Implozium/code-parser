import { promises } from 'fs';
import * as path from 'path';
const nomnoml = require('nomnoml');

type IOptions = {
    dir: string,
    excludes?: string[],
    types?: string[],
    aliases?: {
        [index: string]: string
    },
    output: string,
}

const options: IOptions = {
    // dir: '../Boards/frontend',
    dir: '../tic-tac-toe-react',
    // dir: 'E:/Downloads/nlk-master/src/frontend',
    excludes: [
        'node_modules',
        'coverage',
        'test.js',
        'babel',
        'webpack'
    ],
    types: ['js', 'vue', 'jsx'],
    aliases: {
        '@': 'src'
    },
    output: 'out/out.svg'
};

function readdir(dir: string): Promise<string[]> {
    return promises.readdir(dir)
        .then(files => files.map(file => path.resolve(dir, file)));
}

function collectFiles(options: IOptions, dir: string, outfiles: string[]): Promise<any> {
    return readdir(dir)
        .then((files) => {
            return files
                .filter(file => options.excludes.every(path => !file.includes(path)))
                .reduce((promise, file) => {
                    return promise
                        .then(() => promises.stat(file))
                        .then((stat) => {
                            if (!stat.isDirectory()) {
                                if (options.types.some(type => file.endsWith(type))) {
                                    outfiles.push(file);
                                }
                                return;
                            }
                            return collectFiles(options, file, outfiles);
                        });
                }, Promise.resolve());
        });
}

function getFiles(options: IOptions): Promise<string[]> {
    const files: string[] = [];
    return collectFiles(options, options.dir, files)
        .then(() => files.map(file => file.replace(path.resolve(options.dir), '')));
}

interface IFileInfoImport {
    file: string,
    default?: string,
    vars: [string, string][]
}

interface IFileInfoExports {
    default?: {
        type: string,
        name: string,
    },
    vars: {
        type: string,
        name: [string, string],
    }[]
}

interface IFileInfo {
    file: string,
    imports: IFileInfoImport[],
    exports: IFileInfoExports,
}

function getVars(str: string): [string, string][] {
    return str
        .split(/ *, */)
        .map((str) => {
            const [name, alias = ''] = str.split(/ +as +/);
            return [name.trim(), alias.trim()];
        });
}

function extractImports(str: string): IFileInfoImport[] {
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
                vars = getVars(args[2]);
            } else if (args = importBody.match(/([^,]+), *\* +as +(.+)/)) {
                def = args[1];
                vars = [['*', args[2]]];
            } else if (args = importBody.match(/\{ *(.+) *\}/)) {
                vars = getVars(args[1]);
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

function extractExports(str: string): IFileInfoExports {
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
                result.default.type = ['var', 'let', 'const'].includes(args[1]) ? 'var' : args[1] || 'object';
            // } else if (args = exports.match(/\{ *(.+) *\}/)) {
            //     const vars = getVars(args[1]);
            //     vars.forEach((v) => {
            //         result.vars.push({
            //             type: '',
            //             name: v
            //         });
            //     });
            } else if (args = exports.match(/(var|let|const|class|function|function\*|interface|type)? +([^\( ]+)/)) {
                result.vars.push({
                    type: ['var', 'let', 'const'].includes(args[1]) ? 'var' : args[1] || 'object',
                    name: [!args[1] ? '' : args[2], '']
                });
            }
        });
    return result;
}

function extractFromFile(file: string): Promise<IFileInfo> {
    return promises.readFile(file, 'utf-8')
        .then((text) => {
            const result: IFileInfo = {
                file: file,
                imports: extractImports(text),
                exports: extractExports(text)
            };
            return result;
        });
}

function resolveFileName(name: string, dir: string, file: string, aliases: { [index: string]: string }): string {
    Object.keys(aliases).forEach((alias) => {
        name = name.replace(new RegExp('^' + alias), aliases[alias].indexOf('/') === -1 ? '/' + aliases[alias] : aliases[alias]);
    });
    if (name.search(/^\.+\//) !== -1) {
        name = path.resolve(dir, '.' + file.replace(/\/[^\/]+$/, ''), name).replace(path.resolve(dir), '');
    }
    return name;
}

// console.log(resolveFileName('@/utils/API', '../Boards/frontend/src', '/store/modules/boards.js', { '@': 'src' }));
// console.log(resolveFileName('../utils/API', '../Boards/frontend/src', '/store/modules/boards.js', { '@': 'src' }));
// console.log(resolveFileName('vue', '../Boards/frontend/src', '/mixins/Form.js', { '@': 'src' }));

function findSameFile(name: string, types: string[], files: string[]): string {
    name = name.replace(/\\/g, '/');
    if (files.includes(name)) {
        return name;
    }
    for (let type of types) {
        if (files.includes(name + '.' + type)) {
            return name + '.' + type;
        }
        if (files.includes(name + '/index.' + type)) {
            return name + '/index.' + type;
        }
    }
    return name;
}

function extractProject(options: IOptions): void {
    const projectFiles: { [index: string]: IFileInfo } = {};
    getFiles(options)
        .then((files) => {
            // console.log(files);
            return files.reduce((promise, file) => {
                file = file.replace(/\\/g, '/');
                return promise
                    .then(() => extractFromFile(path.resolve(options.dir, '.' + file)))
                    .then((fileInfo) => {
                        fileInfo.file = file;
                        projectFiles[file] = fileInfo;
                        fileInfo.imports.forEach((imp) => {
                            imp.file = resolveFileName(imp.file, options.dir, file, options.aliases);
                        });
                    })
            }, Promise.resolve());
        })
        .then(() => {
            const projectFilesName = Object.keys(projectFiles);
            projectFilesName.forEach((name) => {
                projectFiles[name].imports.forEach((imp) => {
                    imp.file = findSameFile(imp.file, options.types, projectFilesName);
                });
            });
        })
        .then(() => {
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
            `;
            output += Object.keys(projectFiles).map((name) => {
                let out = `[${projectFiles[name].file}|` + '\n';
                if (projectFiles[name].exports.default.name || projectFiles[name].exports.default.type) {
                    out += `${projectFiles[name].exports.default.name || 'default'}:${projectFiles[name].exports.default.type}`;
                }
                out += '|\n';
                out += projectFiles[name].exports.vars.map(v => (v.name[1] || v.name[0]) + ':' + v.type).join(';\n');
                out += ']\n';
                out += projectFiles[name].imports.map(imp => `[${projectFiles[name].file}] -> [${imp.file}]`).join('\n');

                return out;
            }).join('\n\n');

            // console.log(output);

            return promises.writeFile(options.output, nomnoml.renderSvg(output), 'utf8');
        })
}

extractProject(options);

// const str = `import InputText from '@/components/inputs/InputText';
// import Column from '@/components/common/Column';
// import Row from '@/components/common/Row';
// import Tag from '@/components/common/Tag';
// import Common from 'common';
// import defaultExport from "module-name";
// import * as name from "module-name";
// import { export } from "module-name";
// import { export as alias } from "module-name";
// import { export1 , export2 } from "module-name";
// import { export1 , export2 as alias2 } from "module-name";
// import defaultExport, { export } from "module-name";
// import defaultExport, * as name from "module-name";`;
// const str2 = `
// export default { a: 4};

// export const c = 100;

// export { c as d, j as k}
// `;
// console.log(JSON.stringify(extractImports(str), null, 4));
// console.log(JSON.stringify(extractExports(str2), null, 4));