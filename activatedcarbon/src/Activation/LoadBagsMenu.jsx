// LoadBagsMenu.jsx
import * as React from "react";
import { Button } from "@mui/material";
import LoadBagsWithScanner from "./LoadBagsWithScanner";

export default function LoadBagsMenu(props) {
  const {
    // original button API
    buttonLabel = "Load",
    buttonProps,
    // controlled dialog API (optional)
    open: controlledOpen,
    onClose: controlledOnClose,
    // passthroughs
    onLoad,
    width,
    maxHeight,
    fetchBags,
  } = props;

  const isControlled = typeof controlledOpen === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const handleOpen = () => setUncontrolledOpen(true);
  const handleClose = () =>
    isControlled ? controlledOnClose?.() : setUncontrolledOpen(false);

  return (
    <>
      {/* Only show the button in uncontrolled mode (like your old component) */}
      {!isControlled && (
        <Button
          size="small"
          variant="contained"
          onClick={handleOpen}
          {...buttonProps}
        >
          {buttonLabel}
        </Button>
      )}

      <LoadBagsWithScanner
        open={open}
        onClose={handleClose}
        onLoad={onLoad}
        width={width}
        maxHeight={maxHeight}
        fetchBags={fetchBags}
      />
    </>
  );
}
