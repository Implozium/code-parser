import Drawer from '../drawers/Drawer';
import SVGContainer from '../svg/SVGContainer';
import UMLContainer from '../svg/UMLContainer';
import { Project } from '../Project';

export default class SVGDrawer implements Drawer {
    private svg = new SVGContainer({ padding: 32, textPadding: 8, fontSize: 8 });
    private container = new UMLContainer(this.svg, { blockWidth: 200, blockMergeVer: 100, blockMergeHor: 100 });

    constructor() {
        this.container.addPreset('+', { fill: 'green', color: 'white', border: 'green' } );
        this.container.addPreset('-', { fill: 'red', border: 'red' } );
        this.container.addPreset('def', { fill: 'lightgrey' } );
    }

    draw(project: Project, options?: { [index: string]: any }): { data: any, type: string, extension: string } {
        project.title = options?.title ?? 'title';

        return {
            data: this.container.build(project),
            type: 'utf8',
            extension: 'svg',
        };
    }
}