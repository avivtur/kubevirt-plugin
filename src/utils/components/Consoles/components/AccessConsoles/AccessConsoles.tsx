import React, { FC, MouseEvent, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { SelectList } from '@patternfly/react-core';
import {} from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';

import { AccessConsolesProps, typeMap } from './utils/accessConsoles';

import './access-consoles.scss';

export const AccessConsoles: FC<AccessConsolesProps> = ({ isWindowsVM, rfb, setType, type }) => {
  const [isOpenSelectType, setIsOpenSelectType] = useState<boolean>(false);
  const [isOpenSendKey, setIsOpenSendKey] = useState<boolean>(false);

  const customButtons = [
    {
      onClick: () => rfb?.sendCtrlAltDel(),
      text: 'Ctrl + Alt + Delete',
    },
    {
      onClick: () => rfb?.sendCtrlAlt1(),
      text: 'Ctrl + Alt + 1',
    },
    {
      onClick: () => rfb?.sendCtrlAlt2(),
      text: 'Ctrl + Alt + 2',
    },
  ];

  const onInjectTextFromClipboard = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    e.preventDefault();
    rfb?.sendPasteCMD();
  };

  const onDisconnect = () => rfb?.disconnect();

  return (
    <>
      <Button
        icon={
          <>
            <PasteIcon /> {t('Paste to console')}
          </>
        }
        className="vnc-paste-button"
        onClick={onInjectTextFromClipboard}
        variant={ButtonVariant.link}
      />
      <Select
        onSelect={(_, selection: string) => {
          setType(selection);
          setIsOpenSelectType(false);
        }}
        toggle={SelectToggle({
          className: 'access-consoles-selector',
          id: 'pf-c-console__type-selector',
          isExpanded: isOpenSelectType,
          onClick: () => setIsOpenSelectType((prevIsOpen) => !prevIsOpen),
          selected: type,
        })}
        aria-label={t('Select console type')}
        isOpen={isOpenSelectType}
        onOpenChange={(open: boolean) => setIsOpenSelectType(open)}
        placeholder={t('Select console type')}
        selected={type}
      >
        <SelectList>
          {Object.values(typeMap(isWindowsVM)).map((name: string) => {
            return (
              <SelectOption id={name} key={name} value={name}>
                {name}
              </SelectOption>
            );
          })}
        </SelectList>
      </Select>
      <Dropdown
        toggle={DropdownToggle({
          children: <>{t('Send key')}</>,
          className: 'access-consoles-selector',
          id: 'pf-c-console__actions-vnc-toggle-id',
          isExpanded: isOpenSendKey,
          onClick: () => setIsOpenSendKey((prevIsOpen) => !prevIsOpen),
        })}
        isOpen={isOpenSendKey}
        onOpenChange={(open: boolean) => setIsOpenSendKey(open)}
        onSelect={() => setIsOpenSendKey(false)}
      >
        <DropdownList>
          {customButtons?.map(({ onClick, text }) => (
            <DropdownItem key={text} onClick={onClick}>
              {text}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
      <Button
        className="vnc-actions-disconnect-button"
        onClick={onDisconnect}
        variant={ButtonVariant.secondary}
      >
        {t('Disconnect')}
      </Button>
    </>
  );
};

AccessConsoles.displayName = 'AccessConsoles';
