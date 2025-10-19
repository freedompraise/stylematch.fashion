## 1. Product Requirements Document (PRD)

### **Overview**

StyleMatch transforms local fashion vendors’ businesses into credible online stores with a personalized, fashion-forward experience. The platform enables vendors to efficiently manage their catalogs, track real-time sales and engagement, and receive personalized alerts based on product performance. It offers multiple product upload options including single upload, multi-upload via drag-and-drop (with individual detail entry), and importing product data from WhatsApp or Instagram catalogs. Payment processing is integrated via Paystack so that vendors configure their payout settings (via bank account information and manual/automatic payout options).

### **Goals**

* Provide vendors with a tailored, interactive dashboard that displays real-time sales data, customer engagement metrics, and inventory health indicators.

* Allow vendors to manage products easily:

  * **Single Upload:** Add one product at a time.

  * **Multiple Upload:** Drag-and-drop multiple images first, then enter details individually using Next/Previous navigation.

  * **Catalog Import:** Import product listings directly from WhatsApp/Instagram catalogs using a preformatted text file.

* Replace manual payment proof uploads with Paystack integration so transactions are seamlessly processed.

* Enable real-time, personalized alerts for popular products or when items are on customer wishlists.

* Improve vendor decision-making with segmented performance views (for example, by clothing line or style).

### **User Flows**

#### **Vendor Flow**

1. **Registration & Setup:**

   * Vendor registers using Supabase Auth, completes profile details (Company Name, Name, Bio, Social Links, Bank/Payout settings), and configures their store.

2. **Dashboard & Analytics:**

   * Upon login, the vendor lands on an interactive dashboard displaying real‑time sales, product performance by category/line, and inventory indicators.

   * Personalized alerts notify vendors of surging product popularity or items added to wishlists.

3. **Product Management:**

   * Vendors can choose among three upload options:

     * **Single Upload:** Use a form to add one product.

     * **Multiple Upload:** Use a drag-and-drop interface to select multiple images. Then, navigate through images to enter individual details (Name, Category, Color, Size, Description, Price, Stock, Discount fields). Optionally, batch update certain fields (e.g., category) for all images.

     * **Catalog Import:** Import product details directly from a WhatsApp or Instagram catalog file (preformatted as JSON/text) to be inserted automatically into the database.

4. **Order Management:**

   * Customers place orders via the vendor’s unique storefront link.

   * The vendor’s dashboard shows real‑time orders and sales data, and vendors can update order statuses, mark deliveries complete, and manage inventory.

5. **Payment Integration:**

   * Paystack handles payments, eliminating manual payment verification. Vendors configure payout settings (bank account details, manual/automatic payout).

#### **Buyer Flow**

1. **Discovery:**

   * Buyers visit a vendor’s storefront via a unique URL and view detailed product listings.

2. **Product Interaction:**

   * Buyers see high-quality images and detailed product descriptions.

   * They can add products to their cart, choose delivery options, and complete transactions via Paystack.

3. **Engagement:**

   * Buyers interact with products (wishlists, reviews) which drive personalized alerts for vendors.

### **Key Features**

* **Interactive Dashboard:** Real-time analytics with segmented performance, inventory health, and sales data.

* **Multi-Upload and Catalog Import:** Enhanced product management options for bulk uploads using drag-and-drop or social catalog imports.

* **Paystack Integration:** Seamless online payments and vendor-configured payouts.

* **Personalized Alerts:** Real-time notifications for product popularity surges and wishlist activity.

* **Responsive Design:** Designed for mobile, tablet, and desktop experiences.

