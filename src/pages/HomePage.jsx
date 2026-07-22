import { AnimatePresence, motion } from 'framer-motion'
import { Clapperboard, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import AddMovieModal from '../components/AddMovieModal'
import Brand from '../components/Brand'
import MovieCard from '../components/MovieCard'
import { GENRES, PAGE_TRANSITION } from '../config/catalog'
import { selectMovies } from '../features/movies/moviesSlice'

export default function HomePage() {
  const movies = useSelector(selectMovies)
  const [genre, setGenre] = useState('All')
  const [query, setQuery] = useState('')
  const [isAddMovieOpen, setIsAddMovieOpen] = useState(false)

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return movies.filter(movie => {
      const matchesGenre = genre === 'All' || movie.genre === genre
      const matchesQuery = movie.title.toLowerCase().includes(normalizedQuery)
      return matchesGenre && matchesQuery
    })
  }, [movies, genre, query])

  return (
    <motion.main {...PAGE_TRANSITION}>
      <header>
        <Brand />
        <nav><a href="#catalog">Browse</a><a href="#about">About</a></nav>
        <button className="primary" onClick={() => setIsAddMovieOpen(true)}><Plus size={17} /> Add movie</button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">CURATED FOR THE CURIOUS</p>
          <h1>Stories worth<br /><em>staying for.</em></h1>
          <p className="intro">A personal catalog of films that move, challenge, and linger long after the credits roll.</p>
        </div>
        <div className="hero-art">
          <div className="orb" />
          <div className="ticket"><span>NOW SHOWING</span><strong>{String(movies.length).padStart(2, '0')}</strong><small>HANDPICKED FILMS</small></div>
        </div>
      </section>

      <section id="catalog" className="catalog">
        <div className="section-head">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Find your next favorite</h2></div>
          <div className="search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search films" /></div>
        </div>
        <div className="filters">
          {GENRES.map(item => <button key={item} className={genre === item ? 'active' : ''} onClick={() => setGenre(item)}>{item}</button>)}
        </div>
        <div className="grid">{visibleMovies.map((movie, index) => <MovieCard movie={movie} index={index} key={movie.id} />)}</div>
        {!visibleMovies.length && <div className="empty"><Clapperboard /><h3>No films found</h3><p>Try another title or genre.</p></div>}
      </section>

      <footer id="about"><Brand /><p>Films for people who still watch the credits.</p><span>© 2026 REELHOUSE</span></footer>
      <AnimatePresence>{isAddMovieOpen && <AddMovieModal onClose={() => setIsAddMovieOpen(false)} />}</AnimatePresence>
    </motion.main>
  )
}
