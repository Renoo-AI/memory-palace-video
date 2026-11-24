# MASTER PROMPT: "PALACE ONE-TAKE" (3D MEMORY PALACE VIDEO)
SECTION 0. HOW TO READ THIS PROMPT
====================================================================
This prompt is long on purpose. It is a full production bible.
Read all of it before writing any code.
Do not start building after Section 3. Every section contains rules you will be checked against at the end.

Priority of rules:
1. A rule marked NEVER or MUST is a hard rule. The video fails if it is broken.
2. A rule marked SHOULD is a strong default. Break it only with a written reason in report.md.
3. If two rules conflict, the one in the lower-numbered section wins.
4. If something is not covered, choose the most original option that still obeys the style.

Honesty rules for you, the agent:
- If you cannot do something, say so plainly.
- Never claim you checked something you did not check.
- Never claim a frame looks right unless you actually looked at it.
- Never invent facts for on-screen text. Only use claims present in the script (Section 12).
- Report fakes, shortcuts and failures in report.md.

Words used in this prompt:
- "Common" = what most YouTube 3D/motion explainers do today. We avoid it.
- "Palace" = the 3D house that the whole video takes place in.
- "One-take" = the camera never cuts. It travels.
- "On twos" = animation updates every second frame (stop-motion feel).

SECTION 1. ROLE
====================================================================
You are four people at once:
1. Art director. You decide the look and refuse anything generic.
2. 3D artist. You build every model from code, with no downloaded assets.
3. Cinematographer. You design one continuous camera path through the palace.
4. Creative developer. You make it all render deterministically to MP4.

You work alone. You test your own work frame by frame before showing it.

SECTION 2. THE MISSION
====================================================================
Build a YouTube video that teaches the MEMORY PALACE technique.
Length follows the narration audio (about three minutes).

The viewer MUST:
1. Be hooked in the first 3 seconds.
2. Memorize five absurd objects without trying.
3. Understand the memory palace technique.
4. Be tested at the end, and succeed.

THE BIG IDEA (this is the whole point):
The video IS a memory palace.
The camera walks one continuous route through one 3D house.
Every idea in the script lives in a room of that house.
The viewer does not watch cuts. They travel through a place.
That is exactly how the technique works, so the form proves the content.
At the end, the camera returns to the front door and the penguin is still standing there.

Success test:
Pause on any random frame. If it looks like a generic low-poly explainer, a neon sci-fi scene,
or a glossy Pixar knockoff, you failed. Rebuild.

SECTION 3. INPUTS YOU WILL RECEIVE
====================================================================
1. NARRATION AUDIO (mp3 or wav). This is the master clock. Everything syncs to it.
2. THE SCRIPT (Section 12).
3. FONT NAME from the user. If none is named, ask once. Do not guess a font.
4. Optional music file. If none, you generate a minimal sound bed (Section 11).

Missing input: state it in one line, choose the sensible default, continue.
Stop to ask only if the font is missing and you cannot proceed without it.

SECTION 4. OUTPUTS YOU MUST DELIVER
====================================================================
1. final.mp4: 1920x1080, 30 fps, H.264, yuv420p, AAC 48 kHz, -14 LUFS integrated.
2. thumbnail.png: 1280x720, same style, penguin with sunglasses at the front door, light scene.
3. shotlist.md: final shot list with REAL timestamps.
4. report.md: honest report (what worked, what you faked, what failed).
5. contact_sheet.png: one frame every 4 seconds in a grid.
6. The source project, runnable with one command.
7. Optional: preview_720.mp4 for fast review.

Vertical 9:16 is NOT required. Do not crop or stretch to make one.

SECTION 5. NON-NEGOTIABLE RULES (THE TOP 30)
====================================================================
LOOK
1. The scene is LIGHT. Bright daylight feel. Never dark mode, never night.
2. NO glow. NO bloom. NO neon. NO emissive halos. NO volumetric light shafts.
3. NO soft shadows. Shadows are hard-edged, flat, one tone darker than the surface.
4. NO realistic PBR gloss, no reflections, no HDR environment maps, no ray tracing look.
5. NO depth-of-field blur, NO motion blur, NO film grain, NO vignette, NO lens flare.
6. NO gradients on surfaces. Shading is flat color steps (toon bands).
7. Every object has a Coal outline made with the inverted-hull method.
8. Maximum palette is defined in Section 8.3. No extra colors.
9. NO textures from images. Only flat colors and procedural patterns made in code.
10. NO stock assets, NO downloaded models, NO emoji, NO icon packs.

CAMERA
11. ONE-TAKE: the camera never hard-cuts. Chapters link through physical travel or match-moves (Section 10.1).
12. Lens is a wide-ish 28 mm equivalent for rooms, 50 mm for object close-ups. No fisheye, no dutch tilt.
13. NO isometric camera. NO floating-island look. NO turntable spins of objects.
14. NO whip pans, NO shake, NO fake handheld. The camera is a steady dolly on invisible rails.
15. The horizon stays level. The only exceptions are the two straight-down map moments in S12 and S18, and the short upward tilt in S21.

MOTION
16. Animation is "on twos": 15 updates per second on a 30 fps timeline.
17. NO spring overshoot bounce. NO elastic easing.
18. Idle objects always boil: tiny rotation (+/- 0.6 deg) on twos. Nothing is perfectly still.
19. Rhythm follows the voice. Do not use a fixed beat.
20. One idea per shot. Hold every shot at least 1.8 seconds.

TEXT
21. Max 4 words as a headline at once.
22. Text lives IN the world (signs, stamped on walls, tags on objects) wherever possible.
23. Captions are word-synced, bottom strip, never over faces or objects.
24. Banned fonts: Cairo, Inter, Poppins, Montserrat, Roboto, Arial, Helvetica.

CONTENT
25. The five objects are exactly: penguin wearing sunglasses at the entrance, giant banana on the sofa,
    refrigerator filled with diamonds, crocodile brushing its teeth in the bathroom,
    elephant jumping on the bed. No substitutions.
26. Order is fixed: entrance, living room, kitchen, bathroom, bedroom.
27. The final test shot MUST show the penguin first. It is the answer.
28. The study claim (2017, six weeks, still detectable four months later) is shown exactly as scripted. No extra numbers.
29. NO moral commentary, NO extra facts, NO invented statistics.
30. You MUST visually verify frames before claiming success.

SECTION 6. TECH STACK AND PROJECT STRUCTURE
====================================================================
Preferred stack:
- three.js for 3D, run inside headless Chromium (puppeteer or playwright).
- A deterministic frame renderer: renderFrame(frameIndex) draws exactly one frame.
- Frames saved as PNG, then ffmpeg encodes MP4.
- Whisper (or a forced aligner) for word-level timestamps.
- Python (numpy/scipy) for foley synthesis, or WebAudio OfflineAudioContext.
- ffmpeg for muxing, loudness (loudnorm), contact sheets.

Fallback stack (only if three.js headless rendering is impossible in the environment):
- Blender in background mode with Eevee or Workbench toon shading and Freestyle outlines.
- State the fallback in report.md.

GPU note:
- If there is no GPU, use ANGLE/SwiftShader in headless Chromium. It is slow. Plan for it.
- Do preview renders at 1280x720 and 15 fps first. Render final only after approval.
- Cache frames. Re-render only the frames that changed.

DETERMINISM (hard rule):
- Every frame is a pure function of (frameIndex, seed).
- No Math.random(). Use a seeded PRNG (mulberry32).
- No real-time clocks, no requestAnimationFrame timing, no CSS transitions.
- The same frame number always gives the same pixels.

Project structure:
```
palace-one-take/
  package.json
  README.md
  audio/
    narration.wav
    words.json                 (word-level timestamps)
    sfx/                       (generated foley wavs)
    mix.wav
  src/
    main.ts                    (entry, frame loop)
    clock.ts                   (frame <-> seconds <-> words)
    seed.ts                    (seeded PRNG)
    palette.ts                 (Section 8.3)
    render/
      toon.ts                  (toon material, gradient ramp)
      outline.ts               (inverted hull outlines)
      hardshadow.ts            (hard shadow setup)
      post.ts                  (flat post: color quantize only)
      twos.ts                  (on-twos time sampler)
    world/
      palace.ts                (house layout, rooms, doors)
      rooms/
        entrance.ts
        living.ts
        kitchen.ts
        bathroom.ts
        bedroom.ts
      dioramas/
        brainRoom.ts
        cellPlant.ts           (mitochondria power station)
        school.ts
        museum.ts
        supermarket.ts
        calendar.ts
    objects/
      penguin.ts
      sunglasses.ts
      banana.ts
      sofa.ts
      fridge.ts
      diamonds.ts
      crocodile.ts
      toothbrush.ts
      elephant.ts
      bed.ts
      walker.ts                (the viewer stand-in)
      headset.ts
    text/
      signs.ts                 (extruded text, tags, stamps)
      captions.ts              (word-synced captions)
    camera/
      path.ts                  (the one-take spline, keyframed)
      links.ts                 (chapter link moves)
    timeline.ts                (shots as data)
  scripts/
    align.py
    sfx.py
    render.js
    encode.sh
    contact_sheet.sh
    qa.py
```

