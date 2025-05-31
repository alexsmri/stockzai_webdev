import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { useState, useEffect, type JSX } from 'react';

interface ProtectedRouteProps {
    children: JSX.Element
}

interface DecodedToken {
    exp?: number;
    [key: string]: unknown;
}

function ProtectedRoute(props: ProtectedRouteProps) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            try {
                await auth();
            } catch {
                setIsAuthorized(false);
            }
    })();
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }
        try {
            const res = await api.post('/api/users/token/refresh/', {
                refresh: refreshToken
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            setIsAuthorized(false);
            console.log(error)
        }
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return
        }
        const decoded = jwtDecode<DecodedToken>(token)
        const tokenExpiration = decoded.exp

        const now = Date.now() / 1000;
        if (typeof tokenExpiration === "number" && tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    }
    
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    };

    return isAuthorized ? props.children : <Navigate to="/users/login/" replace />;
}

export default ProtectedRoute;