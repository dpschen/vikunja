# Progress Indicator Concept

To improve transparency for long running actions, Vikunja could show progress indicators to users.
This document outlines possible areas to integrate them.

## Candidates for Progress Indicators

### 1. Importing and Exporting Data
- Show a progress bar when importing tasks from other services or exporting data.
- Indicate steps such as file upload, validation and finalization.

### 2. Bulk Operations
- Display progress while moving or duplicating many tasks at once.
- Provide feedback for large archive or delete actions.

### 3. Background Jobs
- Notify users about background job status, e.g. recurring task creation or reminder sending.
- Consider a small status widget listing running jobs with completion percentage.

### 4. File Uploads
- When attachments are uploaded, show upload progress per file.

### 5. Synchronization
- If syncing with external services (CalDAV, mobile apps), indicate sync progress.

## UI Considerations
- Progress bars should be lightweight and not block navigation.
- Use consistent styles across web, desktop and mobile clients.
- Provide textual status for screen readers.

## Implementation Notes
- Backend endpoints could expose progress via WebSockets or a polling API.
- Frontend components subscribe to updates and render progress bars.
- Ensure progress tracking has minimal performance impact when disabled.