Modeling rule: every model is built from primitives (box, cylinder, sphere, cone, lathe, extrude, icosahedron)
with deliberate vertex positions. Hand-placed. No random blobs. No marching cubes.

SECTION 7. PROCESS (DO NOT SKIP PHASES)
====================================================================
PHASE A. Setup
- Install dependencies.
- Create the structure.
- Prove the pipeline: render one frame with a flat cube and an outline. Look at it.

PHASE B. Align
- Run word-level alignment on narration.wav. Save words.json: {word, start, end}.
- Mark every pause longer than 0.35 s as a "breath". Camera arrivals land on breaths.
- Compare the aligned text with Section 12. Report mismatches.

PHASE C. Plan
- Produce shotlist.md from Section 10 using REAL timestamps.
- For each shot: id, start, end, the one idea, camera move, link type, sound cue.
- Run the ORIGINALITY CHECK (Section 13) on every shot.

PHASE D. Look-dev (stop here and show the user)
- Build exactly 3 frames: (1) the entrance with the penguin, (2) the kitchen with the diamond fridge,
  (3) the mitochondria power station.
- Render PNGs. Show them. Wait for approval.
- If the user does not answer, continue with the most reasonable reading and say so in report.md.

PHASE E. Build
- Build the palace layout first (greybox with real dimensions).
- Then the camera path through the greybox. Check the route works with no clipping.
- Then models, one room at a time. After each room render 3 stills and inspect them.
- Then dioramas.
- Then text, captions.

PHASE F. Animate
- Animate on twos. Sync every key action to a word timestamp (Section 10 lists the sync words).

PHASE G. Sound
- Generate foley. Place cues. Mix under the voice. Normalize.

PHASE H. Render and QA
- Preview render. Run qa.py. Inspect 20 random frames and every link move.
- Fix. Final render. Encode. Contact sheet.

PHASE I. Deliver
- Files from Section 4. Write report.md.

SECTION 8. THE STYLE BIBLE: "PALACE ONE-TAKE"
====================================================================
8.1 THE LOOK IN ONE SENTENCE
--------------------------------------------------------------------
A bright, flat-shaded, hand-built toy-theatre house: chunky shapes, thick Coal outlines,
two-step cel shading, hard flat shadows, warm cream walls, a few saturated colors,
and absolutely no glow.

Think: a ceramic toy house photographed in afternoon sun, then drawn with a marker.
Not: a game engine render. Not: a neon tech scene. Not: a glossy animated-movie render.

8.2 SCALE AND PROPORTION
--------------------------------------------------------------------
- Units: 1 unit = 1 meter.
- The Palace is a real-size house. Doors are 2.1 m tall. Ceiling 2.7 m.
- Objects are exaggerated, not realistic: chunky, rounded, oversized hands/feet/heads.
- The five memory objects are drawn at 1.4x to 3x the size they would be in real life, so they dominate the room.
  The giant banana is truly giant (2.2 m long). The elephant is big enough to nearly touch the ceiling when jumping.
- Everything has a visible bevel radius of about 2 cm. No razor-sharp edges.

8.3 PALETTE (THE ONLY COLORS ALLOWED)
--------------------------------------------------------------------
Neutrals:
- Cream wall        #F5EEDD   shade step  #E4D9BF
- Floor wood        #DDBD8F   shade step  #C6A074
- Ceiling           #FAF5E8   shade step  #E9E0CA
- Coal (outlines)   #1E1B18
- Paper-white       #FFFDF6   (highlights only, never pure white)

Accents (each has a base and a shade step that is darker and slightly more saturated):
- Tomato   #E8472F   shade #C2301C
- Cobalt   #2F4FD1   shade #2238A3
- Mustard  #F0B72A   shade #CC9215
- Leaf     #4FA36B   shade #36804F
- Lilac    #B8A8CC   shade #9686AF
- Sky      #9FD3E6   shade #6FB1CB

Rules:
- Walls and floors use Neutrals only. Accents are for objects and signs.
- Each room has ONE dominant accent so the viewer can tell rooms apart at a glance:
  Entrance = Cobalt, Living room = Mustard, Kitchen = Sky, Bathroom = Leaf, Bedroom = Tomato.
  (Lilac is reserved for the elephant and for the "brain" scenes.)
- Do not invent hex values outside this list. If you need a tone, use the shade step.
- Sunglasses lenses are Coal, with one Paper-white flat highlight shape. No reflections.

8.4 TOON SHADING
--------------------------------------------------------------------
- Use a custom ShaderMaterial or MeshToonMaterial with a gradient map of exactly 2 steps (base, shade).
- A third step ("highlight") is allowed ONLY on the five memory objects, as a small flat Paper-white shape.
- Light direction is fixed for the whole video: a single directional light from upper-left-front.
  It never moves, so shading stays consistent while the camera travels.
- The ambient term is constant. No light probes. No environment lighting.
- Shade steps come from the palette's shade color, not from darkening with black.

8.5 OUTLINES
--------------------------------------------------------------------
- Method: inverted hull. Duplicate the mesh, flip normals, scale along normals by an outline width,
  render back faces in Coal.
- Outline width: 3 px at 1080p for objects, 2 px for room architecture, 1.5 px for small details.
  Use a screen-space width so lines stay constant when the camera moves.
- Outlines vary slightly: modulate width +/- 25% using a seeded noise along the mesh, refreshed on twos.
  This gives the hand-drawn "boil".
- Hidden creases: add inner crease lines only where a form would otherwise read as a blob
  (between the penguin's belly and wings, between the crocodile's jaw and snout).
- NEVER outline the floor planes. Floors are defined by shade steps and a thin baseboard.

8.6 SHADOWS
--------------------------------------------------------------------
- Directional light shadow map with NO soft filtering (nearest sampling).
- Shadow color = surface shade step. Not black. Not transparent black.
- Shadow map size at least 4096 for room shots, tightly fit to the visible room to avoid blocky edges.
- Contact shadows under objects are a flat darker ellipse with a hard edge (a "decal"), 15% larger than the footprint.
- Ambient occlusion is forbidden. No SSAO. No screen-space anything.

8.7 SURFACE DETAIL WITHOUT TEXTURES
--------------------------------------------------------------------
Allowed procedural details (made in code, flat colors only):
- Wood planks: alternating floor planks with 3 px Coal-tint gap lines (use the floor shade step, not Coal).
- Wallpaper: a sparse repeating motif per room (dots, stripes, tiny diamonds) in the room's accent at low coverage.
- Tile pattern in bathroom and kitchen: a checker of Paper-white and Sky/Leaf.
- Fabric: sofa and bed use two-tone stripes, never noise.
- Halftone dots: allowed as a shadow texture on large shaded areas, 8 px pitch, 45 deg angle.
Forbidden: wood grain photos, marble, noise textures, bump maps, normal maps.

8.8 POST PROCESSING
--------------------------------------------------------------------
Allowed: color quantization to the palette (soft snap to the nearest palette color, strength 0.5),
and a 1-pixel edge cleanup for outlines.
Forbidden: bloom, glow, blur, vignette, chromatic aberration, film grain, tone mapping looks, LUT grading,
sharpen, any "cinematic" filter.
The final image must have clean flat color areas. Zoom to 400% on a wall: it should be flat cream.

8.9 MOTION LANGUAGE
--------------------------------------------------------------------
Animation is sampled on twos:
- Compute the pose for time t, but quantize t to steps of 1/15 s for characters and objects.
- The camera is quantized to steps of 1/30 s (smooth). Only the world animates on twos.
  This keeps the camera glide elegant and the world handmade.

Allowed motion types:
- STEP: moves in visible increments.
- SLAM: heavy drop, 2 frames of impact squash (scale Y 0.88 then back, no overshoot), 3 frames of small camera-free shake of the object only.
- WOBBLE: a rotation oscillation that decays linearly, never exponentially, max 3 swings.
- PUPPET: limbs move from pose to pose with 3 to 5 key poses per action. Hold poses for 2 frames minimum.
- DRAG: an object lags behind its target then arrives.
Forbidden: spring physics, elastic, overshoot, rubbery squash on everything, motion blur.

Idle life:
- Every object has a "boil": rotate +/- 0.6 degrees on twos around its main axis.
- Penguin blinks every 2 to 3 seconds (sunglasses stay on; the beak twitches instead).
- Diamonds shimmer by swapping which facet shows the Paper-white highlight, every 6 frames. No glow.

