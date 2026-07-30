export const up = (pgm) => {
  pgm.renameColumn("users", "last_login", "last_login_at");
};

export const down = (pgm) => {
  pgm.renameColumn("users", "last_login_at", "last_login");
};
