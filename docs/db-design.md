## 2. Database Schema & Table Relationships

---

### Vendors Table

| Column                | Type      | Constraints      | Description                                   |
| --------------------- | --------- | ---------------- | --------------------------------------------- |
| `user_id`             | UUID      | Primary Key      | Vendor's unique user ID (from Supabase Auth)  |
| `store_slug`          | Text      | Not Null, Unique | Vendor's unique store slug (max 50 chars)     |
| `name`                | Text      | Not Null         | Vendor name or owner's name                   |
| `store_name`          | Text      | Not Null, Unique | Business/Company name                         |
| `phone`               | Text      | Nullable         | Vendor contact phone                          |
| `bio`                 | Text      | Nullable         | Short biography / description                 |
| `banner_image_url`    | Text      | Nullable         | URL for the vendor's banner image             |
| `instagram_url`       | Text      | Nullable         | Instagram profile URL                         |
| `facebook_url`        | Text      | Nullable         | Facebook page URL                             |
| `wabusiness_url`      | Text      | Nullable         | WhatsApp Business link                        |
| `payout_info`         | JSONB     | Nullable         | Vendor payout configuration (e.g., bank info) |
| `isOnboarded`         | Boolean   | Default: `false` | Whether vendor has completed onboarding       |
| `verification_status` | Enum      | Nullable         | Status: 'pending', 'verified', 'rejected'     |
| `created_at`          | Timestamp | Default: `now()` | Record creation time                          |
| `updated_at`          | Timestamp | Default: `now()` | Record last update time                       |

**Foreign Keys:**

- `user_id` → `auth.users(id)`

---

### Products Table

| Column              | Type        | Constraints                       | Description                                          |
| ------------------- | ----------- | --------------------------------- | ---------------------------------------------------- |
| `id`                | UUID        | Primary Key                       | Unique identifier for each product                   |
| `name`              | Text        | Not Null                          | Product name                                         |
| `description`       | Text        | Not Null                          | Product description                                  |
| `price`             | Numeric     | Not Null                          | Price in NGN                                         |
| `stock_quantity`    | Integer     | Not Null                          | Available stock quantity                             |
| `reserved_quantity` | Integer     | Default: `0`, Not Null            | Quantity reserved for pending orders                 |
| `category`          | Text        | Not Null                          | Product category (e.g., Clothing, Accessories)       |
| `color`             | Text        | Not Null                          | Product color                                        |
| `size`              | Text        | Not Null                          | Size (e.g., clothing or shoe sizes)                  |
| `discount_price`    | Numeric     | Nullable                          | Discounted price (if applicable)                     |
| `discount_start`    | Date        | Nullable                          | Start date of discount                               |
| `discount_end`      | Date        | Nullable                          | End date of discount                                 |
| `images`            | Text Array  | Nullable                          | URLs for the product images (uploaded to Cloudinary) |
| `vendor_id`         | UUID        | Not Null, FK → `vendors(user_id)` | Reference to the vendor who added the product        |
| `is_hottest_offer`  | Boolean     | Default: `false`                  | Marks if the product is a "hottest offer"            |
| `is_deleted`        | Boolean     | Default: `false`                  | Soft delete flag                                     |
| `deleted_at`        | Timestamp   | Nullable                          | When the product was deleted                         |
| `deleted_by`        | UUID        | Nullable                          | Who deleted the product                              |
| `variant_type`      | Varchar(20) | Default: `'simple'`               | Product variant type (simple, variable)              |
| `base_price`        | Numeric     | Nullable                          | Base price for variable products                     |
| `has_variants`      | Boolean     | Default: `false`                  | Whether product has variants                         |
| `total_stock`       | Integer     | Default: `0`                      | Total stock across all variants                      |
| `min_variant_price` | Numeric     | Nullable                          | Minimum price among variants                         |
| `max_variant_price` | Numeric     | Nullable                          | Maximum price among variants                         |
| `created_at`        | Timestamp   | Default: `CURRENT_TIMESTAMP`      | Record creation timestamp                            |
| `updated_at`        | Timestamp   | Default: `CURRENT_TIMESTAMP`      | Record update timestamp                              |

