import { Button } from "@heroui/button";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ThemeSwitch } from "@/components/theme-switch";
import { UpdateIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { useLatestUpdateTime } from "@/hooks/useLatestUpdateTime.ts";
import { usePollData } from "@/hooks/usePollData.ts";

const LANDTAG_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];

export const Navbar = () => {
  const { data: lastUpdatedData } = useLatestUpdateTime();
  const { data: pollData, refetch: refetchPollData, isFetching: pollDataIsFetching } = usePollData();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandtagActive = LANDTAG_IDS.some(
    (id) => location.pathname === `/parliament/${id}`,
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarBrand className="gap-3 max-w-fit">
        <Link
          to="/"
          className="flex justify-start items-center gap-1 text-foreground"
        >
          <Logo />
        </Link>
      </NavbarBrand>

      <NavbarContent className="gap-2" justify="center">
        {/* Bundestag */}
        <NavbarItem isActive={location.pathname === "/parliament/0"}>
          <Link
            to="/parliament/0"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/parliament/0"
                ? "text-primary"
                : "text-default-600 hover:text-foreground"
            }`}
          >
            Bundestag
          </Link>
        </NavbarItem>

        {/* Landtage dropdown */}
        <NavbarItem isActive={isLandtagActive}>
          <Dropdown>
            <DropdownTrigger>
              <button
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  isLandtagActive
                    ? "text-primary"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                Landtage ▾
              </button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Landtage"
              onAction={(key) => navigate(`/parliament/${key}`)}
            >
              {LANDTAG_IDS.filter((id) => pollData?.Parliaments[id]).map((id) => (
                <DropdownItem
                  key={id}
                  className={
                    location.pathname === `/parliament/${id}` ? "text-primary" : ""
                  }
                >
                  {pollData?.Parliaments[id]?.Name ?? id}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* EU */}
        <NavbarItem isActive={location.pathname === "/parliament/17"}>
          <Link
            to="/parliament/17"
            className={`text-sm font-medium transition-colors ${
              location.pathname === "/parliament/17"
                ? "text-primary"
                : "text-default-600 hover:text-foreground"
            }`}
          >
            EU
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="flex justify-end">
          <Button>
            <ThemeSwitch />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            isLoading={pollDataIsFetching}
            onPress={() => refetchPollData()}
          >
            {pollDataIsFetching ? null : <UpdateIcon />}
            {pollDataIsFetching
              ? "updating"
              : lastUpdatedData?.formatedLastUpdated}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
