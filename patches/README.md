# Patch Archive

This directory contains base64-encoded, xz-compressed diffs from the shared ancestor commit `07272f6cdc886671064c1779f69c5550eec7623c` to the listed branch tips.

## Decode & Apply

```bash
# decode and decompress
destination_patch="output.patch"
base64 -d <file>.diff.xz.base64 | xz -d > "$destination_patch"

# apply (binary safe)
git apply --binary "$destination_patch"
```

All diff metadata is captured in the accompanying `.md` files.
