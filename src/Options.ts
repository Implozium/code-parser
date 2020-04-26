type Options = {
    dir: string,
    excludes?: string[],
    types?: string[],
    aliases?: {
        [index: string]: string
    },
    output: string,
}

export default Options;
