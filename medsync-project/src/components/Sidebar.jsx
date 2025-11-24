function Sidebar ({isOpen}) {
    const menuItems = [
        {label: "Home" , link: "/"},
        {label: "Products", link: "/products"},
        {label: "Profile", link: "/profile"},
        {label: "Settings", link: "/settings"}
    ]

    return(
    <div className={`${isOpen ? 'w-36' : 'w-0'} overflow-hidden bg-gray-900 text-white transition-all duration-300`}>
        <div className="p-4">
            <h2>App Name</h2>
        </div>
        <nav className="p-4">
            <ul>
            {
                menuItems.map((item, index) => (<li key={index}>{item.label}</li>))
            }
            </ul>
        </nav>
        
    </div>
    )
}

export default Sidebar