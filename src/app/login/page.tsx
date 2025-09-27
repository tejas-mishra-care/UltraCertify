
"use client";

import React from 'react';
import Login from '@/components/login';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);


    if(loading || user) {
        // Render nothing or a loader while redirecting
        return null;
    }

    return <Login />;
};

export default LoginPage;
