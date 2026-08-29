import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, Check, Dumbbell, Clock, Trophy, History as HistoryIcon, Timer, Pause, Play, SkipForward, Lock, RotateCcw, Bookmark, TrendingUp, Trash2, Pencil, X, ChevronUp, ChevronDown, Settings as SettingsIcon, Sparkles, User, BookOpen } from "lucide-react";
import { FRONT_MUSCLES, BACK_MUSCLES } from "body-muscles";

/* ---------------------------------------------------------------
   DATA
--------------------------------------------------------------- */

const SPLITS = {
  "Full Body": ["Chest", "Back", "Front Delts", "Side Delts", "Quads", "Hamstrings", "Glutes", "Biceps", "Triceps", "Core", "Calves"],
  "Upper": ["Chest", "Back", "Front Delts", "Side Delts", "Rear Delts", "Biceps", "Triceps", "Traps", "Forearms"],
  "Lower": ["Quads", "Hamstrings", "Glutes", "Calves", "Lower Back", "Shins"],
  // Deadlifts are a Lower Back exercise now rather than a Back one, so the
  // group has to appear on the days that used to programme them or they
  // vanish from every generated session.
  "Push": ["Chest", "Front Delts", "Side Delts", "Triceps"],
  "Pull": ["Back", "Lower Back", "Biceps", "Rear Delts", "Traps", "Forearms"],
  "Legs": ["Quads", "Hamstrings", "Glutes", "Calves", "Shins", "Core"],
};

const EXERCISES = {
  Chest: [
    { id: "bench-press", name: "Bench Press", type: "compound", pattern: "press", cue: "Shoulder blades pinned back and down, lower to the lower chest, press without letting the elbows flare to 90." },
    { id: "incline-press", name: "Incline Press", type: "compound", pattern: "press-incline", cue: "Bench at 30-45 degrees. Any steeper and it becomes a shoulder press." },
    { id: "dips", name: "Dips", type: "compound", pattern: "press-dip", cue: "Lean the torso forward and let the elbows travel out a little — upright and tucked turns it into a triceps exercise." },
    { id: "cable-fly", name: "Cable Fly", type: "isolation", pattern: "fly", cue: "Soft elbow bend held throughout, bring the hands together and slightly across, resist the stretch on the way back." },
    { id: "pec-deck", name: "Pec Deck", type: "isolation", pattern: "fly", cue: "Set the seat so the handles sit at chest height, squeeze for a beat at the middle, control the return." },
    { id: "push-up", name: "Push-Up", type: "compound", pattern: "press-bodyweight", cue: "Straight line from shoulders to ankles, chest to the floor, elbows at about 45 degrees rather than flared." },
  ],
  Back: [
    { id: "pull-ups", name: "Pull-Up", type: "compound", pattern: "vertical-pull", cue: "Full dead hang at the bottom, drive the elbows down and back, pause at the top before lowering under control." },
    { id: "bent-over-row", name: "Bent-Over Row", type: "compound", pattern: "horizontal-pull", cue: "Hinge to about 45 degrees and hold it, row to the belly button, squeeze the shoulder blades before lowering slowly." },
    { id: "lat-pulldown", name: "Lat Pulldown", type: "compound", pattern: "vertical-pull", cue: "Lead with the elbows, pull to the upper chest, resist all the way back up rather than letting it snap." },
    { id: "chest-supported-row", name: "Chest-Supported Row", type: "compound", pattern: "horizontal-pull", cue: "Chest stays on the pad the whole set — if you have to peel off it to finish a rep, the weight is too heavy." },
    { id: "cable-row", name: "Seated Cable Row", type: "compound", pattern: "horizontal-pull", cue: "Row to the torso with the elbows close, pause a second squeezing the shoulder blades together, stay upright." },
    { id: "db-row", name: "Dumbbell Row", type: "compound", pattern: "horizontal-pull", cue: "Stretch fully at the bottom, pull the elbow toward the hip, keep the torso square rather than twisting into it." },
    { id: "straight-arm-pulldown", name: "Straight-Arm Pulldown", type: "isolation", pattern: "isolation-pull", cue: "Arms almost straight throughout, pull from the lats not the triceps, stop when the bar reaches the thighs." },
    { id: "pullover", name: "Pullover", type: "isolation", pattern: "pullover", cue: "Ribs down, stretch overhead without arching the lower back, pull back over with the arms nearly locked." },
  ],
  "Front Delts": [
    { id: "overhead-press", name: "Overhead Press", type: "compound", pattern: "press-overhead", cue: "Brace hard before the rep, press straight past the face, finish with the biceps by the ears." },
    { id: "front-raise", name: "Front Raise", type: "isolation", pattern: "front-raise", cue: "Raise to shoulder height with a soft elbow, no swing from the hips, lower slower than you lifted." },
  ],
  "Side Delts": [
    { id: "lateral-raise", name: "Lateral Raise", type: "isolation", pattern: "lateral", cue: "Lead with the elbow rather than the hand, stop at shoulder height, fight the weight all the way down." },
    { id: "upright-row", name: "Upright Row", type: "compound", pattern: "upright-row", cue: "Pull to chest height leading with the elbows. If the shoulder pinches, widen the grip or drop the height." },
  ],
  "Rear Delts": [
    { id: "reverse-fly", name: "Reverse Fly", type: "isolation", pattern: "rear-fly", cue: "Open the arms wide with a fixed elbow angle, think about pulling the hands apart, do not shrug into it." },
    { id: "face-pull", name: "Face Pull", type: "isolation", pattern: "rear-pull", cue: "Pull to eye level and rotate the hands back at the finish, squeeze, keep the elbows high throughout." },
  ],
  Biceps: [
    { id: "preacher-curl", name: "Preacher Curl", type: "isolation", pattern: "curl-strict", cue: "Armpits into the top of the pad, stop just short of lockout at the bottom to keep tension, squeeze at the top." },
    { id: "cable-curl", name: "Cable Curl", type: "isolation", pattern: "curl-standard", cue: "Constant tension is the point — control the lowering as deliberately as the lift, elbows pinned to the sides." },
    { id: "hammer-curl", name: "Hammer Curl", type: "isolation", pattern: "curl-hammer", cue: "Neutral grip throughout, no swing. The slow negative is what builds the brachialis underneath the bicep." },
    { id: "incline-curl", name: "Incline Curl", type: "isolation", pattern: "curl-stretch", cue: "Let the arms hang behind the body for a full stretch, curl without the shoulders drifting forward." },
  ],
  Triceps: [
    { id: "overhead-extension", name: "Overhead Extension", type: "isolation", pattern: "extension-overhead", cue: "Elbows stay pointed forward and still. The stretch overhead is where the long head does its work." },
    { id: "pushdown", name: "Pushdown", type: "isolation", pattern: "extension-pushdown", cue: "Upper arms locked to the ribs, extend fully, let it come back only as far as the elbows can stay put." },
    { id: "seated-dips", name: "Seated Dips", type: "compound", pattern: "press-dip", cue: "Stay upright with the elbows tucked — the whole point is to keep the load on the triceps rather than the chest." },
    { id: "skull-crusher", name: "Skull Crusher", type: "isolation", pattern: "extension-lying", cue: "Lower behind the head rather than to the forehead, elbows still, extend without letting them drift apart." },
    { id: "close-grip-bench", name: "Close-Grip Bench Press", type: "compound", pattern: "press", cue: "Hands roughly shoulder width — narrower wrecks the wrists. Elbows tucked, bar to the lower chest." },
    { id: "hack-dips", name: "Hack Dips", type: "compound", pattern: "press-dip", cue: "Back flat against the pad, press through the heels of the hands, lock out without shrugging." },
  ],
  Quads: [
    { id: "squat", name: "Squat", type: "compound", pattern: "squat", cue: "Brace before you unrack. Sit between the hips, knees tracking over the toes, drive the floor away." },
    { id: "leg-extension", name: "Leg Extension", type: "isolation", pattern: "isolation-extension", cue: "Pin the knee joint level with the machine pivot, squeeze hard at the top, lower under control." },
    { id: "leg-press", name: "Leg Press", type: "compound", pattern: "leg-press", cue: "Feet mid-platform, knees tracking over the toes, stop before the lower back rounds off the pad." },
    { id: "lunge", name: "Lunge", type: "compound", pattern: "lunge", cue: "Step out far enough that the front shin stays near vertical, lower until the back knee grazes the floor." },
  ],
  Hamstrings: [
    { id: "romanian-deadlift", name: "Romanian Deadlift", type: "compound", pattern: "hinge", cue: "Push the hips back with soft knees, bar dragging the legs, stop where the hamstrings stop and the back starts." },
    { id: "seated-leg-curl", name: "Seated Leg Curl", type: "isolation", pattern: "flexion-seated", cue: "Hips stay down in the seat. The stretched position at the top is where seated curls earn their keep." },
    { id: "leg-curl", name: "Lying Leg Curl", type: "isolation", pattern: "flexion", cue: "Hips pressed into the pad, curl all the way, resist the return rather than letting the stack drop." },
    { id: "nordic-curl", name: "Nordic Curl", type: "isolation", pattern: "flexion", cue: "Lower as slowly as you can hold, hips locked straight, catch with the hands only when you have to." },
    { id: "good-morning", name: "Good Morning", type: "compound", pattern: "hinge", cue: "Light. Hinge at the hips with a neutral spine and stand by driving the hips forward, not by pulling with the back." },
    { id: "glute-ham-raise", name: "Glute-Ham Raise", type: "compound", pattern: "flexion", cue: "Hips stay extended throughout — bending at the hip turns it into a back raise. Lower slowly, pull with the hamstrings." },
  ],
  Glutes: [
    { id: "hip-thrust", name: "Hip Thrust", type: "compound", pattern: "hip-extension", cue: "Chin tucked, ribs down, drive through the heels to full lockout and hold the squeeze for a beat." },
    { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", type: "compound", pattern: "unilateral-squat", cue: "Front foot far enough forward to lean slightly into it, drop straight down, drive through the whole front foot." },
    { id: "cable-kickback", name: "Cable Kickback", type: "isolation", pattern: "isolation-extension", cue: "Keep the working knee slightly bent, drive from the hip alone, do not arch the lower back to get more range." },
    { id: "reverse-lunge", name: "Reverse Lunge", type: "compound", pattern: "lunge", cue: "Step back and lower under control, keep the weight in the front heel, drive back to standing without pushing off the back foot." },
    { id: "hip-abduction", name: "Hip Abduction", type: "isolation", pattern: "abduction", cue: "Lean the torso forward a touch to bias the upper glute, push out slowly, control the way back in." },
    { id: "hip-adduction", name: "Hip Adduction", type: "isolation", pattern: "adduction", cue: "Let the legs open until you feel the stretch on the inner thigh, squeeze them together without rocking the hips." },
  ],
  Calves: [
    { id: "standing-calf-raise", name: "Standing Calf Raise", type: "isolation", pattern: "standing", cue: "Full stretch at the bottom, all the way up onto the toes, pause at both ends rather than bouncing." },
    { id: "seated-calf-raise", name: "Seated Calf Raise", type: "isolation", pattern: "seated", cue: "Knees bent puts the soleus to work, so go slow and hold the top. Speed gets you nothing here." },
  ],
  Shins: [
    { id: "tibialis-raise", name: "Tibialis Raise", type: "isolation", pattern: "tibialis", cue: "Heels planted, pull the toes up as far as they go, lower slowly. It will cramp before it fails at first." },
  ],
  Forearms: [
    { id: "reverse-curl", name: "Reverse Curl", type: "isolation", pattern: "curl-reverse", cue: "Overhand grip, wrists locked straight, curl without letting them break backward. Lighter than you think." },
    { id: "eugene-curl", name: "Eugene Curl", type: "isolation", pattern: "curl-reverse", cue: "Elbow stays behind the torso the whole set. The stretch at the bottom is the point, so keep it light and honest." },
    { id: "reverse-eugene-curl", name: "Reverse Eugene Curl", type: "isolation", pattern: "curl-reverse", cue: "Same elbow-behind-the-body position as the Eugene curl, overhand. Hits the brachioradialis in a deep stretch." },
    { id: "wrist-curl", name: "Wrist Curl", type: "isolation", pattern: "flexion-wrist", cue: "Forearms braced on a bench or the thighs, move only at the wrist, let it roll to the fingertips at the bottom." },
    { id: "reverse-wrist-curl", name: "Reverse Wrist Curl", type: "isolation", pattern: "extension-wrist", cue: "Palms down, forearms still, lift with the back of the hand. Very light — the range is tiny." },
    { id: "plate-pinch", name: "Plate Pinch", type: "isolation", pattern: "isometric-grip", cue: "Pinch the smooth sides together, stand tall, hold for time. Stop the set when the fingers start to open." },
    { id: "dead-hang", name: "Dead Hang", type: "isolation", pattern: "isometric", cue: "Relax into a full hang, breathe steadily, hold for time rather than reps." },
  ],
  Traps: [
    { id: "shrug", name: "Shrug", type: "isolation", pattern: "shrug", cue: "Straight up and down — rolling the shoulders adds nothing. Hold the top for a second on every rep." },
    { id: "farmers-carry", name: "Farmer's Carry", type: "compound", pattern: "carry", cue: "Stand tall, shoulders back, grip hard and take short controlled steps. Carry for distance or time." },
  ],
  Core: [
    { id: "cable-crunch", name: "Cable Crunch", type: "isolation", pattern: "flexion", cue: "Hips fixed — crunch the ribs toward the pelvis rather than bending at the hip. Squeeze hard at the bottom." },
    { id: "hanging-leg-raise", name: "Hanging Leg Raise", type: "isolation", pattern: "flexion", cue: "Curl the pelvis up rather than just lifting the legs, and stop the swing completely between reps." },
    { id: "wood-chop", name: "Cable Woodchop", type: "isolation", pattern: "rotation", cue: "Rotate through the torso with the arms staying long, hips turning with it, control the way back." },
    { id: "ab-wheel", name: "Ab Wheel", type: "compound", pattern: "anti-extension", cue: "Ribs down and hips tucked before you roll. Go only as far as you can hold that position, not as far as you can reach." },
    { id: "reverse-crunch", name: "Reverse Crunch", type: "isolation", pattern: "flexion", cue: "Lift the hips off the floor rather than swinging the knees, and lower one vertebra at a time." },
    { id: "plank", name: "Plank", type: "isolation", pattern: "isometric", cue: "Squeeze the glutes and tuck the hips. A hard 30 seconds beats a sagging two minutes." },
  ],
  "Lower Back": [
    { id: "deadlift", name: "Deadlift", type: "compound", pattern: "hinge", cue: "Brace hard before every rep, bar against the shins, push the floor away rather than pulling with the back." },
    { id: "back-extension", name: "45° Back Extension", type: "isolation", pattern: "extension-back", cue: "Round or stay neutral by choice, not by accident. Squeeze the glutes at the top, no hyperextension past straight." },
  ],
};

/* ---------------------------------------------------------------
   SECONDARY MUSCLES

   Muscles a lift works hard enough to matter without being what the lift
   is for. Read by the readiness map, which gives them partial fatigue,
   and by the weekly volume screen, which counts them as half a set.

   Started from the source table. Where the table names something with no
   group of its own — hip flexors, adductors, obliques — it is dropped
   rather than approximated, except that obliques fold into Core because
   that is the group they belong to here.

   One rule added on top: if the load hangs from your hands, the traps
   are holding it. That covers the hinges and rows where the bar sits at
   arm's length between reps, plus the carries, hangs and pinches. It
   does not cover lifts where the weight rests on your back or a machine
   supports it, and it does not cover a lunge or split squat, since the
   implement there might be a barbell across the shoulders.
--------------------------------------------------------------- */

/* Extra search terms per exercise, so looking for a movement by the name you
   actually call it finds it.

   Search matches on the display name alone, which means a British lifter
   typing "press up" gets nothing at all — the entry is called Push-Up. That
   reads as a missing exercise rather than a vocabulary mismatch, and the
   obvious response is to add a duplicate, which then splits the history for
   one movement across two ids. Aliases instead: one entry, several names. */
const EXERCISE_ALIASES = {
  "push-up": ["press-up", "press ups", "pressup", "pushup"],
  "pull-ups": ["pullup", "chin up", "chinup"],
  "overhead-press": ["ohp", "military press", "shoulder press", "strict press"],
  "romanian-deadlift": ["rdl", "stiff leg deadlift"],
  "lateral-raise": ["side raise", "lat raise", "side lateral"],
  "leg-press": ["legpress"],
  "bent-over-row": ["barbell row", "bent over row", "pendlay row"],
  "lat-pulldown": ["pulldown", "lat pull down"],
  "standing-calf-raise": ["calf raise", "calves"],
  "seated-calf-raise": ["calf raise", "calves", "soleus"],
  "hip-thrust": ["glute bridge"],
  "skull-crusher": ["lying tricep extension", "french press"],
  "pushdown": ["tricep pushdown", "cable pushdown"],
  "face-pull": ["facepull", "rear delt pull"],
};

// True when a query matches the exercise's name or any of its aliases. One
// place, so every search box behaves the same way.
function exerciseMatchesQuery(ex, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return true;
  if (ex.name.toLowerCase().includes(query)) return true;
  return (EXERCISE_ALIASES[ex.id] || []).some((a) => a.includes(query));
}

const SECONDARY_MUSCLES = {
  "bench-press": ["Triceps", "Front Delts"],
  "incline-press": ["Triceps", "Front Delts"],
  "dips": ["Triceps", "Front Delts"],
  "push-up": ["Triceps", "Front Delts", "Core"],
  "pull-ups": ["Biceps", "Core"],
  "bent-over-row": ["Rear Delts", "Biceps", "Lower Back", "Traps"],
  "lat-pulldown": ["Biceps"],
  "chest-supported-row": ["Rear Delts", "Biceps"],
  "cable-row": ["Biceps", "Rear Delts"],
  "db-row": ["Biceps", "Rear Delts", "Traps"],
  "overhead-press": ["Side Delts"],
  "upright-row": ["Traps", "Rear Delts", "Biceps"],
  "reverse-fly": ["Back"],
  "face-pull": ["Back", "Traps"],
  "preacher-curl": ["Forearms"],
  "cable-curl": ["Forearms"],
  "hammer-curl": ["Forearms"],
  "incline-curl": ["Forearms"],
  "seated-dips": ["Chest", "Front Delts"],
  "close-grip-bench": ["Chest", "Front Delts"],
  "hack-dips": ["Chest", "Front Delts"],
  "squat": ["Glutes", "Hamstrings", "Core"],
  "leg-press": ["Glutes"],
  "lunge": ["Glutes", "Hamstrings"],
  "romanian-deadlift": ["Glutes", "Lower Back", "Traps"],
  "seated-leg-curl": ["Calves"],
  "leg-curl": ["Calves"],
  "nordic-curl": ["Glutes", "Calves"],
  "good-morning": ["Glutes", "Lower Back"],
  "glute-ham-raise": ["Glutes", "Calves"],
  "hip-thrust": ["Hamstrings"],
  "bulgarian-split-squat": ["Quads"],
  "reverse-lunge": ["Quads", "Hamstrings"],
  "reverse-curl": ["Biceps"],
  "eugene-curl": ["Biceps"],
  "reverse-eugene-curl": ["Biceps"],
  "dead-hang": ["Back", "Front Delts", "Traps"],
  "plate-pinch": ["Traps"],
  "shrug": ["Forearms"],
  "farmers-carry": ["Forearms", "Core"],
  "ab-wheel": ["Back", "Front Delts"],
  "plank": ["Glutes"],
  "deadlift": ["Glutes", "Hamstrings", "Traps"],
  "back-extension": ["Glutes", "Hamstrings"],
};

/* ---------------------------------------------------------------
   IMPLEMENTS

   One movement, several ways to load it. A bench press is a bench press
   whether the weight is on a barbell, a pair of dumbbells or a Smith
   machine — the same progression, the same slot in a programme — so it is
   one exercise with the implement recorded per session rather than four
   near-duplicate entries cluttering the ranking.

   Only listed where the choice is real. A pec deck is a machine and a
   cable fly is a cable; offering "Barbell" there would be noise. The
   first entry of each list is the default, taken from the preferred
   method in the source table.
--------------------------------------------------------------- */

/* CALISTHENICS — one movement, three ways to load it.

   A dip done on the assist machine, unloaded, and with a plate hanging off
   you is the same movement at three different loads. Treating those as
   three exercises splits one progression into three graphs that each look
   flat; treating the load as a choice keeps the history in one place and
   makes the progression visible.

   The three are only offered where all three are genuinely how people load
   that movement — there is an assist machine or a band for it, and there is
   somewhere to hang a plate. Bench dips and hanging leg raises take weight
   but nobody assists them, so they are not in here. */
const CALISTHENIC_LOADINGS = ["Bodyweight", "Assisted", "Weighted"];
const CALISTHENIC_IDS = new Set(["dips", "pull-ups", "push-up", "nordic-curl"]);

function isCalisthenic(id) {
  return CALISTHENIC_IDS.has(id);
}

/* Which of the three a logged set was, including for sessions recorded
   before the choice existed. Rather than migrating that history, the
   loading is inferred where it is missing: a weight on a bodyweight
   movement could only ever have meant added weight, and no weight could
   only have meant unloaded. That is right for every old row and needs no
   schema change. */
function loadingOf(exId, method, weight) {
  if (!isCalisthenic(exId)) return null;
  if (CALISTHENIC_LOADINGS.includes(method)) return method;
  const w = parseFloat(weight);
  return Number.isFinite(w) && w > 0 ? "Weighted" : "Bodyweight";
}

/* Bodyweight in the unit the app is currently logging in.

   Set weights are stored as bare numbers in whatever settings.weightUnit
   was at the time, while the bodyweight record carries its own unit — so
   the two have to be reconciled before they can be added together. */
function bodyweightIn(unit, record) {
  if (!record || !record.value) return null;
  const v = Number(record.value);
  if (!Number.isFinite(v) || v <= 0) return null;
  if (!record.unit || record.unit === unit) return v;
  return record.unit === "lb" ? v * 0.453592 : v / 0.453592;
}

/* What the lifter actually moved, which is the only number a progression
   chart can honestly plot for these.

   An assisted pull-up at 30kg of assistance is not "30kg" — it is bodyweight
   minus 30, and getting stronger means that number going UP while the
   assistance comes down. Plotting the raw entry would show a beginner's
   progress running backwards. */
function effectiveLoad(exId, method, weight, bodyweight) {
  const w = parseFloat(weight);
  if (!isCalisthenic(exId)) return Number.isFinite(w) ? w : null;
  if (!bodyweight) return null;
  const extra = Number.isFinite(w) ? Math.abs(w) : 0;
  const loading = loadingOf(exId, method, weight);
  if (loading === "Assisted") return Math.max(0, bodyweight - extra);
  if (loading === "Weighted") return bodyweight + extra;
  return bodyweight;
}

/* The bodyweight in force on a given date, from the weigh-in history.

   Today's figure is the wrong one to use for a session logged a year ago:
   a chart of pull-ups would then shift its whole history every time the
   scale moved, which is the opposite of what a progress chart is for.
   Before the first weigh-in, the earliest reading is the closest thing to
   the truth available. */
function bodyweightOnOrBefore(dateStr, history, current, unit) {
  const list = (history || [])
    .filter((h) => h && h.date && h.value)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  let chosen = null;
  for (const h of list) {
    if (h.date <= dateStr) chosen = h;
    else break;
  }
  return bodyweightIn(unit, chosen || list[0] || current);
}

const EXERCISE_METHODS = {
  "bench-press": ["Barbell", "Dumbbell", "Smith Machine", "Machine"],
  // Dips are one movement done three ways, so how you load them is a
  // choice on the exercise rather than three exercises. Generated days
  // therefore always programme "Dips" and leave the rest to you.
  "dips": CALISTHENIC_LOADINGS,
  "pull-ups": CALISTHENIC_LOADINGS,
  "push-up": CALISTHENIC_LOADINGS,
  "nordic-curl": CALISTHENIC_LOADINGS,
  "incline-press": ["Dumbbell", "Barbell", "Smith Machine", "Machine"],
  "bent-over-row": ["Barbell", "Dumbbell", "Smith Machine"],
  "chest-supported-row": ["Machine", "Dumbbell"],
  "pullover": ["Dumbbell", "Cable"],
  "overhead-press": ["Barbell", "Dumbbell", "Smith Machine", "Machine"],
  "front-raise": ["Dumbbell", "Cable", "Barbell"],
  "lateral-raise": ["Cable", "Dumbbell", "Machine"],
  "upright-row": ["Cable", "Barbell", "Dumbbell", "Smith Machine"],
  "reverse-fly": ["Cable", "Dumbbell", "Machine"],
  "preacher-curl": ["EZ Bar", "Dumbbell", "Machine", "Cable"],
  "hammer-curl": ["Dumbbell", "Cable"],
  "eugene-curl": ["Cable", "Dumbbell"],
  "reverse-eugene-curl": ["Cable", "Dumbbell"],
  "overhead-extension": ["Cable", "Dumbbell", "EZ Bar"],
  "skull-crusher": ["Dumbbell", "EZ Bar", "Barbell"],
  "close-grip-bench": ["Barbell", "Smith Machine"],
  "squat": ["Back", "Front", "Hack", "Smith Machine"],
  "lunge": ["Dumbbell", "Barbell", "Smith Machine"],
  "romanian-deadlift": ["Barbell", "Dumbbell", "Smith Machine"],
  "good-morning": ["Barbell", "Smith Machine"],
  "hip-thrust": ["Barbell", "Smith Machine", "Machine", "Dumbbell"],
  "bulgarian-split-squat": ["Dumbbell", "Barbell", "Smith Machine"],
  "reverse-lunge": ["Dumbbell", "Barbell", "Smith Machine"],
  "hip-abduction": ["Machine", "Cable"],
  "hip-adduction": ["Machine", "Cable"],
  "standing-calf-raise": ["Machine", "Smith Machine", "Dumbbell"],
  "tibialis-raise": ["Kettlebell", "Machine", "Bodyweight"],
  "reverse-curl": ["Barbell", "EZ Bar", "Dumbbell", "Cable"],
  "wrist-curl": ["Dumbbell", "Barbell"],
  "reverse-wrist-curl": ["Dumbbell", "Barbell"],
  "shrug": ["Dumbbell", "Barbell", "Smith Machine", "Machine", "Cable"],
  "farmers-carry": ["Kettlebell", "Dumbbell", "Barbell"],
  "deadlift": ["Barbell", "Dumbbell", "Smith Machine"],
};

// The implements offered for an exercise, or an empty list where the
// movement only comes one way.
function methodsFor(id) {
  return EXERCISE_METHODS[id] || [];
}

// First entry is the preferred one from the source table.
function defaultMethodFor(id) {
  const list = methodsFor(id);
  return list.length ? list[0] : null;
}

function hasMethodChoice(id) {
  return methodsFor(id).length > 1;
}

// Free text never enters here — methods come from a fixed list — but the
// comparison is normalised anyway so a value stored by an older build
// still matches.
function normaliseMethod(method) {
  return typeof method === "string" ? method.trim().toLowerCase() : "";
}

// Implements that put the load on a machine rather than a free weight.
// Whether an exercise offers a brand field now follows from the implement
// chosen for the session, which is more correct than the hardcoded list of
// exercise ids it replaces: a Smith bench has a brand worth recording, the
// same exercise with a barbell does not.
const MACHINE_METHODS = new Set(["Smith Machine", "Machine", "Cable", "Assisted", "Hack"]);

/* ---------------------------------------------------------------
   CABLE MACHINES & GRIPS
   Two identical loads on two different cable stacks rarely feel the
   same — pulley ratios, bearing friction and stack increments all vary
   by brand, and the attachment/grip changes the leverage too. So for any
   cable movement we capture the machine (brand) and the grip/attachment
   used, and surface them next to the previous performance so the numbers
   are compared like-for-like.
--------------------------------------------------------------- */

// Per-exercise attachment/grip options, for the movements that are always
// done on a cable and for any exercise whose chosen implement is a cable.
// The first entry is the sensible default; anything cable-based without an
// entry falls back to CABLE_GRIPS_GENERIC.
const CABLE_GRIPS = {
  "cable-fly": ["D-handles (neutral)", "Bare strap", "Single D-handle"],
  "cable-row": ["V-bar (close neutral)", "Wide lat bar (pronated)", "Straight bar (pronated)", "Rope", "Single D-handle"],
  "lat-pulldown": ["Wide bar (pronated)", "Close V-bar (neutral)", "Wide bar (underhand)", "Single handles (neutral)", "MAG grip"],
  "straight-arm-pulldown": ["Straight bar", "Rope", "Wide lat bar"],
  "lateral-raise": ["Single D-handle", "Ankle strap"],
  "face-pull": ["Rope", "Dual D-handles"],
  "reverse-fly": ["D-handles (neutral)", "Bare strap"],
  "cable-curl": ["Straight bar (supinated)", "EZ bar", "Rope (neutral)", "Single D-handle"],
  "pushdown": ["Straight bar", "Rope", "V-bar", "EZ bar"],
  "overhead-extension": ["Rope", "EZ bar", "Straight bar"],
  "cable-kickback": ["Ankle strap", "Single D-handle"],
  "cable-crunch": ["Rope", "Straight bar"],
  "wood-chop": ["Rope", "Single D-handle"],
  "front-raise": ["Single D-handle", "Straight bar", "Rope"],
  "upright-row": ["Straight bar", "Rope", "V-bar"],
  "hip-abduction": ["Ankle strap"],
  "shrug": ["Straight bar", "V-bar"],
  "pullover": ["Straight bar", "Rope"],
  "hammer-curl": ["Rope"],
  "preacher-curl": ["Straight bar", "EZ bar"],
  "reverse-curl": ["Straight bar", "EZ bar"],
};

const CABLE_GRIPS_GENERIC = ["Straight bar", "Rope", "D-handle", "V-bar", "Wide bar", "EZ bar", "Ankle strap"];

// Movements that only ever happen on a pulley stack, whatever else the
// database says. Everything else becomes a cable exercise only when the
// implement chosen for the session is one.
const ALWAYS_CABLE_IDS = new Set([
  "cable-fly",
  "cable-row",
  "lat-pulldown",
  "straight-arm-pulldown",
  "face-pull",
  "cable-curl",
  "pushdown",
  "cable-kickback",
  "cable-crunch",
  "wood-chop",
]);

// Movements always performed on a fixed machine, again regardless of any
// implement choice.
const ALWAYS_MACHINE_IDS = new Set([
  "pec-deck",
  "leg-press",
  "leg-extension",
  "leg-curl",
  "seated-leg-curl",
  "seated-calf-raise",
  "seated-dips",
  "hack-dips",
]);

// Whether an exercise is on a cable now depends mostly on how it is being
// loaded this session, which is more honest than the fixed list of exercise
// ids this replaces: a cable lateral raise wants a grip selector, the same
// movement with dumbbells does not.
function isCableExercise(ex, method) {
  if (!ex) return false;
  if (ex.mechanism === "cable") return true; // custom exercises can opt in
  if (ALWAYS_CABLE_IDS.has(ex.id)) return true;
  const chosen = method || defaultMethodFor(ex.id);
  return chosen === "Cable";
}

function getCableGrips(ex) {
  return CABLE_GRIPS[ex.id] || CABLE_GRIPS_GENERIC;
}

// True where the brand of the machine could meaningfully change how a given
// weight feels: cable stacks, fixed machines, and anything being done on a
// Smith or a plate-loaded machine this session. A barbell is a barbell
// everywhere, so it gets no brand field.
function isMachineExercise(ex, method) {
  if (!ex) return false;
  if (ex.mechanism === "machine") return true; // custom exercises can opt in
  if (ALWAYS_MACHINE_IDS.has(ex.id)) return true;
  if (isCableExercise(ex, method)) return true;
  const chosen = method || defaultMethodFor(ex.id);
  return !!chosen && MACHINE_METHODS.has(chosen);
}

// Distinct outline colors for supersets (kept clear of the orange accent so a
// linked group never reads as a primary action).


/* ---------------------------------------------------------------
   DATE / TIME HELPERS FOR BACK-DATED WORKOUTS
--------------------------------------------------------------- */

function dateStrOf(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function friendlyDateTime(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
// Keep an exercise's history entries in chronological order after a back-dated
// insert, so "last time" always means the most recent calendar session.
function sortByAt(entries) {
  return [...entries].sort((a, b) => {
    const ka = a.at || a.date || "";
    const kb = b.at || b.date || "";
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function clampToNow(d) {
  const now = new Date();
  return d > now ? now : d;
}

// Custom back-date/time picker built from plain <select> dropdowns rather than
// a native <input type="datetime-local">. Native date/time inputs are
// unreliable in Android WebViews (many render as a bare text field with no
// picker UI, and a value that doesn't match the exact expected format is
// silently dropped) — dropdowns behave identically everywhere, including
// inside a packaged APK.
function BackdatePicker({ value, onChange, onDone }) {
  const year = value.getFullYear();
  const month = value.getMonth();
  const day = value.getDate();
  const hour24 = value.getHours();
  const minute = value.getMinutes();
  const hour12 = ((hour24 + 11) % 12) + 1;
  const isPM = hour24 >= 12;
  const dayCount = daysInMonth(year, month);
  const years = [year, year - 1].filter((y, i, arr) => arr.indexOf(y) === i);

  function setPart(patch) {
    const next = new Date(value);
    if ("year" in patch) next.setFullYear(patch.year);
    if ("month" in patch) {
      const maxDay = daysInMonth(patch.year ?? year, patch.month);
      next.setMonth(patch.month, Math.min(next.getDate(), maxDay));
    }
    if ("day" in patch) next.setDate(patch.day);
    if ("hour12" in patch || "isPM" in patch) {
      const h12 = patch.hour12 ?? hour12;
      const pm = "isPM" in patch ? patch.isPM : isPM;
      const h24 = (h12 % 12) + (pm ? 12 : 0);
      next.setHours(h24);
    }
    if ("minute" in patch) next.setMinutes(patch.minute);
    onChange(clampToNow(next));
  }

  function quickPick(daysAgo) {
    const d = new Date(value);
    const base = new Date();
    base.setDate(base.getDate() - daysAgo);
    d.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
    onChange(clampToNow(d));
  }

  const selectStyle = {
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 12.5,
    fontFamily: "'JetBrains Mono', monospace",
    padding: "7px 6px",
    appearance: "none",
    WebkitAppearance: "none",
  };

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => onChange(new Date())} style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "7px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Now</button>
        <button onClick={() => quickPick(1)} style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "7px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Yesterday</button>
        <button onClick={() => quickPick(2)} style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "7px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>2 Days Ago</button>
      </div>

      <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Date</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <select value={day} onChange={(e) => setPart({ day: parseInt(e.target.value, 10) })} style={{ ...selectStyle, flex: 1 }}>
          {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setPart({ month: parseInt(e.target.value, 10) })} style={{ ...selectStyle, flex: 1.3 }}>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setPart({ year: parseInt(e.target.value, 10) })} style={{ ...selectStyle, flex: 1 }}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Time</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
        <select value={hour12} onChange={(e) => setPart({ hour12: parseInt(e.target.value, 10) })} style={{ ...selectStyle, flex: 1 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span style={{ color: COLORS.textDim }}>:</span>
        <select value={minute} onChange={(e) => setPart({ minute: parseInt(e.target.value, 10) })} style={{ ...selectStyle, flex: 1 }}>
          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
            <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
          ))}
        </select>
        <select value={isPM ? "PM" : "AM"} onChange={(e) => setPart({ isPM: e.target.value === "PM" })} style={{ ...selectStyle, flex: 1 }}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      <button onClick={onDone} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 8, padding: "9px 0", color: COLORS.onAccent, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
        Done
      </button>
    </div>
  );
}

// Generic mobility/cooldown pool, appended to the end of built workouts.
const MOBILITY_EXERCISES = [
  { id: "worlds-greatest-stretch", name: "World's Greatest Stretch", type: "mobility", pattern: "mobility", cue: "Move slowly through each position, breathe, don't force the range." },
  { id: "couch-stretch", name: "Couch Stretch", type: "mobility", pattern: "mobility", cue: "Keep hips square, ease into it gradually, hold each side for 30-60s." },
  { id: "ninety-ninety-hip-switch", name: "90/90 Hip Switch", type: "mobility", pattern: "mobility", cue: "Keep your chest tall, rotate slowly through the hips, both sides." },
  { id: "thoracic-rotations", name: "Thoracic Spine Rotations", type: "mobility", pattern: "mobility", cue: "Hips stay stacked, rotate from the upper back, both directions." },
  { id: "cat-cow", name: "Cat-Cow", type: "mobility", pattern: "mobility", cue: "Move with your breath, round and arch through the full spine." },
  { id: "doorway-chest-stretch", name: "Doorway Chest Stretch", type: "mobility", pattern: "mobility", cue: "Step through gently, hold 30s per side, don't bounce." },
  { id: "standing-quad-stretch", name: "Standing Quad Stretch", type: "mobility", pattern: "mobility", cue: "Keep knees together, pull the heel toward the glute, hold each side." },
  { id: "childs-pose", name: "Child's Pose", type: "mobility", pattern: "mobility", cue: "Sit back onto your heels, reach forward, breathe deeply and relax." },
];
EXERCISES["Mobility"] = MOBILITY_EXERCISES;

/* ---------------------------------------------------------------
   STORAGE HELPERS
--------------------------------------------------------------- */

// Persisted via the Claude-artifact window.storage API (per-user, not shared).
const STORAGE_PREFIX = "iron-log:";

// Best-effort localStorage mirror. window.storage is the primary store, but in
// some runtimes it can be unavailable or slow to read back a just-written value;
// mirroring to localStorage (guarded — it may throw in sandboxed frames) means a
// write survives either way and reads can recover it.
function lsGet(key) {
  try {
    if (typeof localStorage === "undefined") return null;
    const v = localStorage.getItem(STORAGE_PREFIX + key);
    return v == null ? null : v;
  } catch (e) {
    return null;
  }
}
function lsSet(key, str) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_PREFIX + key, str);
  } catch (e) {
    /* sandboxed / quota — ignore */
  }
}
function lsDelete(key) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    /* ignore */
  }
}

// Durable native key/value store, available only when the app is running as a
// packaged Capacitor build with the @capacitor/preferences plugin installed.
// Resolved defensively via the global Capacitor object (no static import) so the
// exact same code runs in a normal browser, the Claude artifact sandbox, and an
// installed APK. When present, this is what makes data survive app restarts on a
// phone — window.storage doesn't exist there, and WebView localStorage can be
// evicted by the OS.
function capPrefs() {
  try {
    const C = typeof window !== "undefined" ? window.Capacitor : null;
    if (C && C.Plugins && C.Plugins.Preferences) return C.Plugins.Preferences;
  } catch (e) {
    /* not a Capacitor runtime */
  }
  return null;
}
// The Claude-artifact / host-provided async store.
function hasWindowStorage() {
  try {
    return typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
  } catch (e) {
    return false;
  }
}

/* ---------------------------------------------------------------
   WHAT'S NEW

   Shown once per version, on the first launch after an update. Upgrades
   are silent otherwise — someone who installed a new APK has no idea what
   changed unless the app tells them.

   Deliberately not shown on a brand-new install: a first-time user gets
   the tour instead, and a changelog for a release they never saw is
   noise. The stored version is set on first run without the screen ever
   appearing, so the first thing they see is the tour and the first
   changelog they get is the next real update.

   To ship a release: bump "version" in package.json (Vite reads it into
   __APP_VERSION__) and add an entry at the top of RELEASE_NOTES. If the
   version has no entry the screen never appears, so forgetting the notes
   fails quietly rather than showing an empty modal.
--------------------------------------------------------------- */

const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
const LAST_SEEN_VERSION_KEY = "last-seen-version";

const RELEASE_NOTES = [
  {
    version: "1.19.0",
    date: "August 2026",
    headline: "Tap last time's numbers to log them again.",
    items: [
      {
        title: "Repeat last session in one tap",
        body: "The \u201clast time\u201d panel on every exercise is a button now. Tap it and those weights and reps are written straight onto the card, one row per set you did. Most sessions are the last one repeated, and typing three identical rows back in was the most repeated thing in the app.",
      },
      {
        title: "It will not wipe what you have typed",
        body: "On an empty exercise it fills straight away. If you have already logged something it asks first, and only replaces on a second tap.",
      },
      {
        title: "Effort is not copied",
        body: "Weight and reps are a plan; how close to failure it put you is a measurement. Reps in reserve is left blank for you to log, so the readiness map is never fed a number nobody reported.",
      },
    ],
  },
  {
    version: "1.18.0",
    date: "August 2026",
    headline: "Light mode, and everything about how the app looks in one place.",
    items: [
      {
        title: "Light mode",
        body: "Settings \u2192 Colour & Display. Dark, light, or follow whatever your phone is set to. It is not the dark theme inverted \u2014 every colour has a second value chosen for a pale background, because the ones that work on black mostly vanish on white.",
      },
      {
        title: "One screen for all of it",
        body: "Theme, colour scheme and contrast now live together on their own page instead of being scattered through Settings. They affect each other, so they belong side by side.",
      },
      {
        title: "The colour schemes work in both themes",
        body: "Each of the four has its own light palette rather than a lightened copy. Monochrome turns over rather than inverting: ready is the most prominent either way \u2014 brightest on dark, darkest on light.",
      },
      {
        title: "Outlines you can actually see",
        body: "The readiness outlines are drawn in whichever of black or white stands out against the muscle underneath, so they stay visible on a light theme where the fills are dark. An outline that blends in is no use as the backup for colour.",
      },
    ],
  },
  {
    version: "1.17.0",
    date: "August 2026",
    headline: "The readiness map, for people who cannot see red and green.",
    items: [
      {
        title: "Colour schemes in Settings",
        body: "The map told you what was recovered using red, amber and green \u2014 which is the worst possible choice for the commonest kind of colour blindness. Roughly one man in twelve could not reliably tell recovering from ready. Settings now has a Colour & Contrast section with four schemes: the original, one for red\u2013green deficiency, one for blue\u2013yellow, and a monochrome one that uses brightness alone.",
      },
      {
        title: "Every colour that means something changes",
        body: "Not just the body map. The set outlines that mark a better or worse set than last time, the accent, the superset colours and the effort dial all move with the scheme.",
      },
      {
        title: "Outlines, so colour is never the only clue",
        body: "In any scheme but the original, recovering muscles get a solid outline and almost-ready ones a dashed outline. A palette can be beaten by a bad screen or a form of colour blindness no preset anticipated. An outline cannot.",
      },
      {
        title: "High contrast",
        body: "A separate switch: pure black behind everything, brighter text, heavier lines, and the outlines turned on whichever scheme you are using. For low vision, or a phone at arm's length in a bright gym.",
      },
      {
        title: "See it before you choose it",
        body: "The three states are shown as they will actually look, on the page where you pick the scheme.",
      },
    ],
  },
  {
    version: "1.16.0",
    date: "August 2026",
    headline: "Better sessions when Iron Log picks them for you.",
    items: [
      {
        title: "A ranking decides what you get",
        body: "Auto-built workouts now follow an explicit priority list rather than working it out on the fly. A whole-body session is squat, pull-up, dips, lateral raise, curl, pushdown, hanging leg raise \u2014 the best lift for each area, biggest first. Train only some muscles and it walks the same list with the parts that do not apply left out.",
      },
      {
        title: "Muscles alternate through the session",
        body: "Two chest exercises and one back used to come back as chest, chest, back, so the second chest lift landed on a chest the first had already cooked. They are dealt out one muscle at a time now.",
      },
      {
        title: "Never four brutal lifts in a row",
        body: "A generated session holds at most three of the genuinely fatiguing lifts, and a short one is made of them rather than robbed of them \u2014 fifteen minutes is squat, pull-up and dips, not a squat and two curls.",
      },
      {
        title: "Your own order still wins",
        body: "Reorder a muscle with the arrows in the Exercise Database and your ranking fills that muscle's slot instead of the built-in one. Where the two disagree, you win.",
      },
      {
        title: "A week is seven days",
        body: "Programme progress counted sessions and called them weeks, so seven repeats of one full-body day read as week four. It counts real weeks from the day you started the block now. The session tally beside it is unchanged, so you can still see how much of the block you have actually done.",
      },
      {
        title: "One less question before you start",
        body: "Train Ready Muscles asks how long you have, and nothing else. The strength-or-size choice is gone \u2014 the ranking decides what you get, and the extra tap was buying nothing.",
      },
    ],
  },
  {
    version: "1.15.0",
    date: "August 2026",
    headline: "Fix an exercise instead of replacing it.",
    items: [
      {
        title: "Edit anything in the database",
        body: "Tap the pencil beside any exercise \u2014 yours or one of Iron Log\u2019s \u2014 to change its name, its muscle, whether it counts as a compound, the muscles it also hits, and its cue. Before this the only way to correct something was to delete it and add it back, which threw away every set you had ever logged against it.",
      },
      {
        title: "Your history comes with it",
        body: "The exercise keeps its identity, so your logged sets, records and charts stay attached. Rename it or move it to another muscle and every past workout is updated to match, so your history does not end up half under the old name.",
      },
      {
        title: "Adding an indirect muscle counts backwards",
        body: "Tick a muscle an exercise also hits and sessions you logged months ago start counting toward it straight away, on the readiness map and in weekly volume. Nothing needs re-entering.",
      },
      {
        title: "Changed your mind",
        body: "An edited built-in is marked Edited in the list, and can be put back to Iron Log\u2019s version at any time \u2014 which takes your history back with it.",
      },
    ],
  },
  {
    version: "1.14.0",
    date: "August 2026",
    headline: "Dips and pull-ups know the difference between help and load.",
    items: [
      {
        title: "One button for how you are loading it",
        body: "Dips, pull-ups, push-ups and nordic curls now have a single button on the card: bodyweight, assisted, or weighted. Bodyweight asks for no number at all. Assisted asks how much help, weighted asks what you added. Changing it clears the weights rather than reinterpreting them, because assistance and added weight are opposite quantities.",
      },
      {
        title: "It remembers what you used",
        body: "The first time you touch the weight box it offers the figure from your last session at that same loading \u2014 the assisted number when you are assisted, the weighted one when you are weighted. Tap to reuse it across every set, or enter a new one.",
      },
      {
        title: "Progression that reads the right way round",
        body: "Charts plot what you actually moved: bodyweight minus the assistance, or bodyweight plus the belt. Going from 40kg of help to 20kg used to look like your numbers halving. It now reads as the progress it is. Add your bodyweight in Personal Info to switch this on \u2014 without a weigh-in there is no honest number to draw, so nothing is invented.",
      },
    ],
  },
  {
    version: "1.13.0",
    date: "August 2026",
    headline: "Find any exercise, and tell Iron Log what your own ones work.",
    items: [
      {
        title: "The database has a search box",
        body: "It only listed exercises by body part before, which is no help if you do not already know where something was filed. There is a search box on the front of it now.",
      },
      {
        title: "It knows what you call things",
        body: "Search matches common alternative names as well as the one on the entry. Press-up finds Push-Up, OHP finds Overhead Press, RDL finds Romanian Deadlift, bent over row finds Bent-Over Row.",
      },
      {
        title: "Your own compounds can name their indirect work",
        body: "Adding a compound now offers a list of muscles it also hits. They pick up partial fatigue on the readiness map and half a set each in weekly volume \u2014 the same treatment the built-in exercises get. Before this, a custom exercise only ever marked one muscle.",
      },
    ],
  },
  {
    version: "1.12.0",
    date: "August 2026",
    headline: "A form video for every exercise, one tap away.",
    items: [
      {
        title: "Play button beside every lift",
        body: "Not sure how something is done, or want to check your setup mid-session? Tap the play button next to the exercise name and Iron Log opens a YouTube search for it.",
      },
      {
        title: "It follows the implement",
        body: "The search includes whichever loading you picked, so asking about a Smith machine bench press does not show you a barbell one. That is why it is a search rather than one fixed video per exercise \u2014 and it means the link can never rot.",
      },
      {
        title: "Still nothing to download",
        body: "No videos are bundled and nothing is cached. The button opens YouTube and the app itself stays exactly as offline as it always was.",
      },
    ],
  },
  {
    version: "1.11.1",
    date: "August 2026",
    headline: "The tour just shows you the app now.",
    items: [
      {
        title: "No more dimming",
        body: "The tour used to grey out the screen and draw a ring around whatever it was describing. The ring landed in the wrong place often enough to be misleading, and its backdrop was painting over the explanation text, which is why that sometimes looked washed out. All of it is gone \u2014 the real screen, and the words explaining it.",
      },
      {
        title: "It still takes you there",
        body: "Each step still opens the screen it is about and scrolls the relevant part into view. That part always worked; it was only the box drawn on top that did not.",
      },
    ],
  },
  {
    version: "1.11.0",
    date: "August 2026",
    headline: "The free trial is Google's now, and Iron Log is a subscription.",
    items: [
      {
        title: "7 days free, properly",
        body: "The trial used to be a date stored on your phone, which meant reinstalling reset it. It is a Google Play free trial now \u2014 Play allows one per account and enforces it, so the trial is real for everyone rather than optional for anyone who knew the trick.",
      },
      {
        title: "Monthly or annual",
        body: "Pick either when you start the trial. The price shown is whatever Play quotes in your own currency, and you can change or cancel from Settings or from Google Play at any time.",
      },
      {
        title: "It still works in the basement",
        body: "Iron Log only needs to reach Play occasionally to confirm the subscription, and keeps working for two weeks between confirmations. No signal in your gym is not a reason to be locked out of your own workout.",
      },
      {
        title: "Your history is never held hostage",
        body: "Home, Settings and Backup stay open whether you are subscribed or not. Cancelling stops the app, it does not take your training log \u2014 you can always export it.",
      },
      {
        title: "Already bought it outright?",
        body: "Anyone who paid for the old one-time lifetime unlock keeps it, permanently. You will never be asked to subscribe.",
      },
    ],
  },
  {
    version: "1.10.0",
    date: "August 2026",
    headline: "The readiness map is an actual body now.",
    items: [
      {
        title: "A real anatomical figure",
        body: "The blocky mannequin is gone. Front and rear are drawn from a proper anatomical chart \u2014 sixty-four muscle bellies, so your lats, traps, delts and triceps sit where they actually sit rather than in a stack of rectangles.",
      },
      {
        title: "Groups still read as one thing",
        body: "A group made of several bellies \u2014 three lat segments a side, six trapezius segments, three calf heads \u2014 fills and taps as a single muscle, so nothing about reading the map or tapping it for detail has changed.",
      },
      {
        title: "The rest of the body is visible",
        body: "Head, hands, feet, knees and hips are drawn in grey rather than near-black, so the figure holds together against the dark background instead of floating in pieces.",
      },
    ],
  },
  {
    version: "1.9.0",
    date: "August 2026",
    headline: "A new programme to follow, one Squat instead of three, and a builder that lets you set the order.",
    items: [
      {
        title: "Project Arms",
        body: "A new preset: Upper, Lower, Arms, rest — twice through. Two dedicated arm sessions a week, direct forearm work in both, and grip work to finish. Pick it like any other split and change whatever you like before you start.",
      },
      {
        title: "One Squat, four ways to do it",
        body: "Back, Front and Hack Squat are a single Squat now, with which one you did picked per session like barbell or dumbbell anywhere else. A programme day can still name the variation it means \u2014 Project Arms asks for the hack \u2014 and the chart keeps them apart. Everything you had logged moved across, tagged with the variation.",
      },
      {
        title: "Three exercises came with it",
        body: "Hip Adduction, Eugene Curl and Reverse Eugene Curl are in the database now, so they are available to every programme and to the workout builder, not just this one. Both Eugene curls are filed under Forearms.",
      },
      {
        title: "Set the order of a day yourself",
        body: "Every exercise in the programme builder has up and down arrows. Preset days now keep the order they were written in too — no more finding a farmer's carry at the top of your arms day because the app decided compounds go first.",
      },
      {
        title: "Add an exercise without leaving the builder",
        body: "The add panel has two tabs: pick from the database, or create a new exercise there and then. Anything you create is saved to the database properly, so it turns up everywhere else as well.",
      },
    ],
  },
  {
    version: "1.8.0",
    date: "August 2026",
    headline: "Recovery windows now depend on the muscle and on how hard you trained it.",
    items: [
      {
        title: "Four windows per muscle, not one",
        body: "Every muscle now has its own figure for four cases: trained hard, trained with reps left, worked indirectly hard, worked indirectly with reps left. The lower back needs four days after a session to failure and a day and a quarter after catching indirect work with a buffer. Side delts need a day and a half at most.",
      },
      {
        title: "Your RIR decides which one applies",
        body: "0 or 1 reps left puts the muscle on its failure window; 2 or more puts it on the buffer window, and the difference is big — squats to failure need 84 hours where squats with reps left need 54. The hardest set of the session decides. Not logging effort reads as 2+, so nothing changes if you would rather not track it.",
      },
      {
        title: "Indirect work can be red now",
        body: "It used to be held at amber no matter what, on the theory that a synergist is never really wrecked. A hard bench genuinely does leave the triceps needing 30 hours, so the map says so instead of rounding it down. Every muscle has its own indirect windows rather than sharing one blanket fraction.",
      },
      {
        title: "The colours mean what they always did",
        body: "Green is ready, amber is less than a day to go, red is more than a day to go. Only the hours behind them have changed.",
      },
    ],
  },
  {
    version: "1.7.0",
    date: "August 2026",
    headline: "Change a programme you have already started, and stop ending workouts by accident.",
    items: [
      {
        title: "Edit the programme you are running",
        body: "Open Programme and tap any workout to see what is in it. Remove an exercise that is not working and add one that is — no need to scrap the programme and build it again. Changes apply from your next session; anything already logged stays exactly as you did it.",
      },
      {
        title: "Finishing takes two taps",
        body: "The Finish Workout button now sits at the end of the list instead of floating over it, and the first tap only arms it. Nothing is saved until you tap again, and it disarms itself after a few seconds.",
      },
      {
        title: "The superset panel follows you down the page",
        body: "Linking exercises means tapping ones that may be well down the list. The panel now floats above it, so Link and Cancel stay where you can reach them.",
      },
      {
        title: "Dips are one exercise again",
        body: "Assisted and weighted are how you load a dip, not different exercises, so they are a choice on the exercise like barbell or dumbbell anywhere else. Generated days now programme plain Dips and leave the loading to you. Anything you had logged as Assisted or Weighted Dips moved across, tagged with how it was done.",
      },
      {
        title: "Warm-up suggestions that make sense",
        body: "The ramp rounded to the nearest 5kg regardless of the lift, so a 5.7kg cable set was told to warm up with three sets of 5kg — heavier than the working set. Steps now scale with the weight, never reach the top set, and only appear on compounds, which is what the setting always said.",
      },
      {
        title: "Turn the tick boxes off",
        body: "Settings → Set Tick Boxes hides the box beside every set and warm-up if you would rather just type your numbers and move on. Nothing about what gets saved changes; the rest timer stops starting itself, so use Start Rest when you want it.",
      },
      {
        title: "Progress charts are filed by body part",
        body: "The list under the chart is grouped into muscle groups you open and close, instead of every exercise you have ever logged in one long run. The group holding the chart on screen opens itself.",
      },
    ],
  },
  {
    version: "1.6.0",
    date: "August 2026",
    headline: "A rebuilt exercise list, and every lift asks how you are doing it.",
    items: [
      {
        title: "The exercise list has been rewritten",
        body: "Sixty-six exercises across sixteen muscle groups, each one there because it earns its place. Near-duplicates that only differed by the bar in your hands have been folded into one entry, and the groups are ordered the way most people would pick them.",
      },
      {
        title: "Barbell, dumbbell, Smith or machine — your choice",
        body: "There is no longer a separate Barbell Bench Press and Dumbbell Bench Press. There is Bench Press, and a row of implements you tap, exactly like grip and machine brand. Thirty-two exercises offer the choice; the ones that only make sense one way do not ask.",
      },
      {
        title: "Programmes pick an implement and say so",
        body: "A generated day names the implement it has chosen, and you can change it on the spot. Your “last time” comparison follows it too — switch from barbell to dumbbell and the target switches to your last dumbbell session, not a number you cannot match.",
      },
      {
        title: "Lower Back and Shins are groups of their own",
        body: "Deadlifts and back extensions are Lower Back exercises rather than Back, and tibialis raises finally have somewhere to live. Both have their own region on the readiness map and their own recovery window.",
      },
      {
        title: "Four kinds of dip",
        body: "Dips, Assisted Dips and Weighted Dips sit under Chest; Seated Dips are filed under Triceps, where that version belongs.",
      },
      {
        title: "Everything you had logged came with it",
        body: "Old exercises were mapped onto their replacements, keeping the implement they implied — a Smith bench is now a Bench Press marked Smith Machine. History, PBs, 1RM goals, templates, programmes and your custom ordering all moved with them, merging rather than dropping where two entries became one.",
      },
    ],
  },
  {
    version: "1.5.0",
    date: "August 2026",
    headline: "Backups, effort tracking, and a straight answer about what your numbers mean.",
    items: [
      {
        title: "Front, side and rear delts are separate",
        body: "\u201cShoulders\u201d is gone. Overhead pressing and front raises are Front Delts; lateral raises and upright rows are Side Delts; face pulls and reverse flys stay Rear Delts. Each has its own place in the exercise order and its own region on the readiness map.",
      },
      {
        title: "They recover at their own rates",
        body: "Front delts take the heavy pressing, so they need 48 hours. Side and rear delts need 24. Lateral raises the day after an overhead press session no longer look like training a muscle that is still wrecked, because they are not the same muscle.",
      },
      {
        title: "Pressing shows where it actually lands",
        body: "Bench press now marks your front delts rather than your whole shoulder, and overhead pressing counts toward the side delts as indirect work.",
      },
      {
        title: "Your history came with it",
        body: "Everything already logged was moved to the right group by exercise, so past sessions, saved templates, programmes and your custom exercise order all still line up. Nothing to redo.",
      },
      {
        title: "Progress charts filter by machine",
        body: "Any exercise you have logged on more than one machine gets a dropdown beside its name. Pick a brand and the chart plots only that stack, so two gyms' weights stop being drawn as one jagged line.",
      },
      {
        title: "\u201cLast time\u201d matches the machine you are on",
        body: "Name the machine and the comparison switches to your last session on that one. If you have never used it, it says so rather than handing you a target set on a different stack \u2014 with the most recent session kept underneath for reference.",
      },
      {
        title: "Tag past sessions after the fact",
        body: "Editing a workout in your history now lets you add the machine and grip you used. Handy for filling in the sessions you logged before you started recording it.",
      },
      {
        title: "Back up everything to one file",
        body: "Settings \u2192 Backup writes your whole training history to your Downloads folder and tells you the exact filename and path \u2014 no more wondering where it went. The same screen restores it. Worth doing today: nothing is stored anywhere but this phone.",
      },
      {
        title: "Log how hard a set was",
        body: "Advanced Mode adds a blue circle to every set. One tap picks how many reps you had left \u2014 0 for failure, 3+ for stopping well short. Sets taken to failure now stretch that muscle's recovery on the readiness map, and easy ones shorten it.",
      },
      {
        title: "Charts that do not lie about progress",
        body: "Progress now plots estimated 1RM by default, so 100kg for 5 followed by 95kg for 10 reads as the improvement it is instead of a drop. Top-set weight and total volume are still a tap away.",
      },
      {
        title: "Notes, and a rest timer that starts itself",
        body: "Add a note to any exercise \u2014 seat height, how it felt \u2014 and it comes back next time you do it. Ticking a set off now starts the rest countdown on its own.",
      },
      {
        title: "Tape measurements",
        body: "Personal Info tracks chest, waist, hips, arms, thighs and calves alongside bodyweight, with the change since your first reading. The scale can sit still for months while these move.",
      },
      {
        title: "Simple or Advanced, asked up front",
        body: "New installs now choose between the two on the very first screen, next to a plain table of what the trial includes and what the one-off unlock keeps.",
      },
    ],
  },
  {
    version: "1.4.0",
    date: "August 2026",
    headline: "One rule for the readiness colours: amber always means ready tomorrow.",
    items: [
      {
        title: "Amber now means the same thing everywhere",
        body: "Green is ready. Amber is less than a day to go. Red is more than a day to go. Every muscle follows the same rule, so you no longer have to remember which ones use which thresholds — amber always means you can train it tomorrow.",
      },
      {
        title: "Quick-recovering muscles no longer show red",
        body: "Arms, side and rear delts, abs, calves and forearms need a day, so they are never more than a day from ready. They go straight to amber and clear from there.",
      },
      {
        title: "Indirect work always reads amber",
        body: "Muscles worked by a lift without being its target clear in half their window, and never sit longer than a day, so they can never show red on your behalf.",
      },
    ],
  },
  {
    version: "1.3.0",
    date: "August 2026",
    headline: "The readiness map now knows what your compound lifts do to everything else.",
    items: [
      {
        title: "Face pulls train your rear delts again",
        body: "Cable Face Pull and Rear Delt Cable Fly were filed under Shoulders, so doing them left the rear delts showing as fully recovered. They are Rear Delts exercises now, where they belong.",
      },
      {
        title: "Indirect work counts",
        body: "Bench press leaves your triceps and front delts tired even though it is a chest exercise. Muscles worked hard by a lift without being its target now go amber on the map — never red — and clear in half the usual time. Bench and your chest is red while your triceps sit amber.",
      },
      {
        title: "Traps and forearms are on the map",
        body: "Both were tracked but had nowhere to appear. They now have their own regions, which matters once deadlifts, rows, shrugs and hammer curls start counting toward them.",
      },
      {
        title: "Tap tells you which kind of work it was",
        body: "A muscle held back only by indirect work says so — \u201cworked indirectly 4h ago\u201d — so being told your triceps need rest after a chest day makes sense.",
      },
      {
        title: "Leg press no longer counts as a press",
        body: "It shared a movement label with bench and overhead press, which let it use up the cap on pressing movements in a generated full-body session.",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "August 2026",
    headline: "Muscle readiness now counts hours, and every muscle has its own recovery window.",
    items: [
      {
        title: "Recovery is measured in real hours",
        body: "Readiness was working off the date of a session rather than the time of it, so training at 8pm and coming back at midnight counted as a full day of recovery. It now counts the hours that have actually passed.",
      },
      {
        title: "Red, amber, green — per muscle",
        body: "Each muscle has its own two thresholds instead of one blended scale. Arms, side and rear delts, abs, calves and forearms clear in 24 hours; chest, front delts, back, traps and quads take 48; hamstrings and glutes take 72. Amber is the last stretch before ready.",
      },
      {
        title: "It tells you how long is left",
        body: "Tap any muscle for how long ago you trained it and how many hours until it is ready. The same countdown shows next to each muscle when you are picking what to train.",
      },
      {
        title: "The map updates while you watch it",
        body: "Readiness refreshes on its own, so a muscle turning green no longer waits for you to reopen the app.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "July 2026",
    headline: "A big clean-up pass, and the app finally looks the way it was designed.",
    items: [
      {
        title: "The right typeface, at last",
        body: "Iron Log always specified its condensed display font but never actually loaded it, so every phone substituted its own. The real thing now ships with the app and works offline.",
      },
      {
        title: "Smarter guided programmes",
        body: "Generated sessions used to make odd choices — a deadlift on an upper day, a pull day with nothing that pulls. Every day now follows a proper template: compounds first, isolation added only when you have the time for it.",
      },
      {
        title: "Your exercise order, respected",
        body: "The Exercise Database lists every variation in one ranking, so you can put Bench Press, Dips and Incline Press in whatever order you actually want. Auto-built workouts follow it.",
      },
      {
        title: "Sets show progress as you log",
        body: "Weight and reps outline green when you beat last time, red when you drop, grey when you match — no arithmetic mid-set.",
      },
      {
        title: "Supersets remembered",
        body: "Each exercise shows what it was supersetted with last time, and copying a past workout brings its pairings with it.",
      },
      {
        title: "A full-year consistency calendar",
        body: "A square for every day of the year, month by month, with arrows to step back through previous years.",
      },
      {
        title: "Programme Progress actually opens",
        body: "The Progress button on an active programme never worked — it does now, and Biggest Strength Gains no longer reports a loss just because a block ended on a deload.",
      },
      {
        title: "Easier on the eye",
        body: "Bigger small text, better contrast throughout, and a tidier Home screen and feature list.",
      },
    ],
  },
];

function releaseNotesFor(version) {
  return RELEASE_NOTES.find((r) => r.version === version) || null;
}

/* ---------------------------------------------------------------
   TOUR SAMPLE DATA

   On a fresh install the tour walks onto Progress Charts, Consistency,
   History and 1RM Goals and finds them all empty, so the steps explaining
   them have nothing to point at. This fills those screens with a worked
   example for the duration of the tour only.

   It works by answering reads, never writes. safeGet() below returns this
   sample for the handful of history keys while the tour is running;
   safeSet() is untouched, so nothing is ever persisted and the moment the
   tour ends the screens go back to the user's real (empty) data.
--------------------------------------------------------------- */

let TOUR_DEMO_ACTIVE = false;
function setTourDemoData(on) {
  TOUR_DEMO_ACTIVE = !!on;
}

const TOUR_DEMO_LIFTS = [
  { id: "bench-press", name: "Bench Press", muscle: "Chest", from: 60, step: 2.5 },
  { id: "squat", name: "Squat", muscle: "Quads", from: 80, step: 5 },
  { id: "bent-over-row", name: "Bent-Over Row", muscle: "Back", from: 50, step: 2.5 },
];

// Six months of training at three sessions a week. The volume matters: a
// handful of sessions left the consistency calendar looking almost empty on
// the very step that exists to show it off, and the history list too short
// to look like a real log.
const TOUR_DEMO = (() => {
  const pad = (n) => String(n).padStart(2, "0");
  const dayStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const sessions = [];
  const exHistory = {};
  const WEEKS = 26;
  const DAYS_IN_WEEK = [0, 2, 4]; // Mon/Wed/Fri, the shape of a real routine
  for (let w = WEEKS - 1; w >= 0; w--) {
    // A fortnight off partway through, so the calendar shows a real pattern
    // rather than a machine-perfect grid.
    if (w === 11 || w === 12) continue;
    for (const offset of DAYS_IN_WEEK) {
      const d = new Date();
      d.setHours(18, 0, 0, 0);
      d.setDate(d.getDate() - (w * 7 + (6 - offset)));
      if (d > new Date()) continue;
      const date = dayStr(d);
      const at = d.toISOString();
      // Load climbs over the block with a lighter week every seventh.
      const progress = (WEEKS - 1 - w) / 2;
      const step = (w % 7 === 0 ? progress - 2 : progress);
      const exercises = TOUR_DEMO_LIFTS.map((lift, idx) => {
        const weight = String(Math.max(lift.from, Math.round((lift.from + lift.step * step) / lift.step) * lift.step));
        const sets = [
          { weight, reps: "8" },
          { weight, reps: "8" },
          { weight, reps: "7" },
        ];
        (exHistory[lift.id] = exHistory[lift.id] || []).push({ date, at, sets, order: idx + 1, total: TOUR_DEMO_LIFTS.length });
        return { id: lift.id, name: lift.name, muscle: lift.muscle, sets };
      });
      sessions.push({ id: `tour-${date}`, date, at, split: "Full Body", exercises });
    }
  }
  sessions.sort((a, b) => (a.at < b.at ? -1 : 1));
  // Per-exercise history is capped at 20 elsewhere in the app, so match it.
  Object.keys(exHistory).forEach((k) => { exHistory[k] = exHistory[k].slice(-20); });
  const bodyweight = [];
  for (let w = 26; w >= 0; w--) {
    const d = new Date();
    d.setDate(d.getDate() - w * 7);
    bodyweight.push({ value: Math.round((78 - w * 0.12) * 10) / 10, unit: "kg", date: dayStr(d) });
  }
  const pbs = {};
  TOUR_DEMO_LIFTS.forEach((lift) => {
    const last = exHistory[lift.id][exHistory[lift.id].length - 1];
    pbs[lift.id] = { exerciseId: lift.id, name: lift.name, weight: last.sets[0].weight, reps: "8", date: last.date, bodyWeightPct: null };
  });
  // The 1RM screen lists six lifts, so the three that aren't in the sample
  // sessions still get a record — otherwise most of that screen reads
  // "no data yet" during the step explaining it. Pull-Ups and Dips are
  // tracked by reps, so theirs carry no weight.
  const lastDate = sessions[sessions.length - 1].date;
  const extraPBs = [
    ["overhead-press", "Overhead Press", "55", "6"],
    ["deadlift", "Deadlift", "140", "5"],
    ["pull-ups", "Pull-Ups", "", "12"],
    ["dips", "Dips", "", "15"],
  ];
  extraPBs.forEach(([id, name, weight, reps]) => {
    pbs[id] = { exerciseId: id, name, weight, reps, date: lastDate, bodyWeightPct: null };
  });
  const goalStart = new Date();
  goalStart.setDate(goalStart.getDate() - 28);
  const milestones = [];
  for (let wk = 1; wk <= 16; wk++) {
    const d = new Date(goalStart);
    d.setDate(d.getDate() + wk * 7);
    milestones.push({ week: wk, date: d.toISOString().slice(0, 10), value: Math.round((95 + (120 - 95) * (wk / 16)) / 2.5) * 2.5 });
  }
  return {
    sessions,
    exHistory,
    bodyweight,
    pbs,
    goals: {
      "barbell-bench-press": {
        exerciseId: "barbell-bench-press",
        current: 95,
        target: 120,
        level: "intermediate",
        weeks: 16,
        isBodyweight: false,
        createdAt: goalStart.toISOString(),
        milestones,
      },
    },
  };
})();

// Returns the sample value for a key the tour needs populated, or
// undefined to let the real read proceed.
function tourDemoValue(key) {
  if (!TOUR_DEMO_ACTIVE) return undefined;
  if (key === "workout-history") return TOUR_DEMO.sessions;
  if (key === "bodyweight-history") return TOUR_DEMO.bodyweight;
  if (key === "bodyweight") return TOUR_DEMO.bodyweight[TOUR_DEMO.bodyweight.length - 1];
  if (key === "weight-tracking") return { enabled: true, goal: 82, unit: "kg" };
  if (key === "1rm-goals") return TOUR_DEMO.goals;
  if (key.startsWith("ex-history:")) return TOUR_DEMO.exHistory[key.slice(11)] || [];
  if (key.startsWith("pb:")) return TOUR_DEMO.pbs[key.slice(3)] || null;
  return undefined;
}

// Reads try the most durable store first, then fall back. Writes go to every
// available backend so a value is never stranded in only one place.
async function safeGet(key) {
  const demo = tourDemoValue(key);
  if (demo !== undefined) return demo;
  const full = STORAGE_PREFIX + key;
  let raw = null;
  const prefs = capPrefs();
  if (prefs) {
    try {
      const r = await prefs.get({ key: full });
      if (r && r.value != null) raw = r.value;
    } catch (e) {
      raw = null;
    }
  }
  if (raw == null && hasWindowStorage()) {
    try {
      const r = await window.storage.get(full);
      if (r && r.value != null) raw = r.value;
    } catch (e) {
      raw = null;
    }
  }
  if (raw == null) raw = lsGet(key); // synchronous mirror (browser / WebView)
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
async function safeSet(key, val) {
  const full = STORAGE_PREFIX + key;
  const str = JSON.stringify(val);
  lsSet(key, str); // sync mirror first, so a value is saved even if async writes fail
  const prefs = capPrefs();
  if (prefs) {
    try {
      await prefs.set({ key: full, value: str });
    } catch (e) {
      console.error("preferences set failed", key, e);
    }
  }
  if (hasWindowStorage()) {
    try {
      await window.storage.set(full, str);
    } catch (e) {
      console.error("storage set failed", key, e);
    }
  }
}
async function safeList(prefix) {
  const full = STORAGE_PREFIX + prefix;
  const prefs = capPrefs();
  if (prefs) {
    try {
      const r = await prefs.keys();
      if (r && r.keys) return r.keys.filter((k) => k.startsWith(full)).map((k) => k.slice(STORAGE_PREFIX.length));
    } catch (e) {
      /* fall through */
    }
  }
  if (hasWindowStorage()) {
    try {
      const r = await window.storage.list(full);
      if (r && r.keys) return r.keys.map((k) => k.slice(STORAGE_PREFIX.length));
    } catch (e) {
      /* fall through */
    }
  }
  try {
    if (typeof localStorage !== "undefined") {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(full)) out.push(k.slice(STORAGE_PREFIX.length));
      }
      return out;
    }
  } catch (e) {
    /* ignore */
  }
  return [];
}
async function safeDelete(key) {
  const full = STORAGE_PREFIX + key;
  lsDelete(key);
  const prefs = capPrefs();
  if (prefs) {
    try {
      await prefs.remove({ key: full });
    } catch (e) {
      /* nothing to clean up */
    }
  }
  if (hasWindowStorage()) {
    try {
      await window.storage.delete(full);
    } catch (e) {
      /* nothing to clean up */
    }
  }
}

/* ---------------------------------------------------------------
   LICENSING — SUBSCRIPTION WITH A GOOGLE-RUN FREE TRIAL

   Iron Log is a free listing with one subscription behind it. The free
   trial is Google's, not ours: a base-plan offer configured in Play
   Console, which Play enforces at one per Google account, server-side.
   That is the whole reason for the subscription. A device-local trial
   timestamp — which is what this used to be — resets on reinstall, on
   "clear data", and on a rolled-back clock, and nothing short of a
   server can stop that. Play can, so Play does it.

   The price is deliberately NOT in this file. Play Console owns it, per
   country, and the paywall renders whatever the store hands back in the
   user's own currency. Changing what Iron Log costs is a Play Console
   edit and no app release at all.

   Billing plugin: capacitor-plugin-cdv-purchase (the maintained
   Capacitor build of cordova-plugin-purchase / "CdvPurchase", which is
   what Capacitor's own docs point at). Deliberately NOT RevenueCat: that
   needs an account, an API key, and routes every entitlement check
   through a third-party server, which is a strange dependency for an app
   whose pitch is that nothing leaves your phone.

   GOOGLE PLAY CONSOLE SETUP (by hand — the app cannot do this for you):
   1. Monetize -> Subscriptions -> create a subscription with product ID
      exactly "ironlog_pro" (must match SUBSCRIPTION_ID below).
   2. Add two base plans, auto-renewing, with IDs exactly "monthly" and
      "annual" (must match BASE_PLANS). Set a price for each; the annual
      one is the one worth making obviously good value.
   3. On each base plan add a FREE TRIAL offer of 7 days. Play allows one
      trial per Google account per subscription and enforces it itself —
      this is the bit that replaces the old local timestamp.
   4. Activate the subscription. The app must have been uploaded to at
      least an internal testing track before Play returns anything for it.
   5. Setup -> License testing: add your own account and any testers, so
      test subscriptions don't take real money.
--------------------------------------------------------------- */

const LICENSE_KEY = "license";
const SUBSCRIPTION_ID = "ironlog_pro";
const BASE_PLANS = { monthly: "monthly", annual: "annual" };

/* How long a confirmed subscription keeps working with no word from Play.

   This is not a grace period for people who stopped paying — Play tells us
   soon enough. It is for the gym in the basement with no signal, which is
   most of them. Entitlement is confirmed against Play whenever the app can
   reach it, and the answer is cached; between confirmations the app stays
   unlocked. Locking someone out of their own workout because the building
   has thick walls would be a far worse bug than a fortnight of unpaid use. */
const OFFLINE_GRACE_DAYS = 14;

// Build-time switch for copies that are given away rather than sold: the
// side-loaded debug APK and any self-hosted web build. Google Play Billing
// only serves apps Play itself installed, matching a package name and
// signature it knows, so a side-loaded build could never subscribe — it
// would simply lock itself with a button that cannot work. This makes those
// builds unlocked outright.
//
// Set by VITE_UNLOCKED=1 at build time. The release workflow never sets it,
// so the Play Store bundle keeps the paywall exactly as it is. Deliberately
// derived, never written to storage: an unlocked build must not leave an
// "entitled" record behind that would carry over if a paid build were later
// installed on top of it.
const UNLOCKED_BUILD = (() => {
  try {
    return import.meta.env && import.meta.env.VITE_UNLOCKED === "1";
  } catch (e) {
    return false;
  }
})();

// Resolved defensively, the same way capPrefs() resolves Preferences —
// true only inside a packaged Capacitor app, so billing code never runs
// (and never needs to work) during `npm run dev` in a plain browser.
function isNativeRuntime() {
  try {
    return !!(
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform()
    );
  } catch (e) {
    return false;
  }
}

/* Registers the PWA service worker, which is what lets an installed
   home-screen copy open with no signal.

   Deliberately not registered in the APK. Capacitor already serves the
   bundle from the device, so a cache in front of it buys nothing and can
   only pin someone to a stale build after an update. Also skipped when
   the page is not secure, since registration throws outside HTTPS and
   localhost.

   Failure here is never fatal: no worker means no offline launch, which
   is a worse app but still a working one. */
function registerServiceWorker() {
  if (isNativeRuntime()) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (typeof window !== "undefined" && !window.isSecureContext) return;
  // Relative, so it registers under whatever subdirectory the app is
  // served from and takes that path as its scope.
  navigator.serviceWorker.register("./sw.js").catch((e) => {
    console.warn("service worker registration failed", e);
  });
}

/* The cached answer to "is this person subscribed". Shape:
     { entitled: boolean, checkedAt: ISO string }
   `checkedAt` is only ever moved forward by a real reply from Play, so a
   rolled-back device clock can extend the offline window but never
   manufacture an entitlement that Play never gave. */
async function loadLicense() {
  const existing = await safeGet(LICENSE_KEY);
  if (existing && typeof existing.entitled === "boolean") return existing;
  // Anyone who bought the old one-time lifetime unlock keeps it, forever,
  // whatever Play later says about subscriptions. They paid for exactly
  // that and changing the business model is not their problem. The flag is
  // sticky from here on — see setLicenseEntitled.
  const lifetime = !!(existing && existing.purchased);
  const fresh = { entitled: lifetime, lifetime, checkedAt: null };
  await safeSet(LICENSE_KEY, fresh);
  return fresh;
}

async function setLicenseEntitled(entitled) {
  const current = (await safeGet(LICENSE_KEY)) || {};
  const lifetime = !!current.lifetime;
  const next = { entitled: lifetime || !!entitled, lifetime, checkedAt: new Date().toISOString() };
  await safeSet(LICENSE_KEY, next);
  return next;
}

// Days of offline grace still standing, for the banner on Home. Null when
// there is nothing to count down — not subscribed, or freshly confirmed.
function offlineGraceDaysLeft(license) {
  if (!license || license.lifetime || !license.entitled || !license.checkedAt) return null;
  const elapsed = (Date.now() - new Date(license.checkedAt).getTime()) / 86400000;
  if (elapsed < 1) return null;
  return Math.max(0, Math.ceil(OFFLINE_GRACE_DAYS - elapsed));
}

function isLicenseUnlocked(license) {
  if (UNLOCKED_BUILD) return true;
  if (!license) return false;
  // A lifetime buyer is never subject to the offline window either — there
  // is no subscription behind them for Play to have an opinion about.
  if (license.lifetime) return true;
  if (!license.entitled) return false;
  // Entitled and never yet confirmed against Play (the migrated one-time
  // buyers) stays unlocked; there is no check to have gone stale.
  if (!license.checkedAt) return true;
  const elapsed = (Date.now() - new Date(license.checkedAt).getTime()) / 86400000;
  return elapsed <= OFFLINE_GRACE_DAYS;
}

// Screens reachable without a subscription. Everything else redirects to
// the paywall — see setScreen() in App(). Kept as an allowlist (rather than
// a list of gated screens) so a future screen is locked-by-default.
// Home, Settings and the feature list stay open deliberately: someone has
// to be able to see what Iron Log is, and get at Backup to take their data
// with them, whether or not they are paying for it.
const ALLOWED_WHEN_LOCKED_SCREENS = new Set(["home", "settings", "paywall", "featureList"]);

// Dynamically imports the billing plugin — never at the top of the file —
// so a plain browser session (which never satisfies isNativeRuntime())
// never even attempts to load it. This is what keeps `npm run dev` and any
// non-Capacitor preview working with zero risk of a crash.
let billingModulePromise = null;
function loadBillingModule() {
  if (!isNativeRuntime()) return Promise.resolve(null);
  if (!billingModulePromise) {
    billingModulePromise = import("capacitor-plugin-cdv-purchase").catch((e) => {
      console.error("billing plugin unavailable", e);
      return null;
    });
  }
  return billingModulePromise;
}

// What the store currently says the two plans cost, in the user's own
// currency, so the paywall never has to guess. Null until receipts load.
let cachedOffers = null;

function readOffers(store) {
  try {
    const product = store.get(SUBSCRIPTION_ID);
    if (!product || !product.offers) return null;
    const out = {};
    for (const [key, planId] of Object.entries(BASE_PLANS)) {
      // An offer's id carries its base plan; the trial offer and the plain
      // offer share one, and either will quote the recurring price.
      const offer = product.offers.find((o) => String(o.id || "").includes(planId));
      if (!offer) continue;
      const phases = offer.pricingPhases || [];
      // The last phase is the one that recurs — earlier phases are the
      // free trial, priced at zero, which is not what to put on a button.
      const recurring = phases[phases.length - 1];
      const trial = phases.find((p) => p && Number(p.priceMicros) === 0);
      out[key] = {
        planId,
        price: recurring ? recurring.price : null,
        trialDays: trial ? isoPeriodToDays(trial.billingPeriod) : 0,
      };
    }
    return Object.keys(out).length ? out : null;
  } catch (e) {
    return null;
  }
}

// Play quotes trial lengths as ISO-8601 durations ("P7D", "P1W", "P1M").
function isoPeriodToDays(period) {
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(String(period || ""));
  if (!m) return 0;
  const [, y, mo, w, d] = m.map((x) => (x ? Number(x) : 0));
  return y * 365 + mo * 30 + w * 7 + d;
}

let billingInitialized = false;
/* Wires up the store once. onEntitlement fires with the current answer
   whenever Play gives one — right after a subscription starts, and also on
   every launch once receipts finish loading, so a reinstall or a new phone
   unlocks itself without anyone needing to tap "Restore".

   It fires with `false` too. That is the point: a lapsed or cancelled
   subscription has to be able to re-lock the app, which a purchase-only
   callback could never do. */
async function initBilling(onEntitlement, onOffers) {
  const mod = await loadBillingModule();
  if (!mod || billingInitialized) return;
  billingInitialized = true;
  try {
    const { store, ProductType, Platform } = mod;
    store.register([{ id: SUBSCRIPTION_ID, platform: Platform.GOOGLE_PLAY, type: ProductType.PAID_SUBSCRIPTION }]);
    const report = () => {
      // owned() covers the free-trial period as well as paid renewals —
      // Play treats a trial as an active subscription, which is exactly the
      // behaviour that made this worth moving to.
      onEntitlement(store.owned(SUBSCRIPTION_ID));
      const offers = readOffers(store);
      if (offers) {
        cachedOffers = offers;
        onOffers(offers);
      }
    };
    store
      .when()
      .approved((transaction) => transaction.verify())
      .verified((receipt) => {
        receipt.finish();
        report();
      })
      .receiptsReady(report)
      .productUpdated(report);
    await store.initialize([Platform.GOOGLE_PLAY]);
  } catch (e) {
    console.error("billing init failed", e);
  }
}

// Starts the Play purchase sheet for one base plan. Play itself decides
// whether this account gets the free trial — it will not hand out a second
// one, which is the enforcement we came here for.
async function subscribe(planKey) {
  const mod = await loadBillingModule();
  if (!mod) return { ok: false };
  try {
    const product = mod.store.get(SUBSCRIPTION_ID);
    if (!product) return { ok: false };
    const planId = BASE_PLANS[planKey];
    const offers = product.offers || [];
    // Prefer an offer carrying a free trial, so a first-time subscriber
    // gets the trial rather than being charged immediately.
    const forPlan = offers.filter((o) => String(o.id || "").includes(planId));
    const offer =
      forPlan.find((o) => (o.pricingPhases || []).some((p) => Number(p.priceMicros) === 0)) ||
      forPlan[0] ||
      (product.getOffer && product.getOffer());
    if (!offer) return { ok: false };
    await offer.order();
    return { ok: true };
  } catch (e) {
    console.error("subscribe failed", e);
    return { ok: false };
  }
}

async function restorePurchases() {
  const mod = await loadBillingModule();
  if (!mod) return false;
  try {
    await mod.store.restorePurchases();
    return true;
  } catch (e) {
    console.error("restore failed", e);
    return false;
  }
}

/* The Android applicationId, which Play needs in order to resolve the
   subscription management deep link below.

   It is set by `npx cap init` in .github/workflows/android.yml, and the two
   have to agree — Play matches on it, and a mismatch sends the user to a
   page for an app that does not exist. It cannot be changed once an app has
   been created in Play Console, so treat it as fixed. */
const ANDROID_PACKAGE = "com.iron_log_workout_tracker";

/* A YouTube search for how to perform a lift, rather than a curated video id.

   Three reasons it is a search and not a fixed link. A search never rots,
   where a specific video gets deleted or made private and leaves a dead
   button in the app. There is nothing to license, attribute or ship. And
   most importantly it follows the implement: barbell, dumbbell and Smith
   machine bench are genuinely different movements, so a single video per
   exercise id would be the wrong video for whichever one the lifter
   actually picked today. */
function formVideoUrl(name, method) {
  // "Barbell" and the like read as noise on an exercise that is only ever
  // done one way, but the database only lists a method when there is a
  // real choice, so anything present here is worth searching for.
  const query = [method, name, "form"].filter(Boolean).join(" ");
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Deep link to Play's own subscription management, which is where Google
// requires cancellation to be handled. An app that hides this gets rejected.
function manageSubscriptionUrl() {
  return `https://play.google.com/store/account/subscriptions?sku=${SUBSCRIPTION_ID}&package=${ANDROID_PACKAGE}`;
}

/* ---------------------------------------------------------------
   REPS IN RESERVE

   Weight and reps alone cannot tell a set taken to failure from one that
   stopped four short, and those two cost wildly different amounts of
   recovery. RIR is the cheapest way to capture that: one tap, four
   choices, logged per set.

   It feeds the readiness map. A muscle trained to failure genuinely needs
   longer than one worked comfortably, so the session's hardest set picks
   which recovery window that muscle is on — see RECOVERY_WINDOWS, where
   every muscle has one figure for failure work and one for work with a
   buffer.
--------------------------------------------------------------- */

const RIR_OPTIONS = [
  { value: 0, label: "0", desc: "To failure" },
  { value: 1, label: "1", desc: "1 left" },
  { value: 2, label: "2", desc: "2 left" },
  { value: 3, label: "3+", desc: "3 or more left" },
];

// The lowest RIR logged across an exercise's sets, or null if none were.
// The hardest set is what sets the recovery cost, not an average — one
// all-out set among five easy ones still has to be paid for.
function hardestRir(sets) {
  let lowest = null;
  for (const set of sets || []) {
    if (set && set.rir !== null && set.rir !== undefined && set.rir !== "") {
      const v = Number(set.rir);
      if (Number.isFinite(v) && (lowest === null || v < lowest)) lowest = v;
    }
  }
  return lowest;
}

// Which pair of columns in RECOVERY_WINDOWS applies. Unlogged effort reads
// as 2+ RIR: Simple Mode never asks, so assuming failure there would leave
// half the map red for people who never opted into tracking it.
function wasHardEffort(sets) {
  const rir = hardestRir(sets);
  return rir !== null && rir <= 1;
}

/* ---------------------------------------------------------------
   BACKUP

   The app keeps everything on the device and talks to no server, which
   makes a lost or wiped phone the one way to lose years of training. So
   there has to be a file the user can copy somewhere else.

   Landing it in a folder they can actually find matters as much as
   writing it: "Saved!" with no path is the complaint this replaces. Each
   target below is attempted in turn and the one that worked is reported
   back by name and full path.
--------------------------------------------------------------- */

const BACKUP_FORMAT = 1;

function backupFilename(now) {
  const d = now || new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `iron-log-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

// Everything under the app's storage prefix, so a key added later is
// included without anyone remembering to add it to a list here.
async function collectBackup() {
  const keys = await safeList("");
  const data = {};
  for (const key of keys) {
    const value = await safeGet(key);
    if (value !== null && value !== undefined) data[key] = value;
  }
  return {
    format: BACKUP_FORMAT,
    app: "Iron Log",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

function isBackupFile(parsed) {
  return !!(parsed && parsed.data && typeof parsed.data === "object" && parsed.format === BACKUP_FORMAT);
}

// Replaces rather than merges: a half-restored account with today's
// history and last year's programme would be worse than either.
async function restoreBackup(parsed) {
  if (!isBackupFile(parsed)) throw new Error("That file is not an Iron Log backup.");
  const existing = await safeList("");
  for (const key of existing) await safeDelete(key);
  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) await safeSet(key, value);
  return entries.length;
}

// Android's public folders moved behind scoped storage, and which ones a
// given phone will accept varies by version, so try the most useful first
// and fall back rather than failing outright. Whatever succeeds is named
// exactly, since the point is for the user to be able to find the file.
const BACKUP_TARGETS = [
  { directory: "EXTERNAL_STORAGE", prefix: "Download/", label: "Downloads" },
  { directory: "DOCUMENTS", prefix: "", label: "Documents" },
  { directory: "EXTERNAL", prefix: "", label: "the app's storage folder" },
  { directory: "DATA", prefix: "", label: "the app's private folder" },
];

function capPlugin(name) {
  try {
    const C = typeof window !== "undefined" ? window.Capacitor : null;
    return C && C.Plugins && C.Plugins[name] ? C.Plugins[name] : null;
  } catch (e) {
    return null;
  }
}

// Returns { label, path } naming where the file actually landed.
async function writeBackupFile(filename, text) {
  const Filesystem = capPlugin("Filesystem");
  if (Filesystem) {
    let lastError = null;
    for (const target of BACKUP_TARGETS) {
      try {
        const res = await Filesystem.writeFile({
          path: target.prefix + filename,
          data: text,
          directory: target.directory,
          encoding: "utf8",
          recursive: true,
        });
        return { label: target.label, path: (res && res.uri) || target.prefix + filename };
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("Could not write the backup file.");
  }

  // Browser and PWA: a real download, which lands in the browser's own
  // downloads folder.
  if (typeof document === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) {
    throw new Error("This build cannot save files.");
  }
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return { label: "Downloads", path: filename };
}

/* ---------------------------------------------------------------
   SCHEMA VERSIONING / MIGRATIONS
   Every persisted key lives in durable storage (Capacitor Preferences on
   device — see capPrefs() above — which survives app updates/reinstalls
   of the same app, so this is the store an update can never wipe).
   "schema-version" tracks how many migrations have run. On launch,
   runMigrations() replays whichever migrations haven't executed yet, in
   order, so old data is upgraded in place instead of erased when a new
   version ships.

   Rules for every migration function:
   - Additive/normalizing only — add or default a field, never delete or
     overwrite an existing user record.
   - If it can't safely apply (unexpected shape, missing dependency), do
     nothing rather than guess and risk data loss.
   - Idempotent — safe to run more than once, since a partially-applied
     migration could in principle be retried after a failure.

   To ship a new migration: append one function to MIGRATIONS below.
   Nothing else needs to change — its version number is just its index.
--------------------------------------------------------------- */

const MIGRATIONS = [
  // v0 -> v1: introduce the on-device license/trial record. Only creates
  // it if missing; never touches an existing trialStartedAt or purchased
  // flag, so replaying this (or upgrading again later) can't reset a
  // user's trial or silently un-purchase the app.
  async function migrateAddLicense() {
    const existing = await safeGet(LICENSE_KEY);
    if (!existing) {
      await safeSet(LICENSE_KEY, { trialStartedAt: new Date().toISOString(), purchased: false });
    }
  },
  // v1 -> v2: "Shoulders" split into "Front Delts" and "Side Delts".
  // Stored data records the muscle name on every logged exercise, on
  // programme days, on templates and as the key of the custom exercise
  // order, so all of it has to move or those entries stop matching any
  // muscle the app knows about — invisible in readiness, absent from the
  // volume screen. Exercise instances remap by id, which is exact; only
  // things with no id to look up need a default, and that is Front Delts,
  // where the pressing movements went.
  async function migrateSplitShoulders() {
    const OLD = "Shoulders";
    const SPLIT_INTO = ["Front Delts", "Side Delts"];
    const FALLBACK = "Front Delts";

    const muscleOfId = {};
    for (const [muscle, list] of Object.entries(EXERCISES)) {
      for (const e of list) if (!muscleOfId[e.id]) muscleOfId[e.id] = muscle;
    }
    const fixExercise = (ex) =>
      ex && ex.muscle === OLD ? { ...ex, muscle: muscleOfId[ex.id] || FALLBACK } : ex;
    const fixExercises = (list) => (Array.isArray(list) ? list.map(fixExercise) : list);
    const fixMuscleList = (list) =>
      Array.isArray(list) && list.includes(OLD)
        ? [...new Set(list.flatMap((m) => (m === OLD ? SPLIT_INTO : [m])))]
        : list;
    const fixProgramme = (prog) =>
      prog && Array.isArray(prog.days)
        ? { ...prog, days: prog.days.map((d) => ({ ...d, muscles: fixMuscleList(d.muscles), exercises: fixExercises(d.exercises) })) }
        : prog;

    const history = await safeGet("workout-history");
    if (Array.isArray(history)) {
      await safeSet("workout-history", history.map((sn) => ({ ...sn, exercises: fixExercises(sn.exercises) })));
    }

    const templates = await safeGet("templates");
    if (Array.isArray(templates)) {
      await safeSet(
        "templates",
        templates.map((t) => {
          const next = { ...t, exercises: fixExercises(t.exercises) };
          // A "tap" template stores a count per muscle. One count cannot be
          // split across two groups without inventing a number, so it goes
          // to the group that kept the compound presses.
          if (next.selection && next.selection[OLD] !== undefined) {
            const { [OLD]: count, ...rest } = next.selection;
            next.selection = { ...rest, [FALLBACK]: (rest[FALLBACK] || 0) + count };
          }
          return next;
        }),
      );
    }

    const active = await safeGet("active-programme");
    if (active) await safeSet("active-programme", fixProgramme(active));

    const finished = await safeGet("finished-programmes");
    if (Array.isArray(finished)) await safeSet("finished-programmes", finished.map(fixProgramme));

    const snapshot = await safeGet("in-progress-workout");
    if (snapshot && Array.isArray(snapshot.exercises)) {
      await safeSet("in-progress-workout", { ...snapshot, exercises: fixExercises(snapshot.exercises) });
    }

    const custom = await safeGet("custom-exercises");
    if (Array.isArray(custom)) {
      await safeSet("custom-exercises", custom.map((e) => (e.muscle === OLD ? { ...e, muscle: FALLBACK } : e)));
    }

    // The saved ordering is keyed by muscle. Deal the old list out to
    // whichever group each exercise now belongs to, keeping relative order,
    // so a ranking someone set by hand survives the split.
    const order = await safeGet("exercise-order");
    if (order && Array.isArray(order[OLD])) {
      const { [OLD]: ids, ...rest } = order;
      const next = { ...rest };
      for (const id of ids) {
        const muscle = muscleOfId[id] || FALLBACK;
        next[muscle] = [...(next[muscle] || []), id];
      }
      await safeSet("exercise-order", next);
    }
  },
  // v2 -> v3: the database was rebuilt around one entry per movement, with
  // the implement (barbell, dumbbell, Smith, machine, cable) recorded per
  // session instead of a separate exercise for each. Every id below is one
  // the old database had and the new one does not.
  //
  // Each maps to [newId, impliedMethod]. Where the old name said how the
  // lift was loaded, that becomes the method on the migrated entry, so a
  // Smith bench press stays a Smith bench press rather than silently
  // becoming a barbell one. Exercises dropped entirely map to their nearest
  // surviving movement — a Zercher squat becomes a front squat — because a
  // logged session pointing at an id the app no longer knows shows up as a
  // nameless row that nothing can chart.
  async function migrateRebuildExerciseDatabase() {
    const MAP = {
  "ab-wheel-rollout": ["ab-wheel", null],
  "arnold-press": ["overhead-press", "Dumbbell"],
  "barbell-bench-press": ["bench-press", "Barbell"],
  "barbell-curl": ["cable-curl", null],
  "barbell-hip-thrust": ["hip-thrust", "Barbell"],
  "barbell-lunge": ["lunge", "Barbell"],
  "barbell-ohp": ["overhead-press", "Barbell"],
  "barbell-overhead-extension": ["overhead-extension", "EZ Bar"],
  "barbell-reverse-curl": ["reverse-curl", "Barbell"],
  "barbell-reverse-wrist-curl": ["reverse-wrist-curl", "Barbell"],
  "barbell-row": ["bent-over-row", "Barbell"],
  "barbell-shrug": ["shrug", "Barbell"],
  "barbell-skullcrusher": ["skull-crusher", "Barbell"],
  "barbell-upright-row": ["upright-row", "Barbell"],
  "barbell-wrist-curl": ["wrist-curl", "Barbell"],
  "bench-dip": ["seated-dips", null],
  "bicycle-crunch": ["wood-chop", null],
  "box-squat": ["squat", "Back"],
  "cable-crossover": ["cable-fly", null],
  "cable-face-pull": ["face-pull", null],
  "cable-front-raise": ["front-raise", "Cable"],
  "cable-hip-abduction": ["hip-abduction", "Cable"],
  "cable-lateral-raise": ["lateral-raise", "Cable"],
  "cable-overhead-extension": ["overhead-extension", "Cable"],
  "cable-pull-through": ["romanian-deadlift", null],
  "cable-pullover": ["pullover", "Cable"],
  "cable-pushdown": ["pushdown", null],
  "cable-reverse-fly": ["reverse-fly", "Cable"],
  "cable-rope-hammer-curl": ["hammer-curl", "Cable"],
  "cable-shrug": ["shrug", "Cable"],
  "cable-upright-row": ["upright-row", "Cable"],
  "concentration-curl": ["preacher-curl", "Dumbbell"],
  "curtsy-lunge": ["reverse-lunge", "Dumbbell"],
  "db-bench-press": ["bench-press", "Dumbbell"],
  "db-chest-supported-row": ["chest-supported-row", "Dumbbell"],
  "db-curl": ["cable-curl", null],
  "db-fly": ["cable-fly", null],
  "db-front-raise": ["front-raise", "Dumbbell"],
  "db-glute-bridge": ["hip-thrust", "Dumbbell"],
  "db-lateral-raise": ["lateral-raise", "Dumbbell"],
  "db-ohp": ["overhead-press", "Dumbbell"],
  "db-overhead-extension": ["overhead-extension", "Dumbbell"],
  "db-reverse-fly": ["reverse-fly", "Dumbbell"],
  "db-reverse-wrist-curl": ["reverse-wrist-curl", "Dumbbell"],
  "db-romanian-deadlift": ["romanian-deadlift", "Dumbbell"],
  "db-shrug": ["shrug", "Dumbbell"],
  "db-skullcrusher": ["skull-crusher", "Dumbbell"],
  "db-step-up": ["lunge", "Dumbbell"],
  "db-tricep-kickback": ["pushdown", null],
  "db-wrist-curl": ["wrist-curl", "Dumbbell"],
  "dead-bug": ["plank", null],
  "decline-barbell-bench-press": ["bench-press", "Barbell"],
  "decline-db-bench-press": ["bench-press", "Dumbbell"],
  "decline-sit-up": ["reverse-crunch", null],
  "diamond-push-up": ["close-grip-bench", null],
  "donkey-calf-raise": ["standing-calf-raise", "Machine"],
  "drag-curl": ["cable-curl", null],
  "dumbbell-pullover": ["pullover", "Dumbbell"],
  "ez-bar-curl": ["preacher-curl", "EZ Bar"],
  "ez-skullcrusher": ["skull-crusher", "EZ Bar"],
  "farmer-carry": ["farmers-carry", "Kettlebell"],
  "floor-press": ["bench-press", null],
  "french-press": ["skull-crusher", "EZ Bar"],
  "frog-pump": ["hip-thrust", null],
  "goblet-squat": ["squat", "Front"],
  "hip-abduction-machine": ["hip-abduction", "Machine"],
  "incline-barbell-press": ["incline-press", "Barbell"],
  "incline-cable-fly": ["cable-fly", null],
  "incline-db-curl": ["incline-curl", "Dumbbell"],
  "incline-db-press": ["incline-press", "Dumbbell"],
  "incline-db-reverse-fly": ["reverse-fly", "Dumbbell"],
  "inverted-row": ["bent-over-row", null],
  "landmine-press": ["overhead-press", null],
  "landmine-row": ["bent-over-row", "Barbell"],
  "leg-press-calf-raise": ["standing-calf-raise", "Machine"],
  "machine-chest-press": ["bench-press", "Machine"],
  "machine-crunch": ["cable-crunch", null],
  "machine-lateral-raise": ["lateral-raise", "Machine"],
  "machine-reverse-fly": ["reverse-fly", "Machine"],
  "machine-row": ["chest-supported-row", "Machine"],
  "machine-shoulder-press": ["overhead-press", "Machine"],
  "meadows-row": ["bent-over-row", "Barbell"],
  "mountain-climbers": ["plank", null],
  "pallof-press": ["wood-chop", null],
  "pendlay-row": ["bent-over-row", "Barbell"],
  "plate-pinch-hold": ["plate-pinch", null],
  "rack-pull": ["deadlift", null],
  "rear-delt-cable-fly": ["reverse-fly", "Cable"],
  "renegade-row": ["bent-over-row", null],
  "russian-twist": ["wood-chop", null],
  "side-plank": ["plank", null],
  "single-arm-cable-pushdown": ["pushdown", null],
  "single-leg-calf-raise": ["standing-calf-raise", null],
  "single-leg-romanian-deadlift": ["romanian-deadlift", null],
  "sissy-squat": ["leg-extension", null],
  "sit-up": ["reverse-crunch", null],
  "smith-bench-press": ["bench-press", "Smith Machine"],
  "smith-calf-raise": ["standing-calf-raise", "Smith Machine"],
  "smith-close-grip-bench": ["close-grip-bench", "Smith Machine"],
  "smith-hip-thrust": ["hip-thrust", "Smith Machine"],
  "smith-incline-bench-press": ["incline-press", "Smith Machine"],
  "smith-lunge": ["lunge", "Smith Machine"],
  "smith-ohp": ["overhead-press", "Smith Machine"],
  "smith-romanian-deadlift": ["romanian-deadlift", "Smith Machine"],
  "smith-row": ["bent-over-row", "Smith Machine"],
  "smith-shrug": ["shrug", "Smith Machine"],
  "smith-squat": ["squat", "Smith Machine"],
  "smith-upright-row": ["upright-row", "Smith Machine"],
  "spider-curl": ["preacher-curl", "Dumbbell"],
  "stability-ball-leg-curl": ["leg-curl", null],
  "t-bar-row": ["bent-over-row", "Barbell"],
  "tate-press": ["skull-crusher", "Dumbbell"],
  "v-up": ["reverse-crunch", null],
  "walking-lunge": ["lunge", "Dumbbell"],
  "wrist-roller": ["wrist-curl", null],
  "zercher-squat": ["squat", "Front"],
  "zottman-curl": ["reverse-curl", "Dumbbell"],
    };
    const remapId = (id) => (MAP[id] ? MAP[id][0] : id);

    const fixExercise = (ex) => {
      if (!ex || !ex.id) return ex;
      const mapped = MAP[ex.id];
      const newId = mapped ? mapped[0] : ex.id;
      const method = mapped ? mapped[1] : null;
      const known = ALL_EXERCISES_BY_ID[newId];
      // An id that survived the rebuild untouched can still have moved group —
      // deadlifts are a Lower Back exercise now — so anything the database
      // still recognises gets refreshed, mapped or not. Custom exercises load
      // after migrations, so they are unknown here and pass through unchanged.
      if (!mapped && !known) return ex;
      const next = { ...ex, id: newId };
      if (known) {
        next.name = known.name;
        next.type = known.type;
      }
      const muscle = muscleOfExerciseId(newId);
      if (muscle) next.muscle = muscle;
      if (method && !next.method && methodsFor(newId).length > 1) next.method = method;
      return next;
    };

    // Collapsing variants can leave the same exercise twice in one session.
    // Merge rather than drop: both sets were really done.
    const fixExercises = (list) => {
      if (!Array.isArray(list)) return list;
      const out = [];
      const byId = new Map();
      for (const ex of list.map(fixExercise)) {
        const seen = byId.get(ex.id);
        // Only merge when the implement matches, or a barbell bench and a
        // dumbbell bench done in the same session would become one row.
        if (seen && (seen.method || "") === (ex.method || "")) {
          seen.sets = [...(seen.sets || []), ...(ex.sets || [])];
          continue;
        }
        byId.set(ex.id, ex);
        out.push(ex);
      }
      return out;
    };

    const history = await safeGet("workout-history");
    if (Array.isArray(history)) {
      await safeSet("workout-history", history.map((s) => ({ ...s, exercises: fixExercises(s.exercises) })));
    }

    // Per-exercise history is keyed by id, so entries have to be moved to
    // the new key and merged with anything already there, oldest first.
    const oldKeys = await safeList("ex-history:");
    const merged = {};
    for (const key of oldKeys) {
      const id = key.slice("ex-history:".length);
      const rows = (await safeGet(key)) || [];
      const target = remapId(id);
      const method = MAP[id] ? MAP[id][1] : null;
      const tagged = rows.map((r) => (method && !r.method ? { ...r, method } : r));
      merged[target] = [...(merged[target] || []), ...tagged];
      if (target !== id) await safeDelete(key);
    }
    for (const [id, rows] of Object.entries(merged)) {
      const sorted = sortByAt(rows).slice(-20);
      await safeSet(`ex-history:${id}`, sorted);
    }

    // PBs, manual 1RMs and goals are all keyed by exercise id.
    for (const prefix of ["pb:", "manual-1rm:"]) {
      for (const key of await safeList(prefix)) {
        const id = key.slice(prefix.length);
        const target = remapId(id);
        if (target === id) continue;
        const value = await safeGet(key);
        await safeDelete(key);
        if (value && !(await safeGet(prefix + target))) {
          await safeSet(prefix + target, value.exerciseId ? { ...value, exerciseId: target } : value);
        }
      }
    }
    const goals = await safeGet("1rm-goals");
    if (goals && typeof goals === "object") {
      const next = {};
      for (const [id, v] of Object.entries(goals)) {
        const target = remapId(id);
        // A goal repeats its own id inside the record, so moving the key
        // alone would leave the two disagreeing.
        next[target] = v && v.exerciseId ? { ...v, exerciseId: target } : v;
      }
      await safeSet("1rm-goals", next);
    }

    const templates = await safeGet("templates");
    if (Array.isArray(templates)) {
      await safeSet("templates", templates.map((t) => ({ ...t, exercises: fixExercises(t.exercises) })));
    }

    const fixProgramme = (p) =>
      p && Array.isArray(p.days)
        ? { ...p, days: p.days.map((d) => ({ ...d, exercises: fixExercises(d.exercises), muscles: fixMuscleList(d.muscles) })) }
        : p;
    // Deadlifts moving to Lower Back means a day that programmed them needs
    // the group in its list or the day no longer claims to train it.
    const fixMuscleList = (list) => {
      if (!Array.isArray(list)) return list;
      return [...new Set(list.map((m) => (m === "Shoulders" ? "Front Delts" : m)))];
    };
    const active = await safeGet("active-programme");
    if (active) await safeSet("active-programme", fixProgramme(active));
    const finished = await safeGet("finished-programmes");
    if (Array.isArray(finished)) await safeSet("finished-programmes", finished.map(fixProgramme));

    const snapshot = await safeGet("in-progress-workout");
    if (snapshot && Array.isArray(snapshot.exercises)) {
      await safeSet("in-progress-workout", { ...snapshot, exercises: fixExercises(snapshot.exercises) });
    }

    // Id lists: remap, drop anything that collapsed onto an id already there,
    // and move an id whose group changed into the list it now belongs to —
    // a rank filed under Back does nothing for an exercise that is Lower Back.
    const order = await safeGet("exercise-order");
    if (order && typeof order === "object") {
      const next = {};
      const seen = {};
      const push = (muscle, id) => {
        seen[muscle] = seen[muscle] || new Set();
        if (seen[muscle].has(id)) return;
        seen[muscle].add(id);
        next[muscle].push(id);
      };
      for (const [muscle, ids] of Object.entries(order)) {
        if (!Array.isArray(ids)) continue;
        next[muscle] = next[muscle] || [];
        for (const id of ids.map(remapId)) {
          // Anything the database no longer knows — a custom exercise, say —
          // stays under its original group rather than being thrown away.
          const home = muscleOfExerciseId(id) || muscle;
          next[home] = next[home] || [];
          push(home, id);
        }
      }
      await safeSet("exercise-order", next);
    }
    for (const key of ["hidden-exercises", "paused-exercises"]) {
      const list = await safeGet(key);
      if (Array.isArray(list)) await safeSet(key, [...new Set(list.map(remapId))]);
    }
  },

  // v3 -> v4: Assisted Dips and Weighted Dips fold into Dips, with how you
  // load them becoming a choice on the exercise. Generated days were
  // programming "Assisted Dips" outright, which is not something a
  // programme should decide for you.
  async () => {
    const MAP = {
      "assisted-dips": ["dips", "Assisted"],
      "weighted-dips": ["dips", "Weighted"],
    };
    const remapId = (id) => (MAP[id] ? MAP[id][0] : id);

    const fixExercise = (ex) => {
      if (!ex || !MAP[ex.id]) return ex;
      const [newId, method] = MAP[ex.id];
      const known = ALL_EXERCISES_BY_ID[newId];
      const next = { ...ex, id: newId };
      if (known) next.name = known.name;
      if (!next.method) next.method = method;
      return next;
    };
    // Two of the three in one session is unlikely but was legal, and they
    // are different loadings of the same movement, so keep both rows.
    const fixExercises = (list) => (Array.isArray(list) ? list.map(fixExercise) : list);

    const history = await safeGet("workout-history");
    if (Array.isArray(history)) {
      await safeSet("workout-history", history.map((s) => ({ ...s, exercises: fixExercises(s.exercises) })));
    }

    const merged = {};
    for (const key of await safeList("ex-history:")) {
      const id = key.slice("ex-history:".length);
      const target = remapId(id);
      const method = MAP[id] ? MAP[id][1] : null;
      const rows = (await safeGet(key)) || [];
      merged[target] = [...(merged[target] || []), ...rows.map((r) => (method && !r.method ? { ...r, method } : r))];
      if (target !== id) await safeDelete(key);
    }
    for (const [id, rows] of Object.entries(merged)) {
      if (id === "dips") await safeSet(`ex-history:${id}`, sortByAt(rows).slice(-20));
    }

    // The bodyweight and weighted versions set records on different scales,
    // so the surviving PB is whichever is already on the plain id — the
    // variants' records would read as regressions against it.
    for (const prefix of ["pb:", "manual-1rm:"]) {
      for (const key of await safeList(prefix)) {
        const id = key.slice(prefix.length);
        if (!MAP[id]) continue;
        const value = await safeGet(key);
        await safeDelete(key);
        const target = prefix + remapId(id);
        if (value && !(await safeGet(target))) {
          await safeSet(target, value.exerciseId ? { ...value, exerciseId: remapId(id) } : value);
        }
      }
    }
    const goals = await safeGet("1rm-goals");
    if (goals && typeof goals === "object") {
      const next = {};
      for (const [id, v] of Object.entries(goals)) {
        const target = remapId(id);
        if (target !== id && next[target]) continue;
        next[target] = v && v.exerciseId ? { ...v, exerciseId: target } : v;
      }
      await safeSet("1rm-goals", next);
    }

    const templates = await safeGet("templates");
    if (Array.isArray(templates)) {
      await safeSet("templates", templates.map((t) => ({ ...t, exercises: fixExercises(t.exercises) })));
    }
    const fixProgramme = (p) =>
      p && Array.isArray(p.days) ? { ...p, days: p.days.map((d) => ({ ...d, exercises: fixExercises(d.exercises) })) } : p;
    const active = await safeGet("active-programme");
    if (active) await safeSet("active-programme", fixProgramme(active));
    const finished = await safeGet("finished-programmes");
    if (Array.isArray(finished)) await safeSet("finished-programmes", finished.map(fixProgramme));

    const snapshot = await safeGet("in-progress-workout");
    if (snapshot && Array.isArray(snapshot.exercises)) {
      await safeSet("in-progress-workout", { ...snapshot, exercises: fixExercises(snapshot.exercises) });
    }

    const order = await safeGet("exercise-order");
    if (order && typeof order === "object") {
      const next = {};
      for (const [muscle, ids] of Object.entries(order)) {
        if (!Array.isArray(ids)) continue;
        next[muscle] = [...new Set(ids.map(remapId))];
      }
      await safeSet("exercise-order", next);
    }
    for (const key of ["hidden-exercises", "paused-exercises"]) {
      const list = await safeGet(key);
      if (Array.isArray(list)) await safeSet(key, [...new Set(list.map(remapId))]);
    }
  },

  // v4 -> v5: Back, Front and Hack Squat fold into one Squat, with which one
  // you did chosen per session. Same argument as the dips: it is one movement
  // pattern loaded three ways, and a programme should not decide which bar
  // you walk up to on the day.
  async () => {
    const MAP = {
      "back-squat": ["squat", "Back"],
      "front-squat": ["squat", "Front"],
      "hack-squat": ["squat", "Hack"],
    };
    const remapId = (id) => (MAP[id] ? MAP[id][0] : id);

    const fixExercise = (ex) => {
      if (!ex || !MAP[ex.id]) return ex;
      const [newId, method] = MAP[ex.id];
      const known = ALL_EXERCISES_BY_ID[newId];
      const next = { ...ex, id: newId };
      if (known) next.name = known.name;
      if (!next.method) next.method = method;
      return next;
    };
    // Two squat variations in one session is a real thing to have done, so
    // both rows are kept rather than merged.
    const fixExercises = (list) => (Array.isArray(list) ? list.map(fixExercise) : list);

    const history = await safeGet("workout-history");
    if (Array.isArray(history)) {
      await safeSet("workout-history", history.map((s) => ({ ...s, exercises: fixExercises(s.exercises) })));
    }

    const merged = {};
    for (const key of await safeList("ex-history:")) {
      const id = key.slice("ex-history:".length);
      const target = remapId(id);
      const method = MAP[id] ? MAP[id][1] : null;
      const rows = (await safeGet(key)) || [];
      merged[target] = [...(merged[target] || []), ...rows.map((r) => (method && !r.method ? { ...r, method } : r))];
      if (target !== id) await safeDelete(key);
    }
    for (const [id, rows] of Object.entries(merged)) {
      if (id === "squat") await safeSet(`ex-history:${id}`, sortByAt(rows).slice(-20));
    }

    // The back squat is the one the PB was tracked against, so it wins where
    // more than one variation carries a record.
    const PB_ORDER = ["back-squat", "front-squat", "hack-squat"];
    for (const prefix of ["pb:", "manual-1rm:"]) {
      let winner = null;
      for (const id of PB_ORDER) {
        const value = await safeGet(prefix + id);
        if (value) {
          if (!winner) winner = value;
          await safeDelete(prefix + id);
        }
      }
      if (winner && !(await safeGet(prefix + "squat"))) {
        await safeSet(prefix + "squat", winner.exerciseId ? { ...winner, exerciseId: "squat", name: "Squat" } : winner);
      }
    }
    const goals = await safeGet("1rm-goals");
    if (goals && typeof goals === "object") {
      const next = {};
      for (const [id, v] of Object.entries(goals)) {
        const target = remapId(id);
        if (target !== id && next[target]) continue;
        next[target] = v && v.exerciseId ? { ...v, exerciseId: target } : v;
      }
      await safeSet("1rm-goals", next);
    }

    const templates = await safeGet("templates");
    if (Array.isArray(templates)) {
      await safeSet("templates", templates.map((t) => ({ ...t, exercises: fixExercises(t.exercises) })));
    }
    const fixProgramme = (p) =>
      p && Array.isArray(p.days) ? { ...p, days: p.days.map((d) => ({ ...d, exercises: fixExercises(d.exercises) })) } : p;
    const active = await safeGet("active-programme");
    if (active) await safeSet("active-programme", fixProgramme(active));
    const finished = await safeGet("finished-programmes");
    if (Array.isArray(finished)) await safeSet("finished-programmes", finished.map(fixProgramme));

    const snapshot = await safeGet("in-progress-workout");
    if (snapshot && Array.isArray(snapshot.exercises)) {
      await safeSet("in-progress-workout", { ...snapshot, exercises: fixExercises(snapshot.exercises) });
    }

    const order = await safeGet("exercise-order");
    if (order && typeof order === "object") {
      const next = {};
      for (const [muscle, ids] of Object.entries(order)) {
        if (!Array.isArray(ids)) continue;
        next[muscle] = [...new Set(ids.map(remapId))];
      }
      await safeSet("exercise-order", next);
    }
    for (const key of ["hidden-exercises", "paused-exercises"]) {
      const list = await safeGet(key);
      if (Array.isArray(list)) await safeSet(key, [...new Set(list.map(remapId))]);
    }
  },
];

async function runMigrations() {
  let version = (await safeGet("schema-version")) || 0;
  for (let v = version; v < MIGRATIONS.length; v++) {
    try {
      await MIGRATIONS[v]();
      version = v + 1;
      await safeSet("schema-version", version);
    } catch (e) {
      console.error("migration", v, "failed — leaving data as-is", e);
      break; // don't advance past a failed migration; retried next launch
    }
  }
}

function todayStr() {
  // Local date, matching dateStrOf (used for workout dates). Using UTC here
  // could tag an evening entry with tomorrow's date and mismatch its workout.
  return dateStrOf(new Date());
}

// Single place that records a bodyweight reading: updates the app-wide current
// weight and upserts today's entry into the dated history (one per day), sorted
// oldest-first. Returns the new history array so callers holding it in state can
// refresh. Both the Personal Info stats panel and the weight-tracking panel go
// through here, so their storage shape can't drift apart.
async function upsertBodyweight(record) {
  await safeSet("bodyweight", record);
  const hist = (await safeGet("bodyweight-history")) || [];
  const next = [...hist.filter((h) => h.date !== record.date), record].sort((a, b) => (a.date < b.date ? -1 : 1));
  await safeSet("bodyweight-history", next);
  return next;
}

/* ---------------------------------------------------------------
   RECOVERY MODEL

   Four numbers per muscle, not one. How long a muscle needs depends on
   two things the app already knows: whether the work was what the
   exercise was for or something it caught along the way, and how close
   to failure the hardest set went.

     direct   0-1 RIR   trained hard, taken to or near failure
     direct   2+  RIR   trained, with reps left in the tank
     indirect 0-1 RIR   a synergist in someone else's hard set
     indirect 2+  RIR   a synergist in a set with a buffer

   The limiter differs by muscle. The erectors carry axial load and the
   central-nervous cost that comes with it; quads and hamstrings take
   severe damage in the lengthened position; the small delts and the
   calves are mostly endurance fibre and clear fast. Hence a spread from
   96 hours down to 12.

   RIR comes from the hardest set of the session — the lowest number
   logged, not an average, because one all-out set among five easy ones
   still has to be paid for. Unlogged effort is read as 2+ RIR: it is the
   honest assumption for someone not tracking it, and Simple Mode never
   asks.

   The colour follows from how long is left, not from how long it has
   been — green once ready, amber inside the last day, red while more
   than a day remains. One rule everywhere, so amber always means
   "tomorrow".

   These are wall-clock hours, not calendar days — training at 8pm and
   coming back at midnight is four hours of recovery, not "the next day".
--------------------------------------------------------------- */

const RECOVERY_WINDOWS = {
  // [direct 0-1 RIR, direct 2+ RIR, indirect 0-1 RIR, indirect 2+ RIR]
  "Lower Back": [96, 60, 48, 30], // erectors: axial load, high CNS cost
  Quads: [84, 54, 36, 24],
  Hamstrings: [84, 54, 36, 24],
  Glutes: [84, 54, 42, 24],
  Chest: [60, 42, 36, 20],
  Back: [60, 42, 36, 20], // lats
  Triceps: [60, 36, 30, 18],
  Biceps: [60, 36, 30, 18],
  Traps: [48, 36, 24, 16], // traps and rhomboids
  "Front Delts": [48, 30, 24, 12],
  "Side Delts": [36, 24, 18, 12],
  "Rear Delts": [36, 24, 18, 12],
  Forearms: [36, 24, 18, 12],
  Calves: [36, 24, 18, 12],
  Core: [36, 24, 18, 12],
  // Not in the source table. Tibialis is small, endurance-heavy and takes
  // no indirect work from anything else here, so it follows the calves.
  Shins: [36, 24, 18, 12],
};

// Amber is the last day before ready, whatever the muscle.
const AMBER_LEAD_HOURS = 24;
// Only reached by a muscle with no window of its own, which the audit
// checks for; the middle of the table is the least wrong guess.
const DEFAULT_RECOVERY_WINDOW = [60, 42, 36, 20];
// Ordered as the exercise database is, so every screen listing muscles
// lists them the same way.
const MUSCLE_GROUPS = Object.keys(EXERCISES);

const HOUR_MS = 1000 * 60 * 60;

// new Date("YYYY-MM-DD") parses as UTC midnight, which shifts a reading by the
// whole timezone offset, so build a local date instead. Rows carrying only a
// date have no time of day at all: noon is the midpoint, keeping the error
// under 12 hours either way rather than adding the full day that assuming
// midnight would.
function dateOnlyTime(dateStr) {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0, 0).getTime();
  const t = new Date(dateStr).getTime();
  return Number.isFinite(t) ? t : null;
}

// Sessions record `at`, a full ISO timestamp. Only much older rows lack it.
function sessionTime(session) {
  if (!session) return null;
  if (session.at) {
    const t = new Date(session.at).getTime();
    if (Number.isFinite(t)) return t;
  }
  return dateOnlyTime(session.date);
}

function hoursSince(at) {
  if (!at) return null;
  return Math.max(0, (Date.now() - at) / HOUR_MS);
}

// Which of the four columns applies. `hard` means the hardest set went to
// 0 or 1 RIR; `direct` means the muscle was what the exercise was for.
function recoveryHoursFor(muscle, direct, hard) {
  const w = RECOVERY_WINDOWS[muscle] || DEFAULT_RECOVERY_WINDOW;
  return w[(direct ? 0 : 2) + (hard ? 0 : 1)];
}

/* Indirect work counts, but not as much.

   A muscle can be hit two ways in a session: it is what the exercise is
   for (primary), or it takes a real share of the load anyway (secondary,
   see SECONDARY_MUSCLES). Bench press leaves the chest properly worked
   and the triceps meaningfully tired, and treating those the same is
   wrong in both directions — the triceps are not fresh, but they are not
   as beaten up as they would be after a session built around them.

   The two indirect columns of RECOVERY_WINDOWS say how much less, per
   muscle, rather than applying one blanket fraction. Where both apply,
   whichever finishes last wins.

   Readiness entries are { primary, secondary }, each an epoch timestamp
   or null, each with a `Hard` flag for the effort that earned it. */

// Hours still to go before a muscle is ready, counting whichever kind of work
// finishes last. 0 once it is ready.
function hoursLeftToReady(entry, muscle) {
  if (!entry) return 0;
  const left = [];
  if (entry.primary) left.push(recoveryHoursFor(muscle, true, entry.primaryHard) - hoursSince(entry.primary));
  if (entry.secondary) left.push(recoveryHoursFor(muscle, false, entry.secondaryHard) - hoursSince(entry.secondary));
  return Math.max(0, ...left);
}

// Progress toward fully recovered, 0-100, taking whichever kind of work is
// furthest from done. Used for ordering muscles by how fresh they are; the
// red/amber/green banding is recoveryStage() below.
function readinessPercent(entry, muscle) {
  if (!entry) return 100;
  const ratios = [];
  const primaryHours = hoursSince(entry.primary);
  const secondaryHours = hoursSince(entry.secondary);
  if (primaryHours !== null) ratios.push(primaryHours / recoveryHoursFor(muscle, true, entry.primaryHard));
  if (secondaryHours !== null) ratios.push(secondaryHours / recoveryHoursFor(muscle, false, entry.secondaryHard));
  if (!ratios.length) return 100;
  return Math.max(0, Math.min(100, Math.round(Math.min(...ratios) * 100)));
}

function recoveryStage(entry, muscle) {
  const left = hoursLeftToReady(entry, muscle);
  if (left <= 0) return "green";
  return left <= AMBER_LEAD_HOURS ? "amber" : "red";
}

// True when the only thing holding a muscle back is indirect work — worth
// saying out loud, because "your triceps are not ready" is confusing if you
// never trained triceps.
function isIndirectOnly(entry, muscle) {
  if (!entry || !entry.secondary) return false;
  const primaryHours = hoursSince(entry.primary);
  const primaryDone = primaryHours === null || primaryHours >= recoveryHoursFor(muscle, true, entry.primaryHard);
  return primaryDone && hoursSince(entry.secondary) < recoveryHoursFor(muscle, false, entry.secondaryHard);
}

// Whole hours until a muscle turns green, or 0 once it has.
function hoursUntilReady(entry, muscle) {
  return Math.ceil(hoursLeftToReady(entry, muscle));
}

// The most recent work of any kind, which is what "last trained" means to
// someone looking at the map.
function lastWorkedAt(entry) {
  if (!entry) return null;
  return Math.max(entry.primary || 0, entry.secondary || 0) || null;
}

// "4h ago" / "2d ago" — hours while they are the number that matters, days
// once the count gets unwieldy.
function trainedAgoLabel(at) {
  if (!at) return "never trained";
  const hours = hoursSince(at);
  if (hours < 1) return "just now";
  if (hours < 48) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Derives what each muscle has had done to it directly from workout-history
// rather than a separately-cached value. This is what makes deleting or
// editing a session immediately reflect in muscle readiness — there's no
// stale cache to go out of sync, since it's recomputed from the source of
// truth every time. Secondary muscles are looked up from the exercise id, so
// history logged before they existed picks them up with no migration.
function computeMuscleLastMap(sessions) {
  const map = {};
  // The effort flag is kept beside the timestamp it belongs to, so a
  // brutal session last week cannot go on stretching the window after an
  // easy one has replaced it as the most recent.
  const touch = (muscle, kind, at, hard) => {
    if (!muscle) return;
    const entry = (map[muscle] = map[muscle] || { primary: null, secondary: null, primaryHard: false, secondaryHard: false });
    if (!entry[kind] || at > entry[kind]) {
      entry[kind] = at;
      entry[kind === "primary" ? "primaryHard" : "secondaryHard"] = hard;
    }
  };
  for (const s of sessions || []) {
    const at = sessionTime(s);
    if (at === null) continue;
    for (const ex of s.exercises || []) {
      const hard = wasHardEffort(ex.sets);
      touch(ex.muscle, "primary", at, hard);
      // Same effort, but the indirect columns of the window table.
      for (const m of SECONDARY_MUSCLES[ex.id] || []) touch(m, "secondary", at, hard);
    }
  }
  return map;
}

/* ---------------------------------------------------------------
   WEEKLY VOLUME

   Deliberately uncoloured. There is no set count that is right for
   everyone: pushed hard enough, four to six sets a week is plenty, and
   what you actually need depends on your goals, your training age and
   whether you are natural. Grading the number red or green implies a
   correct answer the app has no way of knowing, so it reports the count
   and leaves the judgement to the person doing the training.

   Secondary muscles count half a set. A bench press is not a triceps
   session, but pretending the triceps did nothing is just as wrong, and
   people routinely add direct arm work on top of a week already full of
   pressing without realising.
--------------------------------------------------------------- */

const SECONDARY_SET_WEIGHT = 0.5;

// Sums logged sets per muscle across the trailing 7 days (today inclusive).
async function computeWeeklyVolume() {
  const hist = (await safeGet("workout-history")) || [];
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - 6);

  const volume = {};
  MUSCLE_GROUPS.forEach((m) => (volume[m] = 0));

  hist.forEach((session) => {
    const d = new Date(session.date);
    if (d < cutoff) return;
    session.exercises.forEach((ex) => {
      const count = (ex.sets || []).length;
      if (volume[ex.muscle] !== undefined) volume[ex.muscle] += count;
      for (const m of SECONDARY_MUSCLES[ex.id] || []) {
        if (volume[m] !== undefined) volume[m] += count * SECONDARY_SET_WEIGHT;
      }
    });
  });
  return volume;
}

// Half sets mean the total can land on a .5, and "12.5" reads better than
// "12.500000000000002" after a few additions.
function formatSets(n) {
  return String(Math.round(n * 2) / 2);
}

/* ---------------------------------------------------------------
   STREAK / CONSISTENCY
--------------------------------------------------------------- */

async function loadTrainedDates() {
  const hist = (await safeGet("workout-history")) || [];
  return new Set(hist.map((s) => s.date));
}

// Consecutive calendar days trained, counting backward from today (or
// yesterday, if today hasn't been logged yet so a same-day streak isn't
// broken before the day is even over).
function computeCurrentStreak(trainedDates) {
  let streak = 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (!trainedDates.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
  }
  while (trainedDates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function buildHeatmapDays(trainedDates, weeks) {
  const days = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days.push({ date: ds, trained: trainedDates.has(ds) });
  }
  return days;
}

/* ---------------------------------------------------------------
   SETTINGS
--------------------------------------------------------------- */

const DEFAULT_SETTINGS = {
  appMode: "simple", // "simple" | "advanced" — see APP_MODES below
  showCues: false,
  showWarmups: false,
  showLastSet: true,
  showSetTicks: true,
  showBodyMap: true,
  autoRestTimer: true,
  restTimerSound: true,
  includeMobility: false,
  randomizeSelection: false,
  weightUnit: "kg",
  theme: "system",
  colourScheme: "default",
  highContrast: false,
};

// Simple mode keeps a first-time lifter to the essentials: muscle-tap
// exercise selection, weight/reps logging, and a rest timer — no
// no implement picker, no supersets or
// drop sets, no cable/machine brand+grip tracking, no custom exercises
// or templates. Advanced mode is the full app, unchanged. Toggled from
// Settings; gated with `settings.appMode === "advanced"` at each site
// rather than a prop drilled everywhere, since it only touches a handful
// of screens (SelectScreen, WorkoutScreen, ExerciseCard).
const APP_MODES = [
  { value: "simple", label: "Simple", desc: "Just the essentials — pick a muscle, log your sets, done." },
  { value: "advanced", label: "Advanced", desc: "Everything: pick the implement, supersets, drop sets, effort tracking, machine and grip tracking, templates." },
];

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------------------------------------------------------------
   WORKOUT BUILDER
--------------------------------------------------------------- */

// Fisher-Yates shuffle — returns a new array, doesn't mutate the input.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------------------------------------------------------
   SESSION PLAN
   Day builders pick one exercise at a time, and every fresh pick used to
   restart at the muscle's highest-ranked movement pattern. So a push day
   came back as bench press, dumbbell bench, machine press, overhead
   press, close-grip bench — five different exercises, one movement, and
   a miserable session. Triceps had the same problem in miniature,
   returning a pushdown and then another pushdown.

   A session plan is threaded through every pick in a day and fixes both:
   patterns already used in this session drop to the back of the priority
   order (so Triceps follows a pushdown with an overhead extension), and
   pressing movements get a hard cap on top of that.
--------------------------------------------------------------- */

const PRESS_PATTERNS = new Set(["press", "press-incline", "press-overhead", "press-dip", "press-bodyweight"]);
const MAX_PRESSES_PER_DAY = 3;
const MAX_PRESSES_PER_MUSCLE = 2;

function isPressPattern(pattern) {
  return PRESS_PATTERNS.has(pattern);
}
// heavyBudget caps how many DEMAND_HEAVY lifts the session may contain (see
// heavyBudgetFor). Left undefined it is unlimited, which is what a hand-built
// workout should be — the budget is there to stop the app from handing you
// five brutal lifts, not to stop you from choosing them.
function makeSessionPlan(heavyBudget) {
  return {
    pressTotal: 0,
    pressByMuscle: {},
    usedPatterns: {},
    heavyUsed: 0,
    heavyBudget: heavyBudget === undefined ? Infinity : heavyBudget,
    // covered counts indirect work too; direct is only the muscles an
    // exercise was actually chosen for. The difference is what stops a
    // session's spare slots going to a second calf raise while another
    // muscle has had nothing of its own.
    covered: new Set(),
    direct: new Set(),
  };
}
function canTakeHeavy(plan) {
  return plan.heavyUsed < plan.heavyBudget;
}
function canTakePress(plan, muscle) {
  if (plan.pressTotal >= MAX_PRESSES_PER_DAY) return false;
  return (plan.pressByMuscle[muscle] || 0) < MAX_PRESSES_PER_MUSCLE;
}
// Pattern history is tracked per muscle, not globally: a bench press and an
// overhead press share the "press" pattern but are different movements, so
// Chest using it must not push Front Delts off its top-ranked lift. The global
// press cap is what stops the day filling up with presses.
function patternUsedFor(plan, muscle, pattern) {
  return !!(plan.usedPatterns[muscle] && plan.usedPatterns[muscle].has(pattern));
}
function recordPick(plan, muscle, pattern, ex) {
  if (!plan.usedPatterns[muscle]) plan.usedPatterns[muscle] = new Set();
  plan.usedPatterns[muscle].add(pattern);
  if (ex) {
    if (isHeavyExercise(ex)) plan.heavyUsed += 1;
    musclesHitBy(ex, muscle).forEach((m) => plan.covered.add(m));
    plan.direct.add(muscle);
  }
  if (!isPressPattern(pattern)) return;
  plan.pressTotal += 1;
  plan.pressByMuscle[muscle] = (plan.pressByMuscle[muscle] || 0) + 1;
}

// Picks `count` exercises for a muscle, prioritizing movement-pattern
// diversity (e.g. one horizontal pull + one vertical pull for Back, rather
// than three rows in a row). Falls back to dataset order — treated as an
// effectiveness ranking, big compound lifts listed first — unless
// randomize is on, in which case pattern order and picks within a pattern
// are shuffled instead. Pass a shared `plan` (see makeSessionPlan) to keep a
// whole session's picks varied rather than each pick independently reaching
// for the same top-ranked movement pattern.
function pickSmartForMuscle(muscle, count, usedIds, randomize, typeFilter, plan) {
  let pool = visibleExercises(muscle).filter((e) => !usedIds.has(e.id) && !PAUSED_EXERCISE_IDS.has(e.id));
  if (typeFilter) pool = pool.filter((e) => e.type === typeFilter);
  if (plan) pool = pool.filter((e) => !isPressPattern(e.pattern) || canTakePress(plan, muscle));
  // Once the session's heavy lifts are spent, drop them from the pool — but
  // only if something is left to pick instead. A muscle whose every option is
  // heavy (Lower Back is deadlift and good-morning) would otherwise be
  // silently skipped, which is worse than one lift over budget.
  if (plan && !canTakeHeavy(plan)) {
    const lighter = pool.filter((e) => !isHeavyExercise(e));
    if (lighter.length) pool = lighter;
  }
  if (pool.length === 0 || count <= 0) return [];

  const groups = {};
  const order = [];
  pool.forEach((e) => {
    const key = e.pattern || e.type;
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(e);
  });

  let patternKeys = randomize ? shuffle(order) : order;
  if (randomize) {
    Object.keys(groups).forEach((key) => {
      groups[key] = shuffle(groups[key]);
    });
  }
  // Patterns this session has already used sink to the back, so consecutive
  // picks from one muscle vary the movement (pushdown then overhead
  // extension) instead of repeating it (pushdown then another pushdown).
  if (plan) {
    const fresh = patternKeys.filter((k) => !patternUsedFor(plan, muscle, k));
    const stale = patternKeys.filter((k) => patternUsedFor(plan, muscle, k));
    patternKeys = [...fresh, ...stale];
  }

  const picked = [];
  let round = 0;
  while (picked.length < count) {
    let addedThisRound = false;
    for (const key of patternKeys) {
      if (picked.length >= count) break;
      const candidate = groups[key][round];
      if (!candidate) continue;
      // Re-checked per pick (not just when building the pool) so a single
      // call asking for several exercises can't blow the day's press budget.
      if (plan && isPressPattern(candidate.pattern) && !canTakePress(plan, muscle)) continue;
      // Re-checked per pick for the same reason the press cap is: one call
      // asking for three exercises must not spend the whole day's budget.
      if (plan && isHeavyExercise(candidate) && !canTakeHeavy(plan) && groups[key].some((c, ci) => ci > round && !isHeavyExercise(c))) continue;
      if (plan) recordPick(plan, muscle, candidate.pattern || candidate.type, candidate);
      picked.push({ ...candidate, muscle });
      usedIds.add(candidate.id);
      addedThisRound = true;
    }
    if (!addedThisRound) break;
    round++;
  }
  return picked;
}

// selection is a { muscle: tapCount } map. Each tap on a muscle adds one more
// exercise for it. Picks favor movement-pattern diversity within a muscle
// (see pickSmartForMuscle). The final list is grouped compounds-first,
// isolation-last, regardless of tap order.
function buildWorkout(split, selection, randomize) {
  const usedIds = new Set();
  const wanted = SPLITS[split].filter((m) => (selection[m] || 0) > 0);
  const total = wanted.reduce((a, m) => a + selection[m], 0);
  const plan = makeSessionPlan(heavyBudgetFor(total));

  // The priority table first, since these are chosen muscles and the table is
  // what says which lift each one should reach for.
  const fromTable = buildByPriority(wanted, selection, total, usedIds, plan, randomize);

  // Then anything it could not fill: muscles the table does not cover, or a
  // muscle tapped more times than the table has entries for.
  const fallback = [];
  for (const m of wanted) {
    const already = fromTable.filter((e) => e.muscle === m).length;
    const short = selection[m] - already;
    if (short > 0) fallback.push(...pickSmartForMuscle(m, short, usedIds, randomize, null, plan));
  }

  // The table's own order is the order the session should run in, so its
  // picks are left exactly as they came. Only the fallback needs arranging,
  // and it goes after — it is the accessory work by definition.
  return [...fromTable, ...staggerByMuscle(fallback)];
}

// Deals the list out one muscle at a time instead of finishing one muscle
// before starting the next. Asking for two Chest and one Back used to give
// bench, incline, pull-up — both chest lifts back to back, the second one
// done on a chest already cooked by the first. It now gives bench, pull-up,
// incline, which is the same work with a rest for each muscle built into the
// order of it.
//
// Order within a muscle is preserved exactly, so the ranking that decided
// which lifts to pick still decides which comes first.
function staggerByMuscle(list) {
  const byMuscle = new Map();
  for (const e of list) {
    const key = e.muscle || "";
    if (!byMuscle.has(key)) byMuscle.set(key, []);
    byMuscle.get(key).push(e);
  }
  const queues = [...byMuscle.values()];
  const out = [];
  for (let round = 0; out.length < list.length; round++) {
    let addedThisRound = false;
    for (const q of queues) {
      if (q[round]) {
        out.push(q[round]);
        addedThisRound = true;
      }
    }
    if (!addedThisRound) break;
  }
  return out;
}

// The house rule for what order a workout runs in: compounds while you are
// fresh, isolation after, and within each of those, muscles staggered rather
// than blocked together.
function orderWorkout(list) {
  const compounds = list.filter((e) => e.type === "compound");
  const isolations = list.filter((e) => e.type !== "compound");
  return [...staggerByMuscle(compounds), ...staggerByMuscle(isolations)];
}

// Re-applies the ordering rule to an arbitrary list — used when an exercise
// is added mid-workout.
function reorderByType(list) {
  return orderWorkout(list);
}

/* ---------------------------------------------------------------
   SUGGESTED WORKOUT
--------------------------------------------------------------- */

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60+ min" },
];
const DURATION_EXERCISE_COUNTS = { 15: 3, 30: 5, 45: 6, 60: 8 };

// Round-robin across muscles picking one exercise of a given type at a time
// (pattern-aware via pickSmartForMuscle), so the result isn't dominated by
// whichever muscle happens to have the most exercises.
function roundRobinPick(muscles, type, count, usedIds, randomize, plan) {
  const picked = [];
  const orderedMuscles = randomize ? shuffle(muscles) : muscles;
  let added = true;
  while (picked.length < count && added) {
    added = false;
    for (const m of orderedMuscles) {
      if (picked.length >= count) break;
      const next = pickSmartForMuscle(m, 1, usedIds, randomize, type, plan);
      if (next.length) {
        picked.push(next[0]);
        added = true;
      }
    }
  }
  return picked;
}

// Builds a workout from whichever muscles are most recovered right now.
//
// Two rules shape it beyond that. The session gets a heavy-lift budget so it
// can never come back as four brutal compounds in a row (see heavyBudgetFor),
// and the compounds are chosen for how much ground they cover between them
// rather than one muscle at a time. Isolation work then goes to whatever the
// compounds left untouched, which is what isolation work is for.
function buildSuggestedWorkout(readyMuscles, exerciseCount, randomize) {
  const usedIds = new Set();
  const plan = makeSessionPlan(heavyBudgetFor(exerciseCount));

  // The table decides what gets picked and in what order. With every muscle
  // ready this is a whole-body session read straight across it; with four
  // muscles green it is the same walk over the families those muscles belong
  // to. Either way the heavy budget still applies.
  const fromTable = buildByPriority(readyMuscles, null, exerciseCount, usedIds, plan, randomize);

  // Whatever is left goes to muscles the table does not cover and to any the
  // session has not trained directly yet — calves, forearms, traps, shins.
  // Isolation first, because the table has already supplied the compounds.
  const fallback = [];
  const leastServed = () => [
    ...readyMuscles.filter((m) => !plan.direct.has(m)),
    ...readyMuscles.filter((m) => plan.direct.has(m)),
  ];
  const need = () => exerciseCount - fromTable.length - fallback.length;
  if (need() > 0) fallback.push(...roundRobinPick(leastServed(), "isolation", need(), usedIds, randomize, plan));
  if (need() > 0) fallback.push(...roundRobinPick(leastServed(), "compound", need(), usedIds, randomize, plan));

  return [...fromTable, ...staggerByMuscle(fallback)];
}

// selectedKeys is a Set of "Muscle:exerciseId" strings from the specific-exercise
// picker. Same final ordering rule as buildWorkout: compounds first, isolation last.
function buildFromSpecificSelection(split, selectedKeys) {
  const picked = [];
  for (const m of SPLITS[split]) {
    for (const ex of EXERCISES[m] || []) {
      if (selectedKeys.has(`${m}:${ex.id}`)) {
        picked.push({ ...ex, muscle: m });
      }
    }
  }
  return orderWorkout(picked);
}
/* ---------------------------------------------------------------
   PROGRAMMES
   A programme is an ordered set of workout "days" (e.g. Push / Pull /
   Legs / Upper) that the user follows for a fixed number of weeks. Unlike
   free-mode workouts, the day templates persist, so the same sessions —
   with last time's weights ready — are one tap away, and the app tracks
   which day comes next and how the block is progressing.
--------------------------------------------------------------- */

// Looks up exercises by id for hand-authored programme days. EXERCISES is
// keyed by muscle group, but individual entries don't carry that muscle name
// themselves, so this walks the database once to attach it.
function exercisesFromIds(ids) {
  const out = [];
  for (const entry of ids) {
    // An entry is an id, or [id, method] where the programme means one
    // particular variation — a hack squat rather than whichever squat.
    const [id, method] = Array.isArray(entry) ? entry : [entry, null];
    let found = null;
    for (const [muscle, list] of Object.entries(EXERCISES)) {
      const hit = list.find((e) => e.id === id);
      if (hit) {
        found = { id: hit.id, name: hit.name, muscle, type: hit.type };
        if (method) found.method = method;
        break;
      }
    }
    if (found) out.push(found);
  }
  return out;
}

// Preset day structures. Each day is [name, [muscles...], [exerciseIds...]].
// The exercise list is hand-picked to mirror a real, well-known published
// programme rather than generated algorithmically. "Custom" starts empty
// and has no exercise list, so its days fall back to the algorithmic picker.
const PROGRAMME_PRESETS = [
  {
    key: "pplul",
    name: "Push Pull Legs Upper Lower",
    blurb: "5 sessions over ~7 days — PPL plus dedicated upper/lower days for extra frequency.",
    days: [
      ["Push", ["Chest", "Front Delts", "Side Delts", "Triceps"], ["bench-press", "incline-press", "overhead-press", "lateral-raise", "pushdown", "overhead-extension"]],
      ["Pull", ["Back", "Rear Delts", "Biceps"], ["pull-ups", "bent-over-row", "face-pull", "cable-curl", "hammer-curl"]],
      ["Legs", ["Quads", "Hamstrings", "Calves"], ["squat", "romanian-deadlift", "leg-extension", "leg-curl", "standing-calf-raise"]],
      ["Upper", ["Chest", "Back", "Front Delts", "Side Delts", "Biceps", "Triceps"], ["incline-press", "cable-row", "overhead-press", "lateral-raise", "cable-curl", "pushdown"]],
      ["Lower", ["Quads", "Hamstrings", "Glutes", "Calves"], [["squat", "Front"], "good-morning", "hip-thrust", "lunge", "glute-ham-raise", "seated-calf-raise"]],
    ],
  },
  {
    key: "ppl",
    name: "Push Pull Legs",
    blurb: "The classic 3-day rotation. Run it once or twice per week.",
    days: [
      ["Push", ["Chest", "Front Delts", "Side Delts", "Triceps"], ["bench-press", "incline-press", "overhead-press", "lateral-raise", "pushdown", "overhead-extension"]],
      ["Pull", ["Back", "Rear Delts", "Biceps"], ["deadlift", "pull-ups", "bent-over-row", "face-pull", "cable-curl", "hammer-curl"]],
      ["Legs", ["Quads", "Hamstrings", "Calves"], ["squat", "romanian-deadlift", "leg-press", "leg-curl", "leg-extension", "standing-calf-raise"]],
    ],
  },
  {
    key: "upper-lower",
    name: "Upper Lower",
    blurb: "4 sessions/week hitting each half twice. Balanced and simple.",
    days: [
      ["Upper", ["Chest", "Back", "Front Delts", "Side Delts", "Biceps", "Triceps"], ["bench-press", "bent-over-row", "overhead-press", "lat-pulldown", "lateral-raise", "cable-curl", "pushdown"]],
      ["Lower", ["Quads", "Hamstrings", "Glutes", "Calves"], ["squat", "romanian-deadlift", "leg-press", "leg-curl", "hip-thrust", "standing-calf-raise"]],
    ],
  },
  {
    key: "full-body",
    name: "Full Body",
    blurb: "Two alternating full-body sessions, 3x/week. Simple, heavy, effective.",
    days: [
      ["Full Body A", ["Quads", "Chest", "Back"], ["squat", "bench-press", "bent-over-row"]],
      ["Full Body B", ["Quads", "Front Delts", "Back"], ["squat", "overhead-press", "deadlift"]],
    ],
  },
  {
    key: "bro",
    name: "Bro Split",
    blurb: "One muscle group per day, 5 days. Maximum focus per session.",
    days: [
      ["Chest", ["Chest"], ["bench-press", "incline-press", "dips", "cable-fly", "pec-deck"]],
      ["Back", ["Back"], ["deadlift", "pull-ups", "bent-over-row", "lat-pulldown", "straight-arm-pulldown"]],
      ["Shoulders", ["Front Delts", "Side Delts", "Rear Delts"], ["overhead-press", "lateral-raise", "face-pull", "reverse-fly"]],
      ["Legs", ["Quads", "Hamstrings", "Calves"], ["squat", "romanian-deadlift", "leg-press", "leg-curl", "leg-extension", "standing-calf-raise"]],
      ["Arms", ["Biceps", "Triceps"], ["cable-curl", "incline-curl", "hammer-curl", "pushdown", "skull-crusher", "overhead-extension"]],
    ],
  },
  {
    key: "arnold",
    name: "Arnold Split",
    blurb: "6 sessions/week: Chest & Back, Shoulders & Arms, Legs — repeated twice. High volume, old-school.",
    days: [
      ["Chest & Back", ["Chest", "Back"], ["bench-press", "incline-press", "dips", "pull-ups", "bent-over-row", "straight-arm-pulldown"]],
      ["Shoulders & Arms", ["Front Delts", "Side Delts", "Rear Delts", "Biceps", "Triceps"], ["overhead-press", "close-grip-bench", "lateral-raise", "face-pull", "cable-curl", "preacher-curl", "pushdown"]],
      ["Legs", ["Quads", "Hamstrings", "Calves"], ["squat", "leg-press", "leg-extension", "romanian-deadlift", "leg-curl", "standing-calf-raise", "seated-calf-raise"]],
    ],
  },
  {
    key: "project-arms",
    name: "Project Arms",
    blurb: "Upper, lower, arms — twice through, with a rest day after each block. Two dedicated arm sessions a week and direct forearm and grip work.",
    days: [
      ["Upper A", ["Back", "Chest", "Front Delts", "Side Delts", "Rear Delts"], ["pull-ups", "bench-press", "overhead-press", "cable-fly", "lateral-raise", "face-pull"]],
      ["Lower A", ["Quads", "Hamstrings", "Glutes", "Calves", "Core"], [["squat", "Hack"], "romanian-deadlift", "hip-thrust", "hip-adduction", "standing-calf-raise", "cable-crunch"]],
      ["Arms A", ["Triceps", "Biceps", "Forearms", "Traps"], ["overhead-extension", "cable-curl", "hammer-curl", "wrist-curl", "reverse-wrist-curl", "farmers-carry"]],
      ["Upper B", ["Chest", "Back", "Side Delts", "Rear Delts"], ["incline-press", "bent-over-row", "dips", "lat-pulldown", "lateral-raise", "reverse-fly"]],
      ["Lower B", ["Quads", "Hamstrings", "Glutes", "Shins", "Core"], ["leg-press", "leg-curl", "leg-extension", "hip-abduction", "tibialis-raise", "hanging-leg-raise"]],
      ["Arms B", ["Triceps", "Biceps", "Forearms"], ["pushdown", "preacher-curl", "reverse-curl", "eugene-curl", "reverse-eugene-curl", "plate-pinch"]],
    ],
  },
  {
    key: "custom",
    name: "Custom",
    blurb: "Build your own days from scratch.",
    days: [],
  },
];

// Recommended block lengths. 6–8 weeks is the usual sweet spot before a
// deload or exercise swap, so those are flagged as recommended.
const PROGRAMME_LENGTHS = [
  { weeks: 4, label: "4 weeks", desc: "Short block or a test run." },
  { weeks: 6, label: "6 weeks", desc: "Recommended — long enough to progress, short enough to stay fresh.", recommended: true },
  { weeks: 8, label: "8 weeks", desc: "Recommended — a full training block with room to peak.", recommended: true },
  { weeks: 12, label: "12 weeks", desc: "Long build. Consider a deload around the midpoint." },
];

// Sensible starting exercises for a day, given its muscles. Primary (first two)
// muscles get two movements, the rest one, capped so a day isn't overloaded.
// Used for Custom days, which have no hand-authored exercise list.
function defaultExercisesForDay(muscles) {
  const usedIds = new Set();
  const plan = makeSessionPlan(heavyBudgetFor(7));
  const out = [];
  muscles.forEach((m, i) => {
    const count = i < 2 ? 2 : 1;
    const picks = pickSmartForMuscle(m, count, usedIds, false, null, plan);
    picks.forEach((e) => out.push({ id: e.id, name: e.name, muscle: m, type: e.type }));
  });
  // Keep it to a reasonable session size; user can add more.
  return reorderByType(out).slice(0, 7);
}

function makeProgrammeDays(preset) {
  return preset.days.map(([name, muscles, exerciseIds], i) => ({
    key: `d${i}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    muscles,
    // Used verbatim: a hand-authored list is already in the order its author
    // meant, and re-sorting it by type drags a finisher like a farmer's carry
    // to the front of an arms day. Custom days, which are generated rather
    // than authored, still get the compounds-first pass.
    exercises: exerciseIds && exerciseIds.length ? exercisesFromIds(exerciseIds) : defaultExercisesForDay(muscles),
  }));
}

/* ---------------------------------------------------------------
   GUIDED PROGRAMME
   A short questionnaire (experience, session length, muscles to
   prioritize) maps to one of the existing presets and generates its
   day exercises algorithmically — same building blocks as "Train Ready
   Muscles", just seeded from the preset's day/muscle structure instead
   of live readiness.
--------------------------------------------------------------- */

const GUIDED_EXPERIENCE_OPTIONS = [
  { value: "new", label: "New To Training", desc: "Just starting out, or getting back into it after a long break.", presetKey: "full-body" },
  { value: "some", label: "Some Experience", desc: "You've trained fairly consistently for a while now.", presetKey: "upper-lower" },
  { value: "experienced", label: "Very Experienced", desc: "You know your way around the gym and want more frequency.", presetKey: "ppl" },
];

// Same duration → exercise-count mapping "Train Ready Muscles" uses, so a
// guided session and a suggested one feel the same size for the same answer.
const GUIDED_DURATION_OPTIONS = DURATION_OPTIONS;

/* ---------------------------------------------------------------
   GUIDED DAY BLUEPRINTS

   Picking purely by muscle ranking produced sessions that were wrong in
   ways a coach would spot instantly: a deadlift on an upper day, a pull
   day with no row or pulldown in it, both calf raises together, squats
   and deadlifts opening every session of a beginner's week.

   The problem is that "which exercise" and "what job does it do in this
   session" are different questions, and only the first was being asked.
   A blueprint answers the second: an ordered list of slots, each naming a
   muscle, whether it wants a compound or an isolation, and which movement
   patterns satisfy it. Slots are filled from the user's own ranked,
   visible exercises, so reordering or removing things in the Exercise
   Database still decides *which* lift shows up — the blueprint only
   decides what kind of lift belongs there.

   Order is the time budget. The list is written hardest-and-most-useful
   first, so a 15-minute session takes the top three slots and gets three
   compounds, while an hour reaches the isolation work at the bottom.
   That is the whole mechanism behind "more time means more isolation".
--------------------------------------------------------------- */

const S = (muscle, type, patterns) => ({ muscle, type, patterns });

// Pattern groups, named for the job rather than the equipment.
const P = {
  horizPush: ["press", "press-incline", "press-bodyweight", "press-dip"],
  vertPush: ["press-overhead"],
  horizPull: ["horizontal-pull"],
  vertPull: ["vertical-pull"],
  backIso: ["isolation-pull", "pullover"],
  squat: ["squat", "lunge", "unilateral-squat"],
  legPress: ["leg-press", "lunge"],
  quadIso: ["isolation-extension"],
  hinge: ["hinge"],
  hamIso: ["flexion", "flexion-seated"],
  glute: ["hip-extension", "unilateral-squat"],
  gluteIso: ["abduction", "isolation-extension"],
  lateral: ["lateral", "upright-row"],
  rearDelt: ["rear-fly", "rear-pull"],
  chestIso: ["fly"],
  triPush: ["extension-pushdown", "press-dip"],
  triOverhead: ["extension-overhead", "extension-lying"],
  bicep: ["curl-standard", "curl-strict", "curl-stretch"],
  bicepAlt: ["curl-hammer", "curl-reverse"],
  calf: ["standing"],
  calfSeated: ["seated"],
  core: ["anti-extension", "flexion", "rotation", "isometric"],
  shrug: ["shrug"],
  lowerBack: ["hinge", "extension-back"],
  shin: ["tibialis"],
};

const DAY_BLUEPRINTS = {
  // Beginner full body: one big pattern per session, alternating emphasis,
  // so squat and deadlift never land in the same workout.
  "Full Body A": [
    S("Quads", "compound", P.squat),
    S("Chest", "compound", P.horizPush),
    S("Back", "compound", P.horizPull),
    S("Hamstrings", "compound", P.hinge),
    S("Side Delts", "isolation", P.lateral),
    S("Triceps", "isolation", P.triPush),
    S("Biceps", "isolation", P.bicep),
    S("Core", "isolation", P.core),
    S("Calves", "isolation", P.calf),
  ],
  "Full Body B": [
    S("Hamstrings", "compound", P.hinge),
    S("Front Delts", "compound", P.vertPush),
    S("Back", "compound", P.vertPull),
    S("Quads", "compound", P.legPress),
    S("Chest", "compound", P.horizPush),
    S("Biceps", "isolation", P.bicepAlt),
    S("Calves", "isolation", P.calf),
    S("Core", "isolation", P.core),
    S("Triceps", "isolation", P.triOverhead),
  ],
  // Upper: push and pull matched pair for pair before anything else.
  Upper: [
    S("Chest", "compound", P.horizPush),
    S("Back", "compound", P.horizPull),
    S("Front Delts", "compound", P.vertPush),
    S("Back", "compound", P.vertPull),
    S("Triceps", "isolation", P.triPush),
    S("Biceps", "isolation", P.bicep),
    S("Side Delts", "isolation", P.lateral),
    S("Chest", "isolation", P.chestIso),
    S("Rear Delts", "isolation", P.rearDelt),
  ],
  Lower: [
    S("Quads", "compound", P.squat),
    S("Hamstrings", "compound", P.hinge),
    S("Quads", "compound", P.legPress),
    S("Glutes", "compound", P.glute),
    S("Hamstrings", "isolation", P.hamIso),
    S("Calves", "isolation", P.calf),
    S("Quads", "isolation", P.quadIso),
    S("Lower Back", "isolation", P.lowerBack),
    S("Core", "isolation", P.core),
    S("Glutes", "isolation", P.gluteIso),
  ],
  Push: [
    S("Chest", "compound", P.horizPush),
    S("Front Delts", "compound", P.vertPush),
    S("Chest", "compound", P.horizPush),
    S("Side Delts", "isolation", P.lateral),
    S("Triceps", "isolation", P.triPush),
    S("Chest", "isolation", P.chestIso),
    S("Triceps", "isolation", P.triOverhead),
    S("Rear Delts", "isolation", P.rearDelt),
    S("Core", "isolation", P.core),
  ],
  // A pull day leads with actual pulling. The hinge sits mid-list so a
  // short session is rows and pulldowns, not a deadlift and two curls.
  Pull: [
    S("Back", "compound", P.vertPull),
    S("Back", "compound", P.horizPull),
    S("Lower Back", "compound", P.lowerBack),
    S("Rear Delts", "isolation", P.rearDelt),
    S("Biceps", "isolation", P.bicep),
    S("Back", "isolation", P.backIso),
    S("Biceps", "isolation", P.bicepAlt),
    S("Traps", "isolation", P.shrug),
    S("Core", "isolation", P.core),
  ],
  Legs: [
    S("Quads", "compound", P.squat),
    S("Hamstrings", "compound", P.hinge),
    S("Quads", "compound", P.legPress),
    S("Glutes", "compound", P.glute),
    S("Hamstrings", "isolation", P.hamIso),
    S("Calves", "isolation", P.calf),
    S("Quads", "isolation", P.quadIso),
    S("Calves", "isolation", P.calfSeated),
    S("Shins", "isolation", P.shin),
    S("Core", "isolation", P.core),
  ],
};

// Draws the best available lift for a slot straight off the user's ranked
// list. Anything hidden, paused, already picked, or from a family already
// used is out. Where a slot could be satisfied by
// a pattern already used in this session, an unused pattern wins, so a
// second chest slot becomes an incline rather than a second flat press.
function fillSlot(slot, usedIds, usedPatterns, plan) {
  let pool = visibleExercises(slot.muscle).filter(
    (e) =>
      e.type === slot.type &&
      slot.patterns.includes(e.pattern) &&
      !usedIds.has(e.id) &&
      !PAUSED_EXERCISE_IDS.has(e.id)
  );
  // The blueprints are written slot by slot and front-load the big lifts, so
  // a short day took the first N slots and came back nearly all heavy — a
  // five-exercise Upper day was bench, row, overhead press, pull-up. Past the
  // budget a slot takes the best lighter option it has; if it has none it
  // still fills, because an empty slot is worse than one lift over.
  if (plan && !canTakeHeavy(plan)) {
    const lighter = pool.filter((e) => !isHeavyExercise(e));
    if (lighter.length) pool = lighter;
  }
  if (pool.length === 0) return null;
  return pool.find((e) => !usedPatterns.has(`${slot.muscle}:${e.pattern}`)) || pool[0];
}

// Muscles get 2 movements instead of 1 where room allows, and each day that
// touches a chosen muscle gets one extra exercise slot — a mild, not
// overwhelming, bias toward what the user said they most want to improve.
function buildGuidedDays(preset, exerciseCount, focusMuscles) {
  const focus = new Set(focusMuscles || []);
  return preset.days.map(([name, muscles], i) => {
    const blueprint = DAY_BLUEPRINTS[name];
    // The extra slot is judged against what this day actually trains. The
    // preset's muscle list is a coarse label ("Quads, Front Delts, Back") and
    // misses the arm and core work the blueprint includes, so a day that
    // does train the focus muscle would otherwise be denied its extra slot.
    const dayMuscles = blueprint ? blueprint.map((sl) => sl.muscle) : muscles;
    const targetCount = Math.min(9, focus.size > 0 && dayMuscles.some((m) => focus.has(m)) ? exerciseCount + 1 : exerciseCount);
    let picked;

    if (blueprint) {
      // The two opening slots anchor the session and stay put; below them,
      // slots for a muscle the user asked to prioritise float up. Sort is
      // stable, so everything else keeps its written order.
      const head = blueprint.slice(0, 2);
      const rank = (x) => (x.slot.type === "compound" ? 0 : 1);
      const tail = blueprint
        .slice(2)
        .map((slot, idx) => ({ slot, idx }))
        // Compounds stay ahead of isolations no matter what is prioritised;
        // the focus boost only reorders within each of those two bands.
        .sort((a, b) => rank(a) - rank(b) || (focus.has(b.slot.muscle) ? 1 : 0) - (focus.has(a.slot.muscle) ? 1 : 0) || a.idx - b.idx)
        .map((x) => x.slot);

      const usedIds = new Set();
      const usedPatterns = new Set();
      const plan = makeSessionPlan(heavyBudgetFor(targetCount));
      picked = [];
      for (const slot of [...head, ...tail]) {
        if (picked.length >= targetCount) break;
        const ex = fillSlot(slot, usedIds, usedPatterns, plan);
        if (!ex) continue; // nothing left that fits — let the next slot through
        usedIds.add(ex.id);
        usedPatterns.add(`${slot.muscle}:${ex.pattern}`);
        recordPick(plan, slot.muscle, ex.pattern || ex.type, ex);
        picked.push({ ...ex, muscle: slot.muscle });
      }
      // Only if the user has removed so much that the blueprint ran dry.
      if (picked.length < targetCount) {
        for (const m of muscles) {
          if (picked.length >= targetCount) break;
          const extra = pickSmartForMuscle(m, targetCount - picked.length, usedIds, false, null, plan);
          extra.forEach((e) => {
            usedIds.add(e.id);
            picked.push(e);
          });
        }
      }
    } else {
      // No blueprint for this day name (a preset the guided flow does not
      // currently offer) — fall back to the ranked round-robin.
      const usedIds = new Set();
      const plan = makeSessionPlan(heavyBudgetFor(targetCount));
      const focusInDay = muscles.filter((m) => focus.has(m));
      const orderedMuscles = [...focusInDay, ...muscles.filter((m) => !focusInDay.includes(m))];
      picked = [];
      orderedMuscles.forEach((m) => {
        if (picked.length >= targetCount) return;
        const n = Math.min(focusInDay.includes(m) ? 2 : 1, targetCount - picked.length);
        picked.push(...pickSmartForMuscle(m, n, usedIds, false, null, plan));
      });
      let guard = 0;
      while (picked.length < targetCount && guard < 20) {
        const before = picked.length;
        for (const m of orderedMuscles) {
          if (picked.length >= targetCount) break;
          const extra = pickSmartForMuscle(m, 1, usedIds, false, null, plan);
          if (extra.length) picked.push(...extra);
        }
        if (picked.length === before) break;
        guard++;
      }
    }

    return {
      key: `d${i}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      muscles: [...new Set(picked.map((e) => e.muscle))],
      exercises: picked.map((e) => ({ id: e.id, name: e.name, muscle: e.muscle, type: e.type })),
    };
  });
}

// Beginner guidance is spelled out in full; more experienced lifters get
// terser, more assumed-knowledge notes. Protein is only computed from a
// real number if the user has actually logged their bodyweight.
function guidedRecommendations(experience, bodyweightKg) {
  const recs = [];
  if (experience === "new") {
    recs.push({ title: "Rep Ranges", body: "Aim for 8–12 reps on most exercises. If you hit 12 clean reps and it still feels easy, add a little weight next session — that's how you'll know it's time to progress." });
    recs.push({ title: "Rest Between Sets", body: "60–90 seconds between sets is plenty — enough to recover without losing the session's pace." });
    recs.push({ title: "Focus On Form First", body: "In the first few months, learning each movement properly matters more than the weight on the bar. Small, steady increases beat big jumps." });
  } else if (experience === "some") {
    recs.push({ title: "Rep Ranges", body: "5–8 reps on your main compound lifts works well for strength; 10–15 on isolation work for size." });
    recs.push({ title: "Rest Between Sets", body: "90–120 seconds on heavy compounds, 45–60 seconds on isolation work." });
    recs.push({ title: "Progression", body: "Track your top set each session and aim to beat it — more weight or more reps — roughly every 1–2 weeks." });
  } else {
    recs.push({ title: "Rep Ranges", body: "Structure blocks around a goal — lower reps (3–6) for strength phases, higher (8–15) for hypertrophy phases." });
    recs.push({ title: "Rest Between Sets", body: "2–3 minutes on your heaviest compounds is normal — don't rush the lifts that matter most." });
    recs.push({ title: "Progression", body: "Watch weekly volume per muscle, not just weight on the bar — that's usually the lever with the most room left this far in." });
  }
  if (bodyweightKg) {
    const lo = Math.round(bodyweightKg * 1.6);
    const hi = Math.round(bodyweightKg * 2.2);
    recs.push({ title: "Protein Intake", body: `Based on your logged bodyweight (${Math.round(bodyweightKg)}kg), aim for roughly ${lo}–${hi}g of protein a day (1.6–2.2g per kg of bodyweight) to support recovery and growth.` });
  } else {
    recs.push({ title: "Protein Intake", body: "A well-supported target is 1.6–2.2g of protein per kg of bodyweight per day. Log your weight in Personal Info and this can be a precise number next time." });
  }
  return recs;
}

function programmeNextIndex(programme) {
  const log = programme.log || [];
  if (log.length === 0) return 0;
  const lastKey = log[log.length - 1].dayKey;
  const idx = programme.days.findIndex((d) => d.key === lastKey);
  if (idx === -1) return 0;
  return (idx + 1) % programme.days.length;
}
function programmePlanned(programme) {
  return (programme.weeks || 0) * ((programme.days || []).length || 0);
}
function programmeCompleted(programme) {
  return (programme.log || []).length;
}
// When the block actually started: the first session logged against it, or
// failing that the day it was created. Creation is the weaker answer — a
// programme built on Sunday night and started on Wednesday should not be
// three days into week one — so a real session wins wherever there is one.
function programmeStartDate(programme) {
  const log = programme && programme.log;
  if (Array.isArray(log) && log.length) {
    const first = log.reduce((a, b) => ((a.at || a.date) <= (b.at || b.date) ? a : b));
    return first.at || first.date || null;
  }
  return (programme && programme.createdAt) || null;
}

// Weeks are calendar weeks, counted from the start of the block.
//
// This used to be completed sessions divided by the number of days in the
// cycle, which is a cycle counter wearing the word "week". It could not tell
// seven repeats of one full-body day from a fortnight of proper training —
// both read as week four — and someone training six days a week on a
// three-day split reached "week two" after seven days. A week is seven days.
function programmeWeekNumber(programme) {
  const started = programmeStartDate(programme);
  if (!started) return 1;
  const ms = Date.now() - Date.parse(started);
  if (!Number.isFinite(ms)) return 1;
  const wk = Math.floor(Math.max(0, ms) / (7 * 86400000)) + 1;
  return Math.min(Math.max(1, wk), programme.weeks || wk);
}
function lastDoneForDay(programme, dayKey) {
  const entries = (programme.log || []).filter((e) => e.dayKey === dayKey);
  return entries.length ? entries[entries.length - 1].date : null;
}

async function getActiveProgramme() {
  return (await safeGet("active-programme")) || null;
}
async function saveActiveProgramme(p) {
  await safeSet("active-programme", p);
}
async function getFinishedProgrammes() {
  return (await safeGet("finished-programmes")) || [];
}
// Remove a finished programme from history by id.
async function deleteFinishedProgramme(id) {
  const list = await getFinishedProgrammes();
  const next = list.filter((p) => p.id !== id);
  await safeSet("finished-programmes", next);
  return next;
}
// Move the active programme into the finished list (most recent last).
async function archiveActiveProgramme(endedEarly) {
  const active = await getActiveProgramme();
  if (!active) return null;
  const finished = { ...active, finishedAt: new Date().toISOString(), endedEarly: !!endedEarly };
  const list = await getFinishedProgrammes();
  await safeSet("finished-programmes", [...list, finished].slice(-20));
  await safeDelete("active-programme");
  return finished;
}
// Append a completed session to the active programme's log.
async function recordProgrammeSession(entry) {
  const active = await getActiveProgramme();
  if (!active) return null;
  const log = [...(active.log || []), entry];
  const updated = { ...active, log };
  await saveActiveProgramme(updated);
  return updated;
}

// Aggregate stats for a programme from the workout-history sessions tagged with
// its id: totals plus per-exercise first→last e1RM progression (top gainers).
function computeProgrammeStats(programme, allSessions) {
  const sessions = (allSessions || [])
    .filter((s) => s.programmeId === programme.id)
    .sort((a, b) => ((a.at || a.date) < (b.at || b.date) ? -1 : 1));

  let totalSets = 0;
  let totalVolume = 0;
  const perExercise = {}; // id -> { name, first:{e1rm,date}, last:{e1rm,date} }

  sessions.forEach((s) => {
    s.exercises.forEach((ex) => {
      const allSets = ex.sets || [];
      allSets.forEach((set) => {
        totalSets += 1;
        const w = parseFloat(set.weight) || 0;
        const r = parseFloat(set.reps) || 0;
        totalVolume += w * r;
        (set.drops || []).forEach((d) => {
          totalVolume += (parseFloat(d.weight) || 0) * (parseFloat(d.reps) || 0);
        });
      });
      const top = getTopSet(allSets);
      const e1 = top ? estimateOneRM(top.weight, top.reps) : null;
      if (e1) {
        if (!perExercise[ex.id]) perExercise[ex.id] = { name: ex.name, first: { e1rm: e1, date: s.date }, best: { e1rm: e1, date: s.date } };
        else if (e1 > perExercise[ex.id].best.e1rm) perExercise[ex.id].best = { e1rm: e1, date: s.date };
      }
    });
  });

  // Measured against the best session of the block, not the last one. Most
  // programmes end on a deload week, so comparing first to last reported a
  // loss on every lift and made a section headed "biggest strength gains"
  // read as a list of things that got worse.
  const gainers = Object.values(perExercise)
    .filter((x) => x.first.e1rm > 0 && x.best.e1rm > x.first.e1rm)
    .map((x) => ({
      name: x.name,
      from: x.first.e1rm,
      to: x.best.e1rm,
      pct: Math.round(((x.best.e1rm - x.first.e1rm) / x.first.e1rm) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);

  const planned = programmePlanned(programme);
  const done = sessions.length;
  return {
    sessions: done,
    planned,
    adherence: planned ? Math.round((done / planned) * 100) : 0,
    totalSets,
    totalVolume: Math.round(totalVolume),
    gainers,
    firstDate: sessions.length ? sessions[0].date : null,
    lastDate: sessions.length ? sessions[sessions.length - 1].date : null,
  };
}

function getTopSet(setsArr) {
  if (!setsArr || setsArr.length === 0) return null;
  return setsArr.reduce((top, s) => {
    if (!top) return s;
    const w = parseFloat(s.weight) || 0;
    const topW = parseFloat(top.weight) || 0;
    if (w > topW) return s;
    if (w === topW && (parseFloat(s.reps) || 0) > (parseFloat(top.reps) || 0)) return s;
    return top;
  }, null);
}

// The single definition of a "savable" set: it has an entered weight or reps,
// or a drop that does. Used everywhere sets are filtered for saving or for
// detecting an in-progress workout, so those paths can never quietly disagree
// (the kind of drift that once dropped every set at finish time).
function setHasData(s) {
  if (!s) return false;
  if (s.weight !== "" || s.reps !== "") return true;
  return (s.drops || []).some((d) => d.weight !== "" || d.reps !== "");
}

// Stands in for "logged before any machine was recorded" in the Progress
// filter. Not a real brand, so it can never collide with one the user typed.
const UNTAGGED_BRAND = "Nothing recorded";

// Brands are free text, so "Exigo", "exigo" and " Exigo " are one machine.
function normaliseBrand(brand) {
  return typeof brand === "string" ? brand.trim().toLowerCase() : "";
}

// The distinct ways an exercise has actually been done — implement, brand,
// or both — oldest first. One control rather than two: at 412px a second
// select next to the exercise name has nowhere to go, and "Barbell" and
// "Technogym" are answering the same question anyway.
function variationsInHistory(hist, id) {
  const seen = new Map();
  for (const h of hist || []) {
    if (!h || !h.date) continue;
    const method = (h.method || (hasMethodChoice(id) ? defaultMethodFor(id) : "") || "").trim();
    const brand = (h.brand || "").trim();
    const label = [method, brand].filter(Boolean).join(" · ");
    if (label) seen.set(label.toLowerCase(), { label, method, brand });
  }
  return [...seen.values()];
}

function matchesVariation(entry, id, variation) {
  if (!variation) return true;
  if (variation.label === UNTAGGED_BRAND) {
    const method = entry.method || (hasMethodChoice(id) ? defaultMethodFor(id) : "");
    return !method && !entry.brand;
  }
  const method = (entry.method || (hasMethodChoice(id) ? defaultMethodFor(id) : "") || "").trim();
  const brand = (entry.brand || "").trim();
  return (
    normaliseMethod(method) === normaliseMethod(variation.method) &&
    normaliseBrand(brand) === normaliseBrand(variation.brand)
  );
}

function summariseEntry(entry) {
  const topSet = getTopSet(entry.sets) || {};
  return {
    weight: topSet.weight,
    reps: topSet.reps,
    date: entry.date,
    sets: entry.sets || [],
    order: entry.order || null,
    total: entry.total || null,
    brand: entry.brand || null,
    grip: entry.grip || null,
    method: entry.method || null,
    supersetWith: entry.supersetWith || null,
    notes: entry.notes || null,
    // Drop sets live inside the logged sets themselves, so there's nothing
    // extra to store — how many sets carried one is derivable here.
    dropSetCount: (entry.sets || []).filter((s) => s.drops && s.drops.length).length,
  };
}

// Summary of the last logged session for an exercise: the top set (for warm-up
// math and progression), the full set list (shown so the user sees every set,
// not just the best), the machine/grip used, and where the exercise sat in that
// session — stated plainly, without drawing a conclusion from it.
//
// When a brand is given, the comparison is made against the last session on
// *that* machine, because a number set on a different stack is not a target.
// If there has never been one, the caller is told so (brandMismatch) and gets
// the overall most recent alongside it rather than nothing at all.
function buildLastEntry(hist, brand, method) {
  const list = hist || [];
  if (!list.length) return null;
  const wantBrand = normaliseBrand(brand);
  const wantMethod = normaliseMethod(method);
  const overall = list[list.length - 1];
  if (!wantBrand && !wantMethod) return summariseEntry(overall);

  // A dumbbell press is not a target for a barbell press any more than one
  // machine's numbers are a target for another's, so both narrow the search.
  const matches = (h) =>
    (!wantBrand || normaliseBrand(h.brand) === wantBrand) &&
    (!wantMethod || normaliseMethod(h.method || defaultMethodFor(h.id)) === wantMethod);

  const asked = [method && method.trim(), brand && brand.trim()].filter(Boolean).join(" · ");
  for (let i = list.length - 1; i >= 0; i--) {
    if (matches(list[i])) {
      return { ...summariseEntry(list[i]), askedBrand: asked };
    }
  }
  return {
    ...summariseEntry(overall),
    askedBrand: asked,
    brandMismatch: true,
  };
}

/* ---------------------------------------------------------------
   PERSONAL RECORDS
--------------------------------------------------------------- */

// Which group an exercise belongs to. Needed wherever a stored record has
// an id but a stale muscle name — the database is the authority, not the
// copy written into a session months ago.
function muscleOfExerciseId(id) {
  for (const [muscle, list] of Object.entries(EXERCISES)) {
    if (list.some((e) => e.id === id)) return muscle;
  }
  return null;
}

// Flatten EXERCISES once so any exercise can be looked up by id.
const ALL_EXERCISES_BY_ID = {};
Object.values(EXERCISES).forEach((list) => list.forEach((e) => {
  if (!ALL_EXERCISES_BY_ID[e.id]) ALL_EXERCISES_BY_ID[e.id] = e;
}));

// What the app shipped with, frozen before any stored edit is applied. A
// built-in exercise lives in a module constant, so an edit to one is stored
// as an overlay rather than a rewrite — which means "revert to default" needs
// the originals still to be here to revert to. Nothing below ever mutates an
// exercise object in place for this reason: an edit builds a new object and
// swaps it in, leaving the shipped one untouched for the snapshot to hold.
const SHIPPED_EXERCISE_BY_ID = { ...ALL_EXERCISES_BY_ID };
const SHIPPED_SECONDARY_MUSCLES = { ...SECONDARY_MUSCLES };
// An exercise object carries no muscle of its own — which bucket of EXERCISES
// it sits in is what says where it belongs, which is why muscleOfExerciseId
// exists at all. That works right up until an edit moves one, at which point
// the shipped answer is no longer discoverable by looking. So record it now.
const SHIPPED_MUSCLE_BY_ID = {};
Object.entries(EXERCISES).forEach(([m, list]) => list.forEach((e) => {
  if (SHIPPED_MUSCLE_BY_ID[e.id] === undefined) SHIPPED_MUSCLE_BY_ID[e.id] = m;
}));

/* ---------------------------------------------------------------
   HOW TAXING AN EXERCISE IS

   Not the same thing as how many muscles it works, and the difference
   matters. A push-up reaches four muscle groups and costs almost nothing; a
   standing overhead press reaches two and costs a great deal. Coverage can be
   read off the database. Demand cannot, so it is stated here.

   These are the lifts you can only fit two or three of into one session
   before the rest of it suffers — heavy axial loading, or a full bodyweight
   moved through a long range. Two isolation lifts are in the list because
   fatigue, not classification, is what the budget is rationing: a nordic curl
   and a glute-ham raise cost more than most compounds do.
--------------------------------------------------------------- */

const HEAVY_EXERCISE_IDS = new Set([
  // Named as most fatiguing in the priority table below.
  "squat", "romanian-deadlift", "leg-press",
  "pull-ups", "bent-over-row", "deadlift",
  "dips",
  // Not in the table, so judged here on the same basis. Note the table's
  // verdict on the bench press stands: flat and incline pressing are ranked
  // below dips and are not counted as fatiguing, so neither is in this list.
  "good-morning", "glute-ham-raise", "nordic-curl",
  "bulgarian-split-squat", "hip-thrust",
  "overhead-press", "close-grip-bench", "farmers-carry",
]);

const DEMAND_HEAVY = 2;
const DEMAND_COMPOUND = 1;
const DEMAND_ISOLATION = 0;

function exerciseDemand(ex) {
  if (!ex) return DEMAND_ISOLATION;
  if (HEAVY_EXERCISE_IDS.has(ex.id)) return DEMAND_HEAVY;
  return ex.type === "compound" ? DEMAND_COMPOUND : DEMAND_ISOLATION;
}

function isHeavyExercise(ex) {
  return exerciseDemand(ex) === DEMAND_HEAVY;
}

// Every muscle group an exercise trains, direct and indirect.
function musclesHitBy(ex, muscle) {
  const primary = muscle || ex.muscle || muscleOfExerciseId(ex.id);
  const out = new Set(SECONDARY_MUSCLES[ex.id] || []);
  if (primary) out.add(primary);
  return out;
}

// EXERCISES[muscle] order doubles as the priority ranking the auto-picker
// walks, so it should open with the most productive lift and end with the
// least. Mostly it already did, but not everywhere: leg extensions sat above
// the leg press, shrugs above the farmer's carry, lateral raises above the
// upright row — fifteen isolation exercises ranked ahead of a compound in
// their own list.
//
// This is a stable sort by demand, not a re-ranking. Order within a tier is
// left exactly as it was, because that order was chosen deliberately and
// encodes preferences no rule here knows about. Only the inversions move.
//
// A user who has reordered a muscle themselves has that saved under
// "exercise-order" and it is applied after this, so their ranking still wins.
Object.keys(EXERCISES).forEach((m) => {
  EXERCISES[m] = EXERCISES[m]
    .map((e, i) => ({ e, i }))
    .sort((a, b) => exerciseDemand(b.e) - exerciseDemand(a.e) || a.i - b.i)
    .map((x) => x.e);
});

/* ---------------------------------------------------------------
   HOW MANY HEAVY LIFTS FIT IN ONE SESSION

   Three, and a session with fewer exercises than that is all of them.

   The cap does not scale with length, which is the opposite of what it looks
   like it should do. A quarter of an hour is squat, pull-up and dips and then
   you go home — nothing about being short of time makes a big lift the wrong
   choice, it makes the accessories the wrong choice. Length decides how much
   is added after the big lifts, not how many there are. Scaling the budget
   down for short sessions produced exactly the wrong thing: fifteen minutes
   came back as a squat and two isolation lifts.

   Three is where it sits because that is the top row of the priority table —
   the one heavy lift each in Legs, Back and Chest — and a fourth means a
   second heavy lift for a muscle that has already had one.
--------------------------------------------------------------- */

const MAX_HEAVY_PER_SESSION = 3;

function heavyBudgetFor(exerciseCount) {
  return Math.max(1, Math.min(MAX_HEAVY_PER_SESSION, exerciseCount || 1));
}

/* ---------------------------------------------------------------
   THE PRIORITY TABLE

   A hand-written ranking: seven families, each listing its exercises best
   first. It is the authority on what an auto-built workout reaches for.

   Read it the way it is built — across, then down. Rank one of every family
   in order is a whole-body session:

       Squat, Pull-Up, Dips, Lateral Raise, Curl, Pushdown, Hanging Leg Raise

   and a longer session carries on into rank two: RDL, Bent-Over Row, Incline
   Press, Reverse Fly, Hammer Curl, Overhead Extension, Cable Crunch. Because
   the families run largest to smallest, sweeping across them puts the big
   lifts first and the small ones last without anything having to sort it,
   and alternates the muscle worked at every step for free.

   Choosing specific muscles — a Push day, or Train Ready Muscles finding
   four muscles green — walks the same table with the families that do not
   apply left out. The ranking does not change; only which rows are in play.

   Exercises the table does not name (calves, shins, forearms, traps, glute
   accessories) are not covered by it, and fall back to the per-muscle
   ranking in EXERCISES the way everything did before.
--------------------------------------------------------------- */

const PRIORITY_FAMILIES = [
  { name: "Legs", ranked: ["squat", "romanian-deadlift", "leg-press", "leg-curl", "leg-extension"] },
  { name: "Back", ranked: ["pull-ups", "bent-over-row", "deadlift", "lat-pulldown", "chest-supported-row"] },
  { name: "Chest", ranked: ["dips", "incline-press", "pec-deck", "bench-press", "push-up"] },
  { name: "Shoulders", ranked: ["lateral-raise", "reverse-fly"] },
  { name: "Biceps", ranked: ["cable-curl", "hammer-curl"] },
  { name: "Triceps", ranked: ["pushdown", "overhead-extension"] },
  { name: "Core", ranked: ["hanging-leg-raise", "cable-crunch"] },
];

const PRIORITY_MAX_RANK = Math.max(...PRIORITY_FAMILIES.map((f) => f.ranked.length));

// Which muscle an entry in the table trains. Read live rather than written
// down, so an exercise the user has moved to another muscle stays correct.
function priorityMuscleOf(id) {
  const ex = ALL_EXERCISES_BY_ID[id];
  if (!ex) return null;
  return ex.muscle || muscleOfExerciseId(id);
}

function priorityAvailable(id, targetMuscles, usedIds) {
  const named = ALL_EXERCISES_BY_ID[id];
  if (!named) return null;
  const muscle = priorityMuscleOf(id);
  if (!muscle || !targetMuscles.has(muscle)) return null;

  // For a muscle the user has ranked themselves, the table still decides
  // *when* that muscle comes up in the session — its place among the families
  // is a training decision, not a preference — but their list decides which
  // exercise fills the slot. Substituting rather than skipping matters: skip
  // it and the muscle drops out of the workout altogether while the other
  // families quietly take its slots.
  if (MANUAL_ORDER_MUSCLES.has(muscle)) {
    const own = visibleExercises(muscle).find((e) => !usedIds.has(e.id) && !PAUSED_EXERCISE_IDS.has(e.id));
    return own ? { ...own, muscle } : null;
  }

  if (usedIds.has(id) || HIDDEN_EXERCISE_IDS.has(id) || PAUSED_EXERCISE_IDS.has(id)) return null;
  return { ...named, muscle };
}

// Walks the table across-then-down and returns what it picked, in the order
// it picked it. That order is the answer — it is not re-sorted afterwards,
// because the table already puts the session in the right shape.
//
// perMuscleCap limits how many exercises a single muscle may contribute,
// which is what the muscle-tap screen means by tapping Chest twice. Pass null
// for no cap.
//
// randomize offsets each family's starting rank by one, so asking again gives
// a different session without leaving the ranking — an RDL where the first
// pass gave a squat.
function buildByPriority(targetMuscles, perMuscleCap, exerciseCount, usedIds, plan, randomize) {
  const target = new Set(targetMuscles);
  const taken = {};
  const out = [];
  const offsets = PRIORITY_FAMILIES.map((f) => (randomize && f.ranked.length > 1 ? Math.floor(Math.random() * 2) : 0));

  for (let step = 0; step < PRIORITY_MAX_RANK && out.length < exerciseCount; step++) {
    for (let fi = 0; fi < PRIORITY_FAMILIES.length; fi++) {
      if (out.length >= exerciseCount) break;
      const fam = PRIORITY_FAMILIES[fi];
      const rank = (step + offsets[fi]) % fam.ranked.length;
      const id = fam.ranked[rank];
      if (!id) continue;
      const ex = priorityAvailable(id, target, usedIds);
      if (!ex) continue;
      const cap = perMuscleCap ? perMuscleCap[ex.muscle] || 0 : Infinity;
      if ((taken[ex.muscle] || 0) >= cap) continue;
      // The fatiguing lifts are rationed the same way here as everywhere else;
      // over budget, the family's next entry gets the slot instead.
      if (isHeavyExercise(ex) && !canTakeHeavy(plan)) continue;
      recordPick(plan, ex.muscle, ex.pattern || ex.type, ex);
      usedIds.add(ex.id);
      taken[ex.muscle] = (taken[ex.muscle] || 0) + 1;
      out.push(ex);
    }
  }
  return out;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Adds a user-created exercise to the live, in-memory exercise database (both
// EXERCISES[muscle] and the id lookup) so it's immediately selectable
// everywhere in the app, exactly like a built-in exercise.
function registerCustomExercise(ex) {
  if (!EXERCISES[ex.muscle]) EXERCISES[ex.muscle] = [];
  const exists = EXERCISES[ex.muscle].some((e) => e.id === ex.id);
  if (!exists) EXERCISES[ex.muscle].push(ex);
  ALL_EXERCISES_BY_ID[ex.id] = ex;
  // A custom compound's indirect muscles go into the same table the built-in
  // ones use, rather than being read from the exercise object at each call
  // site. Everything downstream — the readiness map's partial fatigue, the
  // half-set credit in weekly volume — keys off SECONDARY_MUSCLES[id], so
  // registering here makes a custom exercise behave like a built-in one with
  // no changes anywhere else.
  if (Array.isArray(ex.secondary) && ex.secondary.length) {
    SECONDARY_MUSCLES[ex.id] = ex.secondary.filter((m) => m !== ex.muscle);
  }
}

// Loads any previously saved custom exercises from storage into the live
// database. Call once when the app mounts, before anything reads EXERCISES.
async function loadCustomExercises() {
  const saved = (await safeGet("custom-exercises")) || [];
  saved.forEach(registerCustomExercise);
  return saved;
}

/* ---------------------------------------------------------------
   PAUSED / AVOIDED EXERCISES
   Paused exercises are excluded from automatic selection (tap-mode,
   Train Ready Muscles) but remain fully choosable by hand (specific-exercise
   picker, Add From Database mid-workout) — "don't auto-suggest this,"
   not "hide this."
--------------------------------------------------------------- */

const PAUSED_EXERCISE_IDS = new Set();

async function loadPausedExercises() {
  const saved = (await safeGet("paused-exercises")) || [];
  saved.forEach((id) => PAUSED_EXERCISE_IDS.add(id));
  return saved;
}

async function togglePausedExercise(id) {
  if (PAUSED_EXERCISE_IDS.has(id)) PAUSED_EXERCISE_IDS.delete(id);
  else PAUSED_EXERCISE_IDS.add(id);
  await safeSet("paused-exercises", [...PAUSED_EXERCISE_IDS]);
}

/* ---------------------------------------------------------------
   EXERCISE LIBRARY CUSTOMIZATION
   Backs the Exercise Database screen. Two kinds of change are stored:

   - Removed exercises are hidden from every picker and from automatic
     selection. Built-in exercises live in a module constant and can't
     truly be deleted, so "remove" is a hide that stays reversible —
     history already logged against them is never touched.
   - A custom order per muscle. EXERCISES[muscle] order doubles as the
     priority ranking pickSmartForMuscle walks, so reordering here is
     what actually changes which exercises the app reaches for first.
--------------------------------------------------------------- */

const HIDDEN_EXERCISE_IDS = new Set();

async function loadHiddenExercises() {
  const saved = (await safeGet("hidden-exercises")) || [];
  saved.forEach((id) => HIDDEN_EXERCISE_IDS.add(id));
  return saved;
}

async function setExerciseHidden(id, hidden) {
  if (hidden) HIDDEN_EXERCISE_IDS.add(id);
  else HIDDEN_EXERCISE_IDS.delete(id);
  await safeSet("hidden-exercises", [...HIDDEN_EXERCISE_IDS]);
}

// Every picker and the auto-selector read through this rather than
// EXERCISES[muscle] directly, so a removed exercise disappears everywhere
// at once.
function visibleExercises(muscle) {
  return (EXERCISES[muscle] || []).filter((e) => !HIDDEN_EXERCISE_IDS.has(e.id));
}

// Reorders EXERCISES[muscle] in place to match a saved id order. Ids the
// save doesn't know about (a new built-in shipped in an app update, or a
// custom exercise added since) keep their relative order and land at the
// end, so an old save can never silently drop an exercise.
function applyStoredOrder(muscle, orderedIds) {
  const list = EXERCISES[muscle];
  if (!list) return;
  const rank = new Map(orderedIds.map((id, i) => [id, i]));
  const known = [];
  const unknown = [];
  list.forEach((e) => (rank.has(e.id) ? known : unknown).push(e));
  known.sort((a, b) => rank.get(a.id) - rank.get(b.id));
  EXERCISES[muscle] = [...known, ...unknown];
}

// Muscles whose ranking the user has deliberately rearranged with the arrows
// on the Exercise Database screen. Kept apart from "exercise-order" itself
// because that key is also rewritten whenever an exercise is added, deleted
// or edited — which is bookkeeping, not a preference, and must not be read as
// one. Only a press of the up/down arrows lands a muscle in here.
//
// It exists because two things the app promises can disagree. The priority
// table decides what an auto-built workout reaches for; the database screen
// promises that reordering a muscle changes what gets suggested first. Where
// someone has actually reordered a muscle, their ranking wins for it and the
// table stands aside.
const MANUAL_ORDER_MUSCLES = new Set();

async function loadManualOrderMuscles() {
  const saved = (await safeGet("exercise-order-manual")) || [];
  saved.forEach((m) => MANUAL_ORDER_MUSCLES.add(m));
  return saved;
}

async function markMuscleManuallyOrdered(muscle) {
  if (!muscle || MANUAL_ORDER_MUSCLES.has(muscle)) return;
  MANUAL_ORDER_MUSCLES.add(muscle);
  await safeSet("exercise-order-manual", [...MANUAL_ORDER_MUSCLES]);
}

async function loadExerciseOrder() {
  const saved = (await safeGet("exercise-order")) || {};
  Object.entries(saved).forEach(([muscle, ids]) => applyStoredOrder(muscle, ids));
  return saved;
}

async function saveMuscleOrder(muscle) {
  const saved = (await safeGet("exercise-order")) || {};
  saved[muscle] = (EXERCISES[muscle] || []).map((e) => e.id);
  await safeSet("exercise-order", saved);
}

/* ---------------------------------------------------------------
   EDITING AN EXERCISE

   Before this, correcting an exercise meant deleting it and adding it
   back, which orphaned every set ever logged against it: history, PBs and
   charts all key off the id, and a re-add mints a new one.

   So an edit keeps the id and changes only the description hanging off it.
   Custom exercises are rewritten where they are stored. Built-ins cannot
   be — they live in a module constant — so their changes are kept as a
   sparse overlay under "exercise-edits" and reapplied at boot, which also
   makes reverting to the shipped values a matter of dropping the entry.

   Most of an edit needs nothing else done. Indirect muscles, the implement
   list, the cue and the type are all read live from the database at the
   point of use, so changing them applies to sessions logged years ago with
   no rewrite at all — add Traps to an exercise and last month's rows start
   counting toward them immediately.

   Name and primary muscle are the exceptions. Both are copied into each
   session as it is saved, so a session records what the exercise was called
   on the day. Those copies are what rewriteExerciseIdentity goes and fixes.
--------------------------------------------------------------- */

const EXERCISE_EDITS = {};

// The fields an edit may change. The id is deliberately not among them: it
// is the identity every stored record hangs off, and changing it would be
// the delete-and-re-add this feature exists to avoid.
const EDITABLE_FIELDS = ["name", "muscle", "type", "cue", "secondary"];

// Neither of the two fields an edit cares most about is actually on the
// exercise object. A built-in's indirect muscles live in SECONDARY_MUSCLES
// keyed by id, and its primary muscle is only implied by which EXERCISES
// bucket holds it — the shipped objects carry no muscle field at all.
// Read either one straight off the object and you get undefined, and saving
// that back would strip a hammer curl's forearms and file it under whatever
// muscle happened to be first in the list. So everything that reads or
// compares an exercise for editing goes through here, which resolves both
// and makes the two storage shapes look like one.
function editableForm(ex, secondaryTable, muscleTable) {
  if (!ex) return null;
  const sec = secondaryTable || SECONDARY_MUSCLES;
  const mus = muscleTable || null;
  return {
    ...ex,
    muscle: ex.muscle || (mus ? mus[ex.id] : muscleOfExerciseId(ex.id)) || null,
    secondary: ex.secondary || sec[ex.id] || [],
  };
}

function patchOf(base, next) {
  const patch = {};
  for (const f of EDITABLE_FIELDS) {
    const a = base[f];
    const b = next[f];
    const norm = (v) => JSON.stringify(v === undefined || v === null || (Array.isArray(v) && !v.length) ? null : v);
    if (norm(a) !== norm(b)) patch[f] = b;
  }
  return patch;
}

// Rebuilds the exercise from a patch and swaps the new object into both
// EXERCISES[muscle] and the id lookup, moving it between muscle buckets if
// the primary muscle changed. In memory only — the caller persists.
function applyExercisePatch(id, patch) {
  const current = ALL_EXERCISES_BY_ID[id];
  if (!current) return null;
  const from = muscleOfExerciseId(id);
  const wasAt = from ? (EXERCISES[from] || []).findIndex((e) => e.id === id) : -1;
  const next = { ...current };
  for (const f of EDITABLE_FIELDS) {
    if (!(f in patch)) continue;
    if (patch[f] === undefined || patch[f] === null || (Array.isArray(patch[f]) && !patch[f].length)) delete next[f];
    else next[f] = patch[f];
  }
  const to = next.muscle || from;
  next.muscle = to;

  if (from && EXERCISES[from]) EXERCISES[from] = EXERCISES[from].filter((e) => e.id !== id);
  if (!EXERCISES[to]) EXERCISES[to] = [];
  // Land it back where it sat rather than at the bottom, so an edit that
  // does not move it leaves the priority ranking alone. A genuine move to
  // another muscle goes on the end of that muscle's list, which is where a
  // newly added exercise goes too.
  const at = from === to && wasAt >= 0 ? Math.min(wasAt, EXERCISES[to].length) : EXERCISES[to].length;
  EXERCISES[to].splice(at, 0, next);
  ALL_EXERCISES_BY_ID[id] = next;

  // Clearing every secondary has to delete the key, not write an empty
  // array — readiness and volume both test the array's contents, and a
  // built-in reverting to its shipped value needs the key gone first.
  const sec = (next.secondary || []).filter((m) => m !== to);
  if (sec.length) SECONDARY_MUSCLES[id] = sec;
  else delete SECONDARY_MUSCLES[id];

  return { from, to, exercise: next };
}

// Rewrites the copies of an exercise's name and muscle that were written
// into stored records at the time they were saved. Everything else about an
// exercise is looked up live, so this is the whole of what an edit has to
// chase down. Each key is only written if it actually changed.
async function rewriteExerciseIdentity(id, name, muscle) {
  const fixList = (list) =>
    Array.isArray(list) ? list.map((e) => (e && e.id === id ? { ...e, ...(e.name !== undefined ? { name } : {}), ...(e.muscle !== undefined ? { muscle } : {}) } : e)) : list;
  const changed = (before, after) => JSON.stringify(before) !== JSON.stringify(after);

  const history = await safeGet("workout-history");
  if (Array.isArray(history)) {
    const next = history.map((s) => ({ ...s, exercises: fixList(s.exercises) }));
    if (changed(history, next)) await safeSet("workout-history", next);
  }

  const snapshot = await safeGet("in-progress-workout");
  if (snapshot && Array.isArray(snapshot.exercises)) {
    const next = { ...snapshot, exercises: fixList(snapshot.exercises) };
    if (changed(snapshot, next)) await safeSet("in-progress-workout", next);
  }

  const templates = await safeGet("templates");
  if (Array.isArray(templates)) {
    const next = templates.map((t) => ({ ...t, exercises: fixList(t.exercises) }));
    if (changed(templates, next)) await safeSet("templates", next);
  }

  const fixProgramme = (p) => (p && Array.isArray(p.days) ? { ...p, days: p.days.map((d) => ({ ...d, exercises: fixList(d.exercises) })) } : p);
  const active = await safeGet("active-programme");
  if (active) {
    const next = fixProgramme(active);
    if (changed(active, next)) await safeSet("active-programme", next);
  }
  const finished = await safeGet("finished-programmes");
  if (Array.isArray(finished)) {
    const next = finished.map(fixProgramme);
    if (changed(finished, next)) await safeSet("finished-programmes", next);
  }

  // A personal best carries the name it was set under, so a rename that
  // missed it would leave the PB screen disagreeing with everything else.
  const pb = await safeGet(`pb:${id}`);
  if (pb && pb.name !== undefined && pb.name !== name) await safeSet(`pb:${id}`, { ...pb, name });
}

// Keeps the saved priority ranking honest after an edit: the id leaves the
// muscle it came from and joins the one it moved to.
async function reorderAfterMove(from, to) {
  if (from) await saveMuscleOrder(from);
  if (to && to !== from) await saveMuscleOrder(to);
}

async function saveExerciseEdit(id, next) {
  const current = ALL_EXERCISES_BY_ID[id];
  if (!current) return;
  const patch = patchOf(editableForm(current), next);
  if (!Object.keys(patch).length) return;
  const result = applyExercisePatch(id, patch);
  if (!result) return;

  if (current.custom) {
    const saved = (await safeGet("custom-exercises")) || [];
    await safeSet("custom-exercises", saved.map((e) => (e.id === id ? { ...result.exercise } : e)));
  } else {
    // Overlay, not a rewrite. Accumulated against the shipped values rather
    // than the current ones, so a second edit does not depend on the first
    // still being applied when it is replayed at boot.
    EXERCISE_EDITS[id] = patchOf(
      editableForm(SHIPPED_EXERCISE_BY_ID[id] || current, SHIPPED_SECONDARY_MUSCLES, SHIPPED_MUSCLE_BY_ID),
      editableForm(result.exercise),
    );
    if (!Object.keys(EXERCISE_EDITS[id]).length) delete EXERCISE_EDITS[id];
    await safeSet("exercise-edits", EXERCISE_EDITS);
  }

  await reorderAfterMove(result.from, result.to);
  await rewriteExerciseIdentity(id, result.exercise.name, result.exercise.muscle);
}

// Built-ins only. Puts the shipped name, muscle, type, cue and indirect
// muscles back, and takes the history with it — a revert is just an edit
// whose target happens to be what the app came with.
async function revertExerciseEdit(id) {
  const shipped = SHIPPED_EXERCISE_BY_ID[id];
  if (!shipped) return;
  delete EXERCISE_EDITS[id];
  await safeSet("exercise-edits", EXERCISE_EDITS);
  const shippedMuscle = SHIPPED_MUSCLE_BY_ID[id] || muscleOfExerciseId(id);
  const result = applyExercisePatch(id, {
    name: shipped.name,
    muscle: shippedMuscle,
    type: shipped.type,
    cue: shipped.cue,
    secondary: SHIPPED_SECONDARY_MUSCLES[id] || null,
  });
  if (!result) return;
  await reorderAfterMove(result.from, result.to);
  await rewriteExerciseIdentity(id, shipped.name, shippedMuscle);
}

function isEdited(id) {
  return Object.prototype.hasOwnProperty.call(EXERCISE_EDITS, id);
}

// Replays stored edits into the live database. Runs after custom exercises
// are registered, so an edit to one of those is applied to the entry it
// belongs to rather than to nothing.
async function loadExerciseEdits() {
  const saved = (await safeGet("exercise-edits")) || {};
  Object.entries(saved).forEach(([id, patch]) => {
    if (!ALL_EXERCISES_BY_ID[id] || !patch || typeof patch !== "object") return;
    EXERCISE_EDITS[id] = patch;
    applyExercisePatch(id, patch);
  });
  return EXERCISE_EDITS;
}

// Custom exercises are the only ones that can be deleted outright, since
// nothing in the shipped database depends on them existing.
async function deleteCustomExercise(id, muscle) {
  if (EXERCISES[muscle]) EXERCISES[muscle] = EXERCISES[muscle].filter((e) => e.id !== id);
  delete ALL_EXERCISES_BY_ID[id];
  const prev = (await safeGet("custom-exercises")) || [];
  await safeSet("custom-exercises", prev.filter((e) => e.id !== id));
  await saveMuscleOrder(muscle);
}

// The "big lift" exercise ids that track a stored PB, used to seed 1RM
// estimates and progress milestones.
const PB_EXERCISE_IDS = ["bench-press", "pull-ups", "dips", "overhead-press", "deadlift", "squat"];

// A set beats a stored PB if it's a heavier weight, or ties the weight with more reps.
function beatsRecord(candidate, stored) {
  if (!candidate) return false;
  if (!stored) return true;
  const w = parseFloat(candidate.weight) || 0;
  const sw = parseFloat(stored.weight) || 0;
  if (w > sw) return true;
  if (w === sw && (parseFloat(candidate.reps) || 0) > (parseFloat(stored.reps) || 0)) return true;
  return false;
}
function bodyWeightPct(weight, bw) {
  const w = parseFloat(weight);
  if (!w || !bw) return null;
  return Math.round((w / bw) * 100);
}

/* ---------------------------------------------------------------
   ONE-REP MAX GOALS
   Weighted lifts use the Epley formula and an NSCA-style progressive
   warm-up ramp (50/70/85/92% before the attempt, resting longer as
   intensity climbs). Pull-Ups and Dips are tracked by bodyweight reps,
   not added load, per how they're actually trained.
--------------------------------------------------------------- */

// Assisted variants belong here too: their "weight" is how much load is
// taken off you, so more of it means a weaker lift. Running that through
// the Epley formula would read backwards, whereas max reps stays honest.
const BODYWEIGHT_LIFT_IDS = ["pull-ups", "dips"];

// Epley formula: a standard, widely-cited way to estimate 1RM from a
// submaximal set. Most reliable within ~1-10 reps of true failure.
function estimateOneRM(weight, reps) {
  const w = parseFloat(weight);
  const r = parseFloat(reps);
  if (!w || !r) return null;
  return Math.round(w * (1 + r / 30));
}

function roundToPlate(weight, unit) {
  const increment = unit === "kg" ? 2.5 : 5;
  return Math.max(increment, Math.round(weight / increment) * increment);
}

// Best current estimate for a lift: a manually logged 1RM if the person has
// entered one (an exact real number beats a formula guess), otherwise the
// stored PB if one exists, otherwise derived from the most recent session's
// top set. Bodyweight lifts use max reps directly — no load math needed.
// Returns { value, isManual, date } so the UI can show whether a number is a
// logged fact or an estimate.
async function getCurrentEstimate(exerciseId) {
  const manual = await safeGet(`manual-1rm:${exerciseId}`);
  if (manual && manual.value) return { value: manual.value, isManual: true, date: manual.date };
  const isBodyweight = BODYWEIGHT_LIFT_IDS.includes(exerciseId);
  const pb = await safeGet(`pb:${exerciseId}`);
  if (isBodyweight) {
    if (pb && pb.reps) return { value: parseFloat(pb.reps), isManual: false };
    const hist = (await safeGet(`ex-history:${exerciseId}`)) || [];
    let best = 0;
    hist.forEach((h) => h.sets.forEach((s) => (best = Math.max(best, parseFloat(s.reps) || 0))));
    return { value: best || null, isManual: false };
  }
  if (pb && pb.weight && pb.reps) return { value: estimateOneRM(pb.weight, pb.reps), isManual: false };
  const hist = (await safeGet(`ex-history:${exerciseId}`)) || [];
  if (hist.length === 0) return { value: null, isManual: false };
  const latest = hist[hist.length - 1];
  const top = getTopSet(latest.sets);
  return { value: top ? estimateOneRM(top.weight, top.reps) : null, isManual: false };
}

// Rough weekly progression rates by training experience, drawn from general
// strength-training literature: novices see fast early gains (untrained
// lifters often add ~15-30% over 12 weeks), intermediates progress roughly
// monthly, advanced lifters see single-digit % gains per year. These are
// population averages, not a guarantee for any individual.
const PROGRESSION_RATES = {
  beginner: { pctPerWeek: 0.01, repsPerWeek: 0.5 },
  intermediate: { pctPerWeek: 0.0035, repsPerWeek: 0.25 },
  advanced: { pctPerWeek: 0.0015, repsPerWeek: 0.125 },
};

const TRAINING_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "< 1 year consistent training" },
  { value: "intermediate", label: "Intermediate", desc: "1-3 years consistent training" },
  { value: "advanced", label: "Advanced", desc: "3+ years consistent training" },
];

// Estimates how many weeks a target realistically needs from current, given
// training experience. Clamped to a sane 2-52 week range — outside that it
// stops being a useful weekly plan either way.
function calculateWeeksNeeded(current, target, level, isBodyweight) {
  const rate = PROGRESSION_RATES[level] || PROGRESSION_RATES.intermediate;
  const diff = target - current;
  if (diff <= 0) return 2;
  const weeklyGain = isBodyweight ? rate.repsPerWeek : current * rate.pctPerWeek;
  const weeksNeeded = diff / Math.max(weeklyGain, 0.0001);
  return Math.min(52, Math.max(2, Math.ceil(weeksNeeded)));
}

// Linear ramp from current to target across N weeks. Deliberately simple —
// presented as a steady weekly progression, not a scientifically optimized
// periodization model.
function buildProgressionJourney(current, target, weeks, isBodyweight, unit) {
  const milestones = [];
  const start = new Date();
  for (let w = 1; w <= weeks; w++) {
    const frac = w / weeks;
    let value = current + (target - current) * frac;
    value = isBodyweight ? Math.round(value) : roundToPlate(value, unit);
    const d = new Date(start);
    d.setDate(d.getDate() + w * 7);
    milestones.push({ week: w, date: d.toISOString().slice(0, 10), value });
  }
  return milestones;
}

// Which milestone applies right now, based on weeks elapsed since the goal was created.
function currentMilestone(goal) {
  const weeksElapsed = Math.floor((Date.now() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7));
  const idx = Math.min(goal.milestones.length - 1, Math.max(0, weeksElapsed));
  return goal.milestones[idx];
}

// NSCA-style progressive ramp toward a single-rep attempt: ~50%/70%/85%/92%
// at descending reps, then the attempt itself, with rest increasing as
// intensity climbs.
function buildOneRMRamp(target, isBodyweight, unit) {
  if (isBodyweight) {
    return [
      { label: "Warm-up 1", reps: Math.max(1, Math.round(target * 0.5)), rest: 90 },
      { label: "Warm-up 2", reps: Math.max(1, Math.round(target * 0.7)), rest: 120 },
      { label: "Attempt", reps: target, rest: null },
    ];
  }
  return [
    { label: "Warm-up 1", weight: roundToPlate(target * 0.5, unit), reps: 8, rest: 120 },
    { label: "Warm-up 2", weight: roundToPlate(target * 0.7, unit), reps: 3, rest: 150 },
    { label: "Warm-up 3", weight: roundToPlate(target * 0.85, unit), reps: 2, rest: 180 },
    { label: "Warm-up 4", weight: roundToPlate(target * 0.92, unit), reps: 1, rest: 240 },
    { label: "Attempt", weight: target, reps: 1, rest: null },
  ];
}

/* ---------------------------------------------------------------
   REST TIMER
   Science-backed rest windows: ~2-3min for heavy compounds (favors
   strength/power recovery between big lifts), ~60-90s for isolation
   work (still enough for hypertrophy without excess session length).
--------------------------------------------------------------- */

const REST_SECONDS = { compound: 120, isolation: 90 };

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // audio not available — fail silently
  }
}

// The rest countdown is identical in the workout screen and the 1RM test
// day, so it lives here rather than being written out twice. Ticks once a
// second, clears itself on unmount, and beeps on zero if the setting is on.
function useRestCountdown(timer, setTimer, soundOn) {
  useEffect(() => {
    if (!timer || timer.paused || timer.seconds <= 0) return;
    const t = setTimeout(() => {
      setTimer((prev) => {
        if (!prev) return prev;
        const next = prev.seconds - 1;
        if (next <= 0) {
          if (soundOn) playBeep();
          return null;
        }
        return { ...prev, seconds: next };
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [timer, setTimer, soundOn]);
}

// Ramps up to the last top-set weight: 40% x8, 60% x5, 80% x3.
//
// The rounding step has to follow the load rather than sit at a fixed 5kg.
// A cable stack at 5.7kg used to round all three steps to 5kg and then floor
// them there, so the "warm-up" was three identical sets heavier than the
// working set. Steps now scale with the weight, nothing is suggested at or
// above the top set, and a ramp that collapses to fewer than two distinct
// steps is dropped — a lift that light has nothing to ramp through.
function warmupSets(topWeight) {
  const w = parseFloat(topWeight);
  const scheme = [
    { pct: 40, reps: 8 },
    { pct: 60, reps: 5 },
    { pct: 80, reps: 3 },
  ];
  if (!w || w <= 0) {
    // No prior weight to base loads on — still give tickable ramp-up steps,
    // labelled by intensity rather than an exact number.
    return scheme.map((s) => ({ weight: `${s.pct}%`, reps: s.reps, placeholder: true }));
  }
  const step = w < 20 ? 0.5 : w < 60 ? 2.5 : 5;
  const seen = new Set();
  const out = [];
  for (const s of scheme) {
    const weight = Math.round((w * s.pct) / 100 / step) * step;
    if (weight <= 0 || weight >= w) continue;
    const label = String(Math.round(weight * 10) / 10);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ weight: label, reps: s.reps });
  }
  return out.length >= 2 ? out : [];
}

/* ---------------------------------------------------------------
   UI PRIMITIVES
--------------------------------------------------------------- */

/* ---------------------------------------------------------------
   COLOUR SCHEMES

   The readiness map is the app's central screen and it was red, amber and
   green — which is the single worst triple for the most common form of
   colour blindness. Roughly one man in twelve cannot reliably tell this
   app's "recovering" from its "ready". That is not a rounding error on a
   feature; it is the feature.

   So the palette is switchable. Each scheme restates every colour that
   carries meaning: the three readiness states, the good/bad pair on set
   outlines, the accent, and the series colours supersets and charts draw
   from. Nothing else about the app changes.

   ON THE CHOICE OF SCHEMES

   Deuteranopia and protanopia are both red-green deficiencies and the
   research palettes treat them together, so they share one scheme here.
   Offering two that differed only cosmetically would look more thorough and
   be worth less. Tritanopia is a different axis and gets its own. Total
   colour blindness gets a luminance ramp, because for those users hue is
   not a channel at all.

   The red-green and blue-yellow palettes are derived from Okabe & Ito's
   colour-universal set, which was designed for exactly this and tested
   rather than guessed at.

   COLOUR IS NEVER THE ONLY CHANNEL

   Every non-default scheme also turns on outline shapes — a solid ring for
   recovering, a dashed one for almost ready, none for ready. A palette can
   be defeated by a bad screen, low light or a form of deficiency no preset
   anticipates. An outline cannot.
--------------------------------------------------------------- */

const COLOUR_SCHEMES = {
  default: {
    label: "Standard",
    desc: "Red, amber and green. The original palette.",
    shapes: false,
    dark: {
      accent: "#FF6A1A", accentDim: "#7A3A16", onAccent: "#1A1200",
      ok: "#7FD858", bad: "#F26A6A",
      stages: { red: "#F26A6A", amber: "#E5B93E", green: "#5FB86B" },
      series: ["#4CC2FF", "#B48CFF", "#7FD858", "#FF7AB6", "#FFC15E", "#5AD6C0"],
      rir: "#7B8CFF",
    },
    light: {
      accent: "#C2410C", accentDim: "#F0C9B4", onAccent: "#FFFFFF",
      ok: "#2E7D32", bad: "#C62F2F",
      stages: { red: "#C62F2F", amber: "#8A6400", green: "#2E7D32" },
      neutral: "#BFC3C7",
      series: ["#0B72B5", "#7B3FBF", "#2E7D32", "#C2185B", "#B26A00", "#00796B"],
      rir: "#3F51B5",
    },
  },
  redGreen: {
    label: "Red–green",
    desc: "For deuteranopia and protanopia, the common kinds. Readiness moves onto a blue-to-orange scale, which stays readable when red and green do not.",
    shapes: true,
    dark: {
      accent: "#E69F00", accentDim: "#6B4A00", onAccent: "#1A1200",
      ok: "#56B4E9", bad: "#D55E00",
      stages: { red: "#D55E00", amber: "#F0E442", green: "#56B4E9" },
      series: ["#56B4E9", "#009E73", "#F0E442", "#E69F00", "#CC79A7", "#0072B2"],
      rir: "#0072B2",
    },
    // Not the dark palette darkened. Bright yellow is invisible on white, and
    // simply darkening both warm colours collapsed them into each other: the
    // first attempt separated recovering from almost-ready by 4 under
    // deuteranopia, which is no separation at all. The luminance gap the dark
    // scheme gets from a bright yellow has to be rebuilt downwards instead,
    // so recovering goes very dark and almost-ready sits well above it.
    light: {
      accent: "#A15C00", accentDim: "#E8D2AF", onAccent: "#FFFFFF",
      ok: "#00588C", bad: "#5A1E00",
      stages: { red: "#5A1E00", amber: "#CE6E00", green: "#00588C" },
      neutral: "#BFC3C7",
      series: ["#00588C", "#00695C", "#8A6D00", "#A15C00", "#8E3A6B", "#3B2C8C"],
      rir: "#004C8C",
    },
  },
  blueYellow: {
    label: "Blue–yellow",
    desc: "For tritanopia. Blue and yellow are the pair that go, so readiness uses red, pink and green instead.",
    shapes: true,
    dark: {
      accent: "#E24A8C", accentDim: "#6B2142", onAccent: "#1A0410",
      ok: "#3FAF6B", bad: "#E24A4A",
      stages: { red: "#E24A4A", amber: "#E58FC2", green: "#3FAF6B" },
      series: ["#E24A4A", "#3FAF6B", "#E58FC2", "#8C6D3F", "#C2C2C2", "#7A3FAF"],
      rir: "#B06BD6",
    },
    light: {
      accent: "#A8246B", accentDim: "#F0C2DA", onAccent: "#FFFFFF",
      ok: "#256B2C", bad: "#C62828",
      stages: { red: "#C62828", amber: "#A83A78", green: "#256B2C" },
      neutral: "#BFC3C7",
      series: ["#C62828", "#256B2C", "#A83A78", "#6D4C1B", "#5A5A5A", "#5B2E8C"],
      rir: "#6D2E8C",
    },
  },
  mono: {
    label: "Monochrome",
    desc: "No colour at all. Readiness is told by brightness and by outline, for total colour blindness or any screen where hue cannot be trusted.",
    shapes: true,
    dark: {
      accent: "#E8E4DC", accentDim: "#5A5852", onAccent: "#15171A",
      ok: "#F2EFE9", bad: "#5C6166",
      stages: { red: "#6E7378", amber: "#B0B5B9", green: "#F2EFE9" },
      neutral: "#33383D",
      series: ["#F2EFE9", "#B9BDC0", "#8A8F93", "#63686C", "#D6D2CB", "#A0A5A9"],
      rir: "#B9BDC0",
    },
    // The ramp turns over rather than inverting: ready is the most prominent
    // in both themes, which on a dark ground means the brightest and on a
    // light one means the darkest.
    light: {
      accent: "#33383D", accentDim: "#D2D6D9", onAccent: "#FFFFFF",
      ok: "#191C1F", bad: "#7E8387",
      stages: { red: "#7E8387", amber: "#4C5054", green: "#191C1F" },
      neutral: "#CBCFD2",
      series: ["#191C1F", "#3A3E42", "#5C6166", "#7E8387", "#2A2E32", "#6A6F73"],
      rir: "#3A3E42",
    },
  },
};

const COLOUR_SCHEME_ORDER = ["default", "redGreen", "blueYellow", "mono"];

// The neutral chrome. High contrast replaces these wholesale rather than
// nudging them: the point is a screen that survives direct sunlight through
// a gym window, not a slightly darker grey.
const CHROME = {
  dark: {
    normal: { bg: "#15171A", surface: "#1D2023", surfaceRaised: "#24282C", line: "#33383D", text: "#F2EFE9", textDim: "#9A9D9F" },
    high:   { bg: "#000000", surface: "#0B0D0F", surfaceRaised: "#16191C", line: "#7E868C", text: "#FFFFFF", textDim: "#D2D6D9" },
  },
  // Light is not the dark palette inverted. Surfaces have to separate without
  // a dark ground to sit on, so the card is the lightest thing on the screen
  // and the page behind it is slightly darker — the opposite of dark mode,
  // where the card is lifted by being lighter than the page.
  light: {
    normal: { bg: "#F1EEE9", surface: "#FFFFFF", surfaceRaised: "#E7E3DC", line: "#D3CEC5", text: "#1A1C1F", textDim: "#5C6166" },
    high:   { bg: "#FFFFFF", surface: "#FFFFFF", surfaceRaised: "#EFECE6", line: "#2A2E32", text: "#000000", textDim: "#2A2E32" },
  },
};

const THEME_MODES = [
  { value: "system", label: "System", desc: "Follow whatever your phone is set to." },
  { value: "dark", label: "Dark", desc: "The original. Easier on the eyes in a dim gym." },
  { value: "light", label: "Light", desc: "For bright rooms and daylight." },
];

// "system" is resolved once here rather than being carried around as a third
// state, so everything downstream only ever deals with dark or light.
function resolveTheme(mode) {
  if (mode === "dark" || mode === "light") return mode;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}

const NEUTRAL_DARK = "#5A626A";

// Read at render time by every screen, so switching theme or scheme is a
// matter of rewriting these objects and re-rendering rather than threading a
// theme through 700 call sites.
const COLORS = {
  ...CHROME.dark.normal,
  accent: "#FF6A1A",
  accentDim: "#7A3A16",
  onAccent: "#1A1200",
  ok: "#7FD858",
  bad: "#F26A6A",
};

// Three flat colours rather than a gradient. The question the map answers is
// "can I train this today?", and a continuous blend makes the moment a muscle
// crosses into ready impossible to see.
const STAGE_COLORS = { red: "#F26A6A", amber: "#E5B93E", green: "#5FB86B" };

const STAGE_SHAPES = {
  red: { width: 0.55, dash: null },
  amber: { width: 0.55, dash: "1.2 0.9" },
  green: { width: 0, dash: null },
};

// The outline has to stand out from the muscle it is drawn on, not from the
// page. Drawing it in the text colour works on a dark theme, where the fills
// are bright — on a light one the fills are dark and a near-black outline
// disappears into them, which is exactly the channel that was supposed to be
// the reliable one. So pick whichever of the two extremes contrasts more with
// the fill itself.
function relativeLuminance(hex) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function outlineColorFor(fill) {
  return contrastRatio(COLORS.text, fill) >= contrastRatio(COLORS.bg, fill) ? COLORS.text : COLORS.bg;
}

const SUPERSET_COLORS = [...COLOUR_SCHEMES.default.dark.series];

const THEME = { mode: "system", theme: "dark", scheme: "default", highContrast: false, shapes: false, rir: null };

// Rewrites the live palette in place. Everything that paints reads these
// objects during render, so the whole app recolours on the next paint.
function applyTheme(themeMode, schemeKey, highContrast) {
  const theme = resolveTheme(themeMode);
  const scheme = COLOUR_SCHEMES[schemeKey] || COLOUR_SCHEMES.default;
  const pal = scheme[theme] || scheme.dark;
  const chrome = CHROME[theme][highContrast ? "high" : "normal"];

  Object.assign(COLORS, chrome, {
    accent: pal.accent,
    accentDim: pal.accentDim,
    onAccent: pal.onAccent,
    ok: pal.ok,
    bad: pal.bad,
  });
  Object.assign(STAGE_COLORS, pal.stages);
  NEUTRAL_BOX.value = pal.neutral || NEUTRAL_DARK;
  SUPERSET_COLORS.length = 0;
  SUPERSET_COLORS.push(...pal.series);

  THEME.mode = themeMode || "system";
  THEME.theme = theme;
  THEME.scheme = COLOUR_SCHEMES[schemeKey] ? schemeKey : "default";
  THEME.highContrast = !!highContrast;
  // High contrast turns the outlines on whatever the scheme, since someone
  // who has asked for maximum legibility wants every channel it can give.
  THEME.shapes = !!scheme.shapes || !!highContrast;
  THEME.rir = pal.rir;

  // The page background and the Android status-bar colour are set in
  // index.html, outside React, so they have to be told separately — without
  // this, a light theme leaves a dark band above and below a white app.
  if (typeof document !== "undefined") {
    document.body.style.background = COLORS.bg;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", COLORS.bg);
  }
}

const STAGE_LABELS = { red: "recovering", amber: "almost ready", green: "ready" };
// The legend states the rule outright rather than repeating the words above:
// amber is always "less than a day to go", never a vaguer sense of nearly.
const STAGE_LEGEND = [
  ["red", "24h+ to go"],
  ["amber", "under 24h"],
  ["green", "ready"],
];

function TopBar({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "22px 20px 14px", gap: 10 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 12,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.text,
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 22,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: COLORS.text,
        }}
      >
        {title}
      </div>
    </div>
  );
}

// Progress rail shared by the two programme wizards — the manual builder
// and the guided one. Both walk a fixed list of named steps, so the only
// thing that differs is the labels.
function WizardSteps({ labels, step }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "0 20px 14px" }}>
      {labels.map((lbl, i) => (
        <div key={lbl} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 4, borderRadius: 2, background: i <= step ? COLORS.accent : COLORS.line, marginBottom: 5 }} />
          <div style={{ fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase", color: i <= step ? COLORS.accent : COLORS.textDim }}>
            {lbl}
          </div>
        </div>
      ))}
    </div>
  );
}

// The split name plus date/exercise-count/muscles line that identifies a
// logged session, used by both the history list and Copy Previous.
function SessionSummary({ session, muscles }) {
  return (
    <div>
      <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase" }}>
        {session.split}
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}>
        {session.date} · {session.exercises.length} exercise{session.exercises.length === 1 ? "" : "s"} · {muscles.join(", ")}
      </div>
    </div>
  );
}

// A single row in an "add exercise" list — renders as a plain add button
// for a standalone exercise, or as a "N versions" row for a variant family
// that opens the tile sheet above when tapped.
function ExercisePickerRow({ exercise, onAdd, addIcon, buttonStyle }) {
  return (
    <button onClick={() => onAdd(exercise)} style={buttonStyle}>
      <span style={{ color: COLORS.text, fontSize: 13 }}>{exercise.name}</span>
      {addIcon}
    </button>
  );
}

// Collapsed-by-default body-part section used by every "add exercise"
// picker — keeps a long exercise database from turning into one giant
// scrolling list. isOpen is driven by the parent (collapsed unless the
// user has tapped it open, or a search query is active and this muscle
// has matches).
function MuscleAccordion({ muscle, count, isOpen, onToggle, children }) {
  return (
    <div style={{ marginBottom: 8, border: `1px solid ${COLORS.line}`, borderRadius: 10, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surfaceRaised, border: "none", padding: "11px 12px" }}
      >
        <span style={{ color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
          {muscle}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          {count}
          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// The "search the database and add one exercise" panel, shared by the
// programme day editor, the mid-workout add button and the history editor.
// All three had their own copy of this — same search box, same body-part
// accordions, same grouped rows — differing only in surface colour and what
// they did with the pick.
//
// Search text and which accordions are open live in here rather than in the
// callers: every site renders this conditionally, so unmounting the panel
// resets both, which is the behaviour each caller was hand-rolling anyway.
// Picking a variant family is delegated upward, since the callers own the
// sheet and need their own context (which day, which draft) to add to it.
function ExerciseSearchPicker({ excludeIds, onAdd, surface, autoFocus, maxHeight }) {
  const [query, setQuery] = useState("");
  const [openMuscles, setOpenMuscles] = useState(new Set());
  const bg = surface || COLORS.surfaceRaised;
  const q = query.trim().toLowerCase();
  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: bg,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "9px 12px",
    textAlign: "left",
  };
  const toggle = (m) =>
    setOpenMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const sections = Object.keys(EXERCISES)
    .map((m) => ({ muscle: m, options: visibleExercises(m).filter((e) => !excludeIds.has(e.id) && exerciseMatchesQuery(e, q)) }))
    .filter((sec) => sec.options.length > 0);

  return (
    <>
      <input
        type="text"
        autoFocus={autoFocus}
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", background: bg, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 12px", color: COLORS.text, fontSize: 13, marginBottom: 12 }}
      />
      <div style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
        {sections.length === 0 ? (
          <div style={{ color: COLORS.textDim, fontSize: 12.5, padding: "6px 2px" }}>No matches.</div>
        ) : (
          sections.map(({ muscle, options }) => (
            <div key={muscle} style={{ marginBottom: 8 }}>
              <MuscleAccordion muscle={muscle} count={options.length} isOpen={q ? true : openMuscles.has(muscle)} onToggle={() => toggle(muscle)}>
                {options.map((ex) => (
                  <ExercisePickerRow
                    key={ex.id}
                    exercise={ex}
                    buttonStyle={rowStyle}
                    addIcon={<Plus size={14} color={COLORS.accent} />}
                    onAdd={(picked) => onAdd(picked, muscle)}
                  />
                ))}
              </MuscleAccordion>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------
   NEW EXERCISE FORM
   Reusable form for adding a custom exercise to the live database,
   used both from the muscle-selection page and mid-workout.
--------------------------------------------------------------- */

// Doubles as the edit form. Passed an `initial` exercise it opens filled in
// and keeps that exercise's id on save, which is the whole point: the id is
// what every logged set, PB and chart hangs off, so editing must not mint a
// new one the way adding does.
function NewExerciseForm({ muscles, defaultMuscle, onSave, onCancel, initial }) {
  const editing = !!initial;
  const [name, setName] = useState(initial ? initial.name : "");
  const [muscle, setMuscle] = useState((initial && initial.muscle) || defaultMuscle || muscles[0]);
  const [type, setType] = useState((initial && initial.type) || "compound");
  const [cue, setCue] = useState((initial && initial.cue) || "");
  const [secondary, setSecondary] = useState((initial && initial.secondary) || []);

  // When adding, only compounds are asked for indirect work — that is what
  // makes them compound — and anything picked before switching to isolation
  // is dropped rather than kept invisibly, so what you see is what is saved.
  //
  // Editing always asks, whatever the type. Seventeen of the shipped
  // isolation exercises do carry indirect work: a hammer curl reaches the
  // forearms, a leg curl the calves. Hiding the picker for those would mean
  // opening one and pressing save quietly deleted what it hits.
  const wantsSecondary = editing || type === "compound";
  // Offer whatever the caller considers a real muscle group, minus the one
  // already chosen as primary. Not MUSCLE_GROUPS, which is keyed off
  // EXERCISES and therefore includes "Mobility" — a category with no
  // recovery window, so picking it would silently do nothing.
  const secondaryOptions = muscles.filter((m) => m !== muscle && m !== "Mobility");
  const chosenSecondary = wantsSecondary ? secondary.filter((m) => m !== muscle) : [];

  function toggleSecondary(m) {
    setSecondary((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function handleSave() {
    if (!name.trim()) return;
    let id;
    if (editing) {
      id = initial.id;
    } else {
      const baseId = slugify(name);
      id = baseId;
      let n = 2;
      while (ALL_EXERCISES_BY_ID[id]) {
        id = `${baseId}-${n}`;
        n += 1;
      }
    }
    const ex = { ...(editing ? initial : {}), id, name: name.trim(), type, cue: cue.trim() || "Control the weight through a full range of motion.", muscle };
    if (chosenSecondary.length) ex.secondary = chosenSecondary;
    else delete ex.secondary;
    onSave(ex);
  }

  const inputStyle = {
    width: "100%",
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: 13.5,
    marginBottom: 10,
  };

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.accent}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
      <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        {editing ? "Edit Exercise" : "New Exercise"}
      </div>
      {editing && (
        <div style={{ color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45, marginBottom: 10 }}>
          Your logged sets stay attached — this changes the exercise, not your history. Renaming it or moving it to another muscle updates every past workout to match.
        </div>
      )}
      <input autoFocus type="text" placeholder="Exercise name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <select value={muscle} onChange={(e) => setMuscle(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
        {muscles.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {["compound", "isolation"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 8,
              border: `1px solid ${type === t ? COLORS.accent : COLORS.line}`,
              background: type === t ? COLORS.accent : COLORS.surfaceRaised,
              color: type === t ? COLORS.onAccent : COLORS.textDim,
              fontFamily: "'Oswald', sans-serif",
              fontSize: 12.5,
              textTransform: "uppercase",
            }}
          >
            {t === "compound" ? "Compound" : "Isolation"}
          </button>
        ))}
      </div>
      {wantsSecondary && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
            Also works (optional)
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45, marginBottom: 8 }}>
            Muscles this hits indirectly. They get partial fatigue on the readiness map and half a set each in weekly volume.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {secondaryOptions.map((m) => {
              const on = chosenSecondary.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleSecondary(m)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${on ? COLORS.accent : COLORS.line}`,
                    background: on ? hexToRgba(COLORS.accent, 0.14) : COLORS.surfaceRaised,
                    color: on ? COLORS.accent : COLORS.textDim,
                    fontSize: 11.5,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <textarea
        placeholder="Cue / technique tip (optional)"
        value={cue}
        onChange={(e) => setCue(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{ flex: 1, background: name.trim() ? COLORS.accent : COLORS.surfaceRaised, color: name.trim() ? COLORS.onAccent : COLORS.textDim, border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase" }}
        >
          {editing ? "Save Changes" : "Add Exercise"}
        </button>
        <button
          onClick={onCancel}
          style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 0", color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   REST TIMER BAR
--------------------------------------------------------------- */

function RestTimer({ timer, onTogglePause, onAddTime, onSkip }) {
  if (!timer) return null;
  const pct = Math.max(0, Math.min(100, Math.round((timer.seconds / timer.total) * 100)));
  return (
    <div
      style={{
        position: "sticky",
        top: "env(safe-area-inset-top, 0px)",
        zIndex: 40,
        margin: "0 20px 14px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.accent}`,
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textDim, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
          <Timer size={13} /> Resting · {timer.label}
        </div>
        <div style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600 }}>
          {formatTime(timer.seconds)}
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: COLORS.surfaceRaised, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: COLORS.accent, transition: "width 1s linear" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onTogglePause}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
        >
          {timer.paused ? <Play size={13} /> : <Pause size={13} />} {timer.paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={() => onAddTime(15)}
          style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
        >
          +15s
        </button>
        <button
          onClick={onSkip}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
        >
          <SkipForward size={13} /> Skip
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   BODY MAP
   An anatomical figure, front + rear. Each coloured region maps to one
   muscle group and is shaded along the red -> yellow -> green readiness
   scale. Neutral (non-muscle) segments stay grey.
--------------------------------------------------------------- */

// The parts of the figure we do not train — head, hands, feet, joints. It is
// what gives the body its silhouette. Schemes can override it: the monochrome
// ramp is itself grey, so the default silhouette would sit in the middle of
// it and an untrained shin would read as a recovering one.
const NEUTRAL_BOX = { value: NEUTRAL_DARK };

/* The figure comes from `body-muscles` (Apache 2.0, (c) 2024 Ivan Vulovic,
   https://github.com/vulovix/body-muscles) — a front and rear human split
   into 89 named regions. We take its path data only: its own BodyChart
   renderer builds the SVG imperatively and its palette is a 0..1 intensity
   gradient, neither of which fits a React tree painted in three flat
   readiness colours.

   BODY_REGIONS maps its region ids onto our sixteen groups. A group made of
   several bellies — three triceps and lat segments a side, six trapezius
   segments, three calf heads — fills and selects as one thing. Anything left
   unmapped (head, neck, hands, feet, knees, elbows, spine, adductors, hip
   flexors) draws in NEUTRAL, and that grey is what gives the figure its
   silhouette. */

const BODY_REGIONS = {};
Object.entries({
  Chest: ["chest-upper", "chest-lower"],
  Back: ["lats-upper", "lats-mid", "lats-lower"],
  "Lower Back": ["lower-back-erectors", "lower-back-ql"],
  "Front Delts": ["shoulder-front"],
  "Side Delts": ["shoulder-side"],
  "Rear Delts": ["deltoid-rear"],
  Traps: ["traps-upper", "traps-mid", "traps-lower"],
  Biceps: ["biceps"],
  Triceps: ["triceps-long", "triceps-lateral"],
  Forearms: ["forearm", "forearm-flexors", "forearm-extensors"],
  Core: ["abs-upper", "abs-lower", "obliques", "serratus-anterior"],
  Quads: ["quads"],
  Hamstrings: ["hamstrings-medial", "hamstrings-lateral"],
  Glutes: ["gluteus-maximus", "gluteus-medius"],
  Calves: ["calves-gastroc-medial", "calves-gastroc-lateral", "calves-soleus"],
  Shins: ["tibialis-anterior"],
  // Every region in the library is sided, so each stem covers a -left and a
  // -right id.
}).forEach(([group, stems]) => stems.forEach((stem) => {
  BODY_REGIONS[`${stem}-left`] = group;
  BODY_REGIONS[`${stem}-right`] = group;
}));

const toParts = (defs) => defs.map((m) => ({ key: m.id, d: m.path, muscle: BODY_REGIONS[m.id] }));
const BODY_FIGURE = { front: toParts(FRONT_MUSCLES), back: toParts(BACK_MUSCLES) };
// The rear view is drawn to the right of the front one in the library's own
// coordinate space, so it needs its own window onto the same canvas.
const BODY_VIEWBOX = { front: "0 0 35 93", back: "37 0 35 93" };

function BodySide({ label, view, stages, selected, onSelect }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={BODY_VIEWBOX[view]} style={{ width: "100%", maxWidth: 155 }}>
        {BODY_FIGURE[view].map((p) => {
          const isMuscle = !!p.muscle;
          const isSelected = isMuscle && selected === p.muscle;
            const stage = isMuscle ? stages[p.muscle] || "green" : null;
            // The outline is the channel that does not need colour vision:
            // a ring for recovering, a dashed ring for almost ready, none
            // for ready. Selection still overrides it, since knowing which
            // muscle you have tapped matters more for that instant.
            const shape = THEME.shapes && stage ? STAGE_SHAPES[stage] : null;
            return (
            <path
              key={p.key}
              d={p.d}
              data-muscle={p.muscle || undefined}
              data-stage={stage || undefined}
              fill={isMuscle ? STAGE_COLORS[stage] : NEUTRAL_BOX.value}
              stroke={
                isSelected
                  ? outlineColorFor(STAGE_COLORS[stage])
                  : shape && shape.width
                    ? outlineColorFor(STAGE_COLORS[stage])
                    : COLORS.bg
              }
              strokeWidth={isSelected ? 0.4 : shape ? shape.width : 0.12}
              strokeDasharray={!isSelected && shape && shape.dash ? shape.dash : undefined}
              strokeLinejoin="round"
              onClick={isMuscle ? () => onSelect(p.muscle) : undefined}
              style={isMuscle ? { cursor: "pointer" } : undefined}
            />
          );
        })}
      </svg>
      <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function BodyMap({ dates }) {
  const [selected, setSelected] = useState(null);
  // Bands are measured in hours, so the map has to move on its own — sitting
  // on Home should not freeze a muscle in red past the point it turned green.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const stages = {};
  MUSCLE_GROUPS.forEach((m) => {
    stages[m] = recoveryStage(dates[m], m);
  });

  const detail = (() => {
    if (!selected) return "Tap a muscle to see recovery detail.";
    const entry = dates[selected];
    if (!entry) return `${selected} — ready, no logged sessions yet.`;
    const stage = recoveryStage(entry, selected);
    // "worked" rather than "trained" when nothing was aimed at this muscle —
    // being told your triceps need rest is confusing on a chest day otherwise.
    const indirect = isIndirectOnly(entry, selected);
    const verb = indirect ? "worked indirectly" : "trained";
    const ago = trainedAgoLabel(lastWorkedAt(entry));
    if (stage === "green") return `${selected} — ready · ${verb} ${ago}`;
    const left = hoursUntilReady(entry, selected);
    return `${selected} — ${STAGE_LABELS[stage]} · ${verb} ${ago} · ready in ${left}h`;
  })();

  return (
    <div>
      <div style={{ display: "flex", gap: 16 }}>
        <BodySide label="Front" view="front" stages={stages} selected={selected} onSelect={setSelected} />
        <BodySide label="Rear" view="back" stages={stages} selected={selected} onSelect={setSelected} />
      </div>
      {/* Three keyed swatches rather than a gradient bar: the fills are three
          flat colours now, so a blended scale would not describe them. */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, margin: "14px 0 12px", flexWrap: "wrap" }}>
        {STAGE_LEGEND.map(([s, text]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2.5, background: STAGE_COLORS[s] }} />
            <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{text}</span>
          </div>
        ))}
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 12.5, textAlign: "center", minHeight: 16 }}>{detail}</div>
    </div>
  );
}

function HomeScreen({ onStart, onViewHistory, onViewPB, onViewProgress, onStartTemplate, onResumeWorkout, onViewSettings, onViewSuggested, onViewVolume, onViewStreak, onViewOneRM, onViewExerciseDb, onOpenProgramme, onStartProgrammeDay, onViewProgrammeStats, onNewProgramme, reloadKey, activeProgramme, settings, subscribed, graceDaysLeft, onViewPaywall }) {
  const [dates, setDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentSessions, setRecentSessions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [unfinished, setUnfinished] = useState(null);
  const [weeklyVolume, setWeeklyVolume] = useState({});
  const [streak, setStreak] = useState(0);
  const [goalCount, setGoalCount] = useState(0);
  const [bodyweight, setBodyweight] = useState(null);
  const [finishedProgrammes, setFinishedProgrammes] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const muscles = MUSCLE_GROUPS;
      const hist = (await safeGet("workout-history")) || [];
      const tpls = (await safeGet("templates")) || [];
      const snapshot = await safeGet("in-progress-workout");
      const savedGoals = (await safeGet("1rm-goals")) || {};
      const bw = await safeGet("bodyweight");
      const finished = await getFinishedProgrammes();
      if (cancelled) return;
      setBodyweight(bw || null);
      setFinishedProgrammes([...finished].reverse());
      const map = computeMuscleLastMap(hist);
      setDates(map);
      setRecentSessions([...hist].reverse().slice(0, 3));
      setTemplates(tpls);
      setGoalCount(Object.keys(savedGoals).length);
      const hasEnteredData =
        snapshot && snapshot.exercises && snapshot.exercises.length > 0 &&
        Object.values(snapshot.sets || {}).some((setList) => setList.some(setHasData));
      setUnfinished(hasEnteredData ? snapshot : null);

      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - 6);
      const volMap = {};
      muscles.forEach((m) => (volMap[m] = 0));
      hist.forEach((session) => {
        const d = new Date(session.date);
        if (d < cutoff) return;
        session.exercises.forEach((ex) => {
          if (volMap[ex.muscle] !== undefined) volMap[ex.muscle] += ex.sets.length;
        });
      });
      setWeeklyVolume(volMap);
      setStreak(computeCurrentStreak(new Set(hist.map((s) => s.date))));

      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function discardUnfinished() {
    await safeDelete("in-progress-workout");
    setUnfinished(null);
  }

  const nextDay = activeProgramme ? activeProgramme.days[programmeNextIndex(activeProgramme)] : null;
  const progDone = activeProgramme ? programmeCompleted(activeProgramme) : 0;
  const progPlanned = activeProgramme ? programmePlanned(activeProgramme) : 0;
  const progWeek = activeProgramme ? programmeWeekNumber(activeProgramme) : 0;
  const progPct = progPlanned ? Math.min(100, Math.round((progDone / progPlanned) * 100)) : 0;

  async function deleteTemplate(id) {
    const updated = templates.filter((t) => t.id !== id);
    await safeSet("templates", updated);
    setTemplates(updated);
  }

  async function removeFinished(id) {
    const next = await deleteFinishedProgramme(id);
    setFinishedProgrammes([...next].reverse());
    setConfirmDeleteId(null);
  }

  return (
    <div style={{ padding: "28px 24px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        {/* Three states, and only two of them say anything. Subscribed and
            online is the normal case and earns no chrome at all; the grace
            countdown only appears once Play has actually been out of touch
            for a day, so nobody sees a warning for a single flight. */}
        {!subscribed ? (
          <button onClick={onViewPaywall} style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.accent, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>
            <Lock size={12} /> Start free trial
          </button>
        ) : graceDaysLeft !== null && graceDaysLeft <= 5 ? (
          <div style={{ color: COLORS.textDim, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>
            Offline — {graceDaysLeft} day{graceDaysLeft === 1 ? "" : "s"} left
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={onViewSettings}
          aria-label="Settings"
          style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <SettingsIcon size={17} color={COLORS.textDim} />
        </button>
      </div>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 15,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: COLORS.accent,
          marginBottom: 6,
        }}
      >
        Iron Log
      </div>
      <div
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 34,
          lineHeight: 1.05,
          textTransform: "uppercase",
          color: COLORS.text,
          marginBottom: 20,
        }}
      >
        Ready to<br />train?
      </div>

      {unfinished && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.accent}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            <Clock size={13} /> Unfinished Workout
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 12.5, marginBottom: 12 }}>
            {unfinished.split} · {unfinished.exercises.length} exercise{unfinished.exercises.length === 1 ? "" : "s"} — you left this one logged but not finished.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onResumeWorkout(unfinished)}
              style={{ flex: 1, background: COLORS.accent, color: COLORS.onAccent, border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
            >
              Resume
            </button>
            <button
              onClick={discardUnfinished}
              style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 0", color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {activeProgramme && nextDay ? (
        <div style={{ marginBottom: templates.length > 0 ? 20 : 28 }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>{activeProgramme.name}</span>
              <button onClick={onOpenProgramme} style={{ color: COLORS.accent, fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 3 }}>
                All workouts <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ color: COLORS.textDim, fontSize: 12 }}>Week {progWeek} of {activeProgramme.weeks}</span>
              <span style={{ color: COLORS.textDim, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}>{progDone}/{progPlanned}</span>
            </div>
            <div style={{ height: 5, background: COLORS.surfaceRaised, borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ width: `${progPct}%`, height: "100%", background: COLORS.accent }} />
            </div>
            <button
              onClick={() => onStartProgrammeDay(nextDay, activeProgramme)}
              style={{ width: "100%", background: COLORS.accent, color: COLORS.onAccent, border: "none", borderRadius: 12, padding: "16px 0", fontFamily: "'Oswald', sans-serif", fontSize: 16, letterSpacing: 0.5, textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Play size={18} /> Start {nextDay.name}
            </button>
          </div>
          <button
            onClick={onStart}
            style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 0", color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            New programme or free workout
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: templates.length > 0 ? 20 : 28 }}>
          <button
            onClick={onStart}
            style={{
              width: "100%",
              background: COLORS.accent,
              color: COLORS.onAccent,
              border: "none",
              borderRadius: 14,
              padding: "18px 0",
              fontFamily: "'Oswald', sans-serif",
              fontSize: 18,
              letterSpacing: 1,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Dumbbell size={20} />
            Start Workout
          </button>
          <button
            onClick={onNewProgramme}
            style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.accent}`, borderRadius: 12, padding: "12px 0", color: COLORS.accent, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Plus size={14} /> Start a programme
          </button>
        </div>
      )}

      {!loading && templates.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Templates
          </div>
          {templates.map((t) => {
            const count = t.mode === "specific" ? t.exercises.length : Object.values(t.selection).reduce((a, b) => a + b, 0);
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                <button
                  onClick={() => onStartTemplate(t)}
                  style={{ flex: 1, textAlign: "left", background: "transparent", border: "none" }}
                >
                  <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase" }}>{t.name}</div>
                  <div style={{ color: COLORS.textDim, fontSize: 11.5 }}>{t.split} · {count} exercises</div>
                </button>
                <button
                  onClick={() => onStartTemplate(t)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, border: "none", color: COLORS.onAccent, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Play size={14} />
                </button>
                <button
                  onClick={() => deleteTemplate(t.id)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, color: COLORS.text }}>
            Muscle Readiness
          </div>
          <button
            onClick={onViewSuggested}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.3 }}
          >
            <Sparkles size={13} /> Train Ready Muscles
          </button>
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 16 }}>
        </div>
        {settings.showBodyMap && (
          loading ? (
            <div style={{ color: COLORS.textDim, textAlign: "center", padding: 20 }}>Loading…</div>
          ) : (
            <BodyMap dates={dates} />
          )
        )}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
            <HistoryIcon size={15} color={COLORS.accent} /> Training Log
          </div>
          <button onClick={onViewHistory} style={{ color: COLORS.accent, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 3 }}>
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Recent workouts</div>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 12, fontSize: 13 }}>Loading…</div>
        ) : recentSessions.length === 0 ? (
          <div style={{ color: COLORS.textDim, fontSize: 13, padding: "4px 0 8px" }}>No workouts logged yet.</div>
        ) : (
          recentSessions.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}>
              <div>
                <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase" }}>{s.dayName || s.split}</div>
                <div style={{ color: COLORS.textDim, fontSize: 11.5 }}>{s.date}{s.programmeId ? " · programme" : ""}</div>
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                {s.exercises.length} ex
              </div>
            </div>
          ))
        )}

        {finishedProgrammes.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {/* Folded away by default: after a year of training this is a
                dozen rows of history sitting between you and the stats,
                and none of it is something you act on day to day. */}
            <button
              onClick={() => setShowFinished((v) => !v)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "transparent", border: "none", padding: "4px 0 8px" }}
            >
              <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Finished programmes
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                {finishedProgrammes.length}
                {showFinished ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {showFinished && finishedProgrammes.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                <button
                  onClick={() => onViewProgrammeStats(p)}
                  style={{ flex: 1, minWidth: 0, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ color: COLORS.textDim, fontSize: 11.5 }}>
                      {(p.log || []).length} sessions{p.endedEarly ? " · ended early" : " · completed"}
                    </div>
                  </div>
                  <ChevronRight size={16} color={COLORS.textDim} />
                </button>
                {confirmDeleteId === p.id ? (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                      Cancel
                    </button>
                    <button onClick={() => removeFinished(p.id)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: COLORS.bad, color: "#fff", fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    title="Delete from history"
                    style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 24, marginBottom: 24 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5, color: COLORS.text, marginBottom: 12 }}>
          Stats
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {(() => {
            const tileStyle = { width: "calc(50% - 5px)", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14, textAlign: "left" };
            const valStyle = { color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 22, lineHeight: 1 };
            const labelStyle = { color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 6 };
            const totalSets = Object.values(weeklyVolume).reduce((a, b) => a + b, 0);
            const tiles = [
              { key: "info", onClick: onViewPB, value: bodyweight ? `${bodyweight.value}${bodyweight.unit}` : "—", label: "Personal Info", icon: <User size={13} color={COLORS.accent} /> },
              { key: "vol", onClick: onViewVolume, value: totalSets, label: "Sets This Week", icon: <Dumbbell size={13} color={COLORS.accent} /> },
              { key: "streak", onClick: onViewStreak, value: streak, label: streak === 1 ? "Day Streak" : "Day Streak", icon: <Clock size={13} color={COLORS.accent} /> },
              { key: "goals", onClick: onViewOneRM, value: goalCount, label: "1RM Goals", icon: <TrendingUp size={13} color={COLORS.accent} /> },
            ];
            return tiles.map((t) => (
              <button key={t.key} onClick={t.onClick} style={tileStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>{t.icon}</div>
                <div style={valStyle}>{loading ? "–" : t.value}</div>
                <div style={labelStyle}>{t.label}</div>
              </button>
            ));
          })()}
          {[
            { key: "progress", onClick: onViewProgress, label: "Progress Charts", icon: <TrendingUp size={14} color={COLORS.accent} /> },
            { key: "exdb", onClick: onViewExerciseDb, label: "Exercise Database", icon: <Dumbbell size={14} color={COLORS.accent} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={t.onClick}
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "13px 14px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                {t.icon}
                <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase", lineHeight: 1.2 }}>{t.label}</span>
              </span>
              <ChevronRight size={15} color={COLORS.textDim} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PROGRAMME SCREENS
--------------------------------------------------------------- */

function StartChoiceScreen({ hasActive, activeName, nextDayName, onContinue, onNew, onFree, onBack }) {
  const card = { width: "100%", textAlign: "left", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 14 };
  const iconWrap = (active) => ({ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: active ? COLORS.accent : COLORS.surfaceRaised, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? COLORS.onAccent : COLORS.textDim });
  const title = { color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 17, textTransform: "uppercase" };
  const sub = { color: COLORS.textDim, fontSize: 12.5, marginTop: 2 };
  return (
    <div>
      <TopBar title="Start Workout" onBack={onBack} />
      <div style={{ padding: "4px 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {hasActive && (
          <button onClick={onContinue} style={{ ...card, borderColor: COLORS.accent, background: hexToRgba(COLORS.accent, 0.08) }}>
            <div style={iconWrap(true)}><Play size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={title}>Continue Programme</div>
              <div style={sub}>{activeName}{nextDayName ? ` · next: ${nextDayName}` : ""}</div>
            </div>
            <ChevronRight size={18} color={COLORS.textDim} />
          </button>
        )}
        <button onClick={onNew} style={card}>
          <div style={iconWrap(false)}><Plus size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={title}>New Programme</div>
            <div style={sub}>Pick a split, choose your exercises, follow it for weeks.</div>
          </div>
          <ChevronRight size={18} color={COLORS.textDim} />
        </button>
        <button onClick={onFree} style={card}>
          <div style={iconWrap(false)}><Dumbbell size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={title}>Free Mode</div>
            <div style={sub}>A one-off workout — build it however you like.</div>
          </div>
          <ChevronRight size={18} color={COLORS.textDim} />
        </button>
        {hasActive && (
          <div style={{ color: COLORS.textDim, fontSize: 11.5, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>
            Starting a new programme will archive your current one to Finished Programmes.
          </div>
        )}
      </div>
    </div>
  );
}

function ProgrammeBuilderScreen({ onBack, onCreate, onGuided }) {
  const [step, setStep] = useState(0); // 0 split · 1 exercises · 2 length · 3 name
  const [presetKey, setPresetKey] = useState(null);
  const [days, setDays] = useState([]);
  const [weeks, setWeeks] = useState(6);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState(0);
  const [addTo, setAddTo] = useState(null); // day index being added to
  const [addPanel, setAddPanel] = useState("db"); // "db" | "new"
  const [, forceRefresh] = useState(0);

  function choosePreset(preset) {
    setPresetKey(preset.key);
    setName(preset.key === "custom" ? "My Programme" : preset.name);
    const built = makeProgrammeDays(preset);
    setDays(built.length ? built : [{ key: `d0-${Math.random().toString(36).slice(2, 7)}`, name: "Day 1", muscles: [], exercises: [] }]);
    setExpanded(0);
    setStep(1);
  }

  function renameDay(i, value) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, name: value } : d)));
  }
  function removeExercise(dayIdx, exId) {
    setDays((prev) => prev.map((d, idx) => (idx === dayIdx ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d)));
  }
  // Appended rather than sorted in: the arrows below make the order yours,
  // and a type sort would keep undoing it.
  function addExercise(dayIdx, ex, muscle) {
    setDays((prev) => prev.map((d, idx) => {
      if (idx !== dayIdx) return d;
      if (d.exercises.some((e) => e.id === ex.id)) return d;
      return { ...d, exercises: [...d.exercises, { id: ex.id, name: ex.name, muscle, type: ex.type }] };
    }));
  }
  function moveExercise(dayIdx, index, direction) {
    setDays((prev) => prev.map((d, idx) => {
      if (idx !== dayIdx) return d;
      const target = index + direction;
      if (target < 0 || target >= d.exercises.length) return d;
      const next = [...d.exercises];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, exercises: next };
    }));
  }
  // A new exercise goes into the database proper, not just this programme, so
  // it is there next time and rankable in the Exercise Database like any other.
  async function saveNewExercise(dayIdx, ex) {
    registerCustomExercise(ex);
    const saved = (await safeGet("custom-exercises")) || [];
    await safeSet("custom-exercises", [...saved, ex]);
    addExercise(dayIdx, ex, ex.muscle);
    setAddPanel("db");
    forceRefresh((n) => n + 1);
  }
  function addDay() {
    setDays((prev) => [...prev, { key: `d${prev.length}-${Math.random().toString(36).slice(2, 7)}`, name: `Day ${prev.length + 1}`, muscles: [], exercises: [] }]);
    setExpanded(days.length);
  }
  function removeDay(i) {
    setDays((prev) => prev.filter((_, idx) => idx !== i));
  }

  const validDays = days.filter((d) => d.exercises.length > 0);
  const canContinueExercises = validDays.length > 0;

  function create() {
    const programme = {
      id: `prog-${Date.now()}`,
      name: name.trim() || "My Programme",
      presetKey,
      createdAt: new Date().toISOString(),
      weeks,
      days: validDays.map((d) => ({
        key: d.key,
        name: d.name.trim() || "Day",
        muscles: [...new Set(d.exercises.map((e) => e.muscle))],
        exercises: d.exercises,
      })),
      log: [],
    };
    onCreate(programme);
  }

  const stepLabels = ["Split", "Exercises", "Length", "Name"];

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="New Programme" onBack={step === 0 ? onBack : () => setStep(step - 1)} />

      <WizardSteps labels={stepLabels} step={step} />

      <div style={{ padding: "0 20px" }}>
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 2 }}>Choose a split to base your programme on. You can tweak everything next.</div>
            <button
              onClick={onGuided}
              style={{ textAlign: "left", background: hexToRgba(COLORS.accent, 0.1), border: `1.5px solid ${COLORS.accent}`, borderRadius: 14, padding: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 15.5, textTransform: "uppercase" }}>
                  <Sparkles size={16} /> Guided
                </span>
                <span style={{ color: COLORS.accent, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${COLORS.accent}`, borderRadius: 999, padding: "2px 7px" }}>
                  Recommended
                </span>
              </div>
              <div style={{ color: COLORS.text, fontSize: 12, marginTop: 3 }}>Answer a few quick questions and Iron Log builds a split for you — accept it or tweak it yourself.</div>
            </button>
            {PROGRAMME_PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => choosePreset(p)}
                style={{ textAlign: "left", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15.5, textTransform: "uppercase" }}>{p.name}</span>
                  {p.days.length > 0 && <span style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{p.days.length} days</span>}
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 3 }}>{p.blurb}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 12 }}>
              Set the exercises for each workout. Add, remove, rename days — this is your template.
            </div>
            {days.map((day, di) => {
              const isOpen = expanded === di;
              return (
                <div key={day.key} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px" }}>
                    <button onClick={() => setExpanded(isOpen ? -1 : di)} style={{ flexShrink: 0, color: COLORS.textDim }}>
                      {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <input
                      value={day.name}
                      onChange={(e) => renameDay(di, e.target.value)}
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}
                    />
                    <span style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{day.exercises.length} ex</span>
                    {days.length > 1 && (
                      <button onClick={() => removeDay(di)} style={{ color: COLORS.textDim, flexShrink: 0 }}><Trash2 size={14} /></button>
                    )}
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 14px 14px" }}>
                      {day.exercises.length === 0 && (
                        <div style={{ color: COLORS.textDim, fontSize: 12.5, padding: "4px 0 10px" }}>No exercises yet — add some below.</div>
                      )}
                      {/* The order here is the order you train in, so it is
                          yours to set — same up/down pair the live workout
                          uses, rather than a drag handle that fights the
                          page scroll on a phone. */}
                      {day.exercises.map((ex, ei) => (
                        <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: COLORS.surfaceRaised, borderRadius: 8, marginBottom: 6 }}>
                          <div style={{ width: 24, flexShrink: 0, borderRadius: 6, border: `1px solid ${COLORS.line}`, display: "flex", flexDirection: "column", overflow: "hidden", alignSelf: "stretch" }}>
                            <button
                              onClick={() => moveExercise(di, ei, -1)}
                              disabled={ei === 0}
                              title="Move up"
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderBottom: `1px solid ${COLORS.line}`, color: ei === 0 ? COLORS.line : COLORS.textDim, padding: 0 }}
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              onClick={() => moveExercise(di, ei, 1)}
                              disabled={ei === day.exercises.length - 1}
                              title="Move down"
                              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: ei === day.exercises.length - 1 ? COLORS.line : COLORS.textDim, padding: 0 }}
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: COLORS.text, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
                            <div style={{ color: COLORS.textDim, fontSize: 11 }}>{ex.muscle}</div>
                          </div>
                          <button onClick={() => removeExercise(di, ex.id)} title={`Remove ${ex.name}`} style={{ color: COLORS.textDim, flexShrink: 0 }}><X size={15} /></button>
                        </div>
                      ))}

                      {addTo === di ? (
                        <div style={{ marginTop: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ color: COLORS.text, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Add exercise</span>
                            <button onClick={() => { setAddTo(null); setAddPanel("db"); }} style={{ color: COLORS.textDim }}><X size={15} /></button>
                          </div>
                          {/* Building a programme is exactly when you notice
                              your gym has a machine the database does not, so
                              the form is here rather than only mid-workout. */}
                          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                            {[["db", "From Database"], ["new", "New Exercise"]].map(([key, label]) => {
                              const active = addPanel === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => setAddPanel(key)}
                                  style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? hexToRgba(COLORS.accent, 0.14) : "transparent", color: active ? COLORS.accent : COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          {addPanel === "new" ? (
                            <NewExerciseForm
                              muscles={Object.keys(EXERCISES)}
                              defaultMuscle={day.muscles && day.muscles.length ? day.muscles[0] : Object.keys(EXERCISES)[0]}
                              onSave={(ex) => saveNewExercise(di, ex)}
                              onCancel={() => setAddPanel("db")}
                            />
                          ) : (
                            <ExerciseSearchPicker
                              key={day.exercises.length}
                              autoFocus
                              surface={COLORS.surface}
                              maxHeight={320}
                              excludeIds={new Set(day.exercises.map((e) => e.id))}
                              onAdd={(ex, m) => addExercise(di, ex, m)}
                            />
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddTo(di); setAddPanel("db"); }}
                          style={{ width: "100%", marginTop: 4, background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.textDim, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        >
                          <Plus size={13} /> Add exercise
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={addDay}
              style={{ width: "100%", background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 12, padding: "11px 0", color: COLORS.textDim, fontSize: 13, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}
            >
              <Plus size={14} /> Add day
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canContinueExercises}
              style={{ width: "100%", background: canContinueExercises ? COLORS.accent : COLORS.surfaceRaised, border: "none", borderRadius: 12, padding: "14px 0", color: canContinueExercises ? COLORS.onAccent : COLORS.textDim, fontSize: 14, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Next: length
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 12 }}>How long will you run this programme?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {PROGRAMME_LENGTHS.map((opt) => {
                const active = weeks === opt.weeks;
                return (
                  <button
                    key={opt.weeks}
                    onClick={() => setWeeks(opt.weeks)}
                    style={{ textAlign: "left", background: active ? hexToRgba(COLORS.accent, 0.1) : COLORS.surface, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, borderRadius: 14, padding: 14 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: active ? COLORS.accent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15.5, textTransform: "uppercase" }}>{opt.label}</span>
                      {opt.recommended && <span style={{ color: COLORS.accent, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${COLORS.accent}`, borderRadius: 999, padding: "2px 7px" }}>Recommended</span>}
                    </div>
                    <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 3 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 12.5, marginBottom: 16, textAlign: "center" }}>
              {weeks} weeks × {validDays.length} workouts ≈ <span style={{ color: COLORS.text }}>{weeks * validDays.length} sessions</span>
            </div>
            <button onClick={() => setStep(3)} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, padding: "14px 0", color: COLORS.onAccent, fontSize: 14, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Next: name
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 10 }}>Name your programme.</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "13px 14px", color: COLORS.text, fontSize: 15, marginBottom: 16 }}
            />
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Summary</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: COLORS.textDim }}>Length</span><span style={{ color: COLORS.text }}>{weeks} weeks</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: COLORS.textDim }}>Workouts</span><span style={{ color: COLORS.text }}>{validDays.length} per cycle</span>
              </div>
              {validDays.map((d) => (
                <div key={d.key} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${COLORS.line}`, fontSize: 12.5 }}>
                  <span style={{ color: COLORS.text }}>{d.name}</span>
                  <span style={{ color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>{d.exercises.length} ex</span>
                </div>
              ))}
            </div>
            <button onClick={create} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, padding: "16px 0", color: COLORS.onAccent, fontSize: 15, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Check size={18} /> Create Programme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   GUIDED PROGRAMME WIZARD
   Questionnaire (0) → recommendations (1) → generated programme
   preview (2), reachable from the "Guided" card on the programme
   builder's split-choice step. Accept creates it immediately; decline
   drops the user back at the normal builder to make their own.
--------------------------------------------------------------- */

function GuidedProgrammeWizard({ onBack, onCreate, onDecline }) {
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState(null);
  const [duration, setDuration] = useState(null);
  const [focusMuscles, setFocusMuscles] = useState(new Set());
  const [bodyweightKg, setBodyweightKg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bw = await safeGet("bodyweight");
      if (cancelled || !bw || !bw.value) return;
      const kg = bw.unit === "lb" ? Number(bw.value) * 0.453592 : Number(bw.value);
      setBodyweightKg(kg);
    })();
    return () => { cancelled = true; };
  }, []);

  function toggleFocus(m) {
    setFocusMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  }

  const canContinue = !!experience && !!duration;
  const preset = experience ? PROGRAMME_PRESETS.find((p) => p.key === GUIDED_EXPERIENCE_OPTIONS.find((o) => o.value === experience).presetKey) : null;
  const exerciseCount = duration ? DURATION_EXERCISE_COUNTS[duration] : null;
  const generatedDays = step === 2 && preset ? buildGuidedDays(preset, exerciseCount, [...focusMuscles]) : [];

  function accept() {
    const programme = {
      id: `prog-${Date.now()}`,
      name: `Guided — ${preset.name}`,
      presetKey: preset.key,
      createdAt: new Date().toISOString(),
      weeks: 6,
      days: generatedDays.map((d) => ({ key: d.key, name: d.name, muscles: d.muscles, exercises: d.exercises })),
      log: [],
    };
    onCreate(programme);
  }

  const stepLabels = ["Questions", "Recommendations", "Your Programme"];

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="Guided Programme" onBack={step === 0 ? onBack : () => setStep(step - 1)} />

      <WizardSteps labels={stepLabels} step={step} />

      <div style={{ padding: "0 20px" }}>
        {step === 0 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
              How new are you to training?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {GUIDED_EXPERIENCE_OPTIONS.map((opt) => {
                const active = experience === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    style={{ textAlign: "left", background: active ? hexToRgba(COLORS.accent, 0.1) : COLORS.surface, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, borderRadius: 14, padding: 14 }}
                  >
                    <div style={{ color: active ? COLORS.accent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}>{opt.label}</div>
                    <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 3 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
              How long do you want to work out?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {GUIDED_DURATION_OPTIONS.map((d) => {
                const active = duration === d.value;
                return (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    style={{ padding: "14px 0", borderRadius: 12, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surface, color: active ? COLORS.onAccent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase" }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
              Anything you want to improve most?
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 10 }}>Optional — pick as many as you like, or skip this.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {SPLITS["Full Body"].map((m) => {
                const active = focusMuscles.has(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleFocus(m)}
                    style={{ padding: "9px 14px", borderRadius: 999, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surface, color: active ? COLORS.onAccent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!canContinue}
              style={{ width: "100%", background: canContinue ? COLORS.accent : COLORS.surfaceRaised, border: "none", borderRadius: 12, padding: "14px 0", color: canContinue ? COLORS.onAccent : COLORS.textDim, fontSize: 14, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              See My Recommendations
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 16 }}>
              A few things worth knowing before you start.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {guidedRecommendations(experience, bodyweightKg).map((rec) => (
                <div key={rec.title} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{rec.title}</div>
                  <div style={{ color: COLORS.textDim, fontSize: 12.5, lineHeight: 1.55 }}>{rec.body}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, padding: "14px 0", color: COLORS.onAccent, fontSize: 14, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              Show My Programme
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 16 }}>
              Based on your answers, here's what Iron Log recommends.
            </div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 19, textTransform: "uppercase", marginBottom: 4 }}>{preset.name}</div>
              <div style={{ color: COLORS.textDim, fontSize: 12.5, marginBottom: 14 }}>{preset.blurb}</div>
              {generatedDays.map((d) => (
                <div key={d.key} style={{ borderTop: `1px solid ${COLORS.line}`, padding: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase" }}>{d.name}</span>
                    <span style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{d.exercises.length} ex</span>
                  </div>
                  <div style={{ color: COLORS.textDim, fontSize: 12 }}>{d.exercises.map((e) => e.name).join(" · ")}</div>
                </div>
              ))}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 12, textAlign: "center", marginBottom: 20 }}>
              6-week block · {generatedDays.length} day{generatedDays.length === 1 ? "" : "s"} · you can edit any exercise once it's created.
            </div>
            <button
              onClick={accept}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: COLORS.accent, border: "none", borderRadius: 12, padding: "16px 0", color: COLORS.onAccent, fontSize: 15, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}
            >
              <Check size={18} /> Accept This Programme
            </button>
            <button
              onClick={onDecline}
              style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "14px 0", color: COLORS.textDim, fontSize: 13.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Not For Me — Build My Own
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgrammeScreen({ programme: programmeProp, onBack, onStartDay, onFinishProgramme, onViewStats, onProgrammeChange }) {
  const [programme, setProgramme] = useState(programmeProp || null);
  const [loading, setLoading] = useState(!programmeProp);
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [openDay, setOpenDay] = useState(null); // day key whose exercises are showing
  const [addTo, setAddTo] = useState(null); // day key being added to

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const p = await getActiveProgramme();
      if (!cancelled) {
        if (p) setProgramme(p); // refresh with the persisted copy (latest log)
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Editing a running programme saves as you go — there is no draft to keep,
  // and a plan you have already started is exactly the one you are most
  // likely to want to change.
  async function updateDay(dayKey, mutate) {
    if (!programme) return;
    const next = {
      ...programme,
      days: programme.days.map((d) => {
        if (d.key !== dayKey) return d;
        const exercises = mutate(d.exercises);
        return { ...d, exercises, muscles: [...new Set(exercises.map((e) => e.muscle))] };
      }),
    };
    setProgramme(next);
    await saveActiveProgramme(next);
    if (onProgrammeChange) onProgrammeChange(next);
  }

  const removeExercise = (dayKey, exId) =>
    updateDay(dayKey, (list) => (list.length > 1 ? list.filter((e) => e.id !== exId) : list));

  const addExercise = (dayKey, ex, muscle) =>
    updateDay(dayKey, (list) =>
      list.some((e) => e.id === ex.id)
        ? list
        : reorderByType([...list, { id: ex.id, name: ex.name, muscle, type: ex.type }]),
    );

  if (loading) {
    return (
      <div>
        <TopBar title="Programme" onBack={onBack} />
        <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
      </div>
    );
  }
  if (!programme) {
    return (
      <div>
        <TopBar title="Programme" onBack={onBack} />
        <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30, fontSize: 13.5 }}>No active programme.</div>
      </div>
    );
  }

  const nextIdx = programmeNextIndex(programme);
  const ordered = [...programme.days.slice(nextIdx), ...programme.days.slice(0, nextIdx)];
  const done = programmeCompleted(programme);
  const planned = programmePlanned(programme);
  const week = programmeWeekNumber(programme);
  const pct = planned ? Math.min(100, Math.round((done / planned) * 100)) : 0;

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="Programme" onBack={onBack} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 19, textTransform: "uppercase", marginBottom: 4 }}>{programme.name}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ color: COLORS.textDim, fontSize: 12.5 }}>Week {week} of {programme.weeks}</span>
            <span style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{done}/{planned} sessions</span>
          </div>
          <div style={{ height: 6, background: COLORS.surfaceRaised, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: COLORS.accent }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Must pass the programme explicitly — wiring onViewStats
                straight to onClick handed the click event to the stats
                screen instead, which then had no id to match sessions
                against and no days array to size the plan from. */}
            <button onClick={() => onViewStats(programme)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              <TrendingUp size={13} color={COLORS.accent} /> Progress
            </button>
            <button onClick={() => setConfirmingFinish(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: "9px 0", color: COLORS.accent, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
              <Check size={13} /> Finish
            </button>
          </div>
          {confirmingFinish && (
            <div style={{ marginTop: 12, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: COLORS.text, fontSize: 12.5, marginBottom: 10 }}>
                {done < planned
                  ? "Finish this programme now? It'll move to Finished Programmes with your stats so far."
                  : "Complete this programme? It'll move to Finished Programmes."}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setConfirmingFinish(false)} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.textDim, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                  Cancel
                </button>
                <button onClick={() => { setConfirmingFinish(false); onFinishProgramme(); }} style={{ flex: 1, background: COLORS.accent, border: "none", borderRadius: 8, padding: "9px 0", color: COLORS.onAccent, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          Your workouts
        </div>
        {ordered.map((day, i) => {
          const isNext = i === 0;
          const lastDone = lastDoneForDay(programme, day.key);
          const isOpen = openDay === day.key;
          const onlyOne = day.exercises.length === 1;
          return (
            <div key={day.key} style={{ background: COLORS.surface, border: `1px solid ${isNext ? COLORS.accent : COLORS.line}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <button
                  onClick={() => { setOpenDay(isOpen ? null : day.key); setAddTo(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, background: "transparent", border: "none", padding: 0, textAlign: "left" }}
                >
                  <span style={{ color: COLORS.textDim, flexShrink: 0, display: "flex" }}>
                    {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase" }}>{day.name}</span>
                      {isNext && <span style={{ color: COLORS.accent, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", border: `1px solid ${COLORS.accent}`, borderRadius: 999, padding: "2px 7px" }}>Next</span>}
                    </span>
                    <span style={{ display: "block", color: COLORS.textDim, fontSize: 11.5, marginTop: 2 }}>
                      {day.exercises.length} exercise{day.exercises.length === 1 ? "" : "s"} · {lastDone ? `last: ${lastDone}` : "not done yet"}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => onStartDay(day, programme)}
                  style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: isNext ? COLORS.accent : COLORS.surfaceRaised, border: isNext ? "none" : `1px solid ${COLORS.line}`, borderRadius: 10, padding: "10px 16px", color: isNext ? COLORS.onAccent : COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                >
                  <Play size={14} /> Start
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.line}` }}>
                  {day.exercises.map((ex) => (
                    <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: COLORS.surfaceRaised, borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: COLORS.text, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
                        <div style={{ color: COLORS.textDim, fontSize: 11 }}>{ex.muscle}</div>
                      </div>
                      {/* A day with nothing in it would start an empty
                          workout, so the last exercise cannot be removed —
                          swap it instead by adding the replacement first. */}
                      <button
                        onClick={() => removeExercise(day.key, ex.id)}
                        disabled={onlyOne}
                        title={onlyOne ? "Add another exercise before removing this one" : `Remove ${ex.name}`}
                        style={{ color: onlyOne ? COLORS.line : COLORS.textDim, flexShrink: 0, marginLeft: 8 }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}

                  {addTo === day.key ? (
                    <div style={{ marginTop: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ color: COLORS.text, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Add exercise</span>
                        <button onClick={() => setAddTo(null)} style={{ color: COLORS.textDim }}><X size={15} /></button>
                      </div>
                      {/* Remounts after each add so the search box clears —
                          otherwise the term you just used sits there matching
                          the exercise it is now excluding. */}
                      <ExerciseSearchPicker
                        key={day.exercises.length}
                        autoFocus
                        surface={COLORS.surface}
                        maxHeight={300}
                        excludeIds={new Set(day.exercises.map((e) => e.id))}
                        onAdd={(ex, m) => addExercise(day.key, ex, m)}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddTo(day.key)}
                      style={{ width: "100%", marginTop: 4, background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.textDim, fontSize: 12.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    >
                      <Plus size={13} /> Add exercise
                    </button>
                  )}

                  <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 10 }}>
                    Changes apply from your next session — anything already logged stays as you did it.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgrammeStatsScreen({ programme, isFinished, onBack, onHome }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = (await safeGet("workout-history")) || [];
      if (!cancelled) setStats(computeProgrammeStats(programme, hist));
    }
    load();
    return () => { cancelled = true; };
  }, [programme]);

  const tile = { background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14, flex: 1 };
  const big = { color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 24, lineHeight: 1 };
  const small = { color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 5 };

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title={isFinished ? "Programme Complete" : "Programme Progress"} onBack={onBack} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 20, textTransform: "uppercase", marginBottom: 2 }}>{programme.name}</div>
        <div style={{ color: COLORS.textDim, fontSize: 12.5, marginBottom: 18 }}>
          {stats && stats.firstDate ? `${stats.firstDate} → ${stats.lastDate || "…"}` : "No sessions logged yet."}
          {isFinished && programme.endedEarly ? " · ended early" : ""}
        </div>

        {!stats ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 20 }}>Crunching numbers…</div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={tile}><div style={big}>{stats.sessions}</div><div style={small}>of {stats.planned} sessions</div></div>
              <div style={tile}><div style={big}>{stats.adherence}%</div><div style={small}>adherence</div></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={tile}><div style={big}>{stats.totalSets}</div><div style={small}>sets logged</div></div>
              <div style={tile}><div style={big}>{(stats.totalVolume / 1000).toFixed(1)}t</div><div style={small}>total volume</div></div>
            </div>

            <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
              Biggest strength gains
            </div>
            {stats.gainers.length === 0 ? (
              <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: 18 }}>
                Not enough repeat sessions yet to measure progression. Keep logging and this fills in.
              </div>
            ) : (
              <div style={{ marginBottom: 18 }}>
                {stats.gainers.slice(0, 8).map((g) => {
                  const up = g.pct >= 0;
                  return (
                    <div key={g.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                      <div style={{ minWidth: 0, marginRight: 10 }}>
                        <div style={{ color: COLORS.text, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                        <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>e1RM {g.from} → {g.to} kg</div>
                      </div>
                      <div style={{ color: up ? "#5FB86B" : COLORS.bad, fontFamily: "'Oswald', sans-serif", fontSize: 15, flexShrink: 0 }}>
                        {up ? "+" : ""}{g.pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isFinished && onHome && (
              <button onClick={onHome} style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 12, padding: "15px 0", color: COLORS.onAccent, fontSize: 14, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Back to Home
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SplitScreen({ onBack, onPick, onCopyPrevious, onOneRMSession }) {
  return (
    <div>
      <TopBar title="Choose Split" onBack={onBack} />
      <div style={{ padding: "4px 20px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={onCopyPrevious}
          style={{
            width: "100%",
            background: "transparent",
            border: `1px dashed ${COLORS.accent}`,
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HistoryIcon size={18} color={COLORS.accent} />
            <div>
              <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Copy Previous
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12 }}>Redo a past workout exactly as logged</div>
            </div>
          </div>
          <ChevronRight size={20} color={COLORS.accent} />
        </button>
        <button
          onClick={onOneRMSession}
          style={{
            width: "100%",
            background: "transparent",
            border: `1px dashed ${COLORS.accent}`,
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Trophy size={18} color={COLORS.accent} />
            <div>
              <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
                1RM Session
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12 }}>Guided max attempt, built from your 1RM goals</div>
            </div>
          </div>
          <ChevronRight size={20} color={COLORS.accent} />
        </button>
      </div>
      <div style={{ padding: "0 20px 4px", color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>
        Or start fresh
      </div>
      <div style={{ padding: "10px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {Object.keys(SPLITS).map((split, idx) => (
          <button
            key={split}
            data-tour={idx === 0 ? "split-list" : undefined}
            onClick={() => onPick(split)}
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.line}`,
              borderRadius: 14,
              padding: "18px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 18, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {split}
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12.5, marginTop: 3 }}>
                {SPLITS[split].join(" · ")}
              </div>
            </div>
            <ChevronRight size={20} color={COLORS.textDim} />
          </button>
        ))}
      </div>
    </div>
  );
}

function CopyPreviousScreen({ onBack, onPick }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = (await safeGet("workout-history")) || [];
      if (!cancelled) {
        setSessions([...hist].reverse());
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <TopBar title="Copy Previous" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        Pick a past workout to redo with the exact same exercises.
      </div>
      <div style={{ padding: "10px 20px 40px" }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
        ) : sessions.length === 0 ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30, fontSize: 13.5 }}>
            No past workouts yet. Finish one first and it'll show up here.
          </div>
        ) : (
          sessions.map((s) => {
            const muscles = [...new Set(s.exercises.map((e) => e.muscle))];
            return (
              <button
                key={s.id}
                onClick={() => onPick(s)}
                style={{
                  width: "100%",
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                <SessionSummary session={s} muscles={muscles} />
                <ChevronRight size={18} color={COLORS.textDim} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function SelectScreen({ split, settings, onBack, onContinue, onContinueSpecific }) {
  const isAdvanced = settings.appMode === "advanced";
  const [recovery, setRecovery] = useState({});
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({});
  const [mode, setMode] = useState("tap"); // "tap" | "specific"
  const [specificSelected, setSpecificSelected] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [, setPausedTick] = useState(0);
  const [openMuscles, setOpenMuscles] = useState(new Set()); // body-part accordions expanded in "specific exercises" mode

  async function handleTogglePaused(id) {
    await togglePausedExercise(id);
    setPausedTick((n) => n + 1);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = (await safeGet("workout-history")) || [];
      if (!cancelled) {
        setRecovery(computeMuscleLastMap(hist));
        setLoading(false);
      }
    }
    setSelection({});
    setSpecificSelected(new Set());
    load();
    return () => {
      cancelled = true;
    };
  }, [split]);

  function addTap(m) {
    const max = visibleExercises(m).length;
    setSelection((prev) => {
      const cur = prev[m] || 0;
      if (cur >= max) return prev;
      return { ...prev, [m]: cur + 1 };
    });
  }
  function removeTap(m) {
    setSelection((prev) => {
      const cur = prev[m] || 0;
      if (cur <= 0) return prev;
      const next = { ...prev, [m]: cur - 1 };
      if (next[m] === 0) delete next[m];
      return next;
    });
  }
  function toggleSpecific(m, id) {
    setSpecificSelected((prev) => {
      const next = new Set(prev);
      const key = `${m}:${id}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const total = Object.values(selection).reduce((a, b) => a + b, 0);
  const specificTotal = specificSelected.size;
  const activeTotal = mode === "specific" ? specificTotal : total;

  const [showNameInput, setShowNameInput] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  async function saveTemplate() {
    const name = templateName.trim() || `${split} Workout`;
    const prev = (await safeGet("templates")) || [];
    const template =
      mode === "specific"
        ? { id: `tpl-${Date.now()}`, name, split, mode: "specific", exercises: buildFromSpecificSelection(split, specificSelected).map((e) => ({ id: e.id, muscle: e.muscle })), createdAt: todayStr() }
        : { id: `tpl-${Date.now()}`, name, split, mode: "tap", selection, createdAt: todayStr() };
    await safeSet("templates", [...prev, template]);
    setShowNameInput(false);
    setTemplateName("");
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  function handleBuild() {
    if (mode === "specific") {
      onContinueSpecific(buildFromSpecificSelection(split, specificSelected));
    } else {
      onContinue(selection);
    }
  }

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [, forceRefresh] = useState(0);

  async function handleSaveCustomExercise(ex) {
    registerCustomExercise(ex);
    const prev = (await safeGet("custom-exercises")) || [];
    await safeSet("custom-exercises", [...prev, ex]);
    setShowAddExercise(false);
    forceRefresh((n) => n + 1); // EXERCISES mutated in place — force a re-render to reflect it
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title={split} onBack={onBack} />
      <div style={{ padding: "0 20px 4px", color: COLORS.textDim, fontSize: 13 }}>
        {mode === "tap" ? "Tap a muscle to add an exercise for it. Tap again to add another." : "Pick exactly the exercises you want."}
      </div>
      {isAdvanced && (
        <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setMode(mode === "tap" ? "specific" : "tap")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.accent, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, background: "transparent", border: "none", padding: "4px 0" }}
          >
            {mode === "tap" ? "Choose specific exercises instead" : "Back to muscle-tap mode"}
          </button>
          <button
            onClick={() => setShowAddExercise((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.textDim, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, background: "transparent", border: "none", padding: "4px 0" }}
          >
            <Plus size={13} /> New
          </button>
        </div>
      )}

      {showAddExercise && isAdvanced && (
        <div style={{ padding: "0 20px 12px" }}>
          <NewExerciseForm
            muscles={SPLITS[split]}
            defaultMuscle={SPLITS[split][0]}
            onSave={handleSaveCustomExercise}
            onCancel={() => setShowAddExercise(false)}
          />
        </div>
      )}

      {mode === "tap" ? (
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {SPLITS[split].map((m) => {
            const last = recovery[m];
            const stage = recoveryStage(last, m);
            const count = selection[m] || 0;
            const max = visibleExercises(m).filter((e) => !PAUSED_EXERCISE_IDS.has(e.id)).length;
            return (
              <button
                key={m}
                onClick={() => addTap(m)}
                disabled={count >= max}
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${count > 0 ? COLORS.accent : COLORS.line}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: count >= max ? 0.6 : 1,
                }}
              >
                <div>
                  <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 17, textTransform: "uppercase" }}>
                    {m}
                  </div>
                  {/* Same red/amber/green banding as the readiness map, so the
                      screen where muscles get picked agrees with it. */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                    {loading ? (
                      <>
                        <Clock size={12} /> …
                      </>
                    ) : (
                      <>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: STAGE_COLORS[stage], flexShrink: 0 }} />
                        {trainedAgoLabel(lastWorkedAt(last))}
                        {last && stage !== "green" ? ` · ready in ${hoursUntilReady(last, m)}h` : ""}
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {count > 0 && (
                    <div
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTap(m);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: COLORS.surfaceRaised,
                        border: `1px solid ${COLORS.line}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.textDim,
                      }}
                    >
                      <Minus size={14} />
                    </div>
                  )}
                  <div
                    style={{
                      minWidth: 28,
                      height: 28,
                      borderRadius: 8,
                      background: count > 0 ? COLORS.accent : COLORS.surfaceRaised,
                      border: `1px solid ${count > 0 ? COLORS.accent : COLORS.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: count > 0 ? COLORS.onAccent : COLORS.textDim,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "0 6px",
                    }}
                  >
                    {count}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "0 20px" }}>
          <input
            type="text"
            placeholder="Search exercises…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "10px 12px", color: COLORS.text, fontSize: 13.5, marginBottom: 16 }}
          />
          {SPLITS[split].map((m) => {
            const filtered = visibleExercises(m).filter((ex) => exerciseMatchesQuery(ex, searchQuery));
            if (filtered.length === 0) return null;
            const isOpen = searchQuery.trim() ? true : openMuscles.has(m);
            return (
              <div key={m} style={{ marginBottom: 10 }}>
                <MuscleAccordion
                  muscle={m}
                  count={filtered.length}
                  isOpen={isOpen}
                  onToggle={() => setOpenMuscles((prev) => {
                    const next = new Set(prev);
                    if (next.has(m)) next.delete(m); else next.add(m);
                    return next;
                  })}
                >
                  {filtered.map((ex) => {
                    const key = `${m}:${ex.id}`;
                    const isSelected = specificSelected.has(key);
                    const isPaused = PAUSED_EXERCISE_IDS.has(ex.id);
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          background: COLORS.surface,
                          border: `1px solid ${isSelected ? COLORS.accent : COLORS.line}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                          opacity: isPaused ? 0.55 : 1,
                        }}
                      >
                        <button
                          onClick={() => toggleSpecific(m, ex.id)}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", textAlign: "left" }}
                        >
                          <div>
                            <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14.5, textTransform: "uppercase" }}>
                              {ex.name}
                            </div>
                            <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                              {ex.type === "compound" ? "Compound" : ex.type === "isolation" ? "Isolation" : "Mobility"}{isPaused ? " · Paused" : ""}
                            </div>
                          </div>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              border: `1.5px solid ${isSelected ? COLORS.accent : COLORS.line}`,
                              background: isSelected ? COLORS.accent : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <Check size={14} color={COLORS.onAccent} />}
                          </div>
                        </button>
                        <button
                          onClick={() => handleTogglePaused(ex.id)}
                          title={isPaused ? "Unpause — allow auto-selection again" : "Pause — exclude from auto-selection"}
                          style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: isPaused ? COLORS.accent : COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        >
                          {isPaused ? <Play size={13} /> : <Pause size={13} />}
                        </button>
                      </div>
                    );
                  })}
                </MuscleAccordion>
              </div>
            );
          })}
        </div>
      )}

      {activeTotal > 0 && isAdvanced && (
        <div style={{ padding: "0 20px 100px" }}>
          {!showNameInput ? (
            <button
              onClick={() => setShowNameInput(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, background: "transparent", border: "none", padding: "6px 0" }}
            >
              <Bookmark size={13} /> {savedMsg ? "Saved as template" : "Save this as a template"}
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                autoFocus
                type="text"
                placeholder={`${split} Workout`}
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 13.5 }}
              />
              <button onClick={saveTemplate} style={{ width: 40, borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.onAccent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={16} />
              </button>
              <button onClick={() => setShowNameInput(false)} style={{ width: 40, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surfaceRaised, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: `linear-gradient(to top, ${COLORS.bg} 60%, transparent)` }}>
        <button
          onClick={handleBuild}
          disabled={activeTotal === 0}
          style={{
            width: "100%",
            background: activeTotal === 0 ? COLORS.surfaceRaised : COLORS.accent,
            color: activeTotal === 0 ? COLORS.textDim : COLORS.onAccent,
            border: "none",
            borderRadius: 14,
            padding: "18px 0",
            fontFamily: "'Oswald', sans-serif",
            fontSize: 17,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {activeTotal === 0 ? "Select at least one exercise" : `Build Workout · ${activeTotal} exercise${activeTotal === 1 ? "" : "s"}`}
        </button>
      </div>

    </div>
  );
}

// Compares a set against the same-numbered set from the last session so
// the inputs can show progress without the user doing the arithmetic:
// "up" for more weight or more reps, "down" for less, "same" for an exact
// repeat. Weight is judged first — adding load is progress even when reps
// come down with it, which is how double progression is meant to run.
// Returns null while there isn't enough typed in for a fair comparison,
// so a half-filled row stays neutral instead of flashing red.
function setProgressTone(current, previous) {
  if (!current || !previous) return null;
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };
  const weight = num(current.weight);
  const prevWeight = num(previous.weight);
  const reps = num(current.reps);
  const prevReps = num(previous.reps);
  if (weight !== null && prevWeight !== null && weight !== prevWeight) {
    return weight > prevWeight ? "up" : "down";
  }
  if (reps !== null && prevReps !== null && reps !== prevReps) {
    return reps > prevReps ? "up" : "down";
  }
  // Both null means a bodyweight lift with no load logged either time,
  // which still counts as matching.
  const weightMatches = weight === prevWeight;
  const repsMatch = reps !== null && prevReps !== null && reps === prevReps;
  return weightMatches && repsMatch ? "same" : null;
}

// Green reads as a win, so it gets the heavier outline; red is the same
// weight so a drop is obvious without shouting, and grey sits quietly
// between them.
// A function rather than a constant: it reads COLORS, and COLORS is rewritten
// when the colour scheme changes.
function setToneStyle(tone) {
  const styles = {
    up: { borderColor: COLORS.ok, borderWidth: 3 },
    down: { borderColor: COLORS.bad, borderWidth: 2 },
    same: { borderColor: COLORS.textDim, borderWidth: 2 },
  };
  return styles[tone];
}

// A circle rather than another box, in a colour of its own, so the row
// still reads as "weight, reps" at a glance and the effort tag is clearly
// a different kind of thing. Tapping pops the four choices out beside it
// instead of opening a dialog — this gets used between sets, one-handed.
function rirColor() {
  return THEME.rir || COLOUR_SCHEMES.default.dark.rir;
}

function RirTile({ value, onPick, open, onToggle }) {
  const setOpen = onToggle;
  const set = value !== null && value !== undefined && value !== "";
  const current = set ? RIR_OPTIONS.find((o) => o.value === Number(value)) : null;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Reps in reserve"
        title={current ? `${current.desc} — tap to change` : "Reps in reserve"}
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: `1.5px solid ${set ? rirColor() : COLORS.line}`,
          background: set ? hexToRgba(rirColor(), 0.18) : "transparent",
          color: set ? rirColor() : COLORS.textDim,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: set ? 12 : 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {set ? current.label : "RIR"}
      </button>
      {open && (
        <>
          {/* Tapping anywhere else closes it, so the popout never traps. */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 36,
              zIndex: 41,
              display: "flex",
              gap: 5,
              background: COLORS.surfaceRaised,
              border: `1px solid ${rirColor()}`,
              borderRadius: 12,
              padding: 6,
              boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
            }}
          >
            {RIR_OPTIONS.map((o) => {
              const active = set && Number(value) === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => { onPick(o.value); setOpen(false); }}
                  title={o.desc}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: `1.5px solid ${active ? rirColor() : COLORS.line}`,
                    background: active ? rirColor() : "transparent",
                    color: active ? "#10142B" : COLORS.text,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12.5,
                    padding: 0,
                  }}
                >
                  {o.label}
                </button>
              );
            })}
            {set && (
              <button
                onClick={() => { onPick(""); setOpen(false); }}
                title="Clear"
                style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${COLORS.line}`, background: "transparent", color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  sets,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onToggleSetDone,
  history,
  onStartRest,
  onRemoveExercise,
  settings,
  isFirstForMuscle,
  meta,
  onMetaChange,
  onAddDropset,
  onDropChange,
  onRemoveDrop,
  onStartSuperset,
  onClearWeights,
  onFillFromLast,
  supersetInfo,
}) {
  const isAdvanced = settings.appMode === "advanced";
  // The implement is what everything else on this card hangs off: whether a
  // brand field appears, whether there are grips to pick, and which past
  // sessions "last time" is allowed to compare against.
  const methodOptions = methodsFor(ex.id);
  const method = meta.method || defaultMethodFor(ex.id) || "";
  // Derived here rather than handed down ready-made, so changing the
  // implement or typing a machine name re-points "last time" as you go.
  const last = buildLastEntry(history[ex.id], isAdvanced ? meta.brand : "", isAdvanced ? method : "");
  // Compounds only, which is what the setting promises. Ramping up to a
  // 5kg lateral raise is noise, and it was appearing on every isolation
  // lift that happened to be first for its muscle.
  const showWarmupBlock = settings.showWarmups && isFirstForMuscle && ex.type === "compound";
  // Some people tick sets off, some just type and move on. Off, the boxes go
  // from both the set rows and the warm-up ramp; nothing about what gets
  // saved changes, since that has always followed what you typed.
  const showTicks = settings.showSetTicks !== false;
  const warmups = showWarmupBlock ? warmupSets(last && last.weight) : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggable = ex.type !== "mobility";

  const [confirmRepeat, setConfirmRepeat] = useState(false);

  // The rows to write if the numbers are tapped. Older history predates
  // per-set records and carries one weight and rep count for the whole
  // exercise, so it becomes a single set rather than nothing.
  const lastSets = last && !last.brandMismatch
    ? (last.sets && last.sets.length ? last.sets : (last.weight || last.reps ? [{ weight: last.weight, reps: last.reps }] : []))
    : [];
  const repeatable = isLoggable && !!onFillFromLast && lastSets.length > 0;
  // Anything already entered on this card, including a ticked-off set.
  const hasEntries = (sets || []).some((st) => (st.weight || "") !== "" || (st.reps || "") !== "" || st.done);

  // A single tap when the card is empty, two when it is not — replacing sets
  // someone has already logged is the one way this button could cost them
  // work, so it asks first rather than being clever about merging.
  function handleRepeatLast() {
    if (!repeatable) return;
    if (hasEntries && !confirmRepeat) {
      setConfirmRepeat(true);
      return;
    }
    onFillFromLast(ex.id, lastSets);
    setConfirmRepeat(false);
  }

  const [noteOpen, setNoteOpen] = useState(false);
  const [openRir, setOpenRir] = useState(null); // index of the set whose RIR popout is open
  const [warmupChecked, setWarmupChecked] = useState(() => new Set());
  // Calisthenics get their own dedicated control instead of being buried in
  // the cog menu: how a dip or a pull-up is loaded is a per-session decision
  // made before the first rep, not a setting you go looking for.
  const calisthenic = isCalisthenic(ex.id);
  const loading = calisthenic ? loadingOf(ex.id, method, "") : null;
  const [loadingOpen, setLoadingOpen] = useState(false);
  // Asked once per exercise per session, the first time a weight field is
  // touched. Assistance settings and belt weights barely move week to week,
  // so retyping the same number every session is pure friction — but
  // pre-filling it silently would be worse, because a number you did not
  // enter is a number you will not notice is wrong.
  const [weightPromptAt, setWeightPromptAt] = useState(null);
  const [weightPromptDone, setWeightPromptDone] = useState(false);
  /* The last figure logged at THIS loading, not simply the last figure. An
     assisted session and a weighted one both store a number in the same
     column and they mean opposite things, so offering the wrong one would
     suggest hanging 30kg off someone who needs 30kg of help. */
  const lastLoadingWeight = (() => {
    if (!calisthenic || loading === "Bodyweight") return null;
    const list = history[ex.id] || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const top = getTopSet(list[i].sets) || {};
      if (loadingOf(ex.id, list[i].method, top.weight) !== loading) continue;
      const w = parseFloat(top.weight);
      if (Number.isFinite(w) && w > 0) return w;
    }
    return null;
  })();
  const showMethodPicker = isAdvanced && ex.type !== "mobility" && methodOptions.length > 1 && !calisthenic;
  const cable = isCableExercise(ex, method);
  const machineOnly = !cable && isMachineExercise(ex, method);
  const showMachineBlock = isAdvanced && (cable || machineOnly);
  const grips = cable ? getCableGrips(ex) : [];

  const inputBase = {
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 8,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>
            {ex.type === "compound" ? "Compound" : ex.type === "isolation" ? "Isolation" : "Mobility"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 17, textTransform: "uppercase" }}>
              {ex.name}
            </div>
            {ex.type !== "mobility" && (
              <a
                data-tour="form-video"
                href={formVideoUrl(ex.name, method)}
                target="_blank"
                rel="noreferrer"
                title={`How to do ${ex.name}`}
                aria-label={`Watch how to do ${ex.name}`}
                style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, textDecoration: "none" }}
              >
                <Play size={11} />
              </a>
            )}
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 12 }}>{ex.muscle}</div>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{ width: 28, height: 28, borderRadius: 8, background: menuOpen ? COLORS.accent : COLORS.surfaceRaised, border: `1px solid ${menuOpen ? COLORS.accent : COLORS.line}`, color: menuOpen ? COLORS.onAccent : COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <SettingsIcon size={14} />
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10, marginBottom: 10 }}>
          {isLoggable && isAdvanced && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                onClick={() => {
                  onAddDropset(ex.id);
                  setMenuOpen(false);
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.3 }}
              >
                <ChevronDown size={13} color={COLORS.accent} /> Dropset
              </button>
              <button
                onClick={() => {
                  onStartSuperset();
                  setMenuOpen(false);
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.3 }}
              >
                <Sparkles size={13} color={COLORS.accent} /> Superset
              </button>
            </div>
          )}
          {/* Changing the implement no longer swaps the exercise for a
              different one — it is the same lift loaded another way, so the
              history stays attached and only the comparison narrows. */}
          {showMethodPicker && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                How are you loading it?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {methodOptions.map((opt) => {
                  const active = method === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        onMetaChange(ex.id, "method", opt);
                        setMenuOpen(false);
                      }}
                      style={{ background: active ? COLORS.accent : COLORS.surface, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, borderRadius: 8, padding: "10px 8px", color: active ? COLORS.onAccent : COLORS.text, fontSize: 12, textAlign: "center", lineHeight: 1.25 }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button
            onClick={onRemoveExercise}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: `1px solid ${COLORS.bad}`, borderRadius: 8, padding: "8px 0", color: COLORS.bad, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            <Trash2 size={13} /> Delete Exercise
          </button>
        </div>
      )}

      {supersetInfo && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: hexToRgba(supersetInfo.color, 0.14), border: `1px solid ${supersetInfo.color}`, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: supersetInfo.color }} />
          <span style={{ color: supersetInfo.color, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
            Superset {supersetInfo.label}
          </span>
        </div>
      )}

      {calisthenic && (
        <div data-tour="calisthenic-loading" style={{ marginBottom: 10 }}>
          {!loadingOpen ? (
            <button
              onClick={() => setLoadingOpen(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "10px 0", color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {loading}
              <ChevronDown size={14} />
            </button>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {CALISTHENIC_LOADINGS.map((opt) => {
                const active = loading === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      onMetaChange(ex.id, "method", opt);
                      // Switching loading changes what the weight column
                      // means, so a number typed under the old meaning is
                      // cleared rather than silently reinterpreted.
                      if (opt !== loading) onClearWeights(ex.id);
                      setLoadingOpen(false);
                    }}
                    style={{ background: active ? COLORS.accent : COLORS.surfaceRaised, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, borderRadius: 10, padding: "11px 4px", color: active ? COLORS.onAccent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.3 }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {calisthenic && weightPromptAt !== null && lastLoadingWeight !== null && (
        <div style={{ background: COLORS.surfaceRaised, border: `1px solid ${COLORS.accent}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ color: COLORS.text, fontSize: 12.5, marginBottom: 8 }}>
            Last {loading.toLowerCase()} session used{" "}
            <strong>{lastLoadingWeight}{settings.weightUnit}</strong>. Use it again?
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                // Fills every set still blank, because the pin or the belt
                // is set once and then every set of the exercise uses it.
                sets.forEach((st, idx) => {
                  if (!st.weight) onSetChange(ex.id, idx, "weight", String(lastLoadingWeight));
                });
                setWeightPromptDone(true);
                setWeightPromptAt(null);
              }}
              style={{ flex: 1, background: COLORS.accent, border: "none", borderRadius: 8, padding: "9px 0", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
            >
              Use {lastLoadingWeight}{settings.weightUnit}
            </button>
            <button
              onClick={() => { setWeightPromptDone(true); setWeightPromptAt(null); }}
              style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
            >
              Enter new
            </button>
          </div>
        </div>
      )}

      {settings.showCues && (
        <div style={{ color: COLORS.textDim, fontSize: 12.5, lineHeight: 1.4, marginTop: 8, marginBottom: 10, fontStyle: "italic" }}>
          {ex.cue}
        </div>
      )}

      {showMachineBlock && (
        <div style={{ background: COLORS.surfaceRaised, borderRadius: 8, padding: "9px 10px", marginBottom: 10 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            {cable ? "Machine & grip" : "Machine"}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="Machine brand"
              value={meta.brand || ""}
              onChange={(e) => onMetaChange(ex.id, "brand", e.target.value)}
              style={{ ...inputBase, flex: 1, minWidth: 0, padding: "7px 8px", fontFamily: "system-ui, sans-serif", fontSize: 12.5 }}
            />
            {cable && (
              <select
                value={meta.grip || ""}
                onChange={(e) => onMetaChange(ex.id, "grip", e.target.value)}
                style={{ ...inputBase, flex: 1, minWidth: 0, padding: "7px 8px", fontFamily: "system-ui, sans-serif", fontSize: 12.5, appearance: "none", WebkitAppearance: "none" }}
              >
                <option value="">Grip…</option>
                {grips.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Free text for the things a set and rep count cannot hold: seat
          height, which notch the pin was on, the shoulder that twinged. */}
      {isLoggable && (
        noteOpen || (meta.notes && meta.notes.length) ? (
          <textarea
            autoFocus={noteOpen && !(meta.notes && meta.notes.length)}
            rows={2}
            placeholder="Note — seat height, how it felt, anything worth remembering"
            value={meta.notes || ""}
            onChange={(e) => onMetaChange(ex.id, "notes", e.target.value)}
            onBlur={() => setNoteOpen(false)}
            style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, color: COLORS.text, fontFamily: "system-ui, sans-serif", fontSize: 12.5, lineHeight: 1.45 }}
          />
        ) : (
          <button
            onClick={() => setNoteOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", padding: "0 0 10px", color: COLORS.textDim, fontSize: 11.5 }}
          >
            <Pencil size={11} /> Add a note
          </button>
        )
      )}

      {settings.showLastSet && (
        last ? (
          <div style={{ background: COLORS.surfaceRaised, borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, gap: 8 }}>
              <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
                {last.askedBrand ? `Last time on ${last.askedBrand}` : "Last time"}
                {!last.brandMismatch && last.order ? ` · done ${ordinal(last.order)}${last.total ? ` of ${last.total}` : ""}` : ""}
              </span>
              {!last.brandMismatch && (
                <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{last.date}</span>
              )}
            </div>
            {/* A number set on a different stack is not a target, so when this
                machine has no history the previous session is demoted to a
                footnote rather than presented as something to beat. */}
            {last.brandMismatch ? (
              <>
                <div style={{ color: COLORS.text, fontSize: 12.5, lineHeight: 1.45 }}>
                  Not logged this way before.
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  {last.date} ·{" "}
                  {(last.sets && last.sets.length ? last.sets : [{ weight: last.weight, reps: last.reps }])
                    .map((s) => `${s.weight || "–"}${s.weight ? settings.weightUnit : ""}×${s.reps || "–"}`)
                    .join("  ·  ")}
                  {[last.method, last.brand].filter(Boolean).length ? ` on ${[last.method, last.brand].filter(Boolean).join(" · ")}` : ""}
                </div>
              </>
            ) : (
              <>
                {/* Tapping the numbers writes them onto this exercise. Most
                    sessions are the last one repeated, and typing three
                    identical rows back in is the app's most repeated action.
                    Only offered where the numbers are actually a target —
                    a brandMismatch reading is explicitly not one. */}
                <button
                  onClick={handleRepeatLast}
                  disabled={!repeatable}
                  aria-label={repeatable ? "Use these weights and reps again" : undefined}
                  style={{
                    display: "block", width: "100%", textAlign: "left", background: "transparent",
                    border: "none", padding: 0, cursor: repeatable ? "pointer" : "default",
                  }}
                >
                  <span style={{ display: "block", color: COLORS.text, fontSize: 12.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>
                    {(last.sets && last.sets.length ? last.sets : [{ weight: last.weight, reps: last.reps }])
                      .map((s) => `${s.weight || "–"}${s.weight ? settings.weightUnit : ""}×${s.reps || "–"}`)
                      .join("  ·  ")}
                  </span>
                  {repeatable && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, color: confirmRepeat ? COLORS.accent : COLORS.textDim, fontSize: 11 }}>
                      <RotateCcw size={11} />
                      {confirmRepeat ? "Tap again to replace what you have typed" : "Tap to log these again"}
                    </span>
                  )}
                </button>
                {(last.method || last.brand || last.grip) && (
                  <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 4 }}>
                    on {[last.method, last.brand, last.grip].filter(Boolean).join(" · ")}
                  </div>
                )}
                {last.notes && (
                  <div style={{ color: COLORS.textDim, fontSize: 11.5, marginTop: 5, fontStyle: "italic", lineHeight: 1.4 }}>
                    “{last.notes}”
                  </div>
                )}
              </>
            )}
            {(last.supersetWith && last.supersetWith.length) || last.dropSetCount > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {last.supersetWith && last.supersetWith.length > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${hexToRgba(COLORS.accent, 0.5)}`, borderRadius: 999, padding: "3px 9px", color: COLORS.accent, fontSize: 10.5 }}>
                    <Sparkles size={11} /> Supersetted with {last.supersetWith.join(" & ")}
                  </span>
                )}
                {last.dropSetCount > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${hexToRgba(COLORS.accent, 0.5)}`, borderRadius: 999, padding: "3px 9px", color: COLORS.accent, fontSize: 10.5 }}>
                    <ChevronDown size={11} /> Drop set on {last.dropSetCount} set{last.dropSetCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            ) : null}
            {last.order > 1 && (
              <div style={{ color: COLORS.textDim, fontSize: 10.5, marginTop: 4, fontStyle: "italic" }}>
                You hit this {ordinal(last.order)} last time.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>
            last time: no history yet
          </div>
        )
      )}

      {showWarmupBlock && (
        <div style={{ background: COLORS.surfaceRaised, borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Suggested Warm-Up
          </div>
          {warmups.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {warmups.map((w, wi) => {
                const checked = showTicks && warmupChecked.has(wi);
                const label = w.placeholder ? `${w.weight} × ${w.reps}` : `${w.weight}${settings.weightUnit}×${w.reps}`;
                const text = (
                  <span style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", textDecoration: checked ? "line-through" : "none" }}>
                    {label}
                  </span>
                );
                // Without its box the row has nothing to toggle, so it stops
                // being a button rather than becoming a dead one.
                if (!showTicks) return <div key={wi}>{text}</div>;
                return (
                  <button
                    key={wi}
                    onClick={() =>
                      setWarmupChecked((prev) => {
                        const next = new Set(prev);
                        if (next.has(wi)) next.delete(wi);
                        else next.add(wi);
                        return next;
                      })
                    }
                    style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: 0 }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        flexShrink: 0,
                        border: `1.5px solid ${checked ? COLORS.accent : COLORS.line}`,
                        background: checked ? COLORS.accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {checked && <Check size={11} color={COLORS.onAccent} />}
                    </div>
                    {text}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              Start light and build up over 2-3 sets before your working weight.
            </div>
          )}
        </div>
      )}

      {sets.map((s, i) => {
        // With the boxes hidden there is nothing to tick, so every row reads
        // as done: the dimming exists to show what is left, and a permanently
        // dim list with no way to brighten it would just look broken.
        const isDone = !showTicks || s.done !== false;
        // Older records stored a single set on the record itself rather
        // than in a sets array, so fall back to that for the first row.
        const lastSets = last && last.sets && last.sets.length ? last.sets : last ? [{ weight: last.weight, reps: last.reps }] : [];
        const tone = setToneStyle(setProgressTone(s, lastSets[i]));
        const toneStyle = tone ? { border: `${tone.borderWidth}px solid ${tone.borderColor}` } : null;
        return (
        <div
          key={i}
          style={{
            marginBottom: 8,
            // Dimming an unfinished row also dims anything it opens — opacity
            // composites the whole subtree — so the RIR popout would render
            // half transparent with the row beneath showing through it. A row
            // being interacted with goes to full strength, which is the right
            // thing to look at anyway. z-index then keeps the popout above the
            // rows below, since the dimmed ones are their own stacking
            // contexts and would otherwise paint over it.
            opacity: isDone || openRir === i ? 1 : 0.55,
            position: "relative",
            zIndex: openRir === i ? 30 : "auto",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {showTicks && (
              <button
                onClick={() => onToggleSetDone(ex.id, i)}
                title={s.done !== false ? "Mark as not done yet" : "Mark as done"}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  flexShrink: 0,
                  border: `1.5px solid ${s.done !== false ? COLORS.accent : COLORS.line}`,
                  background: s.done !== false ? COLORS.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.done !== false && <Check size={13} color={COLORS.onAccent} />}
              </button>
            )}
            <div style={{ width: 18, color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
            {loading === "Bodyweight" ? (
              // Unloaded: there is no number to enter, and an empty box that
              // must stay empty is just a thing to wonder about.
              <div
                title="Bodyweight — no added or assisted load"
                style={{ width: 62, flexGrow: 0, flexShrink: 0, padding: "5px 6px", boxSizing: "border-box", textAlign: "center", borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
              >
                BW
              </div>
            ) : (
              <input
                type="number"
                inputMode="decimal"
                placeholder={loading === "Assisted" ? "−assist" : loading === "Weighted" ? "+wt" : "wt"}
                value={s.weight}
                onFocus={() => {
                  if (!calisthenic || weightPromptDone || s.weight) return;
                  if (lastLoadingWeight === null) return;
                  setWeightPromptAt(i);
                }}
                onChange={(e) => onSetChange(ex.id, i, "weight", e.target.value)}
                style={{ ...inputBase, width: 62, flexGrow: 0, flexShrink: 0, padding: "5px 6px", boxSizing: "border-box", ...toneStyle }}
              />
            )}
            <input
              type="number"
              inputMode="numeric"
              placeholder="reps"
              value={s.reps}
              onChange={(e) => onSetChange(ex.id, i, "reps", e.target.value)}
              style={{ ...inputBase, width: 62, flexGrow: 0, flexShrink: 0, padding: "5px 6px", boxSizing: "border-box", ...toneStyle }}
            />
            {isAdvanced && (
              <RirTile
                value={s.rir}
                open={openRir === i}
                onToggle={(v) => setOpenRir(v ? i : null)}
                onPick={(v) => onSetChange(ex.id, i, "rir", v)}
              />
            )}
            {sets.length > 1 && (
              <button
                onClick={() => onRemoveSet(ex.id, i)}
                style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <Minus size={14} />
              </button>
            )}
          </div>
          {(s.drops || []).map((d, di) => (
            <div key={di} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, marginLeft: 30 }}>
              <div style={{ width: 32, color: COLORS.accent, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5, textTransform: "uppercase" }}>drop</div>
              <input
                type="number"
                inputMode="decimal"
                placeholder="wt"
                value={d.weight}
                onChange={(e) => onDropChange(ex.id, i, di, "weight", e.target.value)}
                style={{ ...inputBase, width: 56, flexGrow: 0, flexShrink: 0, padding: "5px 6px", borderColor: hexToRgba(COLORS.accent, 0.5) }}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="reps"
                value={d.reps}
                onChange={(e) => onDropChange(ex.id, i, di, "reps", e.target.value)}
                style={{ ...inputBase, width: 56, flexGrow: 0, flexShrink: 0, padding: "5px 6px", borderColor: hexToRgba(COLORS.accent, 0.5) }}
              />
              <button
                onClick={() => onRemoveDrop(ex.id, i, di)}
                style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        );
      })}
      <button
        onClick={() => onAddSet(ex.id)}
        style={{
          width: "100%",
          background: "transparent",
          border: `1px dashed ${COLORS.line}`,
          borderRadius: 8,
          padding: "9px 0",
          color: COLORS.textDim,
          fontSize: 12.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <Plus size={13} /> Add set
      </button>
      <button
        onClick={() => onStartRest(ex)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "4px 0",
          color: COLORS.accent,
          fontSize: 12,
          fontFamily: "'Oswald', sans-serif",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Timer size={13} /> Start Rest ({Math.floor(REST_SECONDS[ex.type] / 60)}:{String(REST_SECONDS[ex.type] % 60).padStart(2, "0")})
      </button>
    </div>
  );
}

function WorkoutScreen({ split, selection, presetExercises, presetSupersets, resumeData, settings, appendMobility, programmeCtx, onBack, onFinish }) {
  const isAdvanced = settings.appMode === "advanced";
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState({}); // exId -> raw ex-history array
  // Read by onToggleSetDone, which is memoised with no deps so that ticking
  // a set never re-renders every card. Refs keep it looking at current
  // values without putting them in the dependency list.
  const exercisesRef = useRef(exercises);
  const settingsRef = useRef(settings);
  exercisesRef.current = exercises;
  settingsRef.current = settings;
  const [sets, setSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timer, setTimer] = useState(null);
  const [addPanel, setAddPanel] = useState(null); // null | "db" | "new"
  const [meta, setMeta] = useState({}); // exId -> { brand, grip } for cable moves
  const [supersets, setSupersets] = useState([]); // [{ id, color, exIds: [] }]
  const [ssPicker, setSsPicker] = useState(null); // null | { picked: [exId, ...] }
  const [workoutDate, setWorkoutDate] = useState(resumeData && resumeData.workoutDate ? new Date(resumeData.workoutDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [armedFinish, setArmedFinish] = useState(false); // first tap of the two
  const armedTimeout = useRef(null);
  const startedAtRef = useRef(resumeData ? resumeData.startedAt : new Date().toISOString());

  const isBackdated = dateStrOf(workoutDate) !== todayStr();

  function supersetInfoFor(exId) {
    const idx = supersets.findIndex((g) => g.exIds.includes(exId));
    if (idx === -1) return null;
    return { label: String.fromCharCode(65 + idx), color: supersets[idx].color, id: supersets[idx].id };
  }

  function moveExercise(index, direction) {
    setExercises((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  }

  function removeExercise(id) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
    setSets((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  useRestCountdown(timer, setTimer, settings.restTimerSound);

  function startRest(ex) {
    const total = REST_SECONDS[ex.type] || 90;
    setTimer({ label: ex.name, total, seconds: total, paused: false });
  }
  function togglePauseRest() {
    setTimer((prev) => (prev ? { ...prev, paused: !prev.paused } : prev));
  }
  function addRestTime(secs) {
    setTimer((prev) => (prev ? { ...prev, seconds: prev.seconds + secs, total: prev.total + secs } : prev));
  }
  function skipRest() {
    setTimer(null);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let list = resumeData
        ? resumeData.exercises
        : presetExercises
        ? presetExercises
            .map((pe) => {
              const full = ALL_EXERCISES_BY_ID[pe.id];
              return full ? { ...full, muscle: pe.muscle, method: pe.method || undefined } : null;
            })
            .filter(Boolean)
        : buildWorkout(split, selection, settings.randomizeSelection);

      if (!resumeData && appendMobility && settings.includeMobility) {
        const usedIds = new Set(list.map((e) => e.id));
        const mobility = pickSmartForMuscle("Mobility", 1, usedIds, settings.randomizeSelection);
        if (mobility.length) list = [...list, mobility[0]];
      }

      const histEntries = await Promise.all(
        list.map(async (ex) => {
          const hist = await safeGet(`ex-history:${ex.id}`);
          return [ex.id, hist || []];
        })
      );
      if (cancelled) return;
      const histMap = {};
      histEntries.forEach(([id, v]) => (histMap[id] = v));
      setExercises(list);
      setHistory(histMap);
      // A day that named a variation starts on it; the picker is still there
      // if you want a different one today.
      if (!resumeData) {
        const seeded = {};
        list.forEach((ex) => { if (ex.method) seeded[ex.id] = { method: ex.method }; });
        if (Object.keys(seeded).length) setMeta((prev) => ({ ...seeded, ...prev }));
      }
      setSets(
        resumeData
          ? Object.fromEntries(
              Object.entries(resumeData.sets).map(([exId, arr]) => [
                exId,
                arr.map((s) => (s.done === undefined ? { ...s, done: false } : s)),
              ])
            )
          : Object.fromEntries(list.map((ex) => [ex.id, [{ weight: "", reps: "", done: false }]]))
      );
      if (resumeData) {
        if (resumeData.meta) setMeta(resumeData.meta);
        if (resumeData.supersets) setSupersets(resumeData.supersets);
      } else if (presetSupersets && presetSupersets.length) {
        // Copying a session brings its pairings with it. Groups are pinned
        // to exercise ids, so drop any member that didn't make it into
        // today's list — and the whole group if that leaves it with nobody
        // left to pair with.
        const presentIds = new Set(list.map((e) => e.id));
        const carried = presetSupersets
          .map((g) => ({ ...g, exIds: g.exIds.filter((id) => presentIds.has(id)) }))
          .filter((g) => g.exIds.length > 1);
        if (carried.length) setSupersets(carried);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave an in-progress snapshot so an unfinished workout can be resumed
  // if the app is closed before hitting Finish.
  useEffect(() => {
    if (loading) return;
    safeSet("in-progress-workout", { split, exercises, sets, meta, supersets, workoutDate: workoutDate.toISOString(), programmeCtx: programmeCtx || null, startedAt: startedAtRef.current });
  }, [split, exercises, sets, meta, supersets, workoutDate, loading]);

  const onSetChange = useCallback((exId, idx, field, value) => {
    setSets((prev) => {
      const copy = { ...prev, [exId]: prev[exId].map((s, i) => (i === idx ? { ...s, [field]: value } : s)) };
      return copy;
    });
  }, []);
  const onAddSet = useCallback((exId) => {
    setSets((prev) => ({ ...prev, [exId]: [...prev[exId], { weight: "", reps: "", done: false }] }));
  }, []);
  // Used when a calisthenic exercise changes loading. Assistance and added
  // weight are opposite quantities, so a number entered under one meaning
  // would be flatly wrong under the other — reps are kept, weights are not.
  const onClearWeights = useCallback((exId) => {
    setSets((prev) => ({ ...prev, [exId]: (prev[exId] || []).map((s) => ({ ...s, weight: "" })) }));
  }, []);
  // Copies last session's weights and reps onto this exercise, one row per
  // set it had. Most sessions are the last one repeated — the same three
  // sets of the same weight — and typing them back in by hand is the single
  // most repeated action in the app.
  //
  // Reps in reserve is deliberately not copied. Weight and reps are a plan;
  // how close to failure it put you is a measurement, and carrying last
  // week's measurement forward as if it were this week's would feed the
  // readiness map a number nobody reported.
  const onFillFromLast = useCallback((exId, lastSets) => {
    if (!Array.isArray(lastSets) || !lastSets.length) return;
    setSets((prev) => ({
      ...prev,
      [exId]: lastSets.map((s) => ({ weight: s.weight || "", reps: s.reps || "", done: false })),
    }));
  }, []);
  const onRemoveSet = useCallback((exId, idx) => {
    setSets((prev) => ({ ...prev, [exId]: prev[exId].filter((_, i) => i !== idx) }));
  }, []);
  // Ticking a set off is the moment rest starts, so the timer starts
  // itself — reaching for a second button with a bar in your hands is the
  // reason people stop using rest timers at all. Only on the way to done,
  // never on un-ticking a mistake.
  const onToggleSetDone = useCallback((exId, idx) => {
    let becameDone = false;
    setSets((prev) => ({
      ...prev,
      [exId]: prev[exId].map((s, i) => {
        if (i !== idx) return s;
        becameDone = s.done === false;
        return { ...s, done: becameDone };
      }),
    }));
    if (becameDone && settingsRef.current.autoRestTimer !== false) {
      const ex = exercisesRef.current.find((e) => e.id === exId);
      if (ex) startRest(ex);
    }
  }, []);

  const onMetaChange = useCallback((exId, field, value) => {
    setMeta((prev) => ({ ...prev, [exId]: { ...prev[exId], [field]: value } }));
  }, []);

  // A dropset lives inside a set: after the main set you drop the load and rep
  // out again. setIdx defaults to the last set (cog action); the per-set button
  // targets a specific set.
  const onAddDropset = useCallback((exId, setIdx) => {
    setSets((prev) => {
      const arr = prev[exId] || [];
      if (arr.length === 0) return prev;
      const target = setIdx == null ? arr.length - 1 : setIdx;
      return {
        ...prev,
        [exId]: arr.map((s, i) => (i === target ? { ...s, drops: [...(s.drops || []), { weight: "", reps: "" }] } : s)),
      };
    });
  }, []);
  const onDropChange = useCallback((exId, setIdx, dropIdx, field, value) => {
    setSets((prev) => ({
      ...prev,
      [exId]: prev[exId].map((s, i) =>
        i === setIdx ? { ...s, drops: s.drops.map((d, j) => (j === dropIdx ? { ...d, [field]: value } : d)) } : s
      ),
    }));
  }, []);
  const onRemoveDrop = useCallback((exId, setIdx, dropIdx) => {
    setSets((prev) => ({
      ...prev,
      [exId]: prev[exId].map((s, i) =>
        i === setIdx ? { ...s, drops: (s.drops || []).filter((_, j) => j !== dropIdx) } : s
      ),
    }));
  }, []);

  // Superset picker: seed with the exercise the user tapped, let them tap more,
  // then group them (making them adjacent) with a shared outline color.
  function startSuperset(seedId) {
    const existing = supersets.find((g) => g.exIds.includes(seedId));
    setSsPicker({ picked: existing ? existing.exIds : [seedId] });
  }
  function toggleSupersetPick(exId) {
    setSsPicker((prev) => {
      if (!prev) return prev;
      const picked = prev.picked.includes(exId) ? prev.picked.filter((id) => id !== exId) : [...prev.picked, exId];
      return { picked };
    });
  }
  function cancelSuperset() {
    setSsPicker(null);
  }
  function confirmSuperset() {
    const picked = ssPicker ? ssPicker.picked : [];
    if (picked.length < 2) {
      setSsPicker(null);
      return;
    }
    const usedColors = supersets.map((g) => g.color);
    const color = SUPERSET_COLORS.find((c) => !usedColors.includes(c)) || SUPERSET_COLORS[supersets.length % SUPERSET_COLORS.length];
    const newGroup = { id: `ss-${Date.now()}`, color, exIds: picked };
    // Drop any prior membership for the picked exercises, then add the group.
    const cleaned = supersets
      .map((g) => ({ ...g, exIds: g.exIds.filter((id) => !picked.includes(id)) }))
      .filter((g) => g.exIds.length >= 2);
    setSupersets([...cleaned, newGroup]);
    // Reorder so the grouped exercises sit next to each other (in picked order),
    // anchored at the position of the first picked exercise.
    setExercises((prev) => {
      const anchor = Math.min(...picked.map((id) => prev.findIndex((e) => e.id === id)).filter((i) => i >= 0));
      const members = picked.map((id) => prev.find((e) => e.id === id)).filter(Boolean);
      const rest = prev.filter((e) => !picked.includes(e.id));
      const out = [...rest];
      out.splice(anchor, 0, ...members);
      return out;
    });
    setSsPicker(null);
  }
  function removeSuperset(groupId) {
    setSupersets((prev) => prev.filter((g) => g.id !== groupId));
  }

  async function addExerciseMidWorkout(ex) {
    setExercises((prev) => reorderByType([...prev, ex]));
    setSets((prev) => ({ ...prev, [ex.id]: prev[ex.id] || [{ weight: "", reps: "", done: false }] }));
    const hist = await safeGet(`ex-history:${ex.id}`);
    setHistory((prev) => ({ ...prev, [ex.id]: hist || [] }));
    setAddPanel(null);
  }

  async function handleSaveCustomExerciseMidWorkout(ex) {
    registerCustomExercise(ex);
    const prev = (await safeGet("custom-exercises")) || [];
    await safeSet("custom-exercises", [...prev, ex]);
    addExerciseMidWorkout(ex);
  }

  // Finishing throws away the live workout, and the button used to sit under
  // a thumb reaching for the last set. Two taps, and the arming lapses on its
  // own so a stray first tap never leaves it primed.
  function tapFinish() {
    if (saving) return;
    if (armedFinish) {
      clearTimeout(armedTimeout.current);
      setArmedFinish(false);
      handleFinish();
      return;
    }
    setArmedFinish(true);
    armedTimeout.current = setTimeout(() => setArmedFinish(false), 4000);
  }
  useEffect(() => () => clearTimeout(armedTimeout.current), []);

  async function handleFinish() {
    setSaving(true);
    const at = workoutDate.toISOString();
    const date = dateStrOf(workoutDate);
    const newPBs = [];
    const bwRecord = await safeGet("bodyweight");
    const bw = bwRecord ? parseFloat(bwRecord.value) : null;

    // First pass: collect the exercises that actually have logged work, keeping
    // their drops and cable machine/grip. Order within this list is what we
    // store as "done Nth" for next time's context.
    const logged = [];
    for (const ex of exercises) {
      // A set is saved if it has any entered data. The per-set checkbox is a
      // visual "done" marker only — it never decides whether data is saved, so
      // a filled-in set can't be silently dropped just because its box is
      // unticked (which is the default state).
      const cleanSets = (sets[ex.id] || [])
        .filter(setHasData)
        .map((s) => {
          const drops = (s.drops || []).filter((d) => d.weight !== "" || d.reps !== "");
          const out = { weight: s.weight, reps: s.reps };
          if (drops.length) out.drops = drops;
          if (s.rir !== null && s.rir !== undefined && s.rir !== "") out.rir = Number(s.rir);
          return out;
        });
      if (cleanSets.length === 0) continue;
      const m = meta[ex.id] || {};
      const entry = { id: ex.id, name: ex.name, muscle: ex.muscle, sets: cleanSets };
      // Notes apply to anything, not just the machine lifts.
      if (m.notes && m.notes.trim()) entry.notes = m.notes.trim();
      const chosenMethod = m.method || defaultMethodFor(ex.id);
      if (chosenMethod && methodsFor(ex.id).length > 1) entry.method = chosenMethod;
      if (isMachineExercise(ex, chosenMethod)) {
        if (m.brand) entry.brand = m.brand;
        if (m.grip) entry.grip = m.grip;
      }
      logged.push(entry);
    }

    const total = logged.length;
    // Superset membership is stored on the session as groups of ids, which
    // says nothing to an exercise looking back at its own history. Resolve
    // it once here into the partner names each exercise was paired with, so
    // next time the card can say what it was supersetted with.
    const loggedNames = new Map(logged.map((e) => [e.id, e.name]));
    const supersetPartners = {};
    supersets.forEach((group) => {
      const members = group.exIds.filter((id) => loggedNames.has(id));
      if (members.length < 2) return;
      members.forEach((id) => {
        supersetPartners[id] = members.filter((other) => other !== id).map((other) => loggedNames.get(other));
      });
    });

    for (let i = 0; i < logged.length; i++) {
      const ex = logged[i];
      const order = i + 1;

      const histEntry = { date, at, sets: ex.sets, order, total };
      if (ex.brand) histEntry.brand = ex.brand;
      if (ex.grip) histEntry.grip = ex.grip;
      if (ex.method) histEntry.method = ex.method;
      if (ex.notes) histEntry.notes = ex.notes;
      if (supersetPartners[ex.id]) histEntry.supersetWith = supersetPartners[ex.id];
      const prevHist = (await safeGet(`ex-history:${ex.id}`)) || [];
      const newHist = sortByAt([...prevHist, histEntry]).slice(-20);
      await safeSet(`ex-history:${ex.id}`, newHist);

      if (PB_EXERCISE_IDS.includes(ex.id)) {
        const topSet = getTopSet(ex.sets);
        const storedPB = await safeGet(`pb:${ex.id}`);
        if (beatsRecord(topSet, storedPB)) {
          const record = {
            exerciseId: ex.id,
            name: ex.name,
            weight: topSet.weight,
            reps: topSet.reps,
            date,
            bodyWeightPct: bodyWeightPct(topSet.weight, bw),
          };
          await safeSet(`pb:${ex.id}`, record);
          newPBs.push(record);
        }
      }
    }

    // Muscle readiness is derived live from workout-history (see
    // computeMuscleLastMap), so there's no separate "last trained" cache to
    // keep in sync here — it just falls out of the session we're about to save.

    if (logged.length > 0) {
      const prevSessions = (await safeGet("workout-history")) || [];
      const session = { id: `${date}-${Date.now()}`, date, at, split, exercises: logged, supersets: supersets.length ? supersets : undefined };
      if (programmeCtx) {
        session.programmeId = programmeCtx.programmeId;
        session.dayKey = programmeCtx.dayKey;
        session.dayName = programmeCtx.dayName;
      }
      const all = [...prevSessions, session].sort((a, b) => {
        const ka = a.at || a.date || "";
        const kb = b.at || b.date || "";
        return ka < kb ? -1 : ka > kb ? 1 : 0;
      });
      await safeSet("workout-history", all.slice(-200));

      // Log this session against the active programme so it knows what's next
      // and can track progress.
      if (programmeCtx) {
        await recordProgrammeSession({
          dayKey: programmeCtx.dayKey,
          dayName: programmeCtx.dayName,
          date,
          at,
          sessionId: session.id,
        });
      }
    }

    await safeDelete("in-progress-workout");
    setSaving(false);
    onFinish(newPBs);
  }

  const addedIds = new Set(exercises.map((e) => e.id));

  return (
    // Room at the foot only while the superset panel is floating there.
    <div style={{ paddingBottom: ssPicker ? 130 : 24 }}>
      <TopBar title={split} onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        {exercises.length} exercise{exercises.length === 1 ? "" : "s"} · log your sets as you go
      </div>

      <div style={{ padding: "0 20px 6px" }}>
        {!showDatePicker ? (
          <button
            onClick={() => setShowDatePicker(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: isBackdated ? hexToRgba(COLORS.accent, 0.12) : COLORS.surface, border: `1px solid ${isBackdated ? COLORS.accent : COLORS.line}`, borderRadius: 10, padding: "7px 12px", color: isBackdated ? COLORS.accent : COLORS.textDim, fontSize: 12.5 }}
          >
            <Clock size={13} />
            {isBackdated ? `Logging for ${friendlyDateTime(workoutDate)}` : "Logging for now"}
            <Pencil size={12} />
          </button>
        ) : (
          <BackdatePicker
            value={workoutDate}
            onChange={setWorkoutDate}
            onDone={() => setShowDatePicker(false)}
          />
        )}
      </div>

      {timer && (
        <RestTimer timer={timer} onTogglePause={togglePauseRest} onAddTime={addRestTime} onSkip={skipRest} />
      )}

      {/* Floats over the list: picking a superset means tapping exercises
          that may be well down the page, and a panel that scrolls away takes
          Link and Cancel with it. */}
      {ssPicker && (
        <div
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: `calc(12px + env(safe-area-inset-bottom, 0px))`,
            zIndex: 50,
            background: COLORS.surface,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 14,
            padding: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ color: COLORS.text, fontSize: 13, marginBottom: 8 }}>
            Tap the exercises to superset together ({ssPicker.picked.length} selected).
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={confirmSuperset}
              disabled={ssPicker.picked.length < 2}
              style={{ flex: 1, background: ssPicker.picked.length < 2 ? COLORS.surfaceRaised : COLORS.accent, border: "none", borderRadius: 8, padding: "9px 0", color: ssPicker.picked.length < 2 ? COLORS.textDim : COLORS.onAccent, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Link {ssPicker.picked.length >= 2 ? `${ssPicker.picked.length} exercises` : ""}
            </button>
            <button
              onClick={cancelSuperset}
              style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "10px 20px" }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, padding: 20, textAlign: "center" }}>Building workout…</div>
        ) : (
          (() => {
            // Which exercise is the first of its muscle (for the warm-up block).
            const seen = new Set();
            const firstMap = {};
            exercises.forEach((ex) => { firstMap[ex.id] = !seen.has(ex.muscle); seen.add(ex.muscle); });

            // Group consecutive superset members so we can draw one outline box
            // around them.
            const blocks = [];
            let i = 0;
            while (i < exercises.length) {
              const info = supersetInfoFor(exercises[i].id);
              if (info) {
                const items = [];
                while (i < exercises.length) {
                  const info2 = supersetInfoFor(exercises[i].id);
                  if (!info2 || info2.id !== info.id) break;
                  items.push({ ex: exercises[i], index: i });
                  i++;
                }
                blocks.push({ type: "ss", info, items });
              } else {
                blocks.push({ type: "single", items: [{ ex: exercises[i], index: i }] });
                i++;
              }
            }

            const renderRow = ({ ex, index }) => {
              const picked = ssPicker && ssPicker.picked.includes(ex.id);
              return (
                <div key={ex.id} style={{ marginBottom: 12 }}>
                  {ssPicker && (
                    <button
                      onClick={() => toggleSupersetPick(ex.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: picked ? COLORS.accent : COLORS.surfaceRaised, border: `1px solid ${picked ? COLORS.accent : COLORS.line}`, borderRadius: 8, padding: "7px 0", marginBottom: 6, color: picked ? COLORS.onAccent : COLORS.textDim, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {picked ? <Check size={13} /> : <Plus size={13} />} {picked ? "Selected" : "Tap to add"}
                    </button>
                  )}
                  <div style={{ display: "flex", alignItems: "stretch", gap: 6, opacity: ssPicker && !picked ? 0.55 : 1 }}>
                    <div
                      style={{
                        width: 26,
                        flexShrink: 0,
                        borderRadius: 8,
                        background: COLORS.surfaceRaised,
                        border: `1px solid ${COLORS.line}`,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => moveExercise(index, -1)}
                        disabled={index === 0}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderBottom: `1px solid ${COLORS.line}`, color: index === 0 ? COLORS.line : COLORS.textDim, padding: 0 }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveExercise(index, 1)}
                        disabled={index === exercises.length - 1}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: index === exercises.length - 1 ? COLORS.line : COLORS.textDim, padding: 0 }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <ExerciseCard
                        ex={ex}
                        sets={sets[ex.id] || []}
                        history={history}
                        meta={meta[ex.id] || {}}
                        onMetaChange={onMetaChange}
                        onSetChange={onSetChange}
                        onClearWeights={onClearWeights}
                        onFillFromLast={onFillFromLast}
                        onToggleSetDone={onToggleSetDone}
                        onAddSet={onAddSet}
                        onRemoveSet={onRemoveSet}
                        onAddDropset={onAddDropset}
                        onDropChange={onDropChange}
                        onRemoveDrop={onRemoveDrop}
                        onStartRest={startRest}
                        onRemoveExercise={() => removeExercise(ex.id)}
                        onStartSuperset={() => startSuperset(ex.id)}
                        settings={settings}
                        isFirstForMuscle={firstMap[ex.id]}
                        supersetInfo={null}
                      />
                    </div>
                  </div>
                </div>
              );
            };

            return blocks.map((b) => {
              if (b.type === "ss") {
                return (
                  <div key={b.info.id} style={{ border: `1.5px solid ${b.info.color}`, borderRadius: 16, padding: "10px 10px 0", marginBottom: 12, background: hexToRgba(b.info.color, 0.05) }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 5, background: b.info.color }} />
                        <span style={{ color: b.info.color, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
                          Superset {b.info.label}
                        </span>
                      </div>
                      <button
                        onClick={() => removeSuperset(b.info.id)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        <X size={12} /> Unlink
                      </button>
                    </div>
                    {b.items.map(renderRow)}
                  </div>
                );
              }
              return b.items.map(renderRow);
            });
          })()
        )}

        {!loading && (
          <div style={{ marginTop: 4, marginBottom: 12 }}>
            {addPanel === null && (
              <button
                onClick={() => setAddPanel(isAdvanced ? "choose" : "db")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 12, padding: "12px 0", color: COLORS.textDim, fontSize: 13, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
              >
                <Plus size={14} /> Add Exercise
              </button>
            )}

            {addPanel === "choose" && isAdvanced && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setAddPanel("db")}
                  style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "12px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                >
                  From Database
                </button>
                <button
                  onClick={() => setAddPanel("new")}
                  style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "12px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                >
                  New Exercise
                </button>
                <button
                  onClick={() => setAddPanel(null)}
                  style={{ width: 44, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {addPanel === "db" && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase" }}>Add From Database</div>
                  <button onClick={() => setAddPanel(null)} style={{ color: COLORS.textDim, background: "transparent", border: "none" }}>
                    <X size={16} />
                  </button>
                </div>
                <ExerciseSearchPicker
                  excludeIds={addedIds}
                  onAdd={(ex, m) => addExerciseMidWorkout({ ...ex, muscle: m })}
                />
              </div>
            )}

            {addPanel === "new" && (
              <NewExerciseForm
                muscles={Object.keys(EXERCISES)}
                defaultMuscle={split && SPLITS[split] ? SPLITS[split][0] : Object.keys(EXERCISES)[0]}
                onSave={handleSaveCustomExerciseMidWorkout}
                onCancel={() => setAddPanel(null)}
              />
            )}
          </div>
        )}

        {/* Sits at the end of the list rather than floating over it: a bar
            pinned to the bottom of the screen is under your thumb for the
            whole session, which is how workouts get ended by accident. */}
        {!loading && (
          <div style={{ padding: "18px 0 8px" }}>
            <button
              onClick={tapFinish}
              disabled={saving}
              style={{
                width: "100%",
                background: armedFinish ? "transparent" : COLORS.accent,
                color: armedFinish ? COLORS.accent : COLORS.onAccent,
                border: armedFinish ? `1.5px solid ${COLORS.accent}` : "none",
                borderRadius: 14,
                padding: "18px 0",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 17,
                letterSpacing: 1,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Check size={20} />
              {saving ? "Saving…" : armedFinish ? "Tap again to finish" : "Finish Workout"}
            </button>
            {armedFinish && !saving && (
              <div style={{ color: COLORS.textDim, fontSize: 12, textAlign: "center", marginTop: 8 }}>
                Nothing is saved until the second tap.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DoneScreen({ onHome, newPBs, programmeInfo }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Check size={32} color={COLORS.onAccent} />
      </div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, textTransform: "uppercase", color: COLORS.text, marginBottom: 6 }}>
        Workout saved
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 13, marginBottom: (newPBs && newPBs.length) || programmeInfo ? 20 : 32, textAlign: "center" }}>
        Your weights and reps are logged for next time.
      </div>

      {programmeInfo && (
        <div style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            {programmeInfo.name}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ color: COLORS.text, fontSize: 13.5 }}>
              Week {programmeInfo.week} of {programmeInfo.weeks}
            </span>
            <span style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {programmeInfo.done}/{programmeInfo.planned} sessions
            </span>
          </div>
          <div style={{ height: 6, background: COLORS.surfaceRaised, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${programmeInfo.planned ? Math.min(100, Math.round((programmeInfo.done / programmeInfo.planned) * 100)) : 0}%`, height: "100%", background: COLORS.accent }} />
          </div>
          {programmeInfo.complete ? (
            <div style={{ color: COLORS.accent, fontSize: 12.5 }}>Programme complete — finish it to see your full stats. 🎉</div>
          ) : (
            <div style={{ color: COLORS.textDim, fontSize: 12.5 }}>Next up: <span style={{ color: COLORS.text }}>{programmeInfo.nextDayName}</span></div>
          )}
        </div>
      )}

      {newPBs && newPBs.length > 0 && (
        <div style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.accent}`, borderRadius: 14, padding: 16, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            <Trophy size={15} /> New Personal Record{newPBs.length > 1 ? "s" : ""}
          </div>
          {newPBs.map((pb) => (
            <div key={pb.exerciseId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13.5 }}>
              <span style={{ color: COLORS.text }}>{pb.name}</span>
              <span style={{ color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                {pb.weight || "–"} × {pb.reps || "–"}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onHome}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          color: COLORS.text,
          borderRadius: 12,
          padding: "14px 28px",
          fontFamily: "'Oswald', sans-serif",
          fontSize: 15,
          textTransform: "uppercase",
        }}
      >
        Back to Home
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   WORKOUT HISTORY
--------------------------------------------------------------- */

function HistoryScreen({ onBack, settings }) {
  const [rawSessions, setRawSessions] = useState([]); // chronological, as stored
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [addExOpen, setAddExOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = (await safeGet("workout-history")) || [];
      if (!cancelled) {
        setRawSessions(hist);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessions = [...rawSessions].reverse();

  function startEdit(s) {
    setEditingId(s.id);
    setAddExOpen(false);
    setEditDraft(s.exercises.map((ex) => ({ ...ex, sets: ex.sets.map((st) => ({ ...st })) })));
  }
  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setAddExOpen(false);
  }
  // Machine brand / grip, added after the fact. Recording it later is the
  // normal case: you notice it matters only once two gyms' numbers stop
  // lining up.
  function updateDraftMeta(exIdx, field, value) {
    setEditDraft((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, [field]: value } : ex)));
  }
  function updateDraftSet(exIdx, setIdx, field, value) {
    setEditDraft((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, sets: ex.sets.map((st, j) => (j === setIdx ? { ...st, [field]: value } : st)) } : ex)));
  }
  function addDraftSet(exIdx) {
    setEditDraft((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, { weight: "", reps: "" }] } : ex)));
  }
  function removeDraftSet(exIdx, setIdx) {
    setEditDraft((prev) => prev.map((ex, i) => (i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex)));
  }
  function removeDraftExercise(exIdx) {
    setEditDraft((prev) => prev.filter((_, i) => i !== exIdx));
  }
  function addDraftExercise(ex, muscle) {
    setEditDraft((prev) => {
      if (prev.some((e) => e.id === ex.id)) return prev; // already in this session
      return [...prev, { id: ex.id, name: ex.name, muscle: muscle || ex.muscle, type: ex.type, sets: [{ weight: "", reps: "" }] }];
    });
    setAddExOpen(false);
  }

  async function saveEdit(session) {
    // Clean: drop empty sets (keep a set that only has drops), then drop
    // exercises with nothing logged. This also removes an added-but-unfilled
    // exercise automatically.
    const cleaned = editDraft
      .map((ex) => ({
        ...ex,
        sets: (ex.sets || []).filter(setHasData),
      }))
      .filter((ex) => ex.sets.length > 0);

    const total = cleaned.length;
    const updatedRaw = rawSessions
      .map((s) => (s.id === session.id ? { ...s, exercises: cleaned } : s))
      .filter((s) => s.exercises.length > 0);
    await safeSet("workout-history", updatedRaw);

    // Reconcile per-exercise history for every exercise that was in the session
    // before or after the edit (added, removed, or changed).
    const matchesSession = (h) => (session.at && h.at ? h.at === session.at : h.date === session.date);
    const ids = new Set([...session.exercises.map((e) => e.id), ...cleaned.map((e) => e.id)]);
    for (const id of ids) {
      const prevHist = (await safeGet(`ex-history:${id}`)) || [];
      const idx = cleaned.findIndex((e) => e.id === id);
      if (idx === -1) {
        await safeSet(`ex-history:${id}`, prevHist.filter((h) => !matchesSession(h)));
        continue;
      }
      const ex = cleaned[idx];
      // Written unconditionally so clearing a brand actually removes it,
      // rather than leaving the previous value behind in the merge below.
      const patch = {
        date: session.date,
        at: session.at || session.date,
        sets: ex.sets,
        order: idx + 1,
        total,
        brand: ex.brand || null,
        grip: ex.grip || null,
        method: ex.method || null,
        notes: ex.notes || null,
      };
      const existingIdx = prevHist.findIndex(matchesSession);
      const nextHist = existingIdx === -1
        ? sortByAt([...prevHist, patch]).slice(-20)
        : prevHist.map((h, i) => (i === existingIdx ? { ...h, ...patch } : h));
      await safeSet(`ex-history:${id}`, nextHist);
    }

    setRawSessions(updatedRaw);
    setEditingId(null);
    setEditDraft(null);
    setAddExOpen(false);
  }

  async function deleteSession(session) {
    if (!window.confirm(`Delete this ${session.split} workout from ${session.date}? This can't be undone.`)) return;
    const updatedRaw = rawSessions.filter((s) => s.id !== session.id);
    await safeSet("workout-history", updatedRaw);
    for (const ex of session.exercises) {
      const prevHist = (await safeGet(`ex-history:${ex.id}`)) || [];
      const newHist = prevHist.filter((h) => h.date !== session.date);
      await safeSet(`ex-history:${ex.id}`, newHist);
    }
    setRawSessions(updatedRaw);
    setExpanded(null);
  }

  return (
    <div>
      <TopBar title="Workout History" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        Every logged session, most recent first.
      </div>
      <div style={{ padding: "10px 20px 40px" }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
        ) : sessions.length === 0 ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30, fontSize: 13.5 }}>
            No workouts logged yet. Finish one and it'll show up here.
          </div>
        ) : (
          sessions.map((s) => {
            const muscles = [...new Set(s.exercises.map((e) => e.muscle))];
            const isOpen = expanded === s.id;
            const isEditing = editingId === s.id;
            return (
              <div
                key={s.id}
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <SessionSummary session={s} muscles={muscles} />
                  <ChevronRight size={18} color={COLORS.textDim} style={{ transform: isOpen ? "rotate(90deg)" : "none" }} />
                </button>

                {isOpen && !isEditing && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.line}` }}>
                    {s.exercises.map((ex) => (
                      <div key={ex.id} style={{ marginBottom: 10 }}>
                        <div style={{ color: COLORS.text, fontSize: 13.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", marginBottom: 3 }}>
                          {ex.name}
                        </div>
                        <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                          {ex.sets.map((set, i) => `${set.weight || "–"}×${set.reps || "–"}`).join("  ·  ")}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => startEdit(s)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => deleteSession(s)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.bad, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )}

                {isOpen && isEditing && editDraft && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.line}` }}>
                    {editDraft.map((ex, exIdx) => (
                      <div key={ex.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ color: COLORS.text, fontSize: 13.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                            {ex.name}
                          </span>
                          <button
                            onClick={() => removeDraftExercise(exIdx)}
                            style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                          >
                            <X size={12} /> Remove
                          </button>
                        </div>
                        {(() => {
                          const full = ALL_EXERCISES_BY_ID[ex.id] || ex;
                          if (settings.appMode !== "advanced") return null;
                          const chosen = ex.method || defaultMethodFor(ex.id);
                          const showMethod = hasMethodChoice(ex.id);
                          if (!showMethod && !isMachineExercise(full, chosen)) return null;
                          const isCable = isCableExercise(full, chosen);
                          const showBrand = isMachineExercise(full, chosen);
                          const fieldStyle = { flex: 1, minWidth: 0, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "7px 9px", color: COLORS.text, fontFamily: "system-ui, sans-serif", fontSize: 12.5 };
                          const selectStyle = { ...fieldStyle, appearance: "none", WebkitAppearance: "none" };
                          return (
                            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                              {showMethod && (
                                <select
                                  value={chosen || ""}
                                  onChange={(e) => updateDraftMeta(exIdx, "method", e.target.value)}
                                  style={selectStyle}
                                >
                                  {methodsFor(ex.id).map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              )}
                              {showBrand && (
                              <input
                                type="text"
                                placeholder="Machine brand"
                                value={ex.brand || ""}
                                onChange={(e) => updateDraftMeta(exIdx, "brand", e.target.value)}
                                style={fieldStyle}
                              />
                              )}
                              {showBrand && isCable && (
                                <select
                                  value={ex.grip || ""}
                                  onChange={(e) => updateDraftMeta(exIdx, "grip", e.target.value)}
                                  style={selectStyle}
                                >
                                  <option value="">Grip…</option>
                                  {getCableGrips(full).map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          );
                        })()}
                        {ex.sets.map((set, setIdx) => (
                          <div key={setIdx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                            <div style={{ width: 16, color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{setIdx + 1}</div>
                            <input
                              type="number"
                              inputMode="decimal"
                              placeholder="wt"
                              value={set.weight}
                              onChange={(e) => updateDraftSet(exIdx, setIdx, "weight", e.target.value)}
                              style={{ flex: 1, minWidth: 0, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                            />
                            <input
                              type="number"
                              inputMode="numeric"
                              placeholder="reps"
                              value={set.reps}
                              onChange={(e) => updateDraftSet(exIdx, setIdx, "reps", e.target.value)}
                              style={{ flex: 1, minWidth: 0, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                            />
                            <button
                              onClick={() => removeDraftSet(exIdx, setIdx)}
                              style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addDraftSet(exIdx)}
                          style={{ width: "100%", background: "transparent", border: `1px dashed ${COLORS.line}`, borderRadius: 8, padding: "7px 0", color: COLORS.textDim, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                        >
                          <Plus size={12} /> Add set
                        </button>
                      </div>
                    ))}

                    {/* Add an exercise you forgot to log for this past session */}
                    {!addExOpen ? (
                      <button
                        onClick={() => setAddExOpen(true)}
                        style={{ width: "100%", background: "transparent", border: `1px dashed ${COLORS.accent}`, borderRadius: 10, padding: "10px 0", color: COLORS.accent, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 }}
                      >
                        <Plus size={13} /> Add forgotten exercise
                      </button>
                    ) : (
                      <div style={{ background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>Add exercise</span>
                          <button onClick={() => { setAddExOpen(false); }} style={{ background: "transparent", border: "none", color: COLORS.textDim }}>
                            <X size={15} />
                          </button>
                        </div>
                        <ExerciseSearchPicker
                          surface={COLORS.surface}
                          maxHeight={320}
                          excludeIds={new Set(editDraft.map((e) => e.id))}
                          onAdd={(ex, m) => addDraftExercise(ex, m)}
                        />
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => saveEdit(s)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.accent, border: "none", borderRadius: 8, padding: "10px 0", color: COLORS.onAccent, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        <Check size={13} /> Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{ flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 0", color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PERSONAL INFO SCREEN
--------------------------------------------------------------- */

function PersonalInfoScreen({ onBack }) {
  return (
    <div>
      <TopBar title="Personal Info" onBack={onBack} />
      <div style={{ padding: "0 20px 16px", color: COLORS.textDim, fontSize: 13 }}>
        Your weight, height, age and tape measurements. Weight is shared with the rest of the app for bodyweight-based calculations.
      </div>
      <div style={{ padding: "0 20px 40px" }}>
        <PersonalStatsPanel />
        <div data-tour="weight-tracking" style={{ marginTop: 12 }}>
          <WeightTrackingPanel />
        </div>
        <div style={{ marginTop: 12 }}>
          <MeasurementsPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PROGRESS CHARTS
--------------------------------------------------------------- */

// A plain-SVG line chart. This used to be recharts, which cost roughly
// half the JS bundle to draw one line with an axis pair — a poor trade in
// an app that ships as an APK and starts on cheap phones. Everything the
// two call sites actually used is here: dashed horizontal grid, both axes,
// a line with dots, and a tap/hover readout.
//
// Width is measured off the wrapper rather than assumed, because a chart
// laid out at 0x0 (sandboxed iframes, some WebViews) silently renders
// blank. Falls back to a sensible width until the first measurement lands.
// What the Progress line plots. Estimated 1RM is the default because it
// is the only one of the three that stays honest when the rep target
// moves; the other two are still worth having, so all three are offered.
const CHART_METRICS = [
  { key: "e1rm", label: "Est. 1RM", blurb: "Estimated one-rep max over time — accounts for reps, so a lighter set for more reps still reads as progress." },
  { key: "top", label: "Top Set", blurb: "Heaviest set of each session, ignoring how many reps it was for." },
  { key: "volume", label: "Volume", blurb: "Total weight moved each session — sets x reps x weight, drop sets included." },
];

/* One logged session reduced to the number a chart plots.

   `entry` carries the exercise id, the loading and the lifter's bodyweight
   at the time, because for a calisthenic movement the figure in the weight
   column is not the load. Thirty kilos of assistance is bodyweight minus
   thirty, and it goes DOWN as you get stronger — plotting it raw draws a
   beginner's progress running backwards. */
function metricValue(metric, sets, entry) {
  const list = sets || [];
  const ctx = entry || {};
  const loadOf = (w) =>
    ctx.exerciseId && isCalisthenic(ctx.exerciseId)
      ? effectiveLoad(ctx.exerciseId, ctx.method, w, ctx.bodyweight)
      : parseFloat(w);
  if (metric === "volume") {
    let total = 0;
    for (const set of list) {
      total += (loadOf(set.weight) || 0) * (parseFloat(set.reps) || 0);
      // A drop set's own load follows the same rule as the set it hangs off.
      for (const d of set.drops || []) total += (loadOf(d.weight) || 0) * (parseFloat(d.reps) || 0);
    }
    return Math.round(total);
  }
  const top = getTopSet(list) || {};
  const load = loadOf(top.weight);
  if (metric === "e1rm") return estimateOneRM(load, top.reps) || 0;
  return load || 0;
}

const CHART_PAD = { top: 8, right: 12, bottom: 20, left: 38 };

function SimpleLineChart({ data, dataKey = "weight", height = 200, color }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState(null);
  useEffect(() => {
    const measure = () => {
      if (ref.current && ref.current.clientWidth) setWidth(ref.current.clientWidth);
    };
    measure();
    let ro;
    const canWinListen = typeof window !== "undefined" && typeof window.addEventListener === "function";
    if (typeof ResizeObserver !== "undefined" && ref.current) {
      ro = new ResizeObserver(measure);
      ro.observe(ref.current);
    } else if (canWinListen) {
      window.addEventListener("resize", measure);
    }
    return () => {
      if (ro) ro.disconnect();
      else if (canWinListen) window.removeEventListener("resize", measure);
    };
  }, []);

  const stroke = color || COLORS.accent;
  const w = width || 320;
  const points = (data || []).filter((d) => Number.isFinite(parseFloat(d[dataKey])));
  if (points.length === 0) return <div ref={ref} style={{ width: "100%", height }} />;

  const values = points.map((d) => parseFloat(d[dataKey]));
  // Matches the old domain of [dataMin - 2, dataMax + 2], but a flat series
  // would collapse to a zero-height band, so it keeps a minimum spread.
  const min = Math.min(...values) - 2;
  const rawMax = Math.max(...values) + 2;
  const max = rawMax > min ? rawMax : min + 4;
  const plotW = Math.max(1, w - CHART_PAD.left - CHART_PAD.right);
  const plotH = Math.max(1, height - CHART_PAD.top - CHART_PAD.bottom);
  const x = (i) => CHART_PAD.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v) => CHART_PAD.top + plotH - ((v - min) / (max - min)) * plotH;

  const ticks = [0, 1, 2, 3].map((i) => min + ((max - min) * i) / 3);
  // Thin the date labels so they never collide on a narrow phone.
  const labelStride = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 46))));
  const path = points.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(values[i]).toFixed(1)}`).join(" ");

  function pick(e) {
    const box = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0] ? e.touches[0].clientX : 0;
    const px = clientX - box.left;
    let best = 0;
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    setActive(best);
  }

  return (
    <div ref={ref} style={{ width: "100%", height, position: "relative" }}>
      <svg
        width={w}
        height={height}
        onMouseMove={pick}
        onMouseLeave={() => setActive(null)}
        onTouchStart={pick}
        onTouchMove={pick}
        onTouchEnd={() => setActive(null)}
        style={{ touchAction: "pan-y" }}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={CHART_PAD.left} x2={w - CHART_PAD.right} y1={y(t)} y2={y(t)} stroke={COLORS.line} strokeDasharray="3 3" />
            <text x={CHART_PAD.left - 6} y={y(t) + 3.5} textAnchor="end" fill={COLORS.textDim} fontSize={10}>
              {Math.round(t * 10) / 10}
            </text>
          </g>
        ))}
        <line x1={CHART_PAD.left} x2={w - CHART_PAD.right} y1={height - CHART_PAD.bottom} y2={height - CHART_PAD.bottom} stroke={COLORS.line} />
        {points.map((d, i) =>
          // The last label is always drawn, so drop any strided label that
          // would sit on top of it.
          (i % labelStride === 0 && x(points.length - 1) - x(i) > 48) || i === points.length - 1 ? (
            <text
              key={i}
              x={x(i)}
              y={height - CHART_PAD.bottom + 13}
              // The end labels sit against the plot edges, so anchoring them
              // centrally would hang half of each one off the chart.
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              fill={COLORS.textDim}
              fontSize={10}
            >
              {d.date}
            </text>
          ) : null
        )}
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(values[i])} r={active === i ? 5 : 3} fill={stroke} />
        ))}
        {active !== null && (
          <line x1={x(active)} x2={x(active)} y1={CHART_PAD.top} y2={height - CHART_PAD.bottom} stroke={COLORS.textDim} strokeDasharray="2 3" />
        )}
      </svg>
      {active !== null && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(x(active) - 42, 0), Math.max(0, w - 88)),
            top: 2,
            pointerEvents: "none",
            background: COLORS.surfaceRaised,
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 12,
          }}
        >
          <div style={{ color: COLORS.textDim, fontSize: 10.5 }}>{points[active].date}</div>
          <div style={{ color: COLORS.text, fontFamily: "'JetBrains Mono', monospace" }}>{values[active]}</div>
        </div>
      )}
    </div>
  );
}

function ProgressScreen({ onBack }) {
  const [exerciseIds, setExerciseIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [exHistory, setExHistory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandFilter, setBrandFilter] = useState(""); // "" = every machine
  const [metric, setMetric] = useState("e1rm");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [openGroups, setOpenGroups] = useState(null); // null until the user opens or closes one
  // Needed to plot calisthenics at all: an assisted pull-up's load is
  // bodyweight minus the assistance, so without a weigh-in there is no
  // number to draw.
  const [bwHistory, setBwHistory] = useState([]);
  const [bwCurrent, setBwCurrent] = useState(null);
  const [unit, setUnit] = useState("kg");
  const bodyweightOnDate = (d) => bodyweightOnOrBefore(d, bwHistory, bwCurrent, unit);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hist, cur, cfg] = await Promise.all([
        safeGet("bodyweight-history"),
        safeGet("bodyweight"),
        safeGet("settings"),
      ]);
      if (cancelled) return;
      setBwHistory(Array.isArray(hist) ? hist : []);
      setBwCurrent(cur || null);
      if (cfg && cfg.weightUnit) setUnit(cfg.weightUnit);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let ids = [];
      const keys = await safeList("ex-history:");
      if (keys && keys.length > 0) {
        ids = keys.map((k) => k.replace("ex-history:", ""));
      } else {
        const allIds = Object.keys(ALL_EXERCISES_BY_ID);
        const checks = await Promise.all(allIds.map(async (id) => [id, await safeGet(`ex-history:${id}`)]));
        ids = checks.filter(([, h]) => h && h.length > 0).map(([id]) => id);
      }
      if (cancelled) return;
      setExerciseIds(ids);
      if (ids.length > 0) setSelectedId(ids[0]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    async function load() {
      setChartLoading(true);
      const hist = (await safeGet(`ex-history:${selectedId}`)) || [];
      if (cancelled) return;
      setExHistory(hist);
      setBrands(variationsInHistory(hist, selectedId));
      setBrandFilter(""); // a different exercise was done different ways
      setChartLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Weights from two different machines on one line make a sawtooth that says
  // nothing about progress, so the chart can be narrowed to a single stack.
  const chartData = exHistory
    .filter((h) => h && h.date)
    .filter((h) => {
      if (!brandFilter) return true;
      const v = brandFilter === UNTAGGED_BRAND ? { label: UNTAGGED_BRAND } : brands.find((x) => x.label === brandFilter);
      return matchesVariation(h, selectedId, v);
    })
    .map((h) => ({
      date: String(h.date).slice(5),
      weight: metricValue(metric, h.sets, {
        exerciseId: selectedId,
        method: h.method,
        // The bodyweight recorded nearest that session, not today's — a
        // year of charted pull-ups should not shift every time the scale
        // moves.
        bodyweight: bodyweightOnDate(h.date),
      }),
    }))
    .filter((p) => p.weight > 0);

  // Everything you have logged, filed under the body part it trains and in
  // the same order as the database, so a group reads the way it does
  // everywhere else in the app.
  const muscleOf = (id) => {
    const ex = ALL_EXERCISES_BY_ID[id];
    return (ex && ex.muscle) || muscleOfExerciseId(id) || "Other";
  };
  const exerciseGroups = (() => {
    const byMuscle = {};
    for (const id of exerciseIds) {
      if (!ALL_EXERCISES_BY_ID[id]) continue;
      const muscle = muscleOf(id);
      (byMuscle[muscle] = byMuscle[muscle] || []).push(ALL_EXERCISES_BY_ID[id]);
    }
    const groupOrder = Object.keys(EXERCISES);
    const rank = (m) => {
      const i = groupOrder.indexOf(m);
      return i < 0 ? groupOrder.length : i;
    };
    return Object.keys(byMuscle)
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .map((muscle) => {
        const order = (EXERCISES[muscle] || []).map((e) => e.id);
        const items = [...byMuscle[muscle]].sort((a, b) => {
          const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
          return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib) || a.name.localeCompare(b.name);
        });
        return { muscle, items };
      });
  })();

  // Until you touch one, the only group open is the one holding the chart
  // on screen — arriving on a collapsed list with no idea where you are
  // would be worse than the flat list this replaced.
  const openMuscles = openGroups || new Set(selectedId ? [muscleOf(selectedId)] : []);
  const toggleGroup = (muscle) => {
    const next = new Set(openMuscles);
    if (next.has(muscle)) next.delete(muscle);
    else next.add(muscle);
    setOpenGroups(next);
  };

  // Only worth offering when there is actually something to switch between.
  const hasUntagged = exHistory.some((h) => h && h.date && matchesVariation(h, selectedId, { label: UNTAGGED_BRAND }));
  const labels = brands.map((b) => b.label);
  const brandOptions = labels.length > 1 || (labels.length === 1 && hasUntagged)
    ? [...labels, ...(hasUntagged ? [UNTAGGED_BRAND] : [])]
    : [];

  return (
    <div>
      <TopBar title="Progress" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        {CHART_METRICS.find((m) => m.key === metric).blurb}
      </div>

      {loading ? (
        <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
      ) : exerciseIds.length === 0 ? (
        <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30, fontSize: 13.5 }}>
          No logged exercises yet. Finish a workout to start tracking progress.
        </div>
      ) : (
        <>
          <div style={{ padding: "10px 20px" }}>
            {selectedId && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                  <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase", minWidth: 0 }}>
                    {ALL_EXERCISES_BY_ID[selectedId] ? ALL_EXERCISES_BY_ID[selectedId].name : selectedId}
                  </div>
                  {brandOptions.length > 0 && (
                    <select
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      style={{ flexShrink: 0, maxWidth: "45%", background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "6px 8px", color: COLORS.text, fontFamily: "system-ui, sans-serif", fontSize: 12, appearance: "none", WebkitAppearance: "none" }}
                    >
                      <option value="">All</option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Top-set weight alone lies when the rep target changes:
                    100kg x 5 followed by 95kg x 10 is progress drawn as a
                    drop. Estimated 1RM folds the reps in, so it leads. */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {CHART_METRICS.map((m) => {
                    const active = metric === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setMetric(m.key)}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? hexToRgba(COLORS.accent, 0.14) : "transparent", color: active ? COLORS.accent : COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4 }}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
                {chartLoading ? (
                  <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
                ) : chartData.length < 2 ? (
                  <div style={{ color: COLORS.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>
                    {brandFilter
                      ? `Only ${chartData.length === 1 ? "one session" : "no sessions"} logged ${brandFilter === UNTAGGED_BRAND ? "without a machine or implement recorded" : `on ${brandFilter}`}.`
                      : "Log a couple more sessions to see a trend."}
                  </div>
                ) : (
                  <SimpleLineChart data={chartData} dataKey="weight" height={200} />
                )}
              </div>
            )}
          </div>

          {/* Two years of lifting is a long flat list to scroll, and you
              nearly always arrive knowing which body part you want to look
              at. Same accordions as the exercise picker, so the grouping is
              the one you already know. */}
          <div style={{ padding: "0 20px 40px" }}>
            {exerciseGroups.map(({ muscle, items }) => (
              <MuscleAccordion
                key={muscle}
                muscle={muscle}
                count={items.length}
                isOpen={openMuscles.has(muscle)}
                onToggle={() => toggleGroup(muscle)}
              >
                {items.map((ex) => {
                  const isSelected = selectedId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedId(ex.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: isSelected ? COLORS.surfaceRaised : "transparent",
                        border: `1px solid ${isSelected ? COLORS.accent : COLORS.line}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: isSelected ? COLORS.text : COLORS.textDim,
                        fontSize: 13.5,
                        fontFamily: "'Oswald', sans-serif",
                        textTransform: "uppercase",
                        textAlign: "left",
                      }}
                    >
                      <TrendingUp size={13} /> {ex.name}
                    </button>
                  );
                })}
              </MuscleAccordion>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   WEEKLY VOLUME SCREEN
--------------------------------------------------------------- */

function VolumeScreen({ onBack }) {
  const [volume, setVolume] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    computeWeeklyVolume().then((v) => {
      if (cancelled) return;
      setVolume(v);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxCount = Math.max(1, ...Object.values(volume));

  return (
    <div>
      <TopBar title="Weekly Volume" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        Sets logged per muscle, trailing 7 days. Work where a muscle is a secondary counts as half a set.
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 11, padding: "4px 20px 16px", lineHeight: 1.45 }}>
        No target is marked, because there isn't one. Taken close enough to failure, four to six hard sets a week is
        plenty for a muscle; what you need depends on your goals, your experience and whether you're natural.
      </div>
      <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
        ) : (
          MUSCLE_GROUPS.map((m) => {
            const count = volume[m] || 0;
            const pct = Math.min(100, (count / maxCount) * 100);
            return (
              <div key={m}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase" }}>{m}</div>
                  <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{formatSets(count)} sets</div>
                </div>
                {/* One neutral colour for every bar: the length is the
                    comparison, and a hue would be a verdict. */}
                <div style={{ height: 8, borderRadius: 4, background: COLORS.surfaceRaised, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: count > 0 ? COLORS.textDim : "transparent", transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   STREAK / CONSISTENCY SCREEN
--------------------------------------------------------------- */

// One square per day of a calendar year, laid out as twelve month blocks.
// Each block is a Monday-first week grid, so a column is always the same
// weekday and the shape reads like a calendar rather than one long ribbon.
// Dates are assembled from the parts rather than via toISOString, which
// would shift the day either side of midnight depending on the timezone.
function YearHeatmap({ year, trainedDates, today }) {
  const pad = (n) => String(n).padStart(2, "0");
  // The tour highlights whichever month has the most training in it, so the
  // ring lands on filled squares instead of an empty January.
  const monthTotals = MONTH_NAMES.map((_, m) => {
    const days = new Date(year, m + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => `${year}-${pad(m + 1)}-${pad(i + 1)}`).filter((d) => trainedDates.has(d)).length;
  });
  const busiestMonth = monthTotals.indexOf(Math.max(...monthTotals));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(98px, 1fr))", gap: 14 }}>
      {MONTH_NAMES.map((label, m) => {
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        // getDay() is Sunday-first; shift so Monday starts the week.
        const lead = (new Date(year, m, 1).getDay() + 6) % 7;
        const trainedThisMonth = Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad(m + 1)}-${pad(i + 1)}`).filter((ds) => trainedDates.has(ds)).length;
        return (
          <div key={label} data-tour={m === busiestMonth ? "streak-heatmap" : undefined}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              {trainedThisMonth > 0 && (
                <span style={{ color: COLORS.accent, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>{trainedThisMonth}</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {Array.from({ length: lead }).map((_, i) => (
                <div key={`lead-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const ds = `${year}-${pad(m + 1)}-${pad(i + 1)}`;
                const trained = trainedDates.has(ds);
                const isToday = ds === today;
                return (
                  <div
                    key={ds}
                    title={`${ds}${trained ? " · trained" : ""}`}
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: 2.5,
                      background: trained ? COLORS.accent : COLORS.surfaceRaised,
                      border: isToday ? `1.5px solid ${COLORS.text}` : undefined,
                      boxSizing: "border-box",
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// Weight is stored under the shared "bodyweight" key (the same one PB%
// bodyweight math uses), so entering it here or in the weight-tracking panel
// stays in sync. Height and age are new, stored together under "personal-stats".
function PersonalStatsPanel() {
  const [weightInput, setWeightInput] = useState("");
  const [weightUnit, setWeightUnit] = useState("lb");
  const [weightLogged, setWeightLogged] = useState(null);
  const [heightInput, setHeightInput] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [ageInput, setAgeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const bw = await safeGet("bodyweight");
      const stats = await safeGet("personal-stats");
      if (cancelled) return;
      if (bw) {
        setWeightInput(String(bw.value));
        setWeightUnit(bw.unit || "lb");
        setWeightLogged(bw);
      }
      if (stats) {
        if (stats.height) setHeightInput(String(stats.height));
        if (stats.heightUnit) setHeightUnit(stats.heightUnit);
        if (stats.age) setAgeInput(String(stats.age));
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setSaving(true);
    if (weightInput) {
      const record = { value: parseFloat(weightInput), unit: weightUnit, date: todayStr() };
      await upsertBodyweight(record);
      setWeightLogged(record);
    }
    await safeSet("personal-stats", {
      height: heightInput ? parseFloat(heightInput) : null,
      heightUnit,
      age: ageInput ? parseInt(ageInput, 10) : null,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  const fieldLabel = { color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 };
  const inputStyle = { flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5 };
  const unitBtn = (active) => ({ width: 42, borderRadius: 8, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surfaceRaised, color: active ? COLORS.onAccent : COLORS.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 });

  if (loading) {
    return (
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ color: COLORS.textDim, textAlign: "center", padding: 10 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={fieldLabel}>Weight</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" inputMode="decimal" placeholder="e.g. 175" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} style={inputStyle} />
          {["lb", "kg"].map((u) => (
            <button key={u} onClick={() => setWeightUnit(u)} style={unitBtn(weightUnit === u)}>{u}</button>
          ))}
        </div>
        {weightLogged && <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 5 }}>logged {weightLogged.date}</div>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={fieldLabel}>Height</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" inputMode="decimal" placeholder={heightUnit === "cm" ? "e.g. 178" : "e.g. 70"} value={heightInput} onChange={(e) => setHeightInput(e.target.value)} style={inputStyle} />
          {["cm", "in"].map((u) => (
            <button key={u} onClick={() => setHeightUnit(u)} style={unitBtn(heightUnit === u)}>{u}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>Age</div>
        <input type="number" inputMode="numeric" placeholder="e.g. 28" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} style={{ ...inputStyle, maxWidth: 100 }} />
      </div>

      <button
        onClick={save}
        disabled={saving}
        style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 10, padding: "11px 0", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {savedFlash ? "Saved ✓" : saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

// Opt-in weight tracking: off by default. Once turned on, the user can set a
// goal weight, log their weight over time, and see a graph of the trend.
// History is stored under "bodyweight-history"; the on/off flag + goal live
// under "weight-tracking".
// Bodyweight alone hides recomposition: the number on the scale can sit
// still for months while the tape says the training is working. One row
// per day, same shape as bodyweight-history so the two read alike.
const BODY_MEASUREMENTS = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "arms", label: "Arm" },
  { key: "thighs", label: "Thigh" },
  { key: "calves", label: "Calf" },
];

function MeasurementsPanel() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState("cm");
  const [draft, setDraft] = useState({});
  const [flash, setFlash] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const hist = (await safeGet("measurements-history")) || [];
      const cfg = (await safeGet("measurements-config")) || {};
      if (cancelled) return;
      setHistory(hist);
      if (cfg.unit) setUnit(cfg.unit);
      // Prefill from the latest reading so a small change is a small edit.
      const latest = hist.length ? hist[hist.length - 1] : null;
      if (latest) {
        const next = {};
        BODY_MEASUREMENTS.forEach(({ key }) => {
          if (latest[key] != null) next[key] = String(latest[key]);
        });
        setDraft(next);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function save() {
    const record = { date: todayStr() };
    let any = false;
    BODY_MEASUREMENTS.forEach(({ key }) => {
      const v = parseFloat(draft[key]);
      if (Number.isFinite(v) && v > 0) { record[key] = v; any = true; }
    });
    if (!any) return;
    // One row per day, so correcting a mistyped number replaces it rather
    // than leaving two readings for the same morning.
    const next = [...history.filter((h) => h.date !== record.date), record].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-400);
    await safeSet("measurements-history", next);
    await safeSet("measurements-config", { unit });
    setHistory(next);
    setFlash("Measurements saved ✓");
    setTimeout(() => setFlash(""), 1600);
  }

  async function changeUnit(u) {
    setUnit(u);
    await safeSet("measurements-config", { unit: u });
  }

  if (loading) return null;

  const latest = history.length ? history[history.length - 1] : null;
  const first = history.length ? history[0] : null;
  const label = { color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" };

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8 }}>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Measurements
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["cm", "in"].map((u) => (
            <button
              key={u}
              onClick={() => changeUnit(u)}
              style={{ width: 38, padding: "5px 0", borderRadius: 7, border: `1px solid ${unit === u ? COLORS.accent : COLORS.line}`, background: unit === u ? COLORS.accent : COLORS.surfaceRaised, color: unit === u ? COLORS.onAccent : COLORS.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 12, lineHeight: 1.45 }}>
        The scale can sit still for months while these move. Fill in whichever you track and leave the rest blank.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {BODY_MEASUREMENTS.map(({ key, label: name }) => {
          const start = first && first[key] != null ? first[key] : null;
          const now = latest && latest[key] != null ? latest[key] : null;
          const delta = start != null && now != null ? Math.round((now - start) * 10) / 10 : null;
          return (
            <div key={key}>
              <div style={{ ...label, marginBottom: 5, display: "flex", justifyContent: "space-between", gap: 4 }}>
                <span>{name}</span>
                {delta ? (
                  <span style={{ color: delta > 0 ? COLORS.ok : COLORS.textDim }}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                ) : null}
              </div>
              <input
                type="number"
                inputMode="decimal"
                placeholder={unit}
                value={draft[key] || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                style={{ width: "100%", boxSizing: "border-box", background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5 }}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={save}
        style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 10, padding: "11px 0", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        Save Today's Measurements
      </button>
      {flash && <div style={{ color: COLORS.ok, fontSize: 12, marginTop: 8, textAlign: "center" }}>{flash}</div>}
      {history.length > 1 && (
        <div style={{ color: COLORS.textDim, fontSize: 11, marginTop: 10, textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>
          {history.length} readings · since {first.date}
        </div>
      )}
    </div>
  );
}

function WeightTrackingPanel() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goal, setGoal] = useState(null);
  const [unit, setUnit] = useState("lb");
  const [history, setHistory] = useState([]);
  const [logInput, setLogInput] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cfg = (await safeGet("weight-tracking")) || {};
      const hist = (await safeGet("bodyweight-history")) || [];
      const bw = await safeGet("bodyweight");
      if (cancelled) return;
      setEnabled(!!cfg.enabled);
      if (cfg.goal) { setGoal(cfg.goal); setGoalInput(String(cfg.goal)); }
      if (cfg.unit) setUnit(cfg.unit);
      else if (bw && bw.unit) setUnit(bw.unit);
      setHistory(hist);
      if (bw && bw.value) setLogInput(String(bw.value));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function persistConfig(next) {
    await safeSet("weight-tracking", { enabled, goal, unit, ...next });
  }

  async function turnOn() {
    setEnabled(true);
    await persistConfig({ enabled: true });
  }

  async function saveGoal() {
    const g = parseFloat(goalInput);
    if (!g) return;
    setGoal(g);
    await persistConfig({ enabled: true, goal: g });
    setFlash("Goal saved ✓");
    setTimeout(() => setFlash(""), 1600);
  }

  async function logWeight() {
    const v = parseFloat(logInput);
    if (!v) return;
    const record = { value: v, unit, date: todayStr() };
    const next = await upsertBodyweight(record);
    setHistory(next);
    setFlash("Weight logged ✓");
    setTimeout(() => setFlash(""), 1600);
  }

  const fieldLabel = { color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 };
  const inputStyle = { flex: 1, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5 };
  const unitBtn = (active) => ({ width: 42, borderRadius: 8, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surfaceRaised, color: active ? COLORS.onAccent : COLORS.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 });

  if (loading) return null;

  if (!enabled) {
    return (
      <button
        onClick={turnOn}
        style={{ width: "100%", textAlign: "left", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12 }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent }}>
          <TrendingUp size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}>Turn on weight tracking</div>
          <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2 }}>Set a goal, log your weight over time, and see it on a graph.</div>
        </div>
        <ChevronRight size={18} color={COLORS.textDim} />
      </button>
    );
  }

  const chartData = history.map((h) => ({ date: h.date.slice(5), weight: h.value }));
  const latest = history.length ? history[history.length - 1] : null;
  const start = history.length ? history[0] : null;
  const delta = latest && start ? +(latest.value - start.value).toFixed(1) : null;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}>Weight Tracking</div>
        {flash && <span style={{ color: COLORS.accent, fontSize: 11.5 }}>{flash}</span>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={fieldLabel}>Goal Weight</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" inputMode="decimal" placeholder="e.g. 165" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} style={inputStyle} />
          {["lb", "kg"].map((u) => (
            <button key={u} onClick={() => setUnit(u)} style={unitBtn(unit === u)}>{u}</button>
          ))}
          <button onClick={saveGoal} style={{ padding: "0 14px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 12, textTransform: "uppercase" }}>Set</button>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>Log Today's Weight</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="number" inputMode="decimal" placeholder="e.g. 172" value={logInput} onChange={(e) => setLogInput(e.target.value)} style={inputStyle} />
          <button onClick={logWeight} style={{ padding: "0 16px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}>Log</button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, background: COLORS.surfaceRaised, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 18 }}>{latest.value}{unit}</div>
            <div style={{ color: COLORS.textDim, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Current</div>
          </div>
          {delta !== null && (
            <div style={{ flex: 1, background: COLORS.surfaceRaised, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 18 }}>{delta > 0 ? "+" : ""}{delta}{unit}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>Change</div>
            </div>
          )}
          {goal && (
            <div style={{ flex: 1, background: COLORS.surfaceRaised, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 18 }}>{+(goal - latest.value).toFixed(1)}{unit}</div>
              <div style={{ color: COLORS.textDim, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>To Goal</div>
            </div>
          )}
        </div>
      )}

      {chartData.length < 2 ? (
        <div style={{ color: COLORS.textDim, fontSize: 12.5, textAlign: "center", padding: "14px 0" }}>
          Log your weight on at least two days to see a trend graph.
        </div>
      ) : (
        <SimpleLineChart data={chartData} dataKey="weight" height={190} />
      )}
    </div>
  );
}

function StreakScreen({ onBack }) {
  const [trainedDates, setTrainedDates] = useState(new Set());
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const dates = await loadTrainedDates();
      if (cancelled) return;
      setTrainedDates(dates);
      setTotalWorkouts(dates.size);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = todayStr();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);

  const streak = computeCurrentStreak(trainedDates);
  const thisWeekCount = buildHeatmapDays(trainedDates, 1).filter((d) => d.trained).length;

  // Only offer years the user could actually have trained in: back to their
  // first logged session, forward no further than the current year.
  const firstYear = trainedDates.size
    ? Math.min(thisYear, ...[...trainedDates].map((d) => parseInt(d.slice(0, 4), 10)).filter(Number.isFinite))
    : thisYear;
  const yearCount = [...trainedDates].filter((d) => d.startsWith(`${year}-`)).length;
  const arrow = (enabled) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    color: enabled ? COLORS.text : COLORS.line,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  return (
    <div>
      <TopBar title="Consistency" onBack={onBack} />
      <div style={{ padding: "0 20px 16px", color: COLORS.textDim, fontSize: 13 }}>
        Every day you logged a workout, a square per day.
      </div>
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 10 }}>
        {[
          { label: "Current Streak", value: streak },
          { label: "This Week", value: thisWeekCount },
          { label: "Total Workouts", value: totalWorkouts },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 22 }}>{loading ? "–" : s.value}</div>
            <div style={{ color: COLORS.textDim, fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button
          onClick={() => setYear((y) => Math.max(firstYear, y - 1))}
          disabled={year <= firstYear}
          title="Previous year"
          style={arrow(year > firstYear)}
        >
          <ChevronLeft size={16} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: 1 }}>{year}</div>
          <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
            {loading ? "…" : `${yearCount} workout${yearCount === 1 ? "" : "s"}`}
          </div>
        </div>
        <button
          onClick={() => setYear((y) => Math.min(thisYear, y + 1))}
          disabled={year >= thisYear}
          title="Next year"
          style={arrow(year < thisYear)}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
        ) : (
          <YearHeatmap year={year} trainedDates={trainedDates} today={today} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ONE-REP MAX GOALS SCREEN
--------------------------------------------------------------- */

function OneRMGoalForm({ current, isBodyweight, unit, onSave, onCancel }) {
  const [currentInput, setCurrentInput] = useState(current ? String(current) : "");
  const [target, setTarget] = useState("");
  const [level, setLevel] = useState("intermediate");

  const c = parseFloat(currentInput);
  const t = parseFloat(target);
  const weeksPreview = c && t && t > c ? calculateWeeksNeeded(c, t, level, isBodyweight) : null;

  return (
    <div style={{ background: COLORS.surfaceRaised, borderRadius: 10, padding: 12, marginTop: 10 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            {isBodyweight ? "Current max reps" : `Current 1RM (${unit})`}
          </div>
          <input
            type="number"
            inputMode="decimal"
            placeholder={isBodyweight ? "e.g. 10" : "e.g. 80"}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 12px", color: COLORS.text, fontSize: 13.5 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            {isBodyweight ? "Target max reps" : `Target 1RM (${unit})`}
          </div>
          <input
            type="number"
            inputMode="decimal"
            placeholder={isBodyweight ? "e.g. 15" : "e.g. 100"}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 12px", color: COLORS.text, fontSize: 13.5 }}
          />
        </div>
      </div>

      <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
        Training Experience
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {TRAINING_LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLevel(l.value)}
            title={l.desc}
            style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${level === l.value ? COLORS.accent : COLORS.line}`, background: level === l.value ? COLORS.accent : COLORS.surface, color: level === l.value ? COLORS.onAccent : COLORS.textDim, fontSize: 11 }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ color: COLORS.textDim, fontSize: 11.5, marginBottom: 12, fontStyle: "italic" }}>
        {weeksPreview ? `The app will calculate a plan of about ${weeksPreview} week${weeksPreview === 1 ? "" : "s"}, based on typical ${level} progression rates.` : t && c && t <= c ? "Target should be higher than your current number." : "Enter both numbers to see an estimated timeframe."}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => weeksPreview && onSave(c, t, level, weeksPreview)}
          disabled={!weeksPreview}
          style={{ flex: 1, background: weeksPreview ? COLORS.accent : COLORS.surface, color: weeksPreview ? COLORS.onAccent : COLORS.textDim, border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}
        >
          Save Goal
        </button>
        <button onClick={onCancel} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 0", color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function OneRMScreen({ settings, onBack, onGenerateWorkout }) {
  const [estimates, setEstimates] = useState({});
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(null); // exerciseId or null
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [logForm, setLogForm] = useState(null); // exerciseId or null
  const [logInput, setLogInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const savedGoals = (await safeGet("1rm-goals")) || {};
      const estEntries = await Promise.all(PB_EXERCISE_IDS.map(async (id) => [id, await getCurrentEstimate(id)]));
      if (cancelled) return;
      const estMap = {};
      estEntries.forEach(([id, v]) => (estMap[id] = v));
      setEstimates(estMap);
      setGoals(savedGoals);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveGoal(exerciseId, current, target, level, weeks) {
    const isBodyweight = BODYWEIGHT_LIFT_IDS.includes(exerciseId);
    const milestones = buildProgressionJourney(current, target, weeks, isBodyweight, settings.weightUnit);
    const goal = { exerciseId, current, target, level, weeks, isBodyweight, createdAt: new Date().toISOString(), milestones };
    const updated = { ...goals, [exerciseId]: goal };
    await safeSet("1rm-goals", updated);
    setGoals(updated);
    setOpenForm(null);
  }

  async function clearGoal(exerciseId) {
    const updated = { ...goals };
    delete updated[exerciseId];
    await safeSet("1rm-goals", updated);
    setGoals(updated);
    setExpandedGoal(null);
  }

  async function saveManual1RM(exerciseId) {
    const val = parseFloat(logInput);
    if (!val) return;
    const record = { value: val, date: todayStr() };
    await safeSet(`manual-1rm:${exerciseId}`, record);
    setEstimates((prev) => ({ ...prev, [exerciseId]: { value: val, isManual: true, date: record.date } }));
    setLogForm(null);
    setLogInput("");
  }

  async function clearManual1RM(exerciseId) {
    await safeDelete(`manual-1rm:${exerciseId}`);
    const fresh = await getCurrentEstimate(exerciseId);
    setEstimates((prev) => ({ ...prev, [exerciseId]: fresh }));
  }

  return (
    <div>
      <TopBar title="1RM Goals" onBack={onBack} />
      <div style={{ padding: "0 20px 16px", color: COLORS.textDim, fontSize: 13 }}>
        Set a target, get a weekly progression toward it, and generate a test day when you're ready to attempt it.
      </div>
      <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ color: COLORS.textDim, textAlign: "center", padding: 30 }}>Loading…</div>
        ) : (
          PB_EXERCISE_IDS.map((id, idx) => {
            const ex = ALL_EXERCISES_BY_ID[id];
            const isBodyweight = BODYWEIGHT_LIFT_IDS.includes(id);
            const est = estimates[id];
            const goal = goals[id];
            const unit = isBodyweight ? "reps" : settings.weightUnit;
            const isExpanded = expandedGoal === id;
            const milestone = goal ? currentMilestone(goal) : null;

            return (
              <div key={id} data-tour={idx === 0 ? "onerm-list" : undefined} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 16, textTransform: "uppercase" }}>{ex ? ex.name : id}</div>
                    <div style={{ color: COLORS.textDim, fontSize: 12, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                      {est && est.value
                        ? est.isManual
                          ? `current: ${est.value}${isBodyweight ? " reps" : unit} · logged ${est.date}`
                          : `current: ~${est.value}${isBodyweight ? " reps" : unit} (estimated)`
                        : "current: no data yet"}
                    </div>
                    {logForm === id ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}>
                        <input
                          type="number"
                          inputMode="decimal"
                          autoFocus
                          placeholder={isBodyweight ? "reps" : `1RM (${unit})`}
                          value={logInput}
                          onChange={(e) => setLogInput(e.target.value)}
                          style={{ width: 90, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "7px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                        />
                        <button onClick={() => saveManual1RM(id)} style={{ background: COLORS.accent, border: "none", borderRadius: 8, padding: "7px 12px", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 11, textTransform: "uppercase" }}>
                          Save
                        </button>
                        <button onClick={() => { setLogForm(null); setLogInput(""); }} style={{ background: "transparent", border: "none", color: COLORS.textDim, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                        <button
                          onClick={() => { setLogForm(id); setLogInput(est && est.value ? String(est.value) : ""); }}
                          style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.accent, background: "transparent", border: "none", fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                        >
                          <Plus size={11} /> Log {isBodyweight ? "Max Reps" : "1RM"}
                        </button>
                        {est && est.isManual && (
                          <button onClick={() => clearManual1RM(id)} style={{ color: COLORS.textDim, background: "transparent", border: "none", fontSize: 11.5 }}>
                            Reset to auto
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {goal && (
                    <button onClick={() => onGenerateWorkout(id, milestone.value, isBodyweight)} style={{ background: COLORS.accent, color: COLORS.onAccent, border: "none", borderRadius: 8, padding: "8px 12px", fontFamily: "'Oswald', sans-serif", fontSize: 11.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      Test Day
                    </button>
                  )}
                </div>

                {goal ? (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ color: COLORS.textDim, fontSize: 11.5 }}>
                        This week's target: <span style={{ color: COLORS.accent, fontFamily: "'JetBrains Mono', monospace" }}>{milestone.value}{isBodyweight ? " reps" : unit}</span>
                      </div>
                      <div style={{ color: COLORS.textDim, fontSize: 11.5 }}>Goal: {goal.target}{isBodyweight ? " reps" : unit}</div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: COLORS.surfaceRaised, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ height: "100%", width: `${Math.min(100, ((milestone.value - goal.current) / (goal.target - goal.current || 1)) * 100)}%`, background: COLORS.accent }} />
                    </div>
                    <button onClick={() => setExpandedGoal(isExpanded ? null : id)} style={{ color: COLORS.textDim, fontSize: 11.5, background: "transparent", border: "none", padding: "4px 0" }}>
                      {isExpanded ? "Hide weekly plan" : "Show weekly plan"}
                    </button>
                    {isExpanded && (
                      <div style={{ marginTop: 6 }}>
                        {goal.milestones.map((m) => (
                          <div key={m.week} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 11.5, color: COLORS.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                            <span>Week {m.week}</span>
                            <span>{m.value}{isBodyweight ? " reps" : unit}</span>
                          </div>
                        ))}
                        <button onClick={() => clearGoal(id)} style={{ marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: `1px solid ${COLORS.bad}`, borderRadius: 8, padding: "8px 0", color: COLORS.bad, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                          <Trash2 size={12} /> Clear Goal
                        </button>
                      </div>
                    )}
                  </div>
                ) : openForm === id ? (
                  <OneRMGoalForm
                    current={est ? est.value : null}
                    isBodyweight={isBodyweight}
                    unit={settings.weightUnit}
                    onSave={(current, target, level, weeks) => saveGoal(id, current, target, level, weeks)}
                    onCancel={() => setOpenForm(null)}
                  />
                ) : (
                  <button onClick={() => setOpenForm(id)} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: COLORS.accent, background: "transparent", border: "none", fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                    <Plus size={13} /> Set a Goal
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ONE-REP MAX TEST DAY
--------------------------------------------------------------- */

function OneRMWorkoutScreen({ exerciseId, target, isBodyweight, settings, onBack, onDone }) {
  const ex = ALL_EXERCISES_BY_ID[exerciseId];
  const ramp = buildOneRMRamp(target, isBodyweight, settings.weightUnit);
  const [results, setResults] = useState(ramp.map(() => ({ weight: "", reps: "" })));
  const [timer, setTimer] = useState(null);
  const [saving, setSaving] = useState(false);

  useRestCountdown(timer, setTimer, settings.restTimerSound);

  function startRest(seconds, label) {
    setTimer({ label, total: seconds, seconds, paused: false });
  }

  function updateResult(i, field, value) {
    setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function handleSave() {
    setSaving(true);
    const date = todayStr();
    // Recovery is measured in hours, so a 1RM session has to carry the time it
    // happened like any other — a bare date leaves the muscles it worked
    // looking older than they are.
    const at = new Date().toISOString();
    const loggedSets = results
      .map((r, i) => (isBodyweight ? { weight: "", reps: r.reps || String(ramp[i].reps) } : { weight: r.weight || String(ramp[i].weight), reps: r.reps || String(ramp[i].reps) }))
      .filter((s) => s.reps !== "");

    const prevHist = (await safeGet(`ex-history:${exerciseId}`)) || [];
    await safeSet(`ex-history:${exerciseId}`, [...prevHist, { date, at, sets: loggedSets }].slice(-20));

    if (PB_EXERCISE_IDS.includes(exerciseId)) {
      const topSet = getTopSet(loggedSets);
      const storedPB = await safeGet(`pb:${exerciseId}`);
      if (beatsRecord(topSet, storedPB)) {
        const bwRecord = await safeGet("bodyweight");
        const bw = bwRecord ? parseFloat(bwRecord.value) : null;
        await safeSet(`pb:${exerciseId}`, {
          exerciseId,
          name: ex.name,
          weight: topSet.weight,
          reps: topSet.reps,
          date,
          bodyWeightPct: bodyWeightPct(topSet.weight, bw),
        });
      }
    }

    const prevSessions = (await safeGet("workout-history")) || [];
    const session = { id: `${date}-${Date.now()}`, date, at, split: "1RM Test", exercises: [{ id: exerciseId, name: ex ? ex.name : exerciseId, muscle: ex ? ex.muscle : "", sets: loggedSets }] };
    await safeSet("workout-history", [...prevSessions, session].slice(-200));

    setSaving(false);
    onDone();
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title={ex ? ex.name : "1RM Test"} onBack={onBack} />
      <div style={{ padding: "0 20px 16px", color: COLORS.textDim, fontSize: 13 }}>
        Progressive ramp toward today's attempt. Log what you actually hit at each step — adjust on the fly if it feels off.
      </div>

      {timer && (
        <RestTimer timer={timer} onTogglePause={() => setTimer((p) => (p ? { ...p, paused: !p.paused } : p))} onAddTime={(s) => setTimer((p) => (p ? { ...p, seconds: p.seconds + s, total: p.total + s } : p))} onSkip={() => setTimer(null)} />
      )}

      <div style={{ padding: "0 20px" }}>
        {ramp.map((step, i) => (
          <div key={i} style={{ background: COLORS.surface, border: `1px solid ${step.label === "Attempt" ? COLORS.accent : COLORS.line}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ color: step.label === "Attempt" ? COLORS.accent : COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase" }}>
                {step.label}
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                target: {isBodyweight ? `${step.reps} reps` : `${step.weight}${settings.weightUnit} × ${step.reps}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!isBodyweight && (
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={String(step.weight)}
                  value={results[i].weight}
                  onChange={(e) => updateResult(i, "weight", e.target.value)}
                  style={{ width: 70, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                />
              )}
              <input
                type="number"
                inputMode="numeric"
                placeholder={String(step.reps)}
                value={results[i].reps}
                onChange={(e) => updateResult(i, "reps", e.target.value)}
                style={{ width: 70, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "8px 10px", color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
              />
              {step.rest && (
                <button
                  onClick={() => startRest(step.rest, `${step.label} → next`)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", border: "none", color: COLORS.accent, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
                >
                  <Timer size={12} /> Rest {Math.floor(step.rest / 60)}:{String(step.rest % 60).padStart(2, "0")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: `linear-gradient(to top, ${COLORS.bg} 60%, transparent)` }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", background: COLORS.accent, color: COLORS.onAccent, border: "none", borderRadius: 14, padding: "18px 0", fontFamily: "'Oswald', sans-serif", fontSize: 17, letterSpacing: 1, textTransform: "uppercase" }}
        >
          {saving ? "Saving…" : "Save Result"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SETTINGS
--------------------------------------------------------------- */

function SettingsToggleRow({ label, desc, value, onToggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14.5, textTransform: "uppercase" }}>{label}</div>
        <div style={{ color: COLORS.textDim, fontSize: 11.5, marginTop: 2 }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          background: value ? COLORS.accent : COLORS.surfaceRaised,
          border: `1px solid ${value ? COLORS.accent : COLORS.line}`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: value ? COLORS.onAccent : COLORS.textDim,
            position: "absolute",
            top: 2,
            left: value ? 21 : 2,
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}

// Save-and-restore, in Settings because it is a chore rather than a
// feature. Reports the folder and full path it wrote to: the previous
// version of this said "Saved!" and left the user hunting.
function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, title, detail }
  const [confirmFile, setConfirmFile] = useState(null); // parsed backup awaiting confirmation
  const fileRef = useRef(null);

  async function handleExport() {
    setBusy(true);
    setResult(null);
    try {
      const backup = await collectBackup();
      const text = JSON.stringify(backup, null, 2);
      const name = backupFilename();
      const where = await writeBackupFile(name, text);
      const kb = Math.max(1, Math.round(text.length / 1024));
      setResult({
        ok: true,
        title: `Saved to ${where.label}`,
        detail: `${where.path}\n${Object.keys(backup.data).length} items · ${kb} kB`,
      });
    } catch (e) {
      setResult({ ok: false, title: "Could not save the backup", detail: String((e && e.message) || e) });
    }
    setBusy(false);
  }

  function pickFile() {
    setResult(null);
    if (fileRef.current) fileRef.current.click();
  }

  async function handleFile(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = ""; // let the same file be picked again after a cancel
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) throw new Error("That file is not an Iron Log backup.");
      setConfirmFile(parsed);
    } catch (e) {
      setResult({ ok: false, title: "Could not read that file", detail: String((e && e.message) || e) });
    }
  }

  async function confirmRestore() {
    const parsed = confirmFile;
    setConfirmFile(null);
    setBusy(true);
    try {
      const count = await restoreBackup(parsed);
      setResult({ ok: true, title: "Restored", detail: `${count} items restored. Reopening…` });
      setTimeout(() => window.location.reload(), 900);
    } catch (e) {
      setResult({ ok: false, title: "Could not restore", detail: String((e && e.message) || e) });
      setBusy(false);
    }
  }

  const btn = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    padding: "12px 0",
    fontFamily: "'Oswald', sans-serif",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  return (
    <div data-tour="backup" style={{ margin: "10px 20px 20px", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
      <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
        Backup
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 12, lineHeight: 1.45 }}>
        Your training is stored on this phone and nowhere else. Save a copy somewhere safe so a lost or wiped phone doesn't take it with it.
      </div>

      <button onClick={handleExport} disabled={busy} style={{ ...btn, background: COLORS.accent, border: "none", color: COLORS.onAccent, marginBottom: 8 }}>
        {busy ? "Working…" : "Save Backup File"}
      </button>
      <button onClick={pickFile} disabled={busy} style={{ ...btn, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.text }}>
        <RotateCcw size={13} /> Restore From File
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} style={{ display: "none" }} />

      {result && (
        <div style={{ marginTop: 12, background: COLORS.surfaceRaised, border: `1px solid ${result.ok ? COLORS.ok : COLORS.bad}`, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ color: result.ok ? COLORS.ok : COLORS.bad, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            {result.title}
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {result.detail}
          </div>
        </div>
      )}

      {confirmFile && (
        <div style={{ marginTop: 12, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.bad}`, borderRadius: 10, padding: "12px 13px" }}>
          <div style={{ color: COLORS.text, fontSize: 12.5, lineHeight: 1.5, marginBottom: 10 }}>
            Restoring replaces everything currently in the app with the contents of this backup
            {confirmFile.exportedAt ? ` from ${String(confirmFile.exportedAt).slice(0, 10)}` : ""}. This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmFile(null)} style={{ ...btn, flex: 1, background: "transparent", border: `1px solid ${COLORS.line}`, color: COLORS.textDim, padding: "10px 0" }}>
              Cancel
            </button>
            <button onClick={confirmRestore} style={{ ...btn, flex: 1, background: COLORS.bad, border: "none", color: COLORS.onAccent, padding: "10px 0" }}>
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// The three readiness states as they will actually look, on the page where
// you choose them. Picking a scheme from four names and finding out what it
// did by going back to Home is a poor way to make this decision, especially
// for the person most likely to be making it.
function StagePreview() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {STAGE_LEGEND.map(([stage, note]) => {
        const shape = THEME.shapes ? STAGE_SHAPES[stage] : null;
        return (
          <div key={stage} style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                margin: "0 auto 7px",
                background: STAGE_COLORS[stage],
                border: shape && shape.width ? `2px ${shape.dash ? "dashed" : "solid"} ${outlineColorFor(STAGE_COLORS[stage])}` : "2px solid transparent",
              }}
            />
            <div style={{ color: COLORS.text, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {STAGE_LABELS[stage]}
            </div>
            <div style={{ color: COLORS.textDim, fontSize: 10, marginTop: 2 }}>{note}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------
   COLOUR & DISPLAY

   Everything about how the app looks, on one screen: light or dark, the
   colour scheme, and high contrast. They belong together because they
   interact — a scheme's palette is different in each theme, and high
   contrast changes both — and because someone who needs one of them
   usually needs to try the others too.
--------------------------------------------------------------- */

function ColourScreen({ settings, onChange, onBack }) {
  const scheme = settings.colourScheme || "default";
  const mode = settings.theme || "system";
  const set = (patch) => onChange({ ...settings, ...patch });

  const sectionLabel = {
    color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif",
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
  };
  const note = { color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12 };

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="Colour & Display" onBack={onBack} />

      <div style={{ padding: "0 20px 22px" }}>
        <div style={sectionLabel}>Theme</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {THEME_MODES.map((m) => {
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => set({ theme: m.value })}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surface, color: active ? COLORS.onAccent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45 }}>
          {(THEME_MODES.find((m) => m.value === mode) || THEME_MODES[0]).desc}
        </div>
      </div>

      <div style={{ padding: "0 20px 22px" }}>
        <div style={sectionLabel}>Colour Scheme</div>
        <div style={note}>
          The readiness map tells you what is recovered using colour, and red, amber and green is the worst possible set for the commonest kind of colour blindness. Pick the one that matches how you see. Every colour in the app that means something changes with it, and the muscles gain outlines so you are never relying on colour alone.
        </div>

        <StagePreview />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {COLOUR_SCHEME_ORDER.map((key) => {
            const sch = COLOUR_SCHEMES[key];
            const pal = sch[THEME.theme] || sch.dark;
            const active = scheme === key;
            return (
              <button
                key={key}
                onClick={() => set({ colourScheme: key })}
                style={{ textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? hexToRgba(COLORS.accent, 0.12) : COLORS.surface }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                  <span style={{ color: active ? COLORS.accent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {sch.label}
                  </span>
                  <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {["red", "amber", "green"].map((st) => (
                      <span key={st} style={{ width: 16, height: 16, borderRadius: 4, background: pal.stages[st], border: sch.shapes && st !== "green" ? `1.5px ${st === "amber" ? "dashed" : "solid"} ${outlineColorFor(pal.stages[st])}` : "none" }} />
                    ))}
                  </span>
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45 }}>{sch.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <div style={sectionLabel}>Contrast</div>
        <button
          onClick={() => set({ highContrast: !settings.highContrast })}
          style={{ width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 12, border: `1px solid ${settings.highContrast ? COLORS.accent : COLORS.line}`, background: settings.highContrast ? hexToRgba(COLORS.accent, 0.12) : COLORS.surface, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", color: settings.highContrast ? COLORS.accent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              High Contrast
            </span>
            <span style={{ display: "block", color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45 }}>
              Pure black or pure white behind everything, stronger text, heavier lines. For bad lighting, low vision, or a phone held at arm&rsquo;s length in a bright gym. Turns the readiness outlines on whatever scheme you are using.
            </span>
          </span>
          <span style={{ width: 42, height: 24, borderRadius: 12, background: settings.highContrast ? COLORS.accent : COLORS.surfaceRaised, border: `1px solid ${settings.highContrast ? COLORS.accent : COLORS.line}`, flexShrink: 0, position: "relative" }}>
            <span style={{ position: "absolute", top: 2, left: settings.highContrast ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: settings.highContrast ? COLORS.onAccent : COLORS.textDim }} />
          </span>
        </button>
      </div>
    </div>
  );
}

function SettingsScreen({ settings, onChange, onBack, onViewColour, onReplayTour, onViewFeatureList, onViewWhatsNew, license, onBuy, onRestore, purchaseBusy, purchaseMsg }) {
  function toggle(key) {
    onChange({ ...settings, [key]: !settings[key] });
  }

  // These three ship OFF so a first workout stays uncluttered — grouped
  // together and called out in the tour so they aren't easy to miss.
  const optInItems = [
    { key: "showCues", label: "Exercise Cues", desc: "Show the hypertrophy tip under each exercise." },
    { key: "showWarmups", label: "Warm-Up Suggestions", desc: "Suggest ramp-up sets before compound lifts." },
    { key: "includeMobility", label: "Mobility Finisher", desc: "Add a mobility/stretch exercise to the end of every built workout." },
  ];
  const items = [
    { key: "showLastSet", label: "Last Top Set", desc: "Show your last top set for each exercise." },
    { key: "showSetTicks", label: "Set Tick Boxes", desc: "Show the tick box beside every set and warm-up. Off is a cleaner list — what you type is still saved either way, but the rest timer stops starting itself." },
    { key: "showBodyMap", label: "Muscle Readiness Map", desc: "Show the body diagram on the home screen." },
    { key: "autoRestTimer", label: "Auto-Start Rest Timer", desc: "Start the rest countdown as soon as you tick a set off." },
    { key: "restTimerSound", label: "Rest Timer Sound", desc: "Play a beep when the rest timer finishes." },
    { key: "randomizeSelection", label: "Randomize Exercise Selection", desc: "Off: pick exercises in ranked order. On: shuffle for variety." },
  ];

  const subscribed = isLicenseUnlocked(license);

  const appMode = settings.appMode === "advanced" ? "advanced" : "simple";

  return (
    <div>
      <TopBar title="Settings" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        Customize what shows up while you train.
      </div>

      <div data-tour="app-mode" style={{ padding: "0 20px 16px" }}>
        <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          App Mode
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {APP_MODES.map((m) => {
            const active = appMode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onChange({ ...settings, appMode: m.value })}
                style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: `1px solid ${active ? COLORS.accent : COLORS.line}`, background: active ? COLORS.accent : COLORS.surface, color: active ? COLORS.onAccent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.4 }}>
          {APP_MODES.find((m) => m.value === appMode).desc}
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <button
          onClick={onViewColour}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "13px 14px", textAlign: "left" }}
        >
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
              Colour &amp; Display
            </span>
            <span style={{ display: "block", color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.4 }}>
              Light or dark, colour schemes for colour blindness, and high contrast.
            </span>
          </span>
          <ChevronRight size={16} color={COLORS.accent} style={{ flexShrink: 0 }} />
        </button>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <button
          data-tour="feature-list-btn"
          onClick={onViewFeatureList}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: hexToRgba(COLORS.accent, 0.1), border: `1px solid ${COLORS.accent}`, borderRadius: 12, padding: "13px 0", color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          <BookOpen size={15} /> Feature List
        </button>
        {/* The changelog shows itself once after an update, so it needs a
            permanent home for anyone who dismissed it too quickly. */}
        {releaseNotesFor(APP_VERSION) && (
          <button
            onClick={onViewWhatsNew}
            style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 0", color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            <Sparkles size={14} color={COLORS.accent} /> What's New in {APP_VERSION}
          </button>
        )}
      </div>

      <BackupPanel />

      {license && !UNLOCKED_BUILD && (
        <div style={{ margin: "10px 20px 20px", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
          <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
            <Lock size={14} color={COLORS.accent} /> Subscription
          </div>
          <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 12 }}>
            {subscribed
              ? "Iron Log is active on this device. Manage or cancel any time in Google Play — your workouts stay on your phone either way."
              : "Start a free trial to unlock everything. Cancel any time in Google Play."}
          </div>
          {!subscribed && (
            <button
              onClick={onBuy}
              disabled={purchaseBusy}
              style={{ width: "100%", marginBottom: 8, background: COLORS.accent, border: "none", borderRadius: 10, padding: "12px 0", color: COLORS.onAccent, fontSize: 13.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
            >
              {purchaseBusy ? "Working…" : "Start Free Trial"}
            </button>
          )}
          {/* Play requires cancellation to be reachable from inside the app,
              and hiding it is a listing rejection. */}
          {subscribed && (
            <a
              href={manageSubscriptionUrl()}
              target="_blank"
              rel="noreferrer"
              style={{ width: "100%", marginBottom: 8, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "11px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", textDecoration: "none" }}
            >
              Manage Subscription
            </a>
          )}
          <button
            onClick={onRestore}
            disabled={purchaseBusy}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "11px 0", color: COLORS.text, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}
          >
            <RotateCcw size={13} /> Restore Subscription
          </button>
          {purchaseMsg && <div style={{ marginTop: 8, color: COLORS.textDim, fontSize: 11.5 }}>{purchaseMsg}</div>}
        </div>
      )}

      <div data-tour="opt-in-features" style={{ padding: "0 20px 10px" }}>
        <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          Off by default
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {optInItems.map((item) => (
            <SettingsToggleRow key={item.key} label={item.label} desc={item.desc} value={settings[item.key]} onToggle={() => toggle(item.key)} />
          ))}
        </div>
      </div>

      <div style={{ padding: "10px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <SettingsToggleRow key={item.key} label={item.label} desc={item.desc} value={settings[item.key]} onToggle={() => toggle(item.key)} />
        ))}
      </div>

      {onReplayTour && (
        <div style={{ padding: "0 20px 40px" }}>
          <button
            onClick={onReplayTour}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "13px 0", color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            <Sparkles size={15} color={COLORS.accent} /> Replay App Tour
          </button>
        </div>
      )}

      {/* The readiness map ships someone else's artwork, and Apache 2.0 asks
          that the NOTICE travel with it. An installed APK has nowhere else to
          put that, so it lives at the foot of Settings alongside the version. */}
      <div style={{ padding: "0 20px 40px", textAlign: "center" }}>
        <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>Iron Log v{APP_VERSION}</div>
        <div style={{ color: COLORS.textDim, fontSize: 10.5, marginTop: 6, opacity: 0.8, lineHeight: 1.5 }}>
          Muscle map artwork from Body Muscles, © 2024 Ivan Vulović,
          used under the Apache License 2.0.
          <br />
          github.com/vulovix/body-muscles
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   FEATURE LIST
   The in-app "read me" — every feature and every setting, grouped the
   same way the app itself is. Reachable from Settings any time, and
   pointed at once, right after the first-run tour, so a lost user has
   somewhere to go besides guessing.
--------------------------------------------------------------- */

// Collapsed by default. The list runs to five screens of solid prose, which
// is unreadable as a wall — closed sections turn it into a short contents
// page you can scan and open the one part you came for.
function FeatureSection({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const count = React.Children.count(children);
  return (
    <div style={{ marginBottom: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: open ? COLORS.surfaceRaised : COLORS.surface,
          border: `1px solid ${open ? COLORS.accent : COLORS.line}`,
          borderRadius: 12,
          padding: "12px 14px",
          textAlign: "left",
        }}
      >
        <span style={{ color: open ? COLORS.accent : COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
          {title}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
          {count}
          {open ? <ChevronDown size={15} color={COLORS.accent} /> : <ChevronRight size={15} />}
        </span>
      </button>
      {open && <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>{children}</div>}
    </div>
  );
}

function FeatureItem({ name, children }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase", marginBottom: 3 }}>{name}</div>
      <div style={{ color: COLORS.textDim, fontSize: 12.5, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function FeatureListScreen({ onBack }) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title="Feature List" onBack={onBack} />
      <div style={{ padding: "0 20px 20px", color: COLORS.textDim, fontSize: 13, lineHeight: 1.5 }}>
        Everything Iron Log can do. Tap a section to open it.
      </div>

      <div style={{ padding: "0 20px" }}>
        <FeatureSection title="Starting a Workout" defaultOpen>
          <FeatureItem name="Free Mode">
            Tap a muscle repeatedly to add exercises for it. In Advanced Mode, switch to "Choose specific exercises instead" to pick exact exercises from a collapsible, body-part-by-body-part list.
          </FeatureItem>
          <FeatureItem name="Programmes">
            Build a multi-week plan (Push/Pull/Legs, Upper/Lower, Bro Split, or fully custom). Iron Log queues your next day automatically and tracks how the block is progressing until you finish it.
          </FeatureItem>
          <FeatureItem name="Guided Programme (Recommended)">
            The highlighted option when creating a programme. Answer three quick questions — experience level, session length, and any body part you want to prioritize — and Iron Log builds a split for you, shows rep-range and protein recommendations, then previews the exact programme before you commit. Decline it and you're dropped back into the normal builder to make your own.
          </FeatureItem>
          <FeatureItem name="Train Ready Muscles">
            The muscle-readiness map on Home colours each muscle by how long it still needs: green once it is ready, amber inside the last day, red while more than a day remains. How long depends on the muscle and on how hard you trained it — the lower back needs four days after a session taken to failure and two and a half after one with reps left; side delts need a day and a half, or one. Muscles worked indirectly get their own shorter windows, so a hard bench leaves your chest red and your triceps somewhere behind it. Pick how long you have and Iron Log builds a session from whatever is green.
          </FeatureItem>
          <FeatureItem name="Backup">
            Settings → Backup saves everything — history, programmes, settings, exercise order — to one JSON file in your Downloads, and names the exact path it wrote to. Restore puts it all back. Your data never leaves the phone otherwise, so this file is the only copy that survives losing it.
          </FeatureItem>
          <FeatureItem name="Reps In Reserve">
            Advanced Mode puts a blue circle beside every set. One tap records how many reps you had left — 0 for failure through to 3+. The readiness map reads it directly: 0 or 1 puts the muscle on its failure window, 2 or more on its buffer window, and the gap is large — a hard set of squats needs 84 hours where one with reps left needs 54. The hardest set of the session decides. Leave it blank and the buffer window is assumed.
          </FeatureItem>
          <FeatureItem name="Exercise Notes">
            Jot anything against an exercise — seat height, a niggle, which pin. It reappears under "last time" when you next do it.
          </FeatureItem>
          <FeatureItem name="Measurements">
            Chest, waist, hips, arms, thighs and calves, in cm or inches, in Personal Info. Each shows the change since your first reading.
          </FeatureItem>
          <FeatureItem name="Copy Previous">
            Redo any past workout exactly as it was logged — same exercises, same order.
          </FeatureItem>
          <FeatureItem name="Templates (Advanced Mode)">
            Save any hand-picked exercise selection as a template from the "Choose specific exercises" screen, then reuse it from Home.
          </FeatureItem>
          <FeatureItem name="1RM Session">
            A guided max-attempt workout built from your saved 1RM goals, with a warm-up ramp built in.
          </FeatureItem>
        </FeatureSection>

        <FeatureSection title="Picking Exercises">
          <FeatureItem name="Body-part dropdowns">
            Every exercise picker in the app (program builder, mid-workout "Add Exercise", editing a past session, Free Mode) groups exercises by body part, collapsed until you tap one open.
          </FeatureItem>
          <FeatureItem name="Variant tiles (Advanced Mode)">
One entry per movement. A bench press is a bench press whether it is loaded with a barbell, dumbbells or a Smith machine, so you pick the implement per session instead of hunting through four near-identical entries.
          </FeatureItem>
          <FeatureItem name="Bodyweight, assisted or weighted">
            Dips, pull-ups, push-ups and nordic curls have one button on the exercise card for how you are loading them today. Assisted asks for the assistance, weighted asks for what you added, and bodyweight asks for nothing. The first time you touch the weight box it offers the figure you used last time at that same loading.
          </FeatureItem>
          <FeatureItem name="Calisthenics progression">
            Progress charts plot what you actually moved: bodyweight minus the assistance, or bodyweight plus what you hung off yourself. Coming off the assist machine therefore reads as progress instead of your numbers appearing to collapse. Needs a bodyweight in Personal Info to work.
          </FeatureItem>
          <FeatureItem name="Repeat last session in one tap">
            The "last time" panel on an exercise is a button. Tap it and those weights and reps go straight onto the card, one row per set you did last time. On an empty exercise it fills immediately; if you have already typed something it asks first and only replaces on a second tap. Reps in reserve is never copied — that is a measurement of the set you are about to do, not a plan.
          </FeatureItem>
          <FeatureItem name="Change the Implement (Advanced Mode)">
            Mid-workout, open an exercise's menu (gear icon) to change how you're loading it. The exercise stays the same, so your history and any superset stay attached — only the comparison narrows to sessions done the same way.
          </FeatureItem>
          <FeatureItem name="Light mode">
            Settings → Colour &amp; Display. Dark, light, or follow your phone. Light is not the dark theme inverted — every colour that means something has a second value picked for a pale background, since most of what works on black disappears on white.
          </FeatureItem>
          <FeatureItem name="Colour schemes for colour blindness">
            Settings → Colour &amp; Display. The readiness map uses colour to say what is recovered, and red/amber/green is the worst triple for the commonest kind of colour blindness. Pick the scheme that matches how you see: red–green, blue–yellow, or monochrome, which uses brightness alone. Each has its own palette for light and for dark. Everything in the app that carries meaning through colour changes with it, and in any scheme but the original the muscles gain outlines so colour is never the only clue. High Contrast is a separate switch — pure black, brighter text, heavier lines.
          </FeatureItem>
          <FeatureItem name="Exercise Database">
            From the Home screen: browse every exercise by body part. Reorder anything — the order is the priority the app uses when it picks exercises for you, so moving cable pushdowns to the top means you get them first. Remove exercises you can't or won't do (they vanish from every picker, and you can restore them any time), and add your own.
          </FeatureItem>
          <FeatureItem name="Edit any exercise">
            Tap the pencil beside anything in the Exercise Database — yours or one of Iron Log's — to change its name, its muscle, its type, the muscles it also hits, or its cue. The exercise keeps its identity, so every set you have logged against it stays attached; renaming it or moving it to another muscle updates your past workouts to match. Adding an indirect muscle counts backwards too, so old sessions start feeding the readiness map and weekly volume for it immediately. An edited built-in is marked Edited and can be put back to Iron Log's version whenever you like.
          </FeatureItem>
          <FeatureItem name="Custom exercises (Advanced Mode)">
            Tap "+ New" on any exercise picker — or use the Exercise Database screen — to add your own exercise. It's saved and reusable everywhere afterward.
          </FeatureItem>
          <FeatureItem name="Indirect muscles on your own compounds">
            When the exercise you are adding is a compound, tick the muscles it also hits. They get partial fatigue on the readiness map and half a set each in weekly volume, exactly like the built-in exercises.
          </FeatureItem>
          <FeatureItem name="Search by whatever you call it">
            The Exercise Database has a search box, and it knows common alternative names — press-up finds Push-Up, OHP finds Overhead Press, RDL finds Romanian Deadlift.
          </FeatureItem>
          <FeatureItem name="Pause an exercise (Advanced Mode)">
            On the "Choose specific exercises" screen, tap the pause icon next to any exercise to exclude it from auto-built (Train Ready Muscles / muscle-tap) sessions without deleting it.
          </FeatureItem>
        </FeatureSection>

        <FeatureSection title="Logging a Workout">
          <FeatureItem name="Sets, weight & reps">
            Enter weight and reps per set and tick the box as you finish it — plan the whole exercise ahead, then check things off as you go.
          </FeatureItem>
          <FeatureItem name="Rest timer">
            Start a timer between sets from any exercise. It pins to the top of the screen and stays visible while you scroll — pause it, add time, or skip it.
          </FeatureItem>
          <FeatureItem name="Form videos">
            A play button beside every exercise name opens a YouTube search for that lift. It includes the implement you are using, so a Smith machine bench press does not show you a barbell one.
          </FeatureItem>
          <FeatureItem name="Supersets & drop sets (Advanced Mode)">
            From an exercise's menu, link it with another into a superset, or add a drop set to a working set for extra intensity.
          </FeatureItem>
          <FeatureItem name="Cable & machine tracking (Advanced Mode)">
            Machine and cable work lets you log the gym's brand and the grip used, so weight comparisons over time are like-for-like. Name the machine and "last time" switches to your last session on that one — or tells you when you have never used it. Progress charts get a dropdown to plot a single machine, and you can add the machine to a past session by editing it in your history.
          </FeatureItem>
          <FeatureItem name="Backdating">
            Tap "Logging for now" at the top of a workout to back-date it to the exact day and time it actually happened.
          </FeatureItem>
          <FeatureItem name="Add exercise mid-workout">
            Tap "Add Exercise" at the bottom of any workout to bring in something you didn't originally plan for.
          </FeatureItem>
        </FeatureSection>

        <FeatureSection title="After a Workout">
          <FeatureItem name="Training Log / History">
            Every finished session is saved. Open any past workout to review it, or edit it — fix a typo, adjust a set, or add an exercise you forgot to log.
          </FeatureItem>
          <FeatureItem name="Progress Charts">
            A per-exercise graph over time, plotted as estimated 1RM, top-set weight or total volume. Estimated 1RM leads because it is the only one that stays honest when the rep target changes — a lighter set for more reps still counts as progress. Appears once an exercise has two logged sessions.
          </FeatureItem>
          <FeatureItem name="1RM Goals">
            Set a one-rep-max target and get a week-by-week progression toward it. Log a max by hand or let Iron Log estimate it from your workouts.
          </FeatureItem>
          <FeatureItem name="Personal Info & Weight Tracking">
            Keep your weight, height and age in one place. Turn on weight tracking to set a goal and see your weight plotted over time.
          </FeatureItem>
          <FeatureItem name="Consistency">
            A streak counter on the Home screen, and its own screen showing a square for every day of the year, month by month, with a year picker to look back over past years.
          </FeatureItem>
        </FeatureSection>

        <FeatureSection title="Settings">
          <FeatureItem name="Simple / Advanced Mode">
            Simple Mode (the default) keeps things to muscle-tap selection, weight/reps logging and a rest timer. Advanced Mode unlocks the implement picker, reps-in-reserve, supersets, drop sets, machine and grip tracking, custom exercises and templates. Switch anytime — nothing you've logged is affected either way.
          </FeatureItem>
          <FeatureItem name="Exercise Cues (off by default)">
            Shows a short hypertrophy/form tip under each exercise while you train.
          </FeatureItem>
          <FeatureItem name="Warm-Up Suggestions (off by default)">
            Adds tickable ramp-up sets before the first exercise of each muscle in a workout.
          </FeatureItem>
          <FeatureItem name="Mobility Finisher (off by default)">
            Tacks a mobility/stretch exercise onto the end of every auto-built workout.
          </FeatureItem>
          <FeatureItem name="Last Top Set">
            Shows your last logged top set for an exercise, right there while you log the new one.
          </FeatureItem>
          <FeatureItem name="Muscle Readiness Map">
            Toggles the body-diagram recovery map on the Home screen.
          </FeatureItem>
          <FeatureItem name="Rest Timer Sound">
            Plays a beep when a rest timer finishes.
          </FeatureItem>
          <FeatureItem name="Randomize Exercise Selection">
            When off, auto-built workouts pick exercises in a fixed ranked order; when on, they shuffle for variety.
          </FeatureItem>
          <FeatureItem name="Replay App Tour">
            Re-runs the first-run walkthrough any time, from the bottom of Settings.
          </FeatureItem>
        </FeatureSection>

        {UNLOCKED_BUILD ? (
          <FeatureSection title="Your Copy">
            <FeatureItem name="Fully unlocked">
              This build has every feature switched on permanently — no trial, no purchase, nothing to expire.
            </FeatureItem>
          </FeatureSection>
        ) : (
          <FeatureSection title="Trial & Subscription">
            <FeatureItem name="7-day free trial">
              Every feature unlocked for 7 days, run by Google Play. Cancel before it ends and you are not charged.
            </FeatureItem>
            <FeatureItem name="Monthly or annual">
              Pick either when you start the trial. Manage or cancel any time from Settings or Google Play.
            </FeatureItem>
            <FeatureItem name="Works offline">
              Iron Log keeps working without a signal. It only needs to reach Google Play occasionally to confirm the subscription.
            </FeatureItem>
            <FeatureItem name="Your data is yours">
              Everything stays on your phone, subscribed or not, and Backup in Settings always works — cancelling never locks you out of your own history.
            </FeatureItem>
            <FeatureItem name="Restore Subscription">
              Reinstalled the app or switched devices? Restore from Settings using the same Google account.
            </FeatureItem>
          </FeatureSection>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   EXERCISE DATABASE
   Two levels, drilled into from Home: muscle groups, then the movements
   in that group. Inside a group the user can reorder (which genuinely
   re-ranks what the app auto-picks first — EXERCISES[muscle] order is the
   priority list pickSmartForMuscle walks), remove, restore, and add their
   own.
--------------------------------------------------------------- */

function ExerciseRowControls({ onUp, onDown, canUp, canDown, onEdit, onRemove, removed, onRestore }) {
  const box = (enabled) => ({
    width: 30,
    height: 30,
    borderRadius: 8,
    background: COLORS.surfaceRaised,
    border: `1px solid ${COLORS.line}`,
    color: enabled ? COLORS.text : COLORS.line,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });
  if (removed) {
    return (
      <button onClick={onRestore} style={{ ...box(true), width: "auto", padding: "0 10px", color: COLORS.accent, fontSize: 11, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", gap: 5 }}>
        <RotateCcw size={12} /> Restore
      </button>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <button onClick={canUp ? onUp : undefined} disabled={!canUp} style={box(canUp)} title="Move up"><ChevronUp size={15} /></button>
      <button onClick={canDown ? onDown : undefined} disabled={!canDown} style={box(canDown)} title="Move down"><ChevronDown size={15} /></button>
      <button onClick={onEdit} style={box(true)} title="Edit"><Pencil size={14} /></button>
      <button onClick={onRemove} style={{ ...box(true), color: COLORS.bad }} title="Remove"><Trash2 size={14} /></button>
    </div>
  );
}

function ExerciseDatabaseScreen({ onBack }) {
  const [muscle, setMuscle] = useState(null);
  const [query, setQuery] = useState("");
  const [showRemoved, setShowRemoved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [, forceRefresh] = useState(0);
  const refresh = () => forceRefresh((n) => n + 1);

  const muscles = Object.keys(EXERCISES).filter((m) => m !== "Mobility");

  // Moves an exercise one place up or down the muscle's priority ranking.
  // The step is measured against the rows currently on screen rather than
  // the raw array, so a removed exercise sitting between two visible ones
  // doesn't swallow a press of the button — the exercise is lifted out and
  // reinserted where its visible neighbour sits.
  async function moveExercise(m, shownIds, id, direction) {
    const all = EXERCISES[m] || [];
    const shownAt = shownIds.indexOf(id);
    const neighbourId = shownIds[shownAt + direction];
    if (shownAt < 0 || neighbourId === undefined) return;
    const next = all.filter((e) => e.id !== id);
    const target = next.findIndex((e) => e.id === neighbourId);
    if (target < 0) return;
    next.splice(direction < 0 ? target : target + 1, 0, all.find((e) => e.id === id));
    EXERCISES[m] = next;
    await saveMuscleOrder(m);
    await markMuscleManuallyOrdered(m);
    refresh();
  }

  async function remove(ex, m) {
    if (ex.custom) await deleteCustomExercise(ex.id, m);
    else await setExerciseHidden(ex.id, true);
    refresh();
  }
  async function restore(ex) {
    await setExerciseHidden(ex.id, false);
    refresh();
  }

  async function handleSaveCustom(ex) {
    registerCustomExercise({ ...ex, custom: true });
    const prev = (await safeGet("custom-exercises")) || [];
    await safeSet("custom-exercises", [...prev, { ...ex, custom: true }]);
    await saveMuscleOrder(ex.muscle);
    setAdding(false);
    refresh();
  }

  async function handleSaveEdit(ex) {
    // The muscle can be changed in the form, so the row may be leaving the
    // list that is currently on screen. Follow it rather than dropping the
    // user on a list their exercise just left.
    const movedTo = ex.muscle;
    await saveExerciseEdit(ex.id, ex);
    setEditingId(null);
    if (movedTo !== muscle) setMuscle(movedTo);
    refresh();
  }

  async function handleRevert(id) {
    await revertExerciseEdit(id);
    setEditingId(null);
    refresh();
  }

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    background: COLORS.surface,
    border: `1px solid ${COLORS.line}`,
    borderRadius: 12,
    padding: "11px 12px",
  };

  /* ---- Level 1: muscle groups, or search results across all of them ---- */
  if (!muscle) {
    // Browsing by body part only works if you already know which body part
    // the app filed something under, and it silently fails for anyone whose
    // word for a movement is not the one on the entry — a press-up is a
    // Push-Up here. Search matches aliases as well as names.
    const q = query.trim();
    const results = q
      ? muscles
          .map((m) => ({ muscle: m, matches: visibleExercises(m).filter((e) => exerciseMatchesQuery(e, q)) }))
          .filter((g) => g.matches.length)
      : null;

    return (
      <div style={{ paddingBottom: 40 }}>
        <TopBar title="Exercise Database" onBack={onBack} />
        <div style={{ padding: "0 20px 16px", color: COLORS.textDim, fontSize: 13, lineHeight: 1.5 }}>
          Every exercise Iron Log knows, by body part. Reorder them to change which ones the app suggests first, edit any of them, remove the ones you can’t or won’t do, and add your own.
        </div>
        <div style={{ padding: "0 20px 12px" }}>
          <input
            type="text"
            placeholder="Search exercises…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "10px 12px", color: COLORS.text, fontSize: 13.5 }}
          />
        </div>

        {results && (
          <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {results.length === 0 && (
              <div style={{ color: COLORS.textDim, fontSize: 13, padding: "8px 2px" }}>
                Nothing matches “{q}”. Open a body part below to add it yourself.
              </div>
            )}
            {results.map((g) => (
              <div key={g.muscle}>
                <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.2, textTransform: "uppercase", margin: "6px 2px 6px" }}>
                  {g.muscle}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {g.matches.map((e) => (
                    <button key={e.id} onClick={() => { setQuery(""); setMuscle(g.muscle); setShowRemoved(false); }} style={{ ...rowStyle, textAlign: "left" }}>
                      <span style={{ color: COLORS.text, fontSize: 13.5 }}>{e.name}</span>
                      <ChevronRight size={15} color={COLORS.accent} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8, ...(results ? { display: "none" } : {}) }}>
          {muscles.map((m, mi) => {
            const visible = visibleExercises(m).length;
            const hidden = (EXERCISES[m] || []).length - visible;
            return (
              <button key={m} data-tour={mi === 0 ? "exercise-db-list" : undefined} onClick={() => { setMuscle(m); setShowRemoved(false); }} style={{ ...rowStyle, textAlign: "left" }}>
                <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}>{m}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textDim, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                  {visible}{hidden > 0 ? ` (+${hidden} removed)` : ""}
                  <ChevronRight size={15} color={COLORS.accent} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---- Level 2: every exercise in this muscle group, one flat ranking ---- */
  const all = EXERCISES[muscle] || [];
  const shown = showRemoved ? all : all.filter((e) => !HIDDEN_EXERCISE_IDS.has(e.id));
  const shownIds = shown.map((e) => e.id);
  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title={muscle} onBack={() => setMuscle(null)} />
      <div style={{ padding: "0 20px 14px", color: COLORS.textDim, fontSize: 12.5 }}>
        Every variation, in one ranking. Top of the list gets suggested first. Tap the pencil to change a name, its muscles or its cue — your logged sets stay attached.
      </div>

      {adding && (
        <div style={{ padding: "0 20px 12px" }}>
          <NewExerciseForm
            muscles={muscles}
            defaultMuscle={muscle}
            onSave={handleSaveCustom}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.map((ex, i) => {
          const removed = HIDDEN_EXERCISE_IDS.has(ex.id);
          if (editingId === ex.id) {
            return (
              <div key={ex.id}>
                <NewExerciseForm
                  muscles={muscles}
                  initial={editableForm(ex)}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingId(null)}
                />
                {!ex.custom && isEdited(ex.id) && (
                  <button
                    onClick={() => handleRevert(ex.id)}
                    style={{ display: "block", margin: "-4px 0 12px", background: "transparent", border: "none", color: COLORS.textDim, fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    <RotateCcw size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                    Revert to Iron Log&rsquo;s version
                  </button>
                )}
              </div>
            );
          }
          const edited = !ex.custom && isEdited(ex.id);
          return (
            <div key={ex.id} style={{ ...rowStyle, opacity: removed ? 0.5 : 1 }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <span style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ color: COLORS.text, fontSize: 13, minWidth: 0 }}>{ex.name}</span>
                {(ex.custom || edited) && (
                  <span style={{ color: COLORS.textDim, fontSize: 9.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
                    {ex.custom ? "Yours" : "Edited"}
                  </span>
                )}
              </span>
              <ExerciseRowControls
                canUp={i > 0}
                canDown={i < shown.length - 1}
                onUp={() => moveExercise(muscle, shownIds, ex.id, -1)}
                onDown={() => moveExercise(muscle, shownIds, ex.id, 1)}
                onEdit={() => { setAdding(false); setEditingId(ex.id); }}
                onRemove={() => remove(ex, muscle)}
                removed={removed}
                onRestore={() => restore(ex)}
              />
            </div>
          );
        })}
      </div>

      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <button onClick={() => setShowRemoved((v) => !v)} style={{ color: COLORS.textDim, background: "transparent", border: "none", fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {showRemoved ? "Hide removed" : "Show removed"}
        </button>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); }} style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.accent, background: "transparent", border: "none", fontSize: 12, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
            <Plus size={13} /> Add Exercise
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SUGGESTED WORKOUT SCREEN
--------------------------------------------------------------- */

function SuggestedScreen({ onBack, onBuild }) {
  const [duration, setDuration] = useState(null);
  const [readiness, setReadiness] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const muscles = MUSCLE_GROUPS;
      const hist = (await safeGet("workout-history")) || [];
      if (cancelled) return;
      const lastMap = computeMuscleLastMap(hist);
      const map = {};
      muscles.forEach((m) => (map[m] = readinessPercent(lastMap[m], m)));
      setReadiness(map);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleBuild() {
    const exerciseCount = DURATION_EXERCISE_COUNTS[duration];
    // Freshest first, then keep only what the map calls ready — the screen is
    // "Train Ready Muscles", so an amber muscle should not qualify while a
    // green one exists. Falls back to the freshest six when too few are ready
    // to fill a session.
    const sorted = Object.entries(readiness).sort((a, b) => b[1] - a[1]);
    let readyMuscles = sorted.filter(([, pct]) => pct >= 100).map(([m]) => m);
    if (readyMuscles.length < 3) readyMuscles = sorted.slice(0, 6).map(([m]) => m);
    const list = buildSuggestedWorkout(readyMuscles, exerciseCount);
    onBuild(list);
  }

  const ready = !!duration;

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title="Train Ready Muscles" onBack={onBack} />
      <div style={{ padding: "0 20px 8px", color: COLORS.textDim, fontSize: 13 }}>
        {loading ? "Checking muscle readiness…" : "We'll build this from whichever muscles are most recovered right now."}
      </div>

      <div data-tour="suggested-options" style={{ padding: "16px 20px 0" }}>
        <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          How long do you have?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              style={{
                padding: "14px 0",
                borderRadius: 12,
                border: `1px solid ${duration === d.value ? COLORS.accent : COLORS.line}`,
                background: duration === d.value ? COLORS.accent : COLORS.surface,
                color: duration === d.value ? COLORS.onAccent : COLORS.text,
                fontFamily: "'Oswald', sans-serif",
                fontSize: 14,
                textTransform: "uppercase",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: `linear-gradient(to top, ${COLORS.bg} 60%, transparent)` }}>
        <button
          onClick={handleBuild}
          disabled={!ready || loading}
          style={{
            width: "100%",
            background: ready ? COLORS.accent : COLORS.surfaceRaised,
            color: ready ? COLORS.onAccent : COLORS.textDim,
            border: "none",
            borderRadius: 14,
            padding: "18px 0",
            fontFamily: "'Oswald', sans-serif",
            fontSize: 17,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {ready ? "Build Workout" : "Pick a duration"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP
--------------------------------------------------------------- */

/* ---------------------------------------------------------------
   FEATURE TOUR
   A first-open walkthrough of every feature, with Skip/Back/Next. Shown
   once (flag stored under "tour-seen"); replayable from Settings.

   Each step names a real `screen` router value (see App()'s `screen`
   state) — as the tour advances, App() actually navigates there, so the
   real screen sits behind/around the tour card instead of a static
   slideshow image. Steps that describe things that only happen *inside*
   an active workout (logging sets, the rest timer, supersets, back-
   dating) use the special screen value "workoutPreview" instead: App()
   renders a static, inert TourWorkoutPreviewScreen for those, rather
   than mounting the real WorkoutScreen. The real WorkoutScreen
   auto-saves an "in-progress-workout" snapshot the moment it mounts
   (see the effect in WorkoutScreen), so navigating into it with no
   actual exercises picked would silently overwrite — or wipe out — any
   real unfinished workout the user already had saved. The preview
   screen is the least-risky way to show the same UI without touching
   storage at all.
--------------------------------------------------------------- */

const TOUR_STEPS = [
  {
    icon: <Dumbbell size={26} />,
    title: "Welcome to Iron Log",
    body: "A fast, focused gym tracker. You're starting in Simple Mode — just the essentials, so you can get straight into training. Switch to Advanced anytime in Settings for exercise variants, supersets, drop sets and more. Tap Skip anytime to jump straight in.",
    screen: "home",
  },
  {
    icon: <Plus size={26} />,
    title: "Start a Workout",
    body: "Pick a split (Push, Pull, Legs…) or choose specific muscles, and Iron Log builds a balanced session for you. Or go fully freestyle and add exercises by hand.",
    screen: "split",
    target: "split-list",
  },
  {
    icon: <Bookmark size={26} />,
    title: "Programmes",
    body: "Follow a multi-week plan like Push/Pull/Legs, Upper/Lower or a Bro Split. The app queues your next day automatically and tracks how the block is progressing.",
    screen: "programme",
  },
  {
    icon: <BookOpen size={26} />,
    title: "Your Order of Importance",
    body: "When Iron Log builds a session it works down this list, so whatever sits at the top of a muscle group is what you get first. Move your favourites up with the arrows, remove the ones your gym doesn't have, and add your own. Prefer variety? Turn on Randomize Exercise Selection in Settings and it shuffles instead of following the ranking.",
    screen: "exerciseDb",
    target: "exercise-db-list",
  },
  {
    icon: <Sparkles size={26} />,
    title: "Train Ready Muscles",
    body: "The muscle-readiness map colours each muscle by how long it still needs, in real hours: green once it is ready, amber inside the last day, red while more than a day remains. Tap 'Train Ready Muscles' to build a session from whatever is green.",
    screen: "suggested",
    target: "suggested-options",
  },
  {
    icon: <Check size={26} />,
    title: "Logging Your Sets",
    body: "Enter weight and reps for each set, and tick the box as you finish it — a handy way to plan ahead then check things off. Warm-up sets and per-exercise cues are optional features, off by default — flip them on in Settings if you want them.",
    screen: "workoutPreview",
    target: "set-rows",
  },
  {
    icon: <Play size={26} />,
    title: "Not Sure How It's Done?",
    body: "Every exercise has a play button beside its name. Tap it and Iron Log opens a YouTube search for that lift — and it follows the implement you picked, so asking about a Smith machine bench press does not show you a barbell one.",
    screen: "workoutPreview",
    target: "form-video",
  },
  {
    icon: <Sparkles size={26} />,
    title: "How Hard Was That Set?",
    body: "In Advanced Mode each set gets a blue circle on the right. Tap it and pick how many reps you had left in the tank — 0 means you went to failure, 3+ means you stopped well short. It takes one tap and it changes the readiness map: a muscle taken to failure is given longer to recover than one worked comfortably.",
    screen: "workoutPreview",
    target: "set-rows",
  },
  {
    icon: <Timer size={26} />,
    title: "Rest Timer",
    body: "Tick a set off and the rest countdown starts on its own. It pins to the top of the screen and stays there while you scroll, so it's always visible — pause, add time, or skip it. Turn the automatic start off in Settings if you'd rather begin it yourself.",
    screen: "workoutPreview",
    target: "rest-timer",
  },
  {
    icon: <ChevronDown size={26} />,
    title: "Supersets & Drop Sets",
    body: "Advanced Mode adds a menu to every exercise: superset it with another, add drop sets, note the brand and grip on machine work, or change how you're loading it — barbell, dumbbell, Smith, machine. Turn on Advanced Mode in Settings if you don't see this yet.",
    screen: "workoutPreview",
    target: "superset-dropset",
  },
  {
    icon: <Clock size={26} />,
    title: "Logged It Late?",
    body: "Forgot to log at the gym? Tap 'Logging for now' at the top of a workout to back-date it to the exact day and time it actually happened.",
    screen: "workoutPreview",
    target: "log-time-pill",
  },
  {
    icon: <RotateCcw size={26} />,
    title: "Back Up Your Training",
    body: "Everything lives on this phone and nowhere else, so a lost or wiped phone would take it all with it. Settings → Backup saves the lot as one file in your Downloads and tells you exactly where it went. The same screen restores it.",
    screen: "settings",
    target: "backup",
  },
  {
    icon: <HistoryIcon size={26} />,
    title: "History & Editing",
    body: "Every session is saved to your Training Log. Open any past workout to review it, fix a typo, or even add an exercise you forgot to record.",
    screen: "history",
  },
  {
    icon: <TrendingUp size={26} />,
    title: "Progress Charts",
    body: "Track any exercise over time as estimated 1RM, top-set weight or total volume. Estimated 1RM is the honest one — a lighter set for more reps still counts as progress. Logged an exercise on more than one machine? A dropdown by its name plots them separately.",
    screen: "progress",
  },
  {
    icon: <Trophy size={26} />,
    title: "1RM Goals",
    body: "Set a one-rep-max target and get a week-by-week progression toward it. Log your max by hand or let the app estimate it from your workouts, then generate a test day when you're ready.",
    screen: "onerm",
    target: "onerm-list",
  },
  {
    icon: <User size={26} />,
    title: "Personal Info",
    body: "Keep your weight, height and age in one place. Turn on weight tracking to set a goal, log your weight over time, and see it on a graph.",
    screen: "pb",
    target: "weight-tracking",
  },
  {
    icon: <Clock size={26} />,
    title: "Consistency",
    body: "A square for every day of the year, month by month, filled in on the days you trained. Step back through previous years with the arrows. Consistency is the thing that matters most over the long run.",
    screen: "streak",
    target: "streak-heatmap",
  },
  {
    icon: <SettingsIcon size={26} />,
    title: "Settings",
    body: "Exercise Cues, Warm-Up Suggestions and a Mobility Finisher all exist — they just ship off, so your first workout stays uncluttered. Turn any of them on right here whenever you want them.",
    screen: "settings",
    target: "opt-in-features",
  },
  {
    icon: <BookOpen size={26} />,
    title: "Lost? Start Here",
    body: "Every feature and every setting in Iron Log, explained in one place. If you're ever not sure how to do something, this is the first place to check.",
    screen: "settings",
    target: "feature-list-btn",
  },
  {
    icon: <Check size={26} />,
    title: "You're All Set",
    body: "That's the whole app. You can replay this tour anytime from Settings. Now go lift something heavy.",
    screen: "home",
  },
];

// Static, non-interactive stand-in for the real WorkoutScreen, used only
// while the tour is illustrating in-workout features (see the comment
// above TOUR_STEPS for why the real screen isn't used here). Nothing on
// this screen reads or writes storage.
function TourWorkoutPreviewScreen() {
  const rowStyle = { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${COLORS.line}` };
  const inputStyle = { width: 56, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, borderRadius: 8, color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: "7px 0", textAlign: "center" };
  const pillStyle = { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "9px 0", color: COLORS.text, fontSize: 11.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.3 };
  return (
    <div style={{ padding: "20px 20px 40px" }}>
      <div style={{ color: COLORS.textDim, fontSize: 10.5, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        Preview — nothing here is saved
      </div>
      <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 20, textTransform: "uppercase", marginBottom: 16 }}>
        In a Real Workout
      </div>

      <div data-tour="log-time-pill" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "7px 12px", color: COLORS.textDim, fontSize: 12.5, marginBottom: 14 }}>
        <Clock size={13} /> Logging for now
      </div>

      <div data-tour="rest-timer" style={{ background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${COLORS.accent}`, borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 12.5, textTransform: "uppercase" }}>
          <Timer size={14} /> Resting
        </div>
        <div style={{ color: COLORS.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>01:30</div>
      </div>

      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase" }}>
              Barbell Bench Press
            </div>
            {/* Inert, like everything else on this preview — the tour should
                not launch YouTube out from under the person reading it. */}
            <div data-tour="form-video" style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Play size={11} />
            </div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.surfaceRaised, border: `1px solid ${COLORS.line}`, color: COLORS.textDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SettingsIcon size={14} />
          </div>
        </div>
        <div data-tour="superset-dropset" style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div style={pillStyle}>
            <ChevronDown size={13} color={COLORS.accent} /> Dropset
          </div>
          <div style={pillStyle}>
            <Sparkles size={13} color={COLORS.accent} /> Superset
          </div>
        </div>
        <div data-tour="set-rows">
          <div style={rowStyle}>
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${COLORS.line}` }} />
            <div style={{ ...inputStyle }}>40%</div>
            <div style={{ ...inputStyle }}>8</div>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>warm-up</div>
          </div>
          <div style={rowStyle}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={13} color={COLORS.onAccent} />
            </div>
            <div style={{ ...inputStyle }}>60</div>
            <div style={{ ...inputStyle }}>8</div>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>set 1</div>
          </div>
          <div style={{ ...rowStyle, borderBottom: "none" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${COLORS.line}` }} />
            <div style={{ ...inputStyle }}>60</div>
            <div style={{ ...inputStyle }}>7</div>
            <div style={{ color: COLORS.textDim, fontSize: 11 }}>set 2</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brings the element a step refers to into the band above the tour text, so
// the thing being described is actually on screen when it is described.
//
// It deliberately does not measure the target or draw anything around it.
// Three attempts at a spotlight ring all produced highlights that landed in
// the wrong place on some steps, and a box drawn around the wrong thing is
// worse than no box at all — it tells the reader to look somewhere the text
// isn't talking about. Scrolling is the part that was always working.
function useScrollTourTargetIntoView(targetKey) {
  useEffect(() => {
    if (!targetKey) return undefined;
    let frame = null;
    let found = false;
    function bring() {
      const el = document.querySelector(`[data-tour="${targetKey}"]`);
      if (!el) return;
      found = true;
      const r = el.getBoundingClientRect();
      // The text panel owns roughly the bottom half, so aim for the middle
      // of the band above it rather than the middle of the screen.
      const safeCenter = window.innerHeight * 0.26;
      if (r.top < 56 || r.bottom > window.innerHeight * 0.52) {
        window.scrollBy({ top: r.top + r.height / 2 - safeCenter, behavior: "smooth" });
      }
    }
    bring();
    // The target usually does not exist on the render where stepIndex
    // changes — App() navigates to the step's screen in its own effect a
    // beat later, mounting the target after this one runs.
    const observer = new MutationObserver(() => {
      if (found) return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(bring);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetKey]);
}

// Controlled by App() — stepIndex/onNext/onPrev/onSkip live there so the
// same step change that advances the card also drives navigation.
function FeatureTour({ stepIndex, onNext, onPrev, onSkip }) {
  const step = TOUR_STEPS[stepIndex];
  const last = stepIndex === TOUR_STEPS.length - 1;
  useScrollTourTargetIntoView(step.target);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
      {/* Nothing is drawn over the screen. The old spotlight dimmed the app
          with a 9999px box-shadow, and because it was position:fixed while
          the panel below is not, that shadow painted on top of the panel —
          which is why the text read as greyed on exactly the steps that had
          a target. No overlay, no ring, no dimming: the real screen, and the
          text explaining it. This transparent layer only stops taps reaching
          the app mid-tour, which would desync the step-driven navigation. */}
      <div
        style={{
          width: "100%",
          maxWidth: 412,
          // Without this the horizontal padding is added on top of the full
          // width, pushing the card wider than the screen and cutting the
          // Skip link and the Next button off the right edge.
          boxSizing: "border-box",
          // Fully opaque and flush to the bottom edge. Nothing translucent
          // anywhere in the tour any more, so the copy is always at full
          // contrast whatever is behind it.
          background: COLORS.bg,
          borderTop: `1px solid ${COLORS.line}`,
          padding: "18px 22px calc(22px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ color: COLORS.textDim, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
            {stepIndex + 1} / {TOUR_STEPS.length}
          </div>
          <button onClick={onSkip} style={{ color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Skip
          </button>
        </div>

        <div style={{ width: 54, height: 54, borderRadius: 14, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, marginBottom: 16 }}>
          {step.icon}
        </div>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 22, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          {step.title}
        </div>
        <div style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.55, marginBottom: 18, minHeight: 84 }}>
          {step.body}
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
          {TOUR_STEPS.map((_, idx) => (
            <div key={idx} style={{ flex: 1, height: 3, borderRadius: 2, background: idx <= stepIndex ? COLORS.accent : COLORS.surfaceRaised }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {stepIndex > 0 && (
            <button onClick={onPrev} style={{ flex: "0 0 auto", padding: "13px 18px", borderRadius: 12, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase" }}>
              Back
            </button>
          )}
          <button onClick={() => (last ? onSkip() : onNext())} style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: COLORS.accent, color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {last ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAYWALL
   Shown in place of any gated screen once the free trial has ended and
   the app hasn't been purchased (see ALLOWED_WHEN_LOCKED_SCREENS and
   setScreen() in App()). Home and Settings stay reachable regardless.
--------------------------------------------------------------- */

// Full-screen rather than a modal: on the first launch after an update this
// is the only thing on screen, and a changelog worth reading needs room.
function WhatsNewScreen({ notes, onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 210, background: COLORS.bg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "40px 22px 20px", maxWidth: 460, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${COLORS.accent}`, borderRadius: 999, padding: "5px 12px", marginBottom: 18 }}>
          <Sparkles size={13} color={COLORS.accent} />
          <span style={{ color: COLORS.accent, fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 1.2, textTransform: "uppercase" }}>
            Version {notes.version}
          </span>
        </div>

        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 30, textTransform: "uppercase", lineHeight: 1.1, letterSpacing: 0.5, marginBottom: 8 }}>
          What's New
        </div>
        <div style={{ color: COLORS.text, fontSize: 14.5, lineHeight: 1.55, marginBottom: 6 }}>{notes.headline}</div>
        <div style={{ color: COLORS.textDim, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", marginBottom: 24 }}>{notes.date}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.items.map((item) => (
            <div key={item.title} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderLeft: `3px solid ${COLORS.accent}`, borderRadius: 12, padding: "13px 15px" }}>
              <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ color: COLORS.textDim, fontSize: 13, lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>

        <div style={{ color: COLORS.textDim, fontSize: 12, textAlign: "center", marginTop: 22 }}>
          Your workouts and settings are exactly as you left them.
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, padding: `16px 22px calc(20px + env(safe-area-inset-bottom, 0px))`, background: `linear-gradient(to top, ${COLORS.bg} 65%, transparent)` }}>
        <button
          onClick={onDismiss}
          style={{ width: "100%", maxWidth: 460, margin: "0 auto", display: "block", background: COLORS.accent, border: "none", borderRadius: 14, padding: "17px 0", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Start Training
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   FIRST LAUNCH

   The very first decision, before the tour and before the app proper:
   Simple or Advanced. Burying it in Settings meant most people never
   found Advanced Mode at all, and the tour kept having to apologise for
   describing features that were switched off.

   The tier table lives here too. Someone deciding whether to keep an app
   is owed a plain answer about what the trial includes and what the
   one-off unlock costs, up front rather than at the moment it locks.
--------------------------------------------------------------- */

const TIER_ROWS = [
  ["Logging sets, reps and weight", true, true],
  ["Full exercise database", true, true],
  ["Muscle readiness map", true, true],
  ["Programmes and guided plans", true, true],
  ["Progress charts and history", true, true],
  ["Backups", true, true],
  ["Keeps working past day 7", false, true],
];

function TierTable() {
  const cell = { padding: "9px 6px", fontSize: 12, textAlign: "center" };
  const mark = (on) =>
    on ? (
      <Check size={14} color={COLORS.ok} />
    ) : (
      <span style={{ color: COLORS.textDim, fontSize: 13 }}>—</span>
    );
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 74px 74px", alignItems: "center", background: COLORS.surfaceRaised, borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ ...cell, textAlign: "left", paddingLeft: 13, color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase" }}>
          What you get
        </div>
        <div style={{ ...cell, color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 11, textTransform: "uppercase" }}>
          Trial
        </div>
        <div style={{ ...cell, color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 11, textTransform: "uppercase" }}>
          Subscribed
        </div>
      </div>
      {TIER_ROWS.map(([label, free, paid], i) => (
        <div
          key={label}
          style={{ display: "grid", gridTemplateColumns: "1fr 74px 74px", alignItems: "center", borderBottom: i === TIER_ROWS.length - 1 ? "none" : `1px solid ${COLORS.line}` }}
        >
          <div style={{ ...cell, textAlign: "left", paddingLeft: 13, color: COLORS.text, lineHeight: 1.35 }}>{label}</div>
          <div style={cell}>{mark(free)}</div>
          <div style={{ ...cell, background: hexToRgba(COLORS.accent, 0.07) }}>{mark(paid)}</div>
        </div>
      ))}
      <div style={{ padding: "10px 13px", borderTop: `1px solid ${COLORS.line}`, color: COLORS.textDim, fontSize: 11.5, lineHeight: 1.45 }}>
        Everything is included free for 7 days. After that it is a subscription — monthly or annual, cancel any time in Google Play. No account, no ads, and nothing leaves your phone either way.
      </div>
    </div>
  );
}

function WelcomeScreen({ onChoose }) {
  const [picked, setPicked] = useState(null);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, background: COLORS.bg, overflowY: "auto", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: "44px 22px 16px", maxWidth: 460, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ color: COLORS.accent, fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 8 }}>
          Iron Log
        </div>
        <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 30, textTransform: "uppercase", lineHeight: 1.1, letterSpacing: 0.5, marginBottom: 10 }}>
          How much do you want on screen?
        </div>
        <div style={{ color: COLORS.textDim, fontSize: 13.5, lineHeight: 1.5, marginBottom: 22 }}>
          Pick one to start with. You can change it whenever you like in Settings — nothing is lost either way.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
          {APP_MODES.map((m) => {
            const active = picked === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setPicked(m.value)}
                style={{
                  textAlign: "left",
                  background: active ? hexToRgba(COLORS.accent, 0.1) : COLORS.surface,
                  border: `1px solid ${active ? COLORS.accent : COLORS.line}`,
                  borderRadius: 14,
                  padding: "15px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                  <div
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      flexShrink: 0,
                      border: `1.5px solid ${active ? COLORS.accent : COLORS.line}`,
                      background: active ? COLORS.accent : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && <Check size={11} color={COLORS.onAccent} />}
                  </div>
                  <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 17, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {m.label}
                  </span>
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 12.5, lineHeight: 1.45, paddingLeft: 26 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>

        {!UNLOCKED_BUILD && <TierTable />}
      </div>

      <div style={{ position: "sticky", bottom: 0, padding: `14px 22px calc(18px + env(safe-area-inset-bottom, 0px))`, background: `linear-gradient(to top, ${COLORS.bg} 65%, transparent)` }}>
        <button
          onClick={() => onChoose(picked)}
          disabled={!picked}
          style={{
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            display: "block",
            background: picked ? COLORS.accent : COLORS.surfaceRaised,
            border: picked ? "none" : `1px solid ${COLORS.line}`,
            borderRadius: 14,
            padding: "17px 0",
            color: picked ? COLORS.onAccent : COLORS.textDim,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 15,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {picked ? "Continue" : "Pick one to continue"}
        </button>
      </div>
    </div>
  );
}

function PlanCard({ label, price, note, selected, onSelect, badge }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: selected ? hexToRgba(COLORS.accent, 0.1) : COLORS.surface,
        border: `1.5px solid ${selected ? COLORS.accent : COLORS.line}`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 10,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
          {badge && (
            <span style={{ background: COLORS.accent, color: COLORS.onAccent, fontSize: 9.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5, borderRadius: 5, padding: "2px 6px" }}>{badge}</span>
          )}
        </div>
        {note && <div style={{ color: COLORS.textDim, fontSize: 11.5, marginTop: 3 }}>{note}</div>}
      </div>
      {/* Null while the store is still answering. Showing nothing beats
          showing a number we invented — the price is Play Console's, per
          country, and this screen only ever repeats what Play said. */}
      <div style={{ color: selected ? COLORS.accent : COLORS.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
        {price || "—"}
      </div>
    </button>
  );
}

function PaywallScreen({ onBack, onBuy, onRestore, busy, message, offers, trialDays }) {
  const [plan, setPlan] = useState("annual");
  const annual = offers && offers.annual;
  const monthly = offers && offers.monthly;
  const days = trialDays || 7;

  return (
    <div style={{ padding: "20px 24px 40px", display: "flex", flexDirection: "column", minHeight: "100vh", boxSizing: "border-box" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, color: COLORS.textDim, fontSize: 12.5, fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", marginBottom: 30, alignSelf: "flex-start" }}>
        <ChevronLeft size={16} /> Home
      </button>

      <div style={{ width: 60, height: 60, borderRadius: 16, background: hexToRgba(COLORS.accent, 0.12), border: `1px solid ${COLORS.accent}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, marginBottom: 20 }}>
        <Dumbbell size={28} />
      </div>
      <div style={{ color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 26, textTransform: "uppercase", lineHeight: 1.15, marginBottom: 10 }}>
        {days} days free
      </div>
      <div style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
        Everything unlocked for {days} days. Cancel any time in Google Play and you will not be charged. No ads, no account, and nothing leaves your phone.
      </div>

      <PlanCard
        label="Annual"
        price={annual && annual.price}
        note="Billed once a year"
        badge="Best value"
        selected={plan === "annual"}
        onSelect={() => setPlan("annual")}
      />
      <PlanCard
        label="Monthly"
        price={monthly && monthly.price}
        note="Billed every month"
        selected={plan === "monthly"}
        onSelect={() => setPlan("monthly")}
      />

      {/* The same table shown on first launch, so what the subscription
          buys is the same answer at both ends of the trial. */}
      <div style={{ margin: "12px 0 22px" }}>
        <TierTable />
      </div>

      <button
        onClick={() => onBuy(plan)}
        disabled={busy}
        style={{ width: "100%", background: COLORS.accent, border: "none", borderRadius: 14, padding: "17px 0", color: COLORS.onAccent, fontFamily: "'Oswald', sans-serif", fontSize: 16, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}
      >
        {busy ? "Working…" : `Start ${days}-Day Free Trial`}
      </button>
      <button
        onClick={onRestore}
        disabled={busy}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "15px 0", color: COLORS.text, fontFamily: "'Oswald', sans-serif", fontSize: 13.5, textTransform: "uppercase" }}
      >
        <RotateCcw size={14} /> Restore Subscription
      </button>
      {message && <div style={{ marginTop: 14, color: COLORS.textDim, fontSize: 12.5, textAlign: "center" }}>{message}</div>}
      <div style={{ marginTop: 16, color: COLORS.textDim, fontSize: 11, lineHeight: 1.55, textAlign: "center", opacity: 0.85 }}>
        Renews automatically until cancelled. Manage or cancel in Google Play at any time.
        Your workouts stay on your phone whether you subscribe or not, and Backup in Settings
        always works.
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreenRaw] = useState("home");
  const [split, setSplit] = useState(null);
  const [selection, setSelection] = useState({});
  const [presetExercises, setPresetExercises] = useState(null);
  // Superset groups carried in from a copied session. Cleared alongside
  // every other way of seeding a workout so a copied pairing can never
  // leak into an unrelated one.
  const [presetSupersets, setPresetSupersets] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [newPBs, setNewPBs] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [workoutOrigin, setWorkoutOrigin] = useState("select");
  const [appendMobility, setAppendMobility] = useState(true);
  const [oneRMTest, setOneRMTest] = useState(null);
  const [onermOrigin, setOnermOrigin] = useState("home");
  const [programmeCtx, setProgrammeCtx] = useState(null);
  const [statsProgramme, setStatsProgramme] = useState(null);
  const [statsIsFinished, setStatsIsFinished] = useState(false);
  const [doneProgrammeInfo, setDoneProgrammeInfo] = useState(null);
  const [homeReload, setHomeReload] = useState(0);
  const [currentProgramme, setCurrentProgramme] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [whatsNew, setWhatsNew] = useState(null); // release notes to show once after an update
  const [tourStep, setTourStep] = useState(0);
  const [showFeatureListHint, setShowFeatureListHint] = useState(false);
  const [license, setLicense] = useState(null);
  const [offers, setOffers] = useState(null);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState("");

  const activeProgrammeMeta = currentProgramme
    ? { name: currentProgramme.name, nextDayName: currentProgramme.days[programmeNextIndex(currentProgramme)] ? currentProgramme.days[programmeNextIndex(currentProgramme)].name : "" }
    : null;

  const unlocked = isLicenseUnlocked(license);

  // The only place navigation is gated: while locked (trial over, not
  // purchased) and not mid-tour, anything outside ALLOWED_WHEN_LOCKED_SCREENS
  // redirects to the paywall instead. Every existing onClick handler in this
  // file already calls setScreen(...), so this wrapper is the only change
  // needed to make the whole app respect the trial/purchase gate.
  function setScreen(target) {
    if (!showTour && !unlocked && !ALLOWED_WHEN_LOCKED_SCREENS.has(target)) {
      setScreenRaw("paywall");
      return;
    }
    setScreenRaw(target);
  }

  async function chooseMode(mode) {
    const next = { ...settings, appMode: mode === "advanced" ? "advanced" : "simple" };
    setSettings(next);
    await safeSet("settings", next);
    await safeSet("mode-chosen", true);
    setShowWelcome(false);
    setTourDemoData(true);
    setShowTour(true);
  }

  useEffect(() => {
    async function init() {
      await runMigrations();
      await loadCustomExercises();
      // After the customs, so an edit to one lands on the entry it belongs
      // to; before the order, so a moved exercise is ranked under the muscle
      // it moved to rather than the one it left.
      await loadExerciseEdits();
      await loadPausedExercises();
      await loadHiddenExercises();
      await loadManualOrderMuscles();
      // Must run after custom exercises are registered, so a saved order
      // that includes them positions them correctly rather than appending.
      await loadExerciseOrder();
      const savedSettings = await safeGet("settings");
      if (savedSettings) {
        const merged = { ...DEFAULT_SETTINGS, ...savedSettings, weightUnit: "kg" };
        // Before setSettings, so the first paint is already in the right
        // palette rather than flashing the standard one and correcting.
        applyTheme(merged.theme, merged.colourScheme, merged.highContrast);
        setSettings(merged);
      }
      const active = await getActiveProgramme();
      setCurrentProgramme(active);
      const tourSeen = await safeGet("tour-seen");
      // Simple vs Advanced is asked before anything else on a first run.
      // Buried in Settings, Advanced Mode went unfound, and the tour kept
      // describing features the user had switched off without knowing.
      // The tour starts once the choice is made (see chooseMode).
      if (!tourSeen) {
        if (await safeGet("mode-chosen")) {
          setTourDemoData(true);
          setShowTour(true);
        } else {
          setShowWelcome(true);
        }
      }

      // First launch after an update gets the changelog. A brand-new install
      // does not: the tour is its introduction, and notes for a release it
      // never ran are just noise. Recording the version either way means the
      // next real update is the first changelog anyone sees.
      //
      // "Existing user" is decided by tour-seen, not by a recorded version:
      // the version key did not exist before 1.1.0, so everyone upgrading
      // from an older build has no version stored and would otherwise be
      // mistaken for a first install and shown nothing.
      const seenVersion = await safeGet(LAST_SEEN_VERSION_KEY);
      if (seenVersion !== APP_VERSION) {
        const notes = releaseNotesFor(APP_VERSION);
        if (notes && tourSeen) setWhatsNew(notes);
        await safeSet(LAST_SEEN_VERSION_KEY, APP_VERSION);
      }

      const lic = await loadLicense();
      setLicense(lic);
      // Nothing to sell in a give-away build, so the store is never even
      // contacted — a side-loaded APK has no Play Billing connection to
      // make anyway.
      if (!UNLOCKED_BUILD) {
        initBilling(
          async (entitled) => {
            // Play's answer is authoritative in both directions: this is
            // what re-locks the app when a subscription lapses, not just
            // what unlocks it when one starts.
            const next = await setLicenseEntitled(entitled);
            setLicense(next);
          },
          (found) => setOffers(found),
        );
      }
      if (!isNativeRuntime()) {
        // Dev-only escape hatches so the paywall flow can be exercised
        // outside a packaged APK, where Play Billing never runs. Not wired
        // to any UI — call from the browser console.
        window.__ironlogDevUnlock = async () => {
          const next = await setLicenseEntitled(true);
          setLicense(next);
        };
        window.__ironlogDevLock = async () => {
          const next = await setLicenseEntitled(false);
          setLicense(next);
        };
        window.__ironlogDevOffers = (o) => setOffers(o || {
          annual: { planId: "annual", price: "£9.99", trialDays: 7 },
          monthly: { planId: "monthly", price: "£1.99", trialDays: 7 },
        });
      }

      setDbReady(true);
    }
    init();
    registerServiceWorker();

    // Make sure the viewport honors device safe areas (notch / status bar /
    // Dynamic Island) so fixed top content like TopBar doesn't render
    // underneath system UI and become hard to tap.
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
  }, []);

  // Drives navigation as the tour advances — see the TOUR_STEPS comment
  // for why "workoutPreview" maps to a dedicated preview screen instead
  // of the real "workout" screen.
  useEffect(() => {
    if (!showTour) return;
    const step = TOUR_STEPS[tourStep];
    setScreenRaw(step.screen === "workoutPreview" ? "tourWorkoutPreview" : step.screen);
  }, [showTour, tourStep]);

  // The moment the app becomes unlocked (purchase completes, or restore
  // succeeds) while the paywall is showing, drop straight back to Home.
  useEffect(() => {
    if (screen === "paywall" && isLicenseUnlocked(license)) setScreenRaw("home");
  }, [license, screen]);

  async function updateSettings(next) {
    // The palette lives in a module object every screen reads while it
    // paints, so it has to be rewritten before React re-renders rather than
    // passed down as state.
    applyTheme(next.theme, next.colourScheme, next.highContrast);
    setSettings(next);
    await safeSet("settings", next);
  }

  async function closeTour() {
    // Turn the sample data off before anything re-reads, and bump the Home
    // reload key so a Home screen that is already mounted refetches the
    // user's real (empty) history instead of keeping the example on screen.
    setTourDemoData(false);
    setShowTour(false);
    setTourStep(0);
    setScreenRaw("home");
    setHomeReload((n) => n + 1);
    await safeSet("tour-seen", true);
    const hintShown = await safeGet("feature-list-hint-shown");
    if (!hintShown) {
      setShowFeatureListHint(true);
      await safeSet("feature-list-hint-shown", true);
    }
  }
  function replayTour() {
    setTourDemoData(true);
    setTourStep(0);
    setShowTour(true);
  }

  // The feature-list nudge is shown exactly once, right after the tour
  // closes (see closeTour) — auto-dismiss it so it doesn't linger forever
  // if the user doesn't tap it away themselves.
  useEffect(() => {
    if (!showFeatureListHint) return;
    const t = setTimeout(() => setShowFeatureListHint(false), 7000);
    return () => clearTimeout(t);
  }, [showFeatureListHint]);

  async function handleBuy(planKey) {
    setPurchaseMsg("");
    if (!isNativeRuntime()) {
      setPurchaseMsg("Subscribing only works in the installed app, not in a browser preview.");
      return;
    }
    setPurchaseBusy(true);
    const result = await subscribe(planKey);
    setPurchaseBusy(false);
    if (!result.ok) setPurchaseMsg("That didn't go through. Please try again.");
  }

  async function handleRestore() {
    setPurchaseMsg("");
    if (!isNativeRuntime()) {
      setPurchaseMsg("Restore only works in the installed app, not in a browser preview.");
      return;
    }
    setPurchaseBusy(true);
    const ok = await restorePurchases();
    setPurchaseBusy(false);
    if (ok && !isLicenseUnlocked(license)) {
      setPurchaseMsg("No active subscription found for this Google account.");
    } else if (!ok) {
      setPurchaseMsg("Couldn't restore — check your Google Play account and try again.");
    }
  }

  function startProgrammeDay(day, programme) {
    setSplit(day.name);
    setSelection({});
    setPresetExercises(day.exercises.map((e) => ({ id: e.id, muscle: e.muscle, method: e.method || null })));
    setPresetSupersets(null);
    setResumeData(null);
    setProgrammeCtx({ programmeId: programme.id, dayKey: day.key, dayName: day.name });
    setAppendMobility(false);
    setWorkoutOrigin("programme");
    setScreen("workout");
  }

  async function createProgramme(programme) {
    const active = await getActiveProgramme();
    if (active) await archiveActiveProgramme(true);
    await saveActiveProgramme(programme);
    setCurrentProgramme(programme);
    setHomeReload((n) => n + 1);
    setScreen("programme");
  }

  async function finishActiveProgrammeFlow() {
    const active = await getActiveProgramme();
    if (!active) { setScreen("home"); return; }
    const endedEarly = programmeCompleted(active) < programmePlanned(active);
    const finished = await archiveActiveProgramme(endedEarly);
    setCurrentProgramme(null);
    setHomeReload((n) => n + 1);
    setStatsProgramme(finished);
    setStatsIsFinished(true);
    setScreen("programmeStats");
  }

  async function handleWorkoutFinished(pbs) {
    setNewPBs(pbs || []);
    if (programmeCtx) {
      const active = await getActiveProgramme();
      setCurrentProgramme(active);
      if (active) {
        const done = programmeCompleted(active);
        const planned = programmePlanned(active);
        const nextIdx = programmeNextIndex(active);
        const nextDay = active.days[nextIdx];
        setDoneProgrammeInfo({
          name: active.name,
          week: programmeWeekNumber(active),
          weeks: active.weeks,
          done,
          planned,
          nextDayName: nextDay ? nextDay.name : "",
          complete: done >= planned,
        });
      } else {
        setDoneProgrammeInfo(null);
      }
    } else {
      setDoneProgrammeInfo(null);
    }
    setProgrammeCtx(null);
    setPresetExercises(null);
    setPresetSupersets(null);
    setResumeData(null);
    setHomeReload((n) => n + 1);
    setScreen("done");
  }

  if (!dbReady) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: COLORS.textDim, fontFamily: "'Oswald', sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        maxWidth: 412,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        button { cursor: pointer; background: none; border: none; color: inherit; font: inherit; padding: 0; }
      `}</style>

      {screen === "home" && (
        <HomeScreen
          settings={settings}
          reloadKey={homeReload}
          activeProgramme={currentProgramme}
          subscribed={isLicenseUnlocked(license)}
          graceDaysLeft={UNLOCKED_BUILD ? null : offlineGraceDaysLeft(license)}
          onViewPaywall={() => setScreenRaw("paywall")}
          onStart={() => setScreen("startChoice")}
          onViewHistory={() => setScreen("history")}
          onOpenProgramme={() => setScreen("programme")}
          onStartProgrammeDay={(day, programme) => startProgrammeDay(day, programme)}
          onViewProgrammeStats={(prog) => { setStatsProgramme(prog); setStatsIsFinished(true); setScreen("programmeStats"); }}
          onNewProgramme={() => setScreen("programmeBuilder")}
          onViewPB={() => setScreen("pb")}
          onViewProgress={() => setScreen("progress")}
          onViewSettings={() => setScreen("settings")}
          onViewSuggested={() => setScreen("suggested")}
          onViewVolume={() => setScreen("volume")}
          onViewStreak={() => setScreen("streak")}
          onViewExerciseDb={() => setScreen("exerciseDb")}
          onViewOneRM={() => {
            setOnermOrigin("home");
            setScreen("onerm");
          }}
          onResumeWorkout={(snapshot) => {
            setSplit(snapshot.split);
            setResumeData(snapshot);
            setProgrammeCtx(snapshot.programmeCtx || null);
            setPresetExercises(null);
            setPresetSupersets(null);
            setWorkoutOrigin("home");
            setScreen("workout");
          }}
          onStartTemplate={(t) => {
            setSplit(t.split);
            setResumeData(null);
            setWorkoutOrigin("home");
            setAppendMobility(true);
            if (t.mode === "specific") {
              setSelection({});
              setPresetExercises(t.exercises);
              setPresetSupersets(null);
            } else {
              setSelection(t.selection);
              setPresetExercises(null);
              setPresetSupersets(null);
            }
            setScreen("workout");
          }}
        />
      )}

      {screen === "startChoice" && (
        <StartChoiceScreen
          hasActive={!!activeProgrammeMeta}
          activeName={activeProgrammeMeta ? activeProgrammeMeta.name : ""}
          nextDayName={activeProgrammeMeta ? activeProgrammeMeta.nextDayName : ""}
          onContinue={() => setScreen("programme")}
          onNew={() => setScreen("programmeBuilder")}
          onFree={() => setScreen("split")}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "programmeBuilder" && (
        <ProgrammeBuilderScreen
          onBack={() => setScreen("startChoice")}
          onCreate={createProgramme}
          onGuided={() => setScreen("programmeGuided")}
        />
      )}

      {screen === "programmeGuided" && (
        <GuidedProgrammeWizard
          onBack={() => setScreen("programmeBuilder")}
          onDecline={() => setScreen("programmeBuilder")}
          onCreate={createProgramme}
        />
      )}

      {screen === "programme" && (
        <ProgrammeScreen
          programme={currentProgramme}
          onBack={() => setScreen("home")}
          onStartDay={(day, programme) => startProgrammeDay(day, programme)}
          onProgrammeChange={setCurrentProgramme}
          onFinishProgramme={finishActiveProgrammeFlow}
          onViewStats={(prog) => { setStatsProgramme(prog); setStatsIsFinished(false); setScreen("programmeStats"); }}
        />
      )}

      {screen === "programmeStats" && statsProgramme && (
        <ProgrammeStatsScreen
          programme={statsProgramme}
          isFinished={statsIsFinished}
          onBack={() => setScreen(statsIsFinished ? "home" : "programme")}
          onHome={() => setScreen("home")}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          settings={settings}
          onChange={updateSettings}
          onBack={() => setScreen("home")}
          onViewColour={() => setScreen("colour")}
          onReplayTour={replayTour}
          onViewFeatureList={() => setScreen("featureList")}
          onViewWhatsNew={() => setWhatsNew(releaseNotesFor(APP_VERSION))}
          license={license}
          onBuy={handleBuy}
          onRestore={handleRestore}
          purchaseBusy={purchaseBusy}
          purchaseMsg={purchaseMsg}
        />
      )}

      {screen === "colour" && (
        <ColourScreen
          settings={settings}
          onChange={updateSettings}
          onBack={() => setScreen("settings")}
        />
      )}

      {screen === "featureList" && <FeatureListScreen onBack={() => setScreen("settings")} />}

      {screen === "exerciseDb" && <ExerciseDatabaseScreen onBack={() => setScreen("home")} />}

      {screen === "tourWorkoutPreview" && <TourWorkoutPreviewScreen />}

      {screen === "paywall" && (
        <PaywallScreen
          onBack={() => setScreenRaw("home")}
          onBuy={handleBuy}
          onRestore={handleRestore}
          busy={purchaseBusy}
          message={purchaseMsg}
          offers={offers}
          trialDays={(offers && ((offers.annual && offers.annual.trialDays) || (offers.monthly && offers.monthly.trialDays))) || 7}
        />
      )}

      {screen === "suggested" && (
        <SuggestedScreen
          onBack={() => setScreen("home")}
          onBuild={(list) => {
            setSplit("Suggested");
            setPresetExercises(list);
            setPresetSupersets(null);
            setResumeData(null);
            setWorkoutOrigin("suggested");
            setAppendMobility(true);
            setScreen("workout");
          }}
        />
      )}

      {screen === "split" && (
        <SplitScreen
          onBack={() => setScreen("home")}
          onPick={(s) => {
            setSplit(s);
            setPresetExercises(null);
            setPresetSupersets(null);
            setResumeData(null);
            setWorkoutOrigin("select");
            setScreen("select");
          }}
          onCopyPrevious={() => setScreen("copyPrevious")}
          onOneRMSession={() => {
            setOnermOrigin("split");
            setScreen("onerm");
          }}
        />
      )}

      {screen === "copyPrevious" && (
        <CopyPreviousScreen
          onBack={() => setScreen("split")}
          onPick={(session) => {
            setSplit(session.split);
            setPresetExercises(session.exercises);
            setPresetSupersets(session.supersets || null);
            setResumeData(null);
            setWorkoutOrigin("copyPrevious");
            setAppendMobility(false);
            setScreen("workout");
          }}
        />
      )}

      {screen === "select" && (
        <SelectScreen
          split={split}
          settings={settings}
          onBack={() => setScreen("split")}
          onContinue={(sel) => {
            setSelection(sel);
            setPresetExercises(null);
            setPresetSupersets(null);
            setResumeData(null);
            setWorkoutOrigin("select");
            setAppendMobility(true);
            setScreen("workout");
          }}
          onContinueSpecific={(list) => {
            setPresetExercises(list);
            setPresetSupersets(null);
            setResumeData(null);
            setWorkoutOrigin("select");
            setAppendMobility(true);
            setScreen("workout");
          }}
        />
      )}

      {screen === "workout" && (
        <WorkoutScreen
          key={resumeData ? `resume-${resumeData.startedAt}` : `${split}-${presetExercises ? "preset" : "fresh"}`}
          split={split}
          selection={selection}
          presetExercises={presetExercises}
          presetSupersets={presetSupersets}
          resumeData={resumeData}
          settings={settings}
          appendMobility={appendMobility}
          programmeCtx={programmeCtx}
          onBack={() => setScreen(workoutOrigin)}
          onFinish={handleWorkoutFinished}
        />
      )}

      {screen === "done" && <DoneScreen onHome={() => setScreen("home")} newPBs={newPBs} programmeInfo={doneProgrammeInfo} />}

      {screen === "history" && <HistoryScreen onBack={() => setScreen("home")} settings={settings} />}

      {screen === "pb" && <PersonalInfoScreen onBack={() => setScreen("home")} />}

      {screen === "progress" && <ProgressScreen onBack={() => setScreen("home")} />}

      {screen === "volume" && <VolumeScreen onBack={() => setScreen("home")} />}

      {screen === "streak" && <StreakScreen onBack={() => setScreen("home")} />}

      {screen === "onerm" && (
        <OneRMScreen
          settings={settings}
          onBack={() => setScreen(onermOrigin)}
          onGenerateWorkout={(exerciseId, target, isBodyweight) => {
            setOneRMTest({ exerciseId, target, isBodyweight });
            setScreen("onermWorkout");
          }}
        />
      )}

      {screen === "onermWorkout" && oneRMTest && (
        <OneRMWorkoutScreen
          exerciseId={oneRMTest.exerciseId}
          target={oneRMTest.target}
          isBodyweight={oneRMTest.isBodyweight}
          settings={settings}
          onBack={() => setScreen("onerm")}
          onDone={() => {
            setOneRMTest(null);
            setScreen("home");
          }}
        />
      )}

      {/* Above the tour in the tree but gated on it not running, so an
          update and a first launch can never stack on top of each other. */}
      {/* Ahead of everything: the mode choice is the first thing a new
          install shows, and the tour only begins once it is made. */}
      {showWelcome && <WelcomeScreen onChoose={chooseMode} />}

      {whatsNew && !showTour && (
        <WhatsNewScreen notes={whatsNew} onDismiss={() => setWhatsNew(null)} />
      )}

      {showTour && (
        <FeatureTour
          stepIndex={tourStep}
          onNext={() => setTourStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))}
          onPrev={() => setTourStep((s) => Math.max(0, s - 1))}
          onSkip={closeTour}
        />
      )}

      {showFeatureListHint && (
        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            maxWidth: 380,
            margin: "0 auto",
            zIndex: 180,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: COLORS.surface,
            border: `1px solid ${COLORS.accent}`,
            borderRadius: 14,
            padding: "14px 14px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 9, background: hexToRgba(COLORS.accent, 0.14), display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.accent, flexShrink: 0 }}>
            <BookOpen size={15} />
          </div>
          <div style={{ flex: 1, color: COLORS.text, fontSize: 12.5, lineHeight: 1.45 }}>
            Lost, or looking for something specific? Check <b>Feature List</b> in Settings first — every feature, explained.
          </div>
          <button onClick={() => setShowFeatureListHint(false)} style={{ color: COLORS.textDim, background: "transparent", border: "none", flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
