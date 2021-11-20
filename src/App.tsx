import React, { useCallback, useMemo, useState } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { TodoItemsList } from "./TodoItems";
import { TodoItemsContextProvider } from "./TodoItemsContext";
import TodoItemForm from "./TodoItemForm";
import { Snackbar, SnackbarOrigin } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import "./testUtils";

const theme = createTheme({
  palette: {
    primary: {
      main: "#9012fe",
    },
    secondary: {
      main: "#b2aabf",
    },
  },
});

function App() {
  const [isErrorToastOpened, setIsErrorToastOpened] = useState(false);
  const handleClose = useCallback(() => {
    setIsErrorToastOpened(false);
  }, []);
  const toastAnchorOrigin = useMemo<SnackbarOrigin>(
    () => ({ vertical: "top", horizontal: "center" }),
    []
  );
  const toastErrorMessage =
    "Unable to save todos: browser storage quota exceeded. Please delete some old items.";
  const errorToast = (
    <Snackbar
      open={isErrorToastOpened}
      anchorOrigin={toastAnchorOrigin}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        elevation={6}
        variant="filled"
        severity="error"
      >
        {toastErrorMessage}
      </Alert>
    </Snackbar>
  );

  const handleSaveError = useCallback(() => {
    setIsErrorToastOpened(true);
  }, []);

  return (
    <TodoItemsContextProvider onSaveError={handleSaveError}>
      <ThemeProvider theme={theme}>
        {errorToast}
        <Content />
      </ThemeProvider>
    </TodoItemsContextProvider>
  );
}

function Content() {
  return (
    <Container maxWidth="sm">
      <header>
        <Typography variant="h2" component="h1">
          Todo List
        </Typography>
      </header>
      <main>
        <TodoItemForm />
        <TodoItemsList />
      </main>
    </Container>
  );
}

export default App;