8.10 CHARACTERS
--------------------------------------------------------------------
THE WALKER (the viewer's stand-in)
- A neutral bean-shaped mannequin, Lilac, no face, a small Cobalt scarf.
- Height 1.7 m. Arms are short mittens. Feet are blocky.
- Used in third-person scenes: walking the route, studying biology, etc.
- In the opening walk the camera IS the Walker's eyes (first-person). The Walker is not drawn.
- The Walker never speaks, never gestures to the camera, never has a facial expression.

THE FIVE OBJECTS
- Specified in Section 9.
- They have personality through ONE behavior each (Section 9).

NO OTHER CHARACTERS. Exceptions: the mitochondria workers (instanced tiny bean workers), the five Walker clones in S14, and the tiny Walker in S31.

8.11 TYPOGRAPHY IN 3D
--------------------------------------------------------------------
Font: the one named by the user. Banned fonts in Rule 24.
Build 3D text by converting font glyph paths to extruded geometry (opentype.js path -> THREE.ExtrudeGeometry),
depth 0.04 m, bevel 0.006 m, Coal outline like every object.

Four text treatments (pick one per text, never mix):
1. SIGN: letters on a hanging wooden sign or a door plaque.
2. STAMP: letters pressed onto a wall or floor, flat, Tomato or Cobalt, slightly rough edge.
3. TAG: a paper tag tied to an object with a string, swaying on twos.
4. BLOCK: chunky letter blocks stacked like toys.
Rules:
- Max 4 words per text.
- Text color: Coal, Tomato or Cobalt on cream. Mustard only as a plate behind Coal text.
- Text is always readable at 1080p and at phone size: minimum letter height 6% of frame height.
- Text never floats in empty space. It is always attached to something in the world.
- Text appears by being placed, stamped or hung, never by fading or flying in.

8.12 CAPTIONS
--------------------------------------------------------------------
- Word-synced from words.json. Show 3 to 6 words at a time, grouped by phrase and breath.
- Position: bottom center, inside the bottom 12% of the frame.
- Style: flat Cream strip with a 3 px Coal outline, Coal text, the currently spoken word underlined by a Tomato bar.
- No bouncing, no scaling per word, no karaoke colors.
- Hide captions during the final test shot's silent beat (Section 10, shot S38).

8.13 WHAT MAKES THIS DIFFERENT FROM THE COMMON KIT
--------------------------------------------------------------------
Common kit: dark scenes, glow, isometric cutaways, floating islands, glossy plastic, orbit camera around an object,
whoosh transitions, kinetic text flying in, stock footage montage.
Ours: bright toy-theatre house, hand-drawn outlines, one continuous camera walk, stop-motion character animation,
text that physically exists in the world, foley sound, no cuts.
If a shot starts to feel like the common kit, rebuild it.

SECTION 9. THE PALACE (WORLD, ROUTE, OBJECTS)
====================================================================
9.1 FLOOR PLAN (REAL COORDINATES)
--------------------------------------------------------------------
Coordinates in meters. X right, Y up, Z toward the camera at the start. Origin at the front door threshold.
The route is a single line through the house. Walls have door openings exactly where the route passes.

Rooms (width x depth):
- ENTRANCE HALL   3.0 x 3.0   centered at (0, 0, -1.5)
- LIVING ROOM     5.0 x 4.5   centered at (0, 0, -5.25)
- KITCHEN         4.0 x 4.0   centered at (5.0, 0, -5.25)   (reached through a door on the living room's east wall)
- BATHROOM        3.0 x 3.0   centered at (5.0, 0, -9.0)    (door on the kitchen's north wall)
- BEDROOM         4.5 x 4.5   centered at (0, 0, -9.0)      (door on the bathroom's west wall)
Door width 1.1 m, height 2.1 m. Door frames are Cobalt-shade Cream with Coal outlines.

The route, in order:
R0 outside, 4 m in front of the door, camera height 1.6 m
R1 front door threshold
R2 hall center, penguin at (0, 0, -2.4)
R3 living room west part
R4 the sofa, banana on it at (-1.2, 0.5, -6.6)
R5 the living room east door
R6 kitchen center, fridge at (6.6, 0, -7.0)
R7 kitchen north door
R8 bathroom center, sink at (5.0, 0.9, -10.2)
R9 bathroom west door
R10 bedroom, bed at (-1.2, 0, -10.5)
R11 bedroom, then the "lift out" move (Section 10, shot S09)

The roof and the facade are removed in dollhouse moments only (pull-out moves, Section 10).
During walkthrough shots the house is complete and closed.

9.2 THE FIVE OBJECTS (BUILD RECIPES)
--------------------------------------------------------------------
Each object: build recipe, ONE behavior, ONE sound signature, one anti-cliché note.

OBJECT 1. PENGUIN WEARING SUNGLASSES (entrance)
Build:
- Body: a lathe-profile egg, 1.3 m tall, Coal with a Cream belly shape cut as a second flat mesh slightly offset forward.
- Head merges with body (no neck), small Mustard beak (two squashed cones), Mustard feet (flat wedges).
- Flippers: two flat rounded boxes hinged at the shoulders, angled out 25 degrees.
- Sunglasses: two rounded-rectangle lenses (extruded, Coal) joined by a thin Coal bridge, a Paper-white flat highlight bar on each lens, temple arms hidden in the head.
  The sunglasses are the star. They are oversized: wider than the head by 15%.
Behavior: stands with a cool slow lean, rocks 4 degrees left, 4 degrees right, on twos. At the end of shot 6, it slides its sunglasses down 1 cm with a flipper, then pushes them back up.
Sound: a small plastic "tk" for the sunglasses, a soft flipper "pap".
Anti-cliché: no cartoon eyes under the glasses. No hat. No bowtie.

OBJECT 2. GIANT BANANA ON THE SOFA (living room)
Build:
- Sofa: Mustard-and-Cream striped, boxy, 2.2 m wide, rounded arm rests, 4 Coal-outlined button dots on the back.
- Banana: a curved extruded tube along a spline, 2.2 m long, radius 0.22 m, with 5 flat facets around the cross-section (like a real banana ridge).
  Mustard with a Mustard-shade side facet. A brown tip (use Coal at 100%) and a short stem.
  It lies across the sofa like a person lounging, one end on the armrest.
Behavior: it breathes: the whole banana scales Y by 1.5% on twos, slow, like sleeping. At the sync word it tips 3 degrees and the sofa cushions dip one step.
Sound: a sofa spring "creak" and a faint "squeak" on the dip.
Anti-cliché: no face on the banana. No peel on the floor slip gag.

OBJECT 3. REFRIGERATOR FILLED WITH DIAMONDS (kitchen)
Build:
- Fridge: 1.0 x 0.8 x 1.9 m, rounded box, Sky with a Cream door, a Coal handle, a small Mustard magnet.
- The door is OPEN at 80 degrees. Inside: three shelves (Cream) filled to overflow with diamonds.
- Diamond: a low-poly brilliant shape (icosahedron variants, 8 to 14 faces), faces flat-colored in Sky, Paper-white and Cobalt-shade in an alternating pattern, Coal outline.
  Size 6 to 14 cm. Use instancing, 120 diamonds.
  Several tumble out and sit on the floor.
Behavior: diamond highlight swap every 6 frames (shimmer without glow). One diamond falls off the top shelf and lands with a SLAM on the floor, no bounce.
Sound: glass "clink" notes, a pentatonic cluster, soft.
Anti-cliché: no sparkle stars. No light rays. No glow.

OBJECT 4. CROCODILE BRUSHING ITS TEETH (bathroom)
Build:
- Crocodile: Leaf green, long snout, 1.7 m body, sitting upright on its tail in front of the sink like a person.
  Snout built from a tapered box with a hinged lower jaw. Two bump eyes on top of the head.
  Teeth: 12 flat triangular teeth along the upper jaw edge and 10 on the lower, Cream, each outlined.
  Belly plates: stacked flat rounded rectangles in Leaf shade.
- Toothbrush: Tomato handle, Paper-white bristles block, held in a mitten-claw.
- Sink and mirror: Cream sink, round mirror on the wall showing the crocodile as a simple flat mirrored shape (no reflection, just a second drawn crocodile head, flat).
Behavior: brushing cycle of 4 key poses repeated every 8 frames, on twos. A tiny Paper-white foam shape grows at the mouth corner in 4 steps.
Sound: rhythmic bristle scrubbing, a tap drip.
Anti-cliché: no cartoon menace. It is serious, careful, polite.

OBJECT 5. ELEPHANT JUMPING ON THE BED (bedroom)
Build:
- Elephant: Lilac, 1.8 m tall, big ears (flat extruded shapes), a rounded trunk made from 6 stacked tapered cylinders so it can bend,
  small tusks Cream, Coal eyes, stubby legs.
- Bed: Tomato frame, Cream mattress with Tomato stripes, two pillows, a headboard with 3 arch cutouts.
Behavior: three jumps. Each jump: crouch (2 frames), rise to 1.1 m over 6 frames, hang 2 frames, fall 6 frames, impact SLAM on the mattress (mattress dips 12 cm for 3 frames), trunk lifts on the way up.
Sound: spring squeak sequence, a pitch-dropping trumpet blip on each landing.
Anti-cliché: no cartoon sweat drops, no motion lines.

9.3 THE BRAIN SCENES
--------------------------------------------------------------------
THE BRAIN ROOM (used when the script talks about "your brain")
- A small Lilac room, a single Cream armchair on a floor shaped like a brain top-view (flat extruded folds).
- The Walker sits in the chair. Above it, a floating cutout "memory map" made of small framed pictures of rooms hung on the wall.
- The pictures are tiny versions of the five rooms. They are real renders of the palace via a render-to-texture camera.

CHILDHOOD HOME
- A small house model (the Palace's silhouette from outside, shrunk) on a shelf, the Walker walks from its door to a window.
- Shown as a faded Cream-tone ghost: lines only, outline in Coal at 50% opacity, no fill. The only transparent thing in the video.

9.4 SECONDARY DIORAMAS
--------------------------------------------------------------------
Each diorama sits in a Cream glass-free shadowbox mounted on the wall of the Brain Room. The camera pushes into each.
- SCHOOL (for mathematics): a classroom with a blackboard (Coal board, Paper-white chalk lines), 6 desks, an oversized "+" and "=" as 3D blocks.
- MUSEUM (for history): a hall with columns, a dinosaur skeleton built from 14 white bones, a framed painting that is just 3 flat color blocks.
- SUPERMARKET (for a new language): 4 aisles, shelves with colored boxes, a shopping cart, each aisle labeled with a different word block.
Each diorama uses one accent only (School = Cobalt, Museum = Tomato, Supermarket = Leaf).

9.5 THE MITOCHONDRIA POWER STATION
--------------------------------------------------------------------
Placed in the KITCHEN (the script says "inside your kitchen"). It sits on the kitchen counter.
Build:
- A tiny factory 0.6 m wide: Mustard brick building, 3 chimneys, a pitched roof, a big Coal gear on the front, a Tomato door.
- A sign above the door: "ENERGY" (Block text).
- Workers: 2000 miniature bean workers, 1 cm tall, instanced, in 3 colors (Tomato, Cobalt, Mustard). They walk in lines on the counter, carrying small Mustard squares.
- Wires: 5 Coal cables run from the factory up the wall to the lamp. The lamp turns on as a flat Mustard cone shape, no glow, plus a 2-frame "flash" where the lamp shade swaps to Paper-white.
Behavior: workers walk in stepped lines (on twos). One worker drops a square, picks it up.
Sound: tiny crowd-of-footsteps patter, a clack of the gear.
Anti-cliché: no cell cross-section diagram. No glowing bolts. No "ATP" jargon.

9.6 THE STUDY CALENDAR
--------------------------------------------------------------------
For "six weeks of training ... still detectable four months later":
- A big wall calendar made of 3D blocks: 6 week-rows light up in Leaf, one row at a time, each stamped.
- Then the camera pulls back as the calendar page curls to a new calendar with 16 empty week-rows (about four months) and a single small Leaf flag at the end.
- Text: "6 WEEKS" stamped; then "4 MONTHS LATER" as a tag.
- Do not add a title, a journal name, or a number of participants. Only what the script says.

9.7 THE VR HEADSET JOKE
--------------------------------------------------------------------
For "you don't need to visualize everything as clearly as a real virtual reality headset":
- A generic headset built from a Cream box with two Coal lens circles and a Cobalt strap.
- It sits on a plinth. A Tomato "not required" stamp (a flat round stamp with a diagonal bar) presses onto the plinth.
- No brand shapes. No logos. Do not copy any real headset design.

SECTION 10. THE ONE-TAKE: CAMERA, LINKS AND SHOT LIST
====================================================================
10.1 LINK TYPES (HOW SHOTS CONNECT WITHOUT CUTS)
--------------------------------------------------------------------
Every shot connects to the next by one of these. Never use a plain cut. Never repeat the same link twice in a row.

L1 THRESHOLD
The camera passes through a doorway. The next room is already built and waiting. Slow, level, eye height 1.6 m.

L2 LIFT-OUT
The camera rises through the ceiling. The roof is a hinged panel that swings open on twos as the camera passes.
The house shrinks below until it is a model on a shelf in the Brain Room.

L3 FRAME-IN-FRAME
The next scene lives inside a picture frame or shadowbox on a wall. The camera pushes into the frame until its border leaves the screen.
The frame's inner scene must already be rendered at full quality while the camera approaches (no pop).

L4 WALL-WIPE
The camera slides close past a flat Cream wall so the wall fills the frame for 4 to 8 frames.
During that time, you may swap the scene behind it. Use at most 3 times in the whole video.

L5 PAGE-CURL
A calendar page or a book page curls up (a flat sheet rotating around its top edge on twos) and reveals the next scene beneath it.

L6 DESCENT
The reverse of the lift-out: the camera falls from the Brain Room, through the model's roof, back down to full house scale
and out to the street in front of the door, matching shot S01 exactly.

L7 OBJECT-FILL
An object fills the frame (a flat colored surface). The next scene starts on the same color. Match color and outline thickness.

Link rules:
- Link motion starts on a breath if one exists in the audio, never in the middle of a word.
- The camera path is one Catmull-Rom spline per chapter with look-at targets, keyed to seconds from words.json.
- Camera speed is slow and constant per move. No acceleration spikes. Quantize to 30 fps (smooth).
- Never go through geometry. Check every shot for wall clipping in the greybox pass.
- If a link would require breaking Rule 11 (no cut), you may use L4 only. Record every use in report.md.

10.2 SHOT FORMAT
--------------------------------------------------------------------
Each shot below lists:
- LINE: the narration it covers (use words.json for exact timing).
- VISUAL: what exists in the frame.
- CAMERA: the move.
- LINK OUT: how it connects to the next shot.
- SYNC: the word that triggers the key action (action must land within 2 frames of the word's start).
- SOUND: the foley cue.
Target duration is a guide. Real durations come from the audio.

10.3 CHAPTER 1: THE HOOK AND THE FIVE OBJECTS
--------------------------------------------------------------------

S01 HOOK
LINE: "I'm going to make you memorize five random objects without writing anything down."
VISUAL: The street in front of the house. A bright Cream facade, a Cobalt front door with a round Coal handle, a doorstep, one potted Leaf plant. Stamped on the door in Tomato: "5 OBJECTS".
CAMERA: Starts 4 m back at eye height. A slow dolly forward of 1.5 m over the sentence. Perfectly level.
LINK OUT: continues straight into S02 (no link needed, same move).
SYNC: "five" -> the stamp lands on the door with a SLAM (the door shakes 3 frames).
SOUND: a rubber stamp "thunk", a faint street bird, nothing else.
NOTE: frame 0 must be a strong, clean, readable image (it is also the thumbnail source).

S02 PROMISE
LINE: "And by the end of this video, you'll probably remember them without even trying."
VISUAL: Same door. The stamp stays. A small Mustard question tag (TAG text "TRY?" ) hangs from the handle and swings on twos.
CAMERA: dolly continues, ends 1 m from the door.
LINK OUT: L1 threshold (the door opens inward on its own).
SYNC: "without" -> the tag is pulled off the handle by an invisible hand and falls (SLAM, no bounce).
SOUND: a soft paper "flap" and a latch click as the door unlatches.

S03 OPEN THE DOOR
LINE: "Imagine opening the front door of your house."
VISUAL: First-person. The door swings in. The entrance hall is bright and Cobalt-themed: a coat hook rack, a Cobalt rug, a Cream console table.
CAMERA: pushes over the threshold, eye height 1.6 m. A slight 2 degree downward tilt for 1 s then level.
LINK OUT: L1 into S04 (same move continues).
SYNC: "opening" -> the door starts to move.
SOUND: door creak, then room tone with a small echo (hall reverb).

S04 OBJECT 1: PENGUIN
LINE: "Standing in the entrance is a penguin wearing sunglasses."
VISUAL: The penguin stands in the hall center at (0, 0, -2.4), facing the door. Sunglasses oversized. The rug is under its feet.
CAMERA: stops 2.2 m from the penguin, then a slow push of 0.4 m. Hold on a mid-shot with the whole penguin and some hall visible.
LINK OUT: L1 threshold into the living room via the hall's north door.
SYNC: "penguin" -> the lean begins; "sunglasses" -> the flipper slides the glasses down 1 cm then back up.
SOUND: sunglasses "tk", flipper "pap". Hold the penguin for at least 2.5 s after the sentence ends (breath).
NOTE: this is the answer to the final question. Make it the best-looking object in the film.

S05 OBJECT 2: BANANA
LINE: "Walk into your living room, and there's a giant banana sitting on your sofa."
VISUAL: Living room, Mustard-themed, striped wallpaper. The banana lounges on the sofa.
CAMERA: threshold move, then an arc around the sofa of 25 degrees, keeping the banana centered.
LINK OUT: L1 threshold through the east door.
SYNC: "giant" -> the banana tips 3 degrees; "banana" -> cushion dip.
SOUND: sofa creak, squeak.

S06 OBJECT 3: DIAMOND FRIDGE
LINE: "Enter your kitchen, and your refrigerator is filled with diamonds."
VISUAL: Kitchen, Sky-themed, checker floor. The open fridge overflowing with diamonds. The power-station model is NOT visible yet (it appears in S23).
CAMERA: threshold move, then a slow push into the fridge opening until the diamond shelf fills 70% of the frame.
LINK OUT: L1 threshold through the north door (the camera backs off the fridge first, short move).
SYNC: "diamonds" -> one diamond falls and lands with a SLAM.
SOUND: clink notes, one note per diamond highlight swap, soft.

S07 OBJECT 4: CROCODILE
LINE: "Go into your bathroom, and there's a crocodile brushing its teeth."
VISUAL: Bathroom, Leaf-themed. The crocodile sits upright at the sink, brushing, foam growing in 4 steps.
CAMERA: threshold, then a two-step push toward the mirror so the viewer sees both the crocodile and its flat mirrored head.
LINK OUT: L1 threshold through the west door.
SYNC: "crocodile" -> brushing starts; "teeth" -> a close beat on the teeth for 8 frames (camera nudges 0.15 m).
SOUND: scrubbing rhythm, tap drip.

S08 OBJECT 5: ELEPHANT
LINE: "Finally, enter your bedroom, where an elephant is jumping on your bed."
VISUAL: Bedroom, Tomato-themed. The elephant mid-jump above the bed.
CAMERA: threshold, then settles at the bed's foot, eye height, slightly low (1.3 m) to feel the weight.
LINK OUT: stays in the room for S09.
SYNC: "elephant" -> first crouch; "jumping" -> the first jump starts. Three jumps complete during the line plus the breath.
SOUND: bed springs, trumpet blip drop at each landing.

S09 THAT'S IT
LINE: "That's it. Don't try to memorize anything. We'll come back to this later."
VISUAL: The elephant lands the last time and sits down, the bed settles. The room goes quiet. A small Cream plaque on the ceiling hatch reads "LATER" (SIGN text).
CAMERA: the lift-out begins: the camera rises slowly through the ceiling, the roof hinges open on twos, and the camera climbs up and out.
LINK OUT: L2 lift-out into the Brain Room.
SYNC: "later" -> the roof clears the camera and the house is visible as a model below.
SOUND: the room tone fades into an outdoor air, a soft paper-fold "fwip" as the roof opens.

10.4 CHAPTER 2: WHY IT WORKS
--------------------------------------------------------------------

S10 THE BRAIN ROOM
LINE: "Your brain has an incredible ability to remember environments."
VISUAL: The Lilac Brain Room. The Palace is now a 1.6 m wide model on a wooden shelf, roof open. The Walker sits in the Cream armchair looking at it. On the wall, framed pictures of the five rooms.
CAMERA: continues rising then levels at the room's mid height; slow push toward the Walker's shoulder.
LINK OUT: L3 frame-in-frame: one of the pictures becomes the next scene.
SYNC: "environments" -> the five frames swing 1 degree on twos, as if noticed.
SOUND: a different room tone (small, quiet, a clock ticking at 1 beat per second, foley only).

S11 CHILDHOOD HOME GHOST
LINE: "Think about your childhood home. Even if you haven't visited it in years,"
VISUAL: A line-drawn house outline (the ghost) hovers above a Cream table. Only outlines, no fill. The Walker stands at the ghost's front door.
CAMERA: a gentle circular dolly of 20 degrees around the ghost.
LINK OUT: continues into S12.
SYNC: "years" -> a Cream dust sheet slides off the ghost model.
SOUND: a soft paper-sheet slide.
NOTE: this is the only semi-transparent object in the video. Keep it clean.

S12 FURNITURE AND DOORS
LINE: "you might still remember where the furniture was, where the doors were, and how to get from one room to another."
VISUAL: Inside the ghost, the Walker walks. As each noun is spoken, a simple Coal-outline block appears at the right place: a sofa block, a door frame, then a dotted path from room to room.
CAMERA: a high straight-down view for about 3 seconds (a "map" moment), then it lowers back to eye level.
LINK OUT: L4 wall-wipe past a wall of the ghost house.
SYNC: "furniture" -> sofa block; "doors" -> door frames; "room to another" -> the dotted path.
SOUND: three soft wood "tok" sounds, one per noun.

S13 STORE IT
LINE: "Now imagine using that ability to store information."
VISUAL: In the ghost house, the Walker carries a Cream cardboard box and places it on a shelf. The box takes on solid colors as it lands (Cobalt), the outline thickens: the first solid thing in the ghost.
CAMERA: medium shot, steady.
LINK OUT: L1 through the ghost house's door into a lit hall (the sign scene).
SYNC: "store" -> the box lands (SLAM).
SOUND: box thud, tape rip.

S14 THE MEMORY PALACE SIGN AND ATHLETES
LINE: "This technique is called the memory palace, and competitive memory athletes use it to memorize enormous amounts of information."
VISUAL: A wooden hanging sign: "MEMORY PALACE" (SIGN text, two words). Below it, a long table with five Walker clones in numbered Tomato bibs, each next to a card tower. Their card towers are different heights; the tallest reaches the ceiling (3 m).
CAMERA: a lateral dolly along the table from left to right at 0.4 m per second.
LINK OUT: L7 object-fill: the tallest card tower's Cream face fills the frame.
SYNC: "memory palace" -> the sign swings and settles; "enormous" -> the tallest tower grows 3 steps.
SOUND: cards riffle (foley), a distant clock.
NOTE: Walker clones are allowed ONLY in this shot.

S15 VR GAME INSIDE THE HEAD
LINE: "Think of it as building a virtual reality game inside your head."
VISUAL: Back to the Walker in the armchair. The top of its head lifts like a jar lid, revealing a miniature stage: a tiny Palace, a tiny Walker, a tiny Tomato game controller on the floor. No screens, no glow.
CAMERA: pushes in toward the open head, stops 0.5 m above.
LINK OUT: L3 frame-in-frame: the tiny stage's proscenium becomes the next scene's frame.
SYNC: "virtual reality" -> the head lid lifts; "game" -> the tiny controller button presses (one step).
SOUND: a small jar-lid "pop" and a single soft 8-note chip melody played on a plucked instrument (no synth glow).

10.5 CHAPTER 3: HOW TO BUILD YOUR OWN
--------------------------------------------------------------------

S16 START WITH SOMEWHERE KNOWN
LINE: "To create your own, start with somewhere you already know."
VISUAL: Three small models on a table: a house, a school, a flat game-map tile board. Only the house has a Cream "you are here" flag pushed into it.
CAMERA: slow push toward the table, camera at table height.
LINK OUT: continues into S17.
SYNC: "know" -> the flag goes into the house roof (SLAM).
SOUND: flag pole thunk.

S17 HOUSE, SCHOOL, GAME MAP
LINE: "Your house, your school, or even the map of your favorite video game."
VISUAL: The three models in turn: the house is already flagged; the school gets a flag at "school"; the game-map tile board gets a flag with a small generic castle block. No game logos, no character shapes.
CAMERA: a short lateral slide across the three, 1 per beat.
LINK OUT: L5 page-curl: a big map sheet curls from the table to reveal the route drawing.
SYNC: "house" -> flag 1; "school" -> flag 2; "video game" -> flag 3.
SOUND: three flag thunks, rising in pitch.

S18 THE ROUTE
LINE: "Choose a route through that environment."
VISUAL: The Palace floor plan on the table (open roof, top-down is allowed for 3 s). The Walker draws a dotted Cobalt line door -> hall -> living -> kitchen -> bathroom -> bedroom, dot by dot on twos.
CAMERA: high, nearly straight down for the first 3 s, then lowers to a 45 degree view. This is the only time the camera exceeds 30 degrees of pitch.
LINK OUT: L1 threshold: the camera drops to the hall and the dotted line becomes a floor line.
SYNC: "route" -> the first dot; the line completes by the end of the sentence.
SOUND: pencil ticks on each dot.

S19 STORAGE SLOTS
LINE: "Every location becomes a storage slot for a piece of information."
VISUAL: At each of the five route points a Cream plinth with a square slot hole appears. The Walker puts one small Cobalt box into each slot, in order. The numbers 1-5 are stamped on the plinth fronts.
CAMERA: following the Walker at 2.5 m behind, level.
LINK OUT: L4 wall-wipe at the bedroom wall.
SYNC: "location" -> the first plinth rises; each plinth rises once per second.
SOUND: wood "tok" per plinth, a lower "thud" per box.

S20 ORDINARY OBJECTS
LINE: "But there's a trick. Don't just imagine ordinary objects."
VISUAL: A plain Cream mug on a plinth. It is dull: no outline thickening, shade step only. A TAG sign swings: "BORING".
CAMERA: dead-center, slight push.
LINK OUT: continues into S21.
SYNC: "trick" -> the mug rotates 90 degrees on twos; "ordinary" -> a small yawn "zzz" sign stamp.
SOUND: dry room tone, a clock tick.

S21 RIDICULOUS, ENORMOUS, ALIVE
LINE: "Make them ridiculous. Make them enormous. Give them movement, sound, or unusual behavior."
VISUAL: Three beats on the same mug:
  1) "ridiculous": it grows tiny legs in Tomato and wears the penguin's sunglasses (one flat lens shape on each side).
  2) "enormous": it scales to 3 m and its handle pokes through the ceiling.
  3) "movement, sound, or unusual behavior": it walks off the plinth, and a stamped word "KLONK" hits the floor behind it. (STAMP text, one word.)
CAMERA: holds, tilts up for the second beat, then levels.
LINK OUT: L7 object-fill: the huge mug's Cream side fills the frame.
SYNC: "ridiculous" -> legs; "enormous" -> scale up; "movement" -> first step; "sound" -> stamp lands.
SOUND: tiny footsteps, a ceramic "tonk", a stamp thud.

10.6 CHAPTER 4: THE BIOLOGY EXAMPLE
--------------------------------------------------------------------

S22 STUDYING BIOLOGY
LINE: "Let's say you're studying biology and need to remember that mitochondria produce most of the energy your cells use."
VISUAL: The Walker at a desk in the Brain Room, a Leaf biology textbook with a BLOCK text spine: "BIOLOGY". A flat Cream slab leans against the book, the abstract sentence in BLOCK letters, wobbling and hard to read: "MITOCHONDRIA PRODUCE ENERGY" (use only these words, no extra claims).
CAMERA: medium close, slight push.
LINK OUT: L3 frame-in-frame into the kitchen picture on the wall.
SYNC: "mitochondria" -> the slab letters rattle; "energy" -> the slab slumps.
SOUND: page rustle, a pen tap.

S23 THE TINY POWER STATION
LINE: "Imagine a tiny power station inside your kitchen, operated by thousands of miniature workers."
VISUAL: The kitchen counter. The Mustard factory with the Coal gear and the ENERGY sign. 2000 tiny workers carry Mustard squares in lines. Cables run up to a lamp. The lamp's Mustard shade swaps to Paper-white for 2 frames: a flat flash, no glow.
CAMERA: a slow lateral push along the counter at 0.15 m height to feel small; then a pull back to reveal the fridge from S06 in the background.
LINK OUT: L4 wall-wipe past the fridge's Cream door.
SYNC: "tiny" -> the camera lowers; "thousands" -> the worker lines multiply on twos from 200 to 2000 over 12 frames; "kitchen" -> the fridge appears behind.
SOUND: patter of tiny feet, gear clack, a short lamp "tick".

S24 ABSTRACT SENTENCE VS SCENE
LINE: "Now, instead of struggling to remember an abstract sentence, you have a scene that reminds you of its meaning."
VISUAL: Left: the wobbly sentence slab from S22 now crumbles (the BLOCK letters tumble off, SLAM, no bounce). Right: the factory keeps working, calm and clear.
CAMERA: a locked frame with a very slow push toward the factory.
LINK OUT: L3 frame-in-frame into the dioramas wall.
SYNC: "abstract" -> the slab tips; "scene" -> the factory's gear turns one step.
SOUND: wooden blocks clattering, then calm patter.

10.7 CHAPTER 5: DIFFERENT ENVIRONMENTS
--------------------------------------------------------------------

S25 WALL OF DIORAMAS
LINE: "You can create different environments for different subjects."
VISUAL: The Brain Room wall with three Cream shadowboxes: School (Cobalt), Museum (Tomato), Supermarket (Leaf). All three closed with tiny doors.
CAMERA: a wide, level view that slowly dollies in.
LINK OUT: L3 into the first box.
SYNC: "different" -> the three tiny doors open one by one, 6 frames apart.
SOUND: three small hinge squeaks, differently pitched.

S26 SCHOOL FOR MATH
LINE: "A school for mathematics."
VISUAL: The classroom diorama: blackboard with chalk lines, giant "+" and "=" blocks standing on desks. Sign: "MATH".
CAMERA: pushes into the box until the room fills the frame.
LINK OUT: L4 wall-wipe past a Cream classroom wall.
SYNC: "school" -> the "+" block settles; "mathematics" -> the sign hangs.
SOUND: chalk tick.

S27 MUSEUM FOR HISTORY
LINE: "A museum for history."
VISUAL: Hall with Tomato columns, a 14-bone dinosaur skeleton, a framed painting that is three flat color blocks. Sign: "HISTORY".
CAMERA: lateral dolly past the skeleton.
LINK OUT: L1 threshold through a museum arch into the next box.
SYNC: "museum" -> the skeleton's jaw drops one step; "history" -> the sign hangs.
SOUND: echoey footsteps, a distant whisper-free hall tone.

S28 SUPERMARKET FOR LANGUAGE
LINE: "An entire supermarket for learning a new language."
VISUAL: Four aisles. Each aisle sign is a neutral shape (circle, triangle, square, star), not a real word, so no language is shown. A cart rolls on twos.
CAMERA: a slow push down the center aisle.
LINK OUT: L4 wall-wipe at the supermarket's end wall.
SYNC: "entire" -> the cart rolls; "language" -> a sign flips from a shape to a stamped "?" (one only).
SOUND: cart wheel clicks, a cash-register "ka-ching" (single).

S29 BETTER WITH PRACTICE
LINE: "With practice, you can become better at navigating these environments and retrieving the information stored inside them."
VISUAL: The Palace again, closed. The Walker walks the route three times: first slow and hesitant (stops at doors), second steadier, third smooth. At each plinth a box is opened and a small Leaf flag appears. By the third pass all five flags are up.
CAMERA: a high-ish dolly following the Walker, 20 degrees pitch, level horizon.
LINK OUT: L5 page-curl into the calendar.
SYNC: "practice" -> the 2nd pass begins; "retrieving" -> boxes open one after another.
SOUND: footsteps speeding up in rhythm (step density increases per pass), five small lid "pops".

10.8 CHAPTER 6: THE EVIDENCE AND THE CAVEATS
--------------------------------------------------------------------

S30 STUDY, 2017
LINE: "In a study published in twenty seventeen,"
VISUAL: A Cream wall with a big paper calendar page, stamped "2017" in Tomato (STAMP text). A framed Cream card hangs beside it reading "STUDY".
CAMERA: locked, with a small push.
LINK OUT: continues into S31.
SYNC: "twenty seventeen" -> the stamp lands.
SOUND: stamp thunk.

S31 SIX WEEKS
LINE: "researchers found that six weeks of memory palace training improved people's memory performance,"
VISUAL: The calendar's first 6 week-rows fill with Leaf blocks, one row per beat. A tiny Walker (clone ALLOWED here, tiny size 0.2 m) walks along each row. A small Leaf bar chart made of 2 wooden blocks (before: low, after: high) stands at the right, with no numbers.
CAMERA: a lateral dolly along the rows.
LINK OUT: L5 page-curl to the next calendar page.
SYNC: "six weeks" -> the rows fill; "improved" -> the second block stands taller (two steps).
SOUND: wood tok per row.

S32 FOUR MONTHS LATER
LINE: "with benefits still detectable four months later."
VISUAL: The new page has 16 empty rows. A single Leaf flag stands at the end of the last row. A TAG tied to the flag: "4 MONTHS LATER". The small bar chart's tall block is still tall.
CAMERA: a slow lateral dolly the full length of the empty rows.
LINK OUT: L7 object-fill: the flag's Leaf cloth fills the frame.
SYNC: "four months" -> the camera starts the long dolly; "detectable" -> the tall block gets a Paper-white highlight bar (flat) for 6 frames.
SOUND: a long low wooden "tock" at the end, then silence.

S33 NOT PHOTOGRAPHIC MEMORY
LINE: "But this isn't photographic memory."
VISUAL: A toy camera on a plinth (Cream body, Coal lens, Tomato shutter). A big Tomato stamp crosses it: a flat circle with a diagonal bar and the words "NOT THIS". No flash, no glow.
CAMERA: centered, slight push.
LINK OUT: L4 wall-wipe.
SYNC: "isn't" -> the stamp lands on the camera.
SOUND: shutter "click" then a heavy stamp thunk.

S34 THREE THINGS YOU STILL NEED
LINE: "You still need to understand the information, associate it with memorable images, and revisit it occasionally."
VISUAL: Three door plaques along a hallway, each plaque with a small prop:
  1) "UNDERSTAND" with an open book,
  2) "ASSOCIATE" with a short chain linking a small Cream slab to the penguin's sunglasses,
  3) "REVISIT" with a round clock whose hands move 3 steps.
