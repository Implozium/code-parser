import { promises } from 'fs';

import Drawer from "./drawers/Drawer";
import Options from "./Options";
import FileProjectInfo from "./code-parser/FileProjectInfo";
import Transformer from "./Transformer";

export default class Handler {
    makeByDrawer(options: Options, drawer: Drawer): Promise<boolean> {
        return new FileProjectInfo(options)
            .init()
            .then((aFileProjectInfo) => {
                const { data, type, extension } = drawer.draw(new Transformer().transform(aFileProjectInfo));
                return promises.writeFile(aFileProjectInfo.options.output + '.' + extension, data, type);
            })
            .then(() => true);
    }
}