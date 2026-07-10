import { TouchableOpacity, Text, StyleSheet } from "react-native";

const SelectHolder = (props: any) => {
  return (
    <TouchableOpacity style={[styles.selectHolder,props.isSelected && styles.selectedStyle]} onPress={props.onPress}>
      <Text style={[styles.text, styles.selectHolderText]}>{props.name}</Text>
    </TouchableOpacity>
  );
};

export default SelectHolder;

const styles = StyleSheet.create({
  selectHolder: {
    maxWidth:"100%",
    padding:10,
    marginHorizontal:3,
    marginVertical:5,
    borderWidth:1,
    borderColor: "rgb(209, 209, 209)",
    borderRadius: 5,
  },
  selectHolderText: {
    fontSize: 14,
    lineHeight: 14,
  },
  selectedStyle: {
    borderColor: "rgb(96, 96, 96)",
    backgroundColor: "rgb(238, 238, 238)",
  },
  text: {
    fontFamily: "Sans",
  }
});
