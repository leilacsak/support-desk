import { AppError } from "../errors/AppError.js";
import * as userRepository from "../repositories/userRepository.js";
import { hashPassword } from "../auth/passwords.js";
import { signAccessToken } from "../auth/tokens.js";

export async function register({ email, name, password }) {
  // TODO 1: missing fields -> AppError.validation
  if (!email || !name || !password) {
    throw new AppError("Email, name, and password are required", 400);
  }
  // TODO 2: password too short -> AppError.validation
  if (password.length < 8) {
    throw AppError.validation(
      "Password must be at least 8 characters long",
      400,
    );
  }
  // TODO 3: hash it
  const passwordHash = await hashPassword(password);

  // TODO 4: create user, sign token, return { user, token }
  try {
    const user = await userRepository.create({
      email,
      name,
      passwordHash,
    });
    const token = await signAccessToken(user);
    return { user, token };
  } catch (error) {
    // TODO 5: duplicate email -> AppError.conflict
    if (error.code === "23505") {
      throw AppError.conflict("Email already exists");
    }

    // TODO 6: otherwise rethrow
    throw error;
  }
}
