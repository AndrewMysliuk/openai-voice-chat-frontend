export interface CommonState {
  isLogged: boolean
}

export enum CommonActionsEnum {
  SET_USER_LOGIN = "SET_USER_LOGIN",
}

export interface SetUserLogin {
  type: CommonActionsEnum.SET_USER_LOGIN
  payload: boolean
}

export type CommonAction = SetUserLogin
