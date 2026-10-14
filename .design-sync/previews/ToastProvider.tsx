import React from "react";
import {
  Button,
  ToastProvider,
  Typography,
  useToast,
  Stack,
} from "@its/solaris-ui";

type Toast = ReturnType<typeof useToast>;

// The toast lives in a Snackbar the provider owns, so a card previewing one
// mounts its own ToastProvider and fires the call after the effect that
// installs the context has run.
const Raise = ({
  run,
  children,
}: {
  run: (t: Toast) => void;
  children: React.ReactNode;
}) => {
  const toast = useToast();
  React.useEffect(() => {
    const id = setTimeout(() => run(toast), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
};

const stage = (run: (t: Toast) => void, caption: string) => (
  <Stack
    spacing="s"
    p="m"
    bg="surfaceContainerLow"
    radius="large"
    width={420}
    height={200}
  >
    <ToastProvider>
      <Raise run={run}>
        <Typography variant="subtitle1">Component library</Typography>
        <Typography variant="caption">{caption}</Typography>
      </Raise>
    </ToastProvider>
  </Stack>
);

export const Success = () =>
  stage(
    (t) =>
      t.success("Published @its/solaris-ui 0.2.0 to the registry.", {
        duration: 0,
      }),
    "toast.success(message)",
  );

export const WithAction = () =>
  stage(
    (t) =>
      t.show({
        message: "Chip moved to Buttons & actions.",
        action: { label: "Undo", onPress: () => {} },
        duration: 0,
      }),
    "toast.show({ message, action })",
  );

export const Failure = () =>
  stage(
    (t) =>
      t.error("Upload failed — the token file is larger than 2 MB.", {
        duration: 0,
      }),
    "toast.error(message)",
  );

export const TheApi = () => (
  <Stack spacing="s" p="m" bg="surfaceContainerLow" radius="large" width={420}>
    <Typography variant="subtitle1">Raising a toast</Typography>
    <Typography variant="body2">
      Mount ToastProvider once near the root, then call useToast() from anywhere
      below it. There is no visible state to thread through a screen.
    </Typography>
    <Stack spacing="xs" p="s" bg="surface" radius="medium">
      <Typography variant="caption">const toast = useToast();</Typography>
      <Typography variant="caption">
        toast.show({"{ message, type?, duration?, icon?, action?, id? }"})
      </Typography>
      <Typography variant="caption">
        toast.success(msg) · toast.error(msg) · toast.hide(key?)
      </Typography>
    </Stack>
    <Typography variant="caption">
      Toasts play back FIFO, one at a time; a repeated event reuses its id
      instead of stacking up.
    </Typography>
    <Button mode="tonal" onPress={() => {}}>
      Publish
    </Button>
  </Stack>
);
