import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check, Clapperboard, LoaderCircle, Plus, Search, Star, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { addMovieFromImdb, movieDeleted, searchCleared, searchImdb } from './store'

const genres = ['All', 'Drama', 'Sci-Fi', 'Animation', 'Romance', 'Action', 'Comedy', 'IMDb pick']
const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } }

function Brand() {
  return <Link to="/" className="brand"><span><Clapperboard size={20} /></span>REELHOUSE</Link>
}

function MovieCard({ movie, index = 0 }) {
  const dispatch = useDispatch()
  const remove = event => {
    event.preventDefault(); event.stopPropagation()
    if (window.confirm(`Are you sure you want to delete “${movie.title}” from your collection?`)) dispatch(movieDeleted(movie.id))
  }
  return (
    <motion.article className="movie-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .055 }} whileHover={{ y: -8 }}>
      <Link to={`/movie/${movie.id}`} aria-label={`View ${movie.title}`}>
        <div className="poster"><img src={movie.image} alt="" /><span className="rating"><Star size={12} fill="currentColor" /> {movie.rating || 'NEW'}</span>{movie.userAdded && <span className="added-mark"><Check size={12}/> ADDED BY YOU</span>}<span className="open"><ArrowUpRight /></span></div>
        <div className="card-copy"><h3>{movie.title}</h3><p>{movie.genre} <i /> {movie.year || '2026'}</p></div>
      </Link>
      <button className="delete-movie" onClick={remove} aria-label={`Delete ${movie.title}`}><Trash2 size={15}/></button>
    </motion.article>
  )
}

function AddMovie({ close }) {
  const dispatch = useDispatch()
  const { suggestions, searchStatus, searchError, addStatus, addError, items } = useSelector(s => s.movies)
  const [query, setQuery] = useState('')
  useEffect(() => {
    if (query.trim().length < 2) { dispatch(searchCleared()); return }
    const timer = setTimeout(() => dispatch(searchImdb(query)), 400)
    return () => clearTimeout(timer)
  }, [query, dispatch])
  const add = async movie => {
    try { await dispatch(addMovieFromImdb(movie)).unwrap(); close() } catch { /* Redux displays the error */ }
  }
  return <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close}>
    <motion.div className="modal" initial={{ scale: .94, y: 25 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .96, y: 20 }} onMouseDown={e => e.stopPropagation()}>
      <button className="close" onClick={close}><X /></button><p className="eyebrow">POWERED BY IMDb</p><h2>Find a movie</h2><p className="muted">Search by title. We’ll fill in the poster and movie details.</p>
      <div className="imdb-search"><Search size={18}/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Try ‘The Godfather’" />{searchStatus === 'loading' && <LoaderCircle className="spin" size={18}/>}</div>
      <div className="suggestions">
        {suggestions.map(movie => { const exists = items.some(item => item.id === movie.id); return <button key={movie.id} disabled={exists || addStatus === 'loading'} onClick={() => add(movie)}><img src={movie.image} alt=""/><span><strong>{movie.title}</strong><small>{movie.year} · {movie.cast}</small></span><i>{exists ? <Check size={18}/> : addStatus === 'loading' ? <LoaderCircle className="spin" size={18}/> : <Plus size={18}/>}</i></button> })}
        {searchStatus === 'succeeded' && query.length > 1 && !suggestions.length && <p className="search-note">No matching movies found.</p>}
        {searchError && <p className="search-note error">{searchError}. Please try again.</p>}
        {addError && <p className="search-note error">{addError}. The movie was not added.</p>}
      </div>
      <p className="imdb-note">Movie metadata and artwork are retrieved from IMDb.</p>
    </motion.div>
  </motion.div>
}

