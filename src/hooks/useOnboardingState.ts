import { useState, useCallback, useEffect } from 'react';
import { OnboardingFormValues, PayoutFormData } from '@/types';
import { useVendorStore } from '@/stores/vendorStore';

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
  const { 
    onboardingState: vendorOnboardingState, 
    setOnboardingStep, 
    completeOnboardingStep,
    getCurrentOnboardingStep 
  } = useVendorStore();

  // Load state from vendorStore on mount
  useEffect(() => {
    const currentStep = getCurrentOnboardingStep();
    if (currentStep) {
      setState(prev => ({ 
        ...prev, 
        step: currentStep.order,
        isSubmitting: false 
      }));
    }
  }, [getCurrentOnboardingStep]);

  // Save state to vendorStore whenever it changes
  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      
      // Update vendorStore onboarding state
      if (updated.step) {
        setOnboardingStep(updated.step);
      }
      
      return updated;
    });
  }, [setOnboardingStep]);

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
