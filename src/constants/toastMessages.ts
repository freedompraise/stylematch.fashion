// src/constants/toastMessages.ts

export const TOAST_MESSAGES = {
  auth: {
    signInSuccess: {
      title: 'Signed In',
      description: "Welcome back! You've been signed in successfully.",
    },
    signInError: {
      title: 'Sign In Failed',
      description: 'Failed to sign in. Please check your credentials and try again.',
    },
    signUpSuccess: {
      title: 'Account Created',
      description: 'Account created successfully! Please check your email to verify your account.',
    },
    signUpError: {
      title: 'Sign Up Failed',
      description: 'Failed to create account. Please try again.',
    },
    signOutSuccess: {
      title: 'Signed Out',
      description: 'You have successfully signed out.',
    },
    signOutError: {
      title: 'Sign Out Failed',
      description: 'Failed to sign out. Please try again.',
    },
    resetPasswordSuccess: {
      title: 'Password Reset Email Sent',
      description: 'If an account exists for this email, you will receive a password reset link.',
    },
    resetPasswordError: {
      title: 'Password Reset Failed',
      description: 'Failed to send password reset email. Please try again.',
    },
    updatePasswordSuccess: {
      title: 'Password Updated',
      description: 'Your password has been updated successfully. You can now sign in.',
    },
    updatePasswordError: {
      title: 'Password Update Failed',
      description: 'Failed to update your password. Please try again.',
    },
    userNotFound: {
      title: 'Error',
      description: 'User not found',
    },
  },
  products: {
    loadError: {
      title: 'Error Loading Products',
      description: 'Could not load your products. Please try again later.',
    },
    createSuccess: (count: number) => ({
      title: 'Product(s) Created',
      description: `${count} product(s) have been created successfully.`,
    }),
    createError: {
      title: 'Error Creating Product',
      description: 'Failed to create product. Please try again.',
    },
    updateSuccess: {
      title: 'Product Updated',
      description: 'Product updated successfully!',
    },
    updateError: {
      title: 'Error Updating Product',
      description: 'Failed to update product. Please try again.',
    },
    deleteSuccess: {
      title: 'Product Deleted',
      description: 'Product has been soft-deleted and is no longer visible in your store.',
    },
    deleteError: {
      title: 'Error Deleting Product',
      description: 'Failed to delete product. Please try again.',
    },
    imageRequired: {
        title: "Image Required",
        description: "Product image is required for better visibility and sales",
    },
  },
  orders: {
    loadError: {
      title: 'Error Loading Orders',
      description: 'Could not load your orders. Please try again later.',
    },
    updateSuccess: {
      title: 'Order Updated',
      description: 'Order status has been updated successfully.',
    },
    updateError: {
      title: 'Error Updating Order',
      description: 'Could not update order status. Please try again.',
    },
    deleteSuccess: {
      title: 'Order Deleted',
      description: 'Order has been deleted successfully.',
    },
    deleteError: {
      title: 'Error Deleting Order',
      description: 'Failed to delete order. Please try again.',
    },
  },
  cart: {
    addSuccess: (itemName: string) => ({
      title: 'Added to Cart',
      description: `${itemName} added to your cart.`,
    }),
    removeSuccess: (itemName: string) => ({
      title: 'Removed from Cart',
      description: `${itemName} removed from your cart.`,
    }),
  },
  wishlist: {
    addSuccess: (itemName: string) => ({
      title: 'Added to Wishlist',
      description: `${itemName} added to your wishlist.`,
    }),
    removeSuccess: (itemName: string) => ({
      title: 'Removed from Wishlist',
      description: `${itemName} removed from your wishlist.`,
    }),
  },
  store: {
    updateSuccess: {
      title: 'Store Profile Updated',
      description: 'Your store profile has been updated successfully.',
    },
    updateError: {
      title: 'Error Updating Store',
      description: 'Failed to update store profile. Please try again.',
    },
    onboardingSuccess: {
      title: 'Setup Complete!',
      description: 'Your store profile has been successfully set up and verified.',
    },
    onboardingError: {
      title: 'Setup Failed',
      description: 'Failed to complete store setup. Please try again.',
    },
  },
  payouts: {
    updateSuccess: {
      title: 'Payout Details Updated',
      description: 'Your payout details have been updated successfully.',
    },
    updateError: {
      title: 'Error Updating Payouts',
      description: 'Failed to update payout details. Please try again.',
    },
    loadBanksError: {
      title: 'Error',
      description: 'Failed to load banks list. Please refresh the page.',
    },
    missingInfo: {
      title: 'Missing Information',
      description: 'Please complete the payout information.',
    },
  },
  form: {
    validationError: {
      title: 'Validation Error',
      description: 'Please fill in all required fields correctly.',
    },
  },
  general: {
    linkCopied: {
      title: 'Link Copied',
      description: 'Link copied to clipboard.',
    },
    shareSuccess: {
      title: 'Shared!',
      description: 'Product shared successfully.',
    },
    shareError: {
      title: 'Share Failed',
      description: 'Unable to share. Please try again.',
    },
    uploadSuccess: {
      title: 'Upload Successful',
      description: 'Your file has been uploaded.',
    },
    uploadError: {
      title: 'Upload Failed',
      description: 'Failed to upload file. Please try again.',
    },
    deleteAllProductsSuccess: {
      title: 'All Products Deleted',
      description: 'All your products have been deleted successfully.',
    },
    deleteAllProductsError: {
      title: 'Error Deleting Products',
      description: 'Failed to delete all products. Please try again.',
    },
    deleteAccountSuccess: {
      title: 'Account Deletion Initiated',
      description: 'Your account deletion request has been received. You will be logged out.',
    },
    deleteAccountError: {
      title: 'Account Deletion Failed',
      description: 'There was an error deleting your account. Please contact support.',
    },
  },
} as const;
