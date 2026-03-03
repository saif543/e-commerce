'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import {
    Upload,
    Save,
    Trash2,
    Eye,
    X,
    Image as ImageIcon,
    ToggleLeft,
    ToggleRight,
    Plus,
    Edit2,
    ArrowUp,
    ArrowDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react'

const MySwal = Swal

export default function SliderManagement({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [slides, setSlides] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editingSlide, setEditingSlide] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        link: '',
        alignment: 'center',
        alt: '',
        isActive: true,
        titleSize: 48,
        subtitleSize: 20,
        descriptionSize: 16,
        buttonSize: 14,
    })

    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const headers = token ? { Authorization: `Bearer ${token}` } : {}

            const response = await fetch('/api/slider?includeInactive=true', { headers })
            const result = await response.json()

            if (result.success) {
                setSlides(result.slides || [])
            }
        } catch (error) {
            console.error('Error fetching slides:', error)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load slides',
                confirmButtonColor: '#FF6B35',
            })
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingSlide(null)
        setFormData({
            id: `slide-${Date.now()}`,
            title: '',
            subtitle: '',
            description: '',
            buttonText: '',
            link: '',
            alignment: 'center',
            alt: '',
            isActive: true,
            titleSize: 48,
            subtitleSize: 20,
            descriptionSize: 16,
            buttonSize: 14,
        })
        setImageFile(null)
        setImagePreview(null)
        setShowModal(true)
    }

    const openEditModal = (slide) => {
        setEditingSlide(slide)
        setFormData({
            id: slide.id,
            title: slide.title === '--' ? '' : slide.title || '',
            subtitle: slide.subtitle === '--' ? '' : slide.subtitle || '',
            description: slide.description || '',
            buttonText: slide.buttonText || '',
            link: slide.link || '',
            alignment: slide.alignment || 'center',
            alt: slide.alt || '',
            isActive: slide.isActive !== false,
            titleSize: slide.titleSize || 48,
            subtitleSize: slide.subtitleSize || 20,
            descriptionSize: slide.descriptionSize || 16,
            buttonSize: slide.buttonSize || 14,
        })
        setImagePreview(slide.image || null)
        setImageFile(null)
        setShowModal(true)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            MySwal.fire({
                icon: 'error',
                title: 'Invalid File Type',
                text: 'Only JPEG, PNG, and WebP are allowed',
                confirmButtonColor: '#FF6B35',
            })
            return
        }

        if (file.size > 100 * 1024 * 1024) {
            MySwal.fire({
                icon: 'error',
                title: 'File Too Large',
                text: 'Maximum file size is 100MB',
                confirmButtonColor: '#FF6B35',
            })
            return
        }

        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSaveSlide = async (e) => {
        e.preventDefault()

        if (!editingSlide && !imageFile) {
            MySwal.fire({
                icon: 'warning',
                title: 'Image Required',
                text: 'Please select an image for the slide',
                confirmButtonColor: '#FF6B35',
            })
            return
        }

        setSaving(true)

        try {
            const token = await getToken()
            if (!token) {
                throw new Error('Authentication required')
            }

            const preparedFormData = {
                ...formData,
                title: formData.title.trim(),
                subtitle: formData.subtitle.trim(),
                buttonText: formData.buttonText.trim(),
            }

            const slideData = {
                action: editingSlide ? 'update' : 'create',
                slideData: preparedFormData,
            }

            if (editingSlide) {
                slideData.id = editingSlide.id
            }

            const response = await fetch('/api/slider', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(slideData),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Failed to save slide')
            }

            if (imageFile) {
                setUploading(true)
                const formDataImg = new FormData()
                formDataImg.append('image', imageFile)
                formDataImg.append('slideId', formData.id)

                const uploadResponse = await fetch('/api/slider', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataImg,
                })

                const uploadData = await uploadResponse.json()
                if (!uploadData.success) {
                    throw new Error(uploadData.error || 'Failed to upload image')
                }
                setUploading(false)
            }

            MySwal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Slide ${editingSlide ? 'updated' : 'created'} successfully`,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#FF6B35',
            })

            setShowModal(false)
            setTimeout(() => {
                fetchSlides()
            }, 500)
        } catch (error) {
            console.error('Error saving slide:', error)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save slide',
                confirmButtonColor: '#FF6B35',
            })
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const handleDeleteSlide = async (slideId) => {
        const result = await MySwal.fire({
            title: 'Delete Slide?',
            text: 'This action cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
        })

        if (!result.isConfirmed) return

        try {
            const token = await getToken()
            if (!token) {
                throw new Error('Authentication required')
            }

            const response = await fetch(`/api/slider?id=${slideId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (data.success) {
                MySwal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Slide has been deleted',
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#FF6B35',
                })
                fetchSlides()
            }
        } catch (error) {
            console.error('Error deleting slide:', error)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete slide',
                confirmButtonColor: '#FF6B35',
            })
        }
    }

    const handleToggleActive = async (slide) => {
        try {
            const token = await getToken()
            if (!token) {
                throw new Error('Authentication required')
            }

            const response = await fetch(`/api/slider?id=${slide.id}&action=toggle`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (data.success) {
                MySwal.fire({
                    icon: 'success',
                    title: slide.isActive ? 'Deactivated!' : 'Activated!',
                    text: `Slide ${slide.isActive ? 'deactivated' : 'activated'}`,
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#FF6B35',
                })
                fetchSlides()
            }
        } catch (error) {
            console.error('Error toggling slide:', error)
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update slide status',
                confirmButtonColor: '#FF6B35',
            })
        }
    }

    const handleReorder = async (index, direction) => {
        const newOrder = [...slides]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= newOrder.length) return

            ;[newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]]

        const updatedSlides = newOrder.map((s, idx) => ({ ...s, order: idx }))
        setSlides(updatedSlides)

        try {
            const token = await getToken()
            if (!token) throw new Error('Authentication required')

            const reorderData = {
                action: 'reorder',
                slides: newOrder.map((s, idx) => ({ id: s.id, order: idx })),
            }

            const response = await fetch('/api/slider', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(reorderData),
            })

            if (!response.ok) throw new Error('Reorder failed')

            MySwal.fire({
                icon: 'success',
                title: 'Reordered!',
                timer: 1000,
                showConfirmButton: false,
                confirmButtonColor: '#FF6B35',
            })
        } catch (error) {
            console.error('Error reordering:', error)
            fetchSlides()
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to reorder slides',
                confirmButtonColor: '#FF6B35',
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading slides...</p>
                </div>
            </div>
        )
    }

    return (
        <div

        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hero Sliders</h2>
                    <p className="text-gray-600 mt-1">Manage homepage slider images</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {showPreview ? <X size={18} /> : <Eye size={18} />}
                        {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white rounded-lg hover:from-[#E85A2A] hover:to-[#D94A1A] transition-all shadow-md"
                    >
                        <Plus size={18} />
                        Add Slide
                    </button>
                </div>
            </div>

            {/* Slides List */}
            {slides.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <ImageIcon size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 font-medium">No slides yet</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
                    >
                        Create Your First Slide
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {slides.map((slide, index) => (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                        >
                            <div className="p-4">
                                <div className="flex gap-4">
                                    {/* Image Preview */}
                                    <div className="flex-shrink-0 w-48">
                                        {slide?.image ? (
                                            <img
                                                src={slide.image}
                                                alt={slide.alt || slide.title || 'Slide'}
                                                className="w-full h-28 object-cover rounded-lg border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-full h-28 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <ImageIcon size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Slide Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {slide.title === '--' ? '(Untitled)' : slide.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {slide.subtitle === '--' ? '(No subtitle)' : slide.subtitle}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${slide.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {slide.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {slide.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{slide.description}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span>Alignment: {slide.alignment}</span>
                                            {slide.buttonText && <span>Button: {slide.buttonText}</span>}
                                            {slide.link && (
                                                <a href={slide.link} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                                                    View Link
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => openEditModal(slide)}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleToggleActive(slide)}
                                            className={`px-3 py-1.5 rounded transition-colors text-sm flex items-center gap-1 ${slide.isActive
                                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {slide.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                            {slide.isActive ? 'Hide' : 'Show'}
                                        </button>

                                        <button
                                            onClick={() => handleReorder(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUp size={14} />
                                        </button>

                                        <button
                                            onClick={() => handleReorder(index, 'down')}
                                            disabled={index === slides.length - 1}
                                            className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDown size={14} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteSlide(slide.id)}
                                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm flex items-center gap-1"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Section */}
                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-200"
                                        >
                                            <h4 className="font-semibold text-gray-900 mb-3">Live Preview</h4>
                                            <div
                                                className="relative w-full h-48 rounded-lg overflow-hidden"
                                                style={{
                                                    backgroundImage: slide?.image ? `url('${slide.image}')` : 'linear-gradient(to right, #e5e7eb, #d1d5db)',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-black/40"></div>
                                                <div className={`absolute inset-0 flex flex-col ${slide.alignment === 'left' ? 'items-start' :
                                                    slide.alignment === 'right' ? 'items-end' :
                                                        'items-center'
                                                    } justify-center px-8 text-white`}>
                                                    <h2 className="text-3xl font-bold mb-2">
                                                        {slide.title === '--' ? '' : slide.title}
                                                    </h2>
                                                    <p className="text-lg mb-4">
                                                        {slide.subtitle === '--' ? '' : slide.subtitle}
                                                    </p>
                                                    {slide.description && <p className="text-sm mb-4 max-w-md">{slide.description}</p>}
                                                    {slide.buttonText && (
                                                        <button className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#E85A2A] transition-colors">
                                                            {slide.buttonText}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white p-6 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold">
                                    {editingSlide ? 'Edit Slider' : 'Create New Slider'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <form onSubmit={handleSaveSlide} className="p-6 space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Slider Image {!editingSlide && '*'}
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#FF6B35] hover:bg-orange-50 transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg shadow-md"
                                                />
                                                <div className="flex gap-3 justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            fileInputRef.current?.click()
                                                        }}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Change Image
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setImageFile(null)
                                                            setImagePreview(null)
                                                        }}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 py-4">
                                                <Upload size={48} className="mx-auto text-gray-400" />
                                                <div>
                                                    <p className="font-semibold text-gray-700">Click to upload image</p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 100MB</p>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter slide title"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                        maxLength="200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        placeholder="Enter slide subtitle"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                        maxLength="200"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{formData.subtitle.length}/200 characters</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter slide description (optional)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all resize-none"
                                        rows="3"
                                        maxLength="500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                                </div>

                                {/* Link */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Link URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://example.com/products"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                        maxLength="2000"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.link ? `${formData.link.length}/2000 characters` : 'Where should the button redirect?'}
                                    </p>
                                </div>

                                {/* Button Text and Alt */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.buttonText}
                                            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                                            placeholder="Shop Now"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                            maxLength="50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Alt Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.alt}
                                            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                                            placeholder="Describe the image"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                            maxLength="100"
                                        />
                                    </div>
                                </div>

                                {/* Alignment */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Text Alignment
                                    </label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, alignment: 'left' })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${formData.alignment === 'left'
                                                ? 'bg-[#FF6B35] text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <AlignLeft size={18} />
                                            Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, alignment: 'center' })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${formData.alignment === 'center'
                                                ? 'bg-[#FF6B35] text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <AlignCenter size={18} />
                                            Center
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, alignment: 'right' })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${formData.alignment === 'right'
                                                ? 'bg-[#FF6B35] text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <AlignRight size={18} />
                                            Right
                                        </button>
                                    </div>
                                </div>

                                {/* Font Sizes */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Font Sizes (px)
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Title Size</label>
                                            <input
                                                type="number"
                                                value={formData.titleSize}
                                                onChange={(e) => setFormData({ ...formData, titleSize: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value)
                                                    if (isNaN(val) || val < 10) setFormData({ ...formData, titleSize: 48 })
                                                    else if (val > 200) setFormData({ ...formData, titleSize: 200 })
                                                }}
                                                min="10"
                                                max="200"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Subtitle Size</label>
                                            <input
                                                type="number"
                                                value={formData.subtitleSize}
                                                onChange={(e) => setFormData({ ...formData, subtitleSize: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value)
                                                    if (isNaN(val) || val < 10) setFormData({ ...formData, subtitleSize: 20 })
                                                    else if (val > 200) setFormData({ ...formData, subtitleSize: 200 })
                                                }}
                                                min="10"
                                                max="200"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Description Size</label>
                                            <input
                                                type="number"
                                                value={formData.descriptionSize}
                                                onChange={(e) => setFormData({ ...formData, descriptionSize: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value)
                                                    if (isNaN(val) || val < 10) setFormData({ ...formData, descriptionSize: 16 })
                                                    else if (val > 200) setFormData({ ...formData, descriptionSize: 200 })
                                                }}
                                                min="10"
                                                max="200"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Button Size</label>
                                            <input
                                                type="number"
                                                value={formData.buttonSize}
                                                onChange={(e) => setFormData({ ...formData, buttonSize: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value)
                                                    if (isNaN(val) || val < 10) setFormData({ ...formData, buttonSize: 14 })
                                                    else if (val > 200) setFormData({ ...formData, buttonSize: 200 })
                                                }}
                                                min="10"
                                                max="200"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Range: 10-200px. Desktop size, will scale down on mobile.</p>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                        Publish immediately when saved
                                    </label>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white rounded-lg font-semibold hover:from-[#E85A2A] hover:to-[#D94A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Saving...' : uploading ? 'Uploading...' : editingSlide ? 'Update Slider' : 'Create Slider'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
