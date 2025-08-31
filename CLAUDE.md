# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React-based EXIF Location Viewer that plots geo-tagged images on an interactive map using their GPS coordinates extracted from EXIF data.

### Core Data Flow
1. **File Input**: Users drag & drop images onto the application
2. **EXIF Processing**: `ExifReader` extracts GPS coordinates and thumbnails from image EXIF data
3. **Clustering**: Photos at similar locations are grouped using a distance-based clustering algorithm (`consolidateMarkers`)
4. **Map Rendering**: Photo groups are displayed as markers on a MapLibre GL map
5. **Detail View**: Clicking markers opens a side pane showing all photos in that cluster

### Key Components

**App.tsx** - Main application component that:
- Handles drag & drop file processing
- Manages state for photos, selected groups, and zoom levels
- Implements dynamic clustering based on zoom level (`6 / 2 ** zoom`)
- Renders the map with photo markers and optional detail pane

**PhotoGroupPane.tsx** - Side panel component for viewing photo clusters:
- Displays selected photo in large view
- Shows thumbnail strip for navigation within the group
- Uses `FileImage` component for memory-efficient image rendering with URL cleanup

**types.tsx** - Core type definitions:
- `Photo`: Individual image with GPS coordinates, thumbnail, and file reference
- `PhotoGroup`: Clustered photos with representative thumbnail and location

### Technical Details

- **Map Provider**: Uses OpenStreetMap Japan style via MapLibre GL
- **File Processing**: Asynchronous EXIF reading with ArrayBuffer conversion
- **Clustering Algorithm**: Euclidean distance-based grouping that adapts to zoom level
- **Memory Management**: Proper cleanup of object URLs for image rendering
- **Styling**: TailwindCSS v4 with Vite plugin integration

### State Management

The application uses React useState for:
- `photos`: Array of processed photos with GPS data
- `selectedGroup`: Currently viewed photo cluster
- `zoom`: Current map zoom level (affects clustering threshold)
- `isOverlayVisible`: Controls drag & drop instruction overlay