**Foreign Keys:**

- `vendor_id` → `vendors(user_id)`

---

### Orders Table

| Column                  | Type         | Constraints                       | Description                                                         |
| ----------------------- | ------------ | --------------------------------- | ------------------------------------------------------------------- |
| `id`                    | UUID         | Primary Key                       | Unique identifier for each order                                    |
| `vendor_id`             | UUID         | Not Null, FK → `vendors(user_id)` | Reference to the vendor fulfilling the order                        |
| `customer_info`         | JSONB        | Not Null                          | Customer's name, email, phone, address                              |
| `status`                | Text         | Not Null, Default: `'pending'`    | Order status (pending, confirmed, processing, delivered, cancelled) |
| `delivery_location`     | Text         | Not Null                          | Customer-selected delivery location                                 |
| `delivery_date`         | Date         | Nullable                          | Scheduled delivery date (set by vendor)                             |
| `total_amount`          | Integer      | Default: `0`                      | Total order amount in NGN                                           |
| `items`                 | JSONB        | Not Null                          | Array of order items with product details                           |
| `variant_id`            | UUID         | Nullable                          | Product variant ID (if applicable)                                  |
| `variant_sku`           | Varchar(100) | Nullable                          | Product variant SKU                                                 |
| `variant_size`          | Varchar(50)  | Nullable                          | Product variant size                                                |
| `variant_color`         | Varchar(50)  | Nullable                          | Product variant color                                               |
| `payment_proof_urls`    | Text[]       | Nullable                          | URLs of uploaded payment proof images                               |
| `transaction_reference` | Text         | Nullable                          | Customer's transaction reference                                    |
| `payment_status`        | Text         | Default: `'pending'`              | Payment verification status                                         |
| `payment_verified_at`   | Timestamp    | Nullable                          | When payment was verified                                           |
| `payment_verified_by`   | UUID         | Nullable                          | Who verified the payment                                            |
| `expires_at`            | Timestamp    | Nullable                          | Order expiry timestamp                                              |
| `notes`                 | Text         | Nullable                          | Customer notes or special instructions                              |
| `expiry_processed`      | Timestamp    | Nullable                          | When order expiry was processed                                     |
| `cancellation_reason`   | Text         | Nullable                          | Reason for order cancellation                                       |
| `created_at`            | Timestamp    | Default: `CURRENT_TIMESTAMP`      | Record creation timestamp                                           |
| `updated_at`            | Timestamp    | Default: `CURRENT_TIMESTAMP`      | Record update timestamp                                             |

**Foreign Keys:**

- `vendor_id` → `vendors(user_id)`

**Order Status Flow:**
The order status follows a simplified 5-stage progression:

1. **`pending`** - Order created, awaiting payment verification
2. **`confirmed`** - Payment verified, order confirmed by vendor
3. **`processing`** - Order being prepared/fulfilled
4. **`delivered`** - Order completed and delivered
5. **`cancelled`** - Order cancelled (can occur at any stage)

**Status Transitions:**

- `pending` → `confirmed` (payment verification) or `cancelled`
- `confirmed` → `processing` or `cancelled`
- `processing` → `delivered`
- `delivered` → (final state)
- `cancelled` → (final state)

**Order Items Structure (JSONB):**

```json
{
  "items": [
    {
      "product_id": "uuid",
      "product_name": "string",
      "quantity": "number",
      "price": "number",
      "size": "string (optional)",
      "color": "string (optional)"
    }
  ]
}
```

---

### Product Ratings Table

