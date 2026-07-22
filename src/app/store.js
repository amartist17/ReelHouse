import { configureStore } from '@reduxjs/toolkit'
import { STORAGE_KEY } from '../config/catalog'
import moviesReducer from '../features/movies/moviesSlice'

export const store = configureStore({ reducer: { movies: moviesReducer } })

store.subscribe(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().movies.items))
})
