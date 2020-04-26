import Drawer from '../drawers/Drawer';
import { Project } from '../Project';

export default class TextDrawer implements Drawer {

    constructor() {
    }

    draw(project: Project, options?: { [index: string]: any }): { data: any, type: string, extension: string } {
        let output = '';
        // add presets
        const abstracts: string[] = project.refs
            .filter(ref => !project.blocks.find(block => block.name === ref.to))
            .map(ref => ref.to)
            .filter((name, i, arr) => arr.indexOf(name) === i);
        output += '\n';
        output += abstracts.map(file => `[<abstract> ${file}]`).join('\n');
        output += '\n';
        output += project.blocks
            .map((block) => {
                let out = `[${block.name}`;
                block.parts.forEach((part) => {
                    out += '|';
                    if (part.name) {
                        out += `{${part.name}} `;
                    }
                    out += part.items.map((item) => `${item.presets.length ? `<${item.presets.join('|')}> ` : ''}${item.value}`).join('; ');
                });
                out += ']';
                return out;
            })
            .join('\n');
        output += '\n';
        output += project.refs
            .map((ref) => {
                let out = `[${ref.from}] ${ref.text ? `${ref.text} ` : ''}${ref.presets.length ? `<${ref.presets.join('|')}>`: ''}${ref.markerFrom}-${ref.markerTo} [${ref.to}]`;
                return out;
            })
            .join('\n');

        return {
            data: output,
            type: 'utf8',
            extension: 'txt',
        };
    }
}