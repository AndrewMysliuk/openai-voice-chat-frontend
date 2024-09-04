import { CommonState, CommonAction, CommonActionsEnum } from "./types"

const initialStore: CommonState = {
  isLogged: false,
}

export default function commonReducer(state = initialStore, action: CommonAction): CommonState {
  switch (action.type) {
    case CommonActionsEnum.SET_USER_LOGIN:
      return { ...state, isLogged: action.payload }

    default:
      return state
  }
}
