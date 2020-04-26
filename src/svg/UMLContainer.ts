import SVGContainer, { MarkerTypes, ArcDirections, Point, Dimention, SVGStyle } from "./SVGContainer";
import { hash } from "./common";
import { Project, Ref, PresetedValue } from "../Project";

interface UMLContainerOptions {
    blockWidth?: number;
    blockMergeVer?: number;
    blockMergeHor?: number;
}

export interface BlockItems {
    title: string;
    items: PresetedValue[];
}

interface BlockRef {
    text?: string;
    start?: MarkerTypes;
    end?: MarkerTypes;
    to: PresetedValue;
}

interface Block {
    title: PresetedValue;
    blocks: BlockItems[];
    refs: BlockRef[];
}

interface BlocksInfo {
    [index: string]: {
        title: string;
        block?: Block;
        in: string[];
        out: string[];
    }
}

interface Layout {
    [index: string]: Dimention;
}

enum Directions {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
}

export interface Preset {
    fill?: string;
    border?: string;
    color?: string;
    [propName: string]: any;
}

interface CalcedPreset {
    text: SVGStyle;
    rect: SVGStyle;
    line: SVGStyle;
}

export default class UMLContainer {
    protected options: Required<UMLContainerOptions>;
    protected svg: SVGContainer;
    protected blocks: Block[] = [];
    protected refs: Ref[] = [];
    protected presets: { [index: string]: Preset } = {};

    constructor(svg: SVGContainer, options: UMLContainerOptions = {}) {
        this.svg = svg;
        this.options = {
            blockWidth: 150,
            blockMergeVer: 100,
            blockMergeHor: 50,
            ...options,
        };
    }

    addPreset(name: string, preset: Preset): this {
        this.presets[name] = preset;
        return this;
    }

    private calcPreset(names: string[] = []): CalcedPreset {
        const calced: CalcedPreset = {
            rect: {
                fill: '#ffffff',
                stroke: '#000000',
            },
            text: {
                fill: '#000000',
                stroke: 'none',
            },
            line: {
                fill: 'none',
                stroke: '#000000',
            },
        };
        const preset = Object.assign({}, ...names.map(name => this.presets[name])) as Preset;
        calced.rect.fill = preset.fill ?? calced.rect.fill;
        //calced.rect.stroke = preset.border ?? calced.rect.stroke;
        calced.text.fill = preset.color ?? calced.text.fill;
        calced.line.stroke = preset.border ?? calced.line.stroke;
        return calced;
    }

    protected getBlockHeight(blocks: BlockItems[]): number {
        return (this.svg.getFontHeight() + blocks.reduce((sum, block) => sum + block.items.length * this.svg.getFontHeight() + (block.title ? this.svg.getFontHeight(0.9) : 0), 0));
    }

    protected makeClassesForBlock(name: string, inBlocks: string[], outBlocks: string[]): string {
        return [
            name && `block__cur_${hash(name)}`,
            inBlocks.map(name => `block__in_${hash(name)}`).join(' '),
            outBlocks.map(name => `block__out_${hash(name)}`).join(' '),
        ].filter(Boolean).join(' ');
    }

