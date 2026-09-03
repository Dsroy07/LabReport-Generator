export const demoReport = {
  patient: {
    name: "Test Patient",
    age: "35",
    sex: "Male",
    date: "2026-09-03"
  },
  hematology: {
    hb: "13.2",
    wbcTotal: "7800",
    differential: {
      p: "60",
      l: "32",
      m: "5",
      e: "2",
      b: "1"
    },
    esr: "12"
  },
  blood: {
    group: "B+",
    rhFactor: "Positive",
    sugar: {
      fasting: "92",
      postPrandial: "128",
      random: "105"
    }
  },
  otherTests: {
    urineSugar: "Nil",
    bloodUrea: "28",
    bleedingTime: "180",
    clottingTime: "300",
    raFactor: "Negative",
    serumUricAcid: "5.2",
    serumCreatinine: "0.9",
    hiv: "Non-Reactive",
    hbsag: "Non-Reactive"
  },
  urine: {
    physical: {
      colour: "Pale Yellow",
      acidity: "Acidic",
      specificGravity: "1.020"
    },
    chemical: {
      albumin: "Nil",
      sugar: "Nil",
      bileSalts: "Nil",
      bilePigments: "Nil",
      ketoneBodies: "Nil"
    },
    microscopic: {
      wbc: "2-3 / HPF",
      rbc: "Nil",
      epithelialCells: "Few",
      casts: "Nil",
      crystals: "Nil",
      miscellaneous: "Nil",
      parasites: "Nil"
    }
  }
};

export const outOfRangeDemoReport = {
  ...demoReport,
  patient: {
    ...demoReport.patient,
    name: "Out of Range Demo"
  },
  hematology: {
    ...demoReport.hematology,
    hb: "10.2",
    wbcTotal: "15000",
    esr: "42"
  },
  blood: {
    ...demoReport.blood,
    sugar: {
      fasting: "156",
      postPrandial: "220",
      random: "198"
    }
  },
  otherTests: {
    ...demoReport.otherTests,
    bloodUrea: "58",
    serumCreatinine: "2.1"
  },
  urine: {
    ...demoReport.urine,
    microscopic: {
      ...demoReport.urine.microscopic,
      wbc: "8-10 / HPF",
      rbc: "6-8 / HPF"
    }
  }
};