function Home() {
  const movies = useSelector(s => s.movies.items)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const visible = useMemo(() => movies.filter(m => (filter === 'All' || m.genre === filter) && m.title.toLowerCase().includes(query.toLowerCase())), [movies, filter, query])
  return <motion.main {...fade}>
    <header><Brand /><nav><a href="#catalog">Browse</a><a href="#about">About</a></nav><button className="primary" onClick={() => setAdding(true)}><Plus size={17} /> Add movie</button></header>
    <section className="hero"><div><p className="eyebrow">CURATED FOR THE CURIOUS</p><h1>Stories worth<br/><em>staying for.</em></h1><p className="intro">A personal catalog of films that move, challenge, and linger long after the credits roll.</p></div><div className="hero-art"><div className="orb"/><div className="ticket"><span>NOW SHOWING</span><strong>{movies.length.toString().padStart(2, '0')}</strong><small>HANDPICKED FILMS</small></div></div></section>
    <section id="catalog" className="catalog">
      <div className="section-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Find your next favorite</h2></div><div className="search"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search films" /></div></div>
      <div className="filters">{genres.map(g => <button key={g} className={filter === g ? 'active' : ''} onClick={() => setFilter(g)}>{g}</button>)}</div>
      <div className="grid">{visible.map((movie, i) => <MovieCard movie={movie} index={i} key={movie.id} />)}</div>
      {!visible.length && <div className="empty"><Clapperboard/><h3>No films found</h3><p>Try another title or genre.</p></div>}
    </section>
    <footer id="about"><Brand/><p>Films for people who still watch the credits.</p><span>© 2026 REELHOUSE</span></footer>
    <AnimatePresence>{adding && <AddMovie close={() => setAdding(false)} />}</AnimatePresence>
  </motion.main>
}

function MovieDetail() {
  const { id } = useParams(); const navigate = useNavigate(); const dispatch = useDispatch(); const movies = useSelector(s => s.movies.items)
  const movie = movies.find(m => m.id === id)
  if (!movie) return <div className="not-found"><h1>Film not found.</h1><Link to="/">Return to the collection</Link></div>
  const related = movies.filter(m => m.genre.toLowerCase() === movie.genre.toLowerCase() && m.id !== movie.id).slice(0, 3)
  const remove = () => { if (window.confirm(`Are you sure you want to delete “${movie.title}” from your collection?`)) { dispatch(movieDeleted(movie.id)); navigate('/') } }
  return <motion.main className="detail" {...fade}>
    <div className="detail-backdrop" style={{ backgroundImage: `url(${movie.image})` }}/>
    <header><Brand/><button className="ghost" onClick={() => navigate(-1)}><ArrowLeft size={18}/> Back to films</button></header>
    <section className="detail-hero">
      <motion.div className="detail-poster" initial={{ opacity: 0, rotate: -2, x: -30 }} animate={{ opacity: 1, rotate: 0, x: 0 }}><img src={movie.image} alt={`${movie.title} poster`} /></motion.div>
      <div className="detail-copy"><p className="eyebrow">{movie.genre} · {movie.year}</p><h1>{movie.title}</h1>{movie.userAdded && <div className="detail-added"><Check size={14}/> ADDED BY YOU · IMDb</div>}<div className="meta"><span><Star size={16} fill="currentColor"/> {movie.rating}</span><span>{movie.runtime}</span><span>{movie.year}</span></div><p className="synopsis">{movie.description}</p>{movie.cast && <p className="cast"><small>STARRING</small>{movie.cast}</p>}<div className="credit"><span>GENRE<strong>{movie.genre}</strong></span><span>STATUS<strong>In collection</strong></span>{movie.id.startsWith('tt') && <a href={`https://www.imdb.com/title/${movie.id}/`} target="_blank" rel="noreferrer">VIEW ON IMDb <ArrowUpRight size={14}/></a>}</div></div>
    </section>
    <section className="recommend"><p className="eyebrow">MORE LIKE THIS</p><div className="section-head"><h2>Continue exploring</h2><div className="detail-actions"><button onClick={remove}><Trash2 size={15}/> Delete movie</button><Link to="/">View all films <ArrowUpRight size={17}/></Link></div></div>
      {related.length ? <div className="grid related">{related.map((m, i) => <MovieCard movie={m} index={i} key={m.id}/>)}</div> : <p className="muted">No other {movie.genre} films yet. Add one to the collection.</p>}
    </section>
  </motion.main>
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={<Home/>}/><Route path="/movie/:id" element={<MovieDetail/>}/><Route path="*" element={<Home/>}/></Routes></AnimatePresence>
}
