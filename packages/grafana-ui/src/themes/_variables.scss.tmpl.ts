// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
/* eslint-disable max-len */

import { GrafanaTheme2 } from '@grafana/data';
import { renderGeneratedFileBanner } from '../utils/generatedFileBanner';

export const commonThemeVarsTemplate = (theme: GrafanaTheme2) =>
  `${renderGeneratedFileBanner('grafana-ui/src/themes/default.ts', 'grafana-ui/src/themes/_variables.scss.tmpl.ts')}
// Options
//
// Quickly modify global styling by enabling or disabling optional features.

$enable-flex: true !default;
$enable-hover-media-query: false !default;

// Spacing
//
// Control the default styling of most Bootstrap elements by modifying these
// variables. Mostly focused on spacing.

$space-inset-squish-md: ${theme.v1.spacing.insetSquishMd} !default;

$space-xxs: ${theme.v1.spacing.xxs} !default;
$space-xs: ${theme.v1.spacing.xs} !default;
$space-sm: ${theme.v1.spacing.sm} !default;
$space-md: ${theme.v1.spacing.md} !default;
$space-lg: ${theme.v1.spacing.lg} !default;
$space-xl: ${theme.v1.spacing.xl} !default;

$spacer: ${theme.v1.spacing.d} !default;
$spacer-x: $spacer !default;
$spacer-y: $spacer !default;
$spacers: (
  0: (
    x: 0,
    y: 0,
  ),
  1: (
    x: $spacer-x,
    y: $spacer-y,
  ),
  2: (
    x: (
      $spacer-x * 1.5,
    ),
    y: (
      $spacer-y * 1.5,
    ),
  ),
  3: (
    x: (
      $spacer-x * 3,
    ),
    y: (
      $spacer-y * 3,
    ),
  ),
) !default;

// Grid breakpoints
//
// Define the minimum and maximum dimensions at which your layout will change,
// adapting to different screen sizes, for use in media queries.

$grid-breakpoints: (
  xs: ${theme.v1.breakpoints.xs},
  sm: ${theme.v1.breakpoints.sm},
  md: ${theme.v1.breakpoints.md},
  lg: ${theme.v1.breakpoints.lg},
  xl: ${theme.v1.breakpoints.xl},
) !default;

// Grid containers
//
// Define the maximum width of \`.container\` for different screen sizes.

$container-max-widths: (
  sm: 576px,
  md: 720px,
  lg: 940px,
  xl: 1080px,
) !default;

// Grid columns
//
// Set the number of columns and specify the width of the gutters.

$grid-columns: 12 !default;
$grid-gutter-width: ${theme.v1.spacing.gutter} !default;

// Component heights
// -------------------------
$height-sm: ${theme.v1.height.sm};
$height-md: ${theme.v1.height.md};
$height-lg: ${theme.v1.height.lg};

// Typography
// -------------------------
/* stylelint-disable-next-line string-quotes */
$font-family-sans-serif: ${theme.v1.typography.fontFamily.sansSerif};
/* stylelint-disable-next-line string-quotes */
$font-family-monospace: ${theme.v1.typography.fontFamily.monospace};

$font-size-base: ${theme.v1.typography.size.base} !default;

$font-size-lg: ${theme.v1.typography.size.lg} !default;
$font-size-md: ${theme.v1.typography.size.md} !default;
$font-size-sm: ${theme.v1.typography.size.sm} !default;
$font-size-xs: ${theme.v1.typography.size.xs} !default;

$line-height-base: ${theme.v1.typography.lineHeight.md} !default;

$font-weight-regular: ${theme.v1.typography.weight.regular} !default;
$font-weight-semi-bold: ${theme.v1.typography.weight.semibold} !default;

$font-size-h1: ${theme.v1.typography.heading.h1} !default;
$font-size-h2: ${theme.v1.typography.heading.h2} !default;
$font-size-h3: ${theme.v1.typography.heading.h3} !default;
$font-size-h4: ${theme.v1.typography.heading.h4} !default;
$font-size-h5: ${theme.v1.typography.heading.h5} !default;
$font-size-h6: ${theme.v1.typography.heading.h6} !default;

$headings-line-height: ${theme.v1.typography.lineHeight.sm} !default;

// Components
//
// Define common padding and border radius sizes and more.

$border-width: ${theme.v1.border.width.sm} !default;

$border-radius: ${theme.v1.border.radius.sm} !default;
$border-radius-lg: ${theme.v1.border.radius.lg} !default;
$border-radius-sm: ${theme.v1.border.radius.sm} !default;

// Page

$page-sidebar-width: 154px;
$page-sidebar-margin: 56px;

// Links
// -------------------------
$link-decoration: ${theme.v1.typography.link.decoration} !default;
$link-hover-decoration: ${theme.v1.typography.link.hoverDecoration} !default;

// Forms
$input-line-height: 18px !default;
$input-border-radius: $border-radius;
$input-padding: 0 ${theme.v1.spacing.sm};
$input-height: 32px !default;

$cursor-disabled: not-allowed !default;

// Form validation icons
$form-icon-success: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%235cb85c' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3E%3C/svg%3E") !default;
$form-icon-warning: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23f0ad4e' d='M4.4 5.324h-.8v-2.46h.8zm0 1.42h-.8V5.89h.8zM3.76.63L.04 7.075c-.115.2.016.425.26.426h7.397c.242 0 .372-.226.258-.426C6.726 4.924 5.47 2.79 4.253.63c-.113-.174-.39-.174-.494 0z'/%3E%3C/svg%3E") !default;
$form-icon-danger: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23d9534f' viewBox='-2 -2 7 7'%3E%3Cpath stroke='%23d9534f' d='M0 0l3 3m0-3L0 3'/%3E%3Ccircle r='.5'/%3E%3Ccircle cx='3' r='.5'/%3E%3Ccircle cy='3' r='.5'/%3E%3Ccircle cx='3' cy='3' r='.5'/%3E%3C/svg%3E") !default;

// Z-index master list
// -------------------------
// Used for a bird's eye view of components dependent on the z-axis
// Try to avoid customizing these :)
$zindex-dropdown: ${theme.v1.zIndex.dropdown};
$zindex-navbar-fixed: ${theme.v1.zIndex.navbarFixed};
$zindex-sidemenu: ${theme.v1.zIndex.sidemenu};
$zindex-tooltip: ${theme.v1.zIndex.tooltip};
$zindex-modal-backdrop: ${theme.v1.zIndex.modalBackdrop};
$zindex-modal: ${theme.v1.zIndex.modal};
$zindex-typeahead: ${theme.v1.zIndex.typeahead};

// Buttons
//

$btn-padding-x: 14px !default;
$btn-padding-y: 0 !default;
$btn-line-height: $line-height-base;
$btn-font-weight: ${theme.v1.typography.weight.semibold} !default;

$btn-padding-x-sm: 7px !default;
$btn-padding-y-sm: 4px !default;

$btn-padding-x-lg: 21px !default;
$btn-padding-y-lg: 11px !default;

$btn-padding-x-xl: 21px !default;
$btn-padding-y-xl: 11px !default;

$btn-semi-transparent: rgba(0, 0, 0, 0.2) !default;

// sidemenu
$side-menu-width: 60px;
$navbar-padding: 20px;

// dashboard
$dashboard-padding: $space-md;
$panel-padding: ${theme.v1.panelPadding}px;
$panel-header-height: ${theme.v1.panelHeaderHeight}px;
$panel-header-z-index: 10;

// tabs
$tabs-padding: 10px 15px 9px;

$external-services: (
  github: (
    bgColor: #464646,
    borderColor: #393939,
    icon: '',
  ),
  gitlab: (
    bgColor: #fc6d26,
    borderColor: #e24329,
    icon: '',
  ),
  google: (
    bgColor: #e84d3c,
    borderColor: #b83e31,
    icon: '',
  ),
  azuread: (
    bgColor: #2f2f2f,
    borderColor: #2f2f2f,
    icon: '',
  ),
  grafanacom: (
    bgColor: #262628,
    borderColor: #393939,
    icon: '',
  ),
  okta: (
    bgColor: #2f2f2f,
    borderColor: #393939,
    icon: '',
  ),
  oauth: (
    bgColor: #262628,
    borderColor: #393939,
    icon: '',
  ),
) !default;
`;
