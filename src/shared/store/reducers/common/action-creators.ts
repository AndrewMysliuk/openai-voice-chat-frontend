import { AppDispatch } from "../.."
import { CommonActionsEnum, SetUserLogin } from "./types"

export const CommonActionCreators = {
  setUserLogin: (value: boolean): SetUserLogin => ({
    type: CommonActionsEnum.SET_USER_LOGIN,
    payload: value,
  }),

  checkUserLogin: () => async (dispatch: AppDispatch) => {
    // dispatch(CommonActionCreators.setIsAuth(true))
  },
}