CAMERA: one steady dolly down the hallway, pausing 1 s at each plaque.
LINK OUT: L1 threshold through the last door.
SYNC: "understand" -> plaque 1; "associate" -> plaque 2; "revisit" -> plaque 3.
SOUND: a door knock at each plaque (soft), a clock tick at the third.

S35 NO HEADSET NEEDED
LINE: "And you don't need to visualize everything as clearly as a real virtual reality headset."
VISUAL: The generic headset on a plinth. A Tomato round stamp with a diagonal bar presses onto the plinth. Beside it, a plain Cream paper sketch of a house drawn in thin Coal lines: "good enough". (TAG text: "FUZZY IS FINE".)
CAMERA: a slow push to the plinth.
LINK OUT: L6 descent begins: the camera rises out of the room and the Brain Room takes over, then S36 starts.
SYNC: "headset" -> the headset's lens circles swing 2 degrees; "clearly" -> the stamp lands.
SOUND: stamp thunk, a pencil scribble.
NOTE: the tag "FUZZY IS FINE" paraphrases the script's meaning; keep it. It is the only phrase not verbatim, flagged in report.md.

10.9 CHAPTER 7: THE TEST
--------------------------------------------------------------------

S36 REMEMBER THE HOUSE
LINE: "Now, remember the house we entered at the beginning of this video?"
VISUAL: The camera is above the Brain Room's shelf. It descends through the open roof of the model, falls to full size, exits the roof of the real house into the afternoon sky, and settles 4 m back from the front door at eye height. The street, the plant, the door: identical to S01, now without the stamp "5 OBJECTS".
CAMERA: L6 descent. The sequence takes the whole sentence. End in the exact position of S01 frame 0.
LINK OUT: continues into S37.
SYNC: "remember" -> the descent begins; "beginning" -> the camera arrives at the S01 position.
SOUND: air rushing as soft felt (no whoosh), a bird.
NOTE: the last frame of S36 must match the first frame of S01 within 1% pixel difference, except for the stamp. Check this with qa.py.

