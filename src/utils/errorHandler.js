import { notifyError } from "./notifications";

export const parseErrorMessage = (error, fallbackMessage = "An unexpected error occurred.") => {
  if (!error) return fallbackMessage;
  const apiMessage = error.response?.data?.message || error.message;
  return String(apiMessage || fallbackMessage);
};

export const handleApiError = (error, fallbackMessage = "Unable to complete the request.") => {
  const message = parseErrorMessage(error, fallbackMessage);
  notifyError(message);
  return message;
};
