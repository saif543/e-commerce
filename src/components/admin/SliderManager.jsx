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
    Palette,
    Sliders,
} from 'lucide-react'

const MySwal = Swal

// ── Default form state ─────────────────────────────────────
const DEFAULT_FORM = {
    id: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    secondButtonText: 'Learn More',
    link: '',
    alignment: 'left',
    alt: '',
    isActive: true,
    // Font sizes
    titleSize: 52,
    subtitleSize: 14,
    descriptionSize: 16,
    buttonSize: 14,
    // Colors
    titleColor: '#ffffff',
    subtitleColor: '#ffffff',
    descriptionColor: '#ffffff',
    buttonBgColor: '#2D1854',
    buttonTextColor: '#ffffff',
    secondButtonBgColor: '#ffffff26',
    secondButtonTextColor: '#ffffff',
    // Overlay
    overlayOpacity: 0.65,
}

// ── Color Picker Input component ─────────────────────────────
function ColorField({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">{label}</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden h-10 bg-white">
                <input
                    type="color"
                    value={value.startsWith('#') && value.length <= 7 ? value : '#ffffff'}
                    onChange={e => onChange(e.target.value)}
                    className="h-full w-10 cursor-pointer border-0 p-0 bg-transparent"
                    style={{ padding: '2px' }}
                />
                <input
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 text-xs font-mono px-1 outline-none bg-transparent text-gray-700"
                    maxLength={9}
                    placeholder="#ffffff"
                />
            </div>
        </div>
    )
}

