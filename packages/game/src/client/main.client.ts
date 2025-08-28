// Minimal rbxts client entry
print("Hello from client! SOOsOO COwwOOOL 22");
import { MAGIC_NUMBER } from "./client-helpers";
import { clamp } from "../shared/utils"
print(MAGIC_NUMBER);

const otherNumber = clamp(MAGIC_NUMBER + 10, 0, 100);
print(otherNumber);