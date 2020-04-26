import { ProjectInfo } from "../code-parser/types";

export default interface Drawer {
    draw(projectInfo: ProjectInfo, options?: { [index: string]: any }): { data: any, type: string }
}