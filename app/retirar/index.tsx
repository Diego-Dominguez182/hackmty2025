import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import ConceptoScreen from "./conceptoScreen";
import ConfirmarScreen from "./confirmarScreen";
import MontoScreen from "./montoScreen";

const Stack = createStackNavigator();

export default function RetirarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MontoScreen" component={MontoScreen} />
      <Stack.Screen name="ConceptoScreen" component={ConceptoScreen} />
      <Stack.Screen name="ConfirmarScreen" component={ConfirmarScreen} />
    </Stack.Navigator>
  );
}