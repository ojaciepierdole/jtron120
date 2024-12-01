export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[Info] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[Error] ${message}`, error);
  }
}; 