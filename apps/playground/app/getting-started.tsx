import { Banner } from "@its/solaris-ui";

import { CodeBlock } from "../site/CodeBlock";
import { Page, Section } from "../site/Page";

const INSTALL = `npm install @its/solaris-ui`;

const PEERS = `npx expo install \\
  react-native-safe-area-context \\
  react-native-svg \\
  @expo/vector-icons`;

const PROVIDERS = `import {
  ThemeProvider,
  AlertProvider,
  ToastProvider,
} from "@its/solaris-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AlertProvider>
            <ToastProvider>
              <Screens />
            </ToastProvider>
        </AlertProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}`;

const FIRST_SCREEN = `import { Button, Typography, VStack } from "@its/solaris-ui";

export const Screens = () => (
  <VStack p="m" spacing="s">
    <Typography variant="headlineMedium">Hello</Typography>
    <Button iconName="check" onPress={() => {}}>
      Tap me
    </Button>
  </VStack>
);`;

const THEME_HOOK = `import { useTheme } from "@its/solaris-ui";

const { theme, toggleTheme } = useTheme();
// theme.palette.primary.main, theme.colors.primary, theme.spacing.m, theme.shape.large, theme.isDark`;

const FONTS = `// app.config.ts — embed Roboto in the native build.
// Config plugins need a development build; Expo Go cannot embed fonts.
plugins: [
  [
    "expo-font",
    {
      fonts: [
        "./assets/fonts/Roboto-Regular.ttf",
        "./assets/fonts/Roboto-Medium.ttf",
        "./assets/fonts/Roboto-Bold.ttf",
      ],
    },
  ],
],

// App.tsx — then tell the theme the family is there. Only iOS needs telling:
// Android has Roboto built in, and the web keeps its stack (undefined = default).
const theme = createTheme({
  typography: { fontFamily: Platform.OS === "ios" ? "Roboto" : undefined },
});
<ThemeProvider theme={theme}>…</ThemeProvider>;`;

export default function GettingStarted() {
  return (
    <Page
      eyebrow="Setup"
      title="Getting started"
      description="Install the package, mount the providers, and everything in the reference works as documented."
      banner={
        <Banner
          visible
          type="info"
          icon="information-outline"
          message="Solaris is pre-1.0. The API can still change between minor versions — pin the version you build against."
        />
      }
    >
      <Section title="1. Install" description="The package itself.">
        <CodeBlock code={INSTALL} language="bash" title="Terminal" />
      </Section>

      <Section
        title="2. Install the peer dependencies"
        description="Native modules are peers so your app owns their versions. These three are all the library needs; on web, react-native-web brings react-dom."
      >
        <CodeBlock code={PEERS} language="bash" title="Terminal" />
      </Section>

      <Section
        title="3. Mount the providers"
        description="ThemeProvider is required; AlertProvider and ToastProvider only if you call Alert() or useToast()."
      >
        <CodeBlock code={PROVIDERS} title="App.tsx" />
      </Section>

      <Section
        title="4. Build a screen"
        description="Layout primitives take token names, not numbers, so a screen never hardcodes a spacing value."
      >
        <CodeBlock code={FIRST_SCREEN} title="Screens.tsx" />
      </Section>

      <Section
        title="5. Read the theme"
        description="Everything the library paints comes from here, and so should everything you build beside it."
      >
        <CodeBlock code={THEME_HOOK} title="anywhere.tsx" />
      </Section>

      <Section
        title="6. Fonts"
        description="The theme uses Roboto on Android, where it is the system font, and on the web, where your HTML loads it (this site's app/+html.tsx does). iOS has no Roboto and React Native has no font fallback, so on iOS the theme uses the system font until the app embeds Roboto and says so."
      >
        <CodeBlock code={FONTS} title="app.config.ts / App.tsx" />
      </Section>
    </Page>
  );
}
