'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function CustomerManager({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [filteredCustomers, setFilteredCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        try {
            const token = await getToken()
            const response = await fetch('/api/user?getAllUsers=true', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                // Transform user data to customer format
                const customerData = (data.users || []).map(user => ({
                    _id: user._id,
                    name: user.displayName || user.email?.split('@')[0] || 'Customer',
                    email: user.email,
                    phone: user.phone || 'N/A',
                    createdAt: user.createdAt || new Date(),
                    totalOrders: user.stats?.totalOrders || 0,
                    totalSpent: user.stats?.totalSpent || 0
                }))
                setCustomers(customerData)
                setFilteredCustomers(customerData)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
            setCustomers([])
            setFilteredCustomers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (searchTerm) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredCustomers(filtered)
        } else {
            setFilteredCustomers(customers)
        }
    }, [searchTerm, customers])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading customers...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                    <p className="text-gray-600 mt-1">{customers.length} total customers</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <motion.div
                        key={customer._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-[#FF6B35] bg-opacity-10 rounded-full flex items-center justify-center">
                                <User className="text-[#FF6B35]" size={32} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                                <p className="text-sm text-gray-500">Member since {formatDate(customer.createdAt)}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail size={16} />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <span>{customer.phone}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Total Orders</p>
                                <p className="text-lg font-semibold text-gray-900">{customer.totalOrders}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Spent</p>
                                <p className="text-lg font-semibold text-[#FF6B35]">${customer.totalSpent}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
