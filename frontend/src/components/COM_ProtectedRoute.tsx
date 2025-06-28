import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, type JSX } from 'react';
import COM_Loading from './COM_Loading';
import { useUserStore } from '../context/CTX_UserStore';
import { useUserStoreSync } from '../hooks/hooks';

interface ProtectedRouteProps {
    children: JSX.Element
}

interface DecodedToken {
    exp?: number;
    [key: string]: unknown;
}

function COM_ProtectedRoute(props: ProtectedRouteProps) {
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
    }, [tokens]);

    console.log(tokens)

    const refreshToken = async () => {
        if (tokens) {
            const refreshToken = tokens["refresh"];
            try {
            await utStore.post("ActionRefreshToken", {
                refresh: refreshToken
            });
            if (utStore.read("ActionRefreshToken")) {
                setIsAuthorized(true);
                utStore.update("ActionLogin", {refresh: refreshToken, access: utStore.read("ActionRefreshToken")})
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
        return <COM_Loading />;
    };

    return isAuthorized ? props.children : <Navigate to="/users/login/" replace />;
}

export default COM_ProtectedRoute;