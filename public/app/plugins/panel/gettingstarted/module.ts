// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { PanelPlugin } from '@grafana/data';
import { GettingStarted } from './GettingStarted';

// Simplest possible panel plugin
export const plugin = new PanelPlugin(GettingStarted).setNoPadding();
