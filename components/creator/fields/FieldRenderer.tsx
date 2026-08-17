"use client";

import type { SectionField } from "@/types/gift";
import { TextField, TextAreaField } from "./TextField";
import { DateField } from "./DateField";
import { PinField } from "./PinField";
import { PhoneField } from "./PhoneField";
import { SelectField } from "./SelectField";
import { ThemePickerField } from "./ThemePickerField";
import { WrapPickerField } from "./WrapPickerField";
import { CakePickerField } from "./CakePickerField";
import { MoodPickerField } from "./MoodPickerField";
import { MediaUploadField } from "./MediaUploadField";
import { MemoriesField } from "./MemoriesField";
import { ListField } from "./ListField";
import { WishListField } from "./WishListField";
import { MilestoneListField } from "./MilestoneListField";
import { ToggleGroupField } from "./ToggleGroupField";

/**
 * Dispatches a single field config to its concrete input component. This is
 * the crux of the config-driven wizard (spec section 69): every occasion's
 * sections are just data, and this switch is the only place that has to
 * know how a `FieldType` renders.
 */
export function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SectionField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return <TextField field={field} value={value as string} onChange={onChange} />;
    case "textarea":
      return <TextAreaField field={field} value={value as string} onChange={onChange} />;
    case "date":
      return <DateField field={field} value={value as string} onChange={onChange} />;
    case "pin":
      return <PinField field={field} value={value as string} onChange={onChange} />;
    case "phone":
      return <PhoneField field={field} value={value as string} onChange={onChange} />;
    case "select":
      return <SelectField field={field} value={value as string} onChange={onChange} />;
    case "theme-picker":
      return <ThemePickerField field={field} value={value as string} onChange={onChange} />;
    case "wrap-picker":
      return <WrapPickerField field={field} value={value as string} onChange={onChange} />;
    case "cake-picker":
      return <CakePickerField field={field} value={value as string} onChange={onChange} />;
    case "mood-picker":
      return <MoodPickerField field={field} value={value as string} onChange={onChange} />;
    case "media-upload":
      return <MediaUploadField field={field} value={value as never} onChange={onChange} />;
    case "memory-list":
      return <MemoriesField field={field} value={value as never} onChange={onChange} />;
    case "list":
      return <ListField field={field} value={value as string[]} onChange={onChange} />;
    case "wish-list":
      return <WishListField field={field} value={value as string[]} onChange={onChange} />;
    case "milestone-list":
      return <MilestoneListField field={field} value={value as never} onChange={onChange} />;
    case "toggle-group":
      return <ToggleGroupField field={field} value={value as string[]} onChange={onChange} />;
    default:
      return null;
  }
}
