import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import BookSearchResultTile from "../../components/BookSearchResultTile";

export default function BarcodeScanner(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(false);

  function clearResult() {
    setResult(false);
    setScanned(false);
  }

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${data.trim()}.json`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Book not found");
        }
        throw new Error("Something went wrong");
      }
      const book = await response.json();
      setResult(book);
    } catch (error) {}
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex h-full bg-salt">
      {scanned || (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {result && (
        <View className="m-2 py-5">
          <BookSearchResultTile data={result} navigation={props.navigation} setResult={clearResult} />
        </View>
      )}
    </View>
  );
}
