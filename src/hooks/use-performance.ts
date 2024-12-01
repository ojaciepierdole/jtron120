export function usePerformance(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} rendered`);
  }
} 