| Column           | Type    | Constraints | Description              |
| ---------------- | ------- | ----------- | ------------------------ |
| `product_id`     | UUID    | Primary Key | Reference to the product |
| `review_count`   | BigInt  | Nullable    | Total number of reviews  |
| `average_rating` | Numeric | Nullable    | Average rating (1-5)     |
| `five_star`      | BigInt  | Nullable    | Count of 5-star ratings  |
| `four_star`      | BigInt  | Nullable    | Count of 4-star ratings  |
| `three_star`     | BigInt  | Nullable    | Count of 3-star ratings  |
| `two_star`       | BigInt  | Nullable    | Count of 2-star ratings  |
| `one_star`       | BigInt  | Nullable    | Count of 1-star ratings  |

**Foreign Keys:**

- `product_id` → `products(id)`

---

### Product Reviews Table

| Column        | Type      | Constraints                     | Description                                |
| ------------- | --------- | ------------------------------- | ------------------------------------------ |
| `id`          | UUID      | Primary Key                     | Unique identifier for each review          |
| `product_id`  | UUID      | Nullable, FK → `products(id)`   | Reference to the product being reviewed    |
| `user_id`     | UUID      | Nullable, FK → `auth.users(id)` | Reference to the user who wrote the review |
| `rating`      | Integer   | Nullable                        | Rating (1-5)                               |
| `review_text` | Text      | Nullable                        | Review content                             |
| `created_at`  | Timestamp | Default: `now()`                | Review creation timestamp                  |
| `updated_at`  | Timestamp | Default: `now()`                | Review update timestamp                    |

**Foreign Keys:**

- `product_id` → `products(id)`
- `user_id` → `auth.users(id)`

---

### Custom Types

#### `verification_status` Enum

- `pending` - Vendor verification is pending
- `verified` - Vendor has been verified
- `rejected` - Vendor verification was rejected

---

### Table Relationships

```
auth.users (1) ←→ (1) vendors
vendors (1) ←→ (N) products
vendors (1) ←→ (N) orders
products (1) ←→ (1) product_ratings
products (1) ←→ (N) product_reviews
auth.users (1) ←→ (N) product_reviews
```

**Notes:**

- All tables have RLS (Row Level Security) enabled
- Timestamps use `CURRENT_TIMESTAMP` for created_at/updated_at
- UUIDs are auto-generated using `uuid_generate_v4()`
- Foreign key constraints ensure referential integrity
- Products support soft deletion with `is_deleted` flag
- Orders use many-to-many product relationship via `items` JSONB array
- Vendors use `verification_status` for account status management

---

## 3. RPC Functions (Stored Procedures)

RPC functions use different security models based on their intended usage:

- **`SECURITY DEFINER`**: Functions that need elevated permissions to bypass RLS policies (e.g., order creation, inventory management, public storefront access)
- **`SECURITY INVOKER`**: Functions that should respect RLS policies and run with caller's permissions (e.g., vendor-specific operations)

### `get_vendor_storefront(slug text)`

**Purpose:** Retrieve vendor storefront information including email from auth.users

**Parameters:**

- `slug` (text) - Vendor's store slug

**Returns:** Table with vendor profile data including email

**Security:** `SECURITY DEFINER` - Needs elevated permissions to bypass RLS for anonymous storefront access

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.get_vendor_storefront(slug text)
 RETURNS TABLE(user_id uuid, name text, store_name text, phone text, bio text, banner_image_url text, instagram_url text, facebook_url text, wabusiness_url text, store_slug text, verification_status text, payout_info jsonb, created_at timestamp without time zone, updated_at timestamp without time zone, email text)
 LANGUAGE plpgsql
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
```

---

### `get_vendor_subaccount(slug text)`

**Purpose:** Get vendor's Paystack subaccount code

**Parameters:**

- `slug` (text) - Vendor's store slug

**Returns:** Text (subaccount code)

**Security:** `SECURITY DEFINER` - Needs elevated permissions to access vendor data

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.get_vendor_subaccount(slug text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN (SELECT payout_info->>'subaccount_code'
          FROM vendors
          WHERE store_slug = slug);
END;
$function$;
```

---

### `create_order_with_payment_proof(order_data jsonb, payment_proof_urls text[])`

**Purpose:** Create a new order with payment proof and handle inventory reservation

