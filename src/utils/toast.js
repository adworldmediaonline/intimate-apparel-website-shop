import { toast } from 'sonner';

const notifySuccess = message =>
  toast.success(message, {
    duration: 3000,
  });

const notifyError = message =>
  toast.error(message, {
    duration: 3000,
  });

export { notifyError, notifySuccess };
