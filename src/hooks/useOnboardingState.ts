import { useState, useCallback, useEffect } from 'react';
import { OnboardingFormValues, PayoutFormData } from '@/types';

interface OnboardingState {
  step: number;
  formData: {
    basics: {
      store_name: string;
      name: string;
      phone?: string;
    };
    details: {
      bio: string;
      uploadedImage?: string;
      uploadedImageFile?: File;
    };
    social: {
      instagram_link?: string;
      facebook_link?: string;
      wabusiness_link?: string;
    };
    payout: PayoutFormData | null;
  };
  isSubmitting: boolean;
  errors: Record<string, string>;
}

const STORAGE_KEY = 'vendor_onboarding_state';

const defaultState: OnboardingState = {
  step: 1,
  formData: {
    basics: {
      store_name: '',
      name: '',
      phone: '',
    },
    details: {
      bio: '',
    },
    social: {
      instagram_link: '',
      facebook_link: '',
      wabusiness_link: '',
    },
    payout: null,
  },
  isSubmitting: false,
  errors: {},
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsedState, isSubmitting: false }));
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      // Don't save file objects or large base64 images to localStorage
      const stateToSave = {
        ...updated,
        formData: {
          ...updated.formData,
          details: {
            ...updated.formData.details,
            uploadedImageFile: undefined, // Don't serialize File objects
            uploadedImage: undefined, // Don't serialize base64 image
          },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      return updated;
    });
  }, []);

  const updateBasics = useCallback((basics: Partial<OnboardingState['formData']['basics']>) => {
    saveState({
      formData: {
        ...state.formData,
        basics: { ...state.formData.basics, ...basics },
      },
    });
  }, [state.formData, saveState]);

  const updateDetails = useCallback((details: Partial<OnboardingState['formData']['details']>) => {
    saveState({
      formData: {
        ...state.formData,
        details: { ...state.formData.details, ...details },
      },
    });
  }, [state.formData, saveState]);

  const updateSocial = useCallback((social: Partial<OnboardingState['formData']['social']>) => {
    saveState({
      formData: {
        ...state.formData,
        social: { ...state.formData.social, ...social },
      },
    });
  }, [state.formData, saveState]);

  const updatePayout = useCallback((payout: PayoutFormData) => {
    saveState({
      formData: {
        ...state.formData,
        payout,
      },
    });
  }, [state.formData, saveState]);

  const setStep = useCallback((step: number) => {
    saveState({ step });
  }, [saveState]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    saveState({ isSubmitting });
  }, [saveState]);

  const setError = useCallback((field: string, error: string) => {
    saveState({
      errors: { ...state.errors, [field]: error },
    });
  }, [state.errors, saveState]);

  const clearError = useCallback((field: string) => {
    const newErrors = { ...state.errors };
    delete newErrors[field];
    saveState({ errors: newErrors });
  }, [state.errors, saveState]);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  return {
    state,
    updateBasics,
    updateDetails,
    updateSocial,
    updatePayout,
    setStep,
    setSubmitting,
    setError,
    clearError,
    clearState,
  };
}
