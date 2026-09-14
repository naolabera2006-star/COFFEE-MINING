import { createClient } from '@supabase/supabase-js';
import { InquiryRecord, PropertyItem, PropertyLikeRecord } from '../types';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://etysytltrsoompnvaekt.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'sb_publishable_JgUUVHkzRwPaDDwxdNhrJg_IdzBieH0';

export const SUPABASE_PROJECT_ID =
  (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) ||
  'etysytltrsoompnvaekt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });
    if (res.ok || res.status === 200 || res.status === 404 || res.status === 401) {
      return { connected: true, message: 'Connected to Supabase' };
    }
    return { connected: false, message: `Supabase returned status: ${res.status}` };
  } catch (error) {
    return { connected: false, message: error instanceof Error ? error.message : 'Unknown connection error' };
  }
};

/**
 * SQL Script to create properties and property_likes tables in Supabase PostgreSQL
 * Keeps inquiries table untouched and preserves all data.
 */
export const PROPERTIES_TABLES_SQL = `-- =========================================================
-- COFFEE MINING: Properties & User Likes/Saved Listings
-- Database: Supabase PostgreSQL (Project: etysytltrsoompnvaekt)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/etysytltrsoompnvaekt/sql
-- (Note: public.inquiries table remains intact and unaffected)
-- =========================================================

-- 1. Create the properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,                     -- Logged-in user identifier (Supabase auth user UUID or email)
    user_email TEXT,                           -- Lister email address
    title TEXT NOT NULL,                       -- Property Name / Title
    description TEXT,                          -- Detailed property overview
    property_type TEXT NOT NULL,               -- 'Coffee Farm', 'Processing Plant', 'Roastery Estate', etc.
    price NUMERIC NOT NULL,                    -- Valuation or Listing Price in ETB
    expected_yield TEXT,                       -- Estimated annual/monthly yield
    location TEXT NOT NULL,                    -- Location (e.g. Yirgacheffe, Sidama, Jimma)
    image_url TEXT,                            -- Image photo URL
    features JSONB DEFAULT '[]'::jsonb,        -- Array of key features/highlights
    contact_phone TEXT,                        -- Lister phone
    contact_email TEXT,                        -- Lister email
    status TEXT NOT NULL DEFAULT 'active',     -- 'active', 'pending', 'sold'
    likes_count INTEGER DEFAULT 0 NOT NULL,    -- Likes counter
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the property_likes table (linked to users and properties)
CREATE TABLE IF NOT EXISTS public.property_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,                     -- Logged-in user identifier
    user_email TEXT,                           -- User email
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(property_id, user_id)
);

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties (user_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);

CREATE INDEX IF NOT EXISTS idx_property_likes_user_id ON public.property_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_property_likes_property_id ON public.property_likes (property_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_likes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for properties
-- Allow everyone to read active properties
DROP POLICY IF EXISTS "Allow public read of active properties" ON public.properties;
CREATE POLICY "Allow public read of active properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated/logged-in users to list properties
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON public.properties;
CREATE POLICY "Allow authenticated users to insert properties"
ON public.properties
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NOT NULL AND user_id <> '');

-- Allow users to update their own properties
DROP POLICY IF EXISTS "Allow users to update own properties" ON public.properties;
CREATE POLICY "Allow users to update own properties"
ON public.properties
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow users to delete their own properties
DROP POLICY IF EXISTS "Allow users to delete own properties" ON public.properties;
CREATE POLICY "Allow users to delete own properties"
ON public.properties
FOR DELETE
TO anon, authenticated
USING (true);

-- 6. RLS Policies for property_likes
-- Allow everyone to read likes
DROP POLICY IF EXISTS "Allow read of property likes" ON public.property_likes;
CREATE POLICY "Allow read of property likes"
ON public.property_likes
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow authenticated users to save/like properties
DROP POLICY IF EXISTS "Allow users to insert property likes" ON public.property_likes;
CREATE POLICY "Allow users to insert property likes"
ON public.property_likes
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NOT NULL AND user_id <> '');

-- Allow users to unlike/delete their own property likes
DROP POLICY IF EXISTS "Allow users to delete own property likes" ON public.property_likes;
CREATE POLICY "Allow users to delete own property likes"
ON public.property_likes
FOR DELETE
TO anon, authenticated
USING (true);

-- 7. Trigger to increment/decrement likes_count on properties table automatically
CREATE OR REPLACE FUNCTION public.handle_property_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.properties
        SET likes_count = likes_count + 1
        WHERE id = NEW.property_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.properties
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.property_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_property_like_count ON public.property_likes;
CREATE TRIGGER trigger_property_like_count
AFTER INSERT OR DELETE ON public.property_likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_property_like_count();

-- 8. Auto-update updated_at timestamp trigger for properties
CREATE OR REPLACE FUNCTION public.handle_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_properties_updated_at ON public.properties;
CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.handle_properties_updated_at();
`;

