import * as RMWC from '@rmwc/types';
import React, { useMemo } from 'react';

import { toDashCase, parseThemeOptions, wrapChild } from '@rmwc/base';
import { getAutoColorsForTheme } from './utils';
import { useTag, useClassNames } from '@rmwc/base/component';

/** A Theme Component. */
export interface ThemeProps {
  /** A theme option as a string, a space separated string for multiple values, or an array of valid theme options. */
  use: RMWC.ThemePropT;
  /** Collapse the styles directly onto the child component. This eliminates the need for a wrapping `span` element and may be required for applying things like background-colors.  */
  wrap?: boolean;
}

/** A Theme Component. */
export const Theme = React.forwardRef<
  any,
  RMWC.MergeInterfacesT<ThemeProps, RMWC.ComponentProps>
>(function Theme(props, ref) {
  const Tag = useTag(props, 'span');

  const { use, wrap, ...rest } = props;

  const className = useClassNames(props, [parseThemeOptions(use).join(' ')]);

  if (wrap) {
    return wrapChild({
      ...rest,
      ref,
      className
    });
  }

  return <Tag theme={use} {...rest} ref={ref} className={className} />;
});

Theme.displayName = 'Theme';

/** A ThemeProvider. This sets theme colors for its child tree. */
export interface ThemeProviderProps {
  /** Any theme option pointing to a valid CSS value. */
  options: { [key: string]: string };
  /** Additional standard inline styles that will be merged into the style tag. */
  style?: Object;
  /** Instead of injecting a div tag, wrap a child component by merging the theme styles directly onto it. Useful when you don't want to mess with layout. */
  wrap?: boolean;
  /** Children to render */
  children?: React.ReactNode;
}

/** A ThemeProvider. This sets theme colors for its child tree. */
export function ThemeProvider(
  props: ThemeProviderProps & Omit<RMWC.ComponentProps, 'wrap' | 'options'>
) {
  const parsed = JSON.stringify(props.options);

  const colors = useMemo(() => {
    const processedColors = Object.keys(props.options).reduce(
      (acc: any, key) => {
        const val = props.options[key];
        key = key.startsWith('--') ? key : `--mdc-theme-${toDashCase(key)}`;
        acc[key] = val;
        return acc;
      },
      {}
    );

    return getAutoColorsForTheme(processedColors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed]);

  const { options, style = {}, wrap, ...rest } = props;

  const themeStyles = {
    ...style,
    ...colors
  };

  if (wrap && rest.children) {
    return wrapChild({ ...rest, style: themeStyles });
  }

  return <div {...rest} style={themeStyles} />;
}

ThemeProvider.displayName = 'ThemeProvider';
