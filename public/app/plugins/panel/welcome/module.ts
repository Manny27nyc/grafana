// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PanelPlugin } from '@grafana/data';
import { WelcomeBanner } from './Welcome';

export const plugin = new PanelPlugin(WelcomeBanner).setNoPadding();