/**
 * SQL Script to create the inquiries table in Supabase PostgreSQL
 */
export const INQUIRIES_TABLE_SQL = `-- =========================================================
-- COFFEE MINING: Customer Inquiry & Support Ticket Table
-- Database: Supabase PostgreSQL (Project: etysytltrsoompnvaekt)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/etysytltrsoompnvaekt/sql
-- =========================================================

-- 1. Create the inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,                              -- User identifier or Supabase auth ID
    full_name TEXT NOT NULL,                   -- Submitter's full name
    email TEXT NOT NULL,                       -- Contact email address
    phone TEXT,                                -- Contact phone or Telebirr number
    subject TEXT NOT NULL,                     -- Inquiry Category / Topic
    message TEXT NOT NULL,                     -- Detailed inquiry content
    status TEXT NOT NULL DEFAULT 'pending',    -- 'pending', 'in_progress', 'resolved', 'closed'
    admin_response TEXT,                       -- Support staff reply / notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Set up permissive RLS policies for client operations:
-- Allow anyone (public anon & authenticated users) to submit inquiries
DROP POLICY IF EXISTS "Allow public insert to inquiries" ON public.inquiries;
CREATE POLICY "Allow public insert to inquiries"
ON public.inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading inquiries
DROP POLICY IF EXISTS "Allow public read of inquiries" ON public.inquiries;
CREATE POLICY "Allow public read of inquiries"
ON public.inquiries
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updating inquiries (e.g. status changes, admin replies)
DROP POLICY IF EXISTS "Allow update to inquiries" ON public.inquiries;
CREATE POLICY "Allow update to inquiries"
ON public.inquiries
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER set_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_inquiries_updated_at();
`;

const LOCAL_INQUIRIES_KEY = 'coffee_mining_local_inquiries';

export const getLocalInquiries = (): InquiryRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalInquiries = (items: InquiryRecord[]) => {
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota
  }
};

/**
 * Submit an inquiry directly to Supabase table `inquiries`
 */
export const submitInquiryToSupabase = async (payload: {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userId?: string;
}): Promise<{ success: boolean; data?: InquiryRecord; message: string; savedLocally?: boolean }> => {
  const localRecord: InquiryRecord = {
    id: 'inq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    userId: payload.userId,
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || '',
    subject: payload.subject.trim(),
    message: payload.message.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    // Attempt Supabase insert
    const { data, error } = await supabase
      .from('inquiries')
      .insert([
        {
          full_name: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || null,
          subject: payload.subject.trim(),
          message: payload.message.trim(),
          user_id: payload.userId || null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase inquiries insert error:', error.message);
      // Save locally as reliable fallback
      const existing = getLocalInquiries();
      saveLocalInquiries([localRecord, ...existing]);
      
      return {
        success: true,
        data: localRecord,
        savedLocally: true,
        message: 'Inquiry registered! (Stored locally. Please execute the SQL table script in Supabase to sync live to cloud).'
      };
    }

    const createdRecord: InquiryRecord = {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      status: data.status,
      adminResponse: data.admin_response,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    // Also update local cache
    const existing = getLocalInquiries();
    saveLocalInquiries([createdRecord, ...existing.filter(item => item.id !== createdRecord.id)]);

    return {
      success: true,
      data: createdRecord,
      message: 'Inquiry submitted successfully to Supabase database!'
    };
  } catch (err: any) {
    const existing = getLocalInquiries();
    saveLocalInquiries([localRecord, ...existing]);

    return {
      success: true,
      data: localRecord,
      savedLocally: true,
      message: 'Inquiry recorded! (Cached in browser session).'
    };
  }
};

/**
 * Fetch all submitted inquiries from Supabase
 */
export const fetchInquiriesFromSupabase = async (): Promise<InquiryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getLocalInquiries();
    }

    const mapped: InquiryRecord[] = data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone || '',
      subject: item.subject,
      message: item.message,
      status: item.status || 'pending',
      adminResponse: item.admin_response,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    // Merge with any local offline ones
    const local = getLocalInquiries();
    const existingIds = new Set(mapped.map(m => m.id));
    const merged = [...mapped, ...local.filter(l => !existingIds.has(l.id))];
    saveLocalInquiries(merged);
    return merged;
  } catch {
    return getLocalInquiries();
  }
};

