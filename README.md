# Iron Log

**A gym tracker that stays on your phone.**

📄 **[ironlog product page →](https://joebrowse.github.io/IronLogV3/)**

Log your sets. See what has recovered. Watch the numbers go up. No account,
no cloud, nothing uploaded — Iron Log has no server to upload anything to.

---

## What it is

An offline-first Android workout tracker, built with React and wrapped with
Capacitor. Everything lives in your device's own storage.

* **Muscle readiness** — an anatomical body map, front and rear, shaded by
  what is actually recovered. Every muscle has its own recovery window, and
  how hard you trained it decides which one applies.
* **Guided workouts** — pick a split and Iron Log builds the session, ranked
  by the exercise order you set and weighted toward what has recovered.
* **Programmes** — multi-week plans followed day by day, including presets
  like Push/Pull/Legs and Project Arms. Build your own or edit any of them.
* **Progress charts** — estimated 1RM over time per exercise, grouped by
  muscle, with machines and variations tracked separately.
* **Simple and Advanced modes** — start with sets, reps and weight; add RIR,
  machine tracking, volume analysis and 1RM testing when you want them.

## Privacy

The privacy is structural rather than promised:

* There is no Iron Log server and no Iron Log account.
* No analytics, no tracking, no ads, no third-party data collection.
* The only network call is to Google Play, occasionally, to ask whether this
  account is subscribed.
* Backup writes plain JSON to your Downloads folder — your data, readable.
* Cancelling the subscription stops the app; it does not take your history.

Full policy: [docs/privacy-policy.md](docs/privacy-policy.md)

## Pricing

Free to install, with a 7-day free trial run by Google Play — cancel before
it ends and you are not charged. After that it is a subscription, monthly or
annual, cancellable at any time in Google Play.

Prices are set in Play Console and shown in your own currency inside the app.
No price is hard-coded anywhere in this repository.

## Building it

```bash
npm install
npm run dev     # local dev server
npm run lint    # JSX parse check
npm run build   # production bundle into dist/
```

The Android app is produced by wrapping `dist/` with Capacitor. This repo
carries no build workflow and no signing keys — see "About this repository".

## About this repository

This is the public mirror of Iron Log. It carries the application source, the
assets, the privacy policy and the product page — everything needed to read,
build and understand the app.

It deliberately does **not** carry the release automation. Debug builds of Iron
Log are compiled with the paywall switched off so that testers can side-load
them, which makes a debug APK a free, fully unlocked copy of a paid app. Build
artifacts attached to a public repository are downloadable by anyone, so the
workflow that produces them lives in the private repository instead.

## Third-party attribution

The muscle readiness map is drawn using the region data from
[body-muscles](https://github.com/vulovix/body-muscles) by Ivan Vulović, used
under the Apache License 2.0. See [NOTICE](NOTICE).

## AI assistance disclaimer

Iron Log was developed with the assistance of Claude AI (Anthropic), used as a
coding assistant to help generate, review, debug and improve parts of the
application. The concept, requirements, testing and final decisions were
directed by the developer. All generated code was reviewed before inclusion.
No user data, private information or device data was provided to Claude during
development.
