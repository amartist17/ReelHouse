const IMDB_SUGGEST_URL = 'https://v2.sg.media-imdb.com/suggests'
const CINEMETA_URL = 'https://v3-cinemeta.strem.io/meta/movie'

function toSearchSlug(query) {
  return query.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export function searchImdbTitles(query) {
  return new Promise((resolve, reject) => {
    const slug = toSearchSlug(query)
    if (!slug) return resolve([])

    const callbackName = `imdb$${slug}`
    const script = document.createElement('script')
    const cleanup = (error, data) => {
      clearTimeout(timeout)
      script.remove()
      delete window[callbackName]
      error ? reject(error) : resolve(data)
    }
    const timeout = setTimeout(() => cleanup(new Error('IMDb search timed out')), 8000)

    window[callbackName] = payload => cleanup(null, payload.d || [])
    script.onerror = () => cleanup(new Error('Could not reach IMDb'))
    script.src = `${IMDB_SUGGEST_URL}/${slug[0]}/${encodeURIComponent(slug)}.json`
    document.head.appendChild(script)
  })
}

export async function fetchMovieDetails(imdbId) {
  const response = await fetch(`${CINEMETA_URL}/${imdbId}.json`)
  if (!response.ok) throw new Error('Movie details could not be loaded')

  const { meta } = await response.json()
  if (!meta) throw new Error('Movie details are unavailable')
  return meta
}

export function normalizeSuggestion(item) {
  return {
    id: item.id,
    title: item.l,
    year: String(item.y || '-'),
    image: Array.isArray(item.i) ? item.i[0] : item.i.imageUrl,
    cast: item.s || 'Cast not listed',
  }
}

export function normalizeMovie(meta, suggestion) {
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
    description: meta.description || 'Movie details are not available.',
    director: meta.director?.join(', ') || '',
    background: meta.background || '',
    userAdded: true,
    imdb: true,
  }
}
