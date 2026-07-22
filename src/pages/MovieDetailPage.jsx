import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, Star, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Brand from '../components/Brand'
import MovieCard from '../components/MovieCard'
import { PAGE_TRANSITION } from '../config/catalog'
import { movieDeleted, selectMovies } from '../features/movies/moviesSlice'

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const movies = useSelector(selectMovies)
  const movie = movies.find(item => item.id === id)

  if (!movie) return <div className="not-found"><h1>Film not found.</h1><Link to="/">Return to the collection</Link></div>

  const recommendations = movies
    .filter(item => item.genre.toLowerCase() === movie.genre.toLowerCase() && item.id !== movie.id)
    .slice(0, 3)

  function handleDelete() {
    const confirmed = window.confirm(`Are you sure you want to delete "${movie.title}" from your collection?`)
    if (confirmed) {
      dispatch(movieDeleted(movie.id))
      navigate('/')
    }
  }

  return (
    <motion.main className="detail" {...PAGE_TRANSITION}>
      <div className="detail-backdrop" style={{ backgroundImage: `url(${movie.background || movie.image})` }} />
      <header><Brand /><button className="ghost" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back to films</button></header>
      <section className="detail-hero">
        <motion.div className="detail-poster" initial={{ opacity: 0, rotate: -2, x: -30 }} animate={{ opacity: 1, rotate: 0, x: 0 }}>
          <img src={movie.image} alt={`${movie.title} poster`} />
        </motion.div>
        <div className="detail-copy">
          <p className="eyebrow">{movie.genres?.join(' · ') || movie.genre} · {movie.year}</p>
          <h1>{movie.title}</h1>
          {movie.userAdded && <div className="detail-added"><Check size={14} /> ADDED BY YOU · IMDb</div>}
          <div className="meta"><span><Star size={16} fill="currentColor" /> {movie.rating}</span><span>{movie.runtime}</span><span>{movie.year}</span></div>
          <p className="synopsis">{movie.description}</p>
          {movie.cast && <p className="cast"><small>STARRING</small>{movie.cast}</p>}
          <div className="credit">
            <span>GENRE<strong>{movie.genre}</strong></span>
            <span>STATUS<strong>In collection</strong></span>
            {movie.id.startsWith('tt') && <a href={`https://www.imdb.com/title/${movie.id}/`} target="_blank" rel="noreferrer">VIEW ON IMDb <ArrowUpRight size={14} /></a>}
          </div>
        </div>
      </section>
      <section className="recommend">
        <p className="eyebrow">MORE LIKE THIS</p>
        <div className="section-head">
          <h2>Continue exploring</h2>
          <div className="detail-actions"><button onClick={handleDelete}><Trash2 size={15} /> Delete movie</button><Link to="/">View all films <ArrowUpRight size={17} /></Link></div>
        </div>
        {recommendations.length
          ? <div className="grid related">{recommendations.map((item, index) => <MovieCard movie={item} index={index} key={item.id} />)}</div>
          : <p className="muted">No other {movie.genre} films yet. Add one to the collection.</p>}
      </section>
    </motion.main>
  )
}
