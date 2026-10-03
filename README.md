# SnapCalorie (Phone-Test PWA)

SnapCalorie is a free, camera-first calorie tracker built for quick phone testing.

## Features

- Camera-first meal logging with a snap workflow
- Calories remaining at the top based on a daily goal
- Swipe-up memories/history drawer for today's meals
- Manual meal entry for forgotten meals
- Edit and delete meal entries
- Local browser storage (no backend required)
- Installable PWA support with offline caching

> AI food recognition is not implemented yet and will be added in a future version.

## Run locally

You can run SnapCalorie with any static server from the repository root.

Example using Python:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Test on a phone

1. Ensure your phone and computer are on the same Wi-Fi network.
2. Find your computer LAN IP address.
3. Start the local server from this repository (for example `python3 -m http.server 8080`).
4. On your phone browser, open `http://<YOUR_LAN_IP>:8080`.
5. Accept camera permission and test meal logging.
6. Install the app from the browser menu ("Add to Home Screen" / "Install app").

## Data and privacy

All data is stored only in local browser storage on the device.
