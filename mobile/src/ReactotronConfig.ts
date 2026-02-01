import Reactotron from "reactotron-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

if (__DEV__) {
  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: "MishMish Mobile",
    }) // controls connection & communication settings
    .useReactNative() // add all built-in react native plugins
    .connect(); // let's connect!
}
