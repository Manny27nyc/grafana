// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { AlertState } from 'app/plugins/datasource/alertmanager/types';

export const getNotificationsTextColors = (theme: GrafanaTheme2) => ({
  [AlertState.Active]: css`
    color: ${theme.colors.error.text};
  `,
  [AlertState.Suppressed]: css`
    color: ${theme.colors.primary.text};
  `,
  [AlertState.Unprocessed]: css`
    color: ${theme.colors.secondary.text};
  `,
});
