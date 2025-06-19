# Performance Benchmarks

This document lists expected rendering benchmarks for Vikunja's frontend and potential optimization strategies to keep the application responsive as data grows.

## Expected Benchmarks
- The main dashboard should become interactive roughly within 200 ms after the JavaScript bundle executes on modern browsers.
- Switching between task lists should keep frame times under 16 ms to maintain 60 FPS whenever possible.
- Loading a list with up to 500 tasks should finish API processing in under 150 ms on typical server hardware.

## Optimization Strategies
- Enable HTTP/2 or HTTP/3 for faster asset delivery.
- Use server-side caching and ETags to avoid sending unchanged payloads.
- Lazy-load routes and components in the frontend using dynamic imports.
- Keep bundles small by removing unused dependencies and enabling tree shaking.
- Profile slow database queries with `EXPLAIN` and add indexes where necessary.
- Measure expensive components in browser dev tools and avoid unnecessary re-renders.

Regularly revisiting these benchmarks helps ensure Vikunja performs well even with large task collections.
