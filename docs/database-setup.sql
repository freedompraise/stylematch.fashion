-- StyleMatch Database Setup Script
-- Run this script in your Supabase SQL editor to set up the database schema

-- =============================================================================
-- ENABLE EXTENSIONS
-- =============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CREATE CUSTOM TYPES
-- =============================================================================

-- Create verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- =============================================================================
-- CREATE TABLES
-- =============================================================================

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    store_name TEXT NOT NULL UNIQUE,
    phone TEXT,
    bio TEXT,
    banner_image_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    wabusiness_url TEXT,
    payout_info JSONB,
    "isOnboarded" BOOLEAN DEFAULT false,
    verification_status verification_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    stock_quantity INTEGER NOT NULL,
    reserved_quantity INTEGER DEFAULT 0 NOT NULL,
    category TEXT NOT NULL,
    color TEXT NOT NULL,
    size TEXT NOT NULL,
    discount_price NUMERIC,
    discount_start DATE,
    discount_end DATE,
    images TEXT[],
    vendor_id UUID NOT NULL REFERENCES vendors(user_id) ON DELETE CASCADE,
    is_hottest_offer BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    variant_type VARCHAR(20) DEFAULT 'simple',
    base_price NUMERIC,
    has_variants BOOLEAN DEFAULT false,
    total_stock INTEGER DEFAULT 0,
    min_variant_price NUMERIC,
    max_variant_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(user_id) ON DELETE CASCADE,
    customer_info JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    delivery_location TEXT NOT NULL,
    delivery_date DATE,
    total_amount INTEGER DEFAULT 0,
    items JSONB NOT NULL,
    variant_id UUID,
    variant_sku VARCHAR(100),
    variant_size VARCHAR(50),
    variant_color VARCHAR(50),
    payment_proof_urls TEXT[],
    transaction_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_verified_at TIMESTAMP WITH TIME ZONE,
    payment_verified_by UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    expiry_processed TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product ratings table
CREATE TABLE IF NOT EXISTS product_ratings (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    review_count BIGINT,
    average_rating NUMERIC,
    five_star BIGINT,
    four_star BIGINT,
    three_star BIGINT,
    two_star BIGINT,
    one_star BIGINT
);

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_store_slug ON vendors(store_slug);
CREATE INDEX IF NOT EXISTS idx_vendors_verification_status ON vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendors_is_onboarded ON vendors("isOnboarded");

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_is_hottest_offer ON products(is_hottest_offer);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);

-- =============================================================================
-- CREATE TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CREATE RPC FUNCTIONS
-- =============================================================================

