// Global socket instance for use in services
let ioInstance: any = null;

export const setSocketInstance = (io: any) => {
  ioInstance = io;
};

export const getSocketInstance = () => {
  return ioInstance;
};