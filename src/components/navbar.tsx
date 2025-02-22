import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, HeartFilledIcon, UpdateIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { useLatestUpdateTime } from "@/hooks/useLatestUpdateTime.ts";
import { usePollData } from "@/hooks/usePollData.ts";
import { Tooltip } from "@heroui/react";

export const Navbar = () => {
  const { data: lastUpdated } = useLatestUpdateTime();
  const { refetch: refetchPollData, isFetching: pollDataIsFetching } =
    usePollData();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem>
          <Button>
            <ThemeSwitch />
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isLoading={pollDataIsFetching}
            onPress={() => refetchPollData()}
          >
            {pollDataIsFetching ? null : <UpdateIcon />}
            {pollDataIsFetching ? "updating" : lastUpdated}
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <NavbarMenuItem>
          <div className="my-2 flex flex-row align-middle justify-evenly gap-2">
            <Tooltip>
              <Button
                isLoading={pollDataIsFetching}
                onPress={() => refetchPollData()}
              >
                {pollDataIsFetching ? null : <UpdateIcon />}
                {pollDataIsFetching ? "updating" : lastUpdated}
              </Button>
            </Tooltip>
          </div>
        </NavbarMenuItem>

        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
