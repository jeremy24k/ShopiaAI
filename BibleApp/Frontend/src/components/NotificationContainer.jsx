import { Toaster } from 'sileo';

const NotificationContainer = () => {
  return (
    <Toaster
      position="bottom-right"
      options={{
        duration: 3000,
        fill: 'var(--white-color)',
        roundness: 8,
        styles: {
          description: 'var(--primary-color)'
        }
      }}
    />
  );
};

export default NotificationContainer;
