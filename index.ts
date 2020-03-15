import ProjectInfo from './src/ProjectInfo';
import { IOptions } from './src/types';

const options: IOptions = {
    // dir: '../Boards/frontend',
    dir: './',
    // dir: 'E:/Downloads/nlk-master/src/frontend',
    excludes: [
        'node_modules',
        'coverage',
        'test',
        'babel',
        'webpack',
        'dist'
    ],
    types: ['js', 'vue', 'jsx', 'ts'],
    aliases: {
        '@': 'src'
    },
    output: 'out/this.svg'
};

new ProjectInfo(options)
    .init()
    .then(aProjectInfo => aProjectInfo.draw());

const options1: IOptions = {
    // dir: '../Boards/frontend',
    dir: '../tic-tac-toe-react',
    // dir: 'E:/Downloads/nlk-master/src/frontend',
    excludes: [
        'node_modules',
        'coverage',
        'test',
        'babel',
        'webpack',
        'dist'
    ],
    types: ['js', 'vue', 'jsx', 'ts'],
    aliases: {
        '@': 'src'
    },
    output: 'out/tic-tac-toe.svg'
};

new ProjectInfo(options1)
    .init()
    .then(aProjectInfo => aProjectInfo.draw());