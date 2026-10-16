# Tip or Skip

Tipping calculator plus "should I tip for this?" guidance for 61 US services. Built with Expo SDK 58 (React Native 0.88).

This folder is source code. A computer turns it into something a phone can run, either live through the Expo Go app (Part 1) or as an installable APK file (Part 2).

---

## Part 1: Run it on your phone with Expo Go

### Step 1. Check that Node.js installed

Open a terminal (see Step 3 for how) and type:

```
node -v
```

Press Enter. You should see a version number such as `v22.x.x`. If you get "not recognized" or "command not found", restart the computer and try again, or reinstall Node.js from nodejs.org.

### Step 2. Put the project folder on the computer

1. On the computer, download `tip-or-skip.zip` from the Claude chat.
2. Extract it:
   - **Windows:** right-click the zip and choose **Extract All**.
   - **Mac:** double-click the zip.
3. You now have a folder named `tip-or-skip`. Inside it you should see `App.tsx`, `package.json`, and a `src` folder. If you see another `tip-or-skip` folder inside the first one, open it. That inner one is the right folder.

### Step 3. Open a terminal inside the project folder

All of the commands below must run from inside this folder.

- **Windows:** open the `tip-or-skip` folder in File Explorer. Click the address bar at the top, type `cmd`, and press Enter. A Command Prompt window opens already pointed at the folder. Use Command Prompt rather than PowerShell, which sometimes blocks `npx` scripts.
- **Mac:** open the **Terminal** app (press Cmd + Space, type `Terminal`, press Enter). Type `cd` followed by a space. Drag the `tip-or-skip` folder from Finder into the Terminal window, then press Enter.

To confirm you're in the right place, run `dir` (Windows) or `ls` (Mac). You should see `package.json` in the list.

### Step 4. Install the project's packages (first time only)

```
npm install
```

This downloads everything the app depends on into a new `node_modules` folder. It takes a few minutes. Warnings about "vulnerabilities" or "deprecated" packages are normal and safe to ignore. It's finished when you get your command prompt back.

### Step 5. Start the app server

```
npx expo start
```

After a moment, a QR code appears in the terminal. Leave this window open. It is serving the app to your phone, and closing it stops the app.

On Windows, if a firewall prompt asks whether to allow Node.js, allow it. Otherwise your phone can't connect.

### Step 6. Open it on your phone

1. Install **Expo Go** from the Google Play Store.
2. Make sure the phone is on the **same Wi-Fi network** as the computer.
3. Open Expo Go and use its QR code scanner on the code in the terminal.
4. The first load takes up to a minute while the app transfers. Then Tip or Skip opens.

### Stopping and starting again later

- To stop: click in the terminal window and press **Ctrl + C**.
- Next time: open a terminal in the folder (Step 3) and run `npx expo start`. You don't need `npm install` again.

### If something goes wrong

| Problem | Fix |
|---|---|
| Phone can't connect or loads forever | Stop the server (Ctrl + C) and run `npx expo start --tunnel`. This routes through the internet instead of your Wi-Fi, which helps on office and guest networks. If it asks to install a tunnel package, answer yes. |
| Expo Go says the project is incompatible | Update Expo Go in the Play Store. |
| `npm` or `npx` is "not recognized" | Node.js isn't installed or the terminal was opened before installing. Close the terminal, reopen it, and check Step 1. |
| PowerShell says scripts are disabled | Use Command Prompt instead (Step 3, Windows). |
| `npm install` fails partway | Delete the `node_modules` folder and run `npm install` again. |

---

## Part 2: Build an APK you can install and share

An APK is a standalone Android app file. Anyone with an Android phone can install it without Expo Go or a computer. Expo builds it in their cloud for free, so you don't need Android Studio. You only need the terminal from Part 1.

### Step 1. Create a free Expo account

Sign up at expo.dev. Remember the username and password.

### Step 2. Log in from the terminal

In a terminal opened inside the project folder (Part 1, Step 3):

```
npx eas-cli@latest login
```

Enter your Expo username and password when it asks. The password won't show as you type. That's normal.

### Step 3. Start the build

```
npx eas-cli@latest build -p android --profile preview
```

The first time, it asks a few setup questions:

- Whether to create a project for this app on your Expo account: answer **Y**.
- Whether to generate a new Android keystore (the key that signs the app): answer **Y**. Expo stores it for you, and future updates must be signed with the same key.

The code then uploads and the build runs on Expo's servers. Free accounts wait in a queue, so this can take a while. The terminal shows a link to the build's page on expo.dev, where you can follow progress. You can close the terminal at this point, and the build keeps going.

### Step 4. Install it on your phone

When the build finishes, the build page on expo.dev has an install link and a QR code.

1. Open that link on your Android phone, or scan the QR code with the phone's camera.
2. Download the `.apk` file and tap it to install.
3. Android asks you to allow installing apps from that source (usually your browser or file manager). Allow it.
4. Google Play Protect may warn that the app is from an unknown developer. That's expected for apps not from the Play Store. Choose to install anyway.

### Step 5. Share it

Send people the build page link from expo.dev, or send the `.apk` file itself. They follow Step 4 on their phones.

- APKs only work on **Android**. iPhone users need an iOS build through TestFlight or the App Store, which requires an Apple Developer account.
- When you change the app, run the build command again and share the new link. Each build is a new download.

---

## Project layout

```
App.tsx                     tab bar, shared calculator state, service sheet
src/data/services.ts        the service catalog (verdict, norm, notes, sources)
src/data/surveys.ts         Pew 2023 and Bankrate 2025 figures
src/lib/tip.ts              tip math, rounding, split, tip button options
src/lib/search.ts           fuzzy search over names and aliases
src/lib/storage.ts          on-device storage for poll answers and requests
src/screens/                Calculator, Services, Data, ServiceSheet
src/components/ui.tsx       shared buttons, inputs, pills, bar charts
eas.json                    cloud build settings ("preview" makes an APK)
```

## Before a public launch

- Entries tagged "Common US guidance" in `services.ts` need a source check.
- Poll answers and service requests are stored on each phone only. Shared community stats need a backend (Supabase is a good fit).
- The app icon and splash screen are still the Expo defaults in `assets/`.
