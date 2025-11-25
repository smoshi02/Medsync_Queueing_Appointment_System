function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 max-w-2xl">
        <div className="space-y-6">
          {[
            { title: "Notifications", desc: "Manage your notification preferences" },
            { title: "Privacy", desc: "Control your privacy settings" },
            { title: "Security", desc: "Update password and security options" },
            { title: "Appearance", desc: "Customize the interface" }
          ].map((setting, i) => (
            <div key={i} className="border-b border-blue-100 pb-4 last:border-0">
              <h3 className="font-bold text-blue-900">{setting.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{setting.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;