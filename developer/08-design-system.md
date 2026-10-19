# 08 - Design system

Reference images live in `assests/` (logo, exam screens, parent website). Web and app share the same look.

- **Font:** Inter (`@fontsource-variable/inter`, works offline in Electron)
- **Colors** (`index.css` `@theme`): brand blue `rgb(0,87,193)`, ink black `#0f1115`, accent green `#2f9e63`
- **Shapes:** white surfaces, `rounded-2xl` cards, 1px `line` borders, soft shadow only on hero cards
- **Labels:** small uppercase, wide letter spacing (`<Label>`), like "SCHEDULED FOR" on the exam screens
- **Buttons:** green = primary action (Start Test, Submit), dark = Next, blue = secondary, ghost = Previous
- **Icons:** `lucide-react`
- **Exam palette states:** Attempted (green), Viewed (amber), Current (blue), Marked for review (purple dot)

Shared pieces (duplicated in `web/` and `app/` on purpose, they are tiny): `components/ui.jsx`, `components/Banner.jsx`.

