// Must be imported before ethers so crypto.getRandomValues exists on native.
import "react-native-get-random-values";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GluestackUIProvider mode={scheme === "dark" ? "dark" : "light"}>
      <StatusBar style="auto" />
      <Slot />
    </GluestackUIProvider>
  );
}
