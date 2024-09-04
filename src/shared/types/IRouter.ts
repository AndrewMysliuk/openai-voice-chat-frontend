export interface IRoute {
  path: string
  element: React.ComponentType
}

export enum RouteNames {
  HOME = "/",
  LOGIN = "/login",
}
