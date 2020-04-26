export interface PresetedValue {
    value: string;
    presets: string[];
}

export interface Ref {
    from: string;
    to: string;
    text?: string;
    markerFrom?: string;
    markerEnd?: string;
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

export interface Presets {
    [index: string]: {
        [index: string]: string;
    };
}

export interface Project {
    presets: Presets;
    title: string;
    blocks: Block[];
    refs: Ref[];
}