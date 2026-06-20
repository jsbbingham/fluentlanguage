import { Link } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader.jsx'

// Rendered for any unmatched route. The server returns a real HTTP 404 for
// these paths (see public/.htaccess ErrorDocument), so this is not a soft-404.
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Page not found"
        subtitle="The page you're looking for doesn't exist or may have moved."
      />

      <section className="py-20 lg:py-28">
        <div className="container-x text-center">
          <Link to="/" className="btn-primary inline-flex">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