// ── Live Preview — mirrors Hero.jsx exactly ──────────────────
function LivePreview({ formData, imagePreview }) {
    const {
        title, subtitle, description,
        buttonText, secondButtonText,
        alignment, overlayOpacity,
        titleSize, descriptionSize, buttonSize,
        titleColor, subtitleColor, descriptionColor,
        buttonBgColor, buttonTextColor,
        secondButtonBgColor, secondButtonTextColor,
    } = formData

    const opacity = typeof overlayOpacity === 'number' ? overlayOpacity : 0.65

    const alignClass =
        alignment === 'right' ? 'items-end text-right' :
            alignment === 'center' ? 'items-center text-center' :
                'items-start text-left'

    // Scale factor: preview is 440px wide, real hero is ~1440px wide → scale ≈ 0.3
    const scale = 0.42

    return (
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-gray-200 shadow-inner" style={{ aspectRatio: '16/6.5', background: '#1a1a2e' }}>
            {/* Background Image */}
            {imagePreview && (
                <img
                    src={imagePreview}
                    alt="Preview bg"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            {!imagePreview && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-gray-600 text-xs text-center">
                        <ImageIcon size={28} className="mx-auto mb-1 opacity-40" />
                        <span className="opacity-50">No image selected</span>
                    </div>
                </div>
            )}

            {/* Dynamic Gradient Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to right, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity * 0.55}) 55%, rgba(0,0,0,0) 100%)`
                }}
            />

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-center px-6 ${alignClass}`}>
                {/* Badge */}
                {subtitle && (
                    <span
                        className="inline-block bg-white/20 backdrop-blur-sm text-[9px] font-semibold px-3 py-1 rounded-full mb-2 tracking-wide border border-white/15"
                        style={{ color: subtitleColor }}
                    >
                        {subtitle}
                    </span>
                )}

                {/* Title */}
                {title && (
                    <div
                        className="font-serif leading-tight mb-2 whitespace-pre-line"
                        style={{
                            fontSize: `${Math.round(titleSize * scale)}px`,
                            color: titleColor,
                            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                        }}
                    >
                        {title}
                    </div>
                )}

                {/* Description */}
                {description && (
                    <p
                        className="leading-relaxed mb-3 max-w-[55%]"
                        style={{
                            fontSize: `${Math.round(descriptionSize * scale)}px`,
                            color: descriptionColor,
                            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                        }}
                    >
                        {description}
                    </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {buttonText && (
                        <button
                            className="rounded font-semibold shadow-lg"
                            style={{
                                fontSize: `${Math.round(buttonSize * scale)}px`,
                                backgroundColor: buttonBgColor,
                                color: buttonTextColor,
                                padding: `${Math.round(14 * scale)}px ${Math.round(32 * scale)}px`,
                            }}
                        >
                            {buttonText}
                        </button>
                    )}
                    {secondButtonText && (
                        <button
                            className="rounded font-medium border border-white/20 backdrop-blur-sm"
                            style={{
                                fontSize: `${Math.round(buttonSize * scale)}px`,
                                backgroundColor: secondButtonBgColor,
                                color: secondButtonTextColor,
                                padding: `${Math.round(14 * scale)}px ${Math.round(24 * scale)}px`,
                            }}
                        >
                            {secondButtonText}
                        </button>
                    )}
                </div>
            </div>

            {/* Preview badge */}
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full border border-white/20 font-medium">
                Live Preview
            </div>

            {/* Nav arrows (decorative) */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M6 8L3 5l3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M4 8l3-3-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>

            {/* Dots (decorative) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-4 h-1 rounded-full bg-white opacity-80"></div>
                <div className="w-1 h-1 rounded-full bg-white opacity-40"></div>
                <div className="w-1 h-1 rounded-full bg-white opacity-40"></div>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────
export default function SliderManagement({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [slides, setSlides] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editingSlide, setEditingSlide] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({ ...DEFAULT_FORM })
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
            if (result.success) setSlides(result.slides || [])
        } catch (error) {
            console.error('Error fetching slides:', error)
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Failed to load slides', confirmButtonColor: '#FF6B35' })
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingSlide(null)
        setFormData({ ...DEFAULT_FORM, id: `slide-${Date.now()}` })
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
            secondButtonText: slide.secondButtonText || 'Learn More',
            link: slide.link || '',
            alignment: slide.alignment || 'left',
            alt: slide.alt || '',
            isActive: slide.isActive !== false,
            titleSize: slide.titleSize || 52,
            subtitleSize: slide.subtitleSize || 14,
            descriptionSize: slide.descriptionSize || 16,
            buttonSize: slide.buttonSize || 14,
            titleColor: slide.titleColor || '#ffffff',
            subtitleColor: slide.subtitleColor || '#ffffff',
            descriptionColor: slide.descriptionColor || '#ffffff',
            buttonBgColor: slide.buttonBgColor || '#2D1854',
            buttonTextColor: slide.buttonTextColor || '#ffffff',
            secondButtonBgColor: slide.secondButtonBgColor || '#ffffff26',
            secondButtonTextColor: slide.secondButtonTextColor || '#ffffff',
            overlayOpacity: typeof slide.overlayOpacity === 'number' ? slide.overlayOpacity : 0.65,
        })
        setImagePreview(typeof slide.image === 'string' ? slide.image : (slide.image?.url || null))
        setImageFile(null)
        setShowModal(true)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            MySwal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Only JPEG, PNG, WebP are allowed', confirmButtonColor: '#FF6B35' })
            return
        }
        if (file.size > 100 * 1024 * 1024) {
            MySwal.fire({ icon: 'error', title: 'File Too Large', text: 'Maximum file size is 100MB', confirmButtonColor: '#FF6B35' })
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

    const handleSaveSlide = async (e) => {
        e.preventDefault()
        if (!editingSlide && !imageFile) {
            MySwal.fire({ icon: 'warning', title: 'Image Required', text: 'Please select an image for the slide', confirmButtonColor: '#FF6B35' })
            return
        }
        setSaving(true)
        try {
            const token = await getToken()
            if (!token) throw new Error('Authentication required')

            const preparedFormData = {
                ...formData,
                title: formData.title.trim(),
                subtitle: formData.subtitle.trim(),
                buttonText: formData.buttonText.trim(),
                secondButtonText: formData.secondButtonText.trim(),
            }

            const slideData = {
                action: editingSlide ? 'update' : 'create',
                slideData: preparedFormData,
            }
            if (editingSlide) slideData.id = editingSlide.id

            const response = await fetch('/api/slider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(slideData),
            })

            const data = await response.json()
            if (!data.success) throw new Error(data.error || 'Failed to save slide')

            if (imageFile) {
                setUploading(true)
                const formDataImg = new FormData()
                formDataImg.append('image', imageFile)
                formDataImg.append('slideId', formData.id)
                const uploadResponse = await fetch('/api/slider', {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formDataImg,
                })
                const uploadData = await uploadResponse.json()
                if (!uploadData.success) throw new Error(uploadData.error || 'Failed to upload image')
                setUploading(false)
            }

            MySwal.fire({
                icon: 'success', title: 'Success!',
                text: `Slide ${editingSlide ? 'updated' : 'created'} successfully`,
                timer: 1500, showConfirmButton: false, confirmButtonColor: '#FF6B35',
            })
            setShowModal(false)
            setTimeout(() => fetchSlides(), 500)
        } catch (error) {
            console.error('Error saving slide:', error)
            MySwal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to save slide', confirmButtonColor: '#FF6B35' })
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const handleDeleteSlide = async (slideId) => {
        const result = await MySwal.fire({
            title: 'Permanently Delete Slide?',
            text: 'This will remove the slide and its image from Cloudinary. This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, permanently delete',
            cancelButtonText: 'Cancel',
        })
        if (!result.isConfirmed) return
        try {
            const token = await getToken()
            if (!token) throw new Error('Authentication required')
            const response = await fetch(`/api/slider?id=${slideId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.error || `Server error ${response.status}`)
            }
            MySwal.fire({ icon: 'success', title: 'Deleted!', text: 'Slide permanently deleted', timer: 1500, showConfirmButton: false, confirmButtonColor: '#FF6B35' })
            fetchSlides()
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: error.message || 'Failed to delete slide', confirmButtonColor: '#FF6B35' })
        }
    }

    const handleToggleActive = async (slide) => {
        try {
            const token = await getToken()
            if (!token) throw new Error('Authentication required')
            const response = await fetch(`/api/slider?id=${slide.id}&action=toggle`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await response.json()
            if (data.success) {
                MySwal.fire({
                    icon: 'success',
                    title: slide.isActive ? 'Deactivated!' : 'Activated!',
                    text: `Slide ${slide.isActive ? 'deactivated' : 'activated'}`,
                    timer: 1500, showConfirmButton: false, confirmButtonColor: '#FF6B35',
                })
                fetchSlides()
            }
        } catch (error) {
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Failed to update slide status', confirmButtonColor: '#FF6B35' })
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
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(reorderData),
            })
            if (!response.ok) throw new Error('Reorder failed')
        } catch (error) {
            console.error('Error reordering:', error)
            fetchSlides()
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
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hero Sliders</h2>
                    <p className="text-gray-600 mt-1">Manage homepage slider images and content</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {showPreview ? <X size={18} /> : <Eye size={18} />}
                        {showPreview ? 'Hide Previews' : 'Show Previews'}
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
                    {slides.map((slide, index) => {
                        const imgSrc = typeof slide.image === 'string' ? slide.image : (slide.image?.url || null)
                        return (
                            <motion.div
                                key={slide.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                            >
                                <div className="p-4">
                                    <div className="flex gap-4">
                                        {/* Thumbnail */}
                                        <div className="flex-shrink-0 w-44">
                                            {imgSrc ? (
                                                <img src={imgSrc} alt={slide.alt || slide.title} className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                                            ) : (
                                                <div className="w-full h-28 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                    <ImageIcon size={32} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
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
                                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {slide.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {slide.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{slide.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span>Align: {slide.alignment}</span>
                                                {slide.buttonText && <span>CTA: {slide.buttonText}</span>}
                                                {slide.link && (
                                                    <a href={slide.link} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                                                        View Link ↗
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => openEditModal(slide)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm flex items-center gap-1"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(slide)}
                                                className={`px-3 py-1.5 rounded transition-colors text-sm flex items-center gap-1 ${slide.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
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
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview for list item */}
                                    <AnimatePresence>
                                        {showPreview && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-gray-200"
                                            >
                                                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Preview</h4>
                                                <LivePreview
                                                    imagePreview={imgSrc}
                                                    formData={{
                                                        title: slide.title === '--' ? '' : slide.title || '',
                                                        subtitle: slide.subtitle === '--' ? '' : slide.subtitle || '',
                                                        description: slide.description || '',
                                                        buttonText: slide.buttonText || '',
                                                        secondButtonText: slide.secondButtonText || 'Learn More',
                                                        alignment: slide.alignment || 'left',
                                                        overlayOpacity: typeof slide.overlayOpacity === 'number' ? slide.overlayOpacity : 0.65,
                                                        titleSize: slide.titleSize || 52,
                                                        descriptionSize: slide.descriptionSize || 16,
                                                        buttonSize: slide.buttonSize || 14,
                                                        titleColor: slide.titleColor || '#ffffff',
                                                        subtitleColor: slide.subtitleColor || '#ffffff',
                                                        descriptionColor: slide.descriptionColor || '#ffffff',
                                                        buttonBgColor: slide.buttonBgColor || '#2D1854',
                                                        buttonTextColor: slide.buttonTextColor || '#ffffff',
                                                        secondButtonBgColor: slide.secondButtonBgColor || '#ffffff26',
                                                        secondButtonTextColor: slide.secondButtonTextColor || '#ffffff',
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* ── Create/Edit Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.97, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.97, opacity: 0, y: 10 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white p-5 flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {editingSlide ? '✏️ Edit Slider' : '✨ Create New Slider'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                    <X size={22} />
                                </button>
                            </div>

                            {/* Two-Panel Layout */}
                            <form onSubmit={handleSaveSlide}>
                                <div className="flex flex-col lg:flex-row min-h-0">

                                    {/* ── LEFT PANEL: Form ── */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[80vh] lg:max-h-[82vh] border-r border-gray-100">

                                        {/* Image Upload */}
                                        <section>
                                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                                🖼️ Slider Image {!editingSlide && <span className="text-red-500">*</span>}
                                            </label>
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-[#FF6B35] hover:bg-orange-50 transition-all"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {imagePreview ? (
                                                    <div className="space-y-3">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow" />
                                                        <div className="flex gap-2 justify-center">
                                                            <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                                                                Change Image
                                                            </button>
                                                            <button type="button" onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6 space-y-2">
                                                        <Upload size={36} className="mx-auto text-gray-400" />
                                                        <p className="font-semibold text-gray-600 text-sm">Click to upload image</p>
                                                        <p className="text-xs text-gray-400">PNG, JPG, WebP — up to 100MB</p>
                                                    </div>
                                                )}
                                                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                                            </div>
                                        </section>

                                        {/* Text Content */}
                                        <section className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-2">
                                                📝 Text Content
                                            </h3>

                                            {/* Title */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                                                <textarea
                                                    value={formData.title}
                                                    onChange={e => set('title', e.target.value)}
                                                    placeholder="Enter headline (use Enter for line break)"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                                                    rows="2"
                                                    maxLength={200}
                                                />
                                                <p className="text-xs text-gray-400 mt-0.5">{formData.title.length}/200</p>
                                            </div>

                                            {/* Subtitle / Badge */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle / Badge Text</label>
                                                <input
                                                    type="text"
                                                    value={formData.subtitle}
                                                    onChange={e => set('subtitle', e.target.value)}
                                                    placeholder="e.g. Premium Electronics Store"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                                    maxLength={200}
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => set('description', e.target.value)}
                                                    placeholder="Short description under the title (optional)"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none"
                                                    rows="2"
                                                    maxLength={500}
                                                />
                                                <p className="text-xs text-gray-400 mt-0.5">{formData.description.length}/500</p>
                                            </div>
                                        </section>

                                        {/* Buttons */}
                                        <section className="space-y-4">
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">🔘 Buttons</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Button Text</label>
                                                    <input
                                                        type="text"
                                                        value={formData.buttonText}
                                                        onChange={e => set('buttonText', e.target.value)}
                                                        placeholder="Shop Collection"
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                                        maxLength={50}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Second Button Text</label>
                                                    <input
                                                        type="text"
                                                        value={formData.secondButtonText}
                                                        onChange={e => set('secondButtonText', e.target.value)}
                                                        placeholder="Learn More"
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                                        maxLength={50}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Link URL (optional)</label>
                                                <input
                                                    type="url"
                                                    value={formData.link}
                                                    onChange={e => set('link', e.target.value)}
                                                    placeholder="https://example.com/products"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                                />
                                            </div>
                                        </section>

                                        {/* Alignment */}
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">↔️ Text Alignment</h3>
                                            <div className="flex gap-2">
                                                {['left', 'center', 'right'].map(a => (
                                                    <button
                                                        key={a}
                                                        type="button"
                                                        onClick={() => set('alignment', a)}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${formData.alignment === a ? 'bg-[#FF6B35] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {a === 'left' && <AlignLeft size={16} />}
                                                        {a === 'center' && <AlignCenter size={16} />}
                                                        {a === 'right' && <AlignRight size={16} />}
                                                        {a.charAt(0).toUpperCase() + a.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Font Sizes */}
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                                                <Sliders size={14} className="inline mr-1" />Font Sizes (px)
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { key: 'titleSize', label: 'Title', min: 16, max: 120, def: 52 },
                                                    { key: 'descriptionSize', label: 'Description', min: 10, max: 30, def: 16 },
                                                    { key: 'buttonSize', label: 'Button', min: 10, max: 24, def: 14 },
                                                    { key: 'subtitleSize', label: 'Badge/Subtitle', min: 8, max: 24, def: 14 },
                                                ].map(({ key, label, min, max, def }) => (
                                                    <div key={key}>
                                                        <label className="block text-xs text-gray-500 mb-1">{label} <span className="text-gray-400">({formData[key] || def}px)</span></label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="range"
                                                                min={min} max={max}
                                                                value={formData[key] || def}
                                                                onChange={e => set(key, parseInt(e.target.value))}
                                                                className="flex-1 h-2 accent-[#FF6B35] cursor-pointer"
                                                            />
                                                            <span className="text-xs font-mono w-7 text-gray-600 text-right">{formData[key] || def}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Colors */}
                                        <section>
                                            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">
                                                <Palette size={14} className="inline mr-1" />Colors
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <ColorField label="Title Color" value={formData.titleColor} onChange={v => set('titleColor', v)} />
                                                <ColorField label="Badge Color" value={formData.subtitleColor} onChange={v => set('subtitleColor', v)} />
                                                <ColorField label="Description Color" value={formData.descriptionColor} onChange={v => set('descriptionColor', v)} />
                                                <div className="col-span-2 grid grid-cols-2 gap-3">
                                                    <ColorField label="Primary Button BG" value={formData.buttonBgColor} onChange={v => set('buttonBgColor', v)} />
                                                    <ColorField label="Primary Button Text" value={formData.buttonTextColor} onChange={v => set('buttonTextColor', v)} />
                                                </div>
                                                <ColorField label="Second Button BG" value={formData.secondButtonBgColor} onChange={v => set('secondButtonBgColor', v)} />
                                                <ColorField label="Second Button Text" value={formData.secondButtonTextColor} onChange={v => set('secondButtonTextColor', v)} />
                                            </div>

                                            {/* Overlay Opacity */}
                                            <div className="mt-3">
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                    Dark Overlay Opacity — <span className="text-gray-400 font-mono">{Math.round(formData.overlayOpacity * 100)}%</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={Math.round(formData.overlayOpacity * 100)}
                                                    onChange={e => set('overlayOpacity', parseInt(e.target.value) / 100)}
                                                    className="w-full h-2 accent-[#FF6B35] cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                                    <span>Transparent (0%)</span>
                                                    <span>Very Dark (100%)</span>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Alt Text + Active */}
                                        <section className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Alt Text (accessibility)</label>
                                                <input
                                                    type="text"
                                                    value={formData.alt}
                                                    onChange={e => set('alt', e.target.value)}
                                                    placeholder="Describe the image briefly"
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                                                    maxLength={100}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={e => set('isActive', e.target.checked)}
                                                    className="w-5 h-5 rounded cursor-pointer accent-[#FF6B35]"
                                                />
                                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    Publish immediately when saved
                                                </label>
                                            </div>
                                        </section>

                                        {/* Save / Cancel */}
                                        <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
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
                                                {saving ? 'Saving...' : uploading ? 'Uploading image...' : editingSlide ? 'Update Slider' : 'Create Slider'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* ── RIGHT PANEL: Live Preview ── */}
                                    <div className="lg:w-[440px] xl:w-[500px] flex-shrink-0 bg-gray-50 border-t lg:border-t-0 border-gray-100">
                                        <div className="sticky top-0 p-5 space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Eye size={16} className="text-[#FF6B35]" />
                                                <span className="text-sm font-bold text-gray-800">Live Preview</span>
                                                <span className="text-xs text-gray-400 ml-1">— updates instantly</span>
                                            </div>

                                            <LivePreview formData={formData} imagePreview={imagePreview} />

                                            {/* Tip */}
                                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 leading-relaxed">
                                                <strong>Tip:</strong> Every change you make on the left is reflected here instantly. What you see is exactly how the Hero section will look on your homepage.
                                            </div>

                                            {/* Quick reference */}
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                                                <p className="text-xs font-bold text-gray-600">Current Settings</p>
                                                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                                                    <span>Alignment:</span><span className="font-medium text-gray-700 capitalize">{formData.alignment}</span>
                                                    <span>Title size:</span><span className="font-medium text-gray-700">{formData.titleSize}px</span>
                                                    <span>Overlay:</span><span className="font-medium text-gray-700">{Math.round(formData.overlayOpacity * 100)}%</span>
                                                    <span>Status:</span><span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-red-500'}`}>{formData.isActive ? 'Will Publish' : 'Draft'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
