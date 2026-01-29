export default function Devices() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Devices (ACS)</h1>

            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h2 className="text-lg font-medium text-white mb-2">ACS Integration</h2>
                <p className="text-gray-400 mb-4">
                    This page will connect to your ACS server to manage CPE devices.
                </p>
                <p className="text-sm text-gray-500">
                    Configure your node's ACS URL in workspace settings to enable device management.
                </p>
            </div>
        </div>
    )
}
