// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import { EventBusSrv, EventBusExtended } from '@grafana/data';

export const appEvents: EventBusExtended = new EventBusSrv();

export default appEvents;