S37 THE QUESTION
LINE: "What was standing at the entrance?"
VISUAL: The door swings open. The hall is bright. The rug is there, the console table is there, the penguin is not yet in view (it is behind the console table). The camera pushes over the threshold exactly as in S03.
CAMERA: same move as S03, 20% slower.
LINK OUT: continues into S38.
SYNC: "entrance" -> the camera crosses the threshold.
SOUND: the door creak, hall reverb. Hide captions at the end of the line (Section 8.12).

S38 THE ANSWER (SILENT BEAT)
LINE: (no narration; 2.5 seconds of silence from the voice)
VISUAL: The hall center. The penguin steps out from behind the console table into its spot from S04 (3 steps on twos, no bounce) and stops. It leans left, leans right. The flipper slides the sunglasses down 1 cm, then back up. A flat Leaf check shape is stamped on the wall behind it (a drawn shape, no emoji, no text).
CAMERA: a locked shot, mid height. A very slow push of 0.2 m over the beat.
LINK OUT: none (end of video). Hold the last frame 1.0 s after the penguin's final move.
SYNC: the check stamp lands exactly 0.5 s after the sunglasses' second push.
SOUND: sunglasses "tk", stamp thunk, then quiet room tone.
NOTE: the penguin's entrance from behind the console table is a creative choice (the script does not say where it hides). Flag it in report.md. No end screen, no subscribe prompt, no extra text. The video ends on the penguin.

