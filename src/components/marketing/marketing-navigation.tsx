import { useState } from "react";
import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useTheme } from "@/hooks/use-theme";
import { useHydrated } from "@/hooks/use-hydrated";
import { Button } from "@/components/ui/button";
export function MarketingNavigation() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  return (
    <header className="relative z-20 border-b bg-card/90">
      <nav
        aria-label="Marketing navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 md:px-8"
      >
        <Link
          to="/product"
          className="flex items-center gap-3"
          aria-label="Stack Atlas by Guidesoft"
        >
          <BrandLogo decorative className="size-11" />
          <span className="text-base font-semibold tracking-tight">
            Stack Atlas
            <span className="block text-[9px] font-medium uppercase tracking-[.22em] text-muted-foreground">
              by Guidesoft
            </span>
          </span>
        </Link>
        <div className="hidden items-center gap-7 text-xs font-medium text-muted-foreground md:flex">
          <a href="#features">Why Stack Atlas</a>
          <a href="#architecture">Architecture</a>
          <Link to="/docs">Documentation</Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            variant="ghost"
            size="icon"
            disabled={!hydrated}
            onClick={toggle}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground md:inline-flex"
          >
            Open control panel
            <ArrowUpRight size={14} />
          </Link>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button
                aria-label="Open navigation"
                className="md:hidden"
                variant="outline"
                size="icon"
                disabled={!hydrated}
              >
                <Menu size={18} />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal forceMount>
              <AnimatePresence>
                {open && (
                  <>
                    <Dialog.Overlay forceMount asChild>
                      <motion.div
                        key="overlay"
                        className="fixed inset-0 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.15 }}
                      />
                    </Dialog.Overlay>
                    <Dialog.Content forceMount asChild>
                      <motion.div
                        key="drawer"
                        className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,360px)] flex-col border-l bg-card p-6 shadow-xl"
                        initial={{ x: reduced ? 0 : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: reduced ? 0 : "100%" }}
                        transition={
                          reduced
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 360, damping: 36 }
                        }
                      >
                        <Dialog.Title className="text-lg font-semibold">
                          Explore Stack Atlas
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-xs text-muted-foreground">
                          Find your tools. Keep control of your agents.
                        </Dialog.Description>
                        <Dialog.Close
                          className="absolute top-5 right-5 rounded-md p-2"
                          aria-label="Close navigation"
                        >
                          <X size={18} />
                        </Dialog.Close>
                        <BrandLogo className="my-8 size-16" />
                        <div className="flex flex-col gap-2 text-sm">
                          <a
                            href="#features"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-3 hover:bg-secondary"
                          >
                            Why Stack Atlas
                          </a>
                          <a
                            href="#architecture"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-3 hover:bg-secondary"
                          >
                            Architecture
                          </a>
                          <Link
                            to="/docs"
                            onClick={() => setOpen(false)}
                            className="rounded-lg p-3 hover:bg-secondary"
                          >
                            Documentation
                          </Link>
                          <Link
                            to="/"
                            onClick={() => setOpen(false)}
                            className="mt-3 rounded-lg bg-primary p-3 text-center font-medium text-primary-foreground"
                          >
                            Open control panel
                          </Link>
                        </div>
                        <p className="mt-auto pt-8 text-xs leading-6 text-muted-foreground">
                          Live execution is not enabled. Explore the workspace and review the setup
                          requirements.
                        </p>
                      </motion.div>
                    </Dialog.Content>
                  </>
                )}
              </AnimatePresence>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </nav>
    </header>
  );
}