    protected block(p: Point, name: PresetedValue, blocks: BlockItems[], inBlocks: string[], outBlocks: string[]): this {
        let text = '';
        while (this.svg.getTextLength(text + '_') < this.options.blockWidth) {
            text += '_';
        }
        let shortText = '';
        while (this.svg.getTextLength(shortText + '_') < this.options.blockWidth) {
            shortText += '_';
        }
        const line = this.svg.getFontHeight();
        const shortLine = this.svg.getFontHeight(0.9);
        let cy = p.y + line;
        this.svg.groupStart({ className: this.makeClassesForBlock(name.value, inBlocks, outBlocks) });
        const namePreset = this.calcPreset(name.presets);
        this.svg.rect({ x: p.x, y: cy - line, width: this.options.blockWidth, height: line }, { style: { ...namePreset.rect, 'stroke': 'none' } });
        this.svg.text({ x: p.x, y: cy }, name.value.slice(-text.length), { style: { 'font-weight': 'bold', ...namePreset.text } });
        if (blocks.length) {
            blocks.forEach((block) => {
                if (block.title) {
                    cy = cy + shortLine;
                    this.svg.rect({ x: p.x, y: cy - shortLine, width: this.options.blockWidth, height: shortLine }, { style: { 'stroke': 'none', fill: '#fff' } });
                    this.svg.text({ x: p.x, y: cy }, block.title.slice(-shortText.length), { style: { fill: '#555', 'font-weight': 'bold', 'text-decoration': 'underline' } }, 0.9);
                    this.svg.line({ x: p.x, y: cy - shortLine }, { x: p.x + this.options.blockWidth, y: cy - shortLine }, { style: namePreset.rect });
                }
                block.items.forEach((pvalue, i) => {
                    if (i > 0) {
                        this.svg.line({ x: p.x, y: cy }, { x: p.x + this.options.blockWidth, y: cy }, { style: { ...namePreset.rect, 'stroke-dasharray': '4 4' } });
                    }
                    cy = cy + line;
                    const preset = this.calcPreset(pvalue.presets);
                    this.svg.rect({ x: p.x, y: cy - line, width: this.options.blockWidth, height: line }, { style: { ...preset.rect, 'stroke': 'none' } });
                    this.svg.text({ x: p.x, y: cy }, pvalue.value.slice(-text.length), { style: preset.text });
                });
                this.svg.line({ x: p.x, y: cy - block.items.length * line }, { x: p.x + this.options.blockWidth, y: cy - block.items.length * line }, { style: namePreset.rect });
            });
        }
        this.svg.rect({ x: p.x, y: p.y, width: this.options.blockWidth, height: this.getBlockHeight(blocks) }, { style: { ...namePreset.rect, 'fill': 'none' } });
        this.svg.groupEnd();
        return this;
    }

    addBlock(block: Block): this {
        this.blocks.push(block);
        return this;
    }

    addRef(ref: Ref): this {
        this.refs.push(ref);
        return this;
    }

    getRefs(from: string): Ref[] {
        return this.refs.filter(ref => ref.from === from);
    }

    extractInfo(): BlocksInfo {
        const info: BlocksInfo = {};
        this.blocks.forEach((block) => {
            if (!info[block.title.value]) {
                info[block.title.value] = {
                    title: block.title.value,
                    block,
                    out: block.refs.map(({ to }) => to.value),
                    in: [],
                }
            } else {
                info[block.title.value].block = block;
                info[block.title.value].out = block.refs.map(({ to }) => to.value);
            }
            block.refs.forEach((ref) => {
                if (!info[ref.to.value]) {
                    info[ref.to.value] = {
                        title: ref.to.value,
                        block: undefined,
                        out: [],
                        in: [],
                    }
                }
            });
        });
        this.blocks.forEach((block) => {
            block.refs.forEach((ref) => {
                info[ref.to.value].in.push(block.title.value);
            });
        });
        return info;
    }

    getOrderOfBlocks(info: BlocksInfo): string[][] {
        const cond: { [index: string]: string[] } = {};
        Object.keys(info).forEach((key) => {
            const value = String(info[key].in.length);
            if (!cond[value]) {
                cond[value] = [];
            }
            cond[value].push(key);
        });
        const order = Object.keys(cond).map(Number).sort((a, b) => a - b).map(key => cond[key]);
        for (let i = 0; i < order.length; i++) {
            const refs: string[] = order[i].reduce((arr: string[], name: string) => arr.concat(info[name].block?.refs.map(({ to }) => to.value) ?? []), []);
            for (let j = i + 1, length = order.length; j < length; j++) {
                const unfound: string[] = order[j].filter(name => !refs.includes(name));
                if (j - 1 !== i) {
                    order[j - 1] = order[j - 1].concat(order[j].filter(name => refs.includes(name)));
                    order[j] = unfound;
                } else {
                    if (unfound.length === order[j].length) {
                        continue;
                    }
                    order[j] = order[j].filter(name => refs.includes(name));
                    if (unfound.length) {
                        order[j + 1] = order[j + 1] ? order[j + 1].concat(unfound) : unfound;
                    }
                }
            }
        }
        return order;
    }

