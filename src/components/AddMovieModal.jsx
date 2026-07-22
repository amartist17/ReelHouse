import { motion } from 'framer-motion'
import { Check, LoaderCircle, Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMovie, searchCleared, searchMovies, selectMovieSearch } from '../features/movies/moviesSlice'

export default function AddMovieModal({ onClose }) {
  const dispatch = useDispatch()
  const { suggestions, searchStatus, searchError, addStatus, addError, items } = useSelector(selectMovieSearch)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query.trim().length < 2) {
      dispatch(searchCleared())
      return
    }
    const timer = setTimeout(() => dispatch(searchMovies(query)), 400)
    return () => clearTimeout(timer)
  }, [query, dispatch])

  async function handleAdd(movie) {
    try {
      await dispatch(addMovie(movie)).unwrap()
      onClose()
    } catch {
      // The rejected action stores a user-facing error in Redux.
    }
  }

  return (
    <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div className="modal" initial={{ scale: 0.94, y: 25 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} onMouseDown={event => event.stopPropagation()}>
        <button className="close" onClick={onClose}><X /></button>
        <p className="eyebrow">POWERED BY IMDb</p>
        <h2>Find a movie</h2>
        <p className="muted">Search by title. We will fill in the poster and movie details.</p>
        <div className="imdb-search">
          <Search size={18} />
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Try 'The Godfather'" />
          {searchStatus === 'loading' && <LoaderCircle className="spin" size={18} />}
        </div>
        <div className="suggestions">
          {suggestions.map(movie => {
            const exists = items.some(item => item.id === movie.id)
            return (
              <button key={movie.id} disabled={exists || addStatus === 'loading'} onClick={() => handleAdd(movie)}>
                <img src={movie.image} alt="" />
                <span><strong>{movie.title}</strong><small>{movie.year} · {movie.cast}</small></span>
                <i>{exists ? <Check size={18} /> : addStatus === 'loading' ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />}</i>
              </button>
            )
          })}
          {searchStatus === 'succeeded' && query.length > 1 && !suggestions.length && <p className="search-note">No matching movies found.</p>}
          {searchError && <p className="search-note error">{searchError}. Please try again.</p>}
          {addError && <p className="search-note error">{addError}. The movie was not added.</p>}
        </div>
        <p className="imdb-note">Movie metadata and artwork are retrieved from IMDb.</p>
      </motion.div>
    </motion.div>
  )
}
