import { motion } from 'framer-motion'
import { ArrowUpRight, Check, Star, Trash2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { movieDeleted } from '../features/movies/moviesSlice'

export default function MovieCard({ movie, index = 0 }) {
  const dispatch = useDispatch()

  function handleDelete(event) {
    event.preventDefault()
    event.stopPropagation()
    const confirmed = window.confirm(`Are you sure you want to delete "${movie.title}" from your collection?`)
    if (confirmed) dispatch(movieDeleted(movie.id))
  }

  return (
    <motion.article className="movie-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055 }} whileHover={{ y: -8 }}>
      <Link to={`/movie/${movie.id}`} aria-label={`View ${movie.title}`}>
        <div className="poster">
          <img src={movie.image} alt="" />
          <span className="rating"><Star size={12} fill="currentColor" /> {movie.rating || 'NEW'}</span>
          {movie.userAdded && <span className="added-mark"><Check size={12} /> ADDED BY YOU</span>}
          <span className="open"><ArrowUpRight /></span>
        </div>
        <div className="card-copy"><h3>{movie.title}</h3><p>{movie.genre} <i /> {movie.year}</p></div>
      </Link>
      <button className="delete-movie" onClick={handleDelete} aria-label={`Delete ${movie.title}`}><Trash2 size={15} /></button>
    </motion.article>
  )
}
