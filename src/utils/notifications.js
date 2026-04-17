import { toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  closeOnClick: true,
  theme: "colored",
};

export const notifySuccess = (message) => {
  toast.success(message, {
    ...defaultOptions,
    style: {
      background: '#16a34a',
      color: '#ffffff',
    },
  });
};

export const notifyError = (message) => {
  toast.error(message, defaultOptions);
};

export const notifyWarning = (message) => {
  toast.warning(message, defaultOptions);
};

export const notifyInfo = (message) => {
  toast.info(message, defaultOptions);
};
