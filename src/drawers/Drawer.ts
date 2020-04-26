import { Project } from "../Project";

export default interface Drawer {
    draw(project: Project, options?: { [index: string]: any }): { data: any, type: string, extension: string }
}