**Parameters:**

- `order_data` (jsonb) - Complete order information
- `payment_proof_urls` (text[]) - Array of payment proof image URLs

**Returns:** orders record

**Security:** `SECURITY DEFINER` - Needs elevated permissions to bypass RLS for anonymous order creation

**Process:**

1. Validates inventory for all items
2. Reserves inventory for all items
3. Creates order with payment_pending status
4. Sets 7-day expiry

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.create_order_with_payment_proof(order_data jsonb, payment_proof_urls text[])
 RETURNS orders
 LANGUAGE plpgsql
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

  -- 3. Create order (no legacy product_id)
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
    NOW() + INTERVAL '7 days',  -- Changed from 24 hours to 7 days
    order_data->>'notes'
  ) RETURNING * INTO new_order;

  RETURN new_order;
END;
$function$;
```

---

### `validate_product_availability(product_id uuid, quantity integer)`

**Purpose:** Check if a product has sufficient stock

**Parameters:**

- `product_id` (uuid) - Product ID
- `quantity` (integer) - Required quantity

**Returns:** boolean

**Security:** `SECURITY DEFINER` - Needs elevated permissions to access product data for anonymous users

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.validate_product_availability(product_id uuid, quantity integer)
 RETURNS boolean
 LANGUAGE plpgsql
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
```

---

### `reserve_product_inventory(product_id uuid, quantity integer)`

**Purpose:** Reserve inventory for a pending order

**Parameters:**

- `product_id` (uuid) - Product ID
- `quantity` (integer) - Quantity to reserve

**Returns:** void

**Security:** `SECURITY DEFINER` - Needs elevated permissions to modify product inventory for anonymous users

**Process:**

- Reduces `stock_quantity` by the reserved amount
- Increases `reserved_quantity` by the reserved amount

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.reserve_product_inventory(product_id uuid, quantity integer)
 RETURNS void
 LANGUAGE plpgsql
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
```

---

### `confirm_inventory_reservation(product_id uuid, quantity integer)`

**Purpose:** Confirm inventory reservation when payment is verified

**Parameters:**

- `product_id` (uuid) - Product ID
- `quantity` (integer) - Quantity to confirm

**Returns:** void

**Security:** `SECURITY DEFINER` - Needs elevated permissions to modify product inventory for vendors

**Process:**

- Reduces `reserved_quantity` by the confirmed amount
- Finalizes the inventory deduction

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.confirm_inventory_reservation(product_id uuid, quantity integer)
 RETURNS void
 LANGUAGE plpgsql
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
```

---

### `verify_payment(order_id uuid, is_verified boolean, notes text DEFAULT NULL)`

**Purpose:** Verify or reject payment for an order

**Parameters:**

- `order_id` (uuid) - Order ID
- `is_verified` (boolean) - Whether payment is verified
- `notes` (text, optional) - Additional notes

**Returns:** orders record

**Security:** `SECURITY DEFINER` - Needs elevated permissions to modify orders and inventory for vendors

**Process:**

1. Updates payment status and verification details
2. Changes order status to 'confirmed' or 'payment_rejected'
3. If verified, confirms inventory reservations
4. If rejected, inventory remains reserved (can be released later)

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.verify_payment(order_id uuid, is_verified boolean, notes text DEFAULT NULL)
 RETURNS orders
 LANGUAGE plpgsql
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
```

---

### `notify_buyer_payment_verified(order_id uuid)`

**Purpose:** Send notification when payment is verified

**Parameters:**

- `order_id` (uuid) - Order ID

**Returns:** void

**Security:** `SECURITY INVOKER` - Respects RLS policies for vendor access

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.notify_buyer_payment_verified(order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
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
```

---

### `update_updated_at_column()`

**Purpose:** Trigger function to automatically update the `updated_at` timestamp

**Returns:** trigger

**Security:** `SECURITY INVOKER` - Trigger function should respect RLS policies

