function Settings() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-900">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Profile Settings</h2>
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">RG</div>
          <div>
            <h3 className="text-lg font-semibold">Ryan Garcia</h3>
            <p className="text-gray-600">Administrator</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800">Change Photo</button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" defaultValue="Ryan Garcia" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue="ryan@medsync.com" className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Dashboard Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Desktop Notifications</span>
            <input type="checkbox" className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <span>Auto-refresh Dashboard</span>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;