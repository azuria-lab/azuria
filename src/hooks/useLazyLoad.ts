export const useLazyLoad = () => {
  return {
    isIntersecting: false,
    ref: null,
    load: () => {},
    isLoaded: false
  };
};

export const useScrollPerformance = () => {
  return {
    isVisible: false,
    shouldLoad: false,
    isScrolling: false,
    ref: null
  };
};