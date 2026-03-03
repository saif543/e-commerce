'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import {
    Plus,
    Trash2,
    X,
    Upload,
    Save,
    Tag,
    Image as ImageIcon,
    Edit2,
} from 'lucide-react'

const MySwal = Swal

export default function BrandManager({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [brands, setBrands] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editingBrand, setEditingBrand] = useState(null)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({ name: '' })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/brand')
            const data = await res.json()
            if (data.brands) {
                setBrands(data.brands || [])
            }
        } catch (err) {
            console.error('Error fetching brands:', err)
            MySwal.fire({ icon: 'error', title: 'Error', text: 'Failed to load brands', confirmButtonColor: '#FF6B35' })
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingBrand(null)
        setFormData({ name: '' })
        setImageFile(null)
        setImagePreview(null)
        setShowModal(true)
    }

    const openEditModal = (brand) => {
        setEditingBrand(brand)
        setFormData({ name: brand.name || '' })
        setImageFile(null)
        setImagePreview(brand.logo?.url || null)
        setShowModal(true)
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            MySwal.fire({ icon: 'error', title: 'Invalid File Type', text: 'Only JPEG, PNG, WebP, SVG allowed', confirmButtonColor: '#FF6B35' })
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            MySwal.fire({ icon: 'error', title: 'File Too Large', text: 'Maximum file size is 10MB', confirmButtonColor: '#FF6B35' })
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSave = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            MySwal.fire({ icon: 'warning', title: 'Brand Name Required', text: 'Please enter a brand name', confirmButtonColor: '#FF6B35' })
            return
        }

        setSaving(true)
        try {
            const token = await getToken()
            if (!token) throw new Error('Authentication required')

            if (editingBrand) {
                // Update brand name via PUT with JSON
                const res = await fetch('/api/brand', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id: editingBrand._id,
                        name: formData.name.trim(),
                    }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to update brand')

                // Upload logo if changed (PUT with FormData)
                if (imageFile) {
                    const fd = new FormData()
                    fd.append('id', editingBrand._id)
                    fd.append('logo', imageFile)  // API expects 'logo' field
                    const uploadRes = await fetch('/api/brand', {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                    })
                    const uploadData = await uploadRes.json()
                    if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload logo')
                }
            } else {
                // Create brand via POST JSON
                const res = await fetch('/api/brand', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: formData.name.trim() }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to create brand')

                const newBrandId = data.brand?._id
                // Upload logo if provided
                if (imageFile && newBrandId) {
                    const fd = new FormData()
                    fd.append('id', newBrandId)
                    fd.append('logo', imageFile)  // API expects 'logo' field
                    const uploadRes = await fetch('/api/brand', {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                    })
                    const uploadData = await uploadRes.json()
                    if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload logo')
                }
            }

            MySwal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Brand ${editingBrand ? 'updated' : 'created'} successfully`,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#FF6B35',
            })
            setShowModal(false)
            fetchBrands()
        } catch (err) {
            console.error('Error saving brand:', err)
            MySwal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to save brand', confirmButtonColor: '#FF6B35' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (brand) => {
        const result = await MySwal.fire({
            title: 'Permanently Delete Brand?',
            text: `"${brand.name}" and its logo will be permanently deleted. This cannot be undone.`,
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
            const res = await fetch(`/api/brand?id=${brand._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || `Server error ${res.status}`)
            }
            MySwal.fire({ icon: 'success', title: 'Deleted!', text: `"${brand.name}" has been permanently deleted`, timer: 1500, showConfirmButton: false, confirmButtonColor: '#FF6B35' })
            fetchBrands()
        } catch (err) {
            console.error('Error deleting brand:', err)
            MySwal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to delete brand', confirmButtonColor: '#FF6B35' })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading brands...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Brands</h2>
                    <p className="text-gray-600 mt-1">{brands.length} brand{brands.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white rounded-lg hover:from-[#E85A2A] hover:to-[#D94A1A] transition-all shadow-md"
                >
                    <Plus size={18} />
                    Add Brand
                </button>
            </div>

            {/* Brand List */}
            {brands.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <Tag size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500 font-medium">No brands yet</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
                    >
                        Add Your First Brand
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {brands.map((brand) => (
                        <motion.div
                            key={brand._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Logo */}
                            <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                {brand.logo?.url ? (
                                    <img
                                        src={brand.logo.url}
                                        alt={brand.name}
                                        className="max-h-24 max-w-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-300">
                                        <ImageIcon size={40} />
                                        <span className="text-xs mt-1">No logo</span>
                                    </div>
                                )}
                            </div>

                            {/* Name + Actions */}
                            <div className="p-4 flex items-center justify-between">
                                <p className="font-semibold text-gray-900 truncate">{brand.name}</p>
                                <div className="flex gap-1 ml-2">
                                    <button
                                        onClick={() => openEditModal(brand)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit brand"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete brand"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
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
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white p-6 flex items-center justify-between rounded-t-xl">
                                <h2 className="text-xl font-bold">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                {/* Brand Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Apple, Samsung, Sony"
                                        required
                                        maxLength={100}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Brand Logo {editingBrand ? '(optional — leave blank to keep current)' : '(optional)'}
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#FF6B35] hover:bg-orange-50 transition-all"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="space-y-3">
                                                <img src={imagePreview} alt="Logo preview" className="max-h-24 max-w-full object-contain mx-auto" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload size={36} className="mx-auto text-gray-400" />
                                                <p className="text-sm text-gray-600 font-medium">Click to upload logo</p>
                                                <p className="text-xs text-gray-400">PNG, JPG, WebP, SVG up to 10MB</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white rounded-lg font-semibold hover:from-[#E85A2A] hover:to-[#D94A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Saving...' : editingBrand ? 'Update Brand' : 'Add Brand'}
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
