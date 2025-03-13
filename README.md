# TakiAcademy Calculator

A calculator app for teachers to grade students.

## App Name Localization

The app name is localized based on the selected language. The app name is defined in the i18n locale files:

- English: "TakiAcademy Calculator"
- French: "Calculatrice TakiAcademy"
- Arabic: "حاسبة تاكي أكاديمي"

### How it works

1. The app name is defined in the i18n locale files under the `appName` key.
2. When the app starts, the `updateAppName` function is called to set the app name based on the current language.
3. When the user changes the language in the settings, the `updateAppName` function is called again to update the app name.

### Implementation details

- On Android, the app name is updated using the `setAndroidApplicationLabel` function from the `expo-application` package.
- On iOS, the app name cannot be changed at runtime. The app name is set in the `Info.plist` file during the build process.

### Usage

To get the localized app name in your code, use the `getLocalizedAppName` function:

```typescript
import { getLocalizedAppName } from '@/utils/appName';

const appName = getLocalizedAppName();
```

To update the app name based on the current language, use the `updateAppName` function:

```typescript
import { updateAppName } from '@/utils/appName';

updateAppName();
```

## Features

- Calculator for grading students
- Multiple languages support (English, French, Arabic)
- Customizable buttons and point values
- Dark and light mode
- Save and share grading sessions
