import { IProjectInfo, IFileInfo, IDrawer } from './types';

export default class Drawer implements IDrawer {

    constructor() {
    }

    draw(projectInfo: IProjectInfo, options?: Object): { data: any, type: string } {
        let output = '';
        const abstracts: string[] = Object.keys(projectInfo.files).reduce((abstracts, name) => {
            const aFileInfo: IFileInfo = projectInfo.files[name];
            return abstracts.concat(aFileInfo.imports.filter(imp => !projectInfo.files[imp.file]).map(imp => imp.file));
        }, []);
        output += '\n';
        output += abstracts.map(file => `[<abstract> ${file}]`).join('\n');
        output += '\n';
        output += Object.keys(projectInfo.files).map((name) => {
            const aFileInfo: IFileInfo = projectInfo.files[name];
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
                out += imp.vars.map(v => `[${aFileInfo.file}] -> [${projectInfo.files[imp.file] ? imp.file + ': ' + v[0] : imp.file}]`).join('\n');
                out += '\n';
            });
            return out;
        }).join('\n\n');

        return {
            data: output,
            type: 'utf8'
        };
    }
}