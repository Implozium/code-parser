import { hash } from "./common";

export interface SVGStyle {
    stroke?: string;
    fill?: string;
    [propName: string]: any;
}

export enum MarkerTypes {
    triangle = 'triangle',
    triangleEmpty = 'triangle-empty',
    diamond = 'diamond',
    diamondEmpty = 'diamond-empty',
    circle = 'circle',
    circleEmpty = 'circle-empty',
}

export interface SVGOptions {
    id?: string;
    className?: string
    style?: SVGStyle;
    end?: MarkerTypes;
    start?: MarkerTypes;
    [index: string]: any;
}

export interface SVGContainerOptions {
    options?: SVGOptions;
    padding?: number;
    fontSize?: number;
    textPadding?: number,
    [index: string]: any;
}

export enum ArcDirections {
    hor = 'horizontal',
    ver = 'vertical',
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
}

export interface SVGArcOptions extends SVGOptions {
    from?: ArcDirections,
    to?: ArcDirections,
    text?: string;
}

export interface Point {
    x: number;
    y: number;
}

export interface Dimention extends Point {
    width: number;
    height: number;
}

export default class SVGContainer {
    protected output: string[] = [];
    protected options: Required<SVGContainerOptions>;
    protected size = {
        height: 0,
        width: 0,
    };
    protected defaultStyle: SVGStyle = {
        stroke: '#000000',
        fill: 'none'
    };
    protected markers: Record<MarkerTypes, string> = {
        [MarkerTypes.triangle]: `
        <marker id="triangle" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 L 5 5 z" fill="#000"/>
        </marker>`,
        [MarkerTypes.triangleEmpty]: `
        <marker id="triangle-empty" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff" stroke="#000"/>
        </marker>`,
        [MarkerTypes.diamond]: `
        <marker id="diamond" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <path d="M 5 1 L 9 5 L 5 9 L 1 5 z" fill="#000"/>
        </marker>`,
        [MarkerTypes.diamondEmpty]: `
        <marker id="diamond-empty" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <path d="M 5 1 L 9 5 L 5 9 L 1 5 z" fill="#fff" stroke="#000"/>
        </marker>`,
        [MarkerTypes.circle]: `
        <marker id="circle" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <circle cx="5" cy="5" r="4" fill="#000"/>
        </marker>`,
        [MarkerTypes.circleEmpty]: `
        <marker id="circle-empty" viewBox="0 0 10 10"
            refX="10" refY="5"
            markerUnits="strokeWidth"
            markerWidth="10" markerHeight="10"
            orient="auto">
        <circle cx="5" cy="5" r="4" fill="#fff" stroke="#000"/>
        </marker>`
    }

    constructor(options: SVGContainerOptions = {}) {
        this.options = {
            padding: 16,
            fontSize: 12,
            textPadding: 12,
            options: {},
            ...options,
        };
        this.options.options.style = {
            'font-size': this.options.fontSize + 'pt',
            'font-family': 'Consolas',
            'stroke-width': 1,
            'stroke-linejoin': 'round',
            'stroke-linecap': 'round',
            ...this.options.options.style
        };
    }

    protected add(str: string): this {
        this.output.push(str);
        return this;
    }

    private nv(n: number): number {
        return this.options.padding + n;
    }

    private np<T extends Point>(point: T): T {
        return {
            ...point,
            x: this.nv(point.x),
            y: this.nv(point.y),
        };
    }

    private setSize(width: number, height: number): void {
        if (this.size.width < width) {
            this.size.width = width;
        }
        if (this.size.height < height) {
            this.size.height = height;
        }
    }

    protected makeOptions(options: SVGOptions = {}): string {
        const calcedStyle = { ...this.defaultStyle, ...options.style };
        const style = Object.entries(calcedStyle).map(([ key, value ]) => `${key}:${value}`).join(';');

        return [
            options.id ? `id="${options.id}"` : '',
            options.className ? `class="${options.className}"` : '',
            options.end ? `marker-end="url(#${options.end})"` : '',
            options.start ? `marker-start="url(#${options.start}-start)"` : '',
            `style="${style}"`
        ].filter(Boolean).join(' ');
    }

