import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={`
          z-50 min-w-[8rem] overflow-hidden rounded-md border 
          bg-white p-1 shadow-md
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          ${className}
        `}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
);

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={`
        relative flex cursor-default select-none items-center rounded-sm
        px-2 py-1.5 text-sm outline-none transition-colors
        focus:bg-gray-100 data-[disabled]:pointer-events-none
        data-[disabled]:opacity-50
        ${inset ? "pl-8" : ""}
        ${className}
      `}
      {...props}
    />
  )
);

const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={`
        px-2 py-1.5 text-sm font-semibold
        ${inset ? "pl-8" : ""}
        ${className}
      `}
      {...props}
    />
  )
);

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={`
        -mx-1 my-1 h-px bg-gray-200
        ${className}
      `}
      {...props}
    />
  )
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuRadioGroup,
};