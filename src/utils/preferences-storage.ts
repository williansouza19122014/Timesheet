export type PreferencesState = {
  weeklySummary: boolean;
  desktopReminders: boolean;
  notifyApprovals: boolean;
  vacationAlertThreshold: number;
};

const PREFERENCES_STORAGE_KEY = "timesheet-preferences";

export const DEFAULT_PREFERENCES: PreferencesState = {
  weeklySummary: true,
  desktopReminders: false,
  notifyApprovals: true,
  vacationAlertThreshold: 30,
};

export const loadPreferences = (): PreferencesState => {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<PreferencesState>;
    return {
      weeklySummary:
        typeof parsed.weeklySummary === "boolean" ? parsed.weeklySummary : DEFAULT_PREFERENCES.weeklySummary,
      desktopReminders:
        typeof parsed.desktopReminders === "boolean"
          ? parsed.desktopReminders
          : DEFAULT_PREFERENCES.desktopReminders,
      notifyApprovals:
        typeof parsed.notifyApprovals === "boolean"
          ? parsed.notifyApprovals
          : DEFAULT_PREFERENCES.notifyApprovals,
      vacationAlertThreshold:
        typeof parsed.vacationAlertThreshold === "number"
          ? parsed.vacationAlertThreshold
          : DEFAULT_PREFERENCES.vacationAlertThreshold,
    };
  } catch (error) {
    console.warn("Failed to parse preferences, using defaults", error);
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = (preferences: PreferencesState) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
};

export const getVacationAlertThreshold = (): number => loadPreferences().vacationAlertThreshold;
