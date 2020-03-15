export type IOptions = {
    dir: string,
    excludes?: string[],
    types?: string[],
    aliases?: {
        [index: string]: string
    },
    output: string,
}

export interface IFileInfoImport {
    file: string,
    default?: string,
    vars: [string, string][]
}

export interface IFileInfoExports {
    default?: {
        type: string,
        name: string,
    },
    vars: {
        type: string,
        name: [string, string],
    }[]
}

export interface IFileInfo {
    file: string,
    imports: IFileInfoImport[],
    exports: IFileInfoExports,
}

export interface IProjectInfo {
    files: {
        [index: string]: IFileInfo
    },
}

export interface IDrawer {
    draw(projectInfo: IProjectInfo, options?: Object): { data: any, type: string }
}