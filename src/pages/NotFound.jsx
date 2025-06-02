import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const NotFound = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto text-center py-12"
    >
      <div className="mb-8">
        <div className="text-9xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-surface-600 dark:text-surface-400">
          The page you're looking for doesn't exist or has been moved elsewhere.
        </p>
      </div>
      
      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary inline-flex items-center"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Home
        </motion.button>
      </Link>
    </motion.div>
  )
}

export default NotFound