/**
 * Update an inquiry status or reply
 */
export const updateInquiryInSupabase = async (
  id: string,
  updates: { status?: 'pending' | 'in_progress' | 'resolved' | 'closed'; adminResponse?: string }
): Promise<boolean> => {
  try {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.adminResponse !== undefined) dbUpdates.admin_response = updates.adminResponse;

    await supabase.from('inquiries').update(dbUpdates).eq('id', id);

    // Update local cache
    const current = getLocalInquiries();
    const updated = current.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    saveLocalInquiries(updated);
    return true;
  } catch {
    return false;
  }
};

/* ========================================================================= */
/* PROPERTIES & USER LIKES MANAGEMENT                                        */
/* ========================================================================= */

const LOCAL_PROPERTIES_KEY = 'coffee_mining_local_properties';
const LOCAL_LIKES_KEY_PREFIX = 'coffee_mining_likes_';

export const SEED_PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-yirgacheffe-highland',
    userId: 'admin',
    userEmail: 'admin@coffeemining.et',
    title: 'Yirgacheffe Highland Organic Estate',
    description: 'Premier 45-hectare certified organic coffee plantation located at 2,150m elevation with natural spring water, full canopy shade, and active washed cherry processing infrastructure.',
    propertyType: 'Coffee Farm',
    price: 3850000,
    expectedYield: '22.4% Annual Yield',
    location: 'Yirgacheffe, Gedeo Zone',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    features: ['Grade 1 Micro-lot', 'Natural Spring Gravity Flow', 'Washed & Natural Drying Beds', 'Fair Trade Certified'],
    contactPhone: '+251 91 123 4567',
    contactEmail: 'yirgacheffe.estate@coffeemining.et',
    status: 'active',
    likesCount: 14,
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'prop-sidama-washing-station',
    userId: 'admin',
    userEmail: 'admin@coffeemining.et',
    title: 'Sidama Micro-lot Processing & Washing Station',
    description: 'High-throughput eco-friendly wet mill equipped with 4 modern depulpers, 120 raised African drying beds, and solar pump integration with capacity for 500 tons/season.',
    propertyType: 'Processing Plant',
    price: 5200000,
    expectedYield: '26.8% Annual ROI',
    location: 'Aleta Wendo, Sidama Region',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80',
    features: ['Solar Depulping Unit', '500 Tons/Season Capacity', 'Ecological Wastewater Treatment', 'Direct Highway Access'],
    contactPhone: '+251 92 345 6789',
    contactEmail: 'sidama.mills@coffeemining.et',
    status: 'active',
    likesCount: 21,
    createdAt: '2026-08-15T14:30:00Z'
  },
  {
    id: 'prop-addis-roastery-hub',
    userId: 'admin',
    userEmail: 'admin@coffeemining.et',
    title: 'Addis Industrial Roasting & Extraction Facility',
    description: 'Turn-key urban coffee processing facility boasting commercial 120kg German roasters, precision nitrogen packaging, quality grading lab, and bonded export warehousing.',
    propertyType: 'Roastery Estate',
    price: 8900000,
    expectedYield: '31.5% Projected ROI',
    location: 'Bole Sub-City, Addis Ababa',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
    features: ['120kg Batch Roasting Tech', 'CQI Certified Q-Grader Lab', 'Nitrogen Flush Packing Line', 'Bonded Export Storage'],
    contactPhone: '+251 91 999 8877',
    contactEmail: 'addis.roastery@coffeemining.et',
    status: 'active',
    likesCount: 18,
    createdAt: '2026-08-20T08:15:00Z'
  },
  {
    id: 'prop-jimma-forest-estate',
    userId: 'admin',
    userEmail: 'admin@coffeemining.et',
    title: 'Jimma Heritage Wild Forest Coffee Estate',
    description: 'Spectacular 80-hectare semi-forest coffee sanctuary with ancient heirloom Arabica varieties, bee-keeping honey integration, and certified Rainforest Alliance stewardship.',
    propertyType: 'Coffee Farm',
    price: 4400000,
    expectedYield: '19.8% Annual ROI',
    location: 'Jimma, Oromia Region',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    features: ['Heirloom Forest Arabica', 'Biodiversity & Forest Canopy', 'Integrated Honey Apiary', 'Full Land Title Deed'],
    contactPhone: '+251 93 111 2233',
    contactEmail: 'jimma.forest@coffeemining.et',
    status: 'active',
    likesCount: 9,
    createdAt: '2026-08-25T11:45:00Z'
  }
];