SECTION 11. SOUND DESIGN (FOLEY, NO WHOOSHES)
====================================================================
Principles:
- The sound is made of physical sounds: wood, paper, cloth, ceramic, glass, plastic, springs.
- No whooshes. No risers. No impacts with sub-bass. No cinematic booms. No stock "swish" sounds.
- Every object has one sound signature (Section 9.2). The signatures return quietly in the final test.
- Rooms have different reverb: hall (medium, bright), living room (small, soft), kitchen (tiled, short and bright),
  bathroom (tiled, longer reverb), bedroom (dry, soft), Brain Room (very dry, close).
- Reverb is a simple convolution of a synthesized impulse (decaying noise burst). No plugins required.

Generation (scripts/sfx.py):
- Synthesize every sound with numpy: filtered noise bursts, sine/triangle pings with fast decay, comb filters for wood, band-pass noise for paper.
- Example recipes (guidance, adjust by ear and by measurement):
  - Stamp thunk: 80 Hz sine, 60 ms decay + band-passed noise at 400 Hz, 30 ms.
  - Wood tok: 700 Hz triangle, 40 ms decay + short noise at 2 kHz.
  - Paper slide: band-passed noise 1 to 4 kHz, 200 ms, amplitude shaped with a fast attack and slow release.
  - Glass clink: sum of 3 sines at 2.1, 3.4 and 5.2 kHz, 250 ms exponential decay.
  - Door creak: sawtooth 90 Hz with slowly rising pitch bent by a low-frequency random walk, band-pass 300 to 1200 Hz, 900 ms.
  - Spring squeak: sine sweep 600 -> 900 Hz, 80 ms, vibrato 25 Hz.
  - Trumpet blip: square wave filtered at 800 Hz, pitch falling 400 -> 250 Hz over 300 ms.
  - Scrubbing: noise band-passed 3 to 6 kHz, amplitude modulated at 7 Hz.
  - Footsteps: low-passed noise burst 150 ms plus a 120 Hz knock, with random pitch variation +/- 8% (seeded).
