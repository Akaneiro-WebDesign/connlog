"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export const createClient = () => createSupabaseBrowserClient();