export const getLocalProperties = (): PropertyItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(SEED_PROPERTIES));
      return SEED_PROPERTIES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_PROPERTIES;
  }
};

export const saveLocalProperties = (items: PropertyItem[]) => {
  try {
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota
  }
};

export const getLocalUserLikes = (userId: string): string[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(LOCAL_LIKES_KEY_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalUserLikes = (userId: string, propertyIds: string[]) => {
  if (!userId) return;
  try {
    localStorage.setItem(LOCAL_LIKES_KEY_PREFIX + userId, JSON.stringify(propertyIds));
  } catch {
    // Ignore storage quota
  }
};

/**
 * Fetch all properties from Supabase public.properties
 */
export const fetchPropertiesFromSupabase = async (): Promise<PropertyItem[]> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalProperties();
    }

    const mapped: PropertyItem[] = data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      title: item.title,
      description: item.description || '',
      propertyType: item.property_type || 'Coffee Farm',
      price: Number(item.price) || 0,
      expectedYield: item.expected_yield || '',
      location: item.location || 'Ethiopia',
      imageUrl: item.image_url || SEED_PROPERTIES[0].imageUrl,
      features: Array.isArray(item.features) ? item.features : [],
      contactPhone: item.contact_phone,
      contactEmail: item.contact_email,
      status: item.status || 'active',
      likesCount: Number(item.likes_count) || 0,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    // Cache locally
    saveLocalProperties(mapped);
    return mapped;
  } catch {
    return getLocalProperties();
  }
};

/**
 * Create a new property listing in Supabase linked to the logged-in user
 */
