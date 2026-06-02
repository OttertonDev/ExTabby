import { createComponent } from '@lit/react';
import React from 'react';

// Buttons
import { MdFilledButton } from '@material/web/button/filled-button.js';
import { MdOutlinedButton } from '@material/web/button/outlined-button.js';
import { MdTextButton } from '@material/web/button/text-button.js';
import { MdElevatedButton } from '@material/web/button/elevated-button.js';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button.js';

// Text fields
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';
import { MdFilledTextField } from '@material/web/textfield/filled-text-field.js';

// Checkboxes and radio
import { MdCheckbox } from '@material/web/checkbox/checkbox.js';
import { MdRadio } from '@material/web/radio/radio.js';

// Switch
import { MdSwitch } from '@material/web/switch/switch.js';

// Chips
import { MdAssistChip } from '@material/web/chips/assist-chip.js';
import { MdFilterChip } from '@material/web/chips/filter-chip.js';
import { MdInputChip } from '@material/web/chips/input-chip.js';
import { MdSuggestionChip } from '@material/web/chips/suggestion-chip.js';

// Dialog
import { MdDialog } from '@material/web/dialog/dialog.js';

// Progress
import { MdLinearProgress } from '@material/web/progress/linear-progress.js';
import { MdCircularProgress } from '@material/web/progress/circular-progress.js';

// Lists
import { MdList } from '@material/web/list/list.js';
import { MdListItem } from '@material/web/list/list-item.js';

// Divider
import { MdDivider } from '@material/web/divider/divider.js';

// Icon button
import { MdIconButton } from '@material/web/iconbutton/icon-button.js';
import { MdFilledIconButton } from '@material/web/iconbutton/filled-icon-button.js';
import { MdFilledTonalIconButton } from '@material/web/iconbutton/filled-tonal-icon-button.js';
import { MdOutlinedIconButton } from '@material/web/iconbutton/outlined-icon-button.js';

// Tabs
import { MdPrimaryTab } from '@material/web/tabs/primary-tab.js';
import { MdSecondaryTab } from '@material/web/tabs/secondary-tab.js';
import { MdTabs } from '@material/web/tabs/tabs.js';

// Slider
import { MdSlider } from '@material/web/slider/slider.js';

// Menu
import { MdMenu } from '@material/web/menu/menu.js';
import { MdMenuItem } from '@material/web/menu/menu-item.js';
import { MdSubMenu } from '@material/web/menu/sub-menu.js';

// Select
import { MdOutlinedSelect } from '@material/web/select/outlined-select.js';
import { MdFilledSelect } from '@material/web/select/filled-select.js';
import { MdSelectOption } from '@material/web/select/select-option.js';

// Buttons
export const FilledButton = createComponent({
  tagName: 'md-filled-button',
  elementClass: MdFilledButton,
  react: React,
});

export const OutlinedButton = createComponent({
  tagName: 'md-outlined-button',
  elementClass: MdOutlinedButton,
  react: React,
});

export const TextButton = createComponent({
  tagName: 'md-text-button',
  elementClass: MdTextButton,
  react: React,
});

export const ElevatedButton = createComponent({
  tagName: 'md-elevated-button',
  elementClass: MdElevatedButton,
  react: React,
});

export const FilledTonalButton = createComponent({
  tagName: 'md-filled-tonal-button',
  elementClass: MdFilledTonalButton,
  react: React,
});

// Text fields
export const OutlinedTextField = createComponent({
  tagName: 'md-outlined-text-field',
  elementClass: MdOutlinedTextField,
  react: React,
  events: {
    onInput: 'input',
    onChange: 'change',
  }
});

export const FilledTextField = createComponent({
  tagName: 'md-filled-text-field',
  elementClass: MdFilledTextField,
  react: React,
  events: {
    onInput: 'input',
    onChange: 'change',
  }
});

// Checkboxes and radio
export const Checkbox = createComponent({
  tagName: 'md-checkbox',
  elementClass: MdCheckbox,
  react: React,
  events: {
    onChange: 'change',
  }
});

export const Radio = createComponent({
  tagName: 'md-radio',
  elementClass: MdRadio,
  react: React,
  events: {
    onChange: 'change',
  }
});