    getOrderOfBlocks2(info: BlocksInfo): string[][] {
        const cond: { [index: string]: string[] } = {};
        Object.keys(info).forEach((key) => {
            const value = String(info[key].in.length);
            if (!cond[value]) {
                cond[value] = [];
            }
            cond[value].push(key);
        });
        let currents = Object.keys(cond).map(Number).sort((a, b) => a - b).map(key => cond[key])[0] ?? [];
        const order: string[][] = [currents];
        const has: string[] = currents.concat();
        // console.log(order);
        while (currents.length) {
            const added = currents
                .reduce((arr: string[], key: string) => {
                    return arr.concat(info[key].block?.refs.map(({ to }) => to.value) ?? []);
                }, [])
                .filter((key, i, arr) => !has.includes(key) && arr.indexOf(key) === i);
            has.push(...added);
            if (added.length) {
                order.push(added);
            }
            currents = added;
            // console.log(order);
        }
        return order;
    }

    getOrderOfBlocks3(info: BlocksInfo): string[][] {
        const cond: { [index: string]: string[] } = {};
        Object.keys(info).forEach((key) => {
            const value = String(info[key].in.length);
            if (!cond[value]) {
                cond[value] = [];
            }
            cond[value].push(key);
        });
        let currents = Object.keys(cond).map(Number).sort((a, b) => a - b).map(key => cond[key])[0] ?? [];
        const order: string[][] = [currents];
        const has: string[] = currents.concat();
        // console.log(order);
        while (currents.length) {
            let added = currents
                .reduce((arr: string[], key: string) => {
                    return arr.concat(info[key].out);
                }, [])
                .filter((key, i, arr) => !has.includes(key) && arr.indexOf(key) === i);
            const filtered = added.filter((key) => {
                //console.log(key, info[key].in);
                return info[key].in.every(inkey => has.includes(inkey));
            });
            if (filtered.length) {
                added = filtered;
            }
            has.push(...added);
            if (added.length) {
                order.push(added);
            }
            currents = added;
            // console.log(order);
        }
        return order;
    }

    makeLayout(info: BlocksInfo, orderOfBlocks: string[][]): Layout {
        const layout: Layout = {};
        orderOfBlocks.forEach((order, i) => {
            let height = i % 2 === 0 ? this.options.blockMergeVer : 0;
            order.forEach((key, j) => {
                layout[key] = {
                    y: height,
                    x: i * (this.options.blockWidth + this.options.blockMergeHor) + (j % 2 === 0 ? this.options.blockMergeHor / 4 : 0),
                    width: this.options.blockWidth,
                    height: this.getBlockHeight(info[key].block?.blocks ?? []),
                };
                height += this.getBlockHeight(info[key].block?.blocks ?? []) + this.options.blockMergeVer;
            });
        });

        return layout;
    }

    getDirection(bFrom: Dimention, bTo: Dimention): [Directions, Directions] {
        let from: Directions;
        let to: Directions;
        if (Math.max(bFrom.x + bFrom.width, bTo.x + bTo.width) - Math.min(bFrom.x, bTo.x) < (bFrom.width + bTo.width) * 1) {
            from = Directions.bottom;
            to = Directions.top;
            if (bFrom.y > bTo.y) {
                [from, to] = [to, from];
            }
        } else if (Math.max(bFrom.y + bFrom.height, bTo.y + bTo.height) - Math.min(bFrom.y, bTo.y) < (bFrom.height + bTo.height) * 1.5) {
            from = Directions.right;
            to = Directions.left;
            if (bFrom.x > bTo.x) {
                [from, to] = [to, from];
            }
        } else {
            if (bFrom.x < bTo.x) {
                from = Directions.right;
            } else {
                from = Directions.left;
            }
            if (bFrom.y < bTo.y) {
                to = Directions.top;
            } else {
                to = Directions.bottom;
            }
        }

        return [from, to];
    }

    getLinePosition(dim: Dimention, i: number, count: number, direction: Directions, isIn: boolean): Point {
        const offsetWidth = dim.width / 12;
        const offsetHeight = dim.height / 12;
        switch (direction) {
            case Directions.left:
                return { x: dim.x, y: dim.y + offsetHeight + (dim.height - 2 * offsetHeight) * (isIn ? i + 0.5 : count - i - 0.5) / count };
            case Directions.right:
                return { x: dim.x + dim.width, y: dim.y + offsetHeight + (dim.height - 2 * offsetHeight) * (!isIn ? i + 0.5 : count - i - 0.5) / count };
            case Directions.top:
                return { x: dim.x + offsetWidth + (dim.width - 2 * offsetWidth) * (!isIn ? i + 0.5 : count - i - 0.5) / count, y: dim.y };
            case Directions.bottom:
            default:
                return { x: dim.x + offsetWidth + (dim.width - 2 * offsetWidth) * (isIn ? i + 0.5 : count - i - 0.5) / count, y: dim.y + dim.height };
        }
    }

