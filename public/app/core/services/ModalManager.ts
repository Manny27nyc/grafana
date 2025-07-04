// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
import React from 'react';
import ReactDOM from 'react-dom';

import appEvents from 'app/core/app_events';
import { AngularModalProxy } from '../components/modals/AngularModalProxy';
import { provideTheme } from '../utils/ConfigProvider';
import { ShowConfirmModalEvent, ShowConfirmModalPayload, ShowModalReactEvent } from '../../types/events';
import { ConfirmModal, ConfirmModalProps } from '@grafana/ui';
import { textUtil } from '@grafana/data';
import { CopyPanelEvent } from '@grafana/runtime';
import { copyPanel } from 'app/features/dashboard/utils/panel';

export class ModalManager {
  reactModalRoot = document.body;
  reactModalNode = document.createElement('div');

  init() {
    appEvents.subscribe(ShowConfirmModalEvent, (e) => this.showConfirmModal(e.payload));
    appEvents.subscribe(ShowModalReactEvent, (e) => this.showModalReact(e.payload));
    appEvents.subscribe(CopyPanelEvent, (e) => copyPanel(e.payload));
  }

  showModalReact(options: any) {
    const { component, props } = options;
    const modalProps = {
      component,
      props: {
        ...props,
        isOpen: true,
        onDismiss: this.onReactModalDismiss,
      },
    };

    const elem = React.createElement(provideTheme(AngularModalProxy), modalProps);
    this.reactModalRoot.appendChild(this.reactModalNode);
    ReactDOM.render(elem, this.reactModalNode);
  }

  onReactModalDismiss = () => {
    ReactDOM.unmountComponentAtNode(this.reactModalNode);
    this.reactModalRoot.removeChild(this.reactModalNode);
  };

  showConfirmModal(payload: ShowConfirmModalPayload) {
    const {
      confirmText,
      onConfirm = () => undefined,
      text2,
      altActionText,
      onAltAction,
      noText,
      text,
      text2htmlBind,
      yesText = 'Yes',
      icon,
      title = 'Confirm',
    } = payload;
    const props: ConfirmModalProps = {
      confirmText: yesText,
      confirmationText: confirmText,
      icon,
      title,
      body: text,
      description: text2 && text2htmlBind ? textUtil.sanitize(text2) : text2,
      isOpen: true,
      dismissText: noText,
      onConfirm: () => {
        onConfirm();
        this.onReactModalDismiss();
      },
      onDismiss: this.onReactModalDismiss,
      onAlternative: onAltAction
        ? () => {
            onAltAction();
            this.onReactModalDismiss();
          }
        : undefined,
      alternativeText: altActionText,
    };
    const modalProps = {
      component: ConfirmModal,
      props,
    };

    const elem = React.createElement(provideTheme(AngularModalProxy), modalProps);
    this.reactModalRoot.appendChild(this.reactModalNode);
    ReactDOM.render(elem, this.reactModalNode);
  }
}
