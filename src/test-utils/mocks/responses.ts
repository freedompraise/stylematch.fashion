export const mockProducts = [
  {
    id: "product-1",
    vendor_id: "vendor-123",
    name: "Test Product 1",
    price: 29.99,
    description: "Test description 1",
    category: "tops",
    color: "Black",
    size: "M",
    stock_quantity: 10,
    images: ["image1.jpg"],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "product-2",
    vendor_id: "vendor-123",
    name: "Test Product 2",
    price: 39.99,
    description: "Test description 2",
    category: "accessories",
    color: "White",
    size: "L",
    stock_quantity: 15,
    images: ["image2.jpg"],
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "product-3",
    vendor_id: "vendor-123",
    name: "Test Product 3",
    price: 49.99,
    description: "Test description 3",
    category: "shoes",
    color: "Red",
    size: "S",
    stock_quantity: 8,
    images: ["image3.jpg"],
    created_at: "2024-01-03T00:00:00Z",
  },
]

export const mockOrders = [
  {
    id: "order-1",
    vendor_id: "vendor-123",
    customer_info: { 
      name: "John Doe", 
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Test St, Test City"
    },
    total_amount: 29.99,
    status: "pending",
    items: [
      {
        product_id: "product-1",
        quantity: 1,
        price: 29.99
      }
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "order-2",
    vendor_id: "vendor-123",
    customer_info: { 
      name: "Jane Smith", 
      email: "jane@example.com",
      phone: "+0987654321",
      address: "456 Test Ave, Test Town"
    },
    total_amount: 89.98,
    status: "completed",
    items: [
      {
        product_id: "product-2",
        quantity: 1,
        price: 39.99
      },
      {
        product_id: "product-3",
        quantity: 1,
        price: 49.99
      }
    ],
    created_at: "2024-01-02T00:00:00Z",
  },
]

export const mockPayoutInfo = {
  bank_code: "044",
  bank_name: "Access Bank",
  account_number: "1234567890",
  account_name: "Test Store",
  subaccount_code: "SUB_123456",
}

export const mockOnboardingData = {
  basics: {
    store_name: "Test Store",
    name: "Test Owner",
    phone: "+1234567890",
  },
  details: {
    bio: "Test bio description",
    uploadedImage: "https://example.com/image.jpg",
    uploadedImageFile: null,
  },
  social: {
    instagram_link: "https://instagram.com/teststore",
    facebook_link: "https://facebook.com/teststore",
    wabusiness_link: "https://wa.me/1234567890",
  },
  payout: mockPayoutInfo,
}
