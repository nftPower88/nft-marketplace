export const DASHBOARD_SET_USERNAME = "DASHBOARD.SET_USERNAME";
export const DASHBOARD_SET_ACTIVE_USERS = "DASHBOARD.SET_ACTIVE_USERS";

export const setUsername = (username: string) => {
  return {
    type: DASHBOARD_SET_USERNAME,
    username,
  } as const;
};

export const setActiveUsers = (activeUsers: User[]) => {
  return {
    type: DASHBOARD_SET_ACTIVE_USERS,
    activeUsers,
  } as const;
};

export type Actions =
  | ReturnType<typeof setUsername>
  | ReturnType<typeof setActiveUsers>;
