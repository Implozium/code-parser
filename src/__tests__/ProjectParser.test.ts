import ProjectParser from '../ProjectParser';

describe('extractPresets', () => {
    test('one line', () => {
        const projectParser = new ProjectParser();
        const text = `<+> { fill: red; color: white; } `;
        expect(projectParser.extractPresets(text)).toEqual({
            '+': {
                fill: 'red',
                color: 'white',
            }
        });
    });
    test('multi line', () => {
        const projectParser = new ProjectParser();
        const text = `<+> {
            fill: red;
            color: white;
        }`;
        expect(projectParser.extractPresets(text)).toEqual({
            '+': {
                fill: 'red',
                color: 'white',
            }
        });
    });
    test('empty values', () => {
        const projectParser = new ProjectParser();
        const text = `<+> {}`;
        expect(projectParser.extractPresets(text)).toEqual({
            '+': {}
        });
    });
    test('empty', () => {
        const projectParser = new ProjectParser();
        const text = `<> {}`;
        expect(projectParser.extractPresets(text)).toEqual({});
    });
    test('multi presets', () => {
        const projectParser = new ProjectParser();
        const text = `<+> {
            fill: red;
            color: white;
        }
        <-> {
            fill: grey;
        }`;
        expect(projectParser.extractPresets(text)).toEqual({
            '+': {
                fill: 'red',
                color: 'white',
            },
            '-': {
                fill: 'grey',
            }
        });
    });
    test('override preset', () => {
        const projectParser = new ProjectParser();
        const text = `<+> {
            fill: red;
            color: white;
        }
        <+> {
            fill: grey;
        }`;
        expect(projectParser.extractPresets(text)).toEqual({
            '+': {
                fill: 'grey',
                color: 'white',
            },
        });
    });
});

describe('extractValue', () => {
    test('value', () => {
        const projectParser = new ProjectParser();
        const text = `value`;
        expect(projectParser.extractValue(text)).toEqual({
            value: 'value',
            presets: [],
        });
    });
    test('value with presets', () => {
        const projectParser = new ProjectParser();
        const text = `<+|->value`;
        expect(projectParser.extractValue(text)).toEqual({
            value: 'value',
            presets: ['+', '-'],
        });
    });
});

describe('extractPart', () => {
    test('name', () => {
        const projectParser = new ProjectParser();
        const text = `{name}`;
        expect(projectParser.extractPart(text)).toEqual({
            name: 'name',
            items: [],
        });
    });
    test('item', () => {
        const projectParser = new ProjectParser();
        const text = `value`;
        expect(projectParser.extractPart(text)).toEqual({
            name: '',
            items: [{
                value: 'value',
                presets: [],
            }],
        });
    });
    test('name with items', () => {
        const projectParser = new ProjectParser();
        const text = `{name} one; two`;
        expect(projectParser.extractPart(text)).toEqual({
            name: 'name',
            items: [{
                value: 'one',
                presets: [],
            }, {
                value: 'two',
                presets: [],
            }],
        });
    });
    test('name with item with presets', () => {
        const projectParser = new ProjectParser();
        const text = `{name2} <+>a`;
        expect(projectParser.extractPart(text)).toEqual({
            name: 'name2',
            items: [{
                value: 'a',
                presets: ['+'],
            }],
        });
    });
    test('name with items with presets', () => {
        const projectParser = new ProjectParser();
        const text = `{name} <->one; <+>two`;
        expect(projectParser.extractPart(text)).toEqual({
            name: 'name',
            items: [{
                value: 'one',
                presets: ['-'],
            }, {
                value: 'two',
                presets: ['+'],
            }],
        });
    });
});

