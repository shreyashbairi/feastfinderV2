import React from "react";

import {
  SafeAreaView,
  ScrollView,
} from "react-native";

// Components
import PopularCards from "./PopularCards.tsx";
import CoreBanner from "../CoreComponents/CoreBanner.tsx";

export default function Home() {

  return(
    <SafeAreaView>
      <ScrollView>
        <CoreBanner />
        <PopularCards />
      </ScrollView>
    </SafeAreaView>
  )
}