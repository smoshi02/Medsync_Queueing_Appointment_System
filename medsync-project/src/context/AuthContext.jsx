import { createContext } from "react";

const AuthContext = createContext(null)

import React from 'react'

export const AuthProvider = ({children}) => {
    const[token, setToken] = useState(localStorage.getItem("token"))

    function login(newToken){
        setToken(newToken)
        localStorage.setItem("token", newToken)
    }

    function logout(){
        setToken(null)
        localStorage.removeItem ("token")
    }

    const authData = {token, login, logout}
  return <AuthContext.Provider value = {authData}>{children}</AuthContext.Provider>
}

export function useAuth(){
    return useContext(AuthContext)
}