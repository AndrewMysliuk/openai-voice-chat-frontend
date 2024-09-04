import { HomePage, LoginPage } from "@/pages"
import { IRoute, RouteNames } from "@/shared/types"

export const publicRoutes: IRoute[] = [
  {
    path: RouteNames.LOGIN,
    element: LoginPage,
  },
]

export const privateRoutes: IRoute[] = [
  {
    path: RouteNames.HOME,
    element: HomePage,
  },
]
