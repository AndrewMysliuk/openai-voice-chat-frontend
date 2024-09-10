export enum SocketActionsEnum {
  JOIN = "join",
  LEAVE = "leave",
  SHARE_ROOMS = "share-rooms",
  ADD_PEER = "add-peer",
  REMOVE_PEER = "remove-peer",
  RELAY_SDP = "relay-sdp",
  RELAY_ICE = "relay-ice",
  ICE_CANDIDATE = "ice-candidate",
  SESSION_DESCRIPTION = "session-description",
}

export interface ISessionDescription {
  type: string
  sdp: string
}

export interface IIceCandidate {
  candidate: string
  sdpMid?: string
  sdpMLineIndex?: number
}

export enum VideoContentTypeEnum {
  LOCAL_VIDEO = "LOCAL_VIDEO",
}
