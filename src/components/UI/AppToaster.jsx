import { Toaster } from "react-hot-toast";

const AppToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 2500,
        style: {
          background: "var(--bg-modal)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-toolbar)",
          borderLeft: "4px solid var(--accent-primary)",
          borderRadius: "10px",
          boxShadow: "var(--shadow-modal)",
          fontSize: "13px",
        },
        success: {
          style: {
            border: "1px solid var(--status-success)",
            borderLeft: "4px solid var(--status-success)",
          },
        },
        error: {
          duration: 3500,
          style: {
            border: "1px solid var(--status-danger)",
            borderLeft: "4px solid var(--status-danger)",
          },
        },
      }}
    />
  );
};

export default AppToaster;
