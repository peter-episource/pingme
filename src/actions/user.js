import {
  CREATE_USER,
  LOGIN_USER,
  UNMOUNT_REQUEST_MESSAGE,
  LOGOUT_USER,
  LOGGED_IN_CHECK,
  FOLLOW,
  UNFOLLOW,
  SUBSCRIBE,
  UNSUBSCRIBE,
  RETRIEVE_MANGAS,
} from '../constants'

// Async
export const createUser = (userObj) => ({
  type: CREATE_USER,
  userObj,
})

export const loginUser = (userObj) => ({
  type: LOGIN_USER,
  userObj,
})

export const unmountRequestMessage = () => ({
  type: UNMOUNT_REQUEST_MESSAGE,
})

export const logoutUser = () => ({
  type: LOGOUT_USER,
})

export const loggedInCheck = () => ({
  type: LOGGED_IN_CHECK,
})

export const follow = (userId, mangaId, subscribe) => ({
  type: FOLLOW,
  userId,
  mangaId,
  subscribe,
})

export const unfollow = (userId, mangaId) => ({
  type: UNFOLLOW,
  userId,
  mangaId,
})

export const subscribe = (userId, mangaId) => ({
  type: SUBSCRIBE,
  userId,
  mangaId,
})

export const unsubscribe = (userId, mangaId) => ({
  type: UNSUBSCRIBE,
  userId,
  mangaId,
})

export const retrieveMangas = (followingList) => ({
  type: RETRIEVE_MANGAS,
  followingList,
})