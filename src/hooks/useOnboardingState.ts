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



  const updateBasics = useCallback((basics: Partial<OnboardingState['formData']['basics']>) => {
    console.log('updateBasics called with:', basics);
    setState(prev => {
      console.log('Previous state in updateBasics:', prev);
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          basics: { ...prev.formData.basics, ...basics },
        },
      };
      console.log('New state in updateBasics:', newState);
      return newState;
    });
  }, []);

  const updateDetails = useCallback((details: Partial<OnboardingState['formData']['details']>) => {
    console.log('updateDetails called with:', details);
    setState(prev => {
      console.log('Previous state:', prev);
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          details: { ...prev.formData.details, ...details },
        },
      };
      console.log('New state:', newState);
      return newState;
    });
  }, []);

  const updateSocial = useCallback((social: Partial<OnboardingState['formData']['social']>) => {
    console.log('updateSocial called with:', social);
    setState(prev => {
      console.log('Previous state in updateSocial:', prev);
      const newState = {
        ...prev,
        formData: {
          ...prev.formData,
          social: { ...prev.formData.social, ...social },
        },
      };
      console.log('New state in updateSocial:', newState);
      return newState;
    });
  }, []);

  const updatePayout = useCallback((payout: PayoutFormData) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        payout,
      },
    }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step }));
    setOnboardingStep(step);
  }, [setOnboardingStep]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { ...prev, errors: newErrors };
    });
  }, []);

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
