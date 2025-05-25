'use client';

import {useUser as useSupabaseUser, User } from '@supabase/auth-helpers-react';

export function useDevUser(): User | null {
    const realUser = useSupabaseUser();
    const skipAuth = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === 'true';

    if (skipAuth && !realUser) {
        return {
            id: 'dev-user-id',
            email: 'dev@example.com',
            role: 'authenticated',
            aud: 'authenticated',
            created_at: '',
            app_metadata: {},
            user_metadata:{},
            identities:[],
            last_sign_in_at: '',
            updated_at: '',
    } as User;
}
    return realUser;
}