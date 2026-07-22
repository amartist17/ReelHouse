import { Clapperboard } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Brand() {
  return <Link to="/" className="brand"><span><Clapperboard size={20} /></span>REELHOUSE</Link>
}
