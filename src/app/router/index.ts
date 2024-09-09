import { MainPage, RoomPage } from "@/pages"
import { IRoute, RouteNamesEnum } from "@/shared/types"

export const publicRoutes: IRoute[] = [
  {
    path: RouteNamesEnum.MAIN,
    element: MainPage,
  },
  {
    path: RouteNamesEnum.ROOM,
    element: RoomPage,
  },
]