describe('extractBlocks', () => {
    test('name', () => {
        const projectParser = new ProjectParser();
        const text = `[hello]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: [],
                parts: [],
            }
        ]);
    });
    test('name with preset', () => {
        const projectParser = new ProjectParser();
        const text = `[<+> hello]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+'],
                parts: [],
            }
        ]);
    });
    test('name with presets', () => {
        const projectParser = new ProjectParser();
        const text = `[<+|-> hello]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+', '-'],
                parts: [],
            }
        ]);
    });
    test('name with presets and part', () => {
        const projectParser = new ProjectParser();
        const text = `[<+|-> hello| a; b]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+', '-'],
                parts: [{
                    name: '',
                    items: [{
                        value: 'a',
                        presets: [],
                    }, {
                        value: 'b',
                        presets: [],
                    }],
                }],
            }
        ]);
    });
    test('name with presets and part with name', () => {
        const projectParser = new ProjectParser();
        const text = `[<+|-> hello| {name} a; b]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+', '-'],
                parts: [{
                    name: 'name',
                    items: [{
                        value: 'a',
                        presets: [],
                    }, {
                        value: 'b',
                        presets: [],
                    }],
                }],
            }
        ]);
    });
    test('name with presets and parts with name', () => {
        const projectParser = new ProjectParser();
        const text = `[<+|-> hello| {name} a; b| {name2} <+>a]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+', '-'],
                parts: [{
                    name: 'name',
                    items: [{
                        value: 'a',
                        presets: [],
                    }, {
                        value: 'b',
                        presets: [],
                    }],
                }, {
                    name: 'name2',
                    items: [{
                        value: 'a',
                        presets: ['+'],
                    }],
                }],
            }
        ]);
    });
    test('multiline name with presets and parts with name', () => {
        const projectParser = new ProjectParser();
        const text = `[
            <+|-> hello
            |{name} a; b
            |{name2} <+>a
        ]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'hello',
                presets: ['+', '-'],
                parts: [{
                    name: 'name',
                    items: [{
                        value: 'a',
                        presets: [],
                    }, {
                        value: 'b',
                        presets: [],
                    }],
                }, {
                    name: 'name2',
                    items: [{
                        value: 'a',
                        presets: ['+'],
                    }],
                }],
            }
        ]);
    });
    test('2 multiline name with presets and parts with name', () => {
        const projectParser = new ProjectParser();
        const text = `[
            <+|-> one
        ]
        [
            <+> two
        ]`;
        expect(projectParser.extractBlocks(text)).toEqual([
            {
                name: 'one',
                presets: ['+', '-'],
                parts: [],
            },
            {
                name: 'two',
                presets: ['+'],
                parts: [],
            }
        ]);
    });
});

describe('extractRefs', () => {
    test('from and to', () => {
        const projectParser = new ProjectParser();
        const text = `[a] - [b]`;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: '',
                markerFrom: '',
                markerEnd: '',
                presets: [],
            }
        ]);
    });
    test('from and to with text', () => {
        const projectParser = new ProjectParser();
        const text = `[a] {text} - [b]`;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: 'text',
                markerFrom: '',
                markerEnd: '',
                presets: [],
            }
        ]);
    });
    test('from and to with presets', () => {
        const projectParser = new ProjectParser();
        const text = `[a] <+|-> - [b]`;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: '',
                markerFrom: '',
                markerEnd: '',
                presets: ['+', '-'],
            }
        ]);
    });
    test('from and to and arrows', () => {
        const projectParser = new ProjectParser();
        const text = `[a] <-> [b]`;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: '',
                markerFrom: '<',
                markerEnd: '>',
                presets: [],
            }
        ]);
    });
    test('from and to with text and presets and arrows', () => {
        const projectParser = new ProjectParser();
        const text = `[a] <+|-> {text} <-> [b]`;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: 'text',
                markerFrom: '<',
                markerEnd: '>',
                presets: ['+', '-'],
            }
        ]);
    });
    test('2 from and to with text and presets and arrows', () => {
        const projectParser = new ProjectParser();
        const text = `
        [a] <+|-> {text} <-> [b]
        [a] <+|-> {text} <-> [c]
        `;
        expect(projectParser.extractRefs(text)).toEqual([
            {
                from: 'a',
                to: 'b',
                text: 'text',
                markerFrom: '<',
                markerEnd: '>',
                presets: ['+', '-'],
            },
            {
                from: 'a',
                to: 'c',
                text: 'text',
                markerFrom: '<',
                markerEnd: '>',
                presets: ['+', '-'],
            }
        ]);
    });
});

describe('parse', () => {
    test('from and to', () => {
        const projectParser = new ProjectParser();
        const text = `
        <+> {
            fill: green;
            stroke: blue;
        }
        <-> {
            fill: red;
        }
        [a
            | 1; 2
            | one
        ]
        [<+>b
            | {default} two
        ]
        [c]
        [a] - [b]
        [c] *-> [b]
        `;
        expect(projectParser.parse(text)).toEqual({
            presets: {
                '+': {
                    fill: 'green',
                    stroke: 'blue',
                },
                '-': {
                    fill: 'red',
                }
            },
            title: '',
            blocks: [
                {
                    name: 'a',
                    presets: [],
                    parts: [{
                        name: '',
                        items: [{
                            value: '1',
                            presets: [],
                        }, {
                            value: '2',
                            presets: [],
                        }],
                    }, {
                        name: '',
                        items: [{
                            value: 'one',
                            presets: [],
                        }],
                    }],
                },
                {
                    name: 'b',
                    presets: ['+'],
                    parts: [{
                        name: 'default',
                        items: [{
                            value: 'two',
                            presets: [],
                        }],
                    }],
                },
                {
                    name: 'c',
                    presets: [],
                    parts: [],
                }
            ],
            refs: [
                {
                    from: 'a',
                    to: 'b',
                    text: '',
                    markerFrom: '',
                    markerEnd: '',
                    presets: [],
                },
                {
                    from: 'c',
                    to: 'b',
                    text: '',
                    markerFrom: '*',
                    markerEnd: '>',
                    presets: [],
                }
            ]
        });
    });
});