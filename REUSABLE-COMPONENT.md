# Shared UI components

Reusable, presentation-only building blocks for the whole app. They live in
`src/shared/ui` and are exported from the barrel `src/shared/ui/index.ts`, so
import them from `"../../../shared/ui"` (adjust depth) rather than reaching for
the individual files.

```ts
import { Button, SearchableSelect, TextField } from "../../../shared/ui";
```

## Rules of thumb

- **Reuse before you build.** If a feature needs a dropdown, a button, a card,
  etc., use the component here. Don't fork a near-duplicate inside a feature
  folder — that was the case with the old `SearchableMuscleGroupSelect` /
  `TypeFilterSelect` pair, now unified into `SearchableSelect`.
- **Keep these components generic.** They must not import from `features/` or
  `app/`. Feature-specific data (option lists, labels) is shaped in the feature
  and passed in via props.
- **Controlled by default.** Inputs take `value` + `onChange`; they don't own
  domain state.
- **Style via tokens.** Use the CSS variables (`--surface-*`, `--text-*`, …),
  and accept an optional `className` for per-call tweaks (most form inputs
  forward native HTML attributes through `...props`).
- When you add a component, export it from `index.ts` and document it below.

## Components

### `SearchableSelect`

Searchable single-select dropdown with a styled popover. Use this for any
filter/select that benefits from type-to-filter. Closes on selection, on
outside blur, and when the trigger is clicked again while open.

| Prop | Type | Notes |
| --- | --- | --- |
| `options` | `SearchableSelectOption[]` | `{ value, label }[]` to render |
| `value` | `string` | Currently selected value |
| `onChange` | `(value: string) => void` | Fired with the chosen value |
| `id` | `string?` | Wired to the input for `<label>` association |
| `ariaLabel` | `string?` | Accessible label for the trigger |
| `searchPlaceholder` | `string?` | Placeholder while filtering |
| `emptyText` | `string?` | Shown when nothing matches |

`onChange` always emits a `string`. For a narrowed union, cast at the call site
(e.g. `onChange={(v) => setType(v as ExerciseTypeFilter)}`) and type the option
list with the narrow `value`.

```tsx
<SearchableSelect
  ariaLabel="Muscle group filter"
  searchPlaceholder="Search muscle group"
  emptyText="No muscle group found."
  options={muscleOptions}        // [{ value: "all", label: "All muscle groups" }, …]
  value={categoryFilter}
  onChange={onCategoryFilterChange}
/>
```

Both filters in the Add Exercise toolbar (muscle group **and** exercise type)
are rendered with this one component.

### `SelectField`

Thin wrapper over a native `<select>`; forwards all `<select>` attributes and
merges `className`. Use when a plain native dropdown is enough and search isn't
needed.

### `TextField`

Styled `<input>`; forwards all `<input>` attributes and merges `className`.

### `CompactNumberInput`

Styled numeric `<input>` for tight layouts; forwards `<input>` attributes.

### `Button`

Primary action button. Extends `<button>` attributes; supports `tone`
(`primary` / `secondary` / …), `leadingIcon`, and `fullWidth`.

### `IconButton`

Square icon-only button. Extends `<button>` attributes; supports `tone` and
`size`.

### `SegmentedControl<T>`

Generic single-choice segmented toggle. Takes `options`, a `value` of type `T`,
and `onChange(next: T)`.

### `Field`

Form-row wrapper that renders a `label`, optional `hint`, and `htmlFor`
association around its children.

### `Panel`

Polymorphic surface container (`as` prop, defaults to `div`). Base card styling
for grouped content.

### `RowCard`

Polymorphic list-row surface (`as` prop). Use for tappable rows / list items.

### `Badge`

Small status/label pill.

### `ProgressBar`

Horizontal progress indicator; takes `value` (0–100) and optional `label`.

### `EmptyState`

Centered empty/placeholder block with `title` and `description`.

### `PageShell`

Page-level layout wrapper providing max width, padding, and an optional
`title`. Accepts `className` / `contentClassName`.

### `AppLogo`

Brand mark.

### `cn`

`clsx`/`tailwind-merge`-style class combiner used by every component. Use it to
merge a base class string with an incoming `className`.
