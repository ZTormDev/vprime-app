import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProgressBar = ({
  value = 0,
  maxValue = 100,
  height = 10,
  barColor = Colors.text.highlighted,
  backgroundColor = Colors.dark.cardPress,
  showValues = true,
  isRankBar = true,
}) => {
  const progressPercentage = Math.min((value / maxValue) * 100, 100);

  return isRankBar ? (
    <View style={{ width: "100%" }}>
      <View style={[styles.container, { backgroundColor, height }]}>
        <View
          style={[
            styles.progress,
            { width: `${progressPercentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Text style={styles.text}>RANK RATING</Text>

        <Text style={styles.text}>
          <Text style={{ color: Colors.text.highlighted }}>{value}</Text>
          <Text style={{ color: Colors.dark.text }}>{` / ${maxValue}`}</Text>
        </Text>
      </View>
    </View>
  ) : (
    <View
      style={{
        width: "100%",
        height: height,
        backgroundColor: backgroundColor,
        borderRadius: 5,
        overflow: "hidden",
        justifyContent: "center",
        padding: 1.5,
        paddingHorizontal: 2,
      }}
    >
      <View
        style={[
          styles.progress,
          { width: `${progressPercentage}%`, backgroundColor: barColor },
        ]}
      />

      {showValues && (
        <Text
          style={{
            fontFamily: "Rubik500",
            position: "absolute",
            textAlign: "center",
            width: "100%",
          }}
        >
          <Text style={{ color: Colors.text.active }}>{value}</Text>
          <Text style={{ color: Colors.dark.text }}>{` / ${maxValue}`}</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "center",
    padding: 1.5,
    paddingHorizontal: 2,
  },
  progress: {
    height: "100%",
    borderRadius: 5,
  },
  text: {
    color: Colors.dark.text,
    fontSize: 13,
    fontFamily: "Rubik500",
  },
});

export default ProgressBar;
