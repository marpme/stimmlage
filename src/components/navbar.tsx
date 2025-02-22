import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import { UpdateIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { useLatestUpdateTime } from "@/hooks/useLatestUpdateTime.ts";
import { usePollData } from "@/hooks/usePollData.ts";

export const Navbar = () => {
  const { data: lastUpdatedData } = useLatestUpdateTime();
  const { refetch: refetchPollData, isFetching: pollDataIsFetching } =
    usePollData();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarBrand className="gap-3 max-w-fit">
        <Link
          className="flex justify-start items-center gap-1"
          color="foreground"
          href="/"
        >
          <Logo />
        </Link>
      </NavbarBrand>
      <NavbarContent />
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
    </HeroUINavbar>
  );
};