    measureText(str: string, fontSize: number = 10): number {
        const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.55,0.55,0.55,0.7,0.6,0.7,0.6,0.55,0.55,0.55,0.55,0.6,0.55,0.55,0.55,0.55,0.6,0.6,0.6,0.6,0.7,0.6,0.6,0.6,0.6,0.6,0.55,0.55,0.55,0.6,0.6,0.55,0.7,0.7,0.6,0.6,0.6,0.55,0.55,0.6,0.6,0.55,0.55,0.6,0.6,0.7,0.6,0.6,0.6,0.6,0.6,0.6,0.6,0.6,0.7,0.7,0.7,0.7,0.6,0.55,0.6,0.55,0.6,0.7,0.55,0.55,0.6,0.55,0.55,0.6,0.6,0.6,0.55,0.6,0.55,0.6,0.6,0.6,0.55,0.6,0.6,0.55,0.6,0.55,0.55,0.55,0.6,0.7,0.6,0.6,0.6,0.55,0.55,0.55,0.6]
        const avg = 0.5942105263157896
        return !str ? 0 : str
          .split('')
          .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
          .reduce((cur, acc) => acc + cur) * fontSize;
    }

    getTextLength(str: string, k: number = 1): number {
        return this.measureText(str, this.options.fontSize * k) + this.options.textPadding * 2;
    }

    getFontHeight(k: number = 1): number {
        return this.options.fontSize * 1.5 * k + this.options.textPadding * 2;
    }

    rect(dim: Dimention, options: SVGOptions = {}): this {
        const ndim = this.np(dim);
        this.setSize(ndim.x + ndim.width, ndim.y + ndim.height);
        this.add(`<rect x="${ndim.x}" y="${ndim.y}" width="${ndim.width}" height="${ndim.height}" ${this.makeOptions(options)} />`);
        return this;
    }

    circle(center: Point, r: number, options: SVGOptions = {}): this {
        const nc = this.np(center);
        this.setSize(nc.x + r, nc.y + r);
        this.add(`<circle cx="${nc.x}" cy="${nc.y}" r="${r}" ${this.makeOptions(options)} />`);
        return this;
    }

    line(from: Point, to: Point, options: SVGOptions = {}): this {
        const nfrom = this.np(from);
        const nto = this.np(to);
        this.setSize(Math.max(nfrom.x, nto.x), Math.max(nfrom.y, nto.y));
        this.add(`<path d="M${nfrom.x} ${nfrom.y} L${nto.x} ${nto.y}" ${this.makeOptions(options)} />`);
        return this;
    }

    bend(from: Point, to: Point, options: SVGArcOptions = {}): this {
        const nfrom = this.np(from);
        const nto = this.np(to);
        this.setSize(Math.max(nfrom.x, nto.x), Math.max(nfrom.y, nto.y));
        const cX = Math.min(nto.x, nfrom.x) + Math.abs(nto.x - nfrom.x) / 2;
        const cY = Math.min(nto.y, nfrom.y) + Math.abs(nto.y - nfrom.y) / 2;
        const signXfrom = options.from === ArcDirections.left ? -1 : options.from === ArcDirections.right ? 1 : Math.sign(nto.x - nfrom.x);
        const signYfrom = options.from === ArcDirections.top ? -1 : options.from === ArcDirections.bottom ? 1 : Math.sign(nto.y - nfrom.y);
        const signXto = options.to === ArcDirections.left ? -1 : options.to === ArcDirections.right ? 1 : -Math.sign(nto.x - nfrom.x);
        const signYto = options.to === ArcDirections.top ? -1 : options.to === ArcDirections.bottom ? 1 : -Math.sign(nto.y - nfrom.y);
        const isHor = Math.abs(nto.x - nfrom.x) > Math.abs(nto.y - nfrom.y);
        const points: Point[] = [];
        points.push({
            x: nfrom.x,
            y: nfrom.y,
        });
        if (options.from === ArcDirections.left || options.from === ArcDirections.right || options.from === ArcDirections.hor || !options.from && isHor) {
            points.push({
                x: nfrom.x + signXfrom * Math.abs(nto.x - nfrom.x) * 3 / 4,
                y: nfrom.y,
            });
        } else if (options.from === ArcDirections.top || options.from === ArcDirections.bottom || options.from === ArcDirections.ver || !options.from && !isHor) {
            points.push({
                x: nfrom.x,
                y: nfrom.y + signYfrom * Math.abs(nto.y - nfrom.y) * 3 / 4,
            });
        }
        if (options.to === ArcDirections.left || options.to === ArcDirections.right || options.to === ArcDirections.hor || !options.from && isHor) {
            points.push({
                x: nto.x + signXto * Math.abs(nto.x - nfrom.x) * 3 / 4,
                y: nto.y,
            });
        } else if (options.to === ArcDirections.top || options.to === ArcDirections.bottom || options.to === ArcDirections.ver || !options.from && !isHor) {
            points.push({
                x: nto.x,
                y: nto.y + signYto * Math.abs(nto.y - nfrom.y) * 3 / 4,
            });
        }
        points.push({
            x: nto.x,
            y: nto.y,
        });
        const id = hash(options.className ?? '');
        this.add(`<path id="${id}" d="M${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}" ${this.makeOptions(options)} />`);
        if (options.text) {
            this.textAtLine(id, options);
        }
        // const p = this.options.padding;
        // this.options.padding = 0;
        // this.circle(points[0], 2);
        // points.slice(1, -1).forEach((p) => {
        //     this.circle(p, 2);
        // });
        // this.line(points[0], points[1]);
        // this.line(points[2], points[3]);
        // this.line(points[4], points[5]);
        // this.options.padding = p;
        return this;
    }

    arc(from: Point, to: Point, options: SVGArcOptions = {}): this {
        const nfrom = this.np(from);
        const nto = this.np(to);
        this.setSize(Math.max(nfrom.x, nto.x), Math.max(nfrom.y, nto.y));
        const cX = Math.min(nto.x, nfrom.x) + Math.abs(nto.x - nfrom.x) / 2;
        const cY = Math.min(nto.y, nfrom.y) + Math.abs(nto.y - nfrom.y) / 2;
        const signXfrom = options.from === ArcDirections.left ? -1 : options.from === ArcDirections.right ? 1 : Math.sign(nto.x - nfrom.x);
        const signYfrom = options.from === ArcDirections.top ? -1 : options.from === ArcDirections.bottom ? 1 : Math.sign(nto.y - nfrom.y);
        const signXto = options.to === ArcDirections.left ? -1 : options.to === ArcDirections.right ? 1 : -Math.sign(nto.x - nfrom.x);
        const signYto = options.to === ArcDirections.top ? -1 : options.to === ArcDirections.bottom ? 1 : -Math.sign(nto.y - nfrom.y);
        const isHor = Math.abs(nto.x - nfrom.x) > Math.abs(nto.y - nfrom.y);
        const points: Point[] = [];
        points.push({
            x: nfrom.x,
            y: nfrom.y,
        });
        if (options.from === ArcDirections.left || options.from === ArcDirections.right || options.from === ArcDirections.hor || !options.from && isHor) {
            points.push({
                x: nfrom.x + signXfrom * Math.abs(nto.x - nfrom.x) / 2,
                y: nfrom.y,
            });
            points.push({
                x: nfrom.x + signXfrom * Math.abs(nto.x - nfrom.x) / 2,
                y: nfrom.y + signYfrom * Math.abs(nto.y - nfrom.y) / 8,
            });
        } else if (options.from === ArcDirections.top || options.from === ArcDirections.bottom || options.from === ArcDirections.ver || !options.from && !isHor) {
            points.push({
                x: nfrom.x,
                y: nfrom.y + signYfrom * Math.abs(nto.y - nfrom.y) / 2,
            });
            points.push({
                x: nfrom.x + signXfrom * Math.abs(nto.x - nfrom.x) / 8,
                y: nfrom.y + signYfrom * Math.abs(nto.y - nfrom.y) / 2,
            });
        }
        points.push({
            x: cX,
            y: cY,
        });
        if (options.to === ArcDirections.left || options.to === ArcDirections.right || options.to === ArcDirections.hor || !options.from && isHor) {
            points.push({
                x: nto.x + signXto * Math.abs(nto.x - nfrom.x) / 2,
                y: nto.y,
            });
        } else if (options.to === ArcDirections.top || options.to === ArcDirections.bottom || options.to === ArcDirections.ver || !options.from && !isHor) {
            points.push({
                x: nto.x,
                y: nto.y + signYto * Math.abs(nto.y - nfrom.y) / 2,
            });
        }
        points.push({
            x: nto.x,
            y: nto.y,
        });
        const id = hash(options.className ?? '');
        this.add(`<path id="${id}" d="M${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y} S${points[4].x} ${points[4].y} ${points[5].x} ${points[5].y}" ${this.makeOptions(options)} />`);
        if (options.text) {
            this.textAtLine(id, options);
        }
        // const p = this.options.padding;
        // this.options.padding = 0;
        // this.circle(points[0], 2);
        // points.slice(1, -1).forEach((p) => {
        //     this.circle(p, 2);
        // });
        // this.line(points[0], points[1]);
        // this.line(points[2], points[3]);
        // this.line(points[4], points[5]);
        // this.options.padding = p;
        return this;
    }
    
    curv(from: Point, to: Point, options: SVGArcOptions = {}): this {
        if (
            (options.from === ArcDirections.left || options.from === ArcDirections.right) && (options.to === ArcDirections.top || options.to === ArcDirections.bottom)
            || (options.from === ArcDirections.top || options.from === ArcDirections.bottom) && (options.to === ArcDirections.left || options.to === ArcDirections.right)
        ) {
            return this.bend(from, to, options);
        }
        return this.arc(from, to, options);
    }

    text(p: Point, text: string, options: SVGOptions = {}, k: number = 1): this {
        const np = this.np(p);
        this.setSize(np.x + this.getTextLength(text, k), np.y);
        options.style = {
            fill: this.defaultStyle.stroke,
            stroke: 'none',
            'font-size': this.options.fontSize * k + 'pt',
            ...options.style
        }
        this.add(`<text x="${np.x + this.options.textPadding}" y="${np.y - this.options.fontSize * 0.25 / 1.5 * k - this.options.textPadding}" ${this.makeOptions(options)}>${text}</text>`);
        return this;
    }

    textAtLine(id: string, options: SVGArcOptions = {}): this {
        this.add(`<text dy="-4" letter-spacing="2" font-weight="200" class="${options.className}"><textPath href="#${id}" startOffset="${40}">${options.text}</textPath></text>`);
        return this;
    }

    groupStart(options: SVGOptions = {}): this {
        this.add(`<g ${this.makeOptions(options)}>`);
        return this;
    }

    groupEnd(): this {
        this.add(`</g>`);
        return this;
    }

    getSize(): { width: number, height: number } {
        return {
            width: this.size.width + this.options.padding * 2,
            height: this.size.height + this.options.padding * 2,
        }
    }

    make(title: string = '') {
        const size = this.getSize();

        return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ev="http://www.w3.org/2001/xml-events"
            viewbox="0 0 ${size.width} ${size.height}" width="${size.width}" height="${size.height}" ${this.makeOptions(this.options.options)}>
            <title>${title}</title>
            <defs>
                ${Object.values(this.markers).join('\n')}
                ${Object.values(this.markers).map(str => str.replace('refX="10"', 'refX="0"').replace(/id="([^"]+)"/, `id="$1-start"`)).join('\n')}
            </defs>
            ${this.output.join('\n')}
        </svg>`;
    }
}