"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
} from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "../../button";
import { SunIcon, MoonIcon, SunMoon } from "lucide-react";
const Toggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "system" ? (
        <SunMoon />
      ) : theme === "light" ? (
        <SunIcon />
      ) : (
        <MoonIcon />
      )}
    </Button>
  );
};

export default Toggle;
Toggle;