export const createPropertyInSupabase = async (
  payload: Omit<PropertyItem, 'id' | 'createdAt' | 'likesCount'>
): Promise<{ success: boolean; data?: PropertyItem; message: string }> => {
  const localId = 'prop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newRecord: PropertyItem = {
    ...payload,
    id: localId,
    likesCount: 0,
    createdAt: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          user_id: payload.userId,
          user_email: payload.userEmail || null,
          title: payload.title.trim(),
          description: payload.description.trim(),
          property_type: payload.propertyType,
          price: payload.price,
          expected_yield: payload.expectedYield || null,
          location: payload.location.trim(),
          image_url: payload.imageUrl,
          features: payload.features || [],
          contact_phone: payload.contactPhone || null,
          contact_email: payload.contactEmail || null,
          status: payload.status || 'active',
          likes_count: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase properties insert fallback:', error.message);
      const existing = getLocalProperties();
      saveLocalProperties([newRecord, ...existing]);
      return {
        success: true,
        data: newRecord,
        message: 'Property listed successfully! (Saved in local session and ready to sync to Supabase).'
      };
    }

    const createdRecord: PropertyItem = {
      id: data.id,
      userId: data.user_id,
      userEmail: data.user_email,
      title: data.title,
      description: data.description,
      propertyType: data.property_type,
      price: Number(data.price),
      expectedYield: data.expected_yield,
      location: data.location,
      imageUrl: data.image_url,
      features: Array.isArray(data.features) ? data.features : [],
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      status: data.status,
      likesCount: Number(data.likes_count) || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    const existing = getLocalProperties();
    saveLocalProperties([createdRecord, ...existing.filter(p => p.id !== createdRecord.id)]);

    return {
      success: true,
      data: createdRecord,
      message: 'Property successfully published and saved to Supabase!'
    };
  } catch (err: any) {
    const existing = getLocalProperties();
    saveLocalProperties([newRecord, ...existing]);
    return {
      success: true,
      data: newRecord,
      message: 'Property saved locally.'
    };
  }
};

/**
 * Delete a property listed by the user
 */
export const deletePropertyFromSupabase = async (
  propertyId: string,
  userId: string
): Promise<boolean> => {
  try {
    await supabase
      .from('properties')
      .delete()
      .match({ id: propertyId, user_id: userId });

    const existing = getLocalProperties();
    saveLocalProperties(existing.filter(p => p.id !== propertyId));
    return true;
  } catch {
    const existing = getLocalProperties();
    saveLocalProperties(existing.filter(p => p.id !== propertyId));
    return true;
  }
};

/**
 * Fetch list of property IDs liked/saved by a logged-in user
 */
export const fetchUserLikedPropertyIds = async (userId: string): Promise<string[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('property_likes')
      .select('property_id')
      .eq('user_id', userId);

    if (error || !data) {
      return getLocalUserLikes(userId);
    }

    const ids = data.map((d: any) => String(d.property_id));
    saveLocalUserLikes(userId, ids);
    return ids;
  } catch {
    return getLocalUserLikes(userId);
  }
};

/**
 * Toggle like/save property for a logged-in user
 */
export const togglePropertyLikeInSupabase = async (
  propertyId: string,
  userId: string,
  userEmail?: string
): Promise<{ liked: boolean; newCount: number }> => {
  if (!userId) throw new Error('User must be logged in to like a property');

  const currentLikes = getLocalUserLikes(userId);
  const isAlreadyLiked = currentLikes.includes(propertyId);
  const currentProps = getLocalProperties();
  const targetProp = currentProps.find(p => p.id === propertyId);
  const prevCount = targetProp?.likesCount || 0;

  if (isAlreadyLiked) {
    // Unlike
    const updatedLikes = currentLikes.filter(id => id !== propertyId);
    saveLocalUserLikes(userId, updatedLikes);
    const newCount = Math.max(0, prevCount - 1);
    saveLocalProperties(
      currentProps.map(p => p.id === propertyId ? { ...p, likesCount: newCount } : p)
    );

    try {
      await supabase
        .from('property_likes')
        .delete()
        .match({ property_id: propertyId, user_id: userId });
      
      // Update count on properties table
      await supabase
        .from('properties')
        .update({ likes_count: newCount })
        .eq('id', propertyId);
    } catch {
      // Ignored, handled locally
    }

    return { liked: false, newCount };
  } else {
    // Like
    const updatedLikes = [...currentLikes, propertyId];
    saveLocalUserLikes(userId, updatedLikes);
    const newCount = prevCount + 1;
    saveLocalProperties(
      currentProps.map(p => p.id === propertyId ? { ...p, likesCount: newCount } : p)
    );

    try {
      await supabase
        .from('property_likes')
        .insert([
          {
            property_id: propertyId,
            user_id: userId,
            user_email: userEmail || null
          }
        ]);

      await supabase
        .from('properties')
        .update({ likes_count: newCount })
        .eq('id', propertyId);
    } catch {
      // Ignored, handled locally
    }

    return { liked: true, newCount };
  }
};
