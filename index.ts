import SVGDrawer from './src/drawers/SVGDrawer';
import TextDrawer from './src/drawers/TextDrawer';
import Config from './src/Config';
import Handler from './src/Handler';

const [ , , type, ...rest ] = process.argv;
console.log(type, rest);

switch (type) {
    case 'draw':
        new Config().load(rest[0])
            .then((options) => new Handler().makeByDrawer(options, new SVGDrawer()))
            .catch(err => console.error(err));
        break;
    case 'tdraw':
        new Config().load(rest[0])
            .then((options) => new Handler().makeByDrawer(options, new TextDrawer()))
            .catch(err => console.error(err));
        break;
    default:
        console.log(`Unknown command ${type}`);
}