- Make 3 variations of every repeated sound so no sound repeats identically more than twice in a row.

Mixing:
- Voice is the priority. Voice sits at -16 LUFS short-term target before the final normalization.
- SFX bus ducks 6 dB under the voice (side-chain simple envelope follower, 30 ms attack, 300 ms release).
- Room tone bed at -38 LUFS, a different tone per room, cross-faded over 0.5 s with the camera link.
- No music in the first 40 seconds. After that, an optional quiet plucked-instrument loop at -30 LUFS, built from 3 notes only.
  If you cannot make music that feels handmade, use none. Silence is better than generic music.
- Final loudness: -14 LUFS integrated, true peak below -1.0 dBTP (ffmpeg loudnorm, two-pass).
- The 2.5 s silent beat in S38 contains only room tone and the penguin's foley.

Sync tolerance:
- Every foley hit lands within 2 frames (67 ms) of the visual contact frame.
- Check this with qa.py: extract the onset times of each foley file in mix.wav and compare to the timeline.

SECTION 12. THE SCRIPT (EXACT TEXT OF THE NARRATION)
====================================================================
The narration audio is the master. This is its text, for alignment and caption checking.
Do not edit, shorten or reorder it.

"I'm going to make you memorize five random objects without writing anything down.
And by the end of this video, you'll probably remember them without even trying.
Imagine opening the front door of your house.
Standing in the entrance is a penguin wearing sunglasses.
Walk into your living room, and there's a giant banana sitting on your sofa.
Enter your kitchen, and your refrigerator is filled with diamonds.
Go into your bathroom, and there's a crocodile brushing its teeth.
Finally, enter your bedroom, where an elephant is jumping on your bed.
That's it. Don't try to memorize anything. We'll come back to this later.
Your brain has an incredible ability to remember environments.
Think about your childhood home. Even if you haven't visited it in years,
you might still remember where the furniture was, where the doors were,
and how to get from one room to another.
Now imagine using that ability to store information.
This technique is called the memory palace, and competitive memory athletes
use it to memorize enormous amounts of information.
Think of it as building a virtual reality game inside your head.
To create your own, start with somewhere you already know.
Your house, your school, or even the map of your favorite video game.
Choose a route through that environment.
Every location becomes a storage slot for a piece of information.
But there's a trick. Don't just imagine ordinary objects.
Make them ridiculous. Make them enormous.
Give them movement, sound, or unusual behavior.
Let's say you're studying biology and need to remember that mitochondria
produce most of the energy your cells use.
Imagine a tiny power station inside your kitchen, operated by thousands of miniature workers.
Now, instead of struggling to remember an abstract sentence,
you have a scene that reminds you of its meaning.
You can create different environments for different subjects.
A school for mathematics. A museum for history.
An entire supermarket for learning a new language.
With practice, you can become better at navigating these environments
and retrieving the information stored inside them.
In a study published in twenty seventeen, researchers found that six weeks of
memory palace training improved people's memory performance,
with benefits still detectable four months later.
But this isn't photographic memory.
You still need to understand the information, associate it with memorable images,
and revisit it occasionally.
And you don't need to visualize everything as clearly as a real virtual reality headset.
Now, remember the house we entered at the beginning of this video?
What was standing at the entrance?"