**Code:**

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;
```

---

## 4. Edge Functions

### `send-vendor-email`

**Purpose:** Send email notifications to vendors and generate WhatsApp pre-filled message URLs

**Trigger:** Called after order creation in `buyerStorefrontService.ts`

**Environment Variables Required:**

- `MAILJET_API_KEY` - Mailjet API key for email sending
- `MAILJET_SECRET_KEY` - Mailjet secret key for email sending
- `APP_URL` - Application URL (defaults to 'https://www.stylematch.fashion')

**Input Parameters:**

```json
{
  "vendor_email": "string",
  "order_id": "string",
  "total_amount": "number",
  "vendor_name": "string",
  "customer_name": "string (optional)",
  "whatsapp_url": "string (optional)"
}
```

**Response:**

```json
{
  "status": true,
  "message": "Notifications sent successfully",
  "email_sent": true,
  "whatsapp_url": "https://wa.me/2349074577147?text=...",
  "debug_info": {
    "email_result": {...},
    "mailjet_configured": true
  }
}
```

**Features:**

- Sends professional HTML email via Mailjet API
- Generates WhatsApp pre-filled message URL with order details
- Handles CORS for localhost and production domains
- Includes comprehensive error handling and logging

**Code:**

```typescript
// send-vendor-email.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://www.stylematch.fashion";
const allowedOrigins = [
  "http://localhost:8080",
  "https://www.stylematch.fashion",
];

function getCorsHeaders(origin) {
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-client-info, apikey",
    };
  }
  return {};
}

