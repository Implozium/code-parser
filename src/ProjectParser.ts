import { PresetedValue, Part, Block, Ref, Presets, Project } from "./Project";


export default class ProjectParser {
    constructor() {}

    extractValue(text: string): PresetedValue {
        const [, presets = '', value = ''] = text.trim().match(/(?:<([^>]+)>)?\s*(.*)/) ?? [];
        return {
            presets: presets.length ? presets.split('|').map(str => str.trim()) : [],
            value: value,
        }
    }

    extractPart(text: string): Part {
        const [, name = '', values = ''] = text.trim().match(/(?:\{([^\}]*)\}\s*)?(.*)/) ?? [];
        return {
            name: name,
            items: values.length ? values.split(';').map(str => this.extractValue(str.trim())).filter(Boolean) : [],
        }
    }

    extractBlocks(text: string): Block[] {
        const regexp = /^\s*\[\s*((?:<[^>]+>\s+)?\s*[^|\]]+)\s*(?:\|\s*([^\]]*?))?\]\s*$/;
        const matched = text.match(new RegExp(regexp, 'gm')) ?? [];
        // console.log(matched);
        const blocks: Block[] = matched.map((row) => {
            // console.log(row.match(regexp));
            const [, title = '', parts = ''] = row.match(regexp) ?? [];
            const matchedParts = parts.length ? parts.split('|') ?? []: [];
            const { value, presets } = this.extractValue(title);
            return {
                name: value,
                presets: presets,
                parts: matchedParts.map((val) => this.extractPart(val)),
            }
        });

        return blocks;
    }

    extractRefs(text: string): Ref[] {
        const regexp = /^\s*\[([^\]]+)\]\s*(?:<([^>]+)>\s+)?(?:\{([^\}]+)\}\s+)?([^\- ]*)\-([^\[ ]*)\s*\[([^\]]+)\]\s*$/;
        const matched = text.match(new RegExp(regexp, 'gm')) ?? [];
        // console.log(matched);
        const refs: Ref[] = matched.map((row) => {
            // console.log(row.match(regexp));
            const [, from = '', presets = '', text = '', markerFrom = '', markerTo = '', to = ''] = row.match(regexp) ?? [];
            return {
                from,
                to,
                text,
                markerFrom,
                markerTo,
                presets: presets.length ? presets.split('|').map(str => str.trim()) : [],
            };

        });
        return refs;
    }

    extractPresets(text: string): Presets {
        const regexp = /^\s*<([^>\}]+)>\s*\{([^\}]*?)\}\s*$/;
        const matched = text.match(new RegExp(regexp, 'gm')) ?? [];
        const presets: Presets = matched.reduce((presets, row) => {
            const [, preset = '', values = ''] = row.match(regexp) ?? [];
            if (!presets[preset]) {
                presets[preset] = {};
            }
            if (values.length) {
                values
                    .split(';')
                    .map(val => val.split(':').map(v => v.trim()))
                    .forEach(([key, value]) => {
                        if (key) {
                            presets[preset][key] = value;
                        }
                    });
            }
            return presets;
        }, {} as Presets);
        return presets;
    }

    parse(text: string): Project {
        const project: Project = {
            presets: this.extractPresets(text),
            title: '',
            blocks: this.extractBlocks(text),
            refs: this.extractRefs(text),
        };

        return project;
    }
}