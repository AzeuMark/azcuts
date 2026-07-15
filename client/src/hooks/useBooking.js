import { useReducer, useCallback } from 'react';

const initialState = {
  step: 0,
  service: null,
  extras: [],
  slot: null,
  staff: null,
  paymentMethod: 'cash',
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_SERVICE':
      return { ...state, service: action.payload, step: 1 };
    case 'TOGGLE_EXTRA': {
      const exists = state.extras.find((e) => e._id === action.payload._id);
      return {
        ...state,
        extras: exists
          ? state.extras.filter((e) => e._id !== action.payload._id)
          : [...state.extras, action.payload],
      };
    }
    case 'SET_SLOT':
      return { ...state, slot: action.payload, step: 3 };
    case 'SET_STAFF':
      return { ...state, staff: action.payload };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };
    case 'NEXT_STEP':
      return { ...state, step: Math.min(state.step + 1, 4) };
    case 'PREV_STEP':
      return { ...state, step: Math.max(state.step - 1, 0) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useBooking() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setStep = useCallback((s) => dispatch({ type: 'SET_STEP', payload: s }), []);
  const setService = useCallback((s) => dispatch({ type: 'SET_SERVICE', payload: s }), []);
  const toggleExtra = useCallback((e) => dispatch({ type: 'TOGGLE_EXTRA', payload: e }), []);
  const setSlot = useCallback((s) => dispatch({ type: 'SET_SLOT', payload: s }), []);
  const setStaff = useCallback((s) => dispatch({ type: 'SET_STAFF', payload: s }), []);
  const setPayment = useCallback((p) => dispatch({ type: 'SET_PAYMENT', payload: p }), []);
  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setStep,
    setService,
    toggleExtra,
    setSlot,
    setStaff,
    setPayment,
    nextStep,
    prevStep,
    reset,
  };
}
