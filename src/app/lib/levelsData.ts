// Level data based on Level-by-Level.txt
export interface Level {
  id: number;
  title: string;
  subtitle: string;
  accentColor: string;
  summary: string;
  goalDescription?: string;
  rhythm?: string;
  ranges?: {
    female: string;
    male: string;
  };
  visualGuide?: string;
  scale?: string[];
  displayNotes?: {
    text: string;
    pitchClass: string;
    durationClass: string;
    positionClass: string;
  }[];
  focusText?: string;
  rhythmText?: string;
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Level 1: Beginner",
    subtitle: "5-Tone Scale",
    accentColor: "text-sky-600", // blue for beginner
    summary: "Goal: Train pitch sensitivity + Begin comfortable vocalization.",
    goalDescription: "Focus: Accuracy and soft delivery.",
    rhythm: "slow_4_beat",
    ranges: {
      female: "C4-G4",
      male: "C3-G3"
    },
    visualGuide: "Do - Re - Mi - Re - Do",
    scale: ["Do", "Re", "Mi", "Re", "Do"],
    displayNotes: [
      {
        text: "Mi",
        pitchClass: "p4-mi",
        durationClass: "note-duration-medium",
        positionClass: "note-position-current"
      },
      {
        text: "Re",
        pitchClass: "p4-re",
        durationClass: "note-duration-medium",
        positionClass: "note-position-next"
      },
      {
        text: "Do",
        pitchClass: "p4-do",
        durationClass: "note-duration-medium",
        positionClass: "note-position-next-2"
      }
    ],
    focusText: "Accuracy and soft delivery.",
    rhythmText: "Slow 4-beat"
  },
  {
    id: 2,
    title: "Level 2: Basic",
    subtitle: "Major Scale",
    accentColor: "text-teal-600", // teal for basic
    summary: "Goal: Stabilize pitch and rhythm + Build vocal fundamentals.",
    goalDescription: "Goal: Stabilize pitch & rhythm. Sustain final 'Do'.",
    rhythm: "8th_note_scale",
    ranges: {
      female: "C4-C5",
      male: "B2-B3"
    },
    visualGuide: "1-Octave Major Scale",
    scale: ["Do", "Re", "Mi", "Fa", "So", "La", "Ti", "Do"],
    displayNotes: [
      {
        text: "Fa",
        pitchClass: "p5-fa",
        durationClass: "note-duration-short",
        positionClass: "note-position-current"
      },
      {
        text: "So",
        pitchClass: "p5-so",
        durationClass: "note-duration-short",
        positionClass: "note-position-next"
      },
      {
        text: "La",
        pitchClass: "p5-la",
        durationClass: "note-duration-short",
        positionClass: "note-position-next-2"
      }
    ],
    focusText: "Stabilize pitch & rhythm. Sustain final 'Do'.",
    rhythmText: "8th-note scale"
  },
  {
    id: 3,
    title: "Level 3: Intermediate",
    subtitle: "Advanced Exercises",
    accentColor: "text-purple-600", // purple for intermediate
    summary: "Goal: Basic vocalization and breathing control, expanded vocal range, start expressing emotions.",
  },
  {
    id: 4,
    title: "Level 4: Advanced",
    subtitle: "Genre Techniques",
    accentColor: "text-indigo-600", // indigo for advanced
    summary: "Goal: Able to handle various genres, use vocal techniques, has stage experience.",
  },
  {
    id: 5,
    title: "Level 5: Pre-professional",
    subtitle: "Performance Mastery",
    accentColor: "text-rose-600", // rose for pre-professional
    summary: "Goal: Mastery of diverse vocal styles, expressive power, and ability to handle difficult songs.",
  }
];