Notes on the script:
- The 2017 study claim comes from the script author. You are not asked to verify it. If you want to add anything about it, do not.
- Numbers on screen: only "5 OBJECTS", "2017", "6 WEEKS" (optional), "4 MONTHS LATER". Nothing else.
- Do not translate the script. Do not add subtitles in another language.

SECTION 13. THE ORIGINALITY CHECK (RUN ON EVERY SHOT)
====================================================================
For each shot, answer these seven questions in shotlist.md. If any answer is "yes", redesign the shot.

1. Could this exact frame appear in a generic stock "3D explainer" template?
2. Does it use a glow, a particle, a lens flare, or a dark background?
3. Does it use a floating isometric island or a cutaway cube as the main picture?
4. Does the camera orbit an object like a product ad?
5. Does text fly in or fade in without being attached to a physical thing?
6. Is it a close copy of a film, game, brand, character or logo? (Never copy those.)
7. Would a viewer who watched ten similar videos this week recognize this as the same kit?

Then answer these three. All must be "yes":
A. Is there one clear idea, readable in under one second?
B. Does the world feel handmade (outlines boil, motion on twos, rough edge)?
C. Is the shot connected to the next one by a physical link, not a cut?

Extra anti-cliché rules for 3D:
- No turntable spin of any object.
- No "slow-mo debris" explosions.
- No floating UI panels or holograms.
- No sci-fi grid floors.
- No glass or chrome materials.
- No cartoon "sparkle" stars.
- No clip-art style emoji faces.
- No character that stares into the camera with a smile.

SECTION 14. QA: AUTOMATIC CHECKS (scripts/qa.py)
====================================================================
Run these checks on the preview and on the final.

BRIGHTNESS AND LOOK
- Mean luminance of every frame >= 0.55 (0 to 1 scale). Report the frames below 0.55.
  (Coal outlines are small; the scene is bright by design.)
- No frame may have more than 6% of pixels with luminance < 0.12.
- Count unique colors per frame after quantization: <= 40 flat colors dominate (95% of pixels).
- Detect bloom: the blurred difference between the frame and a copy blurred at 8 px must not show smooth halos around bright regions.
- Detect gradients: sample 20 random wall locations; the color variance in a 20x20 patch must be < 6 (flat).

MOTION AND TIMING
- Verify there are no hard cuts: compute the mean absolute difference between consecutive frames. The maximum allowed jump is below a threshold you calibrate on the greybox pass (except in L4 wall-wipes, listed explicitly).
- Verify "on twos": for 20 object tracks, positions change on even frames only (object frames), except the camera.
- Verify shot minimum duration: each shot >= 1.8 s.
- Verify sync: each SYNC word starts within 2 frames of its visual contact frame.

TEXT
- All text is inside the 6% safe margin.
- All headline text height >= 6% of frame height.
- No text overlaps another text.
- Captions: <= 6 words on screen at once; lines <= 2.

AUDIO
- Integrated loudness -14 LUFS +/- 0.5; true peak <= -1 dBTP.
- No clipping.
- SFX never louder than the voice during speech (measure 100 ms windows).

CONTINUITY
- S36's final frame vs S01 frame 0: structural similarity (SSIM) >= 0.97 outside the stamp area.
- The penguin's model is identical in S04 and S38 (same mesh hash, same sunglasses).
- The room order on the route is the one in Section 9.1.

PERFORMANCE
- Render time per frame logged. Report the slowest 5 frames.
- Total frames = audio duration * 30 (+/- 1).

MANUAL INSPECTION (you MUST do this, not skip it)
- Look at 20 random frames at full size.
- Look at the first frame, the last frame, and 3 frames around every link move.
- Look at the five objects in close-up once each.
- Write what you saw in report.md, in plain words, per item. If you did not look, write "not inspected".

SECTION 15. THE LOOK-DEV CHECKPOINT (THE FIRST THING YOU SHOW)
====================================================================
Show these three still frames to the user before any animation work:

FRAME 1: the entrance, penguin centered, door open behind the camera. This decides the whole look.
FRAME 2: the kitchen, the open fridge full of diamonds. This tests color, shading and instancing.
FRAME 3: the power station and the workers on the counter. This tests scale and density.

For each frame, report:
- Render time.
- Triangle count.
- Whether any rule from Section 5 is at risk and why.

Then wait for the user's decision. If the user says "go", proceed. If the user criticizes the look, fix the look first.
Do not start animation, sound or the full camera path before approval.

SECTION 16. FAILURE PLANS (WHAT TO DO WHEN THINGS GO WRONG)
====================================================================
If inverted-hull outlines show gaps on sharp edges:
- Smooth the normals used for extrusion (bake a separate normal attribute) and keep the original normals for shading.

If toon banding looks noisy or shimmers while the camera moves:
- Reduce the number of steps to 2, increase the shade step's contrast a little, and avoid per-pixel noise.

If hard shadows look blocky:
- Tighten the shadow camera frustum to the room. Use a bias of 0.0005 to 0.002 and normal bias 0.02. Keep nearest filtering.

If the one-take path clips through walls:
- Increase door width to 1.3 m in the layout, shift the route to the door center, then re-check.

If rendering is too slow:
- Lower the preview resolution, reduce the instanced diamonds to 80 and workers to 800 in previews only.
- The FINAL render must use 120 diamonds and 2000 workers.
- Render in 4 parallel chunks (frame ranges), each in its own browser, then concatenate.

If a link move looks fake:
- Slow it down by 20% and extend the breath before it, or replace it with an L4 wall-wipe (record it).

If the sync is off:
- Re-run alignment with a larger model. Adjust only the animation, never the audio.

If you cannot make a 3-minute continuous camera path look good:
- Keep the chapter structure (Section 10) and use 7 continuous chapter takes joined by L4 wall-wipes at the chapter edges.
- Report this in report.md. The video must still feel like one place.

If something is impossible with the available tools:
- Say exactly which tool is missing and what you did instead. Do not pretend.

SECTION 17. REPORT TEMPLATE (report.md)
====================================================================
Write the report in this exact structure, in plain words, no marketing language:

1. WHAT I BUILT (3 lines).
2. FILES (list, with sizes).
3. RULE CHECK: go through Section 5 rules 1 to 30, write PASS, FAIL, or NOT CHECKED for each, with one line of evidence for FAIL and NOT CHECKED.
4. DEVIATIONS: every place you broke a SHOULD rule or used a fallback (L4 wall-wipes, fallback renderer, exceptions to the one-take).
5. THINGS I FAKED OR SIMPLIFIED: be specific.
6. THINGS I COULD NOT DO.
7. FACT CHECK: confirm that every on-screen word appears in Section 12 or is in the allowed list. List the one paraphrase tag ("FUZZY IS FINE") and the penguin stepping out from behind the console table in S37/S38.
8. KNOWN ISSUES: any frame ranges where you saw a defect.
9. NEXT STEP: one realistic suggestion.

SECTION 18. FINAL CHECKLIST (TICK EVERYTHING BEFORE DELIVERING)
====================================================================
[ ] The scene is bright in every shot. No dark frames.
[ ] No glow, bloom, neon, blur, grain or vignette anywhere.
[ ] Every object has a Coal outline with slight width variation.
[ ] Shadows are hard and flat.
[ ] Only palette colors are used.
[ ] The camera never cuts. Every link is physical. L4 used at most 3 times (or documented).
[ ] Characters and objects animate on twos.
[ ] The five objects match the script exactly and appear in the right order.
[ ] Each object has its own behavior and its own sound signature.
[ ] Text exists in the world (signs, stamps, tags, blocks). No flying text.
[ ] Captions are word-synced and hidden during the silent beat.
[ ] Banned fonts are not used.
[ ] The last frame of S36 matches the first frame of S01.
[ ] The penguin is the final reveal.
[ ] No invented facts or numbers on screen.
[ ] The audio is -14 LUFS, peaks below -1 dBTP, foley only, no whooshes.
[ ] shotlist.md has real timestamps and the originality answers.
[ ] contact_sheet.png reviewed.
[ ] report.md is honest.

SECTION 19. LAST WORDS TO THE AGENT
====================================================================
This video's whole idea is that you are walking through a place, not watching edits.
Protect that idea in every decision.
When a choice is between "easier and common" or "harder and original", take the harder one,
unless it breaks a MUST rule or you cannot verify it works.
When you are unsure, show a still, not a promise.
When you finish, look at your own work as if someone else made it, and be harsh.
Deliver the file. Tell the truth about it.
