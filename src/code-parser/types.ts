export interface BlockInfoImport {
    file: string,
    default?: string,
    vars: [string, string][]
}

export interface BlockInfoExports {
    default: {
        type: string,
        name: string,
    },
    vars: {
        type: string,
        name: [string, string],
    }[]
}

export interface BlockInfo {
    file: string,
    imports: BlockInfoImport[],
    exports: BlockInfoExports,
}

export interface ProjectInfo {
    files: {
        [index: string]: BlockInfo
    },
}