    drawLayout(info: BlocksInfo, layout: Layout, orderOfBlocks: string[][]): void {
        // draw lines
        const lines: {
            [index: string]: {
                [Directions.left]: { count: number; i: number; j: number; };
                [Directions.right]: { count: number; i: number; j: number; };
                [Directions.top]: { count: number; i: number; j: number; };
                [Directions.bottom]: { count: number; i: number; j: number; };
            };
        } = {};
        Object.keys(layout).forEach((key) => {
            lines[key] = {
                [Directions.left]: { count: 0, i: 0, j: 0, },
                [Directions.right]: { count: 0, i: 0, j: 0, },
                [Directions.top]: { count: 0, i: 0, j: 0, },
                [Directions.bottom]: { count: 0, i: 0, j: 0, },
            };
        });
        Object.keys(info).forEach((key) => {
            const block = info[key].block;
            if (block !== undefined) {
                const title = block.title;
                block.refs.forEach((ref) => {
                    const [from, to] = this.getDirection(layout[title.value], layout[ref.to.value]);
                    lines[title.value][from].count++;
                    lines[ref.to.value][to].count++;
                });
            }
        });
        for (let i = 0; ; i++) {
            const level = orderOfBlocks.map(level => level[i]);
            if (!level.some(Boolean)) {
                break;
            }
            // console.log(level);
            [1, 0].forEach((k, i, arr) => {
                level.filter((el, j) => j % arr.length === k && el).forEach((key) => {
                    const block = info[key].block;
                    if (block !== undefined) {
                        const title = block.title;
                        block.refs.forEach((ref) => {
                            const [from, to] = this.getDirection(layout[title.value], layout[ref.to.value]);
                            const pFrom = this.getLinePosition(layout[title.value], lines[title.value][from].i, lines[title.value][from].count, from, false);
                            const pTo = this.getLinePosition(layout[ref.to.value], lines[ref.to.value][to].j, lines[ref.to.value][to].count, to, true);
                            const preset = this.calcPreset(ref.to.presets);
                            this.svg.curv(pFrom, pTo, { start: ref.start, end: ref.end, text: ref.text, from: ArcDirections[from], to: ArcDirections[to], className: this.makeClassesForBlock('', [title.value], [ref.to.value]), style: preset.line });
                            lines[title.value][from].i++;
                            lines[ref.to.value][to].j++;
                        });
                    }
                });
            });
        }
        Object.keys(layout).forEach((key) => {
            this.block({ x: layout[key].x, y: layout[key].y }, { value: info[key].title, presets: info[key].block?.title.presets || [] }, info[key].block?.blocks ?? [], info[key].in, info[key].out);
        });
    }

    make(title: string): string {
        const info = this.extractInfo();
        const orderOfBlocks = this.getOrderOfBlocks3(info);
        const layout = this.makeLayout(info, orderOfBlocks);
        // console.log(orderOfBlocks, layout);
        this.drawLayout(info, layout, orderOfBlocks);
        return this.svg.make(title);
    }

    build(project: Project): string {
        Object.keys(project.presets).forEach((preset) => {
            this.addPreset(preset, project.presets[preset]);
        });
        // project.blocks.forEach((block) => {
        //     this.addBlock(block);
        // });

        return this.make(project.title);
    }
}

/*
document.addEventListener('click', (event) => {
    document.querySelectorAll('[class*="block__"]').forEach((el) => el.style.opacity = '1');
    const g = event.target.closest('g');
    if (g) {
        const name = g.classList.value.match(/block__cur_([^ ]+)/)?.[1];
        document.querySelectorAll(`[class*="block__"]:not([class*="${name}"])`).forEach((el) => el.style.opacity = '0.2');
    }
});
*/