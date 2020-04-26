import { ProjectInfo } from '../code-parser/types';
import Drawer from '../drawers/Drawer';
import SVGContainer, { MarkerTypes } from '../svg/SVGContainer';
import UMLContainer, { BlockItems } from '../svg/UMLContainer';

export default class SVGDrawer implements Drawer {
    private svg = new SVGContainer({ padding: 32, textPadding: 8, fontSize: 8 });
    private container = new UMLContainer(this.svg, { blockWidth: 200, blockMergeVer: 100, blockMergeHor: 100 });

    constructor() {
        this.container.addPreset('+', { fill: 'green', color: 'white', border: 'green' } );
        this.container.addPreset('-', { fill: 'red', border: 'red' } );
        this.container.addPreset('def', { fill: 'lightgrey' } );
    }

    draw(projectInfo: ProjectInfo, options?: { [index: string]: any }): { data: any, type: string } {
        Object.keys(projectInfo.files).forEach((key) => {
            const file = projectInfo.files[key];
            // console.log(file, { title: file.file, blocks: [[file.exports.default.name], file.exports.vars.map(v => v.name[0])], refs: file.imports.map(imp => imp.file)});
            const blocks: BlockItems[] = [];
            if (file.exports.default.name) {
                blocks.push({
                    title: '@default',
                    items: [{
                        value: (file.exports.default.type ? file.exports.default.type + ': ' : '') + file.exports.default.name,
                        presets: ['def'],
                    }],
                });
            }
            if (file.exports.vars.length) {
                blocks.push({
                    title: '@exports',
                    items: file.exports.vars.map(v => ({
                        value: (v.type ? v.type + ': ' : '') + v.name[0],
                        presets: [],//['+-'[Math.floor(Math.random() + 0.5)]],
                    })),
                });
            }
            this.container.addBlock({
                title: {
                    value: file.file,
                    presets: [],//['+-'[Math.floor(Math.random() + 0.5)]]
                },
                blocks: blocks,
                refs: file.imports.map(imp => ({
                    start: MarkerTypes.diamond,
                    end: MarkerTypes.triangle,
                    to: {
                        value: imp.file,
                        presets: [],//['+-'[Math.floor(Math.random() + 0.5)]],
                    },
                })),
            });
        });

        return {
            data: this.container.make(options?.title ?? 'title'),
            type: 'utf8'
        };
    }
}