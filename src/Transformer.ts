import { ProjectInfo } from "./code-parser/types";
import { Project, Part } from "./Project";

export default class Transformer {
    transform(projectInfo: ProjectInfo): Project {
        const project: Project = {
            presets: {},
            title: '',
            blocks: [],
            refs: [],
        };
        Object.keys(projectInfo.files).forEach((key) => {
            const file = projectInfo.files[key];
            // console.log(file, { title: file.file, blocks: [[file.exports.default.name], file.exports.vars.map(v => v.name[0])], refs: file.imports.map(imp => imp.file)});
            const parts: Part[] = [];
            if (file.exports.default.name) {
                parts.push({
                    name: '@default',
                    items: [{
                        value: (file.exports.default.type ? file.exports.default.type + ': ' : '') + file.exports.default.name,
                        presets: ['def'],
                    }],
                });
            }
            if (file.exports.vars.length) {
                parts.push({
                    name: '@exports',
                    items: file.exports.vars.map(v => ({
                        value: (v.type ? v.type + ': ' : '') + v.name[0],
                        presets: [],//['+-'[Math.floor(Math.random() + 0.5)]],
                    })),
                });
            }
            project.blocks.push({
                name: file.file,
                presets: [],
                parts: parts,
            });
            file.imports.forEach((imp) => {
                project.refs.push({
                    from: file.file,
                    to: imp.file,
                    presets: [],
                    markerFrom: '+',
                    markerTo: '>',
                });
            });
        });

        return project;
    }
}