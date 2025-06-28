import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, type JSX } from 'react';
import Loading from './CO_Loading';
import { useUserStore } from '../context/UserStoreContext';
import { useUserStoreSync } from '../hooks/hooks';

interface ProtectedRouteProps {
    children: JSX.Element
}

interface DecodedToken {
    exp?: number;
    [key: string]: unknown;
}

function ProtectedRoute(props: ProtectedRouteProps) {
    const utStore = useUserStore()

    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [tokens, setTokens] = useState<any>(utStore.read("ActionLogin"))
    useUserStoreSync(utStore, "ActionLogin", setTokens)

    useEffect(() => {
        (async () => {
            try {
                await auth();
            } catch {
                setIsAuthorized(false);
            }
    })();
    }, []);

    console.log(tokens)

    const refreshToken = async () => {
        if (tokens) {
            const refreshToken = tokens["refresh"];
            try {
            const res = await utStore.post("ActionRefreshToken", {
                refresh: refreshToken
            });
            if (res.msg["access"]) {
                setIsAuthorized(true);
                utStore.update("ActionLogin", {refresh: refreshToken, access: res.msg["access"]})
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            setIsAuthorized(false);
            console.log(error)
        }
        } else {
            setIsAuthorized(false)
            return
        }
        
    }

    const auth = async () => {
        if (!tokens) {
            setIsAuthorized(false);
            return
        } else {
            const decoded = jwtDecode<DecodedToken>(tokens["access"])
            const tokenExpiration = decoded.exp

            const now = Date.now() / 1000;
            if (typeof tokenExpiration === "number" && tokenExpiration < now) {
            await refreshToken();
            } else {
                setIsAuthorized(true);
            }
        }
    }
    
    if (isAuthorized === null) {
        return <Loading />;
    };

    return isAuthorized ? props.children : <Navigate to="/users/login/" replace />;
}

export default ProtectedRoute;