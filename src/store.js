import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const starterMovies = [
  { id: 'tt1375666', title: 'Inception', genre: 'Sci-Fi', year: '2010', runtime: '2h 28m', rating: '8.8', cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt', image: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg', description: 'A skilled extractor who steals secrets through dream-sharing technology is given an inverse task: plant an idea into a mind.' },
  { id: 'tt0816692', title: 'Interstellar', genre: 'Sci-Fi', year: '2014', runtime: '2h 49m', rating: '8.7', cast: 'Matthew McConaughey, Anne Hathaway', image: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg', description: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity’s survival.' },
  { id: 'tt6751668', title: 'Parasite', genre: 'Drama', year: '2019', runtime: '2h 12m', rating: '8.5', cast: 'Song Kang-ho, Lee Sun-kyun', image: 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_.jpg', description: 'A struggling family schemes its way into the home of a wealthy household, with unexpected consequences.' },
  { id: 'tt0468569', title: 'The Dark Knight', genre: 'Action', year: '2008', runtime: '2h 32m', rating: '9.0', cast: 'Christian Bale, Heath Ledger', image: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg', description: 'Batman faces a criminal mastermind whose reign of chaos pushes Gotham and its heroes to their limits.' },
  { id: 'tt2582802', title: 'Whiplash', genre: 'Drama', year: '2014', runtime: '1h 46m', rating: '8.5', cast: 'Miles Teller, J.K. Simmons', image: 'https://m.media-amazon.com/images/M/MV5BMDFjOWFkYzktYzhhMC00NmYyLTkwY2EtYjViMDhmNzg0OGFkXkEyXkFqcGc@._V1_.jpg', description: 'An ambitious drummer is pushed to the edge by an exacting music instructor.' },
  { id: 'tt0245429', title: 'Spirited Away', genre: 'Animation', year: '2001', runtime: '2h 5m', rating: '8.6', cast: 'Daveigh Chase, Miyu Irino', image: 'https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_.jpg', description: 'A young girl enters a world ruled by spirits, where humans are changed into beasts and nothing is what it seems.' },
  { id: 'tt2543164', title: 'Arrival', genre: 'Sci-Fi', year: '2016', runtime: '1h 56m', rating: '7.9', cast: 'Amy Adams, Jeremy Renner', image: 'https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_.jpg', description: 'A linguist works with the military to communicate with mysterious lifeforms after spacecraft appear around the world.' },
  { id: 'tt15239678', title: 'Dune: Part Two', genre: 'Sci-Fi', year: '2024', runtime: '2h 46m', rating: '8.5', cast: 'Timothée Chalamet, Zendaya', image: 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg', description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.' },
  { id: 'tt13238346', title: 'Past Lives', genre: 'Romance', year: '2023', runtime: '1h 46m', rating: '7.8', cast: 'Greta Lee, Teo Yoo', image: 'https://m.media-amazon.com/images/M/MV5BYjQyMTNhNjUtN2VmYy00NWRhLTkwOTctMGVmNTBmNDIxYjZhXkEyXkFqcGc@._V1_.jpg', description: 'Two deeply connected childhood friends reunite in New York for one fateful week after decades apart.' },
  { id: 'tt2278388', title: 'The Grand Budapest Hotel', genre: 'Comedy', year: '2014', runtime: '1h 39m', rating: '8.1', cast: 'Ralph Fiennes, F. Murray Abraham', image: 'https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_.jpg', description: 'A legendary concierge and his trusted lobby boy become entangled in theft, inheritance, and adventure.' },
]

function imdbJsonp(query) {
  return new Promise((resolve, reject) => {
    const slug = query.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    if (!slug) return resolve([])
    const callback = `imdb$${slug}`
    const script = document.createElement('script')
    const cleanup = (error, data) => { clearTimeout(timer); script.remove(); delete window[callback]; error ? reject(error) : resolve(data) }
    const timer = setTimeout(() => cleanup(new Error('IMDb search timed out')), 8000)
    window[callback] = payload => cleanup(null, payload.d || [])
    script.onerror = () => cleanup(new Error('Could not reach IMDb'))
    script.src = `https://v2.sg.media-imdb.com/suggests/${slug[0]}/${encodeURIComponent(slug)}.json`
    document.head.appendChild(script)
  })
}

export const searchImdb = createAsyncThunk('movies/searchImdb', async query => {
  const results = await imdbJsonp(query)
  return results.filter(item => item.id?.startsWith('tt') && item.i && ['movie', 'tvMovie'].includes(item.qid)).slice(0, 6).map(item => ({
    id: item.id, title: item.l, year: String(item.y || '—'), image: Array.isArray(item.i) ? item.i[0] : item.i.imageUrl,
    cast: item.s || 'Cast not listed', genre: 'IMDb pick', runtime: 'See IMDb', rating: 'IMDb', imdb: true, userAdded: true,
    description: item.s ? `Featuring ${item.s}. Added directly from IMDb.` : 'Movie information sourced directly from IMDb.',
  }))
})

export const addMovieFromImdb = createAsyncThunk('movies/addMovieFromImdb', async suggestion => {
  const response = await fetch(`https://v3-cinemeta.strem.io/meta/movie/${suggestion.id}.json`)
  if (!response.ok) throw new Error('Movie details could not be loaded')
  const { meta } = await response.json()
  if (!meta) throw new Error('Movie details are unavailable')
  return {
    ...suggestion,
    title: meta.name || suggestion.title,
    year: String(meta.year || suggestion.year),
    image: meta.poster || suggestion.image,
    genre: meta.genre?.[0] || 'Movie',
    genres: meta.genre || [],
    runtime: meta.runtime || 'Not listed',
    rating: meta.imdbRating || 'N/A',
    cast: meta.cast?.join(', ') || suggestion.cast,
    description: meta.description || suggestion.description,
    director: meta.director?.join(', ') || '',
    background: meta.background || '',
    userAdded: true,
    imdb: true,
  }
})

const saved = JSON.parse(localStorage.getItem('reelhouse-imdb-v1') || 'null')
const moviesSlice = createSlice({
  name: 'movies',
  initialState: { items: saved || starterMovies, suggestions: [], searchStatus: 'idle', searchError: null, addStatus: 'idle', addError: null },
  reducers: {
    movieAdded(state, action) { if (!state.items.some(movie => movie.id === action.payload.id)) state.items.unshift(action.payload) },
    movieDeleted(state, action) { state.items = state.items.filter(movie => movie.id !== action.payload) },
    searchCleared(state) { state.suggestions = []; state.searchStatus = 'idle'; state.searchError = null },
  },
  extraReducers: builder => builder
    .addCase(searchImdb.pending, state => { state.searchStatus = 'loading'; state.searchError = null })
    .addCase(searchImdb.fulfilled, (state, action) => { state.searchStatus = 'succeeded'; state.suggestions = action.payload })
    .addCase(searchImdb.rejected, (state, action) => { state.searchStatus = 'failed'; state.searchError = action.error.message; state.suggestions = [] })
    .addCase(addMovieFromImdb.pending, state => { state.addStatus = 'loading'; state.addError = null })
    .addCase(addMovieFromImdb.fulfilled, (state, action) => { state.addStatus = 'succeeded'; if (!state.items.some(movie => movie.id === action.payload.id)) state.items.unshift(action.payload) })
    .addCase(addMovieFromImdb.rejected, (state, action) => { state.addStatus = 'failed'; state.addError = action.error.message }),
})

export const { movieAdded, movieDeleted, searchCleared } = moviesSlice.actions
export const store = configureStore({ reducer: { movies: moviesSlice.reducer } })
store.subscribe(() => localStorage.setItem('reelhouse-imdb-v1', JSON.stringify(store.getState().movies.items)))
