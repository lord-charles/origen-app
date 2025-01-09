import { Redirect } from "expo-router";
import { LoaderScreen } from "react-native-ui-lib";

export default function TabsIndex() {
  return (
    <>
      <LoaderScreen />
      <Redirect href="/auth" />
    </>
  );
}