-- Get vendor storefront data
CREATE OR REPLACE FUNCTION public.get_vendor_storefront(slug text)
RETURNS TABLE(
    user_id uuid, 
    name text, 
    store_name text, 
    phone text, 
    bio text, 
    banner_image_url text, 
    instagram_url text, 
    facebook_url text, 
    wabusiness_url text, 
    store_slug text, 
    verification_status text, 
    payout_info jsonb, 
    created_at timestamp without time zone, 
    updated_at timestamp without time zone, 
    email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    v.user_id,
    v.name,
    v.store_name,
    v.phone,
    v.bio,
    v.banner_image_url,
    v.instagram_url,
    v.facebook_url,
    v.wabusiness_url,
    v.store_slug,
    v.verification_status::TEXT,
    v.payout_info,
    v.created_at,
    v.updated_at,
    au.email::TEXT
  FROM vendors v
  LEFT JOIN auth.users au ON v.user_id = au.id
  WHERE
    v.store_slug = slug
    AND v."isOnboarded" = true
    AND v.verification_status = 'verified';
END;
$function$;

-- Get vendor subaccount code
CREATE OR REPLACE FUNCTION public.get_vendor_subaccount(slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN (SELECT payout_info->>'subaccount_code'
          FROM vendors
          WHERE store_slug = slug);
END;
$function$;

-- Validate product availability
CREATE OR REPLACE FUNCTION public.validate_product_availability(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products
    WHERE id = product_id
    AND stock_quantity >= quantity
    AND is_deleted = false
  );
END;
$function$;

-- Reserve product inventory
CREATE OR REPLACE FUNCTION public.reserve_product_inventory(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity,
      reserved_quantity = reserved_quantity + quantity
  WHERE id = product_id
  AND stock_quantity >= quantity
  AND is_deleted = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or insufficient stock';
  END IF;
END;
$function$;

-- Confirm inventory reservation
CREATE OR REPLACE FUNCTION public.confirm_inventory_reservation(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE products
  SET reserved_quantity = reserved_quantity - quantity
  WHERE id = product_id
  AND reserved_quantity >= quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or insufficient reserved quantity';
  END IF;
END;
$function$;

-- Create order with payment proof
CREATE OR REPLACE FUNCTION public.create_order_with_payment_proof(order_data jsonb, payment_proof_urls text[])
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_order orders;
  item JSONB;
BEGIN
  -- 1. Validate inventory using items array
  FOR item IN SELECT * FROM jsonb_array_elements(order_data->'items')
  LOOP
    IF NOT validate_product_availability(
      (item->>'product_id')::UUID,
      (item->>'quantity')::INTEGER
    ) THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', item->>'product_id';
    END IF;
  END LOOP;

  -- 2. Reserve inventory
  FOR item IN SELECT * FROM jsonb_array_elements(order_data->'items')
  LOOP
    PERFORM reserve_product_inventory(
      (item->>'product_id')::UUID,
      (item->>'quantity')::INTEGER
    );
  END LOOP;

  -- 3. Create order
  INSERT INTO orders (
    vendor_id, status, delivery_location, delivery_date,
    total_amount, customer_info, items, payment_proof_urls, payment_status,
    expires_at, notes
  ) VALUES (
    (order_data->>'vendor_id')::UUID,
    'payment_pending',
    order_data->>'delivery_location',
    NULL,
    (order_data->>'total_amount')::DECIMAL,
    order_data->'customer_info',
    order_data->'items',
    payment_proof_urls,
    'pending',
    NOW() + INTERVAL '7 days',
    order_data->>'notes'
  ) RETURNING * INTO new_order;

  RETURN new_order;
END;
$function$;

-- Verify payment
CREATE OR REPLACE FUNCTION public.verify_payment(order_id uuid, is_verified boolean, notes text DEFAULT NULL)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  updated_order orders;
  order_item JSONB;
BEGIN
  -- Update order status based on verification
  UPDATE orders
  SET
    payment_status = CASE
      WHEN is_verified THEN 'verified'
      ELSE 'rejected'
    END,
    payment_verified_at = CASE
      WHEN is_verified THEN NOW()
      ELSE NULL
    END,
    payment_verified_by = CASE
      WHEN is_verified THEN auth.uid()
      ELSE NULL
    END,
    status = CASE
      WHEN is_verified THEN 'confirmed'
      ELSE 'payment_rejected'
    END,
    notes = COALESCE(notes, orders.notes)
  WHERE id = order_id
  RETURNING * INTO updated_order;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- If payment verified, confirm inventory reservations
  IF is_verified THEN
    FOR order_item IN SELECT * FROM jsonb_array_elements(updated_order.items)
    LOOP
      PERFORM confirm_inventory_reservation(
        (order_item->>'product_id')::UUID,
        (order_item->>'quantity')::INTEGER
      );
    END LOOP;
  END IF;

  RETURN updated_order;
END;
$function$;

-- Notify buyer payment verified
CREATE OR REPLACE FUNCTION public.notify_buyer_payment_verified(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $function$
DECLARE
  order_record orders;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM orders WHERE id = order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Here you would typically send an email notification
  -- For now, we'll just log it (you can integrate with your email service)
  RAISE NOTICE 'Payment verified for order % - customer: %',
    order_id,
    order_record.customer_info->>'email';
END;
$function$;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Vendors policies
CREATE POLICY "Vendors can view their own profile" ON vendors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile" ON vendors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert their own profile" ON vendors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Vendors can view their own products" ON products
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products" ON products
    FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own products" ON products
    FOR DELETE USING (auth.uid() = vendor_id);

-- Orders policies
CREATE POLICY "Vendors can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = vendor_id);

-- Product reviews policies
CREATE POLICY "Users can view all reviews" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- CREATE PUBLIC ACCESS POLICIES (for storefront)
-- =============================================================================

-- Allow public access to verified vendor profiles
CREATE POLICY "Public can view verified vendor profiles" ON vendors
    FOR SELECT USING (verification_status = 'verified' AND "isOnboarded" = true);

-- Allow public access to non-deleted products from verified vendors
CREATE POLICY "Public can view products from verified vendors" ON products
    FOR SELECT USING (
        is_deleted = false 
        AND EXISTS (
            SELECT 1 FROM vendors 
            WHERE vendors.user_id = products.vendor_id 
            AND vendors.verification_status = 'verified'
        )
    );

-- Allow public access to product ratings
CREATE POLICY "Public can view product ratings" ON product_ratings
    FOR SELECT USING (true);

-- Allow public access to product reviews
CREATE POLICY "Public can view product reviews" ON product_reviews
    FOR SELECT USING (true);

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- The database is now set up with:
-- ✅ All required tables
-- ✅ Proper indexes for performance
-- ✅ RLS policies for security
-- ✅ RPC functions for business logic
-- ✅ Triggers for automatic timestamp updates

-- Next steps:
-- 1. Configure authentication providers in Supabase Auth settings
-- 2. Set up Cloudinary for image storage
-- 3. Configure Paystack for payments (optional)
-- 4. Test the setup with the frontend application

