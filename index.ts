import ProjectInfo from './src/ProjectInfo';
import SVGDrawer from './src/SVGDrawer';
import Config from './src/Config';

const [ , , type, ...rest ] = process.argv;
console.log(type, rest);

switch (type) {
    case 'draw':
        new Config().load(rest[0])
            .then((options) => new ProjectInfo(options).init())
            .then(aProjectInfo => aProjectInfo.draw(new SVGDrawer()))
            .catch(err => console.error(err))
        break;
    default:
        console.log(`Unknown command ${type}`);
}

// const options: IOptions = {
//     // dir: '../Boards/frontend',
//     dir: './',
//     // dir: 'E:/Downloads/nlk-master/src/frontend',
//     excludes: [
//         'node_modules',
//         'coverage',
//         'test',
//         'babel',
//         'webpack',
//         'dist'
//     ],
//     types: ['js', 'vue', 'jsx', 'ts'],
//     aliases: {
//         '@': 'src'
//     },
//     output: 'out/this.svg'
// };

// new ProjectInfo(options)
//     .init()
//     .then(aProjectInfo => aProjectInfo.draw(new SVGDrawer()));

// const options1: IOptions = {
//     // dir: '../Boards/frontend',
//     dir: '../tic-tac-toe-react',
//     // dir: 'E:/Downloads/nlk-master/src/frontend',
//     excludes: [
//         'node_modules',
//         'coverage',
//         'test',
//         'babel',
//         'webpack',
//         'dist'
//     ],
//     types: ['js', 'vue', 'jsx', 'ts'],
//     aliases: {
//         '@': 'src'
//     },
//     output: 'out/tic-tac-toe.svg'
// };

// new ProjectInfo(options1)
//     .init()
//     .then(aProjectInfo => aProjectInfo.draw(new SVGDrawer()));