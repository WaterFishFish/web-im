import lockr from "lockr";

export function setAuth(token) {
  lockr.set("token", token);
}

export function getAuth() {
  return lockr.get("token");
}

export function getUser() {
  return lockr.get("user");
}

export function setUser(user) {
  if (user) {
    lockr.set("user", user);
  }
}
