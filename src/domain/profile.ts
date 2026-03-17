export interface OverviewSettings {
  limitToCurrentGoal: boolean;
}

export interface ProfileSettings {
  overview: OverviewSettings;
}

export const defaultProfileSettings: ProfileSettings = {
  overview: {
    limitToCurrentGoal: false,
  },
};
