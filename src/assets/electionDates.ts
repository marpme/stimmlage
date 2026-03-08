export type ElectionDate = {
  name: string;
  date: Date;
};

// Maps parliament ID to known election dates for that parliament
export const electionDates: Record<string, ElectionDate[]> = {
  // Bundestag
  "0": [
    { name: "Bundestagswahl 2017", date: new Date("2017-09-24") },
    { name: "Bundestagswahl 2021", date: new Date("2021-09-26") },
    { name: "Bundestagswahl 2025", date: new Date("2025-02-23") },
  ],
  // Baden-Württemberg
  "1": [
    { name: "Landtagswahl 2021", date: new Date("2021-03-14") },
  ],
  // Bayern
  "2": [
    { name: "Landtagswahl 2023", date: new Date("2023-10-08") },
  ],
  // Berlin
  "3": [
    { name: "Abgeordnetenhauswahl 2021", date: new Date("2021-09-26") },
    { name: "Abgeordnetenhauswahl 2023", date: new Date("2023-02-12") },
  ],
  // Brandenburg
  "4": [
    { name: "Landtagswahl 2024", date: new Date("2024-09-22") },
  ],
  // Bremen
  "5": [
    { name: "Bürgerschaftswahl 2023", date: new Date("2023-05-14") },
  ],
  // Hamburg
  "6": [
    { name: "Bürgerschaftswahl 2020", date: new Date("2020-02-23") },
    { name: "Bürgerschaftswahl 2025", date: new Date("2025-03-02") },
  ],
  // Hessen
  "7": [
    { name: "Landtagswahl 2023", date: new Date("2023-10-08") },
  ],
  // Mecklenburg-Vorpommern
  "8": [
    { name: "Landtagswahl 2021", date: new Date("2021-09-26") },
  ],
  // Niedersachsen
  "9": [
    { name: "Landtagswahl 2022", date: new Date("2022-10-09") },
  ],
  // Nordrhein-Westfalen
  "10": [
    { name: "Landtagswahl 2022", date: new Date("2022-05-15") },
  ],
  // Rheinland-Pfalz
  "11": [
    { name: "Landtagswahl 2021", date: new Date("2021-03-14") },
  ],
  // Saarland
  "12": [
    { name: "Landtagswahl 2022", date: new Date("2022-03-27") },
  ],
  // Sachsen
  "13": [
    { name: "Landtagswahl 2024", date: new Date("2024-09-01") },
  ],
  // Sachsen-Anhalt
  "14": [
    { name: "Landtagswahl 2021", date: new Date("2021-06-06") },
  ],
  // Schleswig-Holstein
  "15": [
    { name: "Landtagswahl 2022", date: new Date("2022-05-08") },
  ],
  // Thüringen
  "16": [
    { name: "Landtagswahl 2024", date: new Date("2024-09-01") },
  ],
  // Europawahl
  "17": [
    { name: "Europawahl 2019", date: new Date("2019-05-26") },
    { name: "Europawahl 2024", date: new Date("2024-06-09") },
  ],
};
