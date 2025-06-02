import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [currentPath, setCurrentPath] = useState('/')
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      size: 0,
      path: '/Documents',
      parentId: null,
      createdAt: new Date('2024-01-15'),
      modifiedAt: new Date('2024-01-20'),
      isDirectory: true
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      size: 0,
      path: '/Images',
      parentId: null,
      createdAt: new Date('2024-01-10'),
      modifiedAt: new Date('2024-01-25'),
      isDirectory: true
    },
    {
      id: '3',
      name: 'README.md',
      type: 'file',
      size: 2048,
      path: '/README.md',
      parentId: null,
      createdAt: new Date('2024-01-05'),
      modifiedAt: new Date('2024-01-22'),
      isDirectory: false
    },
    {
      id: '4',
      name: 'project.json',
      type: 'file',
      size: 1024,
      path: '/project.json',
      parentId: null,
      createdAt: new Date('2024-01-12'),
      modifiedAt: new Date('2024-01-18'),
      isDirectory: false
    }
  ])
  
  const [selectedItems, setSelectedItems] = useState([])
  const [contextMenu, setContextMenu] = useState(null)
  const [showModal, setShowModal] = useState(null)
  const [newItemName, setNewItemName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file) => {
    if (file.isDirectory) return 'Folder'
    
    const ext = file.name.split('.').pop().toLowerCase()
    switch (ext) {
      case 'pdf': return 'FileText'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'Image'
      case 'mp4':
      case 'avi':
      case 'mov': return 'Video'
      case 'mp3':
      case 'wav': return 'Music'
      case 'zip':
      case 'rar': return 'Archive'
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx': return 'Code'
      case 'md': return 'FileText'
      case 'json': return 'Braces'
      default: return 'File'
    }
  }

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Root', path: '/' }]
    
    let currentBreadcrumbPath = ''
    parts.forEach(part => {
      currentBreadcrumbPath += `/${part}`
      breadcrumbs.push({ name: part, path: currentBreadcrumbPath })
    })
    
    return breadcrumbs
  }

  const navigateToPath = (path) => {
    setCurrentPath(path)
    setSelectedItems([])
    setContextMenu(null)
  }

  const handleFileSelect = (fileId, event) => {
    event.preventDefault()
    
    if (event.ctrlKey || event.metaKey) {
      setSelectedItems(prev => 
        prev.includes(fileId) 
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      )
    } else {
      setSelectedItems([fileId])
    }
  }

  const handleDoubleClick = (file) => {
    if (file.isDirectory) {
      navigateToPath(file.path)
    } else {
      toast.info(`Opening ${file.name}...`)
    }
  }

  const handleContextMenu = (event, fileId) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      fileId
    })
  }

  const handleCreateFolder = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter a folder name')
      return
    }

    const newFolder = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      type: 'folder',
      size: 0,
      path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${newItemName.trim()}`,
      parentId: null,
      createdAt: new Date(),
      modifiedAt: new Date(),
      isDirectory: true
    }

    setFiles(prev => [...prev, newFolder])
    setNewItemName('')
    setShowModal(null)
    toast.success(`Folder "${newFolder.name}" created successfully`)
  }

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files)
    
    uploadedFiles.forEach(file => {
      const newFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: 'file',
        size: file.size,
        path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`,
        parentId: null,
        createdAt: new Date(),
        modifiedAt: new Date(),
        isDirectory: false
      }
      
      setFiles(prev => [...prev, newFile])
    })
    
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)
    event.target.value = ''
  }

  const handleDelete = (fileId) => {
    const file = files.find(f => f.id === fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setContextMenu(null)
    setSelectedItems([])
    toast.success(`"${file.name}" deleted successfully`)
  }

  const handleRename = (fileId, newName) => {
    if (!newName.trim()) {
      toast.error('Please enter a valid name')
      return
    }

    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, name: newName.trim(), modifiedAt: new Date() }
        : file
    ))
    setShowModal(null)
    setNewItemName('')
    setContextMenu(null)
    toast.success('Item renamed successfully')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(event.dataTransfer.files)
    if (droppedFiles.length > 0) {
      droppedFiles.forEach(file => {
        const newFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'file',
          size: file.size,
          path: `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`,
          parentId: null,
          createdAt: new Date(),
          modifiedAt: new Date(),
          isDirectory: false
        }
        
        setFiles(prev => [...prev, newFile])
      })
      
      toast.success(`${droppedFiles.length} file(s) uploaded successfully`)
    }
  }

  const currentFiles = files.filter(file => {
    if (currentPath === '/') {
      return !file.path.includes('/', 1)
    }
    return file.path.startsWith(currentPath) && file.path !== currentPath
  })

  return (
    <div className="container-responsive py-6 sm:py-8 lg:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="heading-responsive font-bold text-surface-900 dark:text-surface-100 mb-2">
              FileFlow
            </h1>
            <p className="text-surface-600 dark:text-surface-400 text-sm sm:text-base">
              Streamlined file management at your fingertips
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="action-button action-button-secondary"
            >
              <ApperIcon name={viewMode === 'grid' ? 'List' : 'Grid3X3'} className="w-4 h-4" />
              <span className="hidden sm:inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </button>
            
            <button
              onClick={() => setShowModal('createFolder')}
              className="action-button action-button-secondary"
            >
              <ApperIcon name="FolderPlus" className="w-4 h-4" />
              <span className="hidden sm:inline">New Folder</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="action-button action-button-primary"
            >
              <ApperIcon name="Upload" className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {getBreadcrumbs().map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center gap-2">
              {index > 0 && <ApperIcon name="ChevronRight" className="w-4 h-4 text-surface-400" />}
              <button
                onClick={() => navigateToPath(breadcrumb.path)}
                className="breadcrumb-item"
              >
                {breadcrumb.name}
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`upload-zone mb-8 ${isDragging ? 'active' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <ApperIcon name="Upload" className="w-12 h-12 text-surface-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-2">
          {isDragging ? 'Drop files here' : 'Upload files'}
        </h3>
        <p className="text-surface-500 dark:text-surface-400 text-sm">
          Drag and drop files or click to browse
        </p>
      </motion.div>

      {/* File Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={viewMode === 'grid' ? 'grid-responsive' : 'space-y-3'}
      >
        <AnimatePresence>
          {currentFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`file-item ${selectedItems.includes(file.id) ? 'ring-2 ring-primary' : ''}`}
              onClick={(e) => handleFileSelect(file.id, e)}
              onDoubleClick={() => handleDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file.id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                  <ApperIcon 
                    name={getFileIcon(file)} 
                    className={`w-5 h-5 ${file.isDirectory ? 'text-accent' : 'text-primary'}`} 
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-1">
                    <span>{file.isDirectory ? 'Folder' : formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{format(file.modifiedAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowModal('rename')
                    setContextMenu({ fileId: file.id })
                    setNewItemName(file.name)
                  }}
                  className="p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <ApperIcon name="Edit2" className="w-4 h-4 text-surface-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(file.id)
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {currentFiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <ApperIcon name="FolderOpen" className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-600 dark:text-surface-400 mb-2">
            This folder is empty
          </h3>
          <p className="text-surface-500 dark:text-surface-500 mb-6">
            Upload files or create a new folder to get started
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowModal('createFolder')}
              className="action-button action-button-secondary"
            >
              <ApperIcon name="FolderPlus" className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="action-button action-button-primary"
            >
              <ApperIcon name="Upload" className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </motion.div>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={() => setContextMenu(null)}
          >
            <button
              className="context-menu-item"
              onClick={() => {
                const file = files.find(f => f.id === contextMenu.fileId)
                setNewItemName(file.name)
                setShowModal('rename')
              }}
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
              Rename
            </button>
            <button
              className="context-menu-item text-red-600 dark:text-red-400"
              onClick={() => handleDelete(contextMenu.fileId)}
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  {showModal === 'createFolder' ? 'Create New Folder' : 'Rename Item'}
                </h3>
                
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={showModal === 'createFolder' ? 'Folder name' : 'New name'}
                  className="w-full px-4 py-3 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (showModal === 'createFolder') {
                        handleCreateFolder()
                      } else {
                        handleRename(contextMenu.fileId, newItemName)
                      }
                    }
                  }}
                />
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(null)
                      setNewItemName('')
                    }}
                    className="action-button action-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (showModal === 'createFolder') {
                        handleCreateFolder()
                      } else {
                        handleRename(contextMenu.fileId, newItemName)
                      }
                    }}
                    className="action-button action-button-primary"
                  >
                    {showModal === 'createFolder' ? 'Create' : 'Rename'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

export default MainFeature