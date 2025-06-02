import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl"
        >
          <ApperIcon name="FolderX" className="w-12 h-12 text-primary" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
          404 - Not Found
        </h1>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8 text-lg">
          The file or folder you're looking for doesn't exist in this directory.
        </p>
        
        <Link
          to="/"
          className="action-button action-button-primary inline-flex"
        >
          <ApperIcon name="Home" className="w-4 h-4" />
          Back to File Manager
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound