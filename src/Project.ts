export interface PresetedValue {
    value: string;
    presets: string[];
}

export interface Ref {
    from: string;
    to: string;
    text?: string;
    markerFrom?: string;
    markerTo?: string;
    presets: string[];
}

export interface Part {
    name: string;
    items: PresetedValue[];
}

export interface Block {
    name: string;
    presets: string[];
    parts: Part[];
}

export interface Preset {
    fill?: string;
    border?: string;
    color?: string;
    [propName: string]: any;
}

export interface Presets {
    [index: string]: Preset;
}

export interface Project {
    presets: Presets;
    title: string;
    blocks: Block[];
    refs: Ref[];
}