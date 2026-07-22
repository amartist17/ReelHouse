import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </AnimatePresence>
  )
}
