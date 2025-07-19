import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
{
    auth: {
    autoRefreshToken: false,
    persistSession: false
    }
}
);

export async function POST(req: NextRequest){
    console.log('=== API Route called ===');
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    try {
        const { id, email } = await req.json();

        console.log('=== public.users テーブルへの保存開始 ===');
        console.log('User ID:', id, 'Email:', email);

        const { data, error } = await supabaseAdmin
        .from('users')
        .insert([
            {
                id: id,
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ])
        .select();

        if (error) {
        console.error('Database insertion error:', error);
        return NextResponse.json(
            { error: `Database error: ${error.message}` },
            { status: 500 }
        );
        }
        console.log('User successfully saved to public.users:', data);
        return NextResponse.json({ success: true, user: data[0] });
    } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
        { error: 'Unexpected error occurred' },
        { status: 500 }
    );
    }
}