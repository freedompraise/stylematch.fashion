// src/lib/toast.ts
import { toast as toaster } from "@/components/ui/use-toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

type ToastMessage = {
  title: string;
  description: string;
};

const showToast = (message: ToastMessage, variant: "default" | "destructive") => {
  toaster({
    ...message,
    variant,
  });
};

export const toast = {
  success: (message: ToastMessage) => showToast(message, "default"),
  error: (message: ToastMessage) => showToast(message, "destructive"),

  // Auth Toasts
  auth: {
    signInSuccess: () => toast.success(TOAST_MESSAGES.auth.signInSuccess),
    signInError: () => toast.error(TOAST_MESSAGES.auth.signInError),
    signUpSuccess: () => toast.success(TOAST_MESSAGES.auth.signUpSuccess),
    signUpError: () => toast.error(TOAST_MESSAGES.auth.signUpError),
    signOutSuccess: () => toast.success(TOAST_MESSAGES.auth.signOutSuccess),
    signOutError: () => toast.error(TOAST_MESSAGES.auth.signOutError),
    resetPasswordSuccess: () => toast.success(TOAST_MESSAGES.auth.resetPasswordSuccess),
    resetPasswordError: () => toast.error(TOAST_MESSAGES.auth.resetPasswordError),
    updatePasswordSuccess: () => toast.success(TOAST_MESSAGES.auth.updatePasswordSuccess),
    updatePasswordError: () => toast.error(TOAST_MESSAGES.auth.updatePasswordError),
    userNotFound: () => toast.error(TOAST_MESSAGES.auth.userNotFound),
  },

  // Product Toasts
  products: {
    loadError: () => toast.error(TOAST_MESSAGES.products.loadError),
    createSuccess: (count: number) => toast.success(TOAST_MESSAGES.products.createSuccess(count)),
    createError: () => toast.error(TOAST_MESSAGES.products.createError),
    updateSuccess: () => toast.success(TOAST_MESSAGES.products.updateSuccess),
    updateError: () => toast.error(TOAST_MESSAGES.products.updateError),
    deleteSuccess: () => toast.success(TOAST_MESSAGES.products.deleteSuccess),
    deleteError: () => toast.error(TOAST_MESSAGES.products.deleteError),
    imageRequired: () => toast.error(TOAST_MESSAGES.products.imageRequired),
  },

  // Order Toasts
  orders: {
    loadError: () => toast.error(TOAST_MESSAGES.orders.loadError),
    updateSuccess: () => toast.success(TOAST_MESSAGES.orders.updateSuccess),
    updateError: () => toast.error(TOAST_MESSAGES.orders.updateError),
    deleteSuccess: () => toast.success(TOAST_MESSAGES.orders.deleteSuccess),
    deleteError: () => toast.error(TOAST_MESSAGES.orders.deleteError),
  },

  // Cart Toasts
  cart: {
    addSuccess: (itemName: string) => toast.success(TOAST_MESSAGES.cart.addSuccess(itemName)),
    removeSuccess: (itemName: string) => toast.success(TOAST_MESSAGES.cart.removeSuccess(itemName)),
  },

  // Wishlist Toasts
  wishlist: {
    addSuccess: (itemName: string) => toast.success(TOAST_MESSAGES.wishlist.addSuccess(itemName)),
    removeSuccess: (itemName: string) => toast.success(TOAST_MESSAGES.wishlist.removeSuccess(itemName)),
  },
    
  // Store Toasts
  store: {
    updateSuccess: () => toast.success(TOAST_MESSAGES.store.updateSuccess),
    updateError: () => toast.error(TOAST_MESSAGES.store.updateError),
    onboardingSuccess: () => toast.success(TOAST_MESSAGES.store.onboardingSuccess),
    onboardingError: () => toast.error(TOAST_MESSAGES.store.onboardingError),
  },

  // Payout Toasts
  payouts: {
    updateSuccess: () => toast.success(TOAST_MESSAGES.payouts.updateSuccess),
    updateError: () => toast.error(TOAST_MESSAGES.payouts.updateError),
    loadBanksError: () => toast.error(TOAST_MESSAGES.payouts.loadBanksError),
    missingInfo: () => toast.error(TOAST_MESSAGES.payouts.missingInfo),
  },
  form: {
    validationError: () => toast.error(TOAST_MESSAGES.form.validationError),
  },
    
  // General Toasts
  general: {
    linkCopied: () => toast.success(TOAST_MESSAGES.general.linkCopied),
    shareSuccess: () => toast.success(TOAST_MESSAGES.general.shareSuccess),
    shareError: () => toast.error(TOAST_MESSAGES.general.shareError),
    uploadSuccess: () => toast.success(TOAST_MESSAGES.general.uploadSuccess),
    uploadError: () => toast.error(TOAST_MESSAGES.general.uploadError),
    deleteAllProductsSuccess: () => toast.success(TOAST_MESSAGES.general.deleteAllProductsSuccess),
    deleteAllProductsError: () => toast.error(TOAST_MESSAGES.general.deleteAllProductsError),
    deleteAccountSuccess: () => toast.success(TOAST_MESSAGES.general.deleteAccountSuccess),
    deleteAccountError: () => toast.error(TOAST_MESSAGES.general.deleteAccountError),
  }
};
