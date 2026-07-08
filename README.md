# i4Twins HMI Editor

A lightweight industrial HMI (Human Machine Interface) viewer and editor built with **Angular 20**.

The application loads an SVG process diagram, allows users to inspect and edit SVG elements, search industrial devices through a local REST API, visualize device statuses in preview mode, and add custom labels to the drawing.

---

# Features

## SVG Viewer

- Loads and renders the provided `plant.svg`
- Displays the SVG inside the editor canvas
- Preserves the original SVG structure

## Element Selection

- Click any SVG element to select it
- Selected elements are highlighted using a selection box
- Displays all SVG attributes of the selected element

## Attribute Editing

- Edit any SVG attribute
- Changes are immediately reflected in the drawing
- Editing is disabled while Preview Mode is enabled

## Labels

- Right-click anywhere on the drawing to add a text label
- Material dialog for entering label text
- Custom text color selection
- Delete labels using right-click with a Material confirmation dialog

## Device Search

- Local REST API implemented with Node.js
- Debounced autocomplete search
- Previous HTTP requests are cancelled using `switchMap`
- Loading, empty and error states
- Search is case-insensitive
- Searches across all properties of every device record

## Device Selection

Selecting a device:

- highlights the corresponding SVG element
- selects the SVG element inside the editor
- displays device information

If no matching SVG element exists, a warning message is shown instead of failing.

## Recent Devices

- Stores the last five successfully matched devices
- Duplicate entries are removed
- Devices without a matching SVG element are **not** added

## Preview Mode

Preview mode:

- disables SVG editing
- refreshes device data every 5 seconds
- colors SVG elements according to device status
- restores original colors when disabled

Status mapping:

| Status | Color |
|---------|-------|
| running | Green |
| stopped | Gray |
| fault | Red |
| unknown | Yellow |

---

# Architecture

The project follows a feature-based architecture.

```
src/app
 ├── features
 │     ├── devices
 │     ├── hmi-editor
 │     └── preview
 │
 ├── models
 ├── services
 └── ...
```

Responsibilities are separated into dedicated services.

Main services:

- **SvgDom** – SVG parsing, rendering, selection, attribute editing and preview coloring
- **SvgLabel** – Label creation and deletion
- **DeviceApi** – HTTP communication and device normalization
- **DeviceStore** – Device search, selection and recent device state
- **Preview** – Polling and preview state
- **StatusColor** – Status-to-color mapping
- **EditorSelectionState** – Selected SVG element state

Business logic is kept inside services while components remain lightweight and focused on presentation.

---

# State Management

Angular Signals are used for local application state.

Signals were chosen because they are:

- lightweight
- built into Angular
- easy to reason about
- well suited for local UI state
- require very little boilerplate

RxJS is used only for asynchronous operations such as:

- HTTP requests
- debouncing
- request cancellation
- preview polling

---

# Running the Project

Install dependencies:

```bash
npm install
```

Start the local devices API:

```bash
npm run api
```

Start Angular:

```bash
npm start
```

Open:

```
http://localhost:4200
```

---

# Build

```bash
npm run build
```

---

# Tests

```bash
npm test
```

No custom unit or integration tests were implemented.

---

# Mock API

The project includes a lightweight Node.js server.

Available endpoints:

```
GET /api/devices
GET /api/devices?q=pump
GET /api/devices/:id
```

Search is case-insensitive and checks **all properties** of each device record instead of only the device name or code.

---

# Design Decisions

## SVG Interaction

SVG manipulation is implemented using the native DOM API.

No external SVG libraries were used.

This keeps the implementation lightweight while providing complete control over SVG elements.

---

## Separation of Concerns

SVG manipulation, device retrieval, preview logic, label management and application state are separated into independent services.

This makes the project easier to extend and maintain.

---

## Preview Mode

Preview mode only changes the visual representation of the SVG.

Original fill values are temporarily stored using custom `data-original-fill` attributes and restored when preview mode is disabled.

The SVG itself is never permanently modified by preview rendering.

---

## Extensibility

The current design allows new functionality to be added with minimal changes.

Examples:

- new preview actions (blinking, tooltips, animations)
- additional device data sources
- alternative status-to-color mappings
- additional SVG editing features

---

# SVG and Device Mapping

The mapping policy is:

```
SVG data-device-id  <->  Device id
```

Matching is performed case-insensitively.

If a selected device has no corresponding SVG element:

- a warning message is displayed
- the application continues running
- the device is **not** added to the recent devices list

If an SVG element references a device that does not exist in the API, Preview Mode renders it using the **unknown** status color.

---

# Robustness Against Messy Data

The provided assets intentionally contain inconsistent data.

The application handles these cases safely without crashing.

| Situation | Behaviour |
|------------|-----------|
| Invalid SVG | Error message is displayed |
| Missing SVG root | Error message is displayed |
| Missing device name | Displayed as **Unnamed device** |
| Missing vendor | Displayed as **Unknown vendor** |
| Missing area | Displayed as **Unknown area** |
| Missing or `n/a` lastSeen | Displayed as **—** |
| Unknown status values | Normalized to **unknown** |
| Status case mismatch | Compared case-insensitively |
| Device ID case mismatch | Compared case-insensitively |
| Device exists but SVG element is missing | Warning message is displayed |
| SVG element exists but device does not | Rendered with **unknown** preview color |
| Empty search result | Empty state is displayed |
| Long text values | Wrapped safely without breaking the layout |
| Right-to-left text | Rendered correctly using automatic text direction |

Duplicate device identifiers are handled according to where they are used:

- **GET /api/devices/:id** returns the **first matching device**, because the mock API uses `Array.find()`.
- Preview mode stores devices inside a `Map`. If duplicate IDs exist, the **last occurrence** overrides previous entries for preview coloring.

The application is designed to continue running safely even when inconsistent or incomplete data is encountered.

---

# Performance Considerations

Several design choices were made to keep the application responsive:

- Debounced search requests
- HTTP request cancellation using `switchMap`
- Angular Signals minimize unnecessary UI updates
- Preview updates only SVG elements that are bound to devices
- Device lookup is performed only when necessary
- SVG preview colors are restored without reparsing the SVG

---

# AI Usage

AI tools (ChatGPT) were used as a development assistant for:

- discussing architecture
- reviewing implementation approaches
- generating and refining small code snippets
- improving documentation

All generated code was manually reviewed, adapted, tested and integrated before being added to the project.

---

# Future Improvements

- Unit and integration tests
- SVG upload support
- Zoom and pan
- Drag & drop labels
- Undo / Redo
- Tooltip preview actions
- WebSocket-based live device updates