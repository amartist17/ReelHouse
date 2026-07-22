import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { STORAGE_KEY } from '../../config/catalog'
import { starterMovies } from '../../data/starterMovies'
import { fetchMovieDetails, normalizeMovie, normalizeSuggestion, searchImdbTitles } from '../../services/movieApi'

export const searchMovies = createAsyncThunk('movies/search', async query => {
  const results = await searchImdbTitles(query)
  return results
    .filter(item => item.id?.startsWith('tt') && item.i && ['movie', 'tvMovie'].includes(item.qid))
    .slice(0, 6)
    .map(normalizeSuggestion)
})

export const addMovie = createAsyncThunk('movies/add', async suggestion => {
  const details = await fetchMovieDetails(suggestion.id)
  return normalizeMovie(details, suggestion)
})

function loadSavedMovies() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || starterMovies
  } catch {
    return starterMovies
  }
}

const initialState = {
  items: loadSavedMovies(),
  suggestions: [],
  searchStatus: 'idle',
  searchError: null,
  addStatus: 'idle',
  addError: null,
}

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    movieDeleted(state, action) {
      state.items = state.items.filter(movie => movie.id !== action.payload)
    },
    searchCleared(state) {
      state.suggestions = []
      state.searchStatus = 'idle'
      state.searchError = null
    },
  },
  extraReducers: builder => builder
    .addCase(searchMovies.pending, state => {
      state.searchStatus = 'loading'
      state.searchError = null
    })
    .addCase(searchMovies.fulfilled, (state, action) => {
      state.searchStatus = 'succeeded'
      state.suggestions = action.payload
    })
    .addCase(searchMovies.rejected, (state, action) => {
      state.searchStatus = 'failed'
      state.searchError = action.error.message
      state.suggestions = []
    })
    .addCase(addMovie.pending, state => {
      state.addStatus = 'loading'
      state.addError = null
    })
    .addCase(addMovie.fulfilled, (state, action) => {
      state.addStatus = 'succeeded'
      if (!state.items.some(movie => movie.id === action.payload.id)) state.items.unshift(action.payload)
    })
    .addCase(addMovie.rejected, (state, action) => {
      state.addStatus = 'failed'
      state.addError = action.error.message
    }),
})

export const { movieDeleted, searchCleared } = moviesSlice.actions
export const selectMovies = state => state.movies.items
export const selectMovieSearch = state => state.movies
export default moviesSlice.reducer
