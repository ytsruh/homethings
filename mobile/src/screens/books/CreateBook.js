import React, { useState } from "react";
import { View } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import CreateBookManual from "../../components/CreateBookManual";
import CreateBookSearch from "../../components/CreateBookSearch";

export default function CreateBook(props) {
  const [createType, setCreateType] = useState(0);

  return (
    <View className="flex h-full bg-salt">
      <View className="m-3">
        <SegmentedControl
          values={["Search Open Books", "Manual"]}
          selectedIndex={createType}
          onChange={(event) => {
            setCreateType(event.nativeEvent.selectedSegmentIndex);
          }}
        />
      </View>
      {createType === 0 ? (
        <CreateBookSearch navigation={props.navigation} />
      ) : (
        <CreateBookManual navigation={props.navigation} />
      )}
    </View>
  );
}
