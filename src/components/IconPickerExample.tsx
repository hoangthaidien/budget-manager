"use client";
import { useState } from "react";
import { IconPicker, Icon, type IconName } from "@/components/ui/icon-picker";

export function IconPickerExample() {
  const [icon, setIcon] = useState<IconName | undefined>(undefined);
  return (
    <div className="flex flex-col gap-2 items-center">
      <IconPicker
        value={icon}
        onValueChange={(icon) => setIcon(icon)}
        className="w-fit"
      />
      <div className="flex items-center gap-2">
        Selected icon:{" "}
        {icon ? (
          <>
            <Icon name={icon} /> {icon}
          </>
        ) : (
          "None"
        )}
      </div>
    </div>
  );
}
