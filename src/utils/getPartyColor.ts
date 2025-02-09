export const getPartyColor = (isLight: boolean, name: string): string => {
  switch (name) {
    case "SPD":
      return "#E3000F";
    case "CDU/CSU":
      return isLight ? "#000000" : "#3e3e3e";
    case "CDU":
      return isLight ? "#000000" : "#3e3e3e";
    case "CSU":
      return isLight ? "#000000" : "#3e3e3e";
    case "FDP":
      return "#FFED00";
    case "Grüne":
      return "#46962B";
    case "Linke":
      return "#BE3075";
    case "Freie Wähler":
      return "#FFD700";
    case "BSW":
      return "#7b2450";
    case "AfD":
      return "#009EE0";
    case "Sonstige":
    default:
      return "#CCCCCC";
  }
};
