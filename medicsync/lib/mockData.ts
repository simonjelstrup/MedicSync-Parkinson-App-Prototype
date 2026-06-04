export type DoseStatus = 'taken' | 'manual' | 'missed' | 'upcoming' | 'scheduled';

export type Medication = {
  id: string;
  name: string;
  dosage: string;
};

export type DoseTime = {
  id: string;
  label: string;
  scheduledTime: string;
  timingMode: 'meal' | 'fixed';
  fixedTime: string;
  mealAnchor: {
    meal: 'breakfast' | 'lunch' | 'dinner';
    relation: 'before' | 'after';
    minutes: number;
  };
  medications: Medication[];
};

export type DoseLog = {
  id: string;
  doseId: string;
  date: string;
  scheduledTime: string;
  takenAt: string | null;
  method: 'nfc' | 'manual' | null;
  status: DoseStatus;
  doseName: string;
};

export type DayHistory = {
  date: string;
  label: 'today' | 'yesterday' | 'date';
  displayDate: string;
  logs: DoseLog[];
};

export const mockDoses: DoseTime[] = [
  {
    id: 'morning',
    label: 'Morning',
    scheduledTime: '08:00',
    timingMode: 'meal',
    fixedTime: '08:00',
    mealAnchor: { meal: 'breakfast', relation: 'before', minutes: 30 },
    medications: [
      { id: 'm1', name: 'Levodopa', dosage: '100mg' },
      { id: 'm2', name: 'Amantadine', dosage: '100mg' },
    ],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    scheduledTime: '11:30',
    timingMode: 'meal',
    fixedTime: '12:00',
    mealAnchor: { meal: 'lunch', relation: 'before', minutes: 30 },
    medications: [
      { id: 'm1', name: 'Levodopa', dosage: '100mg' },
      { id: 'm2', name: 'Amantadine', dosage: '100mg' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    scheduledTime: '17:00',
    timingMode: 'meal',
    fixedTime: '17:00',
    mealAnchor: { meal: 'dinner', relation: 'before', minutes: 60 },
    medications: [{ id: 'm1', name: 'Levodopa', dosage: '100mg' }],
  },
  {
    id: 'night',
    label: 'Night',
    scheduledTime: '21:00',
    timingMode: 'meal',
    fixedTime: '21:00',
    mealAnchor: { meal: 'dinner', relation: 'after', minutes: 60 },
    medications: [{ id: 'm1', name: 'Levodopa', dosage: '100mg' }],
  },
];

export const mockHistory: DayHistory[] = [
  {
    date: '2026-05-07',
    label: 'today',
    displayDate: '7 May',
    logs: [
      {
        id: 'l1',
        doseId: 'morning',
        date: '2026-05-07',
        scheduledTime: '08:00',
        takenAt: '08:03',
        method: 'nfc',
        status: 'taken',
        doseName: 'Morning dose',
      },
      {
        id: 'l2',
        doseId: 'lunch',
        date: '2026-05-07',
        scheduledTime: '11:30',
        takenAt: null,
        method: null,
        status: 'upcoming',
        doseName: 'Lunch dose',
      },
      {
        id: 'l3',
        doseId: 'afternoon',
        date: '2026-05-07',
        scheduledTime: '17:00',
        takenAt: null,
        method: null,
        status: 'scheduled',
        doseName: 'Afternoon dose',
      },
      {
        id: 'l4',
        doseId: 'night',
        date: '2026-05-07',
        scheduledTime: '21:00',
        takenAt: null,
        method: null,
        status: 'scheduled',
        doseName: 'Night dose',
      },
    ],
  },
  {
    date: '2026-05-06',
    label: 'yesterday',
    displayDate: '6 May',
    logs: [
      {
        id: 'l5',
        doseId: 'morning',
        date: '2026-05-06',
        scheduledTime: '08:00',
        takenAt: '08:01',
        method: 'nfc',
        status: 'taken',
        doseName: 'Morning dose',
      },
      {
        id: 'l6',
        doseId: 'lunch',
        date: '2026-05-06',
        scheduledTime: '12:15',
        takenAt: '12:15',
        method: 'manual',
        status: 'manual',
        doseName: 'Lunch dose',
      },
      {
        id: 'l7',
        doseId: 'afternoon',
        date: '2026-05-06',
        scheduledTime: '17:00',
        takenAt: '17:04',
        method: 'nfc',
        status: 'taken',
        doseName: 'Afternoon dose',
      },
      {
        id: 'l8',
        doseId: 'night',
        date: '2026-05-06',
        scheduledTime: '21:00',
        takenAt: '21:02',
        method: 'nfc',
        status: 'taken',
        doseName: 'Night dose',
      },
    ],
  },
  {
    date: '2026-05-05',
    label: 'date',
    displayDate: '5 May',
    logs: [
      {
        id: 'l9',
        doseId: 'morning',
        date: '2026-05-05',
        scheduledTime: '08:00',
        takenAt: '08:00',
        method: 'nfc',
        status: 'taken',
        doseName: 'Morning dose',
      },
      {
        id: 'l10',
        doseId: 'lunch',
        date: '2026-05-05',
        scheduledTime: '12:00',
        takenAt: null,
        method: null,
        status: 'missed',
        doseName: 'Lunch dose',
      },
      {
        id: 'l11',
        doseId: 'afternoon',
        date: '2026-05-05',
        scheduledTime: '17:00',
        takenAt: '17:10',
        method: 'nfc',
        status: 'taken',
        doseName: 'Afternoon dose',
      },
      {
        id: 'l12',
        doseId: 'night',
        date: '2026-05-05',
        scheduledTime: '21:00',
        takenAt: '21:00',
        method: 'nfc',
        status: 'taken',
        doseName: 'Night dose',
      },
    ],
  },
  {
    date: '2026-05-04',
    label: 'date',
    displayDate: '4 May',
    logs: [
      {
        id: 'l13',
        doseId: 'morning',
        date: '2026-05-04',
        scheduledTime: '08:00',
        takenAt: '08:00',
        method: 'nfc',
        status: 'taken',
        doseName: 'Morning dose',
      },
      {
        id: 'l14',
        doseId: 'lunch',
        date: '2026-05-04',
        scheduledTime: '11:30',
        takenAt: '11:32',
        method: 'nfc',
        status: 'taken',
        doseName: 'Lunch dose',
      },
      {
        id: 'l15',
        doseId: 'afternoon',
        date: '2026-05-04',
        scheduledTime: '17:00',
        takenAt: '17:00',
        method: 'nfc',
        status: 'taken',
        doseName: 'Afternoon dose',
      },
      {
        id: 'l16',
        doseId: 'night',
        date: '2026-05-04',
        scheduledTime: '21:00',
        takenAt: '21:00',
        method: 'nfc',
        status: 'taken',
        doseName: 'Night dose',
      },
    ],
  },
];

export const mockNextDose = mockDoses[1];
