import { useContext } from "react";
import DialogContext from "../context/dialogContext";

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used inside DialogProvider");
  }
  return context;
};

export default useDialog;
