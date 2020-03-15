import { IProjectInfo, IFileInfo, IDrawer } from './types';
import TextDrawer from './TextDrawer';
import nomnoml = require('nomnoml');

export default class SVGDrawer extends TextDrawer {

    constructor() {
        super();
    }

    draw(projectInfo: IProjectInfo, options?: Object): { data: any, type: string } {
        let { data, type } = super.draw(projectInfo, options);
        let output = `
#arrowSize: 1
#bendSize: 1
#fill: #ffffff
#font: Consolas
#fontSize: 11
#lineWidth: 1
#padding: 8
#spacing: 24
#direction: right
#ranker: longest-path
#gutter: 100
#edges: hard
#edgeMargin: 6
#title: Files
#leading: 1

#.abstract: fill=#ffffff dashed center bold italic
#.interface: fill=#ff0000 dashed center bold italic
#.type: fill=#ffff00 dashed center bold italic
#.var: fill=#ff00ff dashed center bold italic

${ data }
`;

        return {
            data: nomnoml.renderSvg(output),
            type: type
        };
    }
}