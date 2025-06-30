// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
export type Renderable = React.ComponentType | JSX.Element;
export type RenderFunction = () => Renderable | Renderable[];