// Switch
export const Switch = createComponent({
  tagName: 'md-switch',
  elementClass: MdSwitch,
  react: React,
  events: {
    onChange: 'change',
  }
});

// Chips
export const AssistChip = createComponent({
  tagName: 'md-assist-chip',
  elementClass: MdAssistChip,
  react: React,
});

export const FilterChip = createComponent({
  tagName: 'md-filter-chip',
  elementClass: MdFilterChip,
  react: React,
  events: {
    onChange: 'change',
  }
});

export const InputChip = createComponent({
  tagName: 'md-input-chip',
  elementClass: MdInputChip,
  react: React,
});

export const SuggestionChip = createComponent({
  tagName: 'md-suggestion-chip',
  elementClass: MdSuggestionChip,
  react: React,
});

// Dialog
export const Dialog = createComponent({
  tagName: 'md-dialog',
  elementClass: MdDialog,
  react: React,
  events: {
    onOpen: 'open',
    onOpened: 'opened',
    onClose: 'close',
    onClosed: 'closed',
    onCancel: 'cancel',
  }
});

// Progress
export const LinearProgress = createComponent({
  tagName: 'md-linear-progress',
  elementClass: MdLinearProgress,
  react: React,
});

export const CircularProgress = createComponent({
  tagName: 'md-circular-progress',
  elementClass: MdCircularProgress,
  react: React,
});

// Lists
export const List = createComponent({
  tagName: 'md-list',
  elementClass: MdList,
  react: React,
});

export const ListItem = createComponent({
  tagName: 'md-list-item',
  elementClass: MdListItem,
  react: React,
});

// Divider
export const Divider = createComponent({
  tagName: 'md-divider',
  elementClass: MdDivider,
  react: React,
});

// Icon buttons
export const IconButton = createComponent({
  tagName: 'md-icon-button',
  elementClass: MdIconButton,
  react: React,
});

export const FilledIconButton = createComponent({
  tagName: 'md-filled-icon-button',
  elementClass: MdFilledIconButton,
  react: React,
});

export const FilledTonalIconButton = createComponent({
  tagName: 'md-filled-tonal-icon-button',
  elementClass: MdFilledTonalIconButton,
  react: React,
});

export const OutlinedIconButton = createComponent({
  tagName: 'md-outlined-icon-button',
  elementClass: MdOutlinedIconButton,
  react: React,
});

// Tabs
export const PrimaryTab = createComponent({
  tagName: 'md-primary-tab',
  elementClass: MdPrimaryTab,
  react: React,
});

export const SecondaryTab = createComponent({
  tagName: 'md-secondary-tab',
  elementClass: MdSecondaryTab,
  react: React,
});

export const Tabs = createComponent({
  tagName: 'md-tabs',
  elementClass: MdTabs,
  react: React,
  events: {
    onChange: 'change',
  }
});

// Slider
export const Slider = createComponent({
  tagName: 'md-slider',
  elementClass: MdSlider,
  react: React,
  events: {
    onInput: 'input',
    onChange: 'change',
  }
});

// Menu
export const Menu = createComponent({
  tagName: 'md-menu',
  elementClass: MdMenu,
  react: React,
  events: {
    onOpening: 'opening',
    onOpened: 'opened',
    onClosing: 'closing',
    onClosed: 'closed',
  }
});

export const MenuItem = createComponent({
  tagName: 'md-menu-item',
  elementClass: MdMenuItem,
  react: React,
});

export const SubMenu = createComponent({
  tagName: 'md-sub-menu',
  elementClass: MdSubMenu,
  react: React,
});

// Select
export const OutlinedSelect = createComponent({
  tagName: 'md-outlined-select',
  elementClass: MdOutlinedSelect,
  react: React,
  events: {
    onChange: 'change',
    onInput: 'input',
  }
});

export const FilledSelect = createComponent({
  tagName: 'md-filled-select',
  elementClass: MdFilledSelect,
  react: React,
  events: {
    onChange: 'change',
    onInput: 'input',
  }
});

export const SelectOption = createComponent({
  tagName: 'md-select-option',
  elementClass: MdSelectOption,
  react: React,
});
