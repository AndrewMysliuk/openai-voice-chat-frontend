export interface IRoute {
  path: string
  element: React.ComponentType
}

export enum RouteNamesEnum {
  MAIN = "/",
  ROOM = "/room/:id",
}
