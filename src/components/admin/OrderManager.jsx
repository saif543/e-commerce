'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import {
    Search,
    Filter,
    Eye,
    Package,
    MapPin,
    Clock,
    DollarSign,
    User
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const MySwal = Swal

export default function OrderManager({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const token = await getToken()
            const response = await fetch('/api/orders?getAllOrders=true', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders || [])
                setFilteredOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setOrders([])
            setFilteredOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        applyFilters()
    }, [searchTerm, filterStatus, orders])

    const applyFilters = () => {
        let filtered = [...orders]

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(order => order.status === filterStatus)
        }

        setFilteredOrders(filtered)
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            processing: 'bg-blue-100 text-blue-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        }
        return colors[status] || colors.pending
    }

    const viewOrderDetails = (order) => {
        setSelectedOrder(order)
        setShowDetailModal(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                    <p className="text-gray-600 mt-1">{orders.length} total orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                        />
                    </div>
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FF6B35] bg-opacity-10 rounded-lg flex items-center justify-center">
                                    <Package className="text-[#FF6B35]" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <User className="text-gray-400" size={16} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                                    <p className="text-xs text-gray-500">{order.customer.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="text-gray-400" size={16} />
                                <div>
                                    <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p className="text-xs text-gray-500">{order.shippingAddress.country}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <DollarSign className="text-gray-400" size={16} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{formatCurrency(order.pricing?.total || order.total || 0)}</p>
                                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => viewOrderDetails(order)}
                                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <Eye size={16} />
                                View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white p-6">
                            <h2 className="text-2xl font-bold">Order Details</h2>
                            <p className="text-sm opacity-90">{selectedOrder.orderNumber}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                                    <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.shippingAddress.street}<br />
                                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                                    {selectedOrder.shippingAddress.country}
                                </p>
                            </div>

                            {/* Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4">
                                        <p className="font-bold text-lg">Total</p>
                                        <p className="font-bold text-lg text-[#FF6B35]">{formatCurrency(selectedOrder.total)}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.trackingNumber && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Tracking Information</h3>
                                    <p className="text-sm text-gray-600">
                                        Tracking Number: <span className="font-medium">{selectedOrder.trackingNumber}</span>
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
