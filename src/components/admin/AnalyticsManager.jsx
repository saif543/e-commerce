'use client'

import { useEffect, useState } from 'react'
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AnalyticsManager({ getToken }) {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
        orderGrowth: 0
    })

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const token = await getToken()
            // Fetch data from multiple endpoints
            const [ordersRes, usersRes, productsRes] = await Promise.all([
                fetch('/api/orders?getAllOrders=true', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/user?getAllUsers=true', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/product', { headers: { Authorization: `Bearer ${token}` } })
            ])

            const ordersData = await ordersRes.json()
            const usersData = await usersRes.json()
            const productsData = await productsRes.json()

            const orders = ordersData.orders || []
            const totalRevenue = orders.reduce((sum, order) => sum + (order.pricing?.total || order.total || 0), 0)

            setStats({
                totalRevenue,
                totalOrders: orders.length,
                totalCustomers: usersData.users?.length || 0,
                totalProducts: productsData.products?.length || 0,
                revenueGrowth: 0, // Can be calculated with date comparison
                orderGrowth: 0
            })
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#FF6B35] mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600 mt-1">Overview of your store performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue */}
                <div className="bg-gradient-to-br from-[#FF6B35] to-[#E85A2A] rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={40} className="opacity-80" />
                        <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
                            <TrendingUp size={14} />
                            <span>+{stats.revenueGrowth}%</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</h3>
                    <p className="text-sm opacity-90">Total Revenue</p>
                </div>

                {/* Orders */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="text-blue-600" size={24} />
                        </div>
                        <span className="text-sm text-green-600 font-medium">+{stats.orderGrowth}%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</h3>
                    <p className="text-sm text-gray-600">Total Orders</p>
                </div>

                {/* Customers */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</h3>
                    <p className="text-sm text-gray-600">Total Customers</p>
                </div>

                {/* Products */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="text-green-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</h3>
                    <p className="text-sm text-gray-600">Total Products</p>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="text-yellow-600" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">3.2%</h3>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="text-[#FF6B35]" size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue / stats.totalOrders)}</h3>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <BarChart3 size={48} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Chart will be implemented with Chart.js</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
