'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import Swal from 'sweetalert2'

const MySwal = Swal

export default function SettingsManager({ getToken }) {
    const [settings, setSettings] = useState({
        siteName: 'TriDrop',
        siteEmail: 'admin@tridrop.com',
        currency: 'USD',
        taxRate: 10,
        shippingFee: 5,
        freeShippingThreshold: 100
    })

    const handleSave = async (e) => {
        e.preventDefault()

        MySwal.fire({
            icon: 'success',
            title: 'Settings Saved!',
            text: 'Your settings have been updated successfully',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#FF6B35',
        })
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-1">Manage your store settings</p>
            </div>

            <form onSubmit={handleSave} className="max-w-2xl space-y-6">
                {/* Site Settings */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Site Email
                            </label>
                            <input
                                type="email"
                                value={settings.siteEmail}
                                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Currency
                            </label>
                            <select
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing Settings */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Shipping</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                step="0.1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shipping Fee ($)
                            </label>
                            <input
                                type="number"
                                value={settings.shippingFee}
                                onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) })}
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Free Shipping Threshold ($)
                            </label>
                            <input
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                                step="0.01"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#E85A2A] text-white rounded-lg font-semibold hover:from-[#E85A2A] hover:to-[#D94A1A] transition-all shadow-md"
                >
                    <Save size={18} />
                    Save Settings
                </button>
            </form>
        </div>
    )
}
