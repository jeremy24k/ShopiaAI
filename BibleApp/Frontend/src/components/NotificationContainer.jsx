import { Toaster } from 'sileo';

const NotificationContainer = () => {
  return (
    <Toaster
      position="bottom-right"
      options={{
        duration: 3000,
        fill: 'var(--primary-color)',
        roundness: 8
      }}
    />
  );
};

export default NotificationContainer;
