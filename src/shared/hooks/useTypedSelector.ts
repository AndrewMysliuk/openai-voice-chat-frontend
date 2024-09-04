import { useSelector } from "react-redux"
import { TypedUseSelectorHook } from "react-redux"
import { RootState } from "@/shared/store"

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