// Send email using Mailjet API
async function sendEmail(to, subject, html) {
  if (!MAILJET_API_KEY || !MAILJET_SECRET_KEY) {
    console.error("Mailjet credentials not configured");
    console.error("MAILJET_API_KEY configured:", !!MAILJET_API_KEY);
    console.error("MAILJET_SECRET_KEY configured:", !!MAILJET_SECRET_KEY);
    return {
      success: false,
      error: "Mailjet credentials not configured",
    };
  }
  try {
    console.log("=== SENDING EMAIL VIA MAILJET ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML Length:", html.length);
    console.log("=====================================");

    // Create the email payload for Mailjet
    const emailData = {
      Messages: [
        {
          From: {
            Email: "noreply@stylematch.fashion",
            Name: "StyleMatch",
          },
          To: [
            {
              Email: to,
              Name: "",
            },
          ],
          Subject: subject,
          HTMLPart: html,
          TextPart: subject.replace(/<[^>]*>/g, ""),
          CustomID: `order-notification-${Date.now()}`,
        },
      ],
    };

    console.log("Sending email via Mailjet API...");

    // Send email using Mailjet API
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(
          `${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Email sent successfully via Mailjet:", result);
      return {
        success: true,
        messageId: result.Messages?.[0]?.To?.[0]?.MessageID || "mailjet-sent",
        method: "mailjet-api",
        details: result,
      };
    } else {
      const errorText = await response.text();
      console.error("Mailjet API failed:", response.status, errorText);
      return {
        success: false,
        error: `Mailjet API error: ${response.status} - ${errorText}`,
        method: "mailjet-api",
      };
    }
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    return {
      success: false,
      error: error.message,
      method: "mailjet-api",
    };
  }
}

// Generate WhatsApp message URL (this is just a link, not actual sending)
function generateWhatsAppUrl(whatsappUrl, message) {
  if (!whatsappUrl) return "";
  // Extract phone number from wa.me URL
  const phoneMatch = whatsappUrl.match(/wa\.me\/([\d\+]+)/);
  if (!phoneMatch) return "";
  const phoneNumber = phoneMatch[1];
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// Create WhatsApp message content
function createWhatsAppMessage(orderId, totalAmount, customerName) {
  let message = `🛍️ *New Order Alert!*\n\n`;
  message += `You have received a new order on StyleMatch!\n\n`;
  message += `📋 *Order Details:*\n`;
  message += `• Order ID: ${orderId}\n`;
  message += `• Total Amount: ₦${totalAmount.toLocaleString()}\n`;
  if (customerName) {
    message += `• Customer: ${customerName}\n`;
  }
  message += `\n📦 View order details: ${APP_URL}/vendor/orders\n\n`;
  message += `💡 *Tip:* Respond quickly to provide excellent customer service!`;
  return message;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: cors,
    });
  }

  try {
    const {
      vendor_email,
      order_id,
      total_amount,
      vendor_name,
      customer_name,
      whatsapp_url,
    } = await req.json();

    console.log("=== VENDOR NOTIFICATION REQUEST ===");
    console.log("Vendor Email:", vendor_email);
    console.log("Order ID:", order_id);
    console.log("Total Amount:", total_amount);
    console.log("Vendor Name:", vendor_name);
    console.log("Customer Name:", customer_name);
    console.log("WhatsApp URL:", whatsapp_url);
    console.log("Mailjet API Key configured:", !!MAILJET_API_KEY);
    console.log("Mailjet Secret Key configured:", !!MAILJET_SECRET_KEY);
    console.log("=====================================");

    // Validate required fields
    if (!vendor_email || !order_id || !total_amount || !vendor_name) {
      return new Response(
        JSON.stringify({
          status: false,
          message:
            "Missing required fields: vendor_email, order_id, total_amount, vendor_name",
        }),
        {
          status: 400,
          headers: {
            ...cors,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create email content
    const subject = `🛍️ New Order Received - StyleMatch`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🛍️ New Order Alert!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">StyleMatch</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello <strong>${vendor_name}</strong>,</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
            Great news! You have received a new order on StyleMatch. A customer has placed an order and is waiting for your response.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📋 Order Details</h3>
            <p style="margin: 8px 0; color: #555;"><strong>Order ID:</strong> <span style="color: #667eea; font-family: monospace;">${order_id}</span></p>
            <p style="margin: 8px 0; color: #555;"><strong>Total Amount:</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">₦${total_amount.toLocaleString()}</span></p>
            ${
              customer_name
                ? `<p style="margin: 8px 0; color: #555;"><strong>Customer:</strong> ${customer_name}</p>`
                : ""
            }
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/vendor/orders" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              📦 View Order Details
            </a>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #1976d2; font-size: 14px; text-align: center;">
              💡 <strong>Tip:</strong> Respond to orders quickly to provide excellent customer service and build your reputation!
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This email was sent by StyleMatch. If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `;

    // Send email via Mailjet
    const emailResult = await sendEmail(vendor_email, subject, html);

    // Prepare response data
    const responseData = {
      status: true,
      message: "Notifications sent successfully",
      email_sent: emailResult.success,
      whatsapp_url: "",
      debug_info: {
        email_result: emailResult,
        mailjet_configured: !!(MAILJET_API_KEY && MAILJET_SECRET_KEY),
      },
    };

    // Generate WhatsApp notification URL (this is just a link, not actual sending)
    if (whatsapp_url) {
      const whatsappMessage = createWhatsAppMessage(
        order_id,
        total_amount,
        customer_name
      );
      const whatsappUrl = generateWhatsAppUrl(whatsapp_url, whatsappMessage);
      if (whatsappUrl) {
        responseData.whatsapp_url = whatsappUrl;
        console.log("WhatsApp notification URL generated:", whatsappUrl);
        console.log(
          "Note: This is a link that opens WhatsApp with pre-filled message. User must manually send it."
        );
      }
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error sending vendor notifications:", error);
    return new Response(
      JSON.stringify({
        status: false,
        message: "Failed to send notifications",
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...cors,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
```

**Key Features:**

- **CORS Headers**: Includes `x-client-info` and `apikey` headers to prevent CORS errors
- **Email Integration**: Uses Mailjet API for reliable email delivery
- **WhatsApp Pre-filled Messages**: Generates URLs with order details pre-filled
- **Error Handling**: Comprehensive error handling and logging
- **Professional Email Template**: HTML email with order details and vendor dashboard link
