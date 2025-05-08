// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { createContext } from "react";

// const authConext = createContext();

// export const AuthProvider = ({children}) => {
//     const [authState,setAuthState] = useState({
//         token:null,
//         user:null,
//         isAuthenticated:false
//     });

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const user = JSON.parse(localStorage.getItem('user'));

//         if(token && user)
//         {
//             setAuthState({
//                 token,
//                 user,
//                 isAuthenticated:true
//             })
//         }
//     },[])

//     console.log(authState);




// }


import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isAuthenticated: false
    });
    const navigate = useNavigate();

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setAuthState({
                token,
                user: JSON.parse(user),
                isAuthenticated: true
            });
        }
    }, []);

    const login = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
            token,
            user,
            isAuthenticated: true
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
            token: null,
            user: null,
            isAuthenticated: false
